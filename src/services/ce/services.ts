/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import gql from 'graphql-tag'
import * as Urql from 'urql'
export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

export const CcmMetaDataDocument = gql`
  query CCMMetaData {
    ccmMetaData {
      k8sClusterConnectorPresent
      cloudDataPresent
      awsConnectorsPresent
      gcpConnectorsPresent
      azureConnectorsPresent
      applicationDataPresent
      inventoryDataPresent
      clusterDataPresent
      isSampleClusterPresent
      defaultAzurePerspectiveId
      defaultAwsPerspectiveId
      defaultGcpPerspectiveId
      defaultClusterPerspectiveId
    }
  }
`

export function useCcmMetaDataQuery(options: Omit<Urql.UseQueryArgs<CcmMetaDataQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<CcmMetaDataQuery>({ query: CcmMetaDataDocument, ...options })
}
export const FetchAllPerspectivesDocument = gql`
  query FetchAllPerspectives {
    perspectives {
      sampleViews {
        id
        name
        chartType
        createdAt
        viewState
        lastUpdatedAt
      }
      customerViews {
        id
        name
        chartType
        totalCost
        viewType
        viewState
        createdAt
        lastUpdatedAt
        timeRange
        reportScheduledConfigured
        dataSources
        groupBy {
          fieldId
          fieldName
          identifier
          identifierName
        }
      }
    }
  }
`

export function useFetchAllPerspectivesQuery(
  options: Omit<Urql.UseQueryArgs<FetchAllPerspectivesQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchAllPerspectivesQuery>({ query: FetchAllPerspectivesDocument, ...options })
}
export const RecommendationsDocument = gql`
  query Recommendations($filter: K8sRecommendationFilterDTOInput) {
    recommendationsV2(filter: $filter) {
      items {
        clusterName
        namespace
        id
        resourceType
        resourceName
        monthlyCost
        monthlySaving
      }
    }
  }
`

export function useRecommendationsQuery(options: Omit<Urql.UseQueryArgs<RecommendationsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<RecommendationsQuery>({ query: RecommendationsDocument, ...options })
}
export const RecommendationsSummaryDocument = gql`
  query RecommendationsSummary($filter: K8sRecommendationFilterDTOInput) {
    recommendationStatsV2(filter: $filter) {
      totalMonthlyCost
      totalMonthlySaving
      count
    }
  }
`

export function useRecommendationsSummaryQuery(
  options: Omit<Urql.UseQueryArgs<RecommendationsSummaryQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<RecommendationsSummaryQuery>({ query: RecommendationsSummaryDocument, ...options })
}
export const FetchBudgetSummaryDocument = gql`
  query FetchBudgetSummary($id: String!) {
    budgetSummary(budgetId: $id) {
      id
      uuid: id
      name
      budgetAmount
      actualCost
      timeLeft
      timeUnit
      timeScope
      actualCostAlerts
      forecastCostAlerts
      forecastCost
      perspectiveId
      perspectiveName
      growthRate
      startTime
      type
      period
      alertThresholds {
        basedOn
        percentage
        emailAddresses
        userGroupIds
      }
    }
  }
`

export function useFetchBudgetSummaryQuery(
  options: Omit<Urql.UseQueryArgs<FetchBudgetSummaryQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchBudgetSummaryQuery>({ query: FetchBudgetSummaryDocument, ...options })
}
export const FetchBudgetDocument = gql`
  query FetchBudget {
    budgetList {
      id
      uuid: id
      name
      budgetAmount
      actualCost
      timeLeft
      timeUnit
      timeScope
      actualCostAlerts
      forecastCostAlerts
      forecastCost
      perspectiveId
      growthRate
      startTime
      type
      period
      alertThresholds {
        basedOn
        percentage
        emailAddresses
        userGroupIds
      }
    }
  }
`

export function useFetchBudgetQuery(options: Omit<Urql.UseQueryArgs<FetchBudgetQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<FetchBudgetQuery>({ query: FetchBudgetDocument, ...options })
}
export const FetchBudgetsGridDataDocument = gql`
  query FetchBudgetsGridData($id: String!) {
    budgetCostData(budgetId: $id) {
      costData {
        time
        actualCost
        budgeted
        budgetVariance
        budgetVariancePercentage
        endTime
      }
      forecastCost
    }
    budgetSummary(budgetId: $id) {
      period
    }
  }
`

export function useFetchBudgetsGridDataQuery(
  options: Omit<Urql.UseQueryArgs<FetchBudgetsGridDataQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchBudgetsGridDataQuery>({ query: FetchBudgetsGridDataDocument, ...options })
}
export const FetchCcmMetaDataDocument = gql`
  query FetchCcmMetaData {
    ccmMetaData {
      k8sClusterConnectorPresent
      cloudDataPresent
      awsConnectorsPresent
      gcpConnectorsPresent
      azureConnectorsPresent
      applicationDataPresent
      inventoryDataPresent
      clusterDataPresent
      isSampleClusterPresent
      defaultAzurePerspectiveId
      defaultAwsPerspectiveId
      defaultGcpPerspectiveId
      defaultClusterPerspectiveId
    }
  }
`

export function useFetchCcmMetaDataQuery(
  options: Omit<Urql.UseQueryArgs<FetchCcmMetaDataQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchCcmMetaDataQuery>({ query: FetchCcmMetaDataDocument, ...options })
}
export const FetchNodeSummaryDocument = gql`
  query FetchNodeSummary(
    $filters: [QLCEViewFilterWrapperInput]
    $gridFilters: [QLCEViewFilterWrapperInput]
    $isClusterQuery: Boolean
  ) {
    perspectiveTrendStats(
      filters: $filters
      isClusterQuery: $isClusterQuery
      aggregateFunction: [
        { operationType: SUM, columnName: "billingamount" }
        { operationType: SUM, columnName: "actualidlecost" }
        { operationType: SUM, columnName: "unallocatedcost" }
        { operationType: SUM, columnName: "systemcost" }
        { operationType: MAX, columnName: "startTime" }
        { operationType: MIN, columnName: "startTime" }
      ]
    ) {
      cost {
        statsLabel
        statsTrend
        statsValue
        statsDescription
      }
      idleCost {
        statsLabel
        statsTrend
        statsValue
        statsDescription
      }
      unallocatedCost {
        statsLabel
        statsTrend
        statsValue
        statsDescription
      }
      utilizedCost {
        statsLabel
        statsTrend
        statsValue
        statsDescription
      }
      systemCost {
        statsLabel
        statsTrend
        statsValue
        statsDescription
      }
    }
    perspectiveGrid(
      filters: $gridFilters
      aggregateFunction: [
        { operationType: SUM, columnName: "cost" }
        { operationType: SUM, columnName: "memoryBillingAmount" }
        { operationType: SUM, columnName: "cpuBillingAmount" }
        { operationType: SUM, columnName: "unallocatedcost" }
        { operationType: SUM, columnName: "memoryUnallocatedCost" }
        { operationType: SUM, columnName: "cpuUnallocatedCost" }
        { operationType: SUM, columnName: "actualidlecost" }
        { operationType: SUM, columnName: "memoryActualIdleCost" }
        { operationType: SUM, columnName: "cpuActualIdleCost" }
        { operationType: SUM, columnName: "systemcost" }
        { operationType: SUM, columnName: "networkcost" }
        { operationType: SUM, columnName: "storageUnallocatedCost" }
      ]
      sortCriteria: []
      groupBy: { entityGroupBy: { fieldId: "instanceName", fieldName: "Node", identifier: CLUSTER } }
      limit: 100
      offset: 0
    ) {
      data {
        id
        name
        cost
        costTrend
        instanceDetails {
          name
          id
          nodeId
          clusterName
          nodePoolName
          cloudProviderInstanceId
          podCapacity
          cpuAllocatable
          memoryAllocatable
          instanceCategory
          machineType
          createTime
          deleteTime
        }
      }
    }
  }
`

export function useFetchNodeSummaryQuery(
  options: Omit<Urql.UseQueryArgs<FetchNodeSummaryQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchNodeSummaryQuery>({ query: FetchNodeSummaryDocument, ...options })
}
export const FetchOverviewTimeSeriesDocument = gql`
  query FetchOverviewTimeSeries(
    $filters: [QLCEViewFilterWrapperInput]
    $aggregateFunction: [QLCEViewAggregationInput]
    $groupBy: [QLCEViewGroupByInput]
  ) {
    overviewTimeSeriesStats(aggregateFunction: $aggregateFunction, filters: $filters, groupBy: $groupBy) {
      data: stats {
        values {
          key {
            id
            name
            type
          }
          value
        }
        time
      }
    }
  }
`

export function useFetchOverviewTimeSeriesQuery(
  options: Omit<Urql.UseQueryArgs<FetchOverviewTimeSeriesQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchOverviewTimeSeriesQuery>({ query: FetchOverviewTimeSeriesDocument, ...options })
}
export const FetchPerspectiveBudgetDocument = gql`
  query FetchPerspectiveBudget($perspectiveId: String) {
    budgetSummaryList(perspectiveId: $perspectiveId) {
      id
      name
      budgetAmount
      actualCost
      timeLeft
      timeUnit
      timeScope
      period
    }
  }
`

export function useFetchPerspectiveBudgetQuery(
  options: Omit<Urql.UseQueryArgs<FetchPerspectiveBudgetQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchPerspectiveBudgetQuery>({ query: FetchPerspectiveBudgetDocument, ...options })
}
export const FetchPerspectiveFiltersValueDocument = gql`
  query FetchPerspectiveFiltersValue($filters: [QLCEViewFilterWrapperInput], $offset: Int, $limit: Int) {
    perspectiveFilters(filters: $filters, offset: $offset, limit: $limit) {
      values
    }
  }
`

export function useFetchPerspectiveFiltersValueQuery(
  options: Omit<Urql.UseQueryArgs<FetchPerspectiveFiltersValueQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchPerspectiveFiltersValueQuery>({ query: FetchPerspectiveFiltersValueDocument, ...options })
}
export const FetchPerspectiveForecastCostDocument = gql`
  query FetchPerspectiveForecastCost(
    $aggregateFunction: [QLCEViewAggregationInput]
    $filters: [QLCEViewFilterWrapperInput]
  ) {
    perspectiveForecastCost(aggregateFunction: $aggregateFunction, filters: $filters) {
      cost {
        statsLabel
        statsTrend
        statsValue
        statsDescription
      }
    }
  }
`

export function useFetchPerspectiveForecastCostQuery(
  options: Omit<Urql.UseQueryArgs<FetchPerspectiveForecastCostQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchPerspectiveForecastCostQuery>({ query: FetchPerspectiveForecastCostDocument, ...options })
}
export const FetchperspectiveGridDocument = gql`
  query FetchperspectiveGrid(
    $filters: [QLCEViewFilterWrapperInput]
    $groupBy: [QLCEViewGroupByInput]
    $limit: Int
    $offset: Int
    $aggregateFunction: [QLCEViewAggregationInput]
    $isClusterOnly: Boolean!
  ) {
    perspectiveGrid(
      aggregateFunction: $aggregateFunction
      filters: $filters
      groupBy: $groupBy
      limit: $limit
      offset: $offset
      sortCriteria: [{ sortType: COST, sortOrder: DESCENDING }]
    ) {
      data {
        name
        id
        cost
        costTrend
        clusterPerspective @include(if: $isClusterOnly)
        clusterData @include(if: $isClusterOnly) {
          appId
          appName
          avgCpuUtilization
          avgMemoryUtilization
          cloudProvider
          cloudProviderId
          cloudServiceName
          clusterId
          clusterName
          clusterType
          costTrend
          cpuBillingAmount
          cpuActualIdleCost
          cpuUnallocatedCost
          efficiencyScore
          efficiencyScoreTrendPercentage
          envId
          envName
          environment
          id
          idleCost
          launchType
          maxCpuUtilization
          maxMemoryUtilization
          memoryBillingAmount
          memoryActualIdleCost
          memoryUnallocatedCost
          name
          namespace
          networkCost
          prevBillingAmount
          region
          serviceId
          serviceName
          storageCost
          storageActualIdleCost
          storageRequest
          storageUnallocatedCost
          storageUtilizationValue
          totalCost
          trendType
          type
          unallocatedCost
          workloadName
          workloadType
        }
        instanceDetails @include(if: $isClusterOnly) {
          name
          id
          nodeId
          clusterName
          clusterId
          nodePoolName
          cloudProviderInstanceId
          podCapacity
          totalCost
          idleCost
          systemCost
          unallocatedCost
          cpuAllocatable
          memoryAllocatable
          instanceCategory
          machineType
          createTime
          deleteTime
          memoryBillingAmount
          cpuBillingAmount
          memoryUnallocatedCost
          cpuUnallocatedCost
          memoryIdleCost
          cpuIdleCost
        }
        storageDetails @include(if: $isClusterOnly) {
          id
          instanceId
          instanceName
          claimName
          claimNamespace
          clusterName
          clusterId
          storageClass
          volumeType
          cloudProvider
          region
          storageCost
          storageActualIdleCost
          storageUnallocatedCost
          capacity
          storageRequest
          storageUtilizationValue
          createTime
          deleteTime
        }
      }
    }
  }
`

export function useFetchperspectiveGridQuery(
  options: Omit<Urql.UseQueryArgs<FetchperspectiveGridQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchperspectiveGridQuery>({ query: FetchperspectiveGridDocument, ...options })
}
export const FetchPerspectiveListDocument = gql`
  query FetchPerspectiveList {
    perspectives {
      customerViews {
        id
        name
      }
    }
  }
`

export function useFetchPerspectiveListQuery(
  options: Omit<Urql.UseQueryArgs<FetchPerspectiveListQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchPerspectiveListQuery>({ query: FetchPerspectiveListDocument, ...options })
}
export const PerspectiveRecommendationsDocument = gql`
  query PerspectiveRecommendations($filter: K8sRecommendationFilterDTOInput) {
    recommendationStatsV2(filter: $filter) {
      totalMonthlyCost
      totalMonthlySaving
      count
    }
    recommendationsV2(filter: $filter) {
      items {
        clusterName
        namespace
        id
        resourceType
        resourceName
        monthlyCost
        monthlySaving
      }
    }
  }
`

export function usePerspectiveRecommendationsQuery(
  options: Omit<Urql.UseQueryArgs<PerspectiveRecommendationsQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<PerspectiveRecommendationsQuery>({ query: PerspectiveRecommendationsDocument, ...options })
}
export const FetchPerspectiveDetailsSummaryDocument = gql`
  query FetchPerspectiveDetailsSummary(
    $filters: [QLCEViewFilterWrapperInput]
    $aggregateFunction: [QLCEViewAggregationInput]
    $isClusterQuery: Boolean
  ) {
    perspectiveTrendStats(filters: $filters, aggregateFunction: $aggregateFunction, isClusterQuery: $isClusterQuery) {
      cost {
        statsDescription
        statsLabel
        statsTrend
        statsValue
        value
      }
      idleCost {
        statsLabel
        statsValue
        value
      }
      unallocatedCost {
        statsLabel
        statsValue
        value
      }
      utilizedCost {
        statsLabel
        statsValue
        value
      }
      efficiencyScoreStats {
        statsLabel
        statsTrend
        statsValue
      }
    }
    perspectiveForecastCost(filters: $filters, aggregateFunction: $aggregateFunction, isClusterQuery: $isClusterQuery) {
      cost {
        statsLabel
        statsTrend
        statsValue
        statsDescription
      }
    }
  }
`

export function useFetchPerspectiveDetailsSummaryQuery(
  options: Omit<Urql.UseQueryArgs<FetchPerspectiveDetailsSummaryQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchPerspectiveDetailsSummaryQuery>({
    query: FetchPerspectiveDetailsSummaryDocument,
    ...options
  })
}
export const FetchPerspectiveDetailsSummaryWithBudgetDocument = gql`
  query FetchPerspectiveDetailsSummaryWithBudget(
    $filters: [QLCEViewFilterWrapperInput]
    $aggregateFunction: [QLCEViewAggregationInput]
    $isClusterQuery: Boolean
  ) {
    perspectiveTrendStats(filters: $filters, aggregateFunction: $aggregateFunction, isClusterQuery: $isClusterQuery) {
      cost {
        statsDescription
        statsLabel
        statsTrend
        statsValue
        value
      }
      idleCost {
        statsLabel
        statsValue
        value
      }
      unallocatedCost {
        statsLabel
        statsValue
        value
      }
      utilizedCost {
        statsLabel
        statsValue
        value
      }
      efficiencyScoreStats {
        statsLabel
        statsTrend
        statsValue
      }
    }
    perspectiveForecastCost(filters: $filters, aggregateFunction: $aggregateFunction, isClusterQuery: $isClusterQuery) {
      cost {
        statsLabel
        statsTrend
        statsValue
        statsDescription
      }
    }
  }
`

export function useFetchPerspectiveDetailsSummaryWithBudgetQuery(
  options: Omit<Urql.UseQueryArgs<FetchPerspectiveDetailsSummaryWithBudgetQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchPerspectiveDetailsSummaryWithBudgetQuery>({
    query: FetchPerspectiveDetailsSummaryWithBudgetDocument,
    ...options
  })
}
export const FetchPerspectiveTimeSeriesDocument = gql`
  query FetchPerspectiveTimeSeries(
    $filters: [QLCEViewFilterWrapperInput]
    $groupBy: [QLCEViewGroupByInput]
    $limit: Int
  ) {
    perspectiveTimeSeriesStats(
      filters: $filters
      groupBy: $groupBy
      limit: $limit
      includeOthers: false
      aggregateFunction: [{ operationType: SUM, columnName: "cost" }]
      sortCriteria: [{ sortType: COST, sortOrder: DESCENDING }]
    ) {
      stats {
        values {
          key {
            id
            name
            type
          }
          value
        }
        time
      }
    }
  }
`

export function useFetchPerspectiveTimeSeriesQuery(
  options: Omit<Urql.UseQueryArgs<FetchPerspectiveTimeSeriesQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchPerspectiveTimeSeriesQuery>({ query: FetchPerspectiveTimeSeriesDocument, ...options })
}
export const FetchPerspectiveTotalCountDocument = gql`
  query FetchPerspectiveTotalCount(
    $filters: [QLCEViewFilterWrapperInput]
    $groupBy: [QLCEViewGroupByInput]
    $isClusterQuery: Boolean
  ) {
    perspectiveTotalCount(filters: $filters, groupBy: $groupBy, isClusterQuery: $isClusterQuery)
  }
`

export function useFetchPerspectiveTotalCountQuery(
  options: Omit<Urql.UseQueryArgs<FetchPerspectiveTotalCountQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchPerspectiveTotalCountQuery>({ query: FetchPerspectiveTotalCountDocument, ...options })
}
export const FetchRecommendationDocument = gql`
  query FetchRecommendation(
    $id: String!
    $resourceType: ResourceType!
    $startTime: OffsetDateTime!
    $endTime: OffsetDateTime!
  ) {
    recommendationStatsV2(filter: { ids: [$id] }) {
      totalMonthlyCost
      totalMonthlySaving
    }
    recommendationsV2(filter: { ids: [$id], offset: 0, limit: 10 }) {
      items {
        clusterName
        namespace
        id
        resourceName
      }
    }
    recommendationDetails(id: $id, resourceType: $resourceType, startTime: $startTime, endTime: $endTime) {
      ... on WorkloadRecommendationDTO {
        containerRecommendations
        items {
          containerRecommendation {
            numDays
            current {
              CPU
              MEMORY
            }
            lastDayCost {
              cpu
              memory
            }
          }
          containerName
          cpuHistogram {
            bucketWeights
            firstBucketSize
            growthRatio
            maxBucket
            minBucket
            numBuckets
            precomputed
            totalWeight
          }
          memoryHistogram {
            bucketWeights
            firstBucketSize
            growthRatio
            maxBucket
            minBucket
            numBuckets
            precomputed
            totalWeight
          }
        }
      }
      ... on NodeRecommendationDTO {
        current {
          instanceCategory
          nodePools {
            sumNodes
            vm {
              avgPrice
              cpusPerVm
              memPerVm
              onDemandPrice
              type
            }
          }
          provider
          region
          service
        }
        id
        nodePoolId {
          clusterid
          nodepoolname
        }
        recommended {
          accuracy {
            cpu
            masterPrice
            memory
            nodes
            spotNodes
            spotPrice
            totalPrice
            workerPrice
          }
          instanceCategory
          nodePools {
            role
            sumNodes
            vmClass
            vm {
              avgPrice
              cpusPerVm
              memPerVm
              onDemandPrice
              type
            }
          }
          provider
          region
          service
        }
        resourceRequirement {
          allowBurst
          maxNodes
          minNodes
          onDemandPct
          sameSize
          sumCpu
          sumGpu
          sumMem
        }
      }
    }
  }
`

export function useFetchRecommendationQuery(
  options: Omit<Urql.UseQueryArgs<FetchRecommendationQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchRecommendationQuery>({ query: FetchRecommendationDocument, ...options })
}
export const RecommendationFiltersDocument = gql`
  query RecommendationFilters {
    recommendationFilterStatsV2(keys: ["name", "resourceType", "namespace", "clusterName"]) {
      key
      values
    }
  }
`

export function useRecommendationFiltersQuery(
  options: Omit<Urql.UseQueryArgs<RecommendationFiltersQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<RecommendationFiltersQuery>({ query: RecommendationFiltersDocument, ...options })
}
export const FetchViewFieldsDocument = gql`
  query FetchViewFields($filters: [QLCEViewFilterWrapperInput]) {
    perspectiveFields(filters: $filters) {
      fieldIdentifierData {
        identifier
        identifierName
        values {
          fieldId
          fieldName
          identifier
          identifierName
        }
      }
    }
  }
`

export function useFetchViewFieldsQuery(options: Omit<Urql.UseQueryArgs<FetchViewFieldsQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<FetchViewFieldsQuery>({ query: FetchViewFieldsDocument, ...options })
}
export const FetchWorkloadGridDocument = gql`
  query FetchWorkloadGrid($filters: [QLCEViewFilterWrapperInput], $isClusterQuery: Boolean) {
    perspectiveGrid(
      filters: $filters
      isClusterQuery: $isClusterQuery
      aggregateFunction: [
        { operationType: SUM, columnName: "networkcost" }
        { operationType: SUM, columnName: "storageActualIdleCost" }
        { operationType: SUM, columnName: "cost" }
        { operationType: SUM, columnName: "memoryBillingAmount" }
        { operationType: SUM, columnName: "cpuBillingAmount" }
        { operationType: SUM, columnName: "storageCost" }
        { operationType: SUM, columnName: "unallocatedcost" }
        { operationType: SUM, columnName: "storageUnallocatedCost" }
        { operationType: SUM, columnName: "memoryUnallocatedCost" }
        { operationType: SUM, columnName: "cpuUnallocatedCost" }
        { operationType: SUM, columnName: "actualidlecost" }
        { operationType: SUM, columnName: "memoryActualIdleCost" }
        { operationType: SUM, columnName: "cpuActualIdleCost" }
        { operationType: SUM, columnName: "systemcost" }
        { operationType: MAX, columnName: "storageUtilizationValue" }
        { operationType: MAX, columnName: "storageRequest" }
      ]
      sortCriteria: [{ sortType: COST, sortOrder: DESCENDING }]
      groupBy: { entityGroupBy: { fieldId: "instanceId", fieldName: "Pod", identifier: CLUSTER } }
      limit: 100
      offset: 0
    ) {
      data {
        id
        name
        cost
        costTrend
        clusterData: instanceDetails {
          name
          id
          nodeId
          namespace
          workload
          clusterName
          clusterId
          node
          nodePoolName
          cloudProviderInstanceId
          podCapacity
          totalCost
          idleCost
          systemCost
          networkCost
          unallocatedCost
          cpuAllocatable
          memoryAllocatable
          cpuRequested
          memoryRequested
          cpuUnitPrice
          memoryUnitPrice
          instanceCategory
          machineType
          createTime
          deleteTime
          qosClass
          memoryBillingAmount
          cpuBillingAmount
          storageUnallocatedCost
          memoryUnallocatedCost
          cpuUnallocatedCost
          memoryIdleCost
          cpuIdleCost
          storageCost
          storageActualIdleCost
          storageUtilizationValue
          storageRequest
        }
      }
    }
  }
`

export function useFetchWorkloadGridQuery(
  options: Omit<Urql.UseQueryArgs<FetchWorkloadGridQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchWorkloadGridQuery>({ query: FetchWorkloadGridDocument, ...options })
}
export const FetchWorkloadSummaryDocument = gql`
  query FetchWorkloadSummary($filters: [QLCEViewFilterWrapperInput], $isClusterQuery: Boolean) {
    perspectiveTrendStats(
      filters: $filters
      isClusterQuery: $isClusterQuery
      aggregateFunction: [
        { operationType: SUM, columnName: "billingamount" }
        { operationType: SUM, columnName: "actualidlecost" }
        { operationType: SUM, columnName: "unallocatedcost" }
        { operationType: MAX, columnName: "startTime" }
        { operationType: MIN, columnName: "startTime" }
      ]
    ) {
      cost {
        statsLabel
        statsTrend
        statsValue
        statsDescription
      }
      idleCost {
        statsLabel
        statsTrend
        statsValue
        statsDescription
      }
      utilizedCost {
        statsLabel
        statsTrend
        statsValue
        statsDescription
      }
    }
    perspectiveGrid(
      filters: $filters
      isClusterQuery: $isClusterQuery
      aggregateFunction: [{ operationType: SUM, columnName: "cost" }]
      sortCriteria: []
      groupBy: { entityGroupBy: { fieldId: "workloadName", fieldName: "Workload Id", identifier: CLUSTER } }
      limit: 100
      offset: 0
    ) {
      data {
        clusterData {
          workloadName
          workloadType
          namespace
          clusterName
        }
      }
    }
  }
`

export function useFetchWorkloadSummaryQuery(
  options: Omit<Urql.UseQueryArgs<FetchWorkloadSummaryQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchWorkloadSummaryQuery>({ query: FetchWorkloadSummaryDocument, ...options })
}
export const FetchWorkloadTimeSeriesDocument = gql`
  query FetchWorkloadTimeSeries(
    $filters: [QLCEViewFilterWrapperInput]
    $aggregateFunction: [QLCEViewAggregationInput]
    $isClusterQuery: Boolean
    $groupBy: [QLCEViewGroupByInput]
  ) {
    perspectiveTimeSeriesStats(
      filters: $filters
      isClusterQuery: $isClusterQuery
      aggregateFunction: $aggregateFunction
      groupBy: $groupBy
      limit: 100
      offset: 0
      includeOthers: false
    ) {
      cpuLimit {
        time
        values {
          key {
            name
            id
          }
          value
        }
      }
      cpuRequest {
        time
        values {
          key {
            name
            id
          }
          value
        }
      }
      cpuUtilValues {
        time
        values {
          key {
            name
            id
          }
          value
        }
      }
      memoryLimit {
        time
        values {
          key {
            name
            id
          }
          value
        }
      }
      memoryRequest {
        time
        values {
          key {
            name
            id
          }
          value
        }
      }
      memoryUtilValues {
        time
        values {
          key {
            name
            id
          }
          value
        }
      }
    }
  }
`

export function useFetchWorkloadTimeSeriesQuery(
  options: Omit<Urql.UseQueryArgs<FetchWorkloadTimeSeriesQueryVariables>, 'query'> = {}
) {
  return Urql.useQuery<FetchWorkloadTimeSeriesQuery>({ query: FetchWorkloadTimeSeriesDocument, ...options })
}
export type CcmMetaDataQueryVariables = Exact<{ [key: string]: never }>

export type CcmMetaDataQuery = {
  __typename?: 'Query'
  ccmMetaData: Maybe<{
    __typename?: 'CCMMetaData'
    k8sClusterConnectorPresent: boolean
    cloudDataPresent: boolean
    awsConnectorsPresent: boolean
    gcpConnectorsPresent: boolean
    azureConnectorsPresent: boolean
    applicationDataPresent: boolean
    inventoryDataPresent: boolean
    clusterDataPresent: boolean
    isSampleClusterPresent: boolean
    defaultAzurePerspectiveId: Maybe<string>
    defaultAwsPerspectiveId: Maybe<string>
    defaultGcpPerspectiveId: Maybe<string>
    defaultClusterPerspectiveId: Maybe<string>
  }>
}

export type FetchAllPerspectivesQueryVariables = Exact<{ [key: string]: never }>

export type FetchAllPerspectivesQuery = {
  __typename?: 'Query'
  perspectives: Maybe<{
    __typename?: 'PerspectiveData'
    sampleViews: Maybe<
      Array<
        Maybe<{
          __typename?: 'QLCEView'
          id: Maybe<string>
          name: Maybe<string>
          chartType: Maybe<ViewChartType>
          createdAt: Maybe<any>
          viewState: Maybe<ViewState>
          lastUpdatedAt: Maybe<any>
        }>
      >
    >
    customerViews: Maybe<
      Array<
        Maybe<{
          __typename?: 'QLCEView'
          id: Maybe<string>
          name: Maybe<string>
          chartType: Maybe<ViewChartType>
          totalCost: number
          viewType: Maybe<ViewType>
          viewState: Maybe<ViewState>
          createdAt: Maybe<any>
          lastUpdatedAt: Maybe<any>
          timeRange: Maybe<ViewTimeRangeType>
          reportScheduledConfigured: boolean
          dataSources: Maybe<Array<Maybe<ViewFieldIdentifier>>>
          groupBy: Maybe<{
            __typename?: 'QLCEViewField'
            fieldId: string
            fieldName: string
            identifier: Maybe<ViewFieldIdentifier>
            identifierName: Maybe<string>
          }>
        }>
      >
    >
  }>
}

export type RecommendationsQueryVariables = Exact<{
  filter: Maybe<K8sRecommendationFilterDtoInput>
}>

export type RecommendationsQuery = {
  __typename?: 'Query'
  recommendationsV2: Maybe<{
    __typename?: 'RecommendationsDTO'
    items: Maybe<
      Array<
        Maybe<{
          __typename?: 'RecommendationItemDTO'
          clusterName: Maybe<string>
          namespace: Maybe<string>
          id: string
          resourceType: ResourceType
          resourceName: Maybe<string>
          monthlyCost: Maybe<number>
          monthlySaving: Maybe<number>
        }>
      >
    >
  }>
}

export type RecommendationsSummaryQueryVariables = Exact<{
  filter: Maybe<K8sRecommendationFilterDtoInput>
}>

export type RecommendationsSummaryQuery = {
  __typename?: 'Query'
  recommendationStatsV2: Maybe<{
    __typename?: 'RecommendationOverviewStats'
    totalMonthlyCost: number
    totalMonthlySaving: number
    count: number
  }>
}

export type FetchBudgetSummaryQueryVariables = Exact<{
  id: Scalars['String']
}>

export type FetchBudgetSummaryQuery = {
  __typename?: 'Query'
  budgetSummary: Maybe<{
    __typename?: 'BudgetSummary'
    id: string
    name: string
    budgetAmount: number
    actualCost: number
    timeLeft: number
    timeUnit: string
    timeScope: string
    actualCostAlerts: Array<Maybe<number>>
    forecastCostAlerts: Array<Maybe<number>>
    forecastCost: number
    perspectiveId: string
    perspectiveName: string
    growthRate: number
    startTime: any
    type: BudgetType
    period: BudgetPeriod
    uuid: string
    alertThresholds: Maybe<
      Array<
        Maybe<{
          __typename?: 'AlertThreshold'
          basedOn: Maybe<AlertThresholdBase>
          percentage: number
          emailAddresses: Maybe<Array<Maybe<string>>>
          userGroupIds: Maybe<Array<Maybe<string>>>
        }>
      >
    >
  }>
}

export type FetchBudgetQueryVariables = Exact<{ [key: string]: never }>

export type FetchBudgetQuery = {
  __typename?: 'Query'
  budgetList: Maybe<
    Array<
      Maybe<{
        __typename?: 'BudgetSummary'
        id: string
        name: string
        budgetAmount: number
        actualCost: number
        timeLeft: number
        timeUnit: string
        timeScope: string
        actualCostAlerts: Array<Maybe<number>>
        forecastCostAlerts: Array<Maybe<number>>
        forecastCost: number
        perspectiveId: string
        growthRate: number
        startTime: any
        type: BudgetType
        period: BudgetPeriod
        uuid: string
        alertThresholds: Maybe<
          Array<
            Maybe<{
              __typename?: 'AlertThreshold'
              basedOn: Maybe<AlertThresholdBase>
              percentage: number
              emailAddresses: Maybe<Array<Maybe<string>>>
              userGroupIds: Maybe<Array<Maybe<string>>>
            }>
          >
        >
      }>
    >
  >
}

export type FetchBudgetsGridDataQueryVariables = Exact<{
  id: Scalars['String']
}>

export type FetchBudgetsGridDataQuery = {
  __typename?: 'Query'
  budgetCostData: Maybe<{
    __typename?: 'BudgetData'
    forecastCost: number
    costData: Maybe<
      Array<
        Maybe<{
          __typename?: 'BudgetCostData'
          time: any
          actualCost: number
          budgeted: number
          budgetVariance: number
          budgetVariancePercentage: number
          endTime: any
        }>
      >
    >
  }>
  budgetSummary: Maybe<{ __typename?: 'BudgetSummary'; period: BudgetPeriod }>
}

export type FetchCcmMetaDataQueryVariables = Exact<{ [key: string]: never }>

export type FetchCcmMetaDataQuery = {
  __typename?: 'Query'
  ccmMetaData: Maybe<{
    __typename?: 'CCMMetaData'
    k8sClusterConnectorPresent: boolean
    cloudDataPresent: boolean
    awsConnectorsPresent: boolean
    gcpConnectorsPresent: boolean
    azureConnectorsPresent: boolean
    applicationDataPresent: boolean
    inventoryDataPresent: boolean
    clusterDataPresent: boolean
    isSampleClusterPresent: boolean
    defaultAzurePerspectiveId: Maybe<string>
    defaultAwsPerspectiveId: Maybe<string>
    defaultGcpPerspectiveId: Maybe<string>
    defaultClusterPerspectiveId: Maybe<string>
  }>
}

export type FetchNodeSummaryQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
  gridFilters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
  isClusterQuery: Maybe<Scalars['Boolean']>
}>

export type FetchNodeSummaryQuery = {
  __typename?: 'Query'
  perspectiveTrendStats: Maybe<{
    __typename?: 'PerspectiveTrendStats'
    cost: Maybe<{
      __typename?: 'StatsInfo'
      statsLabel: string
      statsTrend: Maybe<any>
      statsValue: string
      statsDescription: string
    }>
    idleCost: Maybe<{
      __typename?: 'StatsInfo'
      statsLabel: string
      statsTrend: Maybe<any>
      statsValue: string
      statsDescription: string
    }>
    unallocatedCost: Maybe<{
      __typename?: 'StatsInfo'
      statsLabel: string
      statsTrend: Maybe<any>
      statsValue: string
      statsDescription: string
    }>
    utilizedCost: Maybe<{
      __typename?: 'StatsInfo'
      statsLabel: string
      statsTrend: Maybe<any>
      statsValue: string
      statsDescription: string
    }>
    systemCost: Maybe<{
      __typename?: 'StatsInfo'
      statsLabel: string
      statsTrend: Maybe<any>
      statsValue: string
      statsDescription: string
    }>
  }>
  perspectiveGrid: Maybe<{
    __typename?: 'PerspectiveEntityStatsData'
    data: Maybe<
      Array<
        Maybe<{
          __typename?: 'QLCEViewEntityStatsDataPoint'
          id: Maybe<string>
          name: Maybe<string>
          cost: Maybe<any>
          costTrend: Maybe<any>
          instanceDetails: Maybe<{
            __typename?: 'InstanceDetails'
            name: Maybe<string>
            id: Maybe<string>
            nodeId: Maybe<string>
            clusterName: Maybe<string>
            nodePoolName: Maybe<string>
            cloudProviderInstanceId: Maybe<string>
            podCapacity: Maybe<string>
            cpuAllocatable: number
            memoryAllocatable: number
            instanceCategory: Maybe<string>
            machineType: Maybe<string>
            createTime: any
            deleteTime: any
          }>
        }>
      >
    >
  }>
}

export type FetchOverviewTimeSeriesQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>> | Maybe<QlceViewAggregationInput>>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>> | Maybe<QlceViewGroupByInput>>
}>

export type FetchOverviewTimeSeriesQuery = {
  __typename?: 'Query'
  overviewTimeSeriesStats: Maybe<{
    __typename?: 'PerspectiveTimeSeriesData'
    data: Maybe<
      Array<
        Maybe<{
          __typename?: 'TimeSeriesDataPoints'
          time: any
          values: Array<
            Maybe<{
              __typename?: 'DataPoint'
              value: any
              key: { __typename?: 'Reference'; id: string; name: string; type: string }
            }>
          >
        }>
      >
    >
  }>
}

export type FetchPerspectiveBudgetQueryVariables = Exact<{
  perspectiveId: Maybe<Scalars['String']>
}>

export type FetchPerspectiveBudgetQuery = {
  __typename?: 'Query'
  budgetSummaryList: Maybe<
    Array<
      Maybe<{
        __typename?: 'BudgetSummary'
        id: string
        name: string
        budgetAmount: number
        actualCost: number
        timeLeft: number
        timeUnit: string
        timeScope: string
        period: BudgetPeriod
      }>
    >
  >
}

export type FetchPerspectiveFiltersValueQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
  offset: Maybe<Scalars['Int']>
  limit: Maybe<Scalars['Int']>
}>

export type FetchPerspectiveFiltersValueQuery = {
  __typename?: 'Query'
  perspectiveFilters: Maybe<{ __typename?: 'PerspectiveFilterData'; values: Maybe<Array<Maybe<string>>> }>
}

export type FetchPerspectiveForecastCostQueryVariables = Exact<{
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>> | Maybe<QlceViewAggregationInput>>
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
}>

export type FetchPerspectiveForecastCostQuery = {
  __typename?: 'Query'
  perspectiveForecastCost: Maybe<{
    __typename?: 'PerspectiveTrendStats'
    cost: Maybe<{
      __typename?: 'StatsInfo'
      statsLabel: string
      statsTrend: Maybe<any>
      statsValue: string
      statsDescription: string
    }>
  }>
}

export type FetchperspectiveGridQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>> | Maybe<QlceViewGroupByInput>>
  limit: Maybe<Scalars['Int']>
  offset: Maybe<Scalars['Int']>
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>> | Maybe<QlceViewAggregationInput>>
  isClusterOnly: Scalars['Boolean']
}>

export type FetchperspectiveGridQuery = {
  __typename?: 'Query'
  perspectiveGrid: Maybe<{
    __typename?: 'PerspectiveEntityStatsData'
    data: Maybe<
      Array<
        Maybe<{
          __typename?: 'QLCEViewEntityStatsDataPoint'
          name: Maybe<string>
          id: Maybe<string>
          cost: Maybe<any>
          costTrend: Maybe<any>
          clusterPerspective: Maybe<boolean>
          clusterData?: Maybe<{
            __typename?: 'ClusterData'
            appId: Maybe<string>
            appName: Maybe<string>
            avgCpuUtilization: Maybe<number>
            avgMemoryUtilization: Maybe<number>
            cloudProvider: Maybe<string>
            cloudProviderId: Maybe<string>
            cloudServiceName: Maybe<string>
            clusterId: Maybe<string>
            clusterName: Maybe<string>
            clusterType: Maybe<string>
            costTrend: Maybe<number>
            cpuBillingAmount: Maybe<number>
            cpuActualIdleCost: Maybe<number>
            cpuUnallocatedCost: Maybe<number>
            efficiencyScore: number
            efficiencyScoreTrendPercentage: number
            envId: Maybe<string>
            envName: Maybe<string>
            environment: Maybe<string>
            id: Maybe<string>
            idleCost: Maybe<number>
            launchType: Maybe<string>
            maxCpuUtilization: Maybe<number>
            maxMemoryUtilization: Maybe<number>
            memoryBillingAmount: Maybe<number>
            memoryActualIdleCost: Maybe<number>
            memoryUnallocatedCost: Maybe<number>
            name: Maybe<string>
            namespace: Maybe<string>
            networkCost: Maybe<number>
            prevBillingAmount: Maybe<number>
            region: Maybe<string>
            serviceId: Maybe<string>
            serviceName: Maybe<string>
            storageCost: Maybe<number>
            storageActualIdleCost: Maybe<number>
            storageRequest: Maybe<number>
            storageUnallocatedCost: Maybe<number>
            storageUtilizationValue: Maybe<number>
            totalCost: Maybe<number>
            trendType: Maybe<string>
            type: Maybe<string>
            unallocatedCost: Maybe<number>
            workloadName: Maybe<string>
            workloadType: Maybe<string>
          }>
          instanceDetails?: Maybe<{
            __typename?: 'InstanceDetails'
            name: Maybe<string>
            id: Maybe<string>
            nodeId: Maybe<string>
            clusterName: Maybe<string>
            clusterId: Maybe<string>
            nodePoolName: Maybe<string>
            cloudProviderInstanceId: Maybe<string>
            podCapacity: Maybe<string>
            totalCost: number
            idleCost: number
            systemCost: number
            unallocatedCost: number
            cpuAllocatable: number
            memoryAllocatable: number
            instanceCategory: Maybe<string>
            machineType: Maybe<string>
            createTime: any
            deleteTime: any
            memoryBillingAmount: number
            cpuBillingAmount: number
            memoryUnallocatedCost: number
            cpuUnallocatedCost: number
            memoryIdleCost: number
            cpuIdleCost: number
          }>
          storageDetails?: Maybe<{
            __typename?: 'StorageDetails'
            id: Maybe<string>
            instanceId: Maybe<string>
            instanceName: Maybe<string>
            claimName: Maybe<string>
            claimNamespace: Maybe<string>
            clusterName: Maybe<string>
            clusterId: Maybe<string>
            storageClass: Maybe<string>
            volumeType: Maybe<string>
            cloudProvider: Maybe<string>
            region: Maybe<string>
            storageCost: number
            storageActualIdleCost: number
            storageUnallocatedCost: number
            capacity: number
            storageRequest: number
            storageUtilizationValue: number
            createTime: any
            deleteTime: any
          }>
        }>
      >
    >
  }>
}

export type FetchPerspectiveListQueryVariables = Exact<{ [key: string]: never }>

export type FetchPerspectiveListQuery = {
  __typename?: 'Query'
  perspectives: Maybe<{
    __typename?: 'PerspectiveData'
    customerViews: Maybe<Array<Maybe<{ __typename?: 'QLCEView'; id: Maybe<string>; name: Maybe<string> }>>>
  }>
}

export type PerspectiveRecommendationsQueryVariables = Exact<{
  filter: Maybe<K8sRecommendationFilterDtoInput>
}>

export type PerspectiveRecommendationsQuery = {
  __typename?: 'Query'
  recommendationStatsV2: Maybe<{
    __typename?: 'RecommendationOverviewStats'
    totalMonthlyCost: number
    totalMonthlySaving: number
    count: number
  }>
  recommendationsV2: Maybe<{
    __typename?: 'RecommendationsDTO'
    items: Maybe<
      Array<
        Maybe<{
          __typename?: 'RecommendationItemDTO'
          clusterName: Maybe<string>
          namespace: Maybe<string>
          id: string
          resourceType: ResourceType
          resourceName: Maybe<string>
          monthlyCost: Maybe<number>
          monthlySaving: Maybe<number>
        }>
      >
    >
  }>
}

export type FetchPerspectiveDetailsSummaryQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>> | Maybe<QlceViewAggregationInput>>
  isClusterQuery: Maybe<Scalars['Boolean']>
}>

export type FetchPerspectiveDetailsSummaryQuery = {
  __typename?: 'Query'
  perspectiveTrendStats: Maybe<{
    __typename?: 'PerspectiveTrendStats'
    cost: Maybe<{
      __typename?: 'StatsInfo'
      statsDescription: string
      statsLabel: string
      statsTrend: Maybe<any>
      statsValue: string
      value: Maybe<any>
    }>
    idleCost: Maybe<{ __typename?: 'StatsInfo'; statsLabel: string; statsValue: string; value: Maybe<any> }>
    unallocatedCost: Maybe<{ __typename?: 'StatsInfo'; statsLabel: string; statsValue: string; value: Maybe<any> }>
    utilizedCost: Maybe<{ __typename?: 'StatsInfo'; statsLabel: string; statsValue: string; value: Maybe<any> }>
    efficiencyScoreStats: Maybe<{
      __typename?: 'EfficiencyScoreStats'
      statsLabel: Maybe<string>
      statsTrend: Maybe<any>
      statsValue: Maybe<string>
    }>
  }>
  perspectiveForecastCost: Maybe<{
    __typename?: 'PerspectiveTrendStats'
    cost: Maybe<{
      __typename?: 'StatsInfo'
      statsLabel: string
      statsTrend: Maybe<any>
      statsValue: string
      statsDescription: string
    }>
  }>
}

export type FetchPerspectiveDetailsSummaryWithBudgetQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>> | Maybe<QlceViewAggregationInput>>
  isClusterQuery: Maybe<Scalars['Boolean']>
}>

export type FetchPerspectiveDetailsSummaryWithBudgetQuery = {
  __typename?: 'Query'
  perspectiveTrendStats: Maybe<{
    __typename?: 'PerspectiveTrendStats'
    cost: Maybe<{
      __typename?: 'StatsInfo'
      statsDescription: string
      statsLabel: string
      statsTrend: Maybe<any>
      statsValue: string
      value: Maybe<any>
    }>
    idleCost: Maybe<{ __typename?: 'StatsInfo'; statsLabel: string; statsValue: string; value: Maybe<any> }>
    unallocatedCost: Maybe<{ __typename?: 'StatsInfo'; statsLabel: string; statsValue: string; value: Maybe<any> }>
    utilizedCost: Maybe<{ __typename?: 'StatsInfo'; statsLabel: string; statsValue: string; value: Maybe<any> }>
    efficiencyScoreStats: Maybe<{
      __typename?: 'EfficiencyScoreStats'
      statsLabel: Maybe<string>
      statsTrend: Maybe<any>
      statsValue: Maybe<string>
    }>
  }>
  perspectiveForecastCost: Maybe<{
    __typename?: 'PerspectiveTrendStats'
    cost: Maybe<{
      __typename?: 'StatsInfo'
      statsLabel: string
      statsTrend: Maybe<any>
      statsValue: string
      statsDescription: string
    }>
  }>
}

export type FetchPerspectiveTimeSeriesQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>> | Maybe<QlceViewGroupByInput>>
  limit: Maybe<Scalars['Int']>
}>

export type FetchPerspectiveTimeSeriesQuery = {
  __typename?: 'Query'
  perspectiveTimeSeriesStats: Maybe<{
    __typename?: 'PerspectiveTimeSeriesData'
    stats: Maybe<
      Array<
        Maybe<{
          __typename?: 'TimeSeriesDataPoints'
          time: any
          values: Array<
            Maybe<{
              __typename?: 'DataPoint'
              value: any
              key: { __typename?: 'Reference'; id: string; name: string; type: string }
            }>
          >
        }>
      >
    >
  }>
}

export type FetchPerspectiveTotalCountQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>> | Maybe<QlceViewGroupByInput>>
  isClusterQuery: Maybe<Scalars['Boolean']>
}>

export type FetchPerspectiveTotalCountQuery = { __typename?: 'Query'; perspectiveTotalCount: Maybe<number> }

export type FetchRecommendationQueryVariables = Exact<{
  id: Scalars['String']
  resourceType: ResourceType
  startTime: Scalars['OffsetDateTime']
  endTime: Scalars['OffsetDateTime']
}>

export type FetchRecommendationQuery = {
  __typename?: 'Query'
  recommendationStatsV2: Maybe<{
    __typename?: 'RecommendationOverviewStats'
    totalMonthlyCost: number
    totalMonthlySaving: number
  }>
  recommendationsV2: Maybe<{
    __typename?: 'RecommendationsDTO'
    items: Maybe<
      Array<
        Maybe<{
          __typename?: 'RecommendationItemDTO'
          clusterName: Maybe<string>
          namespace: Maybe<string>
          id: string
          resourceName: Maybe<string>
        }>
      >
    >
  }>
  recommendationDetails: Maybe<
    | {
        __typename?: 'NodeRecommendationDTO'
        id: Maybe<string>
        current: Maybe<{
          __typename?: 'RecommendationResponse'
          instanceCategory: Maybe<InstanceCategory>
          provider: Maybe<string>
          region: Maybe<string>
          service: Maybe<string>
          nodePools: Maybe<
            Array<
              Maybe<{
                __typename?: 'NodePool'
                sumNodes: Maybe<any>
                vm: Maybe<{
                  __typename?: 'VirtualMachine'
                  avgPrice: Maybe<number>
                  cpusPerVm: Maybe<number>
                  memPerVm: Maybe<number>
                  onDemandPrice: Maybe<number>
                  type: Maybe<string>
                }>
              }>
            >
          >
        }>
        nodePoolId: Maybe<{ __typename?: 'NodePoolId'; clusterid: string; nodepoolname: string }>
        recommended: Maybe<{
          __typename?: 'RecommendationResponse'
          instanceCategory: Maybe<InstanceCategory>
          provider: Maybe<string>
          region: Maybe<string>
          service: Maybe<string>
          accuracy: Maybe<{
            __typename?: 'ClusterRecommendationAccuracy'
            cpu: Maybe<number>
            masterPrice: Maybe<number>
            memory: Maybe<number>
            nodes: Maybe<any>
            spotNodes: Maybe<any>
            spotPrice: Maybe<number>
            totalPrice: Maybe<number>
            workerPrice: Maybe<number>
          }>
          nodePools: Maybe<
            Array<
              Maybe<{
                __typename?: 'NodePool'
                role: Maybe<string>
                sumNodes: Maybe<any>
                vmClass: Maybe<string>
                vm: Maybe<{
                  __typename?: 'VirtualMachine'
                  avgPrice: Maybe<number>
                  cpusPerVm: Maybe<number>
                  memPerVm: Maybe<number>
                  onDemandPrice: Maybe<number>
                  type: Maybe<string>
                }>
              }>
            >
          >
        }>
        resourceRequirement: Maybe<{
          __typename?: 'RecommendClusterRequest'
          allowBurst: Maybe<boolean>
          maxNodes: Maybe<any>
          minNodes: Maybe<any>
          onDemandPct: Maybe<any>
          sameSize: Maybe<boolean>
          sumCpu: Maybe<number>
          sumGpu: Maybe<any>
          sumMem: Maybe<number>
        }>
      }
    | {
        __typename?: 'WorkloadRecommendationDTO'
        containerRecommendations: Maybe<any>
        items: Maybe<
          Array<
            Maybe<{
              __typename?: 'ContainerHistogramDTO'
              containerName: Maybe<string>
              containerRecommendation: Maybe<{
                __typename?: 'ContainerRecommendation'
                numDays: number
                current: Maybe<{ __typename?: 'ResourceRequirement'; CPU: Maybe<string>; MEMORY: Maybe<string> }>
                lastDayCost: Maybe<{ __typename?: 'Cost'; cpu: Maybe<any>; memory: Maybe<any> }>
              }>
              cpuHistogram: Maybe<{
                __typename?: 'HistogramExp'
                bucketWeights: Maybe<Array<Maybe<number>>>
                firstBucketSize: number
                growthRatio: number
                maxBucket: number
                minBucket: number
                numBuckets: number
                precomputed: Maybe<Array<Maybe<number>>>
                totalWeight: number
              }>
              memoryHistogram: Maybe<{
                __typename?: 'HistogramExp'
                bucketWeights: Maybe<Array<Maybe<number>>>
                firstBucketSize: number
                growthRatio: number
                maxBucket: number
                minBucket: number
                numBuckets: number
                precomputed: Maybe<Array<Maybe<number>>>
                totalWeight: number
              }>
            }>
          >
        >
      }
  >
}

export type RecommendationFiltersQueryVariables = Exact<{ [key: string]: never }>

export type RecommendationFiltersQuery = {
  __typename?: 'Query'
  recommendationFilterStatsV2: Maybe<
    Array<Maybe<{ __typename?: 'FilterStatsDTO'; key: Maybe<string>; values: Maybe<Array<Maybe<string>>> }>>
  >
}

export type FetchViewFieldsQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
}>

export type FetchViewFieldsQuery = {
  __typename?: 'Query'
  perspectiveFields: Maybe<{
    __typename?: 'PerspectiveFieldsData'
    fieldIdentifierData: Maybe<
      Array<
        Maybe<{
          __typename?: 'QLCEViewFieldIdentifierData'
          identifier: ViewFieldIdentifier
          identifierName: string
          values: Array<
            Maybe<{
              __typename?: 'QLCEViewField'
              fieldId: string
              fieldName: string
              identifier: Maybe<ViewFieldIdentifier>
              identifierName: Maybe<string>
            }>
          >
        }>
      >
    >
  }>
}

export type FetchWorkloadGridQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
  isClusterQuery: Maybe<Scalars['Boolean']>
}>

export type FetchWorkloadGridQuery = {
  __typename?: 'Query'
  perspectiveGrid: Maybe<{
    __typename?: 'PerspectiveEntityStatsData'
    data: Maybe<
      Array<
        Maybe<{
          __typename?: 'QLCEViewEntityStatsDataPoint'
          id: Maybe<string>
          name: Maybe<string>
          cost: Maybe<any>
          costTrend: Maybe<any>
          clusterData: Maybe<{
            __typename?: 'InstanceDetails'
            name: Maybe<string>
            id: Maybe<string>
            nodeId: Maybe<string>
            namespace: Maybe<string>
            workload: Maybe<string>
            clusterName: Maybe<string>
            clusterId: Maybe<string>
            node: Maybe<string>
            nodePoolName: Maybe<string>
            cloudProviderInstanceId: Maybe<string>
            podCapacity: Maybe<string>
            totalCost: number
            idleCost: number
            systemCost: number
            networkCost: number
            unallocatedCost: number
            cpuAllocatable: number
            memoryAllocatable: number
            cpuRequested: number
            memoryRequested: number
            cpuUnitPrice: number
            memoryUnitPrice: number
            instanceCategory: Maybe<string>
            machineType: Maybe<string>
            createTime: any
            deleteTime: any
            qosClass: Maybe<string>
            memoryBillingAmount: number
            cpuBillingAmount: number
            storageUnallocatedCost: number
            memoryUnallocatedCost: number
            cpuUnallocatedCost: number
            memoryIdleCost: number
            cpuIdleCost: number
            storageCost: number
            storageActualIdleCost: number
            storageUtilizationValue: number
            storageRequest: number
          }>
        }>
      >
    >
  }>
}

export type FetchWorkloadSummaryQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
  isClusterQuery: Maybe<Scalars['Boolean']>
}>

export type FetchWorkloadSummaryQuery = {
  __typename?: 'Query'
  perspectiveTrendStats: Maybe<{
    __typename?: 'PerspectiveTrendStats'
    cost: Maybe<{
      __typename?: 'StatsInfo'
      statsLabel: string
      statsTrend: Maybe<any>
      statsValue: string
      statsDescription: string
    }>
    idleCost: Maybe<{
      __typename?: 'StatsInfo'
      statsLabel: string
      statsTrend: Maybe<any>
      statsValue: string
      statsDescription: string
    }>
    utilizedCost: Maybe<{
      __typename?: 'StatsInfo'
      statsLabel: string
      statsTrend: Maybe<any>
      statsValue: string
      statsDescription: string
    }>
  }>
  perspectiveGrid: Maybe<{
    __typename?: 'PerspectiveEntityStatsData'
    data: Maybe<
      Array<
        Maybe<{
          __typename?: 'QLCEViewEntityStatsDataPoint'
          clusterData: Maybe<{
            __typename?: 'ClusterData'
            workloadName: Maybe<string>
            workloadType: Maybe<string>
            namespace: Maybe<string>
            clusterName: Maybe<string>
          }>
        }>
      >
    >
  }>
}

export type FetchWorkloadTimeSeriesQueryVariables = Exact<{
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>> | Maybe<QlceViewFilterWrapperInput>>
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>> | Maybe<QlceViewAggregationInput>>
  isClusterQuery: Maybe<Scalars['Boolean']>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>> | Maybe<QlceViewGroupByInput>>
}>

export type FetchWorkloadTimeSeriesQuery = {
  __typename?: 'Query'
  perspectiveTimeSeriesStats: Maybe<{
    __typename?: 'PerspectiveTimeSeriesData'
    cpuLimit: Maybe<
      Array<
        Maybe<{
          __typename?: 'TimeSeriesDataPoints'
          time: any
          values: Array<
            Maybe<{ __typename?: 'DataPoint'; value: any; key: { __typename?: 'Reference'; name: string; id: string } }>
          >
        }>
      >
    >
    cpuRequest: Maybe<
      Array<
        Maybe<{
          __typename?: 'TimeSeriesDataPoints'
          time: any
          values: Array<
            Maybe<{ __typename?: 'DataPoint'; value: any; key: { __typename?: 'Reference'; name: string; id: string } }>
          >
        }>
      >
    >
    cpuUtilValues: Maybe<
      Array<
        Maybe<{
          __typename?: 'TimeSeriesDataPoints'
          time: any
          values: Array<
            Maybe<{ __typename?: 'DataPoint'; value: any; key: { __typename?: 'Reference'; name: string; id: string } }>
          >
        }>
      >
    >
    memoryLimit: Maybe<
      Array<
        Maybe<{
          __typename?: 'TimeSeriesDataPoints'
          time: any
          values: Array<
            Maybe<{ __typename?: 'DataPoint'; value: any; key: { __typename?: 'Reference'; name: string; id: string } }>
          >
        }>
      >
    >
    memoryRequest: Maybe<
      Array<
        Maybe<{
          __typename?: 'TimeSeriesDataPoints'
          time: any
          values: Array<
            Maybe<{ __typename?: 'DataPoint'; value: any; key: { __typename?: 'Reference'; name: string; id: string } }>
          >
        }>
      >
    >
    memoryUtilValues: Maybe<
      Array<
        Maybe<{
          __typename?: 'TimeSeriesDataPoints'
          time: any
          values: Array<
            Maybe<{ __typename?: 'DataPoint'; value: any; key: { __typename?: 'Reference'; name: string; id: string } }>
          >
        }>
      >
    >
  }>
}

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /** Built-in java.math.BigDecimal */
  BigDecimal: any
  /** Long type */
  Long: any
  /** Built-in scalar for map-like structures */
  Map_String_ContainerRecommendationScalar: any
  /** Built-in scalar for map-like structures */
  Map_String_ResourceRequirementScalar: any
  /** Built-in scalar for map-like structures */
  Map_String_StringScalar: any
  /** Built-in scalar representing a date-time with a UTC offset */
  OffsetDateTime: any
  /** Built-in scalar representing a time with a UTC offset */
  OffsetTime: any
  /** Use SPQR's SchemaPrinter to remove this from SDL */
  UNREPRESENTABLE: any
}

/** This union of all types of recommendations */
export type RecommendationDetails = NodeRecommendationDto | WorkloadRecommendationDto

export type AlertThreshold = {
  __typename?: 'AlertThreshold'
  alertsSent: Scalars['Int']
  basedOn: Maybe<AlertThresholdBase>
  crossedAt: Scalars['Long']
  emailAddresses: Maybe<Array<Maybe<Scalars['String']>>>
  percentage: Scalars['Float']
  slackWebhooks: Maybe<Array<Maybe<Scalars['String']>>>
  userGroupIds: Maybe<Array<Maybe<Scalars['String']>>>
}

export type AnomalyData = {
  __typename?: 'AnomalyData'
  actualAmount: Maybe<Scalars['Float']>
  anomalyScore: Maybe<Scalars['Float']>
  comment: Maybe<Scalars['String']>
  entity: Maybe<EntityInfo>
  expectedAmount: Maybe<Scalars['Float']>
  id: Maybe<Scalars['String']>
  time: Maybe<Scalars['Long']>
  userFeedback: Maybe<AnomalyFeedback>
}

export type AnomalyDataList = {
  __typename?: 'AnomalyDataList'
  data: Maybe<Array<Maybe<AnomalyData>>>
}

export type BillingData = {
  __typename?: 'BillingData'
  accountid: Maybe<Scalars['String']>
  actualidlecost: Maybe<Scalars['Float']>
  appid: Maybe<Scalars['String']>
  avgcpuutilization: Maybe<Scalars['Float']>
  avgcpuutilizationvalue: Maybe<Scalars['Float']>
  avgmemoryutilization: Maybe<Scalars['Float']>
  avgmemoryutilizationvalue: Maybe<Scalars['Float']>
  billingaccountid: Maybe<Scalars['String']>
  billingamount: Maybe<Scalars['Float']>
  cloudprovider: Maybe<Scalars['String']>
  cloudproviderid: Maybe<Scalars['String']>
  cloudservicename: Maybe<Scalars['String']>
  clusterid: Maybe<Scalars['String']>
  clustername: Maybe<Scalars['String']>
  clustertype: Maybe<Scalars['String']>
  cpuactualidlecost: Maybe<Scalars['Float']>
  cpubillingamount: Maybe<Scalars['Float']>
  cpuidlecost: Maybe<Scalars['Float']>
  cpulimit: Maybe<Scalars['Float']>
  cpurequest: Maybe<Scalars['Float']>
  cpusystemcost: Maybe<Scalars['Float']>
  cpuunallocatedcost: Maybe<Scalars['Float']>
  cpuunitseconds: Maybe<Scalars['Float']>
  endtime: Maybe<Scalars['OffsetDateTime']>
  envid: Maybe<Scalars['String']>
  idlecost: Maybe<Scalars['Float']>
  instanceid: Maybe<Scalars['String']>
  instancename: Maybe<Scalars['String']>
  instancetype: Maybe<Scalars['String']>
  launchtype: Maybe<Scalars['String']>
  maxcpuutilization: Maybe<Scalars['Float']>
  maxcpuutilizationvalue: Maybe<Scalars['Float']>
  maxmemoryutilization: Maybe<Scalars['Float']>
  maxmemoryutilizationvalue: Maybe<Scalars['Float']>
  maxstoragerequest: Maybe<Scalars['Float']>
  maxstorageutilizationvalue: Maybe<Scalars['Float']>
  memoryactualidlecost: Maybe<Scalars['Float']>
  memorybillingamount: Maybe<Scalars['Float']>
  memoryidlecost: Maybe<Scalars['Float']>
  memorylimit: Maybe<Scalars['Float']>
  memorymbseconds: Maybe<Scalars['Float']>
  memoryrequest: Maybe<Scalars['Float']>
  memorysystemcost: Maybe<Scalars['Float']>
  memoryunallocatedcost: Maybe<Scalars['Float']>
  namespace: Maybe<Scalars['String']>
  networkcost: Maybe<Scalars['Float']>
  parentinstanceid: Maybe<Scalars['String']>
  pricingsource: Maybe<Scalars['String']>
  region: Maybe<Scalars['String']>
  serviceid: Maybe<Scalars['String']>
  settingid: Maybe<Scalars['String']>
  starttime: Maybe<Scalars['OffsetDateTime']>
  storageactualidlecost: Maybe<Scalars['Float']>
  storagecost: Maybe<Scalars['Float']>
  storagembseconds: Maybe<Scalars['Float']>
  storagerequest: Maybe<Scalars['Float']>
  storageunallocatedcost: Maybe<Scalars['Float']>
  storageutilizationvalue: Maybe<Scalars['Float']>
  systemcost: Maybe<Scalars['Float']>
  taskid: Maybe<Scalars['String']>
  unallocatedcost: Maybe<Scalars['Float']>
  usagedurationseconds: Maybe<Scalars['Float']>
  workloadname: Maybe<Scalars['String']>
  workloadtype: Maybe<Scalars['String']>
}

export type BillingDataDemo = {
  __typename?: 'BillingDataDemo'
  billingamount: Maybe<Scalars['Float']>
  instancedata: Maybe<InstanceDataDemo>
  instanceid: Maybe<Scalars['String']>
  instancename: Maybe<Scalars['String']>
  starttime: Maybe<Scalars['Long']>
}

export type BudgetCostData = {
  __typename?: 'BudgetCostData'
  actualCost: Scalars['Float']
  budgetVariance: Scalars['Float']
  budgetVariancePercentage: Scalars['Float']
  budgeted: Scalars['Float']
  endTime: Scalars['Long']
  time: Scalars['Long']
}

export type BudgetData = {
  __typename?: 'BudgetData'
  costData: Maybe<Array<Maybe<BudgetCostData>>>
  forecastCost: Scalars['Float']
}

export type BudgetSummary = {
  __typename?: 'BudgetSummary'
  actualCost: Scalars['Float']
  actualCostAlerts: Array<Maybe<Scalars['Float']>>
  alertThresholds: Maybe<Array<Maybe<AlertThreshold>>>
  budgetAmount: Scalars['Float']
  forecastCost: Scalars['Float']
  forecastCostAlerts: Array<Maybe<Scalars['Float']>>
  growthRate: Scalars['Float']
  id: Scalars['String']
  name: Scalars['String']
  period: BudgetPeriod
  perspectiveId: Scalars['String']
  perspectiveName: Scalars['String']
  startTime: Scalars['Long']
  timeLeft: Scalars['Int']
  timeScope: Scalars['String']
  timeUnit: Scalars['String']
  type: BudgetType
}

export type CcmMetaData = {
  __typename?: 'CCMMetaData'
  applicationDataPresent: Scalars['Boolean']
  awsConnectorsPresent: Scalars['Boolean']
  azureConnectorsPresent: Scalars['Boolean']
  cloudDataPresent: Scalars['Boolean']
  clusterDataPresent: Scalars['Boolean']
  defaultAwsPerspectiveId: Maybe<Scalars['String']>
  defaultAzurePerspectiveId: Maybe<Scalars['String']>
  defaultClusterPerspectiveId: Maybe<Scalars['String']>
  defaultGcpPerspectiveId: Maybe<Scalars['String']>
  gcpConnectorsPresent: Scalars['Boolean']
  inventoryDataPresent: Scalars['Boolean']
  isSampleClusterPresent: Scalars['Boolean']
  k8sClusterConnectorPresent: Scalars['Boolean']
}

export type ClusterData = {
  __typename?: 'ClusterData'
  appId: Maybe<Scalars['String']>
  appName: Maybe<Scalars['String']>
  avgCpuUtilization: Maybe<Scalars['Float']>
  avgMemoryUtilization: Maybe<Scalars['Float']>
  cloudProvider: Maybe<Scalars['String']>
  cloudProviderId: Maybe<Scalars['String']>
  cloudServiceName: Maybe<Scalars['String']>
  clusterId: Maybe<Scalars['String']>
  clusterName: Maybe<Scalars['String']>
  clusterType: Maybe<Scalars['String']>
  costTrend: Maybe<Scalars['Float']>
  cpuActualIdleCost: Maybe<Scalars['Float']>
  cpuBillingAmount: Maybe<Scalars['Float']>
  cpuIdleCost: Maybe<Scalars['Float']>
  cpuUnallocatedCost: Maybe<Scalars['Float']>
  efficiencyScore: Scalars['Int']
  efficiencyScoreTrendPercentage: Scalars['Int']
  envId: Maybe<Scalars['String']>
  envName: Maybe<Scalars['String']>
  environment: Maybe<Scalars['String']>
  id: Maybe<Scalars['String']>
  idleCost: Maybe<Scalars['Float']>
  instanceId: Maybe<Scalars['String']>
  instanceName: Maybe<Scalars['String']>
  instanceType: Maybe<Scalars['String']>
  launchType: Maybe<Scalars['String']>
  maxCpuUtilization: Maybe<Scalars['Float']>
  maxMemoryUtilization: Maybe<Scalars['Float']>
  memoryActualIdleCost: Maybe<Scalars['Float']>
  memoryBillingAmount: Maybe<Scalars['Float']>
  memoryIdleCost: Maybe<Scalars['Float']>
  memoryUnallocatedCost: Maybe<Scalars['Float']>
  name: Maybe<Scalars['String']>
  namespace: Maybe<Scalars['String']>
  networkCost: Maybe<Scalars['Float']>
  prevBillingAmount: Maybe<Scalars['Float']>
  region: Maybe<Scalars['String']>
  serviceId: Maybe<Scalars['String']>
  serviceName: Maybe<Scalars['String']>
  storageActualIdleCost: Maybe<Scalars['Float']>
  storageCost: Maybe<Scalars['Float']>
  storageRequest: Maybe<Scalars['Float']>
  storageUnallocatedCost: Maybe<Scalars['Float']>
  storageUtilizationValue: Maybe<Scalars['Float']>
  systemCost: Maybe<Scalars['Float']>
  taskId: Maybe<Scalars['String']>
  totalCost: Maybe<Scalars['Float']>
  trendType: Maybe<Scalars['String']>
  type: Maybe<Scalars['String']>
  unallocatedCost: Maybe<Scalars['Float']>
  workloadName: Maybe<Scalars['String']>
  workloadType: Maybe<Scalars['String']>
}

export type ClusterRecommendationAccuracy = {
  __typename?: 'ClusterRecommendationAccuracy'
  cpu: Maybe<Scalars['Float']>
  masterPrice: Maybe<Scalars['Float']>
  memory: Maybe<Scalars['Float']>
  nodes: Maybe<Scalars['Long']>
  regularNodes: Maybe<Scalars['Long']>
  regularPrice: Maybe<Scalars['Float']>
  spotNodes: Maybe<Scalars['Long']>
  spotPrice: Maybe<Scalars['Float']>
  totalPrice: Maybe<Scalars['Float']>
  workerPrice: Maybe<Scalars['Float']>
  zone: Maybe<Scalars['String']>
}

export type ContainerHistogramDto = {
  __typename?: 'ContainerHistogramDTO'
  containerName: Maybe<Scalars['String']>
  containerRecommendation: Maybe<ContainerRecommendation>
  cpuHistogram: Maybe<HistogramExp>
  memoryHistogram: Maybe<HistogramExp>
}

export type ContainerRecommendation = {
  __typename?: 'ContainerRecommendation'
  burstable: Maybe<ResourceRequirement>
  current: Maybe<ResourceRequirement>
  guaranteed: Maybe<ResourceRequirement>
  lastDayCost: Maybe<Cost>
  numDays: Scalars['Int']
  percentileBased: Maybe<Scalars['Map_String_ResourceRequirementScalar']>
  recommended: Maybe<ResourceRequirement>
  totalSamplesCount: Scalars['Int']
}

export type Cost = {
  __typename?: 'Cost'
  cpu: Maybe<Scalars['BigDecimal']>
  memory: Maybe<Scalars['BigDecimal']>
}

export type DataPoint = {
  __typename?: 'DataPoint'
  key: Reference
  value: Scalars['BigDecimal']
}

export type EfficiencyScoreStats = {
  __typename?: 'EfficiencyScoreStats'
  statsLabel: Maybe<Scalars['String']>
  statsTrend: Maybe<Scalars['BigDecimal']>
  statsValue: Maybe<Scalars['String']>
}

export type EntityInfo = {
  __typename?: 'EntityInfo'
  awsAccount: Maybe<Scalars['String']>
  awsService: Maybe<Scalars['String']>
  clusterId: Maybe<Scalars['String']>
  clusterName: Maybe<Scalars['String']>
  gcpProduct: Maybe<Scalars['String']>
  gcpProject: Maybe<Scalars['String']>
  gcpSKUDescription: Maybe<Scalars['String']>
  gcpSKUId: Maybe<Scalars['String']>
  namespace: Maybe<Scalars['String']>
  workloadName: Maybe<Scalars['String']>
  workloadType: Maybe<Scalars['String']>
}

export type FilterStatsDto = {
  __typename?: 'FilterStatsDTO'
  key: Maybe<Scalars['String']>
  values: Maybe<Array<Maybe<Scalars['String']>>>
}

export type HistogramExp = {
  __typename?: 'HistogramExp'
  bucketWeights: Maybe<Array<Maybe<Scalars['Float']>>>
  firstBucketSize: Scalars['Float']
  growthRatio: Scalars['Float']
  maxBucket: Scalars['Int']
  minBucket: Scalars['Int']
  numBuckets: Scalars['Int']
  precomputed: Maybe<Array<Maybe<Scalars['Float']>>>
  totalWeight: Scalars['Float']
}

export type InstanceDataDemo = {
  __typename?: 'InstanceDataDemo'
  cloudprovider: Maybe<Scalars['String']>
  instancetype: Maybe<Scalars['String']>
  region: Maybe<Scalars['String']>
}

export type InstanceDetails = {
  __typename?: 'InstanceDetails'
  cloudProviderInstanceId: Maybe<Scalars['String']>
  clusterId: Maybe<Scalars['String']>
  clusterName: Maybe<Scalars['String']>
  cpuAllocatable: Scalars['Float']
  cpuBillingAmount: Scalars['Float']
  cpuIdleCost: Scalars['Float']
  cpuRequested: Scalars['Float']
  cpuUnallocatedCost: Scalars['Float']
  cpuUnitPrice: Scalars['Float']
  createTime: Scalars['Long']
  deleteTime: Scalars['Long']
  id: Maybe<Scalars['String']>
  idleCost: Scalars['Float']
  instanceCategory: Maybe<Scalars['String']>
  machineType: Maybe<Scalars['String']>
  memoryAllocatable: Scalars['Float']
  memoryBillingAmount: Scalars['Float']
  memoryIdleCost: Scalars['Float']
  memoryRequested: Scalars['Float']
  memoryUnallocatedCost: Scalars['Float']
  memoryUnitPrice: Scalars['Float']
  name: Maybe<Scalars['String']>
  namespace: Maybe<Scalars['String']>
  networkCost: Scalars['Float']
  node: Maybe<Scalars['String']>
  nodeId: Maybe<Scalars['String']>
  nodePoolName: Maybe<Scalars['String']>
  podCapacity: Maybe<Scalars['String']>
  qosClass: Maybe<Scalars['String']>
  storageActualIdleCost: Scalars['Float']
  storageCost: Scalars['Float']
  storageRequest: Scalars['Float']
  storageUnallocatedCost: Scalars['Float']
  storageUtilizationValue: Scalars['Float']
  systemCost: Scalars['Float']
  totalCost: Scalars['Float']
  unallocatedCost: Scalars['Float']
  workload: Maybe<Scalars['String']>
}

export type NodePool = {
  __typename?: 'NodePool'
  role: Maybe<Scalars['String']>
  sumNodes: Maybe<Scalars['Long']>
  vm: Maybe<VirtualMachine>
  vmClass: Maybe<Scalars['String']>
}

export type NodePoolId = {
  __typename?: 'NodePoolId'
  clusterid: Scalars['String']
  nodepoolname: Scalars['String']
}

export type NodeRecommendationDto = {
  __typename?: 'NodeRecommendationDTO'
  current: Maybe<RecommendationResponse>
  id: Maybe<Scalars['String']>
  nodePoolId: Maybe<NodePoolId>
  recommended: Maybe<RecommendationResponse>
  resourceRequirement: Maybe<RecommendClusterRequest>
}

export type PerspectiveData = {
  __typename?: 'PerspectiveData'
  customerViews: Maybe<Array<Maybe<QlceView>>>
  sampleViews: Maybe<Array<Maybe<QlceView>>>
}

export type PerspectiveEntityStatsData = {
  __typename?: 'PerspectiveEntityStatsData'
  data: Maybe<Array<Maybe<QlceViewEntityStatsDataPoint>>>
}

export type PerspectiveFieldsData = {
  __typename?: 'PerspectiveFieldsData'
  fieldIdentifierData: Maybe<Array<Maybe<QlceViewFieldIdentifierData>>>
}

export type PerspectiveFilterData = {
  __typename?: 'PerspectiveFilterData'
  values: Maybe<Array<Maybe<Scalars['String']>>>
}

export type PerspectiveOverviewStatsData = {
  __typename?: 'PerspectiveOverviewStatsData'
  isAwsOrGcpOrClusterConfigured: Maybe<Scalars['Boolean']>
  unifiedTableDataPresent: Maybe<Scalars['Boolean']>
}

export type PerspectiveTimeSeriesData = {
  __typename?: 'PerspectiveTimeSeriesData'
  cpuLimit: Maybe<Array<Maybe<TimeSeriesDataPoints>>>
  cpuRequest: Maybe<Array<Maybe<TimeSeriesDataPoints>>>
  cpuUtilValues: Maybe<Array<Maybe<TimeSeriesDataPoints>>>
  memoryLimit: Maybe<Array<Maybe<TimeSeriesDataPoints>>>
  memoryRequest: Maybe<Array<Maybe<TimeSeriesDataPoints>>>
  memoryUtilValues: Maybe<Array<Maybe<TimeSeriesDataPoints>>>
  stats: Maybe<Array<Maybe<TimeSeriesDataPoints>>>
}

export type PerspectiveTrendStats = {
  __typename?: 'PerspectiveTrendStats'
  cost: Maybe<StatsInfo>
  efficiencyScoreStats: Maybe<EfficiencyScoreStats>
  idleCost: Maybe<StatsInfo>
  systemCost: Maybe<StatsInfo>
  unallocatedCost: Maybe<StatsInfo>
  utilizedCost: Maybe<StatsInfo>
}

export type QlceView = {
  __typename?: 'QLCEView'
  chartType: Maybe<ViewChartType>
  createdAt: Maybe<Scalars['Long']>
  createdBy: Maybe<Scalars['String']>
  dataSources: Maybe<Array<Maybe<ViewFieldIdentifier>>>
  groupBy: Maybe<QlceViewField>
  id: Maybe<Scalars['String']>
  lastUpdatedAt: Maybe<Scalars['Long']>
  name: Maybe<Scalars['String']>
  reportScheduledConfigured: Scalars['Boolean']
  timeRange: Maybe<ViewTimeRangeType>
  totalCost: Scalars['Float']
  viewState: Maybe<ViewState>
  viewType: Maybe<ViewType>
}

export type QlceViewEntityStatsDataPoint = {
  __typename?: 'QLCEViewEntityStatsDataPoint'
  clusterData: Maybe<ClusterData>
  clusterPerspective: Scalars['Boolean']
  cost: Maybe<Scalars['BigDecimal']>
  costTrend: Maybe<Scalars['BigDecimal']>
  id: Maybe<Scalars['String']>
  instanceDetails: Maybe<InstanceDetails>
  name: Maybe<Scalars['String']>
  pricingSource: Maybe<Scalars['String']>
  storageDetails: Maybe<StorageDetails>
}

export type QlceViewField = {
  __typename?: 'QLCEViewField'
  fieldId: Scalars['String']
  fieldName: Scalars['String']
  identifier: Maybe<ViewFieldIdentifier>
  identifierName: Maybe<Scalars['String']>
}

export type QlceViewFieldIdentifierData = {
  __typename?: 'QLCEViewFieldIdentifierData'
  identifier: ViewFieldIdentifier
  identifierName: Scalars['String']
  values: Array<Maybe<QlceViewField>>
}

/** Query root */
export type Query = {
  __typename?: 'Query'
  /** Get Anomalies for perspective */
  anomaliesForPerspective: Maybe<AnomalyDataList>
  billingData: Maybe<Array<Maybe<BillingData>>>
  billingJobLastProcessedTime: Maybe<Scalars['Long']>
  billingdata: Maybe<Array<Maybe<BillingDataDemo>>>
  /** Budget cost data */
  budgetCostData: Maybe<BudgetData>
  /** Budget List */
  budgetList: Maybe<Array<Maybe<BudgetSummary>>>
  /** Budget card for perspectives */
  budgetSummary: Maybe<BudgetSummary>
  /** List of budget cards for perspectives */
  budgetSummaryList: Maybe<Array<Maybe<BudgetSummary>>>
  /** Fetch CCM MetaData for account */
  ccmMetaData: Maybe<CcmMetaData>
  instancedata: Maybe<InstanceDataDemo>
  nodeRecommendationRequest: Maybe<RecommendClusterRequest>
  /** Table for perspective */
  overviewTimeSeriesStats: Maybe<PerspectiveTimeSeriesData>
  /** Fields for perspective explorer */
  perspectiveFields: Maybe<PerspectiveFieldsData>
  /** Filter values for perspective */
  perspectiveFilters: Maybe<PerspectiveFilterData>
  /** Forecast cost for perspective */
  perspectiveForecastCost: Maybe<PerspectiveTrendStats>
  /** Table for perspective */
  perspectiveGrid: Maybe<PerspectiveEntityStatsData>
  /** Overview stats for perspective */
  perspectiveOverviewStats: Maybe<PerspectiveOverviewStatsData>
  /** Table for perspective */
  perspectiveTimeSeriesStats: Maybe<PerspectiveTimeSeriesData>
  /** Get total count of rows for query */
  perspectiveTotalCount: Maybe<Scalars['Int']>
  /** Trend stats for perspective */
  perspectiveTrendStats: Maybe<PerspectiveTrendStats>
  /** Fetch perspectives for account */
  perspectives: Maybe<PerspectiveData>
  /** recommendation details/drillDown */
  recommendationDetails: Maybe<RecommendationDetails>
  /** Possible filter values for each key */
  recommendationFilterStatsV2: Maybe<Array<Maybe<FilterStatsDto>>>
  /** Top panel stats API, aggregated */
  recommendationStatsV2: Maybe<RecommendationOverviewStats>
  /** The list of all types of recommendations for overview page */
  recommendationsV2: Maybe<RecommendationsDto>
}

/** Query root */
export type QueryAnomaliesForPerspectiveArgs = {
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>>>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>>>
}

/** Query root */
export type QueryBillingDataArgs = {
  request: Maybe<GridRequestInput>
}

/** Query root */
export type QueryBillingdataArgs = {
  clusterid: Maybe<Scalars['String']>
  endTime: Maybe<Scalars['OffsetTime']>
  startTime: Maybe<Scalars['OffsetTime']>
}

/** Query root */
export type QueryBudgetCostDataArgs = {
  budgetId?: Maybe<Scalars['String']>
}

/** Query root */
export type QueryBudgetListArgs = {
  fetchOnlyPerspectiveBudgets?: Maybe<Scalars['Boolean']>
  limit?: Maybe<Scalars['Int']>
  offset?: Maybe<Scalars['Int']>
}

/** Query root */
export type QueryBudgetSummaryArgs = {
  budgetId: Maybe<Scalars['String']>
  perspectiveId: Maybe<Scalars['String']>
}

/** Query root */
export type QueryBudgetSummaryListArgs = {
  perspectiveId: Maybe<Scalars['String']>
}

/** Query root */
export type QueryInstancedataArgs = {
  instanceid: Scalars['String']
}

/** Query root */
export type QueryNodeRecommendationRequestArgs = {
  endTime: Maybe<Scalars['OffsetDateTime']>
  nodePoolId: NodePoolIdInput
  startTime: Maybe<Scalars['OffsetDateTime']>
}

/** Query root */
export type QueryOverviewTimeSeriesStatsArgs = {
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>>>
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>>>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>>>
}

/** Query root */
export type QueryPerspectiveFieldsArgs = {
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>>>
}

/** Query root */
export type QueryPerspectiveFiltersArgs = {
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>>>
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>>>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>>>
  isClusterQuery: Maybe<Scalars['Boolean']>
  limit: Maybe<Scalars['Int']>
  offset: Maybe<Scalars['Int']>
  sortCriteria: Maybe<Array<Maybe<QlceViewSortCriteriaInput>>>
}

/** Query root */
export type QueryPerspectiveForecastCostArgs = {
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>>>
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>>>
  isClusterQuery: Maybe<Scalars['Boolean']>
}

/** Query root */
export type QueryPerspectiveGridArgs = {
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>>>
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>>>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>>>
  isClusterQuery: Maybe<Scalars['Boolean']>
  limit: Maybe<Scalars['Int']>
  offset: Maybe<Scalars['Int']>
  skipRoundOff: Maybe<Scalars['Boolean']>
  sortCriteria: Maybe<Array<Maybe<QlceViewSortCriteriaInput>>>
}

/** Query root */
export type QueryPerspectiveTimeSeriesStatsArgs = {
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>>>
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>>>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>>>
  includeOthers: Scalars['Boolean']
  isClusterQuery: Maybe<Scalars['Boolean']>
  limit: Maybe<Scalars['Int']>
  offset: Maybe<Scalars['Int']>
  sortCriteria: Maybe<Array<Maybe<QlceViewSortCriteriaInput>>>
}

/** Query root */
export type QueryPerspectiveTotalCountArgs = {
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>>>
  groupBy: Maybe<Array<Maybe<QlceViewGroupByInput>>>
  isClusterQuery: Maybe<Scalars['Boolean']>
}

/** Query root */
export type QueryPerspectiveTrendStatsArgs = {
  aggregateFunction: Maybe<Array<Maybe<QlceViewAggregationInput>>>
  filters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>>>
  isClusterQuery: Maybe<Scalars['Boolean']>
}

/** Query root */
export type QueryRecommendationDetailsArgs = {
  endTime: Maybe<Scalars['OffsetDateTime']>
  id: Scalars['String']
  resourceType: ResourceType
  startTime: Maybe<Scalars['OffsetDateTime']>
}

/** Query root */
export type QueryRecommendationFilterStatsV2Args = {
  filter?: Maybe<K8sRecommendationFilterDtoInput>
  keys?: Maybe<Array<Maybe<Scalars['String']>>>
}

/** Query root */
export type QueryRecommendationStatsV2Args = {
  filter?: Maybe<K8sRecommendationFilterDtoInput>
}

/** Query root */
export type QueryRecommendationsV2Args = {
  filter?: Maybe<K8sRecommendationFilterDtoInput>
}

export type RecommendClusterRequest = {
  __typename?: 'RecommendClusterRequest'
  allowBurst: Maybe<Scalars['Boolean']>
  allowOlderGen: Maybe<Scalars['Boolean']>
  category: Maybe<Array<Maybe<Scalars['String']>>>
  excludes: Maybe<Array<Maybe<Scalars['String']>>>
  includes: Maybe<Array<Maybe<Scalars['String']>>>
  maxNodes: Maybe<Scalars['Long']>
  minNodes: Maybe<Scalars['Long']>
  networkPerf: Maybe<Array<Maybe<Scalars['String']>>>
  onDemandPct: Maybe<Scalars['Long']>
  sameSize: Maybe<Scalars['Boolean']>
  sumCpu: Maybe<Scalars['Float']>
  sumGpu: Maybe<Scalars['Long']>
  sumMem: Maybe<Scalars['Float']>
  zone: Maybe<Scalars['String']>
}

export type RecommendationItemDto = {
  __typename?: 'RecommendationItemDTO'
  clusterName: Maybe<Scalars['String']>
  id: Scalars['String']
  monthlyCost: Maybe<Scalars['Float']>
  monthlySaving: Maybe<Scalars['Float']>
  namespace: Maybe<Scalars['String']>
  /** recommendation details/drillDown */
  recommendationDetails: Maybe<RecommendationDetails>
  resourceName: Maybe<Scalars['String']>
  resourceType: ResourceType
}

export type RecommendationItemDtoRecommendationDetailsArgs = {
  endTime: Maybe<Scalars['OffsetDateTime']>
  startTime: Maybe<Scalars['OffsetDateTime']>
}

export type RecommendationOverviewStats = {
  __typename?: 'RecommendationOverviewStats'
  /** generic count query RecommendationOverviewStats context */
  count: Scalars['Int']
  totalMonthlyCost: Scalars['Float']
  totalMonthlySaving: Scalars['Float']
}

export type RecommendationResponse = {
  __typename?: 'RecommendationResponse'
  accuracy: Maybe<ClusterRecommendationAccuracy>
  instanceCategory: Maybe<InstanceCategory>
  nodePools: Maybe<Array<Maybe<NodePool>>>
  provider: Maybe<Scalars['String']>
  region: Maybe<Scalars['String']>
  service: Maybe<Scalars['String']>
  zone: Maybe<Scalars['String']>
}

export type RecommendationsDto = {
  __typename?: 'RecommendationsDTO'
  /** generic count query RecommendationsDTO context */
  count: Scalars['Int']
  items: Maybe<Array<Maybe<RecommendationItemDto>>>
  limit: Scalars['Long']
  offset: Scalars['Long']
}

export type Reference = {
  __typename?: 'Reference'
  id: Scalars['String']
  name: Scalars['String']
  type: Scalars['String']
}

export type ResourceRequirement = {
  __typename?: 'ResourceRequirement'
  CPU: Maybe<Scalars['String']>
  MEMORY: Maybe<Scalars['String']>
  empty: Scalars['Boolean']
  limits: Maybe<Scalars['Map_String_StringScalar']>
  requests: Maybe<Scalars['Map_String_StringScalar']>
}

export type StatsInfo = {
  __typename?: 'StatsInfo'
  statsDescription: Scalars['String']
  statsLabel: Scalars['String']
  statsTrend: Maybe<Scalars['BigDecimal']>
  statsValue: Scalars['String']
  value: Maybe<Scalars['BigDecimal']>
}

export type StorageDetails = {
  __typename?: 'StorageDetails'
  capacity: Scalars['Float']
  claimName: Maybe<Scalars['String']>
  claimNamespace: Maybe<Scalars['String']>
  cloudProvider: Maybe<Scalars['String']>
  clusterId: Maybe<Scalars['String']>
  clusterName: Maybe<Scalars['String']>
  createTime: Scalars['Long']
  deleteTime: Scalars['Long']
  id: Maybe<Scalars['String']>
  instanceId: Maybe<Scalars['String']>
  instanceName: Maybe<Scalars['String']>
  region: Maybe<Scalars['String']>
  storageActualIdleCost: Scalars['Float']
  storageClass: Maybe<Scalars['String']>
  storageCost: Scalars['Float']
  storageRequest: Scalars['Float']
  storageUnallocatedCost: Scalars['Float']
  storageUtilizationValue: Scalars['Float']
  volumeType: Maybe<Scalars['String']>
}

export type TimeSeriesDataPoints = {
  __typename?: 'TimeSeriesDataPoints'
  time: Scalars['Long']
  values: Array<Maybe<DataPoint>>
}

export type VirtualMachine = {
  __typename?: 'VirtualMachine'
  allocatableCpusPerVm: Maybe<Scalars['Float']>
  allocatableMemPerVm: Maybe<Scalars['Float']>
  avgPrice: Maybe<Scalars['Float']>
  burst: Maybe<Scalars['Boolean']>
  category: Maybe<Scalars['String']>
  cpusPerVm: Maybe<Scalars['Float']>
  currentGen: Maybe<Scalars['Boolean']>
  gpusPerVm: Maybe<Scalars['Float']>
  memPerVm: Maybe<Scalars['Float']>
  networkPerf: Maybe<Scalars['String']>
  networkPerfCategory: Maybe<Scalars['String']>
  onDemandPrice: Maybe<Scalars['Float']>
  type: Maybe<Scalars['String']>
  zones: Maybe<Array<Maybe<Scalars['String']>>>
}

export type WorkloadRecommendationDto = {
  __typename?: 'WorkloadRecommendationDTO'
  /**
   * use items.containerRecommendation
   * @deprecated Field no longer supported
   */
  containerRecommendations: Maybe<Scalars['Map_String_ContainerRecommendationScalar']>
  id: Maybe<Scalars['String']>
  items: Maybe<Array<Maybe<ContainerHistogramDto>>>
  lastDayCost: Maybe<Cost>
}

export enum AggregationOperation {
  Avg = 'AVG',
  Count = 'COUNT',
  Max = 'MAX',
  Min = 'MIN',
  Sum = 'SUM'
}

export enum AlertThresholdBase {
  ActualCost = 'ACTUAL_COST',
  ForecastedCost = 'FORECASTED_COST'
}

export enum AnomalyFeedback {
  FalseAnomaly = 'FALSE_ANOMALY',
  NotResponded = 'NOT_RESPONDED',
  TrueAnomaly = 'TRUE_ANOMALY'
}

export enum BudgetPeriod {
  Daily = 'DAILY',
  Monthly = 'MONTHLY',
  Quarterly = 'QUARTERLY',
  Weekly = 'WEEKLY',
  Yearly = 'YEARLY'
}

export enum BudgetType {
  PreviousMonthSpend = 'PREVIOUS_MONTH_SPEND',
  PreviousPeriodSpend = 'PREVIOUS_PERIOD_SPEND',
  SpecifiedAmount = 'SPECIFIED_AMOUNT'
}

export enum FilterOperator {
  Equals = 'EQUALS',
  GreaterOrEquals = 'GREATER_OR_EQUALS',
  In = 'IN',
  LessOrEquals = 'LESS_OR_EQUALS',
  Like = 'LIKE',
  NotEquals = 'NOT_EQUALS',
  NotIn = 'NOT_IN',
  NotNull = 'NOT_NULL',
  TimeAfter = 'TIME_AFTER',
  TimeBefore = 'TIME_BEFORE'
}

export enum InstanceCategory {
  OnDemand = 'ON_DEMAND',
  Reserved = 'RESERVED',
  Spot = 'SPOT'
}

export enum QlceSortOrder {
  Ascending = 'ASCENDING',
  Descending = 'DESCENDING'
}

export enum QlceViewAggregateOperation {
  Avg = 'AVG',
  Max = 'MAX',
  Min = 'MIN',
  Sum = 'SUM'
}

export enum QlceViewFilterOperator {
  Equals = 'EQUALS',
  In = 'IN',
  Like = 'LIKE',
  NotIn = 'NOT_IN',
  NotNull = 'NOT_NULL',
  Null = 'NULL'
}

export enum QlceViewSortType {
  ClusterCost = 'CLUSTER_COST',
  Cost = 'COST',
  Time = 'TIME'
}

export enum QlceViewTimeFilterOperator {
  After = 'AFTER',
  Before = 'BEFORE'
}

export enum QlceViewTimeGroupType {
  Day = 'DAY',
  Hour = 'HOUR',
  Month = 'MONTH',
  Quarter = 'QUARTER',
  Week = 'WEEK',
  Year = 'YEAR'
}

export enum ResourceType {
  NodePool = 'NODE_POOL',
  Workload = 'WORKLOAD'
}

export enum SortOrder {
  Asc = 'ASC',
  Ascending = 'ASCENDING',
  Desc = 'DESC',
  Descending = 'DESCENDING'
}

export enum ViewChartType {
  StackedLineChart = 'STACKED_LINE_CHART',
  StackedTimeSeries = 'STACKED_TIME_SERIES'
}

export enum ViewFieldIdentifier {
  Aws = 'AWS',
  Azure = 'AZURE',
  BusinessMapping = 'BUSINESS_MAPPING',
  Cluster = 'CLUSTER',
  Common = 'COMMON',
  Custom = 'CUSTOM',
  Gcp = 'GCP',
  Label = 'LABEL'
}

export enum ViewState {
  Completed = 'COMPLETED',
  Draft = 'DRAFT'
}

export enum ViewTimeRangeType {
  CurrentMonth = 'CURRENT_MONTH',
  Custom = 'CUSTOM',
  Last_30 = 'LAST_30',
  Last_7 = 'LAST_7',
  LastMonth = 'LAST_MONTH'
}

export enum ViewType {
  Customer = 'CUSTOMER',
  Default = 'DEFAULT',
  DefaultAzure = 'DEFAULT_AZURE',
  Sample = 'SAMPLE'
}

export type FieldAggregationInput = {
  field: Maybe<Scalars['String']>
  operation: Maybe<AggregationOperation>
}

export type FieldFilterInput = {
  field: Maybe<Scalars['String']>
  operator: Maybe<FilterOperator>
  values: Maybe<Array<Maybe<Scalars['String']>>>
}

export type GridRequestInput = {
  aggregate: Maybe<Array<Maybe<FieldAggregationInput>>>
  entity: Maybe<Scalars['String']>
  groupBy: Maybe<Array<Maybe<Scalars['String']>>>
  having: Maybe<Array<Maybe<FieldFilterInput>>>
  limit: Maybe<Scalars['Int']>
  offset: Maybe<Scalars['Int']>
  orderBy: Maybe<Array<Maybe<SortCriteriaInput>>>
  where: Maybe<Array<Maybe<FieldFilterInput>>>
}

export type K8sRecommendationFilterDtoInput = {
  clusterNames: Maybe<Array<Maybe<Scalars['String']>>>
  ids: Maybe<Array<Maybe<Scalars['String']>>>
  limit: Maybe<Scalars['Long']>
  minCost: Maybe<Scalars['Float']>
  minSaving: Maybe<Scalars['Float']>
  names: Maybe<Array<Maybe<Scalars['String']>>>
  namespaces: Maybe<Array<Maybe<Scalars['String']>>>
  offset: Maybe<Scalars['Long']>
  perspectiveFilters: Maybe<Array<Maybe<QlceViewFilterWrapperInput>>>
  resourceTypes: Maybe<Array<Maybe<ResourceType>>>
}

export type NodePoolIdInput = {
  clusterid: Scalars['String']
  nodepoolname: Scalars['String']
}

export type QlceViewAggregationInput = {
  columnName: Scalars['String']
  operationType: QlceViewAggregateOperation
}

export type QlceViewFieldInputInput = {
  fieldId: Scalars['String']
  fieldName: Scalars['String']
  identifier: ViewFieldIdentifier
  identifierName: Maybe<Scalars['String']>
}

export type QlceViewFilterInput = {
  field: QlceViewFieldInputInput
  operator: QlceViewFilterOperator
  values: Maybe<Array<Maybe<Scalars['String']>>>
}

export type QlceViewFilterWrapperInput = {
  idFilter: Maybe<QlceViewFilterInput>
  ruleFilter: Maybe<QlceViewRuleInput>
  timeFilter: Maybe<QlceViewTimeFilterInput>
  viewMetadataFilter: Maybe<QlceViewMetadataFilterInput>
}

export type QlceViewGroupByInput = {
  entityGroupBy: Maybe<QlceViewFieldInputInput>
  timeTruncGroupBy: Maybe<QlceViewTimeTruncGroupByInput>
}

export type QlceViewMetadataFilterInput = {
  isPreview: Scalars['Boolean']
  viewId: Scalars['String']
}

export type QlceViewRuleInput = {
  conditions: Maybe<Array<Maybe<QlceViewFilterInput>>>
}

export type QlceViewSortCriteriaInput = {
  sortOrder: QlceSortOrder
  sortType: QlceViewSortType
}

export type QlceViewTimeFilterInput = {
  field: QlceViewFieldInputInput
  operator: QlceViewTimeFilterOperator
  value: Scalars['BigDecimal']
}

export type QlceViewTimeTruncGroupByInput = {
  resolution: QlceViewTimeGroupType
}

export type SortCriteriaInput = {
  field: Maybe<Scalars['String']>
  order: Maybe<SortOrder>
}
