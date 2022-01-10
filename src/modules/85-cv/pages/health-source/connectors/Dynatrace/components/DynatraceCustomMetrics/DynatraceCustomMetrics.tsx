/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Container,
  Accordion,
  SelectOption,
  Utils,
  FormInput,
  useConfirmationDialog,
  Text
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useGetAllDynatraceServiceMetrics, useGetDynatraceSampleData, useGetMetricPacks } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { SetupSourceCardHeader } from '@cv/components/CVSetupSourcesView/SetupSourceCardHeader/SetupSourceCardHeader'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { MultiItemsSideNav } from '@cv/components/MultiItemsSideNav/MultiItemsSideNav'
import SelectHealthSourceServices from '@cv/pages/health-source/common/SelectHealthSourceServices/SelectHealthSourceServices'
import { QueryContent } from '@cv/components/QueryViewer/QueryViewer'
import GroupName from '@cv/components/GroupName/GroupName'
import type {
  DynatraceCustomMetricsProps,
  SelectedAndMappedMetrics
} from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics.type'
import {
  editQueryConfirmationDialogProps,
  mapMetricSelectorsToMetricSelectorOptions,
  updateMappedMetricMap,
  updateSelectedMetricsMap
} from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics.utils'
import { initializeGroupNames } from '@cv/pages/health-source/connectors/AppDynamics/Components/AppDMappedMetric/AppDMappedMetric.utils'
import { DynatraceHealthSourceFieldNames } from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.constants'
import MetricsValidationChart from '@cv/components/CloudMetricsHealthSource/components/validationChart/MetricsValidationChart'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import { transformSampleDataIntoHighchartOptions } from '@cv/pages/health-source/connectors/GCOMetricsHealthSource/GCOMetricsHealthSource.utils'
import css from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.module.scss'

export default function DynatraceCustomMetrics(props: DynatraceCustomMetricsProps): JSX.Element {
  const { createdMetrics, setCreatedMetrics, setMappedMetrics, mappedMetrics } = props
  const { selectedMetric, metricValues, connectorIdentifier, selectedServiceId, formikSetField, isFormValid } = props
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const metricPackResponse = useGetMetricPacks({
    queryParams: { projectIdentifier, orgIdentifier, accountId, dataSourceType: 'DYNATRACE' }
  })
  const [dynatraceGroupNames, setDynatraceGroupNames] = useState<SelectOption[]>(
    initializeGroupNames(mappedMetrics, getString)
  )
  const [shouldShowChart, setShouldShowChart] = useState<boolean>(false)
  const [timeseriesData, setTimeseriesData] = useState<Highcharts.Options>()
  const dynatraceServicesTracingId = useMemo(() => Utils.randomId(), [])
  const sampleDataQueryParams = useMemo(
    () => ({
      accountId,
      projectIdentifier,
      orgIdentifier,
      tracingId: Utils.randomId(),
      connectorIdentifier
    }),
    [accountId, projectIdentifier, orgIdentifier, connectorIdentifier]
  )
  const { mutate: querySampleData, loading, error } = useGetDynatraceSampleData({ queryParams: sampleDataQueryParams })
  const timeseriesDataErrorMessage = useMemo(() => {
    return getErrorMessage(error)
  }, [error])
  const onFetchSampleData = useCallback(
    async metricSelector => {
      if (!metricSelector.length) {
        return
      }
      const sampleData = await querySampleData(
        { metricSelector: metricSelector, serviceId: selectedServiceId },
        { queryParams: sampleDataQueryParams }
      )
      setTimeseriesData(transformSampleDataIntoHighchartOptions(sampleData.data))
      setShouldShowChart(true)
    },
    [querySampleData, sampleDataQueryParams, selectedServiceId]
  )
  const { data: serviceMetrics } = useGetAllDynatraceServiceMetrics({
    queryParams: {
      accountId,
      connectorIdentifier,
      orgIdentifier,
      projectIdentifier,
      tracingId: dynatraceServicesTracingId
    }
  })
  const metricSelectorOptions: SelectOption[] =
    useMemo(() => {
      return mapMetricSelectorsToMetricSelectorOptions(serviceMetrics?.data || [])
    }, [serviceMetrics?.data]) || []
  const currentActiveMetricSelector: SelectOption = useMemo(() => {
    return { label: metricValues?.metricSelector || '', value: metricValues?.metricSelector || '' }
  }, [metricValues?.metricSelector])
  const selectedMetricData = useMemo(() => {
    return mappedMetrics.get(selectedMetric)
  }, [selectedMetric, mappedMetrics])
  const { openDialog } = useConfirmationDialog(editQueryConfirmationDialogProps(getString, formikSetField))
  return (
    <SetupSourceLayout
      leftPanelContent={
        <MultiItemsSideNav
          defaultMetricName={getString('cv.healthSource.connectors.Dynatrace.defaultMetricName')}
          tooptipMessage={getString('cv.monitoringSources.gcoLogs.addQueryTooltip')}
          addFieldLabel={getString('cv.monitoringSources.addMetric')}
          createdMetrics={createdMetrics}
          defaultSelectedMetric={selectedMetric}
          renamedMetric={metricValues?.metricName}
          isValidInput={isFormValid}
          onRemoveMetric={(removedMetric, updatedMetric, updatedList, smIndex) => {
            setMappedMetrics((oldState: SelectedAndMappedMetrics) => {
              const updated = updateMappedMetricMap(metricValues, removedMetric, updatedMetric, oldState)
              setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
              return updated
            })
          }}
          onSelectMetric={(newMetric, updatedList, smIndex) => {
            setCreatedMetrics({ selectedMetricIndex: smIndex, createdMetrics: updatedList })
            setMappedMetrics((oldState: SelectedAndMappedMetrics) => {
              return updateSelectedMetricsMap(newMetric, oldState.selectedMetric, oldState.mappedMetrics, metricValues)
            })
          }}
        />
      }
      content={
        <Container className={css.main}>
          <SetupSourceCardHeader
            mainHeading={getString('cv.monitoringSources.prometheus.querySpecificationsAndMappings')}
            subHeading={getString('cv.monitoringSources.prometheus.customizeQuery')}
          />
          <Container className={css.content}>
            <Accordion activeId="metricToService" className={css.accordian}>
              <Accordion.Panel
                id="metricToService"
                summary={getString('cv.monitoringSources.mapMetricsToServices')}
                details={
                  <>
                    <NameId
                      nameLabel={getString('cv.monitoringSources.metricNameLabel')}
                      identifierProps={{
                        inputName: DynatraceHealthSourceFieldNames.METRIC_NAME,
                        idName: DynatraceHealthSourceFieldNames.IDENTIFIER,
                        isIdentifierEditable: Boolean(!selectedMetricData?.identifier || selectedMetricData?.isNew)
                      }}
                    />
                    <GroupName
                      groupNames={dynatraceGroupNames}
                      onChange={formikSetField}
                      item={metricValues?.groupName}
                      setGroupNames={setDynatraceGroupNames}
                      label={getString('cv.monitoringSources.prometheus.groupName')}
                      title={'Add Dynatrace group name'}
                      fieldName={DynatraceHealthSourceFieldNames.GROUP_NAME}
                    />
                  </>
                }
              />
              <Accordion.Panel
                id="querySpecificationsAndMapping"
                summary={getString('cv.healthSource.connectors.NewRelic.queryMapping')}
                details={
                  <>
                    {metricValues?.isManualQuery && (
                      <Container className={css.manualQueryWarning}>
                        <Text icon="warning-sign" iconProps={{ size: 14 }}>
                          {getString('cv.monitoringSources.prometheus.isManualQuery')}
                        </Text>
                        <Text
                          intent="primary"
                          onClick={() => formikSetField(DynatraceHealthSourceFieldNames.MANUAL_QUERY, false)}
                        >
                          {getString('cv.monitoringSources.prometheus.undoManualQuery')}
                        </Text>
                      </Container>
                    )}
                    <FormInput.Select
                      disabled={metricValues?.isManualQuery}
                      name={'activeMetricSelector'}
                      label={getString('cv.monitoringSources.metricLabel')}
                      items={metricSelectorOptions}
                      value={currentActiveMetricSelector}
                      onChange={event => {
                        formikSetField(DynatraceHealthSourceFieldNames.METRIC_SELECTOR, event.value)
                      }}
                    />
                    <QueryContent
                      textAreaProps={{ readOnly: !metricValues?.isManualQuery }}
                      onEditQuery={!metricValues?.isManualQuery ? openDialog : undefined}
                      handleFetchRecords={async () => {
                        if (!shouldShowChart) {
                          setShouldShowChart(true)
                        }
                        onFetchSampleData(metricValues.metricSelector)
                      }}
                      isDialogOpen={false}
                      query={metricValues?.metricSelector}
                      loading={!metricValues}
                      textAreaName={DynatraceHealthSourceFieldNames.METRIC_SELECTOR}
                    />
                    <MetricsValidationChart
                      submitQueryText={'cv.healthSource.connectors.Dynatrace.submitQueryLabel'}
                      loading={loading}
                      error={timeseriesDataErrorMessage}
                      sampleData={timeseriesData}
                      queryValue={metricValues?.metricSelector}
                      isQueryExecuted={shouldShowChart}
                      onRetry={async () => {
                        onFetchSampleData(metricValues.metricSelector)
                      }}
                    />
                  </>
                }
              />
              <Accordion.Panel
                id="riskProfile"
                summary={getString('cv.monitoringSources.assign')}
                details={
                  <SelectHealthSourceServices
                    values={{
                      sli: !!metricValues?.sli,
                      healthScore: !!metricValues?.healthScore,
                      continuousVerification: !!metricValues?.continuousVerification
                    }}
                    metricPackResponse={metricPackResponse}
                    hideServiceIdentifier={true}
                  />
                }
              />
            </Accordion>
          </Container>
        </Container>
      }
    />
  )
}
