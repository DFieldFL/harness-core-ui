import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import type { SelectOption } from '@wings-software/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useGetAllLogsData
  //useGetDeploymentLogAnalysisClusters
} from 'services/cv'
import { useToaster } from '@common/exports'
import { getRiskColorValue } from '@common/components/HeatMap/ColorUtils'
import LogAnalysis from '@cv/components/LogsAnalysis/LogAnalysis'
import { pageSize } from '@cv/components/LogsAnalysis/LogAnalysis.constants'
import type { LogAnalysisRowData } from '@cv/components/LogsAnalysis/LogAnalysis.types'
import Card from '@cv/components/Card/Card'
import type { MetricsAndLogsProps } from '../../MetricsAndLogs.types'
import { roundOffRiskScore } from './LogAnalysisContainer.utils'
import css from './LogAnalysisContainer.module.scss'

export default function LogAnalysisContainer(props: MetricsAndLogsProps): JSX.Element {
  const { serviceIdentifier, environmentIdentifier, startTime, endTime } = props
  const { showError } = useToaster()

  const { orgIdentifier, projectIdentifier, accountId } = useParams<ProjectPathProps>()
  const [selectedClusterType, setSelectedClusterType] = useState<SelectOption>()
  const [selectedHealthSource, setSelectedHealthSource] = useState<string>()

  const logsAnalysisQueryParams = useMemo(() => {
    return {
      accountId,
      orgIdentifier,
      projectIdentifier,
      serviceIdentifier,
      environmentIdentifier,
      startTime,
      endTime,
      ...(selectedClusterType?.value && {
        clusterTypes: (selectedClusterType.value as string).split('_')[0] as any
      }),
      ...(selectedHealthSource && { healthSources: selectedHealthSource as any })
    }
  }, [
    accountId,
    endTime,
    environmentIdentifier,
    orgIdentifier,
    projectIdentifier,
    serviceIdentifier,
    startTime,
    selectedClusterType?.value,
    selectedHealthSource
  ])

  // api for logs analysis
  const {
    data: logsData,
    refetch: fetchLogAnalysis,
    loading: logsLoading,
    error: logsError
  } = useGetAllLogsData({ queryParams: logsAnalysisQueryParams, lazy: true })

  // TODO this will be uncommented once the exact backend api is available
  // api for cluster chart data
  // const {
  //   data: clusterChartData,
  //   loading: clusterChartLoading,
  //   error: clusterChartError,
  //   refetch: fetchClusterAnalysis
  // } = useGetDeploymentLogAnalysisClusters({
  //   // TODO - this will be updated as per the api data
  //   activityId: 'RvUp4nCCRledZlHiQlA2Yg',
  //   queryParams: { accountId },
  //   lazy: true
  // })

  // Whenever startTime , endTime changes refetching the logs and metrics data
  useEffect(() => {
    Promise.all([
      fetchLogAnalysis({ queryParams: logsAnalysisQueryParams })
      //fetchClusterAnalysis()
    ])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime])

  // Fetching logs data for selected cluster type
  useEffect(() => {
    fetchLogsDataForCluster(selectedClusterType?.value as string)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClusterType?.value])

  // Fetching logs data for selected health source
  useEffect(() => {
    fetchLogsDataForHealthSource(selectedHealthSource)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedHealthSource])

  const goToLogsPage = useCallback(
    page => {
      fetchLogAnalysis({
        queryParams: { ...logsAnalysisQueryParams, page, size: pageSize }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [accountId, endTime, environmentIdentifier, orgIdentifier, projectIdentifier, serviceIdentifier, startTime]
  )

  // showing error in case of any api errors.
  useEffect(() => {
    if (logsError) showError(logsError.message)

    // TODO this will be uncommented once the exact cluster api is available
    // if (clusterChartError) showError(clusterChartError.message)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    logsError
    //clusterChartError
  ])

  const fetchLogsDataForHealthSource = useCallback(
    currentHealthSource => {
      fetchLogAnalysis({
        queryParams: { ...logsAnalysisQueryParams, ...(currentHealthSource && { healthSources: currentHealthSource }) }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logsAnalysisQueryParams]
  )

  const fetchLogsDataForCluster = useCallback(
    clusterTypes => {
      fetchLogAnalysis({
        queryParams: {
          ...logsAnalysisQueryParams,
          ...(clusterTypes && { clusterTypes: clusterTypes.split('_')[0] as any })
        }
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [logsAnalysisQueryParams]
  )

  const logAnalysisTableData = useMemo((): LogAnalysisRowData[] => {
    return (
      logsData?.resource?.content?.map(log => ({
        clusterType: log?.logData?.tag,
        count: log?.logData?.count as number,
        message: log?.logData?.text as string,
        messageFrequency: [
          {
            name: 'trendData',
            type: 'line',
            color: getRiskColorValue(log?.logData?.riskStatus),
            data: log?.logData?.trend?.map(trend => trend.count) as number[]
          }
        ],
        riskScore: roundOffRiskScore(log),
        riskStatus: log?.logData?.riskStatus as string
      })) ?? []
    )
  }, [logsData])

  return (
    <Card className={css.logsContainer}>
      <LogAnalysis
        serviceIdentifier={serviceIdentifier}
        environmentIdentifier={environmentIdentifier}
        data={logsData}
        logAnalysisTableData={logAnalysisTableData}
        logsLoading={logsLoading}
        // clusterChartData={clusterChartData}
        // clusterChartLoading={clusterChartLoading}
        goToPage={goToLogsPage}
        setSelectedClusterType={setSelectedClusterType}
        onChangeHealthSource={setSelectedHealthSource}
      />
    </Card>
  )
}
