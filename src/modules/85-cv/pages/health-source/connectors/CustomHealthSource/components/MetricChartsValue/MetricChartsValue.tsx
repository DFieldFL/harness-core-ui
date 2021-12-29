import React, { useMemo, useCallback } from 'react'
import type { GetDataError } from 'restful-react'
import { useParams } from 'react-router-dom'
import { Container, FormInput } from '@wings-software/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { InputWithDynamicModalForJson } from '@cv/components/InputWithDynamicModalForJson/InputWithDynamicModalForJson'
import MetricLineChart from '@cv/pages/health-source/common/MetricLineChart/MetricLineChart'
import { QueryType } from '@cv/pages/health-source/common/HealthSourceQueryType/HealthSourceQueryType.types'
import Button from '@rbac/components/Button/Button'
import { useStrings } from 'framework/strings'
import { useFetchParsedSampleData } from 'services/cv'
import type { MetricChartsValueInterface } from './MetricChartsValue.types'
import { CustomHealthSourceFieldNames } from '../../CustomHealthSource.constants'
import { getOptionsForChart } from '../../../NewRelic/components/NewRelicMappedMetric/NewRelicMappedMetric.utils'
import css from '../QueryMapping/QueryMapping.module.scss'

export default function MetricChartsValue({
  formikValues,
  formikSetFieldValue,
  isQueryExecuted,
  recordsData,
  isSelectingJsonPathDisabled
}: MetricChartsValueInterface): JSX.Element {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<ProjectPathProps & { identifier: string }>()

  const queryParamsForTimeSeriesData = useMemo(
    () => ({
      accountId,
      orgIdentifier,
      projectIdentifier,
      jsonResponse: JSON.stringify(recordsData),
      groupName: formikValues?.groupName?.value as string,
      metricValueJSONPath: formikValues?.metricValue as string,
      timestampJSONPath: formikValues?.timestamp as string,
      timestampFormat: formikValues?.timestampFormat as string
    }),

    [
      accountId,
      orgIdentifier,
      projectIdentifier,
      recordsData,
      formikValues?.groupName?.value,
      formikValues?.metricValue,
      formikValues?.timestamp,
      formikValues?.timestampFormat
    ]
  )

  const {
    data: newRelicTimeSeriesData,
    refetch: fetchNewRelicTimeSeriesData,
    loading: timeSeriesDataLoading,
    error: timeseriesDataError
  } = useFetchParsedSampleData({
    queryParams: queryParamsForTimeSeriesData,
    lazy: true
  })

  const handleBuildChart = useCallback(() => {
    fetchNewRelicTimeSeriesData({ queryParams: queryParamsForTimeSeriesData })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryParamsForTimeSeriesData])

  const options = useMemo(() => {
    return getOptionsForChart(newRelicTimeSeriesData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newRelicTimeSeriesData])

  return (
    <Container className={css.widthHalf}>
      <InputWithDynamicModalForJson
        onChange={formikSetFieldValue}
        fieldValue={formikValues?.metricValue || ''}
        isQueryExecuted={isQueryExecuted}
        isDisabled={isSelectingJsonPathDisabled}
        sampleRecord={[recordsData]}
        inputName={CustomHealthSourceFieldNames.METRIC_VALUE}
        inputLabel={getString('cv.healthSource.connectors.NewRelic.metricFields.metricValueJsonPath.label')}
        recordsModalHeader={getString(
          'cv.healthSource.connectors.NewRelic.metricFields.metricValueJsonPath.recordsModalHeader'
        )}
        showExactJsonPath={true}
      />
      <InputWithDynamicModalForJson
        onChange={formikSetFieldValue}
        fieldValue={formikValues?.timestamp || ''}
        isQueryExecuted={isQueryExecuted}
        isDisabled={isSelectingJsonPathDisabled}
        sampleRecord={[recordsData]}
        inputName={CustomHealthSourceFieldNames.TIMESTAMP_LOCATOR}
        inputLabel={getString('cv.healthSource.connectors.NewRelic.metricFields.timestampJsonPath.label')}
        noRecordInputLabel={'noRecordInputLabel'}
        recordsModalHeader={getString(
          'cv.healthSource.connectors.NewRelic.metricFields.timestampJsonPath.recordsModalHeader'
        )}
        showExactJsonPath={true}
      />
      {formikValues?.queryType === QueryType.HOST_BASED ? (
        <InputWithDynamicModalForJson
          onChange={formikSetFieldValue}
          fieldValue={formikValues?.serviceInstanceIdentifier || ''}
          isQueryExecuted={isQueryExecuted}
          isDisabled={isSelectingJsonPathDisabled}
          sampleRecord={[recordsData]}
          inputName={CustomHealthSourceFieldNames.SERVICE_INSTANCE}
          inputLabel={getString('cv.customHealthSource.ServiceInstance.pathLabel')}
          recordsModalHeader={getString('cv.customHealthSource.ServiceInstance.pathModalHeader')}
          showExactJsonPath={true}
        />
      ) : null}
      <FormInput.Text
        label={getString('cv.healthSource.connectors.NewRelic.metricFields.timestampFormat')}
        name={CustomHealthSourceFieldNames.TIMESTAMP_FORMAT}
      />
      <Button intent="primary" text={getString('cv.healthSource.connectors.buildChart')} onClick={handleBuildChart} />
      <Container padding={{ top: 'small' }}>
        <MetricLineChart
          loading={timeSeriesDataLoading}
          error={timeseriesDataError as GetDataError<Error>}
          options={options}
        />
      </Container>
    </Container>
  )
}
