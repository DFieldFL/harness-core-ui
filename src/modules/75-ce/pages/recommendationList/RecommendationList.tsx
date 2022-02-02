/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { Card, Text, Layout, Container, Color, Icon, Button, ButtonVariation, TableV2 } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'

import { useStrings } from 'framework/strings'
import {
  RecommendationItemDto,
  useRecommendationsQuery,
  useRecommendationsSummaryQuery,
  K8sRecommendationFilterDtoInput,
  ResourceType,
  useFetchCcmMetaDataQuery,
  CcmMetaData,
  Maybe
} from 'services/ce/services'

import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import { useQueryParams } from '@common/hooks'
import formatCost from '@ce/utils/formatCost'
import { getViewFilterForId } from '@ce/utils/perspectiveUtils'
import EmptyView from '@ce/images/empty-state.svg'
import OverviewAddCluster from '@ce/components/OverviewPage/OverviewAddCluster'
import { PAGE_NAMES, USER_JOURNEY_EVENTS } from '@ce/TrackingEventsConstants'
import { useTelemetry } from '@common/hooks/useTelemetry'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { CCM_PAGE_TYPE } from '@ce/types'
import RecommendationSavingsCard from '../../components/RecommendationSavingsCard/RecommendationSavingsCard'
import RecommendationFilters from '../../components/RecommendationFilters'
import css from './RecommendationList.module.scss'

type RouteFn = (
  params: {
    recommendation: string
    recommendationName: string
  } & {
    accountId: string
  }
) => string

interface RecommendationListProps {
  data: Array<RecommendationItemDto>
  setFilters: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
  filters: Record<string, string[]>
  setCostFilters: React.Dispatch<React.SetStateAction<Record<string, number>>>
  costFilters: Record<string, number>
  fetching: boolean
  ccmData: Maybe<CcmMetaData> | undefined
  pagination: {
    itemCount: number
    pageSize: number
    pageCount: number
    pageIndex: number
    gotoPage: (pageNumber: number) => void
  }
  onAddClusterSuccess: () => void
}

const RecommendationsList: React.FC<RecommendationListProps> = ({
  data,
  filters,
  setFilters,
  setCostFilters,
  costFilters,
  pagination,
  fetching,
  ccmData,
  onAddClusterSuccess
}) => {
  const history = useHistory()
  const { trackEvent } = useTelemetry()
  const { accountId } = useParams<{ accountId: string }>()

  const { getString } = useStrings()
  const resourceTypeToRoute: Record<ResourceType, RouteFn> = useMemo(() => {
    return {
      [ResourceType.Workload]: routes.toCERecommendationDetails,
      [ResourceType.NodePool]: routes.toCENodeRecommendationDetails
    }
  }, [])

  if (fetching) {
    return (
      <Card elevation={1} className={css.errorContainer}>
        <Icon color="blue500" name="spinner" size={30} />
      </Card>
    )
  }

  if (ccmData && !ccmData.k8sClusterConnectorPresent) {
    return (
      <Card elevation={1} className={css.errorContainer}>
        <OverviewAddCluster
          onAddClusterSuccess={onAddClusterSuccess}
          descriptionText={getString('ce.pageErrorMsg.recommendationDesc')}
        />
      </Card>
    )
  }

  if (ccmData && ccmData.k8sClusterConnectorPresent && !ccmData.clusterDataPresent) {
    return (
      <Card elevation={1} className={css.errorContainer}>
        <img src={EmptyView} />
        <Text className={css.errorText}>{getString('ce.pageErrorMsg.recommendationNoData')}</Text>
      </Card>
    )
  }

  const NameCell: Renderer<CellProps<RecommendationItemDto>> = cell => {
    const originalRowData = cell.row.original
    const { clusterName, namespace } = originalRowData
    return (
      <Layout.Vertical
        margin={{
          right: 'medium'
        }}
      >
        <Text>{clusterName}</Text>
        {namespace && <Text>{`/ ${namespace}`}</Text>}
        <Text>{`/ ${cell.value}`}</Text>
      </Layout.Vertical>
    )
  }

  const RecommendationTypeCell: Renderer<CellProps<RecommendationItemDto>> = ({ row }) => {
    const rowData = row.original
    const { resourceType } = rowData
    return (
      <Text>
        {resourceType === 'WORKLOAD'
          ? getString('ce.recommendation.listPage.recommendationTypes.resizing')
          : getString('ce.recommendation.listPage.recommendationTypes.rightSizing')}
      </Text>
    )
  }

  // const RecommendationDetailsCell: Renderer<CellProps<RecommendationItemDto>> = ({ row }) => {
  //   const rowData = row.original
  //   const { resourceType } = rowData
  //   return (
  //     <Text>
  //       {resourceType === 'WORKLOAD' ? getString('ce.recommendation.listPage.recommendationDetails.resize') : ''}
  //     </Text>
  //   )
  // }

  const ResourceTypeCell: Renderer<CellProps<RecommendationItemDto>> = cell => {
    return <Text>{cell.value === 'WORKLOAD' ? getString('pipelineSteps.workload') : 'Nodepool'}</Text>
  }

  const CostCell: Renderer<CellProps<RecommendationItemDto>> = cell => {
    return cell.value ? <Text>{formatCost(cell.value)}</Text> : null
  }

  const SavingCell: Renderer<CellProps<RecommendationItemDto>> = cell => {
    return !isNaN(cell.value) ? (
      <Text color="green500" icon="money-icon" iconProps={{ size: 28 }}>
        {formatCost(cell.value)}
      </Text>
    ) : null
  }

  return data ? (
    <Card elevation={1}>
      <Layout.Vertical spacing="large">
        <Layout.Horizontal>
          <Text style={{ flex: 1 }} color={Color.GREY_400}>
            {getString('ce.recommendation.listPage.recommnedationBreakdown')}
          </Text>
          <RecommendationFilters
            costFilters={costFilters}
            setCostFilters={setCostFilters}
            setFilters={setFilters}
            filters={filters}
          />
        </Layout.Horizontal>

        {data.length ? (
          <TableV2<RecommendationItemDto>
            onRowClick={({ id, resourceType, resourceName }) => {
              trackEvent(USER_JOURNEY_EVENTS.RECOMMENDATION_CLICK, {})
              history.push(
                resourceTypeToRoute[resourceType]({
                  accountId,
                  recommendation: id,
                  recommendationName: resourceName || id
                })
              )
            }}
            data={data}
            columns={[
              {
                accessor: 'monthlySaving',
                Header: getString('ce.recommendation.listPage.listTableHeaders.monthlySavings'),
                Cell: SavingCell,
                width: '18%'
              },
              {
                accessor: 'resourceName',
                Header: getString('ce.recommendation.listPage.listTableHeaders.resourceName'),
                Cell: NameCell,
                width: '23%'
              },
              {
                accessor: 'resourceType',
                Header: getString('ce.recommendation.listPage.listTableHeaders.resourceType'),
                Cell: ResourceTypeCell,
                width: '18%'
              },
              {
                accessor: 'monthlyCost',
                Header: getString('ce.recommendation.listPage.listTableHeaders.monthlyCost'),
                Cell: CostCell,
                width: '18%'
              },
              {
                Header: getString('ce.recommendation.listPage.listTableHeaders.recommendationType'),
                Cell: RecommendationTypeCell,
                width: '18%'
              }
              // {
              //   Header: getString('ce.recommendation.listPage.listTableHeaders.details'),
              //   Cell: RecommendationDetailsCell,
              //   width: '15%'
              // }
            ]}
            pagination={pagination}
          ></TableV2>
        ) : (
          <Container className={css.errorContainer}>
            <img src={EmptyView} />
            <Text className={css.errorText}>{getString('ce.pageErrorMsg.noRecommendations')}</Text>
          </Container>
        )}
      </Layout.Vertical>
    </Card>
  ) : null
}

const RecommendationList: React.FC = () => {
  const [costFilters, setCostFilters] = useState<Record<string, number>>({})
  const [page, setPage] = useState(0)

  const { trackPage } = useTelemetry()
  const history = useHistory()
  const { accountId } = useParams<{ accountId: string }>()
  const {
    perspectiveId,
    perspectiveName,
    filters: filterQuery = {},
    origin
  } = useQueryParams<{
    perspectiveId: string
    perspectiveName: string
    filters: Record<string, any>
    origin: string
  }>()

  const [filters, setFilters] = useState<Record<string, string[]>>(filterQuery)

  useEffect(() => {
    trackPage(PAGE_NAMES.RECOMMENDATIONS_PAGE, {})
  }, [])

  const modifiedCostFilters = costFilters['minSaving'] ? costFilters : { ...costFilters, minSaving: 0 }

  const [ccmMetaResult, refetchCCMMetaData] = useFetchCcmMetaDataQuery()
  const { data: ccmData, fetching: fetchingCCMMetaData } = ccmMetaResult

  const perspectiveFilters = (
    perspectiveId ? { perspectiveFilters: getViewFilterForId(perspectiveId) } : ({} as any)
  ) as K8sRecommendationFilterDtoInput

  const [result] = useRecommendationsQuery({
    variables: {
      filter: {
        ...filters,
        ...perspectiveFilters,
        ...modifiedCostFilters,
        offset: page * 10,
        limit: 10
      } as K8sRecommendationFilterDtoInput
    },
    pause: fetchingCCMMetaData
  })

  const [summaryResult] = useRecommendationsSummaryQuery({
    variables: {
      filter: {
        ...filters,
        ...perspectiveFilters,
        ...modifiedCostFilters
      } as unknown as K8sRecommendationFilterDtoInput
    }
  })

  const { data, fetching } = result
  const { data: summaryData } = summaryResult

  const { getString } = useStrings()

  const totalMonthlyCost = summaryData?.recommendationStatsV2?.totalMonthlyCost || 0
  const totalSavings = summaryData?.recommendationStatsV2?.totalMonthlySaving || 0

  const recommendationItems = data?.recommendationsV2?.items || []

  const gotoPage = (pageNumber: number) => setPage(pageNumber)

  const goBackToPerspective: () => void = () => {
    if (origin === CCM_PAGE_TYPE.Workload) {
      const clusterName = filterQuery.clusterNames[0],
        namespace = filterQuery.namespaces[0],
        workloadName = filterQuery.names[0]

      history.push(
        routes.toCEPerspectiveWorkloadDetails({
          accountId,
          perspectiveId,
          perspectiveName,
          clusterName,
          namespace,
          workloadName
        })
      )
    } else {
      history.push(
        routes.toPerspectiveDetails({
          perspectiveId,
          perspectiveName,
          accountId
        })
      )
    }
  }

  const pagination = {
    itemCount: summaryData?.recommendationStatsV2?.count || 0,
    pageSize: 10,
    pageCount: summaryData?.recommendationStatsV2?.count
      ? Math.ceil(summaryData?.recommendationStatsV2?.count / 10)
      : 0,
    pageIndex: page,
    gotoPage: gotoPage
  }

  const isEmptyView = !fetching && !recommendationItems?.length

  return (
    <>
      <Page.Header
        title={
          <Text
            color="grey800"
            style={{ fontSize: 20, fontWeight: 'bold' }}
            tooltipProps={{ dataTooltipId: 'ccmRecommendations' }}
          >
            Recommendations
          </Text>
        }
        breadcrumbs={<NGBreadcrumbs />}
        toolbar={
          perspectiveId ? (
            <Button
              text={getString('ce.recommendation.listPage.backToPerspectives', {
                name: perspectiveName
              })}
              icon="chevron-left"
              onClick={goBackToPerspective}
              variation={ButtonVariation.PRIMARY}
            />
          ) : null
        }
      />
      <Page.Body loading={fetching || fetchingCCMMetaData}>
        <Container padding="xlarge" height="100%">
          <Layout.Vertical spacing="large">
            <Layout.Horizontal spacing="medium">
              <RecommendationSavingsCard
                title={getString('ce.recommendation.listPage.monthlySavingsText')}
                amount={isEmptyView ? '$-' : formatCost(totalSavings)}
                iconName="money-icon"
              />
              <RecommendationSavingsCard
                title={getString('ce.recommendation.listPage.monthlyForcastedCostText')}
                amount={isEmptyView ? '$-' : formatCost(totalMonthlyCost)}
                subTitle={getString('ce.recommendation.listPage.forecatedCostSubText')}
              />
            </Layout.Horizontal>
            <RecommendationsList
              onAddClusterSuccess={() => {
                refetchCCMMetaData()
              }}
              ccmData={ccmData?.ccmMetaData}
              pagination={pagination}
              setFilters={setFilters}
              filters={filters}
              setCostFilters={setCostFilters}
              costFilters={costFilters}
              fetching={fetching || fetchingCCMMetaData}
              data={recommendationItems as Array<RecommendationItemDto>}
            />
          </Layout.Vertical>
        </Container>
      </Page.Body>
    </>
  )
}

export default RecommendationList
