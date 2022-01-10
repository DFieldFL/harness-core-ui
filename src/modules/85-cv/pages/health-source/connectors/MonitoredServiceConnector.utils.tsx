/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Button, IconName, SelectOption } from '@wings-software/uicore'
import isEmpty from 'lodash-es/isEmpty'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { UseStringsReturn } from 'framework/strings'
import {
  AppdynamicsValidationResponse,
  getNewRelicMetricDataPromise,
  getAppDynamicsMetricDataPromise,
  GetNewRelicMetricDataQueryParams,
  GetAppDynamicsMetricDataQueryParams,
  MetricPackDTO,
  MetricPackDTOArrayRequestBody,
  MetricPackValidationResponse,
  ResponseMetricPackValidationResponse,
  ResponseSetAppdynamicsValidationResponse,
  HealthSource,
  GetDynatraceMetricDataQueryParams,
  getDynatraceMetricDataPromise,
  DynatraceValidateDataRequestDTO
} from 'services/cv'
import { StatusOfValidation } from '@cv/pages/components/ValidationStatus/ValidationStatus.constants'
import { StatusState, HealthSoureSupportedConnectorTypes } from './MonitoredServiceConnector.constants'
import type { UpdatedHealthSource } from '../HealthSourceDrawer/HealthSourceDrawerContent.types'
import css from './NewRelic/NewrelicMonitoredSource.module.scss'

export const createPayloadByConnectorType = (formData: any, connector: string): UpdatedHealthSource | null => {
  let type: HealthSource['type']
  let specPayload = {}
  switch (connector) {
    case HealthSoureSupportedConnectorTypes.APP_DYNAMICS:
      type = 'AppDynamics'
      specPayload = {
        applicationName: formData.appdApplication as string,
        tierName: formData.appDTier as string
      }
      break
    case HealthSoureSupportedConnectorTypes.NEW_RELIC:
      type = 'NewRelic'
      specPayload = {
        ...formData,
        applicationName: formData?.newRelicApplication?.label,
        applicationId: formData?.newRelicApplication?.value
      }
      break
    default:
      return null
  }

  const healthSourcesPayload = {
    name: formData.name || (formData.healthSourceName as string),
    identifier: formData.identifier || (formData.healthSourceIdentifier as string),
    type,
    spec: {
      ...specPayload,
      feature: formData.product?.value as string,
      connectorRef: (formData?.connectorRef?.connector?.identifier as string) || (formData.connectorRef as string),
      metricPacks: Object.entries(formData.metricData)
        .map(item => {
          return item[1]
            ? {
                identifier: item[0]
              }
            : {}
        })
        .filter(item => !isEmpty(item))
    }
  }

  return healthSourcesPayload
}

export const InputIcon = ({ icon, onClick }: { icon: IconName; onClick?: () => void }): React.ReactElement => (
  <Button
    minimal
    icon={icon}
    iconProps={{ size: 15 }}
    onClick={onClick}
    margin={{ right: 'xsmall' }}
    className={css.iconButton}
  />
)

export const getInputGroupProps = (onClick: () => void) => {
  return {
    inputGroup: {
      leftElement: <InputIcon icon={'search'} />,
      rightElement: <InputIcon icon={'cross'} onClick={onClick} />
    }
  }
}

export const getOptions = (
  loading: boolean,
  data: any,
  connector: string,
  getString: UseStringsReturn['getString']
): SelectOption[] => {
  if (!data) return []
  return loading
    ? [{ label: getString('loading'), value: '' }]
    : data.map((item: any) => {
        if (HealthSoureSupportedConnectorTypes.NEW_RELIC === connector) {
          return { value: item.applicationId as unknown as string, label: item.applicationName as string }
        } else {
          return { value: item.id as unknown as string, label: item.name as string }
        }
      }) || []
}

export const createMetricDataFormik = (metricPacks: MetricPackDTO[] | undefined): { [key: string]: boolean } => {
  const metricData: { [key: string]: boolean } = {}
  if (!metricPacks) {
    metricPacks = []
  }
  metricPacks.forEach((i: MetricPackDTO) => (metricData[i.identifier as string] = true))
  return metricData
}

export async function validateMetrics(
  bodyData: MetricPackDTOArrayRequestBody | DynatraceValidateDataRequestDTO,
  queryParams:
    | GetAppDynamicsMetricDataQueryParams
    | GetNewRelicMetricDataQueryParams
    | GetDynatraceMetricDataQueryParams,
  connector: string
): Promise<{ validationStatus: string | undefined; validationResult?: AppdynamicsValidationResponse[]; error?: any }> {
  try {
    let response: ResponseMetricPackValidationResponse | ResponseSetAppdynamicsValidationResponse | null = null
    let data: AppdynamicsValidationResponse[] | null | undefined = null
    switch (connector) {
      case HealthSoureSupportedConnectorTypes.APP_DYNAMICS:
        if (queryParams) {
          const appDQueryParam = queryParams as GetAppDynamicsMetricDataQueryParams
          response = await getAppDynamicsMetricDataPromise({
            queryParams: appDQueryParam,
            body: bodyData as MetricPackDTOArrayRequestBody
          })
          data = response?.data
        }
        break
      case HealthSoureSupportedConnectorTypes.NEW_RELIC:
        if (queryParams) {
          const newRelicQueryParam = queryParams as GetNewRelicMetricDataQueryParams
          response = await getNewRelicMetricDataPromise({
            queryParams: newRelicQueryParam,
            body: bodyData as MetricPackDTOArrayRequestBody
          })
          data = response?.data && transformNewRelicDataToAppd([response?.data])
        }
        break
      case HealthSoureSupportedConnectorTypes.DYNATRACE:
        if (queryParams) {
          const dynatraceQueryParam = queryParams as GetDynatraceMetricDataQueryParams
          response = await getDynatraceMetricDataPromise({
            queryParams: dynatraceQueryParam,
            body: bodyData as DynatraceValidateDataRequestDTO
          })
          data = response?.data && transformNewRelicDataToAppd(response?.data)
        }
        break
      default:
        break
    }

    if (response?.status === 'ERROR') {
      return { validationStatus: undefined, error: getErrorMessage({ data: response }) }
    }

    if (data?.length) {
      let status
      if (data?.some(val => val.overallStatus === StatusState.FAILED)) {
        status = StatusOfValidation.ERROR
      } else if (data?.some(val => val.overallStatus === StatusState.NO_DATA)) {
        status = StatusOfValidation.NO_DATA
      } else if (data?.every(val => val.overallStatus === StatusState.SUCCESS)) {
        status = StatusOfValidation.SUCCESS
      }
      return { validationStatus: status, validationResult: data }
    }
    return { validationStatus: undefined }
  } catch (e) {
    return { validationStatus: undefined, error: getErrorMessage(e) }
  }
}

export function transformNewRelicDataToAppd(
  metricData: MetricPackValidationResponse[]
): AppdynamicsValidationResponse[] {
  return metricData.map(metricDataItem => {
    const appDMeticData: AppdynamicsValidationResponse = {
      overallStatus: metricDataItem.overallStatus,
      metricPackName: metricDataItem.metricPackName,
      values: []
    }
    for (const newRelicData of metricDataItem.metricValidationResponses || []) {
      appDMeticData.values?.push({
        value: newRelicData.value,
        apiResponseStatus: newRelicData.status,
        metricName: newRelicData.metricName
      })
    }
    return appDMeticData
  })
}
