/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Text } from '@harness/uicore'
import { useStrings } from 'framework/strings'
import css from '../DeploymentMetrics.module.scss'

const DeploymentMetricsLables: React.FC = () => {
  const { getString } = useStrings()

  return (
    <Container className={css.deploymentMetricsLables}>
      <Text>{getString('pipeline.verification.tableHeaders.metricName')}</Text>
      <Text>{getString('pipeline.verification.tableHeaders.group')}</Text>
      <Text className={css.healthSourceLabel}>{getString('pipeline.verification.healthSourceLabel')}</Text>
      <Text>{getString('pipeline.verification.logs.risk')}</Text>
      <Text>{getString('pipeline.verification.tableHeaders.nodes')}</Text>
    </Container>
  )
}

export default DeploymentMetricsLables
