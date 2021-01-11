import React, { useEffect } from 'react'
import { Layout, Container, FormikForm, Formik, FormInput, SelectOption } from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams, useHistory } from 'react-router-dom'
import { connect } from 'formik'
import pickBy from 'lodash-es/pickBy'
import merge from 'lodash-es/merge'
import { StringUtils } from '@common/exports'
import { useStrings, UseStringsReturn } from 'framework/exports'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import {
  SelectOrCreateConnector,
  SelectOrCreateConnectorProps
} from '@cv/pages/onboarding/SelectOrCreateConnector/SelectOrCreateConnector'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import { CVSelectionCard } from '@cv/components/CVSelectionCard/CVSelectionCard'
import css from './SelectProduct.module.scss'

interface SelectProductFieldProps {
  type: 'AppDynamics' | 'GoogleCloudOperations'
  productSelectValidationText?: string
  isEditMode?: boolean
  connectorValue?: SelectOption
}

interface SelectProductProps<T> extends SelectProductFieldProps {
  stepData?: T
  onCompleteStep: (data: T) => void
}
interface ProductOption {
  value: string
  label: string
}

interface MonitoringSourceInfo extends SelectOrCreateConnectorProps {
  selectProduct: string
  products: ProductOption[]
}

export const InitialValues = {
  name: '',
  description: '',
  identifier: '',
  connectorRef: undefined,
  tags: []
}

export function getValidationSchema(
  getString: UseStringsReturn['getString'],
  productSelectValidationText?: string
): object {
  return {
    name: Yup.string().trim().required(getString('cv.onboarding.selectProductScreen.validationText.name')),
    identifier: Yup.string().when('name', {
      is: val => val?.length,
      then: Yup.string()
        .trim()
        .required(getString('cv.onboarding.selectProductScreen.validationText.identifier'))
        .matches(
          /^(?![0-9])[0-9a-zA-Z_$]*$/,
          getString('cv.onboarding.selectProductScreen.validationText.validIdRegex')
        )
        .notOneOf(StringUtils.illegalIdentifiers)
    }),
    connectorRef: Yup.object().required(getString('cv.onboarding.selectProductScreen.validationText.connectorRef')),
    product: Yup.string().required(
      productSelectValidationText || getString('cv.onboarding.selectProductScreen.validationText.product')
    )
  }
}

const getInfoSchemaByType = (type: string, getString: UseStringsReturn['getString']): MonitoringSourceInfo => {
  switch (type) {
    case 'AppDynamics':
      return {
        iconName: 'service-appdynamics',
        iconLabel: 'AppDynamics',
        connectToMonitoringSourceText: getString('cv.monitoringSources.appD.connectToMonitoringSource'),
        firstTimeSetupText: getString('cv.monitoringSources.appD.firstTimeSetupText'),
        connectorType: 'AppDynamics',
        createConnectorText: getString('cv.monitoringSources.appD.createConnectorText'),
        selectProduct: getString('cv.monitoringSources.appD.selectProduct'),

        products: [
          {
            value: 'Application Monitoring',
            label: getString('cv.monitoringSources.appD.product.applicationMonitoring')
          }
          // {
          //   value: 'Business_Performance_Monitoring',
          //   label: getString('cv.monitoringSources.appD.product.businessMonitoring')
          // },
          // { value: 'Machine_Monitoring', label: getString('cv.monitoringSources.appD.product.machineMonitoring') },
          // { value: 'End_User_Moniorting', label: getString('cv.monitoringSources.appD.product.endUserMonitoring') }
        ]
      }
    case 'GoogleCloudOperations':
      return {
        iconName: 'service-stackdriver',
        iconLabel: 'Google Cloud Operations',
        connectToMonitoringSourceText: getString('cv.monitoringSources.gco.connectToMonitoringSource'),
        firstTimeSetupText: getString('cv.monitoringSources.gco.firstTimeSetupText'),
        connectorType: 'Gcp',
        createConnectorText: getString('cv.monitoringSources.gco.createConnectorText'),
        selectProduct: getString('cv.monitoringSources.gco.selectProduct'),
        products: [{ value: 'Cloud Metrics', label: getString('cv.monitoringSources.gco.product.metrics') }]
      }
    default:
      return {} as MonitoringSourceInfo
  }
}

export function SelectProductFields(props: SelectProductFieldProps): JSX.Element {
  const { getString } = useStrings()
  const monitoringSource = getInfoSchemaByType(props.type, getString)

  return (
    <Container width="50%" style={{ margin: 'auto' }}>
      <SelectOrCreateConnector
        iconName={monitoringSource.iconName}
        iconLabel={monitoringSource.iconLabel}
        connectorType={monitoringSource.connectorType}
        createConnectorText={monitoringSource.createConnectorText}
        firstTimeSetupText={monitoringSource.firstTimeSetupText}
        connectToMonitoringSourceText={monitoringSource.connectToMonitoringSourceText}
        identifierDisabled={props.isEditMode}
        value={props.connectorValue}
      />
      <FormInput.CustomRender
        label={monitoringSource?.selectProduct}
        name="product"
        className={css.productSelection}
        render={formikProps => {
          return (
            <Layout.Horizontal spacing="medium">
              {monitoringSource?.products?.map((item, index) => {
                return (
                  <CVSelectionCard
                    isSelected={formikProps.values.product === item.value}
                    key={`${index}${item}`}
                    isLarge
                    cardLabel={item.label}
                    iconProps={{
                      name: monitoringSource.iconName,
                      size: 30
                    }}
                    onCardSelect={isSelected =>
                      formikProps.setFieldValue('product', isSelected ? item.value : undefined)
                    }
                  />
                )
              })}
            </Layout.Horizontal>
          )
        }}
      />
    </Container>
  )
}

export function SelectProduct<T>(props: SelectProductProps<T>): JSX.Element {
  const history = useHistory()
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  return (
    <Formik
      // enableReinitialize={true}
      initialValues={{ ...InitialValues, ...props.stepData }}
      validationSchema={Yup.object().shape(getValidationSchema(getString, props.productSelectValidationText))}
      onSubmit={formData => props.onCompleteStep({ ...formData } as any)}
    >
      {formikProps => (
        <FormikForm>
          <SelectProductFields
            type={props.type}
            isEditMode={!!identifier}
            connectorValue={formikProps.values.connectorRef}
          />
          <SubmitAndPreviousButtons
            onPreviousClick={() =>
              history.push(
                routes.toCVAdminSetup({
                  projectIdentifier,
                  orgIdentifier,
                  accountId
                })
              )
            }
          />
          <SyncStepDataValues values={props?.stepData} />
        </FormikForm>
      )}
    </Formik>
  )
}

const SyncStepDataValues = connect(({ formik, values }: any) => {
  useEffect(() => {
    const update = pickBy(values, value => !!value)
    formik.setValues(merge(formik.values, update))
  }, [values])
  return null
})
