import React from 'react'
import { Container, Text } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import moment from 'moment'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import CardRailView from '@pipeline/components/Dashboards/CardRailView/CardRailView'
import { useGetWorkloads, useGetDeployments } from 'services/cd-ng'
import DeploymentsHealthCards from './DeploymentsHealthCards'
import DeploymentExecutionsChart from './DeploymentExecutionsChart'
import WorkloadCard from './DeploymentCards/WorkloadCard'
import FailedDeploymentCard from './DeploymentCards/FailedDeploymentCard'
import ActiveDeploymentCard from './DeploymentCards/ActiveDeploymentCard'
import styles from './CDDashboardPage.module.scss'

export const CDDashboardPage: React.FC = () => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps>()
  const { selectedProject: project } = useAppStore()
  const history = useHistory()
  const { getString } = useStrings()

  const { data, loading } = useGetDeployments({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  const { data: workloadsData, loading: loadingWorkloads } = useGetWorkloads({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      startInterval: moment(Date.now() - 30 * 24 * 60 * 60000).format('YYYY-MM-DD'),
      endInterval: moment(Date.now()).format('YYYY-MM-DD')
    }
  })

  return (
    <>
      <Page.Header
        title={
          <Container>
            <Breadcrumbs
              links={[
                {
                  label: project?.name || '',
                  url: routes.toProjectOverview({ orgIdentifier, projectIdentifier, accountId, module: 'cd' })
                },
                {
                  label: getString('overview'),
                  url: ''
                }
              ]}
            />
            <Text font={{ size: 'medium', weight: 'bold' }} margin={{ top: 'xsmall' }}>
              {getString('overview')}
            </Text>
          </Container>
        }
      />
      <Page.Body loading={loading || loadingWorkloads}>
        <Container className={styles.page} padding="large">
          <DeploymentsHealthCards />
          <Container className={styles.executionsWrapper}>
            <DeploymentExecutionsChart />
          </Container>
          <CardRailView contentType="WORKLOAD" isLoading={loadingWorkloads} titleSideContent={<></>}>
            {workloadsData?.data?.workloadDeploymentInfoList?.map((workload, i) => (
              <WorkloadCard
                key={i}
                serviceName={workload.serviceName!}
                lastExecuted={workload.lastExecuted!}
                deploymentType={workload.deploymentType!}
                totalDeployments={workload.totalDeployments!}
                percentSuccess={workload.percentSuccess!}
                rateSuccess={workload.rateSuccess!}
                workload={workload.workload}
              />
            ))}
          </CardRailView>
          <CardRailView
            contentType="FAILED_DEPLOYMENT"
            isLoading={false}
            titleSideContent={false}
            onShowAll={() =>
              history.push(
                routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'cd' }) +
                  `?filters=${JSON.stringify({ status: ['Aborted', 'Expired', 'Failed'] })}`
              )
            }
          >
            {data?.data?.failure?.map((d, i) => (
              <FailedDeploymentCard
                key={i}
                name={d.name!}
                startTime={d.startTs!}
                endTime={d.endTs!}
                serviceInfoList={d.serviceInfoList}
              />
            ))}
          </CardRailView>
          <CardRailView
            contentType="ACTIVE_DEPLOYMENT"
            isLoading={loading}
            titleSideContent={false}
            onShowAll={() =>
              history.push(
                routes.toDeployments({ projectIdentifier, orgIdentifier, accountId, module: 'cd' }) +
                  `?filters=${JSON.stringify({ status: ['Runnint', 'Waiting'] })}`
              )
            }
          >
            {[...(data?.data?.active ?? []), ...(data?.data?.pending ?? [])]?.map((d, i) => (
              <ActiveDeploymentCard key={i} name={d.name} status={d.status} serviceInfoList={d.serviceInfoList} />
            ))}
          </CardRailView>
        </Container>
      </Page.Body>
    </>
  )
}

export default CDDashboardPage
