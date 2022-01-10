/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useState } from 'react'
import { Button, Formik, FormikForm } from '@wings-software/uicore'
import { PopoverInteractionKind } from '@blueprintjs/core'
import { noop } from 'lodash-es'
import type {
  DynatraceFormDataInterface,
  DynatraceHealthSourceProps
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import { useStrings } from 'framework/strings'
import {
  mapDynatraceDataToDynatraceForm,
  onSubmitDynatraceData,
  validateMapping
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.utils'
import DynatraceCustomMetrics from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics'
import type {
  CreatedMetricsWithSelectedIndex,
  SelectedAndMappedMetrics
} from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics.type'
import {
  initializeCreatedMetrics,
  initializeSelectedMetricsMap
} from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceCustomMetrics/DynatraceCustomMetrics.utils'
import css from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.module.scss'
import DynatraceMetricPacksToService from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceMetricPacksToService/DynatraceMetricPacksToService'

export default function DynatraceHealthSource(props: DynatraceHealthSourceProps): JSX.Element {
  const { dynatraceFormData: initialPayload, connectorIdentifier, onPrevious, onSubmit } = props
  const { getString } = useStrings()
  const [dynatraceMetricData, setDynatraceMetricData] = useState<DynatraceFormDataInterface>(initialPayload)
  const [showCustomMetric, setShowCustomMetric] = useState<boolean>(!!dynatraceMetricData?.customMetrics?.size)
  const [{ selectedMetric, mappedMetrics }, setMappedMetrics] = useState<SelectedAndMappedMetrics>(
    initializeSelectedMetricsMap(
      getString('cv.healthSource.connectors.Dynatrace.defaultMetricName'),
      dynatraceMetricData.customMetrics
    )
  )
  const [{ createdMetrics, selectedMetricIndex }, setCreatedMetrics] = useState<CreatedMetricsWithSelectedIndex>(
    initializeCreatedMetrics(
      getString('cv.healthSource.connectors.Dynatrace.defaultMetricName'),
      selectedMetric,
      mappedMetrics
    )
  )

  const dynatraceMetricFormData = useMemo(
    () => mapDynatraceDataToDynatraceForm(dynatraceMetricData, mappedMetrics, selectedMetric, showCustomMetric),
    [dynatraceMetricData, mappedMetrics, selectedMetric, showCustomMetric]
  )
  return (
    <Formik<DynatraceFormDataInterface>
      onSubmit={noop}
      enableReinitialize
      formName={'dynatraceHealthSourceForm'}
      isInitialValid={(args: any) =>
        Object.keys(validateMapping(args.initialValues, createdMetrics, selectedMetricIndex, getString)).length === 0
      }
      validate={values => {
        return validateMapping(values, createdMetrics, selectedMetricIndex, getString)
      }}
      initialValues={dynatraceMetricFormData}
    >
      {formik => {
        return (
          <FormikForm className={css.formFullheight}>
            <DynatraceMetricPacksToService
              connectorIdentifier={connectorIdentifier}
              dynatraceMetricData={dynatraceMetricData}
              setDynatraceMetricData={setDynatraceMetricData}
              metricValues={formik.values}
            />
            {showCustomMetric ? (
              <DynatraceCustomMetrics
                isFormValid={formik.isValid}
                metricValues={formik.values}
                formikSetField={formik.setFieldValue}
                mappedMetrics={mappedMetrics}
                setMappedMetrics={setMappedMetrics}
                createdMetrics={createdMetrics}
                setCreatedMetrics={setCreatedMetrics}
                selectedMetric={selectedMetric}
                connectorIdentifier={connectorIdentifier}
                selectedServiceId={(formik.values.selectedService.value as string) || ''}
              />
            ) : (
              formik.values?.selectedService?.value && (
                <CardWithOuterTitle title={getString('cv.healthSource.connectors.customMetrics')}>
                  <Button
                    icon="plus"
                    minimal
                    margin={{ left: 'medium' }}
                    intent="primary"
                    tooltip={getString('cv.healthSource.connectors.customMetricsTooltip')}
                    tooltipProps={{ interactionKind: PopoverInteractionKind.HOVER_TARGET_ONLY }}
                    onClick={() => setShowCustomMetric(true)}
                  >
                    {getString('cv.monitoringSources.addMetric')}
                  </Button>
                </CardWithOuterTitle>
              )
            )}
            <DrawerFooter
              isSubmit
              onPrevious={onPrevious}
              onNext={() =>
                onSubmitDynatraceData(
                  formik,
                  mappedMetrics,
                  selectedMetric,
                  selectedMetricIndex,
                  createdMetrics,
                  getString,
                  onSubmit
                )
              }
            />
          </FormikForm>
        )
      }}
    </Formik>
  )
}
