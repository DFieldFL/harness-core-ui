import React, { useState } from 'react'
import {
  Button,
  Color,
  Formik,
  FormikForm as Form,
  Layout,
  Text,
  FormInput,
  CardSelect,
  CardBody,
  IconName,
  Container,
  SelectOption,
  ModalErrorHandler,
  ModalErrorHandlerBinding
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useStrings } from 'framework/strings'
import { regexName } from '@common/utils/StringUtils'
import type { SecretReference } from '@secrets/components/CreateOrSelectSecret/CreateOrSelectSecret'
import { SourceCodeManagerDTO, useSaveSourceCodeManagers } from 'services/cd-ng'
import { AuthTypes, getAuthentication, getIconBySCM, SourceCodeTypes } from '@user-profile/utils/utils'
import type { TextReferenceInterface } from '@secrets/components/TextReference/TextReference'
import { useToaster } from '@common/exports'
import Authentication from './Authentication'
import css from '../useSourceCodeManager.module.scss'

interface SourceCodeManagerProps {
  onSubmit: () => void
  onClose: () => void
}

export interface SCMData {
  name: string
  authType?: AuthTypes
  username?: TextReferenceInterface
  password?: SecretReference
  sshKey?: SecretReference
  kerberosKey?: SecretReference
  accessToken?: SecretReference
  accessKey?: TextReferenceInterface
  secretKey?: SecretReference
}
interface SourceCodeType {
  text: string
  value: SourceCodeTypes
  icon: IconName
}

const SourceCodeManagerForm: React.FC<SourceCodeManagerProps> = props => {
  const { onSubmit, onClose } = props
  const { getString } = useStrings()
  const [selected, setSelected] = useState<SourceCodeType>()
  const { showSuccess, showError } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()

  const { mutate: saveSourceCodeManager } = useSaveSourceCodeManagers({})

  const sourceCodeManagers: SourceCodeType[] = [
    {
      text: getString('common.repo_provider.githubLabel'),
      value: SourceCodeTypes.GITHUB,
      icon: getIconBySCM(SourceCodeTypes.GITHUB)
    },
    {
      text: getString('common.repo_provider.bitbucketLabel'),
      value: SourceCodeTypes.BITBUCKET,
      icon: getIconBySCM(SourceCodeTypes.BITBUCKET)
    },
    {
      text: getString('common.repo_provider.gitlabLabel'),
      value: SourceCodeTypes.GITLAB,
      icon: getIconBySCM(SourceCodeTypes.GITLAB)
    },
    {
      text: getString('common.repo_provider.awscodecommit'),
      value: SourceCodeTypes.AWS_CODE_COMMIT,
      icon: getIconBySCM(SourceCodeTypes.AWS_CODE_COMMIT)
    },
    {
      text: getString('common.repo_provider.azureDev'),
      value: SourceCodeTypes.AZURE_DEV_OPS,
      icon: getIconBySCM(SourceCodeTypes.AZURE_DEV_OPS)
    }
  ]

  const getDefaultSelected = (type?: SourceCodeTypes): AuthTypes | undefined => {
    switch (type) {
      case SourceCodeTypes.GITHUB:
        return AuthTypes.USERNAME_TOKEN
      case SourceCodeTypes.BITBUCKET:
      case SourceCodeTypes.GITLAB:
      case SourceCodeTypes.AZURE_DEV_OPS:
        return AuthTypes.USERNAME_PASSWORD
      case SourceCodeTypes.AWS_CODE_COMMIT:
        return AuthTypes.AWSCredentials
      default:
        return undefined
    }
  }

  const getAuthOptions = (type: SourceCodeTypes): SelectOption[] => {
    switch (type) {
      case SourceCodeTypes.BITBUCKET:
        return [
          {
            label: getString('usernamePassword'),
            value: AuthTypes.USERNAME_PASSWORD
          },
          {
            label: getString('SSH_KEY'),
            value: AuthTypes.SSH_KEY
          }
        ]
      case SourceCodeTypes.GITHUB:
        return [
          // {
          //   label: getString('usernamePassword'),
          //   value: AuthTypes.USERNAME_PASSWORD
          // },
          {
            label: getString('usernameToken'),
            value: AuthTypes.USERNAME_TOKEN
          }
        ]
      case SourceCodeTypes.GITLAB:
        return [
          {
            label: getString('usernamePassword'),
            value: AuthTypes.USERNAME_PASSWORD
          },
          {
            label: getString('usernameToken'),
            value: AuthTypes.USERNAME_TOKEN
          },
          {
            label: getString('kerberos'),
            value: AuthTypes.KERBEROS
          },
          {
            label: getString('SSH_KEY'),
            value: AuthTypes.SSH_KEY
          }
        ]
      case SourceCodeTypes.AWS_CODE_COMMIT:
        return [
          {
            label: getString('userProfile.awsCredentials'),
            value: AuthTypes.AWSCredentials
          }
        ]
      case SourceCodeTypes.AZURE_DEV_OPS:
        return [
          {
            label: getString('usernamePassword'),
            value: AuthTypes.USERNAME_PASSWORD
          },
          {
            label: getString('usernameToken'),
            value: AuthTypes.USERNAME_TOKEN
          },
          {
            label: getString('SSH_KEY'),
            value: AuthTypes.SSH_KEY
          }
        ]
      default:
        return []
    }
  }

  const handleSubmit = async (values: SCMData): Promise<void> => {
    let dataToSubmit: SourceCodeManagerDTO
    if (selected?.value) {
      switch (selected.value) {
        case SourceCodeTypes.BITBUCKET: {
          dataToSubmit = {
            type: SourceCodeTypes.BITBUCKET,
            name: values.name,
            authentication: getAuthentication(values)
          }
          break
        }
        case SourceCodeTypes.GITHUB: {
          dataToSubmit = {
            type: SourceCodeTypes.GITHUB,
            name: values.name,
            authentication: getAuthentication(values)
          }
          break
        }
        case SourceCodeTypes.GITLAB: {
          dataToSubmit = {
            type: SourceCodeTypes.GITLAB,
            name: values.name,
            authentication: getAuthentication(values)
          }
          break
        }
        case SourceCodeTypes.AWS_CODE_COMMIT: {
          dataToSubmit = {
            type: SourceCodeTypes.AWS_CODE_COMMIT,
            name: values.name,
            authentication: getAuthentication(values)
          }
          break
        }
        case SourceCodeTypes.AZURE_DEV_OPS: {
          dataToSubmit = {
            type: SourceCodeTypes.AZURE_DEV_OPS,
            name: values.name,
            authentication: getAuthentication(values)
          }
          break
        }
        default:
          return undefined
      }

      try {
        /* istanbul ignore else */ if (dataToSubmit) {
          const saved = await saveSourceCodeManager(dataToSubmit)
          /* istanbul ignore else */ if (saved) {
            onSubmit()
            showSuccess(getString('userProfile.scmCreateSuccess'))
          } /* istanbul ignore next */ else showError(getString('userProfile.scmCreateFail'))
        }
      } catch (e) {
        /* istanbul ignore next */
        modalErrorHandler?.showDanger(e.data?.message || e.message)
      }
    } else modalErrorHandler?.showDanger(getString('userProfile.selectSCM'))
  }

  return (
    <Layout.Vertical padding="xxxlarge">
      <Layout.Vertical spacing="large">
        <Text color={Color.BLACK} font="medium">
          {getString('userProfile.addSCM')}
        </Text>
        <Formik<SCMData>
          initialValues={{
            name: ''
          }}
          validationSchema={Yup.object().shape({
            name: Yup.string()
              .trim()
              .required(getString('validation.nameRequired'))
              .matches(regexName, getString('formValidation.name')),
            username: Yup.string().when(['authType'], {
              is: AuthTypes.USERNAME_PASSWORD || AuthTypes.USERNAME_TOKEN,
              then: Yup.string().trim().required(getString('validation.username')),
              otherwise: Yup.string().nullable()
            }),
            password: Yup.object().when(['authType'], {
              is: AuthTypes.USERNAME_PASSWORD,
              then: Yup.object().required(getString('validation.password')),
              otherwise: Yup.object().nullable()
            }),
            kerberosKey: Yup.object().when(['authType'], {
              is: AuthTypes.KERBEROS,
              then: Yup.object().required(getString('validation.kerberosKey')),
              otherwise: Yup.object().nullable()
            }),
            accessToken: Yup.object().when(['authType'], {
              is: AuthTypes.USERNAME_TOKEN,
              then: Yup.object().required(getString('validation.accessToken')),
              otherwise: Yup.object().nullable()
            }),
            sshKey: Yup.object().when(['authType'], {
              is: AuthTypes.SSH_KEY,
              then: Yup.object().required(getString('validation.sshKey')),
              otherwise: Yup.object().nullable()
            }),
            accessKey: Yup.string().when(['authType'], {
              is: AuthTypes.AWSCredentials,
              then: Yup.string().trim().required(getString('userProfile.scmValidation.accessKey')),
              otherwise: Yup.string().nullable()
            }),
            secretKey: Yup.object().when(['authType'], {
              is: AuthTypes.AWSCredentials,
              then: Yup.object().required(getString('userProfile.scmValidation.secretKey')),
              otherwise: Yup.object().nullable()
            })
          })}
          onSubmit={values => {
            modalErrorHandler?.hide()
            handleSubmit(values)
          }}
        >
          {formikProps => {
            return (
              <Form>
                <Layout.Vertical spacing="medium">
                  <ModalErrorHandler bind={setModalErrorHandler} />
                  <Container width={400}>
                    <FormInput.Text name="name" label={getString('name')} />
                  </Container>
                  <Text color={Color.BLACK}>{getString('userProfile.selectSCM')}</Text>
                  <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
                    <CardSelect
                      data={selected ? [selected] : sourceCodeManagers}
                      cornerSelected={true}
                      className={css.cardRow}
                      cardClassName={css.card}
                      renderItem={item => (
                        <CardBody.Icon icon={item.icon} iconSize={25}>
                          <Text
                            font={{
                              size: 'small',
                              align: 'center'
                            }}
                            flex={{ justifyContent: 'center' }}
                            color={Color.BLACK}
                          >
                            {item.text}
                          </Text>
                        </CardBody.Icon>
                      )}
                      onChange={value => {
                        setSelected(value)
                        modalErrorHandler?.hide()
                        formikProps.setFieldValue('authType', getDefaultSelected(value.value))
                      }}
                      selected={selected}
                    />
                    {selected ? (
                      <Button
                        text={getString('change')}
                        minimal
                        intent="primary"
                        onClick={() => {
                          setSelected(undefined)
                          formikProps.setFieldValue('authType', null)
                        }}
                      />
                    ) : null}
                  </Layout.Horizontal>
                </Layout.Vertical>
                {selected ? (
                  <Authentication formikProps={formikProps} authOptions={getAuthOptions(selected.value)} />
                ) : null}
                <Layout.Horizontal spacing="small" padding={{ top: 'huge' }}>
                  <Button intent="primary" text={getString('add')} type="submit" />
                  <Button text={getString('cancel')} onClick={onClose} />
                </Layout.Horizontal>
              </Form>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default SourceCodeManagerForm
