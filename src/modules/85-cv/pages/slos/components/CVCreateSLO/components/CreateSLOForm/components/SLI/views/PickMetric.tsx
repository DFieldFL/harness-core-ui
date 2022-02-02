/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  Card,
  Container,
  FontVariation,
  Heading,
  FormInput,
  Layout,
  Text,
  Color,
  useToaster,
  SelectOption,
  Icon
} from '@wings-software/uicore'
import type { RadioButtonProps } from '@wings-software/uicore/dist/components/RadioButton/RadioButton'
import { useGetSloMetrics } from 'services/cv'
import { useStrings } from 'framework/strings'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import SLOTargetChartWrapper from '@cv/pages/slos/components/SLOTargetChart/SLOTargetChart'
import CVRadioLabelTextAndDescription from '@cv/components/CVRadioLabelTextAndDescription'
import {
  getSLOMetricOptions,
  getComparatorSuffixLabelId,
  convertSLOFormDataToServiceLevelIndicatorDTO
} from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.utils'
import {
  comparatorOptions,
  defaultOption,
  getEventTypeOptions,
  getMissingDataTypeOptions
} from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.constants'
import {
  SLIProps,
  SLIMetricTypes,
  SLOFormFields,
  SLIEventTypes
} from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.types'
import css from '@cv/pages/slos/components/CVCreateSLO/CVCreateSLO.module.scss'

const PickMetric: React.FC<Omit<SLIProps, 'children'>> = ({ formikProps, ...rest }) => {
  const { getString } = useStrings()
  const { showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const {
    monitoredServiceRef,
    healthSourceRef,
    eventType,
    goodRequestMetric,
    validRequestMetric,
    SLIMetricType,
    objectiveComparator
  } = formikProps.values
  const isRatioBasedMetric = SLIMetricType === SLIMetricTypes.RATIO

  const {
    data: SLOMetricsData,
    loading: SLOMetricsLoading,
    error: SLOMetricsError,
    refetch: refetchSLOMetrics
  } = useGetSloMetrics({
    monitoredServiceIdentifier: monitoredServiceRef,
    healthSourceIdentifier: healthSourceRef,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (monitoredServiceRef && healthSourceRef) {
      refetchSLOMetrics()
    }
  }, [monitoredServiceRef, healthSourceRef, refetchSLOMetrics])

  useEffect(() => {
    if (SLOMetricsError) {
      showError(getErrorMessage(SLOMetricsError))
    }
  }, [SLOMetricsError, showError])

  const SLOMetricOptions = getSLOMetricOptions(SLOMetricsData?.resource)

  const activeGoodMetric: SelectOption = useMemo(
    () => SLOMetricOptions.find(metric => metric.value === goodRequestMetric) ?? defaultOption,
    [SLOMetricOptions, goodRequestMetric]
  )

  const activeValidMetric: SelectOption = useMemo(
    () => SLOMetricOptions.find(metric => metric.value === validRequestMetric) ?? defaultOption,
    [SLOMetricOptions, validRequestMetric]
  )

  const radioItems: Pick<RadioButtonProps, 'label' | 'value'>[] = useMemo(() => {
    const { THRESHOLD, RATIO } = SLIMetricTypes
    return [
      {
        label: (
          <CVRadioLabelTextAndDescription
            label="cv.slos.slis.metricOptions.thresholdBased"
            description="cv.slos.contextualHelp.sli.thresholdDescription"
          />
        ),
        value: THRESHOLD
      },
      {
        label: (
          <CVRadioLabelTextAndDescription
            label="cv.slos.slis.metricOptions.ratioBased"
            description="cv.slos.contextualHelp.sli.ratioBasedDescription"
          />
        ),
        value: RATIO
      }
    ]
  }, [])

  const goodOrBadRequestMetricLabel =
    eventType === SLIEventTypes.BAD
      ? getString('cv.slos.slis.ratioMetricType.badRequestsMetrics')
      : getString('cv.slos.slis.ratioMetricType.goodRequestsMetrics')

  return (
    <>
      <Card className={css.cardPickMetric}>
        <Heading level={2} font={{ variation: FontVariation.FORM_TITLE }} margin={{ top: 'xlarge', bottom: 'large' }}>
          {getString('cv.slos.pickMetricsSLI')}
        </Heading>
        <Layout.Horizontal spacing="xxlarge">
          <Container width="50%" padding={{ right: 'xxlarge' }} border={{ right: true }}>
            <Layout.Vertical width="80%">
              <FormInput.RadioGroup
                name={SLOFormFields.SLI_METRIC_TYPE}
                className={css.radioGroup}
                items={radioItems}
              />
            </Layout.Vertical>
            {isRatioBasedMetric && (
              <Layout.Horizontal spacing="xlarge">
                <FormInput.Select
                  name={SLOFormFields.EVENT_TYPE}
                  label={getString('cv.slos.slis.ratioMetricType.eventType')}
                  items={getEventTypeOptions(getString)}
                  className={css.eventType}
                />
                <FormInput.Select
                  name={SLOFormFields.GOOD_REQUEST_METRIC}
                  label={goodOrBadRequestMetricLabel}
                  placeholder={SLOMetricsLoading ? getString('loading') : undefined}
                  disabled={!healthSourceRef}
                  items={SLOMetricOptions}
                  className={css.metricSelect}
                  value={activeGoodMetric}
                  onChange={metric => formikProps.setFieldValue(SLOFormFields.GOOD_REQUEST_METRIC, metric.value)}
                />
              </Layout.Horizontal>
            )}
            <FormInput.Select
              name={SLOFormFields.VALID_REQUEST_METRIC}
              label={getString('cv.slos.slis.ratioMetricType.validRequestsMetrics')}
              placeholder={SLOMetricsLoading ? getString('loading') : undefined}
              disabled={!healthSourceRef}
              items={SLOMetricOptions}
              className={css.metricSelect}
              value={activeValidMetric}
              onChange={metric => formikProps.setFieldValue(SLOFormFields.VALID_REQUEST_METRIC, metric.value)}
            />
            <FormInput.Text
              name={SLOFormFields.OBJECTIVE_VALUE}
              label={getString('cv.objectiveValue')}
              inputGroup={{
                type: 'number',
                min: 0,
                max: SLIMetricType === SLIMetricTypes.RATIO ? 100 : undefined,
                step: 'any',
                rightElement:
                  SLIMetricType === SLIMetricTypes.RATIO ? <Icon name="percentage" padding="small" /> : undefined
              }}
              className={css.objectiveValue}
            />
            <Layout.Horizontal
              flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}
              spacing="small"
              width={320}
            >
              <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                {getString('cv.SLIValueIsGoodIf')}
              </Text>
              <FormInput.Select
                name={SLOFormFields.OBJECTIVE_COMPARATOR}
                items={comparatorOptions}
                onChange={option => {
                  formikProps.setFieldValue(SLOFormFields.OBJECTIVE_COMPARATOR, option.value)
                }}
                className={css.comparatorOptions}
              />
              <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
                {getString(getComparatorSuffixLabelId(objectiveComparator))}
              </Text>
            </Layout.Horizontal>
            <FormInput.Select
              name={SLOFormFields.SLI_MISSING_DATA_TYPE}
              label={getString('cv.considerMissingMetricDataAs')}
              items={getMissingDataTypeOptions(getString)}
              className={css.metricSelect}
            />
          </Container>

          <Container height="inherit" width="50%" className={css.graphContainer} padding={{ left: 'xxlarge' }}>
            <SLOTargetChartWrapper
              monitoredServiceIdentifier={monitoredServiceRef}
              serviceLevelIndicator={convertSLOFormDataToServiceLevelIndicatorDTO(formikProps.values)}
              {...rest}
              topLabel={
                <Text
                  font={{ variation: FontVariation.TINY_SEMI }}
                  color={Color.GREY_500}
                  padding={{ bottom: 'medium' }}
                >
                  {getString('cv.SLIRequestRatio')}
                </Text>
              }
              customChartOptions={{
                chart: { height: isRatioBasedMetric ? 280 : 220 },
                yAxis: { min: 0, max: 100, tickInterval: 25 }
              }}
            />
          </Container>
        </Layout.Horizontal>
      </Card>
    </>
  )
}

export default PickMetric
