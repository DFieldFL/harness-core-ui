/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Color, Container, FormInput, Layout, Text, Utils } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import { HealthSoureSupportedConnectorTypes } from '@cv/pages/health-source/connectors/MonitoredServiceConnector.constants'
import {
  extractServiceMethodGroups,
  mapServiceListToOptions
} from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.utils'
import {
  createMetricDataFormik,
  getInputGroupProps,
  validateMetrics
} from '@cv/pages/health-source/connectors/MonitoredServiceConnector.utils'
import ValidationStatus from '@cv/pages/components/ValidationStatus/ValidationStatus'
import { StatusOfValidation } from '@cv/pages/components/ValidationStatus/ValidationStatus.constants'
import MetricPackCustom from '@cv/pages/health-source/connectors/MetricPackCustom'
import MetricsVerificationModal from '@cv/components/MetricsVerificationModal/MetricsVerificationModal'
import { Connectors } from '@connectors/constants'
import { MetricPackDTO, MetricPackValidationResponse, useGetDynatraceServices } from 'services/cv'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { DynatraceMetricPacksToServiceTypesProps } from '@cv/pages/health-source/connectors/Dynatrace/components/DynatraceMetricPacksToService/DynatraceMetricPacksToService.types'
import css from '@cv/pages/health-source/connectors/Dynatrace/DynatraceHealthSource.module.scss'

export default function DynatraceMetricPacksToService(props: DynatraceMetricPacksToServiceTypesProps): JSX.Element {
  const { connectorIdentifier, dynatraceMetricData, setDynatraceMetricData, metricValues } = props
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const [servicesTracingId, validationTracingId] = useMemo(() => [Utils.randomId(), Utils.randomId()], [])
  const [validationResultData, setValidationResultData] = useState<MetricPackValidationResponse[]>()
  const [selectedMetricPacks, setSelectedMetricPacks] = useState<MetricPackDTO[]>([])

  const [dynatraceValidation, setDynatraceValidation] = useState<{
    status: string
    result: MetricPackValidationResponse[] | []
  }>({
    status: '',
    result: []
  })

  const { data: servicesListData, loading: servicesListLoading } = useGetDynatraceServices({
    queryParams: {
      accountId,
      connectorIdentifier,
      orgIdentifier,
      projectIdentifier,
      tracingId: servicesTracingId
    }
  })
  const dynatraceServiceOptions = useMemo(() => {
    return mapServiceListToOptions(servicesListData?.data || [])
  }, [servicesListData?.data])

  const onValidate = async (serviceMethods: string[], metricObject: { [key: string]: any }): Promise<void> => {
    setDynatraceValidation({ status: StatusOfValidation.IN_PROGRESS, result: [] })
    const filteredMetricPack = selectedMetricPacks?.filter(item => metricObject[item.identifier as string])
    const { validationStatus, validationResult } = await validateMetrics(
      { metricPacks: filteredMetricPack || [], serviceMethodsIds: serviceMethods },
      {
        accountId,
        connectorIdentifier: connectorIdentifier,
        orgIdentifier,
        projectIdentifier,
        tracingId: validationTracingId
      },
      HealthSoureSupportedConnectorTypes.DYNATRACE
    )
    setDynatraceValidation({
      status: validationStatus as string,
      result: validationResult as MetricPackValidationResponse[]
    })
  }
  useEffect(() => {
    if (
      dynatraceMetricData?.selectedService?.value &&
      selectedMetricPacks.length &&
      dynatraceValidation.status !== StatusOfValidation.IN_PROGRESS
    ) {
      onValidate(dynatraceMetricData?.serviceMethods || [], createMetricDataFormik(selectedMetricPacks))
    }
  }, [selectedMetricPacks, dynatraceMetricData?.selectedService, dynatraceMetricData.serviceMethods])
  return (
    <>
      <CardWithOuterTitle title={'Services'}>
        <Layout.Horizontal spacing={'large'} className={css.horizontalCenterAlign}>
          <Container margin={{ bottom: 'small' }} width={'400px'} color={Color.BLACK}>
            <FormInput.Select
              className={css.applicationDropdown}
              onChange={item => {
                setDynatraceMetricData({
                  ...dynatraceMetricData,
                  selectedService: { ...item },
                  serviceMethods: extractServiceMethodGroups(servicesListData?.data || [], item.value as string)
                })
              }}
              value={dynatraceMetricData?.selectedService}
              name={'dynatraceService'}
              placeholder={
                servicesListLoading
                  ? getString('loading')
                  : getString('cv.healthSource.connectors.Dynatrace.servicePlaceholder')
              }
              items={dynatraceServiceOptions}
              label={getString('cv.healthSource.connectors.Dynatrace.servicesLabel')}
              {...getInputGroupProps(() =>
                setDynatraceMetricData({ ...dynatraceMetricData, selectedService: { label: '', value: '' } })
              )}
            />
          </Container>
          <Container width={'300px'} color={Color.BLACK}>
            {metricValues?.selectedService?.value && (
              <ValidationStatus
                validationStatus={dynatraceValidation?.status as StatusOfValidation}
                onClick={
                  dynatraceValidation.result?.length
                    ? () => setValidationResultData(dynatraceValidation.result)
                    : undefined
                }
                onRetry={() => onValidate(metricValues?.serviceMethods || [], metricValues?.metricData)}
              />
            )}
          </Container>
        </Layout.Horizontal>
        <Container>
          <Text icon="warning-sign" iconProps={{ size: 14 }}>
            {getString('cv.healthSource.connectors.Dynatrace.keyRequestRequiredLabel')}
          </Text>
        </Container>
      </CardWithOuterTitle>
      <CardWithOuterTitle title={getString('metricPacks')}>
        <Layout.Vertical>
          <Text color={Color.BLACK}>{getString('cv.healthSource.connectors.AppDynamics.metricPackLabel')}</Text>
          <Layout.Horizontal spacing={'large'} className={css.horizontalCenterAlign}>
            <MetricPackCustom
              setMetricDataValue={value => {
                setDynatraceMetricData({
                  ...dynatraceMetricData,
                  metricData: value
                })
              }}
              metricPackValue={metricValues?.metricPacks}
              metricDataValue={metricValues?.metricData}
              setSelectedMetricPacks={setSelectedMetricPacks}
              connector={HealthSoureSupportedConnectorTypes.DYNATRACE}
              onChange={async metricValue => {
                setDynatraceMetricData({
                  ...metricValues,
                  metricData: metricValue
                })
                await onValidate(metricValues?.serviceMethods || [], metricValue)
              }}
            />
            {validationResultData && (
              <MetricsVerificationModal
                verificationData={validationResultData}
                guid={validationTracingId}
                onHide={setValidationResultData as () => void}
                verificationType={Connectors.DYNATRACE}
              />
            )}
          </Layout.Horizontal>
        </Layout.Vertical>
      </CardWithOuterTitle>
    </>
  )
}
