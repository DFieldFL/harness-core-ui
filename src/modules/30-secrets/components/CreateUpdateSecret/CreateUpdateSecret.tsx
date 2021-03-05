import React, { useEffect, useState } from 'react'
import {
  Formik,
  FormikForm,
  FormInput,
  Button,
  SelectOption,
  Text,
  ModalErrorHandlerBinding,
  ModalErrorHandler
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { useParams } from 'react-router-dom'
import { pick } from 'lodash-es'
import {
  usePutSecret,
  usePutSecretFileV2,
  usePostSecretFileV2,
  usePostSecret,
  useGetConnectorList,
  SecretDTOV2,
  SecretResponseWrapper,
  SecretRequestWrapper,
  ConnectorInfoDTO,
  ConnectorResponse,
  VaultConnectorDTO,
  useGetConnector
} from 'services/cd-ng'
import type { SecretTextSpecDTO, SecretFileSpecDTO } from 'services/cd-ng'
import { useToaster } from '@common/exports'
import { illegalIdentifiers } from '@common/utils/StringUtils'
import { useStrings } from 'framework/exports'
import VaultFormFields from './views/VaultFormFields'
import LocalFormFields from './views/LocalFormFields'

export type SecretFormData = Omit<SecretDTOV2, 'spec'> & SecretTextSpecDTO & SecretFileSpecDTO

interface CreateUpdateSecretProps {
  secret?: SecretResponseWrapper
  type?: SecretResponseWrapper['secret']['type']
  onChange?: (data: SecretDTOV2) => void
  onSuccess?: (data: SecretFormData) => void
}

const CreateUpdateSecret: React.FC<CreateUpdateSecretProps> = props => {
  const { getString } = useStrings()
  const { onSuccess } = props
  const secret = props.secret?.secret
  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const { showSuccess } = useToaster()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const secretTypeFromProps = props.type || secret?.type
  const [type, setType] = useState<SecretResponseWrapper['secret']['type']>(secretTypeFromProps || 'SecretText')

  const {
    data: secretManagersApiResponse,
    loading: loadingSecretsManagers,
    refetch: getSecretManagers
  } = useGetConnectorList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      category: 'SECRET_MANAGER'
    },
    lazy: true
  })
  const { data: connectorDetails, loading: loadingConnectorDetails, refetch: getConnectorDetails } = useGetConnector({
    identifier: (secret?.spec as SecretTextSpecDTO)?.secretManagerIdentifier,
    lazy: true
  })
  const { mutate: createSecretText, loading: loadingCreateText } = usePostSecret({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: createSecretFile, loading: loadingCreateFile } = usePostSecretFileV2({
    queryParams: { accountIdentifier: accountId }
  })
  const { mutate: updateSecretText, loading: loadingUpdateText } = usePutSecret({
    identifier: secret?.identifier as string,
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier }
  })
  const { mutate: updateSecretFile, loading: loadingUpdateFile } = usePutSecretFileV2({
    identifier: secret?.identifier as string,
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier }
  })

  const loading = loadingCreateText || loadingUpdateText || loadingCreateFile || loadingUpdateFile
  const editing = !!secret?.identifier

  useEffect(() => {
    if (!editing) {
      getSecretManagers()
    } else {
      getConnectorDetails({
        queryParams: {
          accountIdentifier: accountId,
          ...pick(secret, ['orgIdentifier', 'projectIdentifier'])
        }
      })
    }
  }, [])

  const createFormData = (data: SecretFormData): FormData => {
    const formData = new FormData()
    formData.set(
      'spec',
      JSON.stringify({
        secret: {
          type,
          ...pick(data, ['name', 'identifier', 'description', 'tags']),
          orgIdentifier,
          projectIdentifier,
          spec: {
            ...pick(data, ['secretManagerIdentifier'])
          } as SecretFileSpecDTO
        } as SecretDTOV2
      })
    )
    const file = (data as any)?.['file']?.[0]
    file && formData.set('file', file)
    return formData
  }

  const createSecretTextData = (data: SecretFormData): SecretRequestWrapper => {
    return {
      secret: {
        type,
        ...pick(data, ['name', 'identifier', 'description', 'tags']),
        orgIdentifier,
        projectIdentifier,
        spec: {
          ...pick(data, ['secretManagerIdentifier', 'value', 'valueType'])
        } as SecretTextSpecDTO
      }
    }
  }

  const handleSubmit = async (data: SecretFormData): Promise<void> => {
    try {
      if (editing) {
        if (type === 'SecretText') {
          await updateSecretText(createSecretTextData(data))
        }
        if (type === 'SecretFile') {
          await updateSecretFile(createFormData(data) as any)
        }
        showSuccess(`Secret '${data.name}' updated successfully`)
      } else {
        if (type === 'SecretText') {
          await createSecretText(createSecretTextData(data))
        }
        if (type === 'SecretFile') {
          await createSecretFile(createFormData(data) as any)
        }
        showSuccess(`Secret '${data.name}' created successfully`)
      }

      onSuccess?.(data)
    } catch (error) {
      modalErrorHandler?.showDanger(error.data.message)
    }
  }

  const secretManagersOptions: SelectOption[] = editing
    ? [
        {
          label: connectorDetails?.data?.connector?.name || '',
          value: connectorDetails?.data?.connector?.identifier || ''
        }
      ]
    : secretManagersApiResponse?.data?.content?.map((item: ConnectorResponse) => {
        return {
          label: item.connector?.name || '',
          value: item.connector?.identifier || ''
        }
      }) || []

  const defaultSecretManagerId = secretManagersApiResponse?.data?.content?.filter(
    item => item.connector?.spec?.default
  )[0]?.connector?.identifier
  const secretTypeOptions = [
    { label: getString('secret.labelText'), value: 'SecretText' },
    { label: getString('secret.labelFile'), value: 'SecretFile' }
  ]

  const [selectedSecretManager, setSelectedSecretManager] = useState<ConnectorInfoDTO | undefined>()
  const [readOnlySecretManager, setReadOnlySecretManager] = useState<boolean>()

  // update selectedSecretManager and readOnly flag in state when we get new data
  useEffect(() => {
    const selectedSM = editing
      ? // when editing, use connector from api response directly, since user cannot change SM
        connectorDetails?.data?.connector
      : // when creating, iterate over all secret managers to find default SM
        secretManagersApiResponse?.data?.content?.filter(
          itemValue => itemValue.connector?.identifier === defaultSecretManagerId
        )?.[0]?.connector

    setSelectedSecretManager(selectedSM)
    setReadOnlySecretManager((selectedSM?.spec as VaultConnectorDTO)?.readOnly)
  }, [defaultSecretManagerId, connectorDetails])

  // if the selected secret manager changes, update readOnly flag in state
  useEffect(() => {
    selectedSecretManager?.type === 'Vault'
      ? setReadOnlySecretManager((selectedSecretManager?.spec as VaultConnectorDTO)?.readOnly)
      : setReadOnlySecretManager(false)
  }, [selectedSecretManager])

  return (
    <>
      <ModalErrorHandler bind={setModalErrorHandler} />
      <Formik<SecretFormData>
        initialValues={{
          name: '',
          description: '',
          identifier: '',
          tags: {},
          valueType: readOnlySecretManager ? 'Reference' : 'Inline',
          type,
          secretManagerIdentifier: selectedSecretManager?.identifier || defaultSecretManagerId || '',
          orgIdentifier,
          projectIdentifier,
          ...pick(secret, ['name', 'identifier', 'description', 'tags']),
          ...pick(secret?.spec, ['valueType', 'secretManagerIdentifier'])
        }}
        enableReinitialize={true}
        validationSchema={Yup.object().shape({
          name: Yup.string().trim().required(getString('secret.validationName')),
          identifier: Yup.string().when('name', {
            is: val => val?.length,
            then: Yup.string()
              .required(getString('secret.validationIdentifier'))
              .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('validation.validIdRegex'))
              .notOneOf(illegalIdentifiers)
          }),
          value:
            editing || type === 'SecretFile'
              ? Yup.string().trim()
              : Yup.string().trim().required(getString('secret.validationValue')),
          secretManagerIdentifier: Yup.string().required(getString('secret.validationKms'))
        })}
        validate={formData => {
          props.onChange?.({
            type: formData.type,
            ...pick(formData, ['name', 'description', 'identifier', 'tags']),
            spec: pick(formData, ['value', 'valueType', 'secretManagerIdentifier']) as SecretTextSpecDTO
          })
        }}
        onSubmit={data => {
          handleSubmit(data)
        }}
      >
        {formikProps => {
          const typeOfSelectedSecretManager = selectedSecretManager?.type

          return (
            <FormikForm>
              <FormInput.Select
                name="secretManagerIdentifier"
                label={getString('secret.labelSecretsManager')}
                items={secretManagersOptions}
                disabled={editing || loadingSecretsManagers || loadingConnectorDetails}
                onChange={item => {
                  setSelectedSecretManager(
                    secretManagersApiResponse?.data?.content?.filter(
                      itemValue => itemValue.connector?.identifier === item.value
                    )?.[0]?.connector
                  )
                }}
              />
              {!secretTypeFromProps ? (
                <FormInput.RadioGroup
                  name="type"
                  label={getString('secret.labelSecretType')}
                  items={secretTypeOptions}
                  radioGroup={{ inline: true }}
                  onChange={ev => {
                    setType((ev.target as HTMLInputElement).value as SecretResponseWrapper['secret']['type'])
                  }}
                />
              ) : null}
              <FormInput.InputWithIdentifier
                inputName="name"
                inputLabel={getString('secret.labelSecretName')}
                idName="identifier"
                isIdentifierEditable={!editing}
              />
              {!typeOfSelectedSecretManager ? <Text>{getString('secret.messageSelectSM')}</Text> : null}
              {typeOfSelectedSecretManager === 'Local' || typeOfSelectedSecretManager === 'GcpKms' ? (
                <LocalFormFields formik={formikProps} type={type} editing={editing} />
              ) : null}
              {typeOfSelectedSecretManager === 'Vault' ? (
                <VaultFormFields formik={formikProps} type={type} editing={editing} readonly={readOnlySecretManager} />
              ) : null}
              <Button
                intent="primary"
                type="submit"
                text={loading ? getString('secret.saving') : getString('save')}
                margin={{ top: 'large' }}
                disabled={loading || !typeOfSelectedSecretManager}
              />
            </FormikForm>
          )
        }}
      </Formik>
    </>
  )
}

export default CreateUpdateSecret
