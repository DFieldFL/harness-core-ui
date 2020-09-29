import React from 'react'
import { Container, Tabs, Tab } from '@wings-software/uikit'
import cx from 'classnames'
import i18n from './AnalysisDrillDownView.i18n'
import MetricAnalysisView from './MetricAnalysisView/MetricAnalysisView'
import LogAnalysisView from './LogAnalysisView/LogAnalysisView'
import css from './AnalysisDrillDownView.module.scss'

export interface AnalysisDrillDownViewProps {
  className?: string
  startTime: number
  endTime: number
  historyStartTime?: number
  categoryName?: string
  environmentIdentifier?: string
  serviceIdentifier?: string
  asModal?: boolean
}

export function AnalysisDrillDownView(props: AnalysisDrillDownViewProps): JSX.Element {
  const {
    className,
    startTime,
    endTime,
    categoryName,
    environmentIdentifier,
    serviceIdentifier,
    historyStartTime,
    asModal
  } = props
  return (
    <Container className={cx(css.main, className)}>
      <Tabs id="AnalysisTabs" renderAllTabPanels={true}>
        <Tab
          id={i18n.analysisDrillDownTabs.metrics}
          title={i18n.analysisDrillDownTabs.metrics}
          panel={
            <MetricAnalysisView
              startTime={startTime}
              endTime={endTime}
              historyStartTime={historyStartTime}
              categoryName={categoryName}
              showHistorySelection={asModal}
              environmentIdentifier={environmentIdentifier}
              serviceIdentifier={serviceIdentifier}
            />
          }
        />
        <Tab
          id={i18n.analysisDrillDownTabs.logs}
          title={i18n.analysisDrillDownTabs.logs}
          panel={
            <LogAnalysisView
              startTime={startTime}
              endTime={endTime}
              categoryName={categoryName}
              historyStartTime={historyStartTime}
              serviceIdentifier={serviceIdentifier}
              environmentIdentifier={environmentIdentifier}
            />
          }
        />
      </Tabs>
      <Container />
    </Container>
  )
}
