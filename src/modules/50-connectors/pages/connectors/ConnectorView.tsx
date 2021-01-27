import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Layout, Container, Icon, Text, Color } from '@wings-software/uicore'
import { parse } from 'yaml'
import cx from 'classnames'
import moment from 'moment'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { useToaster, useConfirmationDialog, StringUtils } from 'modules/10-common/exports'
import {
  ConnectorInfoDTO,
  ConnectorRequestBody,
  ConnectorResponse,
  useGetYamlSnippetMetadata,
  useGetYamlSnippet,
  ResponseJsonNode,
  ResponseYamlSnippets,
  ResponseString,
  useListSecretsV2,
  ResponsePageSecretResponseWrapper,
  ConnectorConnectivityDetails
} from 'services/cd-ng'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import YamlBuilder from 'modules/10-common/components/YAMLBuilder/YamlBuilder'
import TestConnection from '@connectors/components/TestConnection/TestConnection'
import type {
  CompletionItemInterface,
  InvocationMapFunction,
  YamlBuilderHandlerBinding,
  YamlBuilderProps
} from 'modules/10-common/interfaces/YAMLBuilderProps'
import { getReference } from '@secrets/utils/SSHAuthUtils'
import useCreateConnectorModal from '@connectors/modals/ConnectorModal/useCreateConnectorModal'
import { useGetYamlSchema } from 'services/cd-ng'
import type { UseGetMockData } from 'modules/10-common/utils/testUtils'
import { getSnippetTags } from '@common/utils/SnippetUtils'
import { PageSpinner } from '@common/components'
import { useStrings } from 'framework/exports'
import { ConnectorStatus } from '@connectors/constants'
import { getUrlValueByType } from './utils/ConnectorUtils'
import SavedConnectorDetails from './views/savedDetailsView/SavedConnectorDetails'
import i18n from './ConnectorView.i18n'
import css from './ConnectorView.module.scss'

export interface ConnectorViewProps {
  type: ConnectorInfoDTO['type']
  response: ConnectorResponse
  updateConnector: (data: ConnectorRequestBody) => Promise<unknown>
  refetchConnector: () => Promise<any>
  mockMetaData?: UseGetMockData<ResponseYamlSnippets>
  mockSnippetData?: UseGetMockData<ResponseString>
  mockSchemaData?: UseGetMockData<ResponseJsonNode>
  mockSecretData?: UseGetMockData<ResponsePageSecretResponseWrapper>
}

interface ConnectorActivityDetailsProp {
  connector: ConnectorResponse
}

interface ConnectorViewState {
  enableEdit: boolean
  setEnableEdit: (val: boolean) => void
  connector: ConnectorInfoDTO
  setConnector: (object: ConnectorInfoDTO) => void
  selectedView: string
  setSelectedView: (selection: string) => void
}

const SelectedView = {
  VISUAL: 'VISUAL',
  YAML: 'YAML'
}

export interface ConnectorContextInterface {
  setYamlHandler: (yamlHandler: YamlBuilderHandlerBinding) => void
}

const ConnectorContext = React.createContext<ConnectorContextInterface>({
  setYamlHandler: () => undefined
})

const ConnectorView: React.FC<ConnectorViewProps> = (props: ConnectorViewProps) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const [enableEdit, setEnableEdit] = useState(false)
  const [selectedView, setSelectedView] = useState(SelectedView.VISUAL)
  const [connector, setConnector] = useState<ConnectorInfoDTO>(props.response?.connector || ({} as ConnectorInfoDTO))
  const [connectorForYaml, setConnectorForYaml] = useState<ConnectorInfoDTO>(
    props.response?.connector || ({} as ConnectorInfoDTO)
  )

  const { setYamlHandler: setYamlHandlerContext } = React.useContext(ConnectorContext)
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [isValidYAML] = React.useState<boolean>(true)
  const [snippetYaml, setSnippetYaml] = React.useState<string>()
  const [isUpdating, setIsUpdating] = React.useState<boolean>(false)
  const { getString } = useStrings()
  const isHarnessManaged = props.response?.harnessManaged

  React.useEffect(() => {
    if (yamlHandler) {
      setYamlHandlerContext(yamlHandler)
    }
  }, [yamlHandler, setYamlHandlerContext])

  const state: ConnectorViewState = {
    enableEdit,
    setEnableEdit,
    connector,
    setConnector,
    selectedView,
    setSelectedView
  }
  const { showSuccess, showError } = useToaster()

  const onSubmit = async (connectorPayload: ConnectorRequestBody) => {
    setIsUpdating(true)
    try {
      const data = await props.updateConnector(connectorPayload)
      if (data) {
        showSuccess(i18n.SaveConnector.SUCCESS)
        props.refetchConnector()
        state.setEnableEdit(false)
      }
    } /* istanbul ignore next */ catch (error) {
      if (error.data?.message) {
        showError(error.data?.message)
      } else {
        showError(getString('somethingWentWrong'))
      }
    }
    setIsUpdating(false)
  }

  const handleModeSwitch = (targetMode: string): void => {
    if (targetMode === SelectedView.VISUAL) {
      try {
        const connectorJSONEq = props.response?.connector || ({} as ConnectorInfoDTO)
        setSelectedView(targetMode)
        setConnector(connectorJSONEq)
        setConnectorForYaml(connectorJSONEq)
      } /* istanbul ignore next */ catch (err) {
        showError(err.name ? `${err.name}: ${err.message}` : err)
      }
    } else {
      setSelectedView(targetMode)
    }
  }

  /* excluding below method from coverage since it's called only by YAMLBuilder */
  /* istanbul ignore next */
  const handleSaveYaml = (event: React.MouseEvent<Element, MouseEvent>): void => {
    event.stopPropagation()
    event.preventDefault()
    const { getLatestYaml, getYAMLValidationErrorMap } = yamlHandler || {}
    const yamlString = getLatestYaml?.() || ''
    try {
      const connectorJSONEq = parse(yamlString)
      if (connectorJSONEq) {
        const errorMap = getYAMLValidationErrorMap?.()
        if (errorMap && errorMap.size > 0) {
          showError(getString('yamlBuilder.yamlError'))
        } else {
          onSubmit(connectorJSONEq)
        }
        setConnector(connectorJSONEq?.connector)
        setConnectorForYaml(connectorJSONEq?.connector)
      }
    } /* istanbul ignore next */ catch (err) {
      if (err?.toString().includes('YAMLSemanticError')) {
        showError(getString('yamlBuilder.yamlError'))
        return
      }
      const { name, message } = err
      if (name && message) {
        showError(`${name}: ${message}`)
      } else {
        showError(getString('somethingWentWrong'))
      }
    }
  }

  const { data: secretsResponse } = useListSecretsV2({
    queryParams: {
      accountIdentifier: accountId,
      pageIndex: 0,
      pageSize: 100,
      orgIdentifier,
      projectIdentifier
    },
    mock: props.mockSecretData,
    debounce: 300
  })

  const currentScope = getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })

  const secrets: CompletionItemInterface[] = React.useMemo(() => {
    return (
      secretsResponse?.data?.content?.map(item => ({
        label: getReference(currentScope, item.secret.name) || /* istanbul ignore next */ '',
        insertText: getReference(currentScope, item.secret.identifier) || /* istanbul ignore next */ '',
        kind: CompletionItemKind.Field,
        key: item.secret.identifier
      })) || []
    )
  }, [secretsResponse?.data?.content?.map])

  const getInvocationPaths = (): Set<RegExp> | undefined => {
    switch (connector.type) {
      case 'K8sCluster':
        return new Set([
          /^.+\.passwordRef$/,
          /^.+\.usernameRef$/,
          /^.+\.serviceAccountTokenRef$/,
          /^.+\.oidcUsernameRef$/,
          /^.+\.oidcClientIdRef$/,
          /^.+\.oidcPasswordRef$/,
          /^.+\.oidcSecretRef$/,
          /^.+\.caCertRef$/,
          /^.+\.clientCertRef$/,
          /^.+\.clientKeyRef$/,
          /^.+\.clientKeyPassphraseRef$/
        ])
      case 'DockerRegistry':
        return new Set([/^.+\.passwordRef$/, /^.+\.usernameRef$/])
      case 'Nexus':
        return new Set([/^.+\.passwordRef$/, /^.+\.usernameRef$/])
      case 'Git':
        return new Set([/^.+\.passwordRef$/, /^.+\.usernameRef$/, /^.+\.encryptedSshKey$/])
      case 'Splunk':
        return new Set([/^.+\.passwordRef$/])
      case 'AppDynamics':
        return new Set([/^.+\.passwordRef$/])
      case 'Gcp':
        return new Set([/^.+\.secretKeyRef$/])
      case 'Aws':
        return new Set([/^.+\.accessKeyRef$/, /^.+\.secretKeyRef$/])
      case 'Github':
        return new Set([
          /^.+\.usernameRef$/,
          /^.+\.passwordRef$/,
          /^.+\.tokenRef$/,
          /^.+\.sshKeyRef$/,
          /^.+\.privateKeyRef$/
        ])
      case 'Gitlab':
        return new Set([
          /^.+\.usernameRef$/,
          /^.+\.passwordRef$/,
          /^.+\.tokenRef$/,
          /^.+\.sshKeyRef$/,
          /^.+\.kerberosKeyRef$/
        ])
      case 'Bitbucket':
        return new Set([/^.+\.usernameRef$/, /^.+\.passwordRef$/, /^.+\.tokenRef$/, /^.+\.sshKeyRef$/])
    }
    return
  }

  const invocationMap: YamlBuilderProps['invocationMap'] = new Map<RegExp, InvocationMapFunction>()
  getInvocationPaths()?.forEach((path: RegExp) =>
    invocationMap.set(
      path,
      (_matchingPath: string, _currentYaml: string): Promise<CompletionItemInterface[]> => {
        return new Promise(resolve => {
          resolve(secrets)
        })
      }
    )
  )

  const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
    fileName: `${connectorForYaml?.name ?? 'Connector'}.yaml`,
    entityType: 'Connectors',
    existingJSON: { connector: connectorForYaml },
    isReadOnlyMode: true
  }

  const { openConnectorModal } = useCreateConnectorModal({
    onSuccess: data => {
      setConnector(data?.connector as ConnectorInfoDTO)
      setConnectorForYaml(data?.connector as ConnectorInfoDTO)
      state.setEnableEdit(false)
    },
    onClose: () => {
      state.setEnableEdit(false)
      props.refetchConnector()
    }
  })

  useEffect(() => {
    if (props.response?.connector) {
      setConnector(props.response.connector)
      setConnectorForYaml(props.response.connector)
    }
  }, [props.response])

  const { data: snippet, refetch } = useGetYamlSnippet({
    identifier: '',
    requestOptions: { headers: { accept: 'application/json' } },
    lazy: true,
    mock: props.mockSnippetData,
    queryParams: {
      projectIdentifier,
      orgIdentifier,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    }
  })

  useEffect(() => {
    setSnippetYaml(snippet?.data)
  }, [snippet])

  const onSnippetCopy = async (identifier: string): Promise<void> => {
    await refetch({
      pathParams: {
        identifier
      }
    })
  }

  const { data: snippetMetaData, loading: isFetchingSnippets } = useGetYamlSnippetMetadata({
    queryParams: {
      tags: getSnippetTags('Connectors', props.type)
    },
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    requestOptions: { headers: { accept: 'application/json' } },
    mock: props.mockMetaData
  })

  const { data: connectorSchema } = useGetYamlSchema({
    queryParams: {
      entityType: 'Connectors',
      projectIdentifier,
      orgIdentifier,
      scope: getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })
    },
    mock: props.mockSchemaData
  })

  const RenderConnectorStatus: React.FC<any> = (status: ConnectorConnectivityDetails) => {
    return (
      <>
        <Icon
          inline={true}
          name={status === 'SUCCESS' ? 'deployment-success-new' : 'warning-sign'}
          size={18}
          padding={{ left: 'medium' }}
          color={status === 'SUCCESS' ? Color.GREEN_500 : Color.RED_500}
        ></Icon>
        <Text inline={true} font={{ size: 'medium' }} color={status === 'SUCCESS' ? Color.GREEN_500 : Color.RED_500}>
          {status === ConnectorStatus.FAILURE ? getString('failed') : getString('success')}
        </Text>
      </>
    )
  }

  const getValue = (value?: number) => {
    return value ? moment.unix(value / 1000).format(StringUtils.DEFAULT_DATE_FORMAT) : null
  }

  const ConnectorActivityDetails: React.FC<ConnectorActivityDetailsProp> = (
    activityDetailsProp: ConnectorActivityDetailsProp
  ) => {
    const lastTestedAt = getValue(activityDetailsProp.connector?.status?.testedAt)
    const lastConnectedAt = getValue(activityDetailsProp.connector?.status?.lastConnectedAt)

    return (
      <Layout.Vertical className={css.activityContainer}>
        <Container className={css.activitySummary}>
          <Layout.Horizontal spacing="small">
            <Text font={{ weight: 'bold', size: 'medium' }} inline={true} color={Color.GREY_800}>
              {getString('filters.connectivityStatus')}
            </Text>
            {RenderConnectorStatus(activityDetailsProp.connector?.status?.status)}
          </Layout.Horizontal>
          <Text margin={{ top: 'small', bottom: 'small' }}>
            {getString('lastStatusCheckAt')} {lastTestedAt ? `${lastTestedAt}` : getString('na')}
          </Text>
          <Text margin={{ top: 'small', bottom: 'medium' }}>
            {getString('lastSuccessfulStatusCheckAt')} {lastConnectedAt ? `${lastConnectedAt}` : getString('na')}
          </Text>
          <TestConnection
            connectorIdentifier={connector?.identifier || ''}
            // ToDo:  delegateName={connector?.spec?.credential?.spec?.delegateName || ''}
            url={getUrlValueByType(connector?.type || '', connector)}
            refetchConnector={props.refetchConnector}
            connectorType={connector?.type || ''}
          />
        </Container>
        <Container>
          <Text
            font={{ weight: 'bold', size: 'medium' }}
            margin={{ top: 'large', bottom: 'large' }}
            color={Color.GREY_800}
          >
            {getString('changeHistory')}
          </Text>
          <Text color={Color.GREY_800}>{getString('lastUpdated')}</Text>
          <Text margin={{ top: 'small', bottom: 'small' }}>
            {getValue(activityDetailsProp.connector.lastModifiedAt)}{' '}
          </Text>
          <Text color={Color.GREY_800}>{getString('connectorCreated')}</Text>
          <Text margin={{ top: 'small', bottom: 'medium' }}>{getValue(activityDetailsProp.connector.createdAt)} </Text>
        </Container>
      </Layout.Vertical>
    )
  }

  const { openDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('continueWithoutSavingText'),
    titleText: getString('continueWithoutSavingTitle'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        setEnableEdit(false)
        setConnectorForYaml(props.response?.connector || ({} as ConnectorInfoDTO))
      }
    }
  })

  const resetEditor = (event: React.MouseEvent<Element, MouseEvent>): void => {
    event.preventDefault()
    event.stopPropagation()
    openDialog()
  }

  return (
    <Layout.Horizontal padding="large" height="inherit">
      <Layout.Vertical width={enableEdit && selectedView === SelectedView.YAML ? '100%' : '67%'} padding="small">
        <Container className={css.buttonContainer}>
          {state.enableEdit ? null : (
            <div className={css.optionBtns}>
              <div
                className={cx(
                  css.item,
                  { [css.selected]: selectedView === SelectedView.VISUAL },
                  { [css.disabled]: !isValidYAML }
                )}
                onClick={() => handleModeSwitch(SelectedView.VISUAL)}
              >
                {i18n.VISUAL}
              </div>
              <div
                className={cx(css.item, { [css.selected]: selectedView === SelectedView.YAML })}
                onClick={() => handleModeSwitch(SelectedView.YAML)}
              >
                {i18n.YAML}
              </div>
            </div>
          )}
          {state.enableEdit || isHarnessManaged ? null : (
            <Button
              id="editDetailsBtn"
              className={css.editButton}
              text={i18n.EDIT_DETAILS}
              icon="edit"
              onClick={() => {
                state.setEnableEdit(true)
                selectedView === SelectedView.VISUAL ? openConnectorModal(true, props.type, connector) : undefined
              }}
            />
          )}
        </Container>
        <Layout.Horizontal height="100%">
          {isUpdating ? <PageSpinner message={getString('connectors.updating')} /> : null}
          {enableEdit ? (
            selectedView === SelectedView.VISUAL ? null : isFetchingSnippets ? (
              <PageSpinner />
            ) : (
              <div className={css.fullWidth}>
                <YamlBuilder
                  {...Object.assign(yamlBuilderReadOnlyModeProps, { height: 550 })}
                  snippets={snippetMetaData?.data?.yamlSnippets}
                  onSnippetCopy={onSnippetCopy}
                  snippetYaml={snippetYaml}
                  schema={connectorSchema?.data}
                  isReadOnlyMode={false}
                  bind={setYamlHandler}
                  invocationMap={invocationMap}
                />
                <Layout.Horizontal spacing="small">
                  <Button
                    id="saveYAMLChanges"
                    intent="primary"
                    text={getString('saveChanges')}
                    onClick={handleSaveYaml}
                    margin={{ top: 'large' }}
                    title={isValidYAML ? '' : i18n.invalidYAML}
                  />
                  <Button text={getString('cancel')} margin={{ top: 'large' }} onClick={resetEditor} />
                </Layout.Horizontal>
              </div>
            )
          ) : selectedView === SelectedView.VISUAL ? (
            <Layout.Horizontal spacing="medium" height="100%" width="100%">
              <SavedConnectorDetails connector={connector}></SavedConnectorDetails>
            </Layout.Horizontal>
          ) : (
            <Layout.Horizontal spacing="medium" className={css.fullWidth}>
              <div className={css.yamlView}>
                <YamlBuilder
                  {...yamlBuilderReadOnlyModeProps}
                  showSnippetSection={false}
                  onEnableEditMode={() => setEnableEdit(true)}
                />
              </div>
            </Layout.Horizontal>
          )}
        </Layout.Horizontal>
      </Layout.Vertical>
      {enableEdit && selectedView === SelectedView.YAML ? null : (
        <ConnectorActivityDetails connector={props.response}></ConnectorActivityDetails>
      )}
    </Layout.Horizontal>
  )
}

export default ConnectorView
