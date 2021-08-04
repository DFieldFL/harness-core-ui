import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { Container, Text, Color, Select } from '@wings-software/uicore'
import cx from 'classnames'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { useStrings } from 'framework/strings'
import getLogAnalysisLineChartOptions from './LogAnalysisLineChartConfig'
import { LogAnalysisRiskAndJiraModal } from './components/LogAnalysisRiskAndJiraModal/LogAnalysisRiskAndJiraModal'
import { HealthScoreCard } from './components/HealthScoreCard/HealthScoreCard'
import type {
  LogAnalysisDataRowProps,
  LogAnalysisRowProps,
  CompareLogEventsInfo,
  LogAnalysisRowData
} from './LogAnalysisRow.types'
import { getClusterTypes, getEventTypeFromClusterType } from './LogAnalysisRow.utils'
import css from './LogAnalysisRow.module.scss'

function ColumnHeaderRow(): JSX.Element {
  const { getString } = useStrings()
  return (
    <Container className={cx(css.mainRow, css.columnHeader)}>
      <Text color={Color.BLACK} className={cx(css.clusterType, css.logRowColumnHeader)}>
        {getString('pipeline.verification.logs.clusterType')}
      </Text>
      <Text color={Color.BLACK} className={cx(css.risk, css.logRowColumnHeader)}>
        {getString('pipeline.verification.logs.risk')}
      </Text>
      <Text color={Color.BLACK} className={cx(css.message, css.logRowColumnHeader)}>
        {getString('pipeline.verification.logs.sampleMessage')}
      </Text>
      <Text color={Color.BLACK} className={cx(css.count, css.logRowColumnHeader)}>
        {getString('pipeline.verification.logs.messageCount')}
      </Text>
      <Text color={Color.BLACK} className={cx(css.messageFrequency, css.logRowColumnHeader)}>
        {getString('pipeline.verification.logs.messageFrequency')}
      </Text>
    </Container>
  )
}

function DataRow(props: LogAnalysisDataRowProps): JSX.Element {
  const { onSelect, rowData, index, isSelected } = props
  const chartOptions = useMemo(
    () => getLogAnalysisLineChartOptions(rowData?.messageFrequency || []),
    [rowData?.messageFrequency]
  )
  const [displayRiskEditModal, setDisplayRiskEditModal] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<{ risk: string; message: string } | undefined>(undefined)
  const logTextRef = useRef<HTMLParagraphElement>(null)
  const onShowRiskEditModalCallback = useCallback(() => setDisplayRiskEditModal(true), [])
  const onHideRiskEditModalCallback = useCallback((data?) => {
    if (data?.risk || data?.message) setFeedbackGiven(data)
    setDisplayRiskEditModal(false)
  }, [])

  return (
    <Container className={cx(css.mainRow, css.dataRow, css.highlightRow)} data-testid={'logs-data-row'}>
      <Container className={cx(css.dataColumn, css.openModalColumn, css.compareDataColumn, css.clusterType)}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onSelect?.(e.currentTarget.checked, rowData, index, chartOptions)
          }}
        />
        {rowData.clusterType && (
          <Text onClick={onShowRiskEditModalCallback}>{getEventTypeFromClusterType(rowData.clusterType)}</Text>
        )}
      </Container>
      <Container
        className={cx(css.logRowText, css.dataColumn, css.openModalColumn, css.risk)}
        onClick={onShowRiskEditModalCallback}
      >
        <HealthScoreCard riskScore={rowData.riskScore} riskStatus={rowData.riskStatus} />
      </Container>
      <Container
        className={cx(css.logText, css.dataColumn, css.openModalColumn, css.message)}
        onClick={onShowRiskEditModalCallback}
      >
        <p className={css.logRowText} ref={logTextRef}>
          {rowData.message}
        </p>
      </Container>
      <Container
        className={cx(css.logRowText, css.dataColumn, css.openModalColumn, css.count)}
        onClick={onShowRiskEditModalCallback}
        padding={{ left: 'medium' }}
      >
        <p className={css.count}>{rowData.count}</p>
      </Container>
      <Container className={cx(css.lineChartContainer, css.dataColumn, css.messageFrequency)}>
        <HighchartsReact highchart={Highcharts} options={chartOptions} />
      </Container>
      {displayRiskEditModal ? (
        <LogAnalysisRiskAndJiraModal
          onHide={onHideRiskEditModalCallback}
          trendData={chartOptions}
          count={rowData.count || 0}
          activityType={rowData.clusterType}
          logMessage={rowData.message || ''}
          feedback={feedbackGiven}
        />
      ) : null}
    </Container>
  )
}

export function LogAnalysisRow(props: LogAnalysisRowProps): JSX.Element {
  const { data = [] } = props
  const [dataToCompare, setDataToCompare] = useState<CompareLogEventsInfo[]>([])
  const [selectedClusterType, setSelectedClusterType] = useState<string>('')
  const [logsData, setLogsData] = useState<LogAnalysisRowData[]>([])
  const { getString } = useStrings()

  useEffect(() => {
    setLogsData(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedClusterType) {
      const filteredLogsData = data.filter(log => log?.clusterType === selectedClusterType)
      setLogsData(filteredLogsData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClusterType])

  const onCompareSelectCallback = useCallback(
    (isSelect: boolean, selectedData: LogAnalysisRowData, index: number) => {
      let updatedDataToCompare = [...dataToCompare]
      if (!isSelect) {
        updatedDataToCompare = updatedDataToCompare.filter(d => d.index !== index)
      } else {
        if (updatedDataToCompare.length === 2) updatedDataToCompare.pop()
        updatedDataToCompare.unshift({ data: selectedData, index })
      }
      setDataToCompare(updatedDataToCompare)
    },
    [dataToCompare]
  )
  const selectedIndices = useMemo(() => new Set(dataToCompare.map(d => d.index)), [dataToCompare])

  return (
    <Container className={cx(css.main, props.className)}>
      <Select
        items={getClusterTypes(getString)}
        className={css.clusterTypeFilter}
        inputProps={{ placeholder: getString('pipeline.verification.logs.filterByClusterType') }}
        onChange={item => setSelectedClusterType(item.value as string)}
      />
      <ColumnHeaderRow />
      <Container className={css.dataContainer}>
        {logsData &&
          logsData.map((row, index) => {
            if (!row) return null
            const { clusterType, count, message } = row
            return (
              <DataRow
                key={`${clusterType}-${count}-${message}`}
                rowData={row}
                index={index}
                onSelect={onCompareSelectCallback}
                isSelected={selectedIndices.has(index)}
              />
            )
          })}
      </Container>
    </Container>
  )
}
