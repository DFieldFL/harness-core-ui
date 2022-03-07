/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useCallback, useState, useRef } from 'react'
import { Container, Text, Color } from '@wings-software/uicore'
import cx from 'classnames'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { getRiskColorValue, getRiskLabelStringId } from '@cv/utils/CommonUtils'
import type { PipelinePathProps } from '@common/interfaces/RouteInterfaces'
import getLogAnalysisLineChartOptions from './LogAnalysisLineChartConfig'
import { LogAnalysisRiskAndJiraModal } from './components/LogAnalysisRiskAndJiraModal/LogAnalysisRiskAndJiraModal'
import type {
  LogAnalysisDataRowProps,
  LogAnalysisRowProps,
  CompareLogEventsInfo,
  LogAnalysisRowData
} from './LogAnalysisRow.types'
import { getEventTypeFromClusterType, onClickErrorTrackingRow } from './LogAnalysisRow.utils'
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
  const { getString } = useStrings()
  const { rowData, isErrorTracking } = props
  const { riskScore, riskStatus } = rowData
  const color = getRiskColorValue(riskStatus)
  const chartOptions = useMemo(
    () => getLogAnalysisLineChartOptions(rowData?.messageFrequency || []),
    [rowData?.messageFrequency]
  )
  const [displayRiskEditModal, setDisplayRiskEditModal] = useState(false)
  const [feedbackGiven, setFeedbackGiven] = useState<{ risk: string; message: string } | undefined>(undefined)
  const logTextRef = useRef<HTMLParagraphElement>(null)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<PipelinePathProps>()
  const onShowRiskEditModalCallback = useCallback(() => {
    if (isErrorTracking) {
      onClickErrorTrackingRow(rowData.message, accountId, projectIdentifier, orgIdentifier)
    } else {
      setDisplayRiskEditModal(true)
    }
  }, [isErrorTracking, rowData.message, accountId, projectIdentifier, orgIdentifier])

  const onHideRiskEditModalCallback = useCallback((data?) => {
    if (data?.risk || data?.message) setFeedbackGiven(data)
    setDisplayRiskEditModal(false)
  }, [])

  return (
    <Container className={cx(css.mainRow, css.dataRow, css.highlightRow)} data-testid={'logs-data-row'}>
      <Container className={cx(css.dataColumn, css.openModalColumn, css.compareDataColumn, css.clusterType)}>
        {/* <input
          type="checkbox"
          checked={isSelected}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onSelect?.(e.currentTarget.checked, rowData, index, chartOptions)
          }}
        /> */}
        {rowData.clusterType && (
          <Text onClick={onShowRiskEditModalCallback}>{getEventTypeFromClusterType(rowData.clusterType)}</Text>
        )}
      </Container>
      <Container
        className={cx(css.logRowText, css.dataColumn, css.openModalColumn, css.risk)}
        onClick={onShowRiskEditModalCallback}
      >
        {riskScore || riskScore === 0 ? (
          <div className={css.healthScoreCard} style={{ background: color }}>
            <Text font={{ size: 'xsmall', weight: 'semi-bold' }} color={Color.WHITE}>
              {getString(getRiskLabelStringId(riskStatus)).toUpperCase()}
            </Text>
          </div>
        ) : null}
      </Container>
      <Container
        className={cx(css.logText, css.dataColumn, css.openModalColumn, css.message)}
        onClick={onShowRiskEditModalCallback}
      >
        <p className={css.logRowText} ref={logTextRef}>
          {isErrorTracking ? rowData.message.split('|').slice(0, 4).join('|') : rowData.message}
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
  const { data = [], isErrorTracking } = props
  const [dataToCompare, setDataToCompare] = useState<CompareLogEventsInfo[]>([])

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
      <ColumnHeaderRow />
      <Container className={css.dataContainer}>
        {data.map((row, index) => {
          if (!row) return null
          const { clusterType, count, message } = row
          return (
            <DataRow
              key={`${clusterType}-${count}-${message}`}
              rowData={row}
              index={index}
              onSelect={onCompareSelectCallback}
              isSelected={selectedIndices.has(index)}
              isErrorTracking={isErrorTracking}
            />
          )
        })}
      </Container>
    </Container>
  )
}
