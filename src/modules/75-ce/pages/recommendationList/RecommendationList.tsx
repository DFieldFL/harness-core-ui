import React, { useState } from 'react'
import { Card, Text, Layout, Container, Color } from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'

import { useStrings } from 'framework/strings'
import {
  RecommendationItemDto,
  useRecommendationsQuery,
  useRecommendationsSummaryQuery,
  K8sRecommendationFilterDtoInput,
  ResourceType
} from 'services/ce/services'

import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import Table from '@common/components/Table/Table'
import formatCost from '@ce/utils/formatCost'
import RecommendationSavingsCard from '../../components/RecommendationSavingsCard/RecommendationSavingsCard'
import RecommendationFilters from '../../components/RecommendationFilters'

interface RecommendationListProps {
  data: Array<RecommendationItemDto>
  setFilters: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
  filters: Record<string, string[]>
  setCostFilters: React.Dispatch<React.SetStateAction<Record<string, number>>>
  costFilters: Record<string, number>
  pagination: {
    itemCount: number
    pageSize: number
    pageCount: number
    pageIndex: number
    gotoPage: (pageNumber: number) => void
  }
}

const RecommendationsList: React.FC<RecommendationListProps> = ({
  data,
  filters,
  setFilters,
  setCostFilters,
  costFilters,
  pagination
}) => {
  const history = useHistory()
  const { accountId } = useParams<{ accountId: string }>()
  const { getString } = useStrings()

  const NameCell: Renderer<CellProps<RecommendationItemDto>> = cell => {
    const originalRowData = cell.row.original
    const { resourceType, clusterName, namespace } = originalRowData
    return resourceType === ResourceType.Workload ? (
      <Layout.Vertical
        margin={{
          right: 'medium'
        }}
      >
        <Text>{clusterName}</Text>
        <Text>{`/ ${namespace}`}</Text>
        <Text>{`/ ${cell.value}`}</Text>
      </Layout.Vertical>
    ) : null
  }

  const RecommendationTypeCell: Renderer<CellProps<RecommendationItemDto>> = ({ row }) => {
    const rowData = row.original
    const { resourceType } = rowData
    return (
      <Text>
        {resourceType === 'WORKLOAD' ? getString('ce.recommendation.listPage.recommendationTypes.resizing') : ''}
      </Text>
    )
  }

  const RecommendationDetailsCell: Renderer<CellProps<RecommendationItemDto>> = ({ row }) => {
    const rowData = row.original
    const { resourceType } = rowData
    return (
      <Text>
        {resourceType === 'WORKLOAD' ? getString('ce.recommendation.listPage.recommendationDetails.resize') : ''}
      </Text>
    )
  }

  const ResourceTypeCell: Renderer<CellProps<RecommendationItemDto>> = cell => {
    return <Text>{cell.value === 'WORKLOAD' ? getString('pipelineSteps.workload') : ''}</Text>
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

        <Table<RecommendationItemDto>
          onRowClick={row => {
            history.push(
              routes.toCERecommendationDetails({
                accountId,
                recommendation: row.id,
                recommendationName: row.resourceName || row.id
              })
            )
          }}
          data={data}
          columns={[
            {
              accessor: 'monthlySaving',
              Header: getString('ce.recommendation.listPage.listTableHeaders.monthlySavings'),
              Cell: SavingCell,
              width: '15%'
            },
            {
              accessor: 'resourceName',
              Header: getString('ce.recommendation.listPage.listTableHeaders.resourceName'),
              Cell: NameCell,
              width: '20%'
            },
            {
              accessor: 'resourceType',
              Header: getString('ce.recommendation.listPage.listTableHeaders.resourceType'),
              Cell: ResourceTypeCell,
              width: '15%'
            },
            {
              accessor: 'monthlyCost',
              Header: getString('ce.recommendation.listPage.listTableHeaders.monthlyCost'),
              Cell: CostCell,
              width: '15%'
            },
            {
              Header: getString('ce.recommendation.listPage.listTableHeaders.recommendationType'),
              Cell: RecommendationTypeCell,
              width: '15%'
            },
            {
              Header: getString('ce.recommendation.listPage.listTableHeaders.details'),
              Cell: RecommendationDetailsCell,
              width: '15%'
            }
          ]}
          pagination={pagination}
        ></Table>
      </Layout.Vertical>
    </Card>
  ) : null
}

const RecommendationList: React.FC = () => {
  const [filters, setFilters] = useState<Record<string, string[]>>({})
  const [costFilters, setCostFilters] = useState<Record<string, number>>({})
  const [page, setPage] = useState(0)

  const modifiedCostFilters = costFilters['minSaving'] ? costFilters : { ...costFilters, minSaving: 0 }

  const [result] = useRecommendationsQuery({
    variables: {
      filter: {
        ...filters,
        ...modifiedCostFilters,
        offset: page * 10,
        limit: 10,
        resourceTypes: ['WORKLOAD']
      } as K8sRecommendationFilterDtoInput
    }
  })

  const [summaryResult] = useRecommendationsSummaryQuery({
    variables: {
      filter: {
        ...filters,
        ...modifiedCostFilters,
        resourceTypes: ['WORKLOAD']
      } as K8sRecommendationFilterDtoInput
    }
  })

  const { data, fetching } = result
  const { data: summaryData } = summaryResult

  const { getString } = useStrings()

  const totalMonthlyCost = summaryData?.recommendationStatsV2?.totalMonthlyCost || 0
  const totalSavings = summaryData?.recommendationStatsV2?.totalMonthlySaving || 0

  const recommendationItems = data?.recommendationsV2?.items || []

  const gotoPage = (pageNumber: number) => setPage(pageNumber)

  const pagination = {
    itemCount: summaryData?.recommendationStatsV2?.count || 0,
    pageSize: 10,
    pageCount: summaryData?.recommendationStatsV2?.count
      ? Math.ceil(summaryData?.recommendationStatsV2?.count / 10)
      : 0,
    pageIndex: page,
    gotoPage: gotoPage
  }

  return (
    <>
      <Page.Header title="Recommendations"></Page.Header>
      <Page.Body loading={fetching}>
        <Container padding="xlarge" height="100%">
          {recommendationItems.length ? (
            <Layout.Vertical spacing="large">
              <Layout.Horizontal spacing="medium">
                <RecommendationSavingsCard
                  title={getString('ce.recommendation.listPage.monthlySavingsText')}
                  amount={formatCost(totalSavings)}
                  iconName="money-icon"
                />
                <RecommendationSavingsCard
                  title={getString('ce.recommendation.listPage.monthlyForcastedCostText')}
                  amount={formatCost(totalMonthlyCost)}
                  subTitle={getString('ce.recommendation.listPage.forecatedCostSubText')}
                />
              </Layout.Horizontal>

              <RecommendationsList
                pagination={pagination}
                setFilters={setFilters}
                filters={filters}
                setCostFilters={setCostFilters}
                costFilters={costFilters}
                data={recommendationItems as Array<RecommendationItemDto>}
              />
            </Layout.Vertical>
          ) : null}
        </Container>
      </Page.Body>
    </>
  )
}

export default RecommendationList
