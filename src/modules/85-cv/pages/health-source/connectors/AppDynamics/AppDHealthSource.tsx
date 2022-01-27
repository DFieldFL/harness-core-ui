/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useState } from 'react'
import { noop } from 'lodash-es'
import { useParams } from 'react-router-dom'
import {
  Color,
  Text,
  Button,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Layout,
  SelectOption,
  Utils,
  useToaster
} from '@wings-software/uicore'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  useGetAppDynamicsApplications,
  useGetAppDynamicsTiers,
  MetricPackDTO,
  AppdynamicsValidationResponse
} from 'services/cv'
import { Connectors } from '@connectors/constants'
import { useStrings } from 'framework/strings'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import DrawerFooter from '@cv/pages/health-source/common/DrawerFooter/DrawerFooter'
import ValidationStatus from '@cv/pages/components/ValidationStatus/ValidationStatus'
import MetricsVerificationModal from '@cv/components/MetricsVerificationModal/MetricsVerificationModal'
import { StatusOfValidation } from '@cv/pages/components/ValidationStatus/ValidationStatus.constants'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import {
  getOptions,
  getInputGroupProps,
  validateMetrics,
  createMetricDataFormik
} from '../MonitoredServiceConnector.utils'
import { HealthSoureSupportedConnectorTypes } from '../MonitoredServiceConnector.constants'
import AppDMappedMetric from './Components/AppDMappedMetric/AppDMappedMetric'
import {
  createAppDFormData,
  initializeCreatedMetrics,
  initializeNonCustomFields,
  initializeSelectedMetricsMap,
  setAppDynamicsApplication,
  setAppDynamicsTier,
  submitData,
  validateMapping
} from './AppDHealthSource.utils'
import type {
  AppDynamicsData,
  CreatedMetricsWithSelectedIndex,
  AppDynamicsFomikFormInterface,
  SelectedAndMappedMetrics
} from './AppDHealthSource.types'
import MetricPackCustom from '../MetricPackCustom'
import css from './AppDHealthSource.module.scss'

export default function AppDMonitoredSource({
  data: appDynamicsData,
  onSubmit,
  onPrevious
}: {
  data: AppDynamicsData
  onSubmit: (healthSourcePayload: any) => void
  onPrevious: () => void
}): JSX.Element {
  const { getString } = useStrings()
  const { showError, clear } = useToaster()

  const [selectedMetricPacks, setSelectedMetricPacks] = useState<MetricPackDTO[]>([])
  const [validationResultData, setValidationResultData] = useState<AppdynamicsValidationResponse[]>()
  const [appDValidation, setAppDValidation] = useState<{
    status: string
    result: AppdynamicsValidationResponse[] | []
  }>({
    status: '',
    result: []
  })
  const [guidMap, setGuidMap] = useState(new Map())
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const connectorIdentifier = (appDynamicsData?.connectorRef?.connector?.identifier ||
    appDynamicsData?.connectorRef) as string

  const {
    data: applicationsData,
    loading: applicationLoading,
    error: applicationError
  } = useGetAppDynamicsApplications({
    queryParams: {
      accountId,
      connectorIdentifier,
      orgIdentifier,
      projectIdentifier,
      offset: 0,
      pageSize: 10000,
      filter: ''
    }
  })

  const {
    data: tierData,
    loading: tierLoading,
    refetch: refetchTier,
    error: tierError
  } = useGetAppDynamicsTiers({
    lazy: true
  })

  useEffect(() => {
    if (appDynamicsData?.applicationName) {
      refetchTier({
        queryParams: {
          appName: appDynamicsData?.applicationName,
          accountId,
          connectorIdentifier,
          orgIdentifier,
          projectIdentifier,
          offset: 0,
          pageSize: 10000,
          filter: ''
        }
      })
    }
  }, [appDynamicsData?.applicationName])

  const onValidate = async (appName: string, tierName: string, metricObject: { [key: string]: any }): Promise<void> => {
    setAppDValidation({ status: StatusOfValidation.IN_PROGRESS, result: [] })
    const filteredMetricPack = selectedMetricPacks.filter(item => metricObject[item.identifier as string])
    const guid = Utils.randomId()
    setGuidMap(oldMap => {
      oldMap.set(tierName, guid)
      return new Map(oldMap)
    })
    const { validationStatus, validationResult } = await validateMetrics(
      filteredMetricPack || [],
      {
        accountId,
        appName: appName,
        tierName: tierName,
        connectorIdentifier: connectorIdentifier,
        orgIdentifier,
        projectIdentifier,
        requestGuid: guid
      },
      HealthSoureSupportedConnectorTypes.APP_DYNAMICS
    )
    setAppDValidation({
      status: validationStatus as string,
      result: validationResult as AppdynamicsValidationResponse[]
    })
  }

  if (applicationError || tierError) {
    clear()
    tierError && showError(getErrorMessage(tierError))
    applicationError && showError(getErrorMessage(applicationError))
  }

  const applicationOptions: SelectOption[] = useMemo(
    () =>
      getOptions(
        applicationLoading,
        applicationsData?.data?.content,
        HealthSoureSupportedConnectorTypes.APP_DYNAMICS,
        getString
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [applicationLoading]
  )

  const tierOptions: SelectOption[] = useMemo(
    () => getOptions(tierLoading, tierData?.data?.content, HealthSoureSupportedConnectorTypes.APP_DYNAMICS, getString),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tierLoading]
  )

  useEffect(() => {
    if (
      appDynamicsData.isEdit &&
      selectedMetricPacks.length &&
      appDValidation.status !== StatusOfValidation.IN_PROGRESS
    ) {
      onValidate(
        appDynamicsData?.applicationName,
        appDynamicsData?.tierName,
        createMetricDataFormik(appDynamicsData?.metricPacks)
      )
    }
  }, [selectedMetricPacks, tierLoading, appDynamicsData.isEdit])

  const [showCustomMetric, setShowCustomMetric] = useState(!!Array.from(appDynamicsData?.mappedServicesAndEnvs)?.length)

  const [{ selectedMetric, mappedMetrics }, setMappedMetrics] = useState<SelectedAndMappedMetrics>(
    initializeSelectedMetricsMap(
      getString('cv.monitoringSources.appD.defaultAppDMetricName'),
      appDynamicsData?.mappedServicesAndEnvs
    )
  )

  const [{ createdMetrics, selectedMetricIndex }, setCreatedMetrics] = useState<CreatedMetricsWithSelectedIndex>(
    initializeCreatedMetrics(
      getString('cv.monitoringSources.appD.defaultAppDMetricName'),
      selectedMetric,
      mappedMetrics
    )
  )

  const [nonCustomFeilds, setNonCustomFeilds] = useState(initializeNonCustomFields(appDynamicsData))

  const initPayload = useMemo(
    () => createAppDFormData(appDynamicsData, mappedMetrics, selectedMetric, nonCustomFeilds, showCustomMetric),
    [appDynamicsData, mappedMetrics, selectedMetric, nonCustomFeilds, showCustomMetric]
  )

  return (
    <Formik<AppDynamicsFomikFormInterface>
      enableReinitialize
      formName={'appDHealthSourceform'}
      isInitialValid={(args: any) =>
        Object.keys(validateMapping(args.initialValues, createdMetrics, selectedMetricIndex, getString)).length === 0
      }
      validate={values => {
        return validateMapping(values, createdMetrics, selectedMetricIndex, getString)
      }}
      initialValues={initPayload}
      onSubmit={noop}
    >
      {formik => {
        return (
          <FormikForm className={css.formFullheight}>
            <CardWithOuterTitle title={getString('cv.healthSource.connectors.AppDynamics.applicationsAndTiers')}>
              <Layout.Horizontal spacing={'large'} className={css.horizontalCenterAlign}>
                <Container margin={{ bottom: 'small' }} width={'300px'} color={Color.BLACK}>
                  <FormInput.Select
                    className={css.applicationDropdown}
                    onChange={item => {
                      refetchTier({
                        queryParams: {
                          appName: item.label.toString(),
                          accountId,
                          connectorIdentifier,
                          orgIdentifier,
                          projectIdentifier,
                          offset: 0,
                          pageSize: 10000
                        }
                      })
                      setNonCustomFeilds({
                        ...nonCustomFeilds,
                        appdApplication: item.label
                      })
                      setAppDValidation({ status: '', result: [] })
                    }}
                    value={setAppDynamicsApplication(formik?.values?.appdApplication, applicationOptions)}
                    name={'appdApplication'}
                    placeholder={
                      applicationLoading
                        ? getString('loading')
                        : getString('cv.healthSource.connectors.AppDynamics.applicationPlaceholder')
                    }
                    items={applicationOptions}
                    label={getString('cv.healthSource.connectors.AppDynamics.applicationLabel')}
                    {...getInputGroupProps(() =>
                      setNonCustomFeilds({
                        ...nonCustomFeilds,
                        appdApplication: ''
                      })
                    )}
                  />
                </Container>
                {!!formik.values.appdApplication && (
                  <Container margin={{ bottom: 'small' }} width={'300px'} color={Color.BLACK}>
                    <FormInput.Select
                      className={css.tierDropdown}
                      name={'appDTier'}
                      placeholder={
                        tierLoading
                          ? getString('loading')
                          : getString('cv.healthSource.connectors.AppDynamics.tierPlaceholder')
                      }
                      value={setAppDynamicsTier(tierLoading, formik?.values?.appDTier, tierOptions)}
                      onChange={async item => {
                        setNonCustomFeilds({
                          ...nonCustomFeilds,
                          appDTier: item.label
                        })
                        await onValidate(formik.values.appdApplication, item.label as string, formik.values.metricData)
                      }}
                      items={tierOptions}
                      label={getString('cv.healthSource.connectors.AppDynamics.trierLabel')}
                      {...getInputGroupProps(() =>
                        setNonCustomFeilds({
                          ...nonCustomFeilds,
                          appDTier: ''
                        })
                      )}
                    />
                  </Container>
                )}
                <Container width={'300px'} color={Color.BLACK}>
                  {formik.values?.appDTier && formik?.values.appdApplication && (
                    <ValidationStatus
                      validationStatus={appDValidation?.status as StatusOfValidation}
                      onClick={
                        appDValidation.result?.length ? () => setValidationResultData(appDValidation.result) : undefined
                      }
                      onRetry={() =>
                        onValidate(formik.values.appdApplication, formik.values.appDTier, formik.values.metricData)
                      }
                    />
                  )}
                </Container>
              </Layout.Horizontal>
            </CardWithOuterTitle>
            <CardWithOuterTitle title={getString('metricPacks')}>
              <Layout.Vertical>
                <Text color={Color.BLACK}>{getString('cv.healthSource.connectors.AppDynamics.metricPackLabel')}</Text>
                <Layout.Horizontal spacing={'large'} className={css.horizontalCenterAlign}>
                  <MetricPackCustom
                    setMetricDataValue={value => {
                      setNonCustomFeilds({
                        ...nonCustomFeilds,
                        metricData: value
                      })
                    }}
                    metricPackValue={formik.values.metricPacks}
                    metricDataValue={formik.values.metricData}
                    setSelectedMetricPacks={setSelectedMetricPacks}
                    connector={HealthSoureSupportedConnectorTypes.APP_DYNAMICS}
                    onChange={async metricValue => {
                      setNonCustomFeilds({
                        ...nonCustomFeilds,
                        metricData: metricValue
                      })
                      await onValidate(formik?.values?.appdApplication, formik?.values?.appDTier, metricValue)
                    }}
                  />
                  {validationResultData && (
                    <MetricsVerificationModal
                      verificationData={validationResultData}
                      guid={guidMap.get(formik?.values?.appDTier)}
                      onHide={setValidationResultData as () => void}
                      verificationType={Connectors.APP_DYNAMICS}
                    />
                  )}
                </Layout.Horizontal>
              </Layout.Vertical>
            </CardWithOuterTitle>
            {showCustomMetric ? (
              <AppDMappedMetric
                isValidInput={formik.isValid}
                setMappedMetrics={setMappedMetrics}
                selectedMetric={selectedMetric}
                formikValues={formik.values}
                formikSetField={formik.setFieldValue}
                connectorIdentifier={connectorIdentifier}
                mappedMetrics={mappedMetrics}
                createdMetrics={createdMetrics}
                setCreatedMetrics={setCreatedMetrics}
              />
            ) : (
              <CardWithOuterTitle title={getString('cv.healthSource.connectors.customMetrics')}>
                <Button
                  disabled={!(!!formik?.values?.appdApplication && !!formik?.values?.appDTier)}
                  icon="plus"
                  minimal
                  intent="primary"
                  onClick={() => setShowCustomMetric(true)}
                >
                  {getString('cv.monitoringSources.addMetric')}
                </Button>
              </CardWithOuterTitle>
            )}
            <DrawerFooter
              isSubmit
              onPrevious={onPrevious}
              onNext={() =>
                submitData(
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
