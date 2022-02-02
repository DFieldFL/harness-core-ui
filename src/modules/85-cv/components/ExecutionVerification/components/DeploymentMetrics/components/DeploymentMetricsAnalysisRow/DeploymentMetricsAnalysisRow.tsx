/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useRef, useState, useLayoutEffect, useMemo, useCallback } from 'react'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import cx from 'classnames'
import { Container, Button, ButtonVariation } from '@wings-software/uicore'
import type { NodeRiskCountDTO, TransactionMetric } from 'services/cv'
import { useStrings } from 'framework/strings'
import { chartsConfig } from './DeeploymentMetricsChartConfig'
import { filterRenderCharts, transformControlAndTestDataToHighChartsSeries } from './DeploymentMetricsAnalysisRow.utils'
import type { DeploymentMetricsAnalysisRowChartSeries } from './DeploymentMetricsAnalysisRow.types'
import { widthPercentagePerGraph, HostTestData } from './DeploymentMetricsAnalysisRow.constants'
import css from './DeploymentMetricsAnalysisRow.module.scss'

export interface DeploymentMetricsAnalysisRowProps {
  healthSourceType: any
  transactionName: string
  metricName: string
  controlData?: Highcharts.SeriesLineOptions['data'][]
  testData?: HostTestData[]
  className?: string
  risk?: TransactionMetric['risk']
  connectorName?: string
  nodeRiskCount?: NodeRiskCountDTO
}

export function DeploymentMetricsAnalysisRow(props: DeploymentMetricsAnalysisRowProps): JSX.Element {
  const { controlData, testData, className } = props
  const graphContainerRef = useRef<HTMLDivElement>(null)
  const [graphWidth, setGraphWidth] = useState(0)
  const charts: DeploymentMetricsAnalysisRowChartSeries[][] = useMemo(() => {
    return transformControlAndTestDataToHighChartsSeries(controlData || [], testData || [])
  }, [controlData, testData])

  const [chartsOffset, setChartsOffset] = useState(1)

  const filteredCharts = filterRenderCharts(charts, chartsOffset)

  const { getString } = useStrings()

  const handleLoadMore = useCallback(() => {
    setChartsOffset(currentOffset => {
      return currentOffset + 1
    })
  }, [])

  useLayoutEffect(() => {
    if (!graphContainerRef?.current) {
      return
    }
    const containerWidth = graphContainerRef.current.getBoundingClientRect().width
    setGraphWidth(containerWidth / widthPercentagePerGraph)
  }, [graphContainerRef])

  return (
    <Container className={cx(css.main, className)}>
      <div className={css.graphs} ref={graphContainerRef}>
        {filteredCharts.map((series, index) => (
          <HighchartsReact
            key={index}
            highcharts={Highcharts}
            options={chartsConfig(series, graphWidth, testData?.[index], getString)}
          />
        ))}
      </div>
      {filteredCharts.length < charts.length && (
        <Container style={{ textAlign: 'center' }}>
          <Button data-testid="loadMore_button" onClick={handleLoadMore} variation={ButtonVariation.LINK}>
            {getString('pipeline.verification.loadMore')}
          </Button>
        </Container>
      )}
    </Container>
  )
}
