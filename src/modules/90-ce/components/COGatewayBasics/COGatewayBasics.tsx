import React from 'react'
import { Formik, FormikForm, Layout, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import * as Yup from 'yup'
import createConnectorModal from '@ce/components/Connectors/createConnectorModal'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import { ConnectorReferenceField } from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import i18n from './COGatewayBasics.i18n'
interface COGatewayBasicsProps {
  gatewayDetails: GatewayDetails
  setGatewayDetails: (gwDetails: GatewayDetails) => void
  setCloudAccount: (s: string) => void
}

const COGatewayBasics: React.FC<COGatewayBasicsProps> = props => {
  const { accountId } = useParams<{
    accountId: string
  }>()
  const { openConnectorModal } = createConnectorModal({
    // onSuccess: () => {
    // },
    // onClose: () => {
    // }
  })
  return (
    <Layout.Vertical spacing="medium">
      <Formik
        initialValues={{
          gatewayName: props.gatewayDetails.name,
          cloudAccount: props.gatewayDetails.cloudAccount
        }}
        onSubmit={values => alert(JSON.stringify(values))}
        render={formik => (
          <FormikForm>
            <Layout.Vertical spacing="large">
              <ConnectorReferenceField
                name="cloudAccount"
                category={'CLOUD_COST'}
                selected={formik.values.cloudAccount.name}
                label={[i18n.connect, props.gatewayDetails.provider.name, i18n.account].join(' ')}
                placeholder={i18n.select}
                accountIdentifier={accountId}
                onChange={e => {
                  formik.setFieldValue('cloudAccount', e.identifier)
                  props.gatewayDetails.cloudAccount = { id: e.identifier?.toString(), name: e.name }
                  // eslint-disable-next-line
                  props.gatewayDetails.metadata.cloud_provider_details = {
                    name: e.name
                  }
                  props.setGatewayDetails(props.gatewayDetails)
                  formik.setFieldValue('cloudAccount', e)
                  props.setCloudAccount(props.gatewayDetails.cloudAccount.id)
                }}
              />
            </Layout.Vertical>
          </FormikForm>
        )}
        validationSchema={Yup.object().shape({
          cloudAccount: Yup.string().trim().required('Cloud Account is required field')
        })}
      ></Formik>
      <Text
        onClick={() => openConnectorModal(false, 'CEAws')}
        style={{ fontSize: '13px', color: '#0278D5', lineHeight: '20px', cursor: 'pointer' }}
      >
        {['+', i18n.new, props.gatewayDetails.provider.name, i18n.connector].join(' ')}
      </Text>
    </Layout.Vertical>
  )
}

export default COGatewayBasics
