import React, { useState, useEffect, useRef } from 'react'
import { Container, Tabs, Tab } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useGetDeploymentTimeSeries, DeploymentVerificationJobInstanceSummary } from 'services/cv'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { useToaster } from '@common/exports'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { DeploymentProgressAndNodes } from '@cv/components/ExecutionVerification/components/DeploymentProgressAndNodes/DeploymentProgressAndNodes'
import type { DeploymentNodeAnalysisResult } from '@cv/components/ExecutionVerification/components/DeploymentProgressAndNodes/components/DeploymentNodes/DeploymentNodes.constants'
import DeploymentMetricsTab from './DeploymentMetricsTab'
import styles from './DeploymentDrilldownView.module.scss'

export enum TabIdentifier {
  METRICS_TAB = 'METRICS_TAB',
  LOGS_TAB = 'LOGS_TAB'
}

export interface VerificationInstanceViewProps {
  verificationInstance: DeploymentVerificationJobInstanceSummary
  selectedTab: TabIdentifier
  onTabChange(tab: TabIdentifier): void
  anomalousMetricsOnly: boolean
  onAnomalousMetricsOnly(val: boolean): void
}

export default function VerificationInstanceView({
  verificationInstance,
  selectedTab,
  onTabChange,
  anomalousMetricsOnly,
  onAnomalousMetricsOnly
}: VerificationInstanceViewProps): React.ReactElement {
  const prevProps = useRef<any>({})
  const [selectedNode, setSelectedNode] = useState<DeploymentNodeAnalysisResult | undefined>()
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const { showError } = useToaster()

  const {
    data: timeseriesData,
    loading: timeseriesLoading,
    error: timeseriesError,
    refetch: fetchTimeseries
  } = useGetDeploymentTimeSeries({
    verificationJobInstanceId: verificationInstance.verificationJobInstanceId!,
    queryParams: {
      accountId: accountId,
      anomalousMetricsOnly,
      hostName: selectedNode?.hostName
    },
    lazy: true
  })

  const goToTimeseriesPage = (page: number) => {
    fetchTimeseries({
      queryParams: {
        accountId: accountId,
        anomalousMetricsOnly,
        hostName: selectedNode?.hostName,
        pageNumber: page
      }
    })
  }

  useEffect(() => {
    if (prevProps.current.verificationInstance !== verificationInstance) {
      if (selectedTab === TabIdentifier.METRICS_TAB) {
        goToTimeseriesPage(0)
      }
    } else if (prevProps.current.selectedTab !== selectedTab) {
      if (selectedTab === TabIdentifier.METRICS_TAB && !timeseriesData) {
        goToTimeseriesPage(0)
      }
    } else {
      goToTimeseriesPage(0)
    }
    prevProps.current = {
      verificationInstance,
      selectedTab
    }
  }, [verificationInstance, selectedTab, anomalousMetricsOnly, selectedNode])

  useEffect(() => {
    if (timeseriesError) {
      showError(timeseriesError.message)
    }
  }, [timeseriesError])

  const isLoading = timeseriesLoading

  return (
    <Container>
      <DeploymentProgressAndNodes
        deploymentSummary={verificationInstance}
        onSelectNode={(node?: DeploymentNodeAnalysisResult) => {
          setSelectedNode(node)
          fetchTimeseries({
            queryParams: {
              accountId,
              anomalousMetricsOnly,
              hostName: node?.hostName
            }
          })
        }}
      />
      <Container className={styles.filters}>
        <Tabs id="tabs1" onChange={onTabChange} selectedTabId={selectedTab}>
          <Tab title={getString('pipeline.verification.analysisTab.metrics')} id={TabIdentifier.METRICS_TAB} />
          <Tab title={getString('pipeline.verification.analysisTab.logs')} id={TabIdentifier.LOGS_TAB} />
        </Tabs>
      </Container>
      {selectedTab === TabIdentifier.METRICS_TAB && (
        <DeploymentMetricsTab
          data={timeseriesData}
          goToPage={goToTimeseriesPage}
          isLoading={timeseriesLoading}
          anomalousMetricsOnly={anomalousMetricsOnly}
          onAnomalousMetricsOnly={onAnomalousMetricsOnly}
        />
      )}
      {isLoading && <PageSpinner />}
    </Container>
  )
}
