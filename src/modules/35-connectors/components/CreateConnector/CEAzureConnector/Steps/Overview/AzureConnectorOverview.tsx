import React, { useState } from 'react'
import {
  Layout,
  Button,
  Formik,
  StepProps,
  // ModalErrorHandlerBinding,
  // ModalErrorHandler,
  FormikForm,
  Container,
  Heading, // Added by akash.bhardwaj@harness.io
  FormInput, // Added by akash.bhardwaj@harness.io
  Text
} from '@wings-software/uicore'
import { useParams } from 'react-router'
import { isEmpty, pick, get, omit } from 'lodash-es'
import cx from 'classnames'
import * as Yup from 'yup'
import {
  ConnectorInfoDTO,
  ResponseBoolean,
  EntityGitDetails,
  GetConnectorListV2QueryParams,
  useGetConnectorListV2,
  ConnectorFilterProperties,
  ConnectorResponse,
  CEAzureConnector
} from 'services/cd-ng'
import { String, useStrings } from 'framework/strings'

import { Description, Tags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import GitContextForm, { GitContextProps } from '@common/components/GitContextForm/GitContextForm'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import css from '../../CreateCeAzureConnector.module.scss'

export type DetailsForm = Pick<ConnectorInfoDTO, 'name' | 'identifier' | 'description' | 'tags'> & GitContextProps
export const guidRegex = (value: string) => {
  const regex = /^[{]?[0-9a-fA-F]{8}-([0-9a-fA-F]{4}-){3}[0-9a-fA-F]{12}[}]?$/
  return regex.test(value)
}

interface OverviewForm extends DetailsForm {
  tenantId: string
  subscriptionId: string
}

export interface CEAzureDTO extends ConnectorInfoDTO {
  spec: CEAzureConnector
  existingBillingExports?: CEAzureConnector[]
  hasBilling?: boolean
  isEditMode?: boolean
}

interface OverviewProps {
  type: ConnectorInfoDTO['type']
  name: string
  isEditMode?: boolean
  connectorInfo?: CEAzureDTO
  gitDetails?: EntityGitDetails
  mock?: ResponseBoolean
}

type Params = {
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
}

const Overview: React.FC<StepProps<CEAzureDTO> & OverviewProps> = props => {
  const [loading, setLoading] = useState(false)
  const [isUniqueConnector, setIsUniqueConnector] = useState(true)
  const [existingConnectorDetails, setExistingConnectorDetails] = useState<ConnectorResponse | undefined>()
  // const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding | undefined>()

  const { accountId } = useParams<Params>()
  const { isGitSyncEnabled } = useAppStore()
  const { getString } = useStrings()
  const { prevStepData, nextStep, isEditMode } = props

  const defaultQueryParams: GetConnectorListV2QueryParams = {
    pageIndex: 0,
    pageSize: 10,
    accountIdentifier: accountId,
    getDistinctFromBranches: false
  }

  const { mutate } = useGetConnectorListV2({ queryParams: defaultQueryParams })
  const filterParams: ConnectorFilterProperties = { types: ['CEAzure'], filterType: 'Connector' }
  const fetchConnectors = async (formData: OverviewForm) => {
    return mutate({
      ...filterParams,
      ccmConnectorFilter: {
        azureTenantId: formData.tenantId,
        azureSubscriptionId: formData.subscriptionId
      }
    })
  }
  const fetchConnectorsWithBillingExports = async (formData: OverviewForm) => {
    const { status, data } = await mutate({
      ...filterParams,
      ccmConnectorFilter: {
        featuresEnabled: ['BILLING'],
        azureTenantId: formData.tenantId
      }
    })

    return { status, connectorsWithBillingExports: data?.content }
  }

  const handleSubmit = async (formData: OverviewForm): Promise<void> => {
    setLoading(true)

    const hasBilling = !!props.connectorInfo?.spec?.featuresEnabled?.includes('BILLING')
    const nextStepData: CEAzureDTO = {
      ...props.connectorInfo,
      ...omit(formData, ['tenantId', 'subscriptionId']),
      type: props.type,
      spec: {
        ...props.connectorInfo?.spec,
        ...prevStepData?.spec,
        ...pick(formData, ['tenantId', 'subscriptionId'])
      },
      hasBilling,
      isEditMode
    }

    // if billing is already enabled,
    // the user is in Edit mode
    if (hasBilling) {
      nextStep?.(nextStepData)
      return
    }

    // Flow:
    //
    // Make a call and check if a connector already exists for
    // this tenantId and subscriptionId combination.
    //    - If yes, throw an error and suggest user to edit the
    //      exitising connector
    //    - If no, check if a connector with BILLING feature exists for
    //      this tenantId.
    //        - If yes, move onto the next step and show all the connectors
    //          which have BILLING enabled
    //        - If no, move onto the next step and allow user to create a
    //          new billing export
    const connectors = await fetchConnectors(formData)
    if ('SUCCESS' === connectors.status) {
      const hasExistingConnector = !!connectors?.data?.pageItemCount
      if (hasExistingConnector && !isEditMode) {
        setIsUniqueConnector(false)
        setExistingConnectorDetails(connectors?.data?.content?.[0])
        setLoading(false)
        return
      }

      const { status, connectorsWithBillingExports: cons = [] } = await fetchConnectorsWithBillingExports(formData)
      if ('SUCCESS' === status) {
        if (cons.length > 0) {
          nextStepData.existingBillingExports = cons.map(c => c.connector?.spec as CEAzureConnector)
          nextStep?.(nextStepData)
          return
        }

        nextStep?.(nextStepData)
      }
      setLoading(false)
    }

    // TODO: handle error cases here
    setLoading(false)
  }

  const getInitialValues = () => {
    if (isEditMode) {
      return {
        tenantId: get(props.connectorInfo, 'spec.tenantId'),
        subscriptionId: get(props.connectorInfo, 'spec.subscriptionId'),
        ...pick(props.connectorInfo, ['name', 'identifier', 'description', 'tags'])
      }
    }

    return {
      name: '',
      description: '',
      identifier: '',
      subscriptionId: '',
      tenantId: '',
      tags: {}
    }
  }

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        {getString('connectors.ceAzure.overview.heading')}
      </Heading>
      {/* <ModalErrorHandler bind={setModalErrorHandler} /> */}
      <Formik<OverviewForm>
        onSubmit={formData => {
          handleSubmit(formData)
        }}
        formName="connectorOverviewForm"
        validationSchema={Yup.object().shape({
          name: NameSchema(),
          identifier: IdentifierSchema(),
          tenantId: Yup.string()
            .required('Tenant ID is required')
            .test('tenantId', getString('connectors.ceAzure.guidRegexError'), guidRegex),
          subscriptionId: Yup.string()
            .required('Subscription ID is required')
            .test('subscriptionId', getString('connectors.ceAzure.guidRegexError'), guidRegex)
        })}
        initialValues={{
          ...(getInitialValues() as OverviewForm),
          ...prevStepData
        }}
      >
        {formikProps => {
          return (
            <FormikForm>
              <Container style={{ minHeight: 550 }}>
                <Container className={cx(css.main, css.dataFields)}>
                  <FormInput.InputWithIdentifier
                    inputLabel={getString('connectors.name')}
                    idLabel="Connector_name"
                    {...{ inputName: 'name', isIdentifierEditable: !isEditMode }}
                  />
                  <FormInput.Text
                    name={'tenantId'}
                    label={getString('connectors.ceAzure.overview.tenantId')}
                    placeholder={getString('connectors.ceAzure.guidPlaceholder')}
                  />
                  <FormInput.Text
                    name={'subscriptionId'}
                    label={getString('connectors.ceAzure.overview.subscriptionId')}
                    placeholder={getString('connectors.ceAzure.guidPlaceholder')}
                  />
                  <Description descriptionProps={{}} hasValue={!!formikProps?.values.description} />
                  <Tags tagsProps={{}} isOptional={true} hasValue={!isEmpty(formikProps?.values.tags)} />
                </Container>
                {isGitSyncEnabled && (
                  <GitSyncStoreProvider>
                    <GitContextForm
                      formikProps={formikProps}
                      gitDetails={props.gitDetails}
                      className={'gitDetailsContainer'}
                    />
                  </GitSyncStoreProvider>
                )}
                {!isUniqueConnector && <ExistingConnectorMessage {...existingConnectorDetails} />}
              </Container>
              <Layout.Horizontal>
                <Button type="submit" intent="primary" rightIcon="chevron-right" disabled={loading}>
                  <String stringID="continue" />
                </Button>
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

const ExistingConnectorMessage = (props: ConnectorResponse) => {
  const { getString } = useStrings()
  const accountId = props.connector?.spec?.tenantId
  const featuresEnabled = [...(props.connector?.spec?.featuresEnabled || [])]
  const name = props.connector?.name

  let featureText = featuresEnabled.join(' and ')
  if (featuresEnabled.length > 2) {
    featuresEnabled.push(`and ${featuresEnabled.pop()}`)
    featureText = featuresEnabled.join(', ')
  }

  return (
    <div className={css.connectorExistBox}>
      <Layout.Vertical spacing="medium">
        <Text
          inline
          icon="circle-cross"
          iconProps={{ size: 18, color: 'red700', padding: { right: 'small' } }}
          color="red700"
        >
          {getString('connectors.ceAzure.overview.alreadyExist')}
        </Text>
        <Container>
          <Text inline font={'small'} icon="info" iconProps={{ size: 16, padding: { right: 'small' } }} color="grey700">
            The cloud account {accountId} already has a connector “{name}” linked to it. The connector has permissions
            for {featureText}.
          </Text>
        </Container>
        <Container>
          <Text
            inline
            font={{ size: 'small', weight: 'semi-bold' }}
            icon="lightbulb"
            iconProps={{ size: 16, padding: { right: 'small' } }}
            color="grey700"
          >
            {getString('connectors.ceAzure.overview.trySuggestion')}
          </Text>
          <Text padding={{ left: 'xlarge' }} color="grey700" font={'small'}>
            Edit the connector <a href="#">{name}</a> if required.
          </Text>
        </Container>
      </Layout.Vertical>
    </div>
  )
}

export default Overview

// ALL three features enabled
// TenantId:  b229b2bb-5f33-4d22-bce0-730f6474e906
// Sub: 20d6a917-99fa-4b1b-9b2e-a3d624e9dcf0

// ["OPTIMIZATION", "BILLING"]
// TenantId: b229b2bb-5f33-4d22-bce1-730f6474e906
// SubId: b229b2bb-5f33-4d22-bce2-730f6474e906
