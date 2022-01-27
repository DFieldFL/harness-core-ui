/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  Color,
  Container,
  Text,
  Icon,
  Pagination,
  PageError,
  NoDataCard,
  Accordion,
  AccordionHandle,
  Checkbox,
  Layout,
  Button,
  ButtonVariation,
  FontVariation,
  MultiSelectDropDown,
  MultiSelectOption
} from '@wings-software/uicore'
import { isEqual } from 'lodash-es'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { ExecutionNode } from 'services/pipeline-ng'
import {
  GetVerifyStepDeploymentMetricsQueryParams,
  useGetHealthSources,
  useGetVerifyStepDeploymentMetrics,
  useGetVerifyStepNodeNames,
  useGetVerifyStepTransactionNames
} from 'services/cv'
import type { ExecutionQueryParams } from '@pipeline/utils/executionUtils'
import { VerificationType } from '@cv/components/HealthSourceDropDown/HealthSourceDropDown.constants'
import noDataImage from '@cv/assets/noData.svg'
import { POLLING_INTERVAL, PAGE_SIZE, DEFAULT_PAGINATION_VALUEE } from './DeploymentMetrics.constants'
import { RefreshViewForNewData } from '../RefreshViewForNewDataButton/RefreshForNewData'
import type { DeploymentNodeAnalysisResult } from '../DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes.constants'
import {
  DeploymentMetricsAnalysisRow,
  DeploymentMetricsAnalysisRowProps
} from './components/DeploymentMetricsAnalysisRow/DeploymentMetricsAnalysisRow'
import {
  transformMetricData,
  getErrorMessage,
  getAccordionIds,
  getDropdownItems,
  getInitialNodeName,
  getQueryParamForHostname,
  getQueryParamFromFilters,
  getFilterDisplayText,
  getShouldShowSpinner,
  getShouldShowError,
  isErrorOrLoading,
  isStepRunningOrWaiting
} from './DeploymentMetrics.utils'
import MetricsAccordionPanelSummary from './components/DeploymentAccordionPanel/MetricsAccordionPanelSummary'
import { HealthSourceMultiSelectDropDown } from '../HealthSourcesMultiSelectDropdown/HealthSourceMultiSelectDropDown'
import DeploymentMetricsLables from './components/DeploymentMetricsLables'
import css from './DeploymentMetrics.module.scss'

interface DeploymentMetricsProps {
  step: ExecutionNode
  activityId: string
  selectedNode?: DeploymentNodeAnalysisResult
}

type UpdateViewState = {
  hasNewData: boolean
  shouldUpdateView: boolean
  currentViewData: DeploymentMetricsAnalysisRowProps[]
  showSpinner: boolean
}

export function DeploymentMetrics(props: DeploymentMetricsProps): JSX.Element {
  const { step, selectedNode, activityId } = props
  const { getString } = useStrings()
  const pageParams = useQueryParams<ExecutionQueryParams>()

  const { accountId } = useParams<ProjectPathProps>()
  const [anomalousMetricsFilterChecked, setAnomalousMetricsFilterChecked] = useState(
    pageParams.filterAnomalous === 'true'
  )
  const [queryParams, setQueryParams] = useState<GetVerifyStepDeploymentMetricsQueryParams>({
    accountId,
    anomalousMetricsOnly: anomalousMetricsFilterChecked,
    anomalousNodesOnly: anomalousMetricsFilterChecked,
    hostNames: getQueryParamForHostname(selectedNode?.hostName),
    pageNumber: 0,
    pageSize: PAGE_SIZE
  })
  const accordionRef = useRef<AccordionHandle>(null)
  const [pollingIntervalId, setPollingIntervalId] = useState(-1)
  const [selectedHealthSources, setSelectedHealthSources] = useState<MultiSelectOption[]>([])
  const [selectedNodeName, setSelectedNodeName] = useState<MultiSelectOption[]>(() => getInitialNodeName(selectedNode))
  const [selectedTransactionName, setSelectedTransactionName] = useState<MultiSelectOption[]>([])
  const [{ hasNewData, shouldUpdateView, currentViewData, showSpinner }, setUpdateViewInfo] = useState<UpdateViewState>(
    {
      hasNewData: false,
      showSpinner: true,
      shouldUpdateView: true,
      currentViewData: []
    }
  )
  const { loading, error, data, refetch } = useGetVerifyStepDeploymentMetrics({
    queryParams,
    verifyStepExecutionId: activityId,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })

  const {
    data: transactionNames,
    loading: transactionNameLoading,
    error: transactionNameError
  } = useGetVerifyStepTransactionNames({
    verifyStepExecutionId: activityId,
    queryParams: {
      accountId
    }
  })

  const {
    data: nodeNames,
    loading: nodeNamesLoading,
    error: nodeNamesError
  } = useGetVerifyStepNodeNames({
    verifyStepExecutionId: activityId,
    queryParams: {
      accountId
    }
  })

  const accordionIdsRef = useRef<string[]>([])

  useEffect(() => {
    accordionIdsRef.current = getAccordionIds(currentViewData)
  }, [currentViewData])

  const getFilteredText = useCallback((selectedOptions: MultiSelectOption[] = [], filterText = ' '): string => {
    const baseText = getString(filterText)
    return getFilterDisplayText(selectedOptions, baseText, getString('all'))
  }, [])

  const {
    data: healthSourcesData,
    error: healthSourcesError,
    loading: healthSourcesLoading,
    refetch: fetchHealthSources
  } = useGetHealthSources({
    queryParams: { accountId },
    activityId: activityId as string,
    lazy: true
  })

  useEffect(() => {
    if (activityId) {
      fetchHealthSources()
    }
    setPollingIntervalId(-1)
    setUpdateViewInfo({ currentViewData: [], hasNewData: false, shouldUpdateView: true, showSpinner: true })
    setQueryParams(oldParams => ({
      ...oldParams,
      hostName: undefined,
      hostNames: undefined,
      pageNumber: 0
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activityId])

  useEffect(() => {
    let intervalId = pollingIntervalId
    clearInterval(intervalId)
    if (isStepRunningOrWaiting(step?.status)) {
      // eslint-disable-next-line
      // @ts-ignore
      intervalId = setInterval(refetch, POLLING_INTERVAL)
      setPollingIntervalId(intervalId)
    }

    return () => clearInterval(intervalId)
  }, [step?.status, queryParams])

  useEffect(() => {
    const updatedQueryParams = {
      ...queryParams,
      hostNames: getQueryParamForHostname(selectedNode?.hostName)
    }
    if (!isEqual(updatedQueryParams, queryParams)) {
      setQueryParams(updatedQueryParams)
    }

    setSelectedNodeName(getInitialNodeName(selectedNode))

    setUpdateViewInfo(oldState => ({ ...oldState, shouldUpdateView: true, showSpinner: true }))
  }, [selectedNode])

  useEffect(() => {
    if (isErrorOrLoading(error, loading)) {
      return
    }
    const updatedProps = transformMetricData(data)

    if (shouldUpdateView) {
      setUpdateViewInfo({
        hasNewData: false,
        shouldUpdateView: false,
        currentViewData: updatedProps,
        showSpinner: false
      })
    } else {
      setUpdateViewInfo(prevState => ({
        ...prevState,
        hasNewData: !isEqual(prevState?.currentViewData, updatedProps),
        showSpinner: false
      }))
    }
  }, [data])

  useEffect(() => {
    setQueryParams(oldQueryParams => ({
      ...oldQueryParams,
      pageNumber: 0,
      anomalousMetricsOnly: anomalousMetricsFilterChecked,
      anomalousNodesOnly: anomalousMetricsFilterChecked
    }))
    setUpdateViewInfo(oldInfo => ({ ...oldInfo, shouldUpdateView: true, showSpinner: true }))
  }, [anomalousMetricsFilterChecked])

  const paginationInfo = data?.resource?.pageResponse || DEFAULT_PAGINATION_VALUEE

  useEffect(() => {
    const healthSourceQueryParams = selectedHealthSources.map(item => item.value) as string[]
    const transactionNameParams = selectedTransactionName.map(item => item.value) as string[]
    const nodeNameParams = selectedNodeName.map(item => item.value) as string[]

    setQueryParams(prevQueryParams => ({
      ...prevQueryParams,
      pageNumber: 0,
      healthSources: getQueryParamFromFilters(healthSourceQueryParams),
      transactionNames: getQueryParamFromFilters(transactionNameParams),
      hostNames: getQueryParamFromFilters(nodeNameParams)
    }))
    setUpdateViewInfo(oldInfo => ({ ...oldInfo, shouldUpdateView: true, showSpinner: true }))
  }, [selectedHealthSources, selectedTransactionName, selectedNodeName])

  const handleHealthSourceChange = useCallback(selectedHealthSourceFitlers => {
    setSelectedHealthSources(selectedHealthSourceFitlers)
  }, [])

  const handleTransactionNameChange = useCallback(selectedTransactionNameFitlers => {
    setSelectedTransactionName(selectedTransactionNameFitlers)
  }, [])
  const handleNodeNameChange = useCallback(selectedNodeNameFitlers => {
    setSelectedNodeName(selectedNodeNameFitlers)
  }, [])

  const updatedAnomalousMetricsFilter = useCallback(
    () => setAnomalousMetricsFilterChecked(currentFilterStatus => !currentFilterStatus),
    []
  )

  const renderContent = (): JSX.Element => {
    if (getShouldShowSpinner(loading, showSpinner)) {
      return <Icon name="steps-spinner" className={css.loading} color={Color.GREY_400} size={30} />
    }

    if (getShouldShowError(error, shouldUpdateView)) {
      return <PageError message={getErrorMessage(error)} onClick={() => refetch()} className={css.error} />
    }

    if (!currentViewData?.length) {
      return (
        <Container className={css.noData}>
          <NoDataCard
            onClick={() => refetch()}
            message={getString('cv.monitoredServices.noAvailableData')}
            image={noDataImage}
          />
        </Container>
      )
    }

    return (
      <>
        <DeploymentMetricsLables />
        <Accordion
          allowMultiOpen
          panelClassName={css.deploymentMetricsAccordionPanel}
          summaryClassName={css.deploymentMetricsAccordionSummary}
          ref={accordionRef}
        >
          {currentViewData?.map(analysisRow => {
            const { transactionName, metricName, healthSourceType } = analysisRow
            return (
              <Accordion.Panel
                key={`${transactionName}-${metricName}-${healthSourceType}`}
                id={`${transactionName}-${metricName}-${healthSourceType}`}
                summary={<MetricsAccordionPanelSummary analysisRow={analysisRow} />}
                details={
                  <DeploymentMetricsAnalysisRow
                    key={`${transactionName}-${metricName}-${healthSourceType}`}
                    {...analysisRow}
                    className={css.analysisRow}
                  />
                }
              />
            )
          })}
        </Accordion>
      </>
    )
  }

  return (
    <Container className={css.main}>
      <Container className={css.filters}>
        <Text color={Color.BLACK} font={{ size: 'small', weight: 'bold' }}>
          {getString('filters.filtersLabel').toLocaleUpperCase()}:
        </Text>
        <MultiSelectDropDown
          placeholder={getFilteredText(selectedTransactionName, 'rbac.group')}
          value={selectedTransactionName}
          className={css.filterDropdown}
          items={getDropdownItems(transactionNames?.resource as string[], transactionNameLoading, transactionNameError)}
          onChange={handleTransactionNameChange}
          buttonTestId={'transaction_name_filter'}
        />
        <MultiSelectDropDown
          placeholder={getFilteredText(selectedNodeName, 'pipeline.nodesLabel')}
          value={selectedNodeName}
          className={css.filterDropdown}
          items={getDropdownItems(nodeNames?.resource as string[], nodeNamesLoading, nodeNamesError)}
          onChange={handleNodeNameChange}
          buttonTestId={'node_name_filter'}
        />
        <HealthSourceMultiSelectDropDown
          data={healthSourcesData}
          loading={healthSourcesLoading}
          error={healthSourcesError}
          onChange={handleHealthSourceChange}
          verificationType={VerificationType.TIME_SERIES}
          selectedValues={selectedHealthSources}
          className={css.filterDropdown}
        />

        <Checkbox
          onChange={updatedAnomalousMetricsFilter}
          checked={anomalousMetricsFilterChecked}
          label={getString('pipeline.verification.anomalousMetricsFilterLabel')}
        />
      </Container>
      <Layout.Horizontal className={css.filterSecondRow} border={{ bottom: true }} margin={{ bottom: 'large' }}>
        <Container className={css.accordionToggleButtons}>
          {Boolean(currentViewData.length) && (
            <>
              <Button
                onClick={() => accordionRef.current?.open(accordionIdsRef.current)}
                variation={ButtonVariation.LINK}
                border={{ right: true }}
              >
                {getString('pipeline.verification.expandAll')}
              </Button>
              <Button
                onClick={() => accordionRef.current?.close(accordionIdsRef.current)}
                variation={ButtonVariation.LINK}
              >
                {getString('pipeline.verification.collapseAll')}
              </Button>
            </>
          )}
        </Container>
        <Layout.Horizontal>
          {pollingIntervalId !== -1 && hasNewData && (
            <RefreshViewForNewData
              className={css.refreshButton}
              onClick={() => {
                setUpdateViewInfo(prevState => ({
                  ...prevState,
                  hasNewData: false,
                  currentViewData: transformMetricData(data)
                }))
              }}
            />
          )}
          <Layout.Horizontal className={css.legend}>
            <span className={css.predicted} />
            <Text font={{ variation: FontVariation.SMALL }}> {getString('pipeline.verification.predicted')}</Text>
            <span className={css.actualFail} />
            <span className={css.actualWarning} />
            <span className={css.actualHealthy} />
            <Text font={{ variation: FontVariation.SMALL }}>
              {getString('ce.perspectives.budgets.configureAlerts.actual')}
            </Text>
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Container className={css.content}>{renderContent()}</Container>
      <Pagination
        pageSize={paginationInfo.pageSize as number}
        pageCount={paginationInfo.totalPages as number}
        itemCount={paginationInfo.totalItems as number}
        pageIndex={paginationInfo.pageIndex}
        gotoPage={selectedPage => {
          setQueryParams(oldQueryParams => ({ ...oldQueryParams, pageNumber: selectedPage }))
          setUpdateViewInfo(oldInfo => ({ ...oldInfo, shouldUpdateView: true, showSpinner: true }))
        }}
      />
    </Container>
  )
}
