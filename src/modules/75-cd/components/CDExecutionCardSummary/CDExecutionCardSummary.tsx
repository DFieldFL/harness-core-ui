/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Layout } from '@wings-software/uicore'
import { identity, uniqBy } from 'lodash-es'
import { String } from 'framework/strings'
import type { ExecutionCardInfoProps } from '@pipeline/factories/ExecutionFactory/types'
import type { CDPipelineModuleInfo, CDStageModuleInfo, ServiceExecutionSummary } from 'services/cd-ng'
import { getPipelineStagesMap } from '@pipeline/utils/executionUtils'
import { ServicesList } from '../CDExecutionSummary/ServicesList'
import { EnvironmentsList } from '../CDExecutionSummary/EnvironmentsList'
import css from './CDExecutionCardSummary.module.scss'

const SERVICES_LIMIT = 3
const ENV_LIMIT = 3

export function CDExecutionCardSummary(props: ExecutionCardInfoProps): React.ReactElement {
  const { data, nodeMap, startingNodeId } = props
  const serviceIdentifiers: string[] = ((data as CDPipelineModuleInfo)?.serviceIdentifiers as string[]) || []

  const { servicesMap, environments } = React.useMemo(() => {
    const stagesMap = getPipelineStagesMap(nodeMap, startingNodeId)
    const serviceMapObj: ServiceExecutionSummary[] = []
    const environmentsList: string[] = []
    stagesMap.forEach(stage => {
      const stageInfo = stage.moduleInfo?.cd || ({} as CDStageModuleInfo)
      const serviceInfo = stageInfo?.serviceInfo
      if (stageInfo.infraExecutionSummary?.name || stageInfo.infraExecutionSummary?.identifier) {
        environmentsList.push(stageInfo.infraExecutionSummary.name || stageInfo.infraExecutionSummary.identifier)
      }
      // istanbul ignore else
      if (serviceInfo?.identifier) {
        serviceMapObj.push(serviceInfo)
      }
    })

    return { servicesMap: uniqBy(serviceMapObj, s => s.identifier), environments: uniqBy(environmentsList, identity) }
  }, [nodeMap, startingNodeId])

  return (
    <Layout.Horizontal spacing="medium">
      <div className={css.cardSummary}>
        <String
          tagName="div"
          className={css.heading}
          stringID="pipeline.executionList.servicesDeployedText"
          vars={{ size: serviceIdentifiers.length }}
        />
        <ServicesList className={css.service} services={servicesMap} limit={SERVICES_LIMIT} />
      </div>
      <div className={css.cardSummary}>
        <String
          tagName="div"
          className={css.heading}
          stringID="pipeline.executionList.EnvironmentsText"
          vars={{ size: environments.length }}
        />
        <EnvironmentsList className={css.environment} environments={environments} limit={ENV_LIMIT} />
      </div>
    </Layout.Horizontal>
  )
}
