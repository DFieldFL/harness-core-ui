/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Container, Layout, Text, Icon, Color, FlexExpander } from '@wings-software/uicore'
import type {
  Maybe,
  PerspectiveTrendStats,
  ClusterData,
  InstanceDetails,
  K8sRecommendationFilterDtoInput
} from 'services/ce/services'
import { useStrings } from 'framework/strings'
import { CCM_PAGE_TYPE } from '@ce/types'
import { OVERVIEW_FIELD_MAPPER } from './constants'
import RecommendationSummaryCard from '../PerspectiveSummary/RecommendationSummaryCard'
import css from './WorkloadSummary.module.scss'

interface KeyValuePairRendererProps {
  keyVal?: React.ReactNode
  value?: React.ReactNode
}

const KeyValuePairRenderer: (props: KeyValuePairRendererProps) => JSX.Element = ({ keyVal, value }) => {
  return (
    <Layout.Horizontal className={css.keyValueTable}>
      <Text color={Color.GREY_400} lineClamp={1} className={css.key} width={132}>
        {keyVal}
      </Text>
      <Text color={Color.PRIMARY_9} lineClamp={1} className={css.value} width={160}>
        {value}
      </Text>
    </Layout.Horizontal>
  )
}

const CostDetails: ({
  summaryData,
  pageType
}: {
  summaryData: PerspectiveTrendStats
  pageType: CCM_PAGE_TYPE
}) => JSX.Element = ({ summaryData, pageType }) => {
  const { cost, idleCost, utilizedCost, unallocatedCost, systemCost } = summaryData

  return (
    <Container>
      {cost && <KeyValuePairRenderer keyVal={cost.statsLabel} value={cost.statsValue} />}
      {idleCost && (
        <KeyValuePairRenderer
          keyVal={idleCost.statsLabel}
          value={`${idleCost.statsValue} (${idleCost.statsDescription})`}
        />
      )}
      {utilizedCost && (
        <KeyValuePairRenderer
          keyVal={utilizedCost.statsLabel}
          value={`${utilizedCost.statsValue} (${utilizedCost.statsDescription})`}
        />
      )}
      {pageType === CCM_PAGE_TYPE.Node ? (
        <>
          {unallocatedCost && (
            <KeyValuePairRenderer
              keyVal={unallocatedCost.statsLabel}
              value={`${unallocatedCost.statsValue} (${unallocatedCost.statsDescription})`}
            />
          )}
          {systemCost && (
            <KeyValuePairRenderer
              keyVal={systemCost.statsLabel}
              value={`${systemCost.statsValue} (${systemCost.statsDescription})`}
            />
          )}
        </>
      ) : null}
    </Container>
  )
}

const NodeDetails: ({ infoData, pageType }: { infoData: Record<string, any>; pageType: CCM_PAGE_TYPE }) => JSX.Element =
  ({ infoData, pageType }) => {
    const fieldTables = OVERVIEW_FIELD_MAPPER[pageType]
    return (
      <Layout.Horizontal>
        {fieldTables?.length
          ? fieldTables.map((table, idx) => (
              <div key={`overview-field-${idx}`}>
                {table.map(({ name, key, formatter }) => {
                  const accessor = key as string
                  const value = (infoData && infoData[accessor]) || ''
                  const formattedVal = formatter ? formatter(value) : value
                  return <KeyValuePairRenderer key={accessor} keyVal={name} value={formattedVal} />
                })}
              </div>
            ))
          : null}
      </Layout.Horizontal>
    )
  }

interface WorkloadSummaryProps {
  fetching: boolean
  summaryData: Maybe<PerspectiveTrendStats> | undefined
  infoData: ClusterData | InstanceDetails
  pageType: CCM_PAGE_TYPE
  showRecommendations?: boolean
  recommendationFilters?: K8sRecommendationFilterDtoInput
}

const WorkloadSummary: (props: WorkloadSummaryProps) => JSX.Element = ({
  fetching,
  summaryData,
  infoData,
  pageType,
  showRecommendations,
  recommendationFilters
}) => {
  const { getString } = useStrings()

  if (fetching) {
    return (
      <Container className={css.loadingContainer}>
        <Icon name="spinner" size={26} color="blue500" />
      </Container>
    )
  }

  if (!summaryData) {
    return (
      <Container>
        <Icon name="error" size={26} />
      </Container>
    )
  }

  const detailsText = {
    [CCM_PAGE_TYPE.Workload]: getString('ce.perspectives.workloadDetails.workloadDetailsText'),
    [CCM_PAGE_TYPE.Node]: getString('ce.perspectives.nodeDetails.nodeDetailsText')
  }

  return (
    <Layout.Horizontal className={css.summaryDetailsContainer}>
      <Container className={css.container}>
        <Text className={css.headingText}>{detailsText[pageType]}</Text>
        <NodeDetails infoData={infoData} pageType={pageType} />
      </Container>
      <Container className={css.container}>
        <Text className={css.headingText}>{getString('ce.perspectives.workloadDetails.costDetailsText')}</Text>
        <CostDetails pageType={pageType} summaryData={summaryData} />
      </Container>
      <FlexExpander />
      {showRecommendations && recommendationFilters ? (
        <Container
          margin={{
            right: 'large'
          }}
        >
          <RecommendationSummaryCard pageType={pageType} filters={recommendationFilters} />
        </Container>
      ) : null}
    </Layout.Horizontal>
  )
}

export default WorkloadSummary
