/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon } from '@wings-software/uicore'
import { identity, uniqBy } from 'lodash-es'
import type { CDPipelineModuleInfo, CDStageModuleInfo, ServiceExecutionSummary } from 'services/cd-ng'
import type { ExecutionSummaryProps } from '@pipeline/factories/ExecutionFactory/types'

import { ServicesList } from './ServicesList'
import { EnvironmentsList } from './EnvironmentsList'
import css from './CDExecutionSummary.module.scss'

const LIMIT = 2

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
      <ServicesList services={services} limit={LIMIT} />
      <EnvironmentsList environments={environments} limit={LIMIT} />
    </div>
  )
}
