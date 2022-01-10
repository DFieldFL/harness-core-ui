/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { cloneDeep, isEmpty } from 'lodash-es'
import type { SelectOption } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import type { UpdatedHealthSource } from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'
import type { DynatraceHealthSourceSpec, DynatraceServiceDTO, MetricPackDTO, RiskProfile } from 'services/cv'
import type {
  DynatraceFormDataInterface,
  DynatraceMetricData,
  DynatraceMetricInfo
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.types'
import type { StringKeys } from 'framework/strings'
import { DynatraceProductNames } from '@cv/pages/health-source/HealthSourceDrawer/component/defineHealthSource/DefineHealthSource.constant'
import { NewRelicHealthSourceFieldNames } from '@cv/pages/health-source/connectors/NewRelic/NewRelicHealthSource.constants'
import { DynatraceHealthSourceFieldNames } from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.constants'

export const mapDynatraceMetricDataToHealthSource = (dynatraceMetricData: DynatraceMetricData): UpdatedHealthSource => {
  const specPayload: DynatraceHealthSourceSpec = {
    connectorRef: dynatraceMetricData.connectorRef,
    serviceId: dynatraceMetricData.selectedService?.value as string,
    serviceName: dynatraceMetricData.selectedService?.label as string,
    feature: DynatraceProductNames.APM,
    metricPacks: Object.entries(dynatraceMetricData?.metricData)
      .map(item => {
        return item[1]
          ? {
              identifier: item[0]
            }
          : {}
      })
      .filter(item => !isEmpty(item)),
    metricDefinitions: [],
    serviceMethodIds: dynatraceMetricData.serviceMethods
  }

  if (dynatraceMetricData.customMetrics) {
    for (const entry of dynatraceMetricData.customMetrics.entries()) {
      const {
        identifier = '',
        metricSelector = '',
        metricName = '',
        groupName,
        riskCategory,
        lowerBaselineDeviation,
        higherBaselineDeviation,
        sli,
        continuousVerification,
        healthScore,
        isManualQuery
      } = entry[1]

      const [category, metricType] = riskCategory?.split('/') || []
      const thresholdTypes: RiskProfile['thresholdTypes'] = []

      if (lowerBaselineDeviation) {
        thresholdTypes.push('ACT_WHEN_LOWER')
      }
      if (higherBaselineDeviation) {
        thresholdTypes.push('ACT_WHEN_HIGHER')
      }

      const ifOnlySliIsSelected = Boolean(sli) && !(Boolean(healthScore) || Boolean(continuousVerification))

      const riskProfile: any = {
        category: category,
        metricType: metricType,
        thresholdTypes
      }
      specPayload?.metricDefinitions?.push({
        identifier: identifier,
        metricName,
        metricSelector: metricSelector,
        groupName: groupName?.value as string,
        sli: { enabled: Boolean(sli) },
        analysis: {
          riskProfile: ifOnlySliIsSelected ? {} : riskProfile,
          liveMonitoring: { enabled: Boolean(healthScore) },
          deploymentVerification: { enabled: Boolean(continuousVerification) }
        },
        isManualQuery: isManualQuery
      })
    }
  }

  return {
    type: 'Dynatrace',
    identifier: dynatraceMetricData.healthSourceIdentifier,
    name: dynatraceMetricData.healthSourceName,
    spec: specPayload
  }
}
export const convertMetricPackToMetricData = (value?: MetricPackDTO[]) => {
  const dataObject: { [key: string]: boolean } = {}
  const metricList: MetricPackDTO[] = value || []
  metricList.forEach((i: MetricPackDTO) => (dataObject[i.identifier as string] = true))
  return dataObject
}

export const mapHealthSourceToDynatraceMetricData = (sourceData: any): DynatraceMetricData => {
  const healthSource: UpdatedHealthSource = sourceData?.healthSourceList?.find(
    (source: UpdatedHealthSource) => source.identifier === sourceData.healthSourceIdentifier
  )

  const {
    serviceName = '',
    serviceId = '',
    serviceMethodIds,
    metricPacks = undefined
  } = (healthSource?.spec as DynatraceHealthSourceSpec) || {}

  const metricDefinitions = (healthSource?.spec as DynatraceHealthSourceSpec)?.metricDefinitions || []
  const dynatraceMetricData: DynatraceMetricData = {
    product: sourceData?.product,
    healthSourceName: sourceData?.healthSourceName,
    healthSourceIdentifier: sourceData?.healthSourceIdentifier,
    connectorRef: sourceData?.connectorRef,
    isEdit: sourceData.isEdit,
    selectedService: { label: serviceName, value: serviceId },
    metricPacks,
    metricData: convertMetricPackToMetricData(metricPacks),
    serviceMethods: serviceMethodIds,
    customMetrics: new Map()
  }

  for (const metricDefinition of metricDefinitions) {
    if (metricDefinition?.metricName) {
      dynatraceMetricData?.customMetrics?.set(metricDefinition.metricName, {
        metricName: metricDefinition.metricName,
        identifier: metricDefinition.identifier,
        metricSelector: metricDefinition.metricSelector,
        riskCategory:
          metricDefinition?.analysis?.riskProfile?.category && metricDefinition?.analysis?.riskProfile?.metricType
            ? `${metricDefinition?.analysis?.riskProfile?.category}/${metricDefinition?.analysis?.riskProfile?.metricType}`
            : '',
        lowerBaselineDeviation: metricDefinition?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_LOWER') || false,
        higherBaselineDeviation: metricDefinition?.riskProfile?.thresholdTypes?.includes('ACT_WHEN_HIGHER') || false,
        groupName: metricDefinition.groupName
          ? { label: metricDefinition.groupName || '', value: metricDefinition.groupName || '' }
          : undefined,
        continuousVerification: metricDefinition?.analysis?.deploymentVerification?.enabled,
        healthScore: metricDefinition?.analysis?.liveMonitoring?.enabled,
        sli: metricDefinition.sli?.enabled,
        isManualQuery: metricDefinition.isManualQuery
      })
    }
  }
  return dynatraceMetricData
}

export const mapDynatraceDataToDynatraceForm = (
  dynatraceMetricData: DynatraceMetricData,
  mappedMetrics: Map<string, DynatraceMetricInfo>,
  selectedMetric: string,
  showCustomMetric: boolean
): DynatraceFormDataInterface => {
  return {
    ...dynatraceMetricData,
    ...mappedMetrics.get(selectedMetric),
    metricData: dynatraceMetricData.metricData,
    showCustomMetric
  }
}

export function mapServiceListToOptions(services: DynatraceServiceDTO[]): SelectOption[] {
  return services.map(service => {
    return {
      label: service.displayName || '',
      value: service.entityId || ''
    }
  })
}

export function extractServiceMethodGroups(
  serviceList: DynatraceServiceDTO[],
  selectedServiceId: string
): string[] | undefined {
  return serviceList.find(service => service.entityId === selectedServiceId)?.serviceMethodIds
}

export const validateMapping = (
  dynatraceMetricData: DynatraceFormDataInterface,
  createdMetrics: string[],
  selectedMetricIndex: number,
  getString: (key: StringKeys) => string
): ((key: string) => string) => {
  let errors = {} as any

  const metricValueList = Object.values(dynatraceMetricData?.metricData).filter(val => val)
  if (!metricValueList.length) {
    errors['metricData'] = getString('cv.monitoringSources.appD.validations.selectMetricPack')
  }

  if (!dynatraceMetricData.selectedService.value || dynatraceMetricData.selectedService?.value === 'loading') {
    errors['selectedService'] = getString('cv.healthSource.connectors.Dynatrace.validations.selectedService')
  }

  // if custom metrics are present then validate custom metrics form
  if (dynatraceMetricData?.showCustomMetric) {
    errors = validateCustomMetricFields(dynatraceMetricData, createdMetrics, selectedMetricIndex, errors, getString)
  }
  return errors
}

const validateCustomMetricFields = (
  values: DynatraceMetricInfo,
  createdMetrics: string[],
  selectedMetricIndex: number,
  errors: any,
  getString: (key: StringKeys) => string
): ((key: string | boolean | string[]) => string) => {
  let errorsToReturn = cloneDeep(errors)

  const isAssignComponentValid = [values.sli, values.continuousVerification, values.healthScore].find(i => i) || false
  const isRiskCategoryValid = !!values?.riskCategory

  const duplicateNames = createdMetrics?.filter((metricName, index) => {
    if (index === selectedMetricIndex) {
      return false
    }
    return metricName === values.metricName
  })

  if (!values.groupName || !values.groupName?.value) {
    errorsToReturn[DynatraceHealthSourceFieldNames.GROUP_NAME] = getString(
      'cv.monitoringSources.prometheus.validation.groupName'
    )
  }
  if (!values.metricName) {
    errorsToReturn[DynatraceHealthSourceFieldNames.METRIC_NAME] = getString('cv.monitoringSources.metricNameValidation')
  }
  if (!values.metricSelector) {
    errorsToReturn[DynatraceHealthSourceFieldNames.METRIC_SELECTOR] = getString(
      'cv.healthSource.connectors.NewRelic.validations.nrql'
    )
  }
  if (values.metricName && duplicateNames.length) {
    errorsToReturn[DynatraceHealthSourceFieldNames.METRIC_NAME] = getString(
      'cv.monitoringSources.prometheus.validation.metricNameUnique'
    )
  }
  errorsToReturn = validateAssignComponent(isAssignComponentValid, errors, getString, values, isRiskCategoryValid)
  return errorsToReturn
}

const validateAssignComponent = (
  isAssignComponentValid: boolean,
  errors: any,
  getString: (key: StringKeys) => string,
  values: any,
  isRiskCategoryValid: boolean
): ((key: string | boolean | string[]) => string) => {
  const assignErrors = cloneDeep(errors)
  if (!isAssignComponentValid) {
    assignErrors['sli'] = getString('cv.monitoringSources.gco.mapMetricsToServicesPage.validation.baseline')
  } else if (isAssignComponentValid) {
    if (values.continuousVerification || values.healthScore) {
      if (values.lowerBaselineDeviation !== true && values.higherBaselineDeviation !== true) {
        assignErrors['lowerBaselineDeviation'] = getString('cv.monitoringSources.prometheus.validation.deviation')
      }
      if (!isRiskCategoryValid) {
        assignErrors['riskCategory'] = getString(
          'cv.monitoringSources.gco.mapMetricsToServicesPage.validation.riskCategory'
        )
      }
    }
  }
  return assignErrors
}

export const onSubmitDynatraceData = (
  formik: FormikProps<DynatraceFormDataInterface>,
  mappedMetrics: Map<string, DynatraceMetricInfo>,
  selectedMetric: string,
  selectedMetricIndex: number,
  createdMetrics: string[],
  getString: (key: StringKeys) => string,
  onSubmit: (healthSourcePayload: DynatraceMetricData) => void
): void => {
  formik.setTouched({
    ...formik.touched,
    [DynatraceHealthSourceFieldNames.DYNATRACE_SELECTED_SERVICE]: true,
    [DynatraceHealthSourceFieldNames.METRIC_DATA]: { Performance: true },
    [DynatraceHealthSourceFieldNames.METRIC_NAME]: true,
    [DynatraceHealthSourceFieldNames.GROUP_NAME]: true,
    [NewRelicHealthSourceFieldNames.SLI]: true,
    [NewRelicHealthSourceFieldNames.CONTINUOUS_VERIFICATION]: true,
    [NewRelicHealthSourceFieldNames.LOWER_BASELINE_DEVIATION]: true,
    [NewRelicHealthSourceFieldNames.RISK_CATEGORY]: true
  })
  const errors = validateMapping(formik.values, createdMetrics, selectedMetricIndex, getString)
  if (Object.keys(errors || {})?.length > 0) {
    formik.validateForm()
    return
  }
  const updatedMetric = formik.values
  if (updatedMetric.showCustomMetric) {
    mappedMetrics.set(selectedMetric, updatedMetric)
  }
  const updatedValues = { ...formik.values, customMetrics: mappedMetrics }
  onSubmit(updatedValues)
}
