import React, { useMemo } from 'react'
import { Container, Icon, Layout } from '@wings-software/uicore'
import { useParams } from 'react-router'
import cx from 'classnames'
import { clone } from 'lodash-es'
import * as Moment from 'moment'
import { extendMoment } from 'moment-range'
import type { PlotOptions } from 'highcharts'
import { Classes } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { VariationWithIcon } from '@cf/components/VariationWithIcon/VariationWithIcon'
import { CFVariationColors } from '@cf/constants'
import { Feature, FeatureEvaluation, useGetFeatureEvaluations } from 'services/cf'
import { PageError } from '@common/components/Page/PageError'
import { formatDate, formatNumber, getErrorMessage } from '@cf/utils/CFUtils'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { EvaluationsChart } from './EvaluationsChart'
import css from './MetricsView.module.scss'

const moment = extendMoment(Moment)

export interface TabEvaluationsProps {
  flagData: Feature
  startDate: Date
  endDate: Date
}

// Remove year in chart for only current year dates
const _formatDateWithoutYear = (date: number): string => {
  const currentYear = new Date(date).getFullYear()
  return formatDate(date)
    .replace(new RegExp(currentYear + '$', 'i'), '')
    .trim()
    .replace(',', '')
}

export const TabEvaluations: React.FC<TabEvaluationsProps> = ({ flagData, startDate, endDate }) => {
  const { getString } = useStrings()
  const { accountId: account, orgIdentifier: org, projectIdentifier: project } = useParams<Record<string, string>>()
  const queryParams = useMemo(
    () => ({
      account,
      org,
      project,
      startTime: startDate.getTime(),
      endTime: endDate.getTime()
    }),
    [startDate, endDate, account, org, project]
  )
  const { data, loading, error, refetch } = useGetFeatureEvaluations({
    identifier: flagData.identifier,
    queryParams
  })
  const _data = data as FeatureEvaluation[] // Note: Backend Swagger spec is wrong at the moment
  const total = _data?.reduce((_total, entry: FeatureEvaluation) => {
    const _entry = _total.find(({ variationIdentifier }) => variationIdentifier === entry.variationIdentifier)

    if (_entry) {
      _entry.count = (_entry.count || 0) + (entry.count || 0)
    } else {
      _total.push(clone(entry))
    }

    return _total
  }, [] as FeatureEvaluation[])
  const metricsGroupedByDay = _data?.reduce((_metricsGroupedByDay, entry) => {
    const _entry = _metricsGroupedByDay.find(
      ({ day, variationIdentifier }) =>
        variationIdentifier === entry.variationIdentifier && day === _formatDateWithoutYear(entry.date as number)
    )

    if (_entry) {
      _entry.count = (_entry.count || 0) + (entry.count || 0)
    } else {
      _metricsGroupedByDay.push({ ...entry, day: _formatDateWithoutYear(entry.date as number) })
    }

    return _metricsGroupedByDay
  }, [] as (FeatureEvaluation & { day: string })[])

  // categories is used to render x-axis
  const categories = Array.from(moment.range(moment(startDate), moment(endDate)).by('day', { step: 1 })).map(interval =>
    _formatDateWithoutYear(interval.valueOf())
  )

  // series is used to render y-axis + tooltip
  const series = flagData.variations.map((variation, index) => {
    const seriesData = categories.map(
      dayFromRanges =>
        metricsGroupedByDay?.find(
          ({ variationIdentifier, day }) => variationIdentifier === variation.identifier && dayFromRanges === day
        )?.count || 0
    )

    // Tooltip with combination with audit logs are not implemented
    // @see https://harness.atlassian.net/browse/FFM-802
    const tooltips = categories.reduce((_tooltip, dayFromRanges) => {
      _tooltip[dayFromRanges] = `
        <p>${dayFromRanges}</p>
        <h3>
          ${getString('cf.featureFlags.metrics.flagEvaluations', { count: 100 })}
        </h3>
        <table className=${cx(Classes.HTML_TABLE, css.dataTable)}>
        <tbody>
          <tr>
            <td>True</td>
            <td>${formatNumber(1000 || 0, true)} evaluations</td>
          </tr>
        </tbody>
      </table>
      `
      return _tooltip
    }, {} as Record<string, string>)

    const variationSeriesItem = {
      name: variation.name,
      type: 'areaspline',
      color: CFVariationColors[index % CFVariationColors.length],
      data: seriesData,
      tooltips
    }

    return variationSeriesItem
  })

  return (
    <Container className={css.contentBody}>
      {loading && <Icon name="spinner" size={16} color="blue500" />}
      {error && <PageError message={getErrorMessage(error)} onClick={() => refetch()} />}
      {!loading && !error && _data?.length === 0 && (
        <NoDataCard icon="cf-main" message={getString('cf.featureFlags.metrics.noData')} />
      )}
      {!loading && !error && !!_data?.length && (
        <Container margin={{ top: 'medium' }}>
          <EvaluationsChart
            series={series as PlotOptions}
            categories={categories}
            title={getString('cf.featureFlags.metrics.flagEvaluations', {
              count: formatNumber(total?.reduce((sum, entry) => sum + (entry.count || 0), 0) || 0)
            })}
          />
          <Container margin={{ top: 'xxlarge' }}>
            <table className={cx(Classes.HTML_TABLE, css.dataTable)}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: 'var(--spacing-large)' }}>{getString('cf.shared.variation')}</th>
                  <th>{getString('cf.featureFlags.metrics.totalEvaluations')}</th>
                </tr>
              </thead>
              <tbody>
                {total?.map(entry => {
                  const index = flagData.variations.findIndex(
                    variation => variation.identifier === entry.variationIdentifier
                  )

                  return (
                    <tr key={entry.variationIdentifier}>
                      <td style={{ paddingLeft: 'var(--spacing-large)' }}>
                        <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }}>
                          <VariationWithIcon variation={flagData.variations[index]} index={index} />
                        </Layout.Horizontal>
                      </td>
                      <td>{formatNumber(entry.count || 0, true)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </Container>
        </Container>
      )}
    </Container>
  )
}
