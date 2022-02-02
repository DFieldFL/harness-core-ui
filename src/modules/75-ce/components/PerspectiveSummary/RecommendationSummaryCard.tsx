/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import qs from 'qs'
import { Card, Container, Icon, Text, FontVariation, Layout, FlexExpander, Color } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import formatCost from '@ce/utils/formatCost'
import {
  K8sRecommendationFilterDtoInput,
  usePerspectiveRecommendationsQuery,
  RecommendationItemDto
} from 'services/ce/services'
import { CCM_PAGE_TYPE } from '@ce/types'
import css from './PerspectiveSummary.module.scss'

interface RecommendationSummaryCardProps {
  filters: K8sRecommendationFilterDtoInput
  pageType?: CCM_PAGE_TYPE
}

const RecommendationSummaryCard: (props: RecommendationSummaryCardProps) => JSX.Element = ({ filters, pageType }) => {
  const { perspectiveId, accountId, perspectiveName } = useParams<{
    perspectiveId: string
    accountId: string
    perspectiveName: string
  }>()

  const { getString } = useStrings()

  const history = useHistory()

  const [{ data, fetching: recommendationFetching }] = usePerspectiveRecommendationsQuery({
    variables: {
      filter: {
        ...filters,
        minSaving: 0,
        offset: 0,
        limit: 10
      } as unknown as K8sRecommendationFilterDtoInput
    }
  })

  if (recommendationFetching) {
    return (
      <Card elevation={1} interactive={false}>
        <Container className={cx(css.mainCard, css.loadingContainer)}>
          <Icon name="spinner" color="blue500" size={30} />
        </Container>
      </Card>
    )
  }

  const recommendationData = data?.recommendationStatsV2

  const nagvigateToRecommendations: () => void = () => {
    const recommendationsDetails = (data?.recommendationsV2?.items || []) as RecommendationItemDto[]

    const queryString: Record<string, any> = {
      perspectiveId,
      perspectiveName
    }
    if (pageType === CCM_PAGE_TYPE.Workload) {
      queryString['filters'] = filters
      queryString['origin'] = pageType
    }
    if (recommendationsDetails.length === 1 && recommendationData?.count === 1) {
      const recommendationId = recommendationsDetails[0].id
      const recommendationName = recommendationsDetails[0].resourceName || recommendationId

      recommendationId &&
        history.push({
          pathname: routes.toCERecommendationDetails({
            accountId,
            recommendation: recommendationId,
            recommendationName: recommendationName
          })
        })
    } else {
      history.push({
        pathname: routes.toCERecommendations({
          accountId
        }),
        search: qs.stringify(queryString)
      })
    }
  }

  if (!recommendationData || !recommendationData?.count) {
    return (
      <Card elevation={1}>
        <Container className={css.mainCard}>
          <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
            {getString('ce.recommendation.sideNavText')}
          </Text>
          <Text
            margin={{
              top: 'medium',
              bottom: 'small'
            }}
            iconProps={{ size: 21 }}
            font={{ variation: FontVariation.BODY1 }}
            icon="money-icon"
          >
            $--
          </Text>
          <Text color={Color.GREY_600} font={{ variation: FontVariation.TINY }}>
            no Recommendations yet
          </Text>
        </Container>
      </Card>
    )
  }

  return (
    <Card elevation={1} interactive={false}>
      <Container className={css.mainCard}>
        <Layout.Horizontal>
          <Text color={Color.GREY_500} font={{ variation: FontVariation.SMALL }}>
            {getString('ce.recommendation.sideNavText')}
          </Text>
          <FlexExpander />
          <Text
            className={css.viewLink}
            color={Color.PRIMARY_7}
            font={{ variation: FontVariation.SMALL }}
            onClick={nagvigateToRecommendations}
          >
            {getString('ce.perspectives.recommendations.viewText')}
          </Text>
        </Layout.Horizontal>

        <Text
          color={Color.GREY_400}
          margin={{
            top: 'xsmall'
          }}
          font={{ variation: FontVariation.TINY }}
        >
          {getString('ce.perspectives.recommendations.recommendationCountTxt', {
            count: recommendationData.count
          })}
        </Text>
        <Text
          margin={{
            top: 'xsmall',
            bottom: 'xsmall'
          }}
          iconProps={{ size: 21 }}
          font={{ variation: FontVariation.BODY1 }}
          icon="money-icon"
        >
          {formatCost(recommendationData.totalMonthlySaving)}
        </Text>
        <Text color={Color.GREY_400} font={{ variation: FontVariation.TINY }}>
          {getString('ce.perspectives.recommendations.perMonth')}
        </Text>
      </Container>
    </Card>
  )
}

export default RecommendationSummaryCard
