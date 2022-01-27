/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, FontVariation, Icon, Text } from '@wings-software/uicore'
import { getRiskColorValue } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import type { MetricsAccordionPanelSummaryProps } from './MetricsAccordionPanelSummary.types'
import { healthSourceTypeToLogo } from '../DeploymentMetricsAnalysisRow/DeploymentMetricsAnalysisRow.utils'
import NodeCount from './components/NodesCount'
import { getRiskDisplayName } from './MetricsAccordionPanelSummary.utils'
import css from '../DeploymentMetricsAnalysisRow/DeploymentMetricsAnalysisRow.module.scss'

const MetricsAccordionPanelSummary: React.FC<MetricsAccordionPanelSummaryProps> = props => {
  const {
    analysisRow: { metricName, risk, transactionName, nodeRiskCount, connectorName, healthSourceType }
  } = props

  const { getString } = useStrings()

  const riskDisplayName = getRiskDisplayName(risk, getString)

  return (
    <>
      <Text margin={{ left: 'small' }}>{metricName}</Text>
      <Text>{transactionName}</Text>
      <Text>
        <Icon name={healthSourceTypeToLogo(healthSourceType)} margin={{ right: 'small' }} size={16} />
        {connectorName}
      </Text>
      <Text
        font={{ variation: FontVariation.TABLE_HEADERS }}
        color={getRiskColorValue(risk, false)}
        style={{ borderColor: getRiskColorValue(risk, false) }}
        className={css.metricRisk}
      >
        {riskDisplayName}
      </Text>
      <Container>
        <NodeCount nodeRiskCount={nodeRiskCount} />
      </Container>
    </>
  )
}

export default MetricsAccordionPanelSummary
