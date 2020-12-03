import React, { useMemo } from 'react'
import { Container, Text, Color, Icon, Layout } from '@wings-software/uikit'
import HighchartsReact from 'highcharts-react-official'
import Highcharts from 'highcharts'
import highchartsMore from 'highcharts/highcharts-more'
import gauge from 'highcharts/modules/solid-gauge'
import cx from 'classnames'
import { isNumber } from 'lodash-es'
import moment from 'moment'
import { useParams } from 'react-router-dom'
import { RiskScoreTile } from '@cv/components/RiskScoreTile/RiskScoreTile'
import { MetricCategoryNames } from '@cv/components/MetricCategoriesWithRiskScore/MetricCategoriesWithRiskScore'
import { CategoryRisk, RestResponseCategoryRisksDTO, useGetCategoryRiskMap } from 'services/cv'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { getColorStyle } from '@common/components/HeatMap/ColorUtils'
import i18n from './CategoryRiskCards.i18n'
import getRiskGaugeChartOptions from './RiskGauge'
import css from './CategoryRiskCards.module.scss'

interface CategoryRiskCardsWithApiProps {
  environmentIdentifier?: string
  serviceIdentifier?: string
  className?: string
}

interface CategoryRiskCardProps {
  categoryName: string
  riskScore: number
  className?: string
}

interface CategoryRiskCardsProps {
  className?: string
  data: RestResponseCategoryRisksDTO | null
  loading?: boolean
  error?: string
}

interface OverallRiskScoreCard {
  overallRiskScore: number
  className?: string
}

highchartsMore(Highcharts)
gauge(Highcharts)

function getOverallRisk(data: CategoryRiskCardsProps['data']): number {
  const riskValues: CategoryRisk[] = Object.values(data?.resource?.categoryRisks || [])
  if (!riskValues.length) return -1
  const maxValue = riskValues.reduce((currMax = -1, currVal) => {
    if (!isNumber(currVal?.risk)) return currMax
    return currVal.risk > currMax ? currVal.risk : currMax
  }, -1)
  return maxValue
}

function transformCategoryRiskResponse(
  data: CategoryRiskCardsProps['data']
): Array<{ categoryName: string; riskScore: number }> {
  if (!data || !data.resource || !data.resource.categoryRisks?.length) {
    return []
  }
  const { categoryRisks } = data.resource
  return categoryRisks
    .sort((categoryA, categoryB) => {
      if (categoryA?.category === MetricCategoryNames.PERFORMANCE) {
        return -1
      }
      if (categoryA?.category === MetricCategoryNames.ERRORS) {
        return categoryB?.category === MetricCategoryNames.PERFORMANCE ? 1 : -1
      }
      return 1
    })
    .map(sortedCategoryName => ({
      categoryName: sortedCategoryName.category,
      riskScore: sortedCategoryName.risk
    })) as Array<{ categoryName: string; riskScore: number }>
}

export function CategoryRiskCard(props: CategoryRiskCardProps): JSX.Element {
  const { riskScore = 0, categoryName = '', className } = props
  return (
    <Container className={cx(css.categoryRiskCard, className)}>
      <Container className={css.riskInfoContainer}>
        <Text color={Color.BLACK} className={css.categoryName}>
          {categoryName}
        </Text>
        <Container className={css.riskScoreContainer}>
          <RiskScoreTile riskScore={riskScore} />
          <Text className={css.riskScoreText} color={Color.GREY_300}>
            {i18n.riskScoreText}
          </Text>
        </Container>
      </Container>
      <Container className={css.chartContainer}>
        <HighchartsReact highchart={Highcharts} options={getRiskGaugeChartOptions(riskScore)} />
      </Container>
    </Container>
  )
}

export function OverallRiskScoreCard(props: OverallRiskScoreCard): JSX.Element {
  const { className, overallRiskScore } = props
  return overallRiskScore === -1 ? (
    <Container className={cx(css.overallRiskScoreCard, className)} background={Color.GREY_250}>
      <Text color={Color.BLACK} className={css.overallRiskScoreNoData}>
        {i18n.noAnalysisText}
      </Text>
    </Container>
  ) : (
    <Container className={cx(css.overallRiskScoreCard, className, getColorStyle(overallRiskScore, 0, 100))}>
      <Text color={Color.BLACK} className={css.overallRiskScoreValue}>
        {overallRiskScore}
      </Text>
      <Layout.Vertical>
        <Text font={{ weight: 'bold' }} color={Color.BLACK}>
          {i18n.overallText}
        </Text>
        <Text font={{ size: 'xsmall' }} color={Color.GREY_250}>
          {i18n.riskScoreText}
        </Text>
      </Layout.Vertical>
    </Container>
  )
}

export function CategoryRiskCardsWithApi(props: CategoryRiskCardsWithApiProps): JSX.Element {
  const { environmentIdentifier, serviceIdentifier, className } = props
  const { orgIdentifier = '', projectIdentifier = '', accountId } = useParams()
  const { data, error, loading } = useGetCategoryRiskMap({
    queryParams: {
      orgIdentifier: orgIdentifier as string,
      projectIdentifier: projectIdentifier as string,
      accountId,
      envIdentifier: environmentIdentifier,
      serviceIdentifier
    }
  })

  return <CategoryRiskCards className={className} data={data} error={error?.message} loading={loading} />
}

export function CategoryRiskCards(props: CategoryRiskCardsProps): JSX.Element {
  const { className, data, loading, error } = props
  const overallRiskScore = useMemo(() => getOverallRisk(data), [data])
  const categoriesAndRisk = useMemo(() => transformCategoryRiskResponse(data), [data])

  if (loading) {
    return (
      <Container className={css.errorOrLoading} height={105}>
        <Icon name="steps-spinner" size={20} color={Color.GREY_250} />
      </Container>
    )
  }

  if (error) {
    return (
      <Container className={css.errorOrLoading} height={105}>
        <Icon name="error" size={20} color={Color.RED_500} />
        <Text intent="danger">{error}</Text>
      </Container>
    )
  }

  if (!categoriesAndRisk?.length) {
    return (
      <NoDataCard
        message={i18n.noDataText}
        icon="warning-sign"
        buttonText={i18n.retryButtonText}
        className={css.noData}
      />
    )
  }

  const { endTimeEpoch = -1, startTimeEpoch = -1 } = data?.resource || {}

  return (
    <Container className={css.main}>
      <Container className={css.timeRange}>
        <Text color={Color.BLACK} font={{ weight: 'bold' }}>
          {i18n.productionRisk}
        </Text>
        {new Date(endTimeEpoch).getTime() > 0 && new Date(startTimeEpoch).getTime() > 0 && (
          <Text font={{ size: 'xsmall' }} color={Color.GREY_350}>{`${i18n.evaluationPeriodText} ${moment(
            startTimeEpoch
          ).format('MMM D, YYYY h:mma')} - ${moment(endTimeEpoch).format('h:mma')}`}</Text>
        )}
      </Container>
      <Container className={css.cardContainer}>
        {isNumber(overallRiskScore) && <OverallRiskScoreCard overallRiskScore={overallRiskScore} />}
        {categoriesAndRisk.map(({ categoryName, riskScore }) => (
          <CategoryRiskCard
            categoryName={categoryName || ''}
            riskScore={riskScore ?? -1}
            key={categoryName}
            className={className}
          />
        ))}
      </Container>
    </Container>
  )
}
