/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { HTMLTable, Popover, Position } from '@blueprintjs/core'
import { Icon, Text } from '@wings-software/uicore'
import cx from 'classnames'
import { identity, uniqBy } from 'lodash-es'

import { String, useStrings } from 'framework/strings'
import type { CDPipelineModuleInfo, CDStageModuleInfo, ServiceExecutionSummary } from 'services/cd-ng'
import type { ExecutionSummaryProps } from '@pipeline/factories/ExecutionFactory/types'

import { ServicePopoverCard } from '../ServicePopoverCard/ServicePopoverCard'
import css from './CDExecutionSummary.module.scss'

const LIMIT = 2

export interface ServicesTableProps {
  services: ServiceExecutionSummary[]
}

export function ServicesTable({ services }: ServicesTableProps): React.ReactElement {
  const { getString } = useStrings()

  return (
    <HTMLTable small className={css.servicesTable}>
      <thead>
        <tr>
          <th>Service</th>
          <th>Primary Artifact</th>
          <th>Sidecars</th>
        </tr>
      </thead>
      <tbody>
        {services.map((service, i) => (
          <tr key={`${service.identifier}-${i}`}>
            <td>{service.displayName}</td>
            <td>
              {service.artifacts?.primary
                ? getString('artifactDisplay', {
                    image: (service.artifacts.primary as unknown as any).imagePath,
                    tag: (service.artifacts.primary as unknown as any).tag
                  })
                : '-'}
            </td>
            <td>
              {service.artifacts?.sidecars && service.artifacts?.sidecars.length > 0
                ? service.artifacts.sidecars
                    .map(artifact =>
                      getString('artifactDisplay', {
                        image: (artifact as unknown as any).imagePath,
                        tag: (artifact as unknown as any).tag
                      })
                    )
                    .join(', ')
                : '-'}
            </td>
          </tr>
        ))}
      </tbody>
    </HTMLTable>
  )
}

export function CDExecutionSummary(props: ExecutionSummaryProps<CDPipelineModuleInfo>): React.ReactElement {
  const { nodeMap } = props

  const { services, environments } = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const services: ServiceExecutionSummary[] = []
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const environments: string[] = []

    nodeMap.forEach(stage => {
      const stageInfo = stage.moduleInfo?.cd || /* istanbul ignore next */ ({} as CDStageModuleInfo)
      // istanbul ignore else
      if (stageInfo.serviceInfo) {
        services.push(stageInfo.serviceInfo)
      }

      // istanbul ignore else
      if (stageInfo.infraExecutionSummary?.name || stageInfo.infraExecutionSummary?.identifier) {
        environments.push(stageInfo.infraExecutionSummary.name || stageInfo.infraExecutionSummary.identifier)
      }
    })

    return { services: uniqBy(services, s => s.identifier), environments: uniqBy(environments, identity) }
  }, [nodeMap])

  return (
    <div className={css.main}>
      <Icon name="cd-main" size={18} />
      <Icon name="services" className={css.servicesIcon} size={18} />
      <div className={css.servicesList}>
        {services.slice(0, LIMIT).map(service => {
          const { identifier } = service
          return (
            <Popover
              key={identifier}
              wrapperTagName="div"
              targetTagName="div"
              interactionKind="hover"
              position={Position.BOTTOM_RIGHT}
              className={css.serviceWrapper}
            >
              <div className={css.serviceName}>{service.displayName}</div>
              <ServicePopoverCard service={service} />
            </Popover>
          )
        })}
        {services.length > LIMIT ? (
          <Popover
            wrapperTagName="div"
            targetTagName="div"
            interactionKind="hover"
            position={Position.BOTTOM_RIGHT}
            className={css.serviceWrapper}
          >
            <String
              tagName="div"
              className={cx(css.serviceName, css.count)}
              stringID={'common.plusNumberNoSpace'}
              vars={{ number: Math.abs(services.length - LIMIT) }}
            />
            <ServicesTable services={services.slice(LIMIT)} />
          </Popover>
        ) : null}
      </div>
      {environments.length > 0 ? (
        <div className={css.environments}>
          <Icon name="environments" className={css.envIcon} size={14} />
          <Text>{environments.join(', ')}</Text>
        </div>
      ) : null}
    </div>
  )
}
