import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { parse, stringify } from 'yaml'
import cx from 'classnames'
import { omit, without } from 'lodash-es'
import { Layout, Text, Color, Container, Button } from '@wings-software/uicore'

import {
  useGetSecretV2,
  SecretTextSpecDTO,
  usePutSecretViaYaml,
  ResponseSecretResponseWrapper,
  ResponsePageConnectorResponse,
  useGetYamlSchema,
  useGetYamlSnippetMetadata,
  useGetYamlSnippet,
  Error
} from 'services/cd-ng'

import { useStrings } from 'framework/exports'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { PageError } from '@common/components/Page/PageError'
import { PageHeader } from '@common/components/Page/PageHeader'
import YamlBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import type { SnippetFetchResponse, YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { useConfirmationDialog, useToaster } from '@common/exports'
import routes from '@common/RouteDefinitions'

import type { UseGetMockData } from '@common/utils/testUtils'
import useCreateSSHCredModal from '@secrets/modals/CreateSSHCredModal/useCreateSSHCredModal'
import useCreateUpdateSecretModal from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'
import { getSnippetTags } from '@common/utils/SnippetUtils'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import ViewSecretDetails from './views/ViewSecretDetails'

import i18n from './SecretDetails.i18n'
import css from './SecretDetails.module.scss'

enum Mode {
  VISUAL,
  YAML
}

interface OptionalIdentifiers {
  orgIdentifier?: string
  accountId: string
}

interface SecretDetailsProps {
  mockSecretDetails?: UseGetMockData<ResponseSecretResponseWrapper>
  connectorListMockData?: UseGetMockData<ResponsePageConnectorResponse>
  mockKey?: ResponseSecretResponseWrapper
  mockPassword?: ResponseSecretResponseWrapper
  mockPassphrase?: ResponseSecretResponseWrapper
}

const getConnectorsUrl = ({ orgIdentifier, accountId }: OptionalIdentifiers): string => {
  if (orgIdentifier) return routes.toOrgResourcesConnectors({ orgIdentifier, accountId })
  return routes.toResourcesConnectors({ accountId })
}

const getSecretsUrl = ({ orgIdentifier, accountId }: OptionalIdentifiers): string => {
  if (orgIdentifier) return routes.toOrgResourcesSecretsListing({ orgIdentifier, accountId })
  return routes.toResourcesSecretsListing({ accountId })
}

const SecretDetails: React.FC<SecretDetailsProps> = props => {
  const { accountId, projectIdentifier, orgIdentifier, secretId } = useParams()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const [edit, setEdit] = useState<boolean>()
  const [mode, setMode] = useState<Mode>(Mode.VISUAL)
  const [fieldsRemovedFromYaml, setFieldsRemovedFromYaml] = useState(['draft', 'createdAt', 'updatedAt'])
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [snippetFetchResponse, setSnippetFetchResponse] = React.useState<SnippetFetchResponse>()
  const { loading, data, refetch, error } = useGetSecretV2({
    identifier: secretId,
    queryParams: { accountIdentifier: accountId, projectIdentifier: projectIdentifier, orgIdentifier: orgIdentifier },
    mock: props.mockSecretDetails
  })
  const { mutate: updateSecretYaml } = usePutSecretViaYaml({
    identifier: secretId,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    // this is required to make sure backend understands the content type correctly
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })
  const { data: snippetData } = useGetYamlSnippetMetadata({
    queryParams: {
      tags: getSnippetTags('Secrets')
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    }
  })
  const { data: secretSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Secrets'
    }
  })

  const [secretData, setSecretData] = useState(data?.data)

  const { openCreateSSHCredModal } = useCreateSSHCredModal({ onSuccess: refetch })
  const { openCreateSecretModal } = useCreateUpdateSecretModal({ onSuccess: refetch })
  const handleSaveYaml = async (): Promise<void> => {
    const yamlData = yamlHandler?.getLatestYaml()
    let jsonData
    try {
      jsonData = parse(yamlData || '')
    } catch (err) {
      showError(err.message)
    }

    if (yamlData && jsonData) {
      try {
        await updateSecretYaml(yamlData as any)
        showSuccess(i18n.updateSuccess)
        setEdit(false)
        refetch()
      } catch (err) {
        showError(err.data.message)
      }
    }
  }
  useDocumentTitle([getString('resources'), getString('secrets'), secretData?.secret.name || ''])

  useEffect(() => {
    setSecretData(data?.data)
  }, [data?.data])
  const {
    data: snippet,
    refetch: refetchSnippet,
    cancel,
    loading: isFetchingSnippet,
    error: errorFetchingSnippet
  } = useGetYamlSnippet({
    identifier: '',
    lazy: true
  })

  useEffect(() => {
    let snippetStr = ''
    try {
      snippetStr = snippet?.data ? stringify(snippet.data, { indent: 4 }) : ''
    } catch {
      /**/
    }
    setSnippetFetchResponse({
      snippet: snippetStr,
      loading: isFetchingSnippet,
      error: errorFetchingSnippet
    })
  }, [isFetchingSnippet])

  const onSnippetCopy = async (identifier: string): Promise<void> => {
    cancel()
    await refetchSnippet({
      pathParams: {
        identifier
      }
    })
  }
  useEffect(() => {
    if (secretData?.secret.type === 'SecretText') {
      switch ((secretData?.secret.spec as SecretTextSpecDTO)?.valueType) {
        case 'Inline':
          setFieldsRemovedFromYaml([...fieldsRemovedFromYaml, 'secret.spec.value'])
          break
        case 'Reference':
          // 'value' field should be persisted in visual->yaml transistion for reference type
          setFieldsRemovedFromYaml(without(fieldsRemovedFromYaml, 'secret.spec.value'))
          break
      }
    }
  }, [secretData])

  const { openDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('continueWithoutSavingText'),
    titleText: getString('continueWithoutSavingTitle'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        setEdit(false)
        refetch()
      }
    }
  })

  const resetEditor = (event: React.MouseEvent<Element, MouseEvent>): void => {
    event.preventDefault()
    event.stopPropagation()
    openDialog()
  }

  if (loading) return <PageSpinner />
  if (error) return <PageError message={(error.data as Error)?.message || error.message} onClick={() => refetch()} />
  if (!secretData) return <div>{getString('noData')}</div>

  return (
    <>
      <PageHeader
        title={
          <Layout.Vertical>
            <div>
              <Link to={getConnectorsUrl({ orgIdentifier, accountId })}>{i18n.linkResources}</Link> /{' '}
              <Link to={getSecretsUrl({ orgIdentifier, accountId })}>{i18n.linkSecrets}</Link>
            </div>
            <Text font={{ size: 'medium' }} color={Color.BLACK}>
              {data?.data?.secret.name || 'Secret Details'}
            </Text>
          </Layout.Vertical>
        }
      />
      <Container padding={{ top: 'large', left: 'huge', right: 'huge' }}>
        <Container padding={{ bottom: 'large' }}>
          {edit ? null : (
            <Layout.Horizontal flex>
              <div className={css.switch}>
                <div
                  className={cx(css.item, { [css.selected]: mode === Mode.VISUAL })}
                  onClick={() => setMode(Mode.VISUAL)}
                >
                  {getString('visual')}
                </div>
                <div
                  className={cx(css.item, { [css.selected]: mode === Mode.YAML })}
                  onClick={() => setMode(Mode.YAML)}
                >
                  {getString('yaml')}
                </div>
              </div>
              <Button
                text={i18n.buttonEdit}
                icon="edit"
                onClick={() => {
                  mode === Mode.VISUAL
                    ? secretData.secret.type === 'SSHKey'
                      ? openCreateSSHCredModal(data?.data?.secret)
                      : openCreateSecretModal(secretData.secret.type, secretData)
                    : setEdit(true)
                }}
              />
            </Layout.Horizontal>
          )}
        </Container>
        {mode === Mode.YAML ? (
          <Container>
            {edit && (
              <YamlBuilder
                entityType={'Secrets'}
                fileName={`${secretData.secret.name}.yaml`}
                existingJSON={omit(secretData, fieldsRemovedFromYaml)}
                bind={setYamlHandler}
                onSnippetCopy={onSnippetCopy}
                snippetFetchResponse={snippetFetchResponse}
                schema={secretSchema?.data}
                isReadOnlyMode={false}
                snippets={snippetData?.data?.yamlSnippets}
              />
            )}
            {!edit && (
              <YamlBuilder
                entityType={'Secrets'}
                existingJSON={omit(secretData, fieldsRemovedFromYaml)}
                fileName={`${secretData.secret.name}.yaml`}
                isReadOnlyMode={true}
                showSnippetSection={false}
                onEnableEditMode={() => setEdit(true)}
              />
            )}
            {edit && (
              <Layout.Horizontal spacing="medium">
                <Button text={getString('cancel')} margin={{ top: 'large' }} onClick={resetEditor} />
                <Button intent="primary" text={getString('save')} onClick={handleSaveYaml} margin={{ top: 'large' }} />
              </Layout.Horizontal>
            )}
          </Container>
        ) : (
          //View in Visual Mode
          <ViewSecretDetails secret={secretData} />
        )}
      </Container>
    </>
  )
}

export default SecretDetails
