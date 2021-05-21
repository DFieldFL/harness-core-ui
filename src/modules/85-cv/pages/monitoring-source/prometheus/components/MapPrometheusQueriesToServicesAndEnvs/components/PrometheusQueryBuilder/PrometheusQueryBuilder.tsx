import React, { useMemo } from 'react'
import type { GetDataError } from 'restful-react'
import { Container, FormInput, MultiSelectOption, SelectOption } from '@wings-software/uicore'
import type { Failure, useGetLabelNames, useGetMetricNames } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/exports'
import { PrometheusFilterSelector } from './components/PrometheusFilterSelector/PrometheusFilterSelector'
import { MapPrometheusQueryToServiceFieldNames } from '../../constants'
import css from './PrometheusQueryBuilder.module.scss'

interface PrometheusQueryBuilderProps {
  onUpdateFilter: (fieldName: string, value: MultiSelectOption) => void
  onRemoveFilter: (fieldName: string, index: number) => void
  connectorIdentifier: string
  labelNamesResponse: ReturnType<typeof useGetLabelNames>
  metricNamesResponse: ReturnType<typeof useGetMetricNames>
  aggregatorValue?: string
  isManualQuery?: boolean
}

export function PrometheusQueryBuilder(props: PrometheusQueryBuilderProps): JSX.Element {
  const {
    onUpdateFilter,
    onRemoveFilter,
    connectorIdentifier,
    labelNamesResponse,
    metricNamesResponse,
    isManualQuery,
    aggregatorValue
  } = props
  const { showError, clear } = useToaster()
  const { getString } = useStrings()

  const handleLoadingAndError = (
    error: GetDataError<Failure | Error | null> | null,
    loading: boolean
  ): SelectOption[] | undefined => {
    if (error) {
      clear()
      showError(getErrorMessage(error), 7000)
      return []
    } else if (loading) {
      return [{ label: getString('loading'), value: '' }]
    }
  }

  const { data: metricNames, error: metricNameError, loading: loadingMetricNames } = metricNamesResponse
  const { data: labelNames, error: labelNameError, loading: loadingLabelNames } = labelNamesResponse

  const transformedMetricNames: SelectOption[] = useMemo(() => {
    const loadingOrError = handleLoadingAndError(metricNameError, loadingMetricNames)
    return loadingOrError || metricNames?.data?.map(metricName => ({ label: metricName, value: metricName })) || []
  }, [metricNames, metricNameError, loadingMetricNames])

  const transformedLabelNames: SelectOption[] = useMemo(() => {
    const options = handleLoadingAndError(labelNameError, loadingLabelNames)
    return options || labelNames?.data?.map(label => ({ label, value: label })) || []
  }, [labelNameError, labelNames, loadingLabelNames])

  const aggregationItems = useMemo(
    () => [
      { label: getString('cv.monitoringSources.prometheus.avgAggregator'), value: 'avg' },
      { label: getString('cv.monitoringSources.prometheus.countAggregator'), value: 'count' },
      { label: getString('cv.monitoringSources.prometheus.maxAggregator'), value: 'max' },
      { label: getString('cv.monitoringSources.prometheus.minAggregator'), value: 'min' },
      { label: getString('cv.monitoringSources.prometheus.stddevAggregator'), value: 'stddev' },
      { label: getString('cv.monitoringSources.prometheus.stdvarAggregator'), value: 'stdvar' },
      { label: getString('cv.monitoringSources.prometheus.sumAggregator'), value: 'sum' }
    ],
    []
  )

  const aggregatorOption = aggregationItems.find(item => item.value === aggregatorValue)

  if (isManualQuery) {
    return <Container data-name="emptyForManualQuery" />
  }

  return (
    <Container className={css.main}>
      <FormInput.Select
        name={MapPrometheusQueryToServiceFieldNames.PROMETHEUS_METRIC}
        label={getString('cv.monitoringSources.prometheus.prometheusMetric')}
        items={transformedMetricNames}
      />
      <PrometheusFilterSelector
        items={transformedLabelNames}
        name={MapPrometheusQueryToServiceFieldNames.ENVIRONMENT_FILTER}
        label={getString('cv.monitoringSources.prometheus.environmentFilter')}
        connectorIdentifier={connectorIdentifier}
        onUpdateFilter={updatedItem =>
          onUpdateFilter(MapPrometheusQueryToServiceFieldNames.ENVIRONMENT_FILTER, updatedItem)
        }
        onRemoveFilter={index => onRemoveFilter(MapPrometheusQueryToServiceFieldNames.ENVIRONMENT_FILTER, index)}
      />
      <PrometheusFilterSelector
        items={transformedLabelNames}
        name={MapPrometheusQueryToServiceFieldNames.SERVICE_FILTER}
        label={getString('cv.monitoringSources.prometheus.serviceFilter')}
        connectorIdentifier={connectorIdentifier}
        onUpdateFilter={updatedItem =>
          onUpdateFilter(MapPrometheusQueryToServiceFieldNames.SERVICE_FILTER, updatedItem)
        }
        onRemoveFilter={index => onRemoveFilter(MapPrometheusQueryToServiceFieldNames.SERVICE_FILTER, index)}
      />
      <PrometheusFilterSelector
        items={transformedLabelNames}
        name={MapPrometheusQueryToServiceFieldNames.ADDITIONAL_FILTER}
        label={getString('cv.monitoringSources.prometheus.additionalFilter')}
        connectorIdentifier={connectorIdentifier}
        isOptional={true}
        onUpdateFilter={updatedItem =>
          onUpdateFilter(MapPrometheusQueryToServiceFieldNames.ADDITIONAL_FILTER, updatedItem)
        }
        onRemoveFilter={index => onRemoveFilter(MapPrometheusQueryToServiceFieldNames.ADDITIONAL_FILTER, index)}
      />
      <FormInput.Select
        label={getString('cv.monitoringSources.prometheus.aggregator')}
        name={MapPrometheusQueryToServiceFieldNames.AGGREGATOR}
        items={aggregationItems}
        isOptional={true}
        key={aggregatorOption?.value}
        selectProps={{
          addClearBtn: true
        }}
      />
    </Container>
  )
}
