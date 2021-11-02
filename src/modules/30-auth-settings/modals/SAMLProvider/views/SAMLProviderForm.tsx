import React from 'react'
import { useParams } from 'react-router-dom'
import * as yup from 'yup'
import {
  Layout,
  Heading,
  Color,
  Formik,
  FormikForm,
  Container,
  FormInput,
  CardSelect,
  CardBody,
  Text,
  Button,
  IconName,
  Card,
  Checkbox,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  TextInput,
  ButtonVariation,
  FontVariation
} from '@wings-software/uicore'
import copy from 'copy-to-clipboard'
import { useStrings } from 'framework/strings'
import { useToaster } from '@common/components'
import type { SamlSettings } from 'services/cd-ng'
import { useUploadSamlMetaData, useUpdateSamlMetaData } from 'services/cd-ng'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { AuthenticationMechanisms, getSamlEndpoint } from '@auth-settings/constants/utils'
import type { StringsMap } from 'stringTypes'
import css from '../useSAMLProvider.module.scss'

interface Props {
  onSubmit?: () => void
  onCancel: () => void
  samlProvider?: SamlSettings
}

interface FormValues {
  displayName: string
  authorizationEnabled: boolean
  groupMembershipAttr: string
  entityIdentifier?: string
}

enum Providers {
  AZURE = 'AZURE',
  OKTA = 'OKTA',
  ONE_LOGIN = 'ONE_LOGIN',
  OTHER = 'OTHER'
}
interface SAMLProviderType {
  type: Providers
  name: keyof StringsMap
  icon: IconName
}

const SAMLProviderTypes: SAMLProviderType[] = [
  {
    type: Providers.AZURE,
    name: 'authSettings.azure',
    icon: 'service-azure'
  },
  {
    type: Providers.OKTA,
    name: 'authSettings.okta',
    icon: 'service-okta'
  },
  {
    type: Providers.ONE_LOGIN,
    name: 'authSettings.oneLogin',
    icon: 'service-onelogin'
  },
  {
    type: Providers.OTHER,
    name: 'common.other',
    icon: 'main-more'
  }
]

const SAMLProviderForm: React.FC<Props> = ({ onSubmit, onCancel, samlProvider }) => {
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId } = useParams<AccountPathProps>()
  const [selected, setSelected] = React.useState<SAMLProviderType>()
  const [modalErrorHandler, setModalErrorHandler] = React.useState<ModalErrorHandlerBinding>()

  const selectedSAMLProvider = getString(
    selected
      ? selected?.type === Providers.OTHER
        ? 'authSettings.SAMLProvider'
        : selected.name
      : 'authSettings.SAMLProvider'
  )

  const { mutate: uploadSamlSettings, loading: uploadingSamlSettings } = useUploadSamlMetaData({
    queryParams: {
      accountId
    }
  })

  const { mutate: updateSamlSettings, loading: updatingSamlSettings } = useUpdateSamlMetaData({
    queryParams: {
      accountId
    }
  })

  const createFormData = (data: FormValues): FormData => {
    const formData = new FormData()
    formData.set('displayName', data.displayName)
    formData.set('authorizationEnabled', JSON.stringify(data.authorizationEnabled))
    formData.set('groupMembershipAttr', data.groupMembershipAttr)
    formData.set('ssoSetupType', AuthenticationMechanisms.SAML)
    data.entityIdentifier && formData.set('entityIdentifier', data.entityIdentifier || '')

    const file = (data as any)?.files?.[0]
    file && formData.set('file', file)

    return formData
  }

  const handleSubmit = async (values: FormValues): Promise<void> => {
    try {
      let response

      if (samlProvider) {
        console.log('updating', createFormData(values))
        response = await updateSamlSettings(createFormData(values) as any)
      } else {
        console.log('uploading', createFormData(values))
        response = await uploadSamlSettings(createFormData(values) as any)
      }

      /* istanbul ignore else */ if (response) {
        showSuccess(
          getString(
            samlProvider ? 'authSettings.samlProviderUpdatedSuccessfully' : 'authSettings.samlProviderAddedSuccessfully'
          ),
          5000
        )
        onSubmit?.()
      }
    } catch (e) {
      /* istanbul ignore next */ modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }

  const filesValidation = samlProvider
    ? yup.array()
    : yup.array().required(getString('common.validation.fileIsRequired'))

  return (
    <Layout.Vertical padding={{ left: 'huge', right: 'huge' }}>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Text color={Color.GREY_900} font={{ size: 'medium', weight: 'semi-bold' }} margin={{ bottom: 'xxlarge' }}>
        {samlProvider ? getString('authSettings.editSAMLProvider') : getString('authSettings.addSAMLProvider')}
      </Text>
      <Layout.Horizontal>
        <Layout.Vertical width={660} padding={{ right: 'xxxlarge' }}>
          <Formik
            formName="samlProviderForm"
            initialValues={{
              displayName: samlProvider?.displayName || /* istanbul ignore next */ '',
              authorizationEnabled: samlProvider ? !!samlProvider?.authorizationEnabled : true,
              groupMembershipAttr: samlProvider?.groupMembershipAttr || '',
              entityIdEnabled: samlProvider ? !!samlProvider?.entityIdentifier : false,
              entityIdentifier: samlProvider?.entityIdentifier || ''
            }}
            validationSchema={yup.object().shape({
              displayName: yup.string().trim().required(getString('common.validation.nameIsRequired')),
              files: filesValidation,
              groupMembershipAttr: yup.string().when('authorizationEnabled', {
                is: val => val,
                then: yup.string().trim().required(getString('common.validation.groupAttributeIsRequired'))
              }),
              entityIdentifier: yup.string().when('entityIdEnabled', {
                is: val => val,
                then: yup.string().trim().required('getString(common.validation.groupAttributeIsRequired)')
              })
            })}
            onSubmit={values => {
              handleSubmit(values)
            }}
          >
            {({ values, setFieldValue }) => (
              <FormikForm>
                <Container width={474} margin={{ bottom: 'xxxlarge' }}>
                  <FormInput.Text name="displayName" label={getString('name')} />
                </Container>
                {!samlProvider && (
                  <React.Fragment>
                    <Text margin={{ bottom: 'medium' }}>{getString('authSettings.selectSAMLProvider')}</Text>
                    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                      <CardSelect
                        data={selected ? [selected] : SAMLProviderTypes}
                        cornerSelected
                        cardClassName={css.card}
                        renderItem={item => (
                          <CardBody.Icon icon={item.icon} iconSize={25}>
                            <Text
                              font={{
                                size: 'small',
                                align: 'center',
                                weight: 'semi-bold'
                              }}
                              flex={{ justifyContent: 'center' }}
                              color={Color.GREY_900}
                              className={css.text}
                            >
                              {getString(item.name)}
                            </Text>
                          </CardBody.Icon>
                        )}
                        onChange={value => setSelected(value)}
                        selected={selected}
                      />
                      {selected ? (
                        <Button
                          text={getString('change')}
                          variation={ButtonVariation.LINK}
                          onClick={() => {
                            setFieldValue('files', [])
                            setSelected(undefined)
                          }}
                        />
                      ) : null}
                    </Layout.Horizontal>
                  </React.Fragment>
                )}
                {(selected || samlProvider) && (
                  <React.Fragment>
                    <Text color={Color.GREY_500} margin={{ top: 'huge', bottom: 'xsmall' }}>
                      {getString('authSettings.enterSAMLEndPoint', {
                        selectedSAMLProvider
                      })}
                    </Text>
                    <TextInput
                      value={getSamlEndpoint(accountId)}
                      rightElement={
                        (
                          <Button
                            icon="duplicate"
                            inline
                            variation={ButtonVariation.ICON}
                            onClick={() => {
                              copy(getSamlEndpoint(accountId))
                                ? showSuccess(getString('clipboardCopySuccess'))
                                : showError(getString('clipboardCopyFail'))
                            }}
                          />
                        ) as any
                      }
                      readOnly
                    />
                    <Text color={Color.GREY_500} margin={{ bottom: 'xsmall' }} padding={{ top: 'huge' }}>
                      {getString(
                        samlProvider ? 'authSettings.identityProvider' : 'authSettings.uploadIdentityProvider',
                        {
                          selectedSAMLProvider
                        }
                      )}
                      {samlProvider && ` ${getString('titleOptional')}`}
                    </Text>
                    <Container margin={{ bottom: 'xxxlarge' }}>
                      <FormInput.FileInput
                        name="files"
                        buttonText={getString('upload')}
                        placeholder={getString('authSettings.chooseFile')}
                        multiple
                      />
                    </Container>
                    <Card className={css.authorizationCard}>
                      <Checkbox
                        name="authorization"
                        label={getString('authSettings.enableAuthorization')}
                        font={{ weight: 'semi-bold' }}
                        color={Color.GREY_600}
                        checked={values.authorizationEnabled}
                        onChange={e => setFieldValue('authorizationEnabled', e.currentTarget.checked)}
                      />
                      {values.authorizationEnabled && (
                        <Container width={300} margin={{ top: 'large' }}>
                          <FormInput.Text
                            name="groupMembershipAttr"
                            label={getString('authSettings.groupAttributeName')}
                          />
                        </Container>
                      )}
                    </Card>
                    <Card className={css.entityIdCard}>
                      <Checkbox
                        name="enableEntityId"
                        label={'Add Entity ID'}
                        font={{ variation: FontVariation.FORM_LABEL }}
                        color={Color.GREY_600}
                        checked={values.entityIdEnabled}
                        onChange={e => setFieldValue('entityIdEnabled', e.currentTarget.checked)}
                      />
                      {values.entityIdEnabled && (
                        <Container width={300} margin={{ top: 'large' }}>
                          <FormInput.Text name="entityIdentifier" label={'Entity ID'} />
                        </Container>
                      )}
                    </Card>
                  </React.Fragment>
                )}
                <Layout.Horizontal spacing="small" padding={{ top: 'huge', bottom: 'xlarge' }}>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    text={getString(samlProvider ? 'save' : 'add')}
                    type="submit"
                    disabled={uploadingSamlSettings || updatingSamlSettings}
                  />
                  <Button text={getString('cancel')} onClick={onCancel} variation={ButtonVariation.TERTIARY} />
                </Layout.Horizontal>
              </FormikForm>
            )}
          </Formik>
        </Layout.Vertical>
        <Layout.Vertical
          width={290}
          padding={{ left: 'xxxlarge' }}
          margin={{ bottom: 'large' }}
          border={{ left: true }}
        >
          <Heading level={3} color={Color.BLACK} font={{ weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
            {getString('authSettings.friendlyReminder')}
          </Heading>
          <Text color={Color.GREY_800} font={{ size: 'small' }} margin={{ bottom: 'xxlarge' }} className={css.notes}>
            {getString('authSettings.friendlyReminderDescription')}
          </Text>
          {(selected || samlProvider) && (
            <React.Fragment>
              <Heading level={3} color={Color.BLACK} font={{ weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
                {getString('authSettings.enablingAuthorization')}
              </Heading>
              <Text
                color={Color.GREY_800}
                font={{ size: 'small' }}
                margin={{ bottom: 'xxlarge' }}
                className={css.notes}
              >
                {getString('authSettings.enablingAuthorizationDescription', {
                  selectedSAMLProvider
                })}
              </Text>
              <Heading level={3} color={Color.BLACK} font={{ weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
                {getString('authSettings.testingSSO')}
              </Heading>
              <Text
                color={Color.GREY_800}
                font={{ size: 'small' }}
                margin={{ bottom: 'xxlarge' }}
                className={css.notes}
              >
                {getString('authSettings.testingSSODescription')}
              </Text>
            </React.Fragment>
          )}
        </Layout.Vertical>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default SAMLProviderForm
