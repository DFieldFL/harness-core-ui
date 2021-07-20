import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Form } from 'formik'
import * as Yup from 'yup'
import cx from 'classnames'
import { get, memoize } from 'lodash-es'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import {
  Text,
  Accordion,
  Layout,
  Button,
  FormInput,
  Formik,
  StepProps,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Color,
  SelectOption
} from '@wings-software/uicore'

import { Menu } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { ConnectorConfigDTO, ManifestConfig, ManifestConfigWrapper, useGetBucketListForS3 } from 'services/cd-ng'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useListAwsRegions } from 'services/portal'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import type { CommandFlags, HelmWithS3DataType } from '../../ManifestInterface'
import HelmAdvancedStepSection from '../HelmAdvancedStepSection'

import { helmVersions, ManifestDataType, ManifestIdentifierValidation } from '../../Manifesthelper'
import css from '../ManifestWizardSteps.module.scss'
import helmcss from '../HelmWithGIT/HelmWithGIT.module.scss'

interface HelmWithHttpPropType {
  stepName: string
  expressions: string[]
  initialValues: ManifestConfig
  handleSubmit: (data: ManifestConfigWrapper) => void
  manifestIdsList: Array<string>
  isReadonly?: boolean
}

const commandFlagOptionsV2 = [
  { label: 'Fetch', value: 'Fetch' },
  { label: 'Template ', value: 'Template' }
]
const commandFlagOptionsV3 = [
  { label: 'Pull', value: 'Pull' },
  { label: 'Template ', value: 'Template' }
]

const HelmWithS3: React.FC<StepProps<ConnectorConfigDTO> & HelmWithHttpPropType> = ({
  stepName,
  prevStepData,
  expressions,
  initialValues,
  handleSubmit,
  previousStep,
  manifestIdsList,
  isReadonly = false
}) => {
  const { getString } = useStrings()
  const [regions, setRegions] = useState<SelectOption[]>([])

  /* Code related to region */
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()

  const { data: regionData } = useListAwsRegions({
    queryParams: {
      accountId
    }
  })

  React.useEffect(() => {
    const regionValues = (regionData?.resource || []).map(region => ({
      value: region.value,
      label: region.name
    }))

    setRegions(regionValues as SelectOption[])
  }, [regionData?.resource])
  /* Code related to region */

  /* Code related to bucketName */

  const fetchBucket = (regionValue: string): void => {
    refetchBuckets({
      queryParams: {
        connectorRef: prevStepData?.connectorRef?.value,
        region: regionValue,
        accountIdentifier: accountId,
        projectIdentifier,
        orgIdentifier
      }
    })
  }
  const {
    data: bucketData,
    error,
    loading,
    refetch: refetchBuckets
  } = useGetBucketListForS3({
    lazy: true,
    debounce: 300
  })

  const getSelectItems = React.useCallback(() => {
    return Object.keys(bucketData?.data || []).map(bucket => ({
      value: bucket,
      label: bucket
    }))
  }, [bucketData?.data])

  const buckets = loading ? [{ label: 'Loading Buckets...', value: 'Loading Buckets...' }] : getSelectItems()
  const itemRenderer = memoize((item: { label: string }, { handleClick }) => (
    <div key={item.label.toString()}>
      <Menu.Item
        text={
          <Layout.Horizontal spacing="small">
            <Text>{item.label}</Text>
          </Layout.Horizontal>
        }
        disabled={loading}
        onClick={handleClick}
      />
    </div>
  ))

  /* Code related to bucketName */

  const isActiveAdvancedStep: boolean = initialValues?.spec?.skipResourceVersioning || initialValues?.spec?.commandFlags
  const [selectedHelmVersion, setHelmVersion] = React.useState(initialValues?.spec?.helmVersion ?? 'V2')

  const getInitialValues = (): HelmWithS3DataType => {
    const specValues = get(initialValues, 'spec.store.spec', null)

    if (specValues) {
      const values = {
        ...specValues,
        identifier: initialValues.identifier,
        folderPath: specValues.folderPath,
        region: specValues?.region,
        helmVersion: initialValues.spec?.helmVersion,
        chartName: initialValues.spec?.chartName,
        chartVersion: initialValues.spec?.chartVersion,
        skipResourceVersioning: initialValues?.spec?.skipResourceVersioning,
        commandFlags: initialValues.spec?.commandFlags?.map((commandFlag: { commandType: string; flag: string }) => ({
          commandType: { label: commandFlag.commandType, value: commandFlag.commandType },
          flag: commandFlag.flag
          // id: uuid(commandFlag, nameSpace())
        })) || [{ commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }]
      }

      if (
        getMultiTypeFromValue(specValues?.bucketName) === MultiTypeInputType.FIXED &&
        getMultiTypeFromValue(prevStepData?.connectorRef) === MultiTypeInputType.FIXED &&
        getMultiTypeFromValue(specValues?.region) === MultiTypeInputType.FIXED
      ) {
        values.bucketName = { label: specValues?.bucketName, value: specValues?.bucketName }
      } else {
        values.bucketName = specValues?.bucketName
      }
      return values
    }
    return {
      identifier: '',
      bucketName: '',
      region: '',
      folderPath: '',
      helmVersion: 'V2',
      chartName: '',
      chartVersion: '',
      skipResourceVersioning: false,
      commandFlags: [{ commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }]
    }
  }

  const submitFormData = (formData: HelmWithS3DataType & { store?: string; connectorRef?: string }): void => {
    const manifestObj: ManifestConfigWrapper = {
      manifest: {
        identifier: formData.identifier,
        type: ManifestDataType.HelmChart,
        spec: {
          store: {
            type: formData?.store,
            spec: {
              connectorRef: formData?.connectorRef,
              bucketName: (formData?.bucketName as SelectOption)?.value ?? formData?.bucketName,
              folderPath: formData?.folderPath,
              region: (formData?.region as SelectOption)?.value ?? formData?.region
            }
          },
          chartName: formData?.chartName,
          chartVersion: formData?.chartVersion,
          helmVersion: formData?.helmVersion,
          skipResourceVersioning: formData?.skipResourceVersioning
        }
      }
    }

    if (formData?.commandFlags.length && formData?.commandFlags[0].commandType) {
      ;(manifestObj?.manifest?.spec as any).commandFlags = formData?.commandFlags.map((commandFlag: CommandFlags) =>
        commandFlag.commandType && commandFlag.flag
          ? {
              commandType: (commandFlag.commandType as SelectOption)?.value as string,
              flag: commandFlag.flag
            }
          : {}
      )
    }

    handleSubmit(manifestObj)
  }

  return (
    <Layout.Vertical spacing="xxlarge" padding="small" className={css.manifestStore}>
      <Text font="large" color={Color.GREY_800}>
        {stepName}
      </Text>
      <Formik
        initialValues={getInitialValues()}
        formName="helmWithS3"
        validationSchema={Yup.object().shape({
          ...ManifestIdentifierValidation(
            manifestIdsList,
            initialValues?.identifier,
            getString('pipeline.uniqueIdentifier')
          ),
          folderPath: Yup.string().trim().required(getString('pipeline.manifestType.chartPathRequired')),
          chartName: Yup.string().trim().required(getString('pipeline.manifestType.http.chartNameRequired')),
          helmVersion: Yup.string().trim().required(getString('pipeline.manifestType.helmVersionRequired')),
          region: Yup.string().trim().required(getString('pipeline.artifactsSelection.validation.region')),
          bucketName: Yup.string().trim().required(getString('pipeline.manifestType.bucketNameRequired')),
          commandFlags: Yup.array().of(
            Yup.object().shape({
              flag: Yup.string().when('commandType', {
                is: val => val?.value !== undefined,
                then: Yup.string().required(getString('pipeline.manifestType.commandFlagRequired'))
              })
            })
          )
        })}
        onSubmit={formData => {
          submitFormData({
            ...prevStepData,
            ...formData,
            connectorRef: prevStepData?.connectorRef
              ? getMultiTypeFromValue(prevStepData?.connectorRef) === MultiTypeInputType.RUNTIME
                ? prevStepData?.connectorRef
                : prevStepData?.connectorRef?.value
              : prevStepData?.identifier
              ? prevStepData?.identifier
              : ''
          })
        }}
      >
        {(formik: { setFieldValue: (a: string, b: string) => void; values: HelmWithS3DataType }) => (
          <Form>
            <div className={helmcss.helmGitForm}>
              <Layout.Horizontal flex spacing="huge">
                <div className={helmcss.halfWidth}>
                  <FormInput.Text
                    name="identifier"
                    label={getString('pipeline.manifestType.manifestIdentifier')}
                    placeholder={getString('pipeline.manifestType.manifestPlaceholder')}
                  />
                </div>
              </Layout.Horizontal>

              <Layout.Horizontal flex spacing="huge">
                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]: getMultiTypeFromValue(formik.values?.region) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTypeInput
                    name="region"
                    selectItems={regions}
                    useValue
                    placeholder={getString('pipeline.regionPlaceholder')}
                    multiTypeInputProps={{
                      expressions,
                      onChange: () => {
                        if (getMultiTypeFromValue(formik.values.bucketName) === MultiTypeInputType.FIXED) {
                          formik.setFieldValue('bucketName', '')
                        }
                      }
                    }}
                    label={getString('regionLabel')}
                  />

                  {getMultiTypeFromValue(formik.values.region) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.region as string}
                      type="String"
                      variableName="region"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => {
                        formik.setFieldValue('region', value)
                      }}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>

                {getMultiTypeFromValue(formik.values?.region) !== MultiTypeInputType.FIXED ||
                getMultiTypeFromValue(prevStepData?.connectorRef) !== MultiTypeInputType.FIXED ? (
                  <div
                    className={cx(helmcss.halfWidth, {
                      [helmcss.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.region) !== MultiTypeInputType.RUNTIME ||
                        getMultiTypeFromValue(prevStepData?.connectorRef) !== MultiTypeInputType.FIXED
                    })}
                  >
                    <FormInput.MultiTextInput
                      label={getString('pipeline.manifestType.bucketName')}
                      placeholder={getString('pipeline.manifestType.bucketNamePlaceholder')}
                      name="bucketName"
                      multiTextInputProps={{ expressions }}
                    />
                    {getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={formik.values?.bucketName as string}
                        type="String"
                        variableName="bucketName"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue('bucketName', value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                ) : (
                  <div
                    className={cx(helmcss.halfWidth, {
                      [helmcss.runtimeInput]:
                        getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME
                    })}
                  >
                    <FormInput.MultiTypeInput
                      selectItems={buckets}
                      label={getString('pipeline.manifestType.bucketName')}
                      placeholder={getString('pipeline.manifestType.bucketNamePlaceholder')}
                      name="bucketName"
                      multiTypeInputProps={{
                        expressions,
                        selectProps: {
                          noResults: (
                            <Text lineClamp={1}>
                              {get(error, 'data.message', null) || getString('pipelineSteps.deploy.errors.notags')}
                            </Text>
                          ),
                          itemRenderer: itemRenderer,
                          items: buckets,
                          allowCreatingNewItems: true
                        },
                        onFocus: () => {
                          if (!bucketData?.data && (formik.values?.region || (formik.values?.region as any).value)) {
                            fetchBucket((formik.values?.region as any).value ?? formik.values?.region)
                          }
                        }
                      }}
                    />
                    {getMultiTypeFromValue(formik.values?.bucketName) === MultiTypeInputType.RUNTIME && (
                      <ConfigureOptions
                        style={{ alignSelf: 'center' }}
                        value={formik.values?.bucketName as string}
                        type="String"
                        variableName="bucketName"
                        showRequiredField={false}
                        showDefaultField={false}
                        showAdvanced={true}
                        onChange={value => formik.setFieldValue('bucketName', value)}
                        isReadonly={isReadonly}
                      />
                    )}
                  </div>
                )}
              </Layout.Horizontal>

              <Layout.Horizontal flex spacing="huge">
                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.folderPath) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    label={getString('chartPath')}
                    placeholder={getString('pipeline.manifestType.pathPlaceholder')}
                    name="folderPath"
                    multiTextInputProps={{ expressions }}
                  />
                  {getMultiTypeFromValue(formik.values?.folderPath) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.folderPath as string}
                      type="String"
                      variableName="folderPath"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue('folderPath', value)}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>

                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.chartName) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    name="chartName"
                    multiTextInputProps={{ expressions }}
                    label={getString('pipeline.manifestType.http.chartName')}
                    placeholder={getString('pipeline.manifestType.http.chartNamePlaceHolder')}
                  />
                  {getMultiTypeFromValue(formik.values?.chartName) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.chartName as string}
                      type="String"
                      variableName="chartName"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue('chartName', value)}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>
              </Layout.Horizontal>

              <Layout.Horizontal flex spacing="huge" margin={{ bottom: 'small' }}>
                <div
                  className={cx(helmcss.halfWidth, {
                    [helmcss.runtimeInput]:
                      getMultiTypeFromValue(formik.values?.chartVersion) === MultiTypeInputType.RUNTIME
                  })}
                >
                  <FormInput.MultiTextInput
                    name="chartVersion"
                    multiTextInputProps={{ expressions }}
                    label={getString('pipeline.manifestType.http.chartVersion')}
                    placeholder={getString('pipeline.manifestType.http.chartVersionPlaceHolder')}
                  />
                  {getMultiTypeFromValue(formik.values?.chartVersion) === MultiTypeInputType.RUNTIME && (
                    <ConfigureOptions
                      style={{ alignSelf: 'center' }}
                      value={formik.values?.chartVersion}
                      type="String"
                      variableName="chartVersion"
                      showRequiredField={false}
                      showDefaultField={false}
                      showAdvanced={true}
                      onChange={value => formik.setFieldValue('chartVersion', value)}
                      isReadonly={isReadonly}
                    />
                  )}
                </div>

                <div className={helmcss.halfWidth}>
                  <FormInput.Select
                    name="helmVersion"
                    label={getString('helmVersion')}
                    items={helmVersions}
                    onChange={value => {
                      if (value !== selectedHelmVersion) {
                        formik.setFieldValue('commandFlags', [
                          { commandType: undefined, flag: undefined, id: uuid('', nameSpace()) }
                        ] as any)
                        setHelmVersion(value)
                      }
                    }}
                  />
                </div>
              </Layout.Horizontal>

              <Accordion
                activeId={isActiveAdvancedStep ? getString('advancedTitle') : ''}
                className={cx({
                  [helmcss.advancedStepOpen]: isActiveAdvancedStep
                })}
              >
                <Accordion.Panel
                  id={getString('advancedTitle')}
                  addDomId={true}
                  summary={getString('advancedTitle')}
                  details={
                    <HelmAdvancedStepSection
                      formik={formik}
                      expressions={expressions}
                      commandFlagOptions={
                        formik.values?.helmVersion === 'V2' ? commandFlagOptionsV2 : commandFlagOptionsV3
                      }
                    />
                  }
                />
              </Accordion>
            </div>

            <Layout.Horizontal spacing="xxlarge" className={css.saveBtn}>
              <Button text={getString('back')} icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
              <Button intent="primary" type="submit" text={getString('submit')} rightIcon="chevron-right" />
            </Layout.Horizontal>
          </Form>
        )}
      </Formik>
    </Layout.Vertical>
  )
}

export default HelmWithS3
