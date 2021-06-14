import React from 'react'
import * as Yup from 'yup'
import cx from 'classnames'
import {
  Accordion,
  Button,
  IconName,
  Formik,
  FormikForm,
  RUNTIME_INPUT_VALUE,
  TextInput,
  FormInput,
  Text,
  Popover,
  Color,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { isEmpty, get, set } from 'lodash-es'
import { Classes, Dialog, Position } from '@blueprintjs/core'
import flatten from 'lodash-es/flatten'
import { useStrings } from 'framework/strings'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import {
  ConnectorInfoDTO,
  getConnectorPromise,
  getTestConnectionResultPromise,
  getTestGitRepoConnectionResultPromise,
  PipelineInfoConfig,
  useGetConnector
} from 'services/cd-ng'
import {
  ConnectorReferenceField,
  ConnectorReferenceFieldProps
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { Scope } from '@common/interfaces/SecretsInterface'
import {
  generateSchemaForLimitCPU,
  generateSchemaForLimitMemory
} from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import { DrawerTypes } from '../PipelineContext/PipelineActions'
import { RightDrawer } from '../RightDrawer/RightDrawer'
import { StageTypes } from '../Stages/StageTypes'
import { EnableGitExperience } from '../EnableGitExperience/EnableGitExperience'
import css from './RightBar.module.scss'

interface CodebaseValues {
  connectorRef?: ConnectorReferenceFieldProps['selected']
  repoName?: string
  depth?: string
  sslVerify?: number
  memoryLimit?: any
  cpuLimit?: any
}

enum CodebaseStatuses {
  ZeroState = 'zeroState',
  NotConfigured = 'notConfigured',
  Valid = 'valid',
  Invalid = 'invalid',
  Validating = 'validating'
}

const sslVerifyOptions = [
  {
    label: 'True',
    value: 1
  },
  {
    label: 'False',
    value: 0
  }
]

const codebaseIcons: Record<CodebaseStatuses, IconName> = {
  [CodebaseStatuses.ZeroState]: 'codebase-zero-state',
  [CodebaseStatuses.NotConfigured]: 'codebase-not-configured',
  [CodebaseStatuses.Valid]: 'codebase-valid',
  [CodebaseStatuses.Invalid]: 'codebase-invalid',
  [CodebaseStatuses.Validating]: 'codebase-validating'
}

export const RightBar = (): JSX.Element => {
  const {
    state: {
      pipeline,
      pipelineView,
      pipelineView: {
        drawerData: { type }
      }
    },
    updatePipeline,
    updatePipelineView
  } = React.useContext(PipelineContext)
  const isFlowControlEnabled = useFeatureFlag('NG_BARRIERS')
  const isGitSyncFeatureFlag = useFeatureFlag('GIT_SYNC_NG')
  const { isGitSyncEnabled } = useAppStore()
  const codebase = (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase
  const [codebaseStatus, setCodebaseStatus] = React.useState<CodebaseStatuses>(CodebaseStatuses.ZeroState)

  const { accountId, projectIdentifier, orgIdentifier } = useParams<
    PipelineType<{
      orgIdentifier: string
      projectIdentifier: string
      pipelineIdentifier: string
      accountId: string
    }>
  >()

  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const [isCodebaseDialogOpen, setIsCodebaseDialogOpen] = React.useState(false)
  const codebaseInitialValues: CodebaseValues = {
    repoName: codebase?.repoName,
    depth: codebase?.depth !== undefined ? String(codebase.depth) : undefined,
    sslVerify: codebase?.sslVerify !== undefined ? Number(codebase.sslVerify) : undefined,
    memoryLimit: codebase?.resources?.limits?.memory,
    cpuLimit: codebase?.resources?.limits?.cpu
  }

  const connectorId = getIdentifierFromValue((codebase?.connectorRef as string) || '')
  const initialScope = getScopeFromValue((codebase?.connectorRef as string) || '')

  const { data: connector, loading, refetch } = useGetConnector({
    identifier: connectorId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
    },
    lazy: true,
    debounce: 300
  })

  const [connectionType, setConnectionType] = React.useState('')
  const [connectorUrl, setConnectorUrl] = React.useState('')

  if (connector?.data?.connector) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    codebaseInitialValues.connectorRef = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope,
      live: connector?.data?.status?.status === 'SUCCESS',
      connector: connector?.data?.connector
    }
  }

  React.useEffect(() => {
    if (!isEmpty(codebase?.connectorRef)) {
      refetch()
    }
  }, [codebase?.connectorRef])

  React.useEffect(() => {
    if (connector?.data?.connector) {
      setConnectionType(
        connector?.data?.connector?.type === 'Git'
          ? connector?.data?.connector.spec.connectionType
          : connector?.data?.connector.spec.type
      )
      setConnectorUrl(connector?.data?.connector.spec.url)
    }
  }, [
    connector?.data?.connector,
    connector?.data?.connector?.spec.type,
    connector?.data?.connector?.spec.url,
    setConnectionType,
    setConnectorUrl
  ])

  const { selectedProject } = useAppStore()

  const pipelineStages = flatten(pipeline?.stages?.map(s => s?.parallel || s))

  const ciStageExists = pipelineStages?.some?.(stage => {
    if (stage?.stage?.type) {
      return stage?.stage?.type === StageTypes.BUILD
    } else {
      return false
    }
  })

  const isCodebaseEnabled =
    typeof codebaseStatus !== 'undefined' &&
    selectedProject?.modules &&
    selectedProject.modules.indexOf?.('CI') > -1 &&
    ciStageExists

  const atLeastOneCloneCodebaseEnabled = pipelineStages?.some?.(stage => (stage?.stage?.spec as any)?.cloneCodebase)

  React.useEffect(() => {
    if (atLeastOneCloneCodebaseEnabled) {
      if (!codebase?.connectorRef) {
        setCodebaseStatus(CodebaseStatuses.NotConfigured)
      } else {
        const validate = async () => {
          setCodebaseStatus(CodebaseStatuses.Validating)

          const connectorResult = await getConnectorPromise({
            identifier: connectorId,
            queryParams: {
              accountIdentifier: accountId,
              orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
              projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
            }
          })

          if (connectorResult?.data?.connector?.spec.type === 'Account') {
            try {
              const response = await getTestGitRepoConnectionResultPromise({
                identifier: connectorId,
                queryParams: {
                  accountIdentifier: accountId,
                  orgIdentifier:
                    initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
                  projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined,
                  repoURL:
                    (connectorResult?.data?.connector?.spec.url[
                      connectorResult?.data?.connector?.spec.url.length - 1
                    ] === '/'
                      ? connectorResult?.data?.connector?.spec.url
                      : connectorResult?.data?.connector?.spec.url + '/') + codebase?.repoName
                },
                body: undefined
              })

              if (response?.data?.status === 'SUCCESS') {
                setCodebaseStatus(CodebaseStatuses.Valid)
              } else {
                setCodebaseStatus(CodebaseStatuses.Invalid)
              }
            } catch (error) {
              setCodebaseStatus(CodebaseStatuses.Invalid)
            }
          } else {
            try {
              const response = await getTestConnectionResultPromise({
                identifier: connectorId,
                queryParams: {
                  accountIdentifier: accountId,
                  orgIdentifier:
                    initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
                  projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
                },
                body: undefined
              })

              if (response?.data?.status === 'SUCCESS') {
                setCodebaseStatus(CodebaseStatuses.Valid)
              } else {
                setCodebaseStatus(CodebaseStatuses.Invalid)
              }
            } catch (error) {
              setCodebaseStatus(CodebaseStatuses.Invalid)
            }
          }
        }

        validate()
      }
    } else {
      setCodebaseStatus(CodebaseStatuses.ZeroState)
    }
  }, [codebase?.connectorRef, codebase?.repoName, atLeastOneCloneCodebaseEnabled])

  const openCodebaseDialog = React.useCallback(() => {
    setIsCodebaseDialogOpen(true)
  }, [setIsCodebaseDialogOpen])

  const closeCodebaseDialog = React.useCallback(() => {
    setIsCodebaseDialogOpen(false)

    if (!connector?.data?.connector?.spec.type && !connector?.data?.connector?.spec.url) {
      setConnectionType('')
      setConnectorUrl('')
    }
  }, [
    connector?.data?.connector?.spec.type,
    connector?.data?.connector?.spec.url,
    setIsCodebaseDialogOpen,
    setConnectionType,
    setConnectorUrl
  ])

  const { getString } = useStrings()
  const [isGitExpOpen, setIsGitExpOpen] = React.useState(false)

  return (
    <div className={css.rightBar}>
      {!isGitSyncEnabled && isGitSyncFeatureFlag && (
        <Popover
          position={Position.LEFT}
          onOpening={() => setIsGitExpOpen(true)}
          onClosing={() => setIsGitExpOpen(false)}
          popoverClassName={css.gitSyncPopover}
        >
          <Button
            className={cx(css.iconButton, css.enableGitExpIcon, {
              [css.selected]: isGitExpOpen
            })}
            font={{ weight: 'semi-bold', size: 'xsmall' }}
            icon="service-github"
            text={getString('gitsync.label')}
            iconProps={{ size: 22, color: Color.RED_500 }}
            onClick={() => {
              updatePipelineView({
                ...pipelineView,
                isDrawerOpened: false,
                drawerData: { type: DrawerTypes.AddStep }
              })
            }}
            withoutCurrentColor={true}
          />
          <EnableGitExperience />
        </Popover>
      )}
      {isCodebaseEnabled && (
        <Button
          className={cx(css.iconButton)}
          text={getString('codebase')}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon={codebaseIcons[codebaseStatus] as IconName}
          iconProps={{ size: 20 }}
          minimal
          withoutCurrentColor
          onClick={() => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: false,
              drawerData: { type: DrawerTypes.AddStep },
              isSplitViewOpen: false,
              splitViewData: {}
            })
            openCodebaseDialog()
          }}
        />
      )}

      <Button
        className={cx(css.iconButton, css.notificationsIcon, {
          [css.selected]: type === DrawerTypes.PipelineNotifications
        })}
        onClick={() => {
          updatePipelineView({
            ...pipelineView,
            isDrawerOpened: true,
            drawerData: { type: DrawerTypes.PipelineNotifications },
            isSplitViewOpen: false,
            splitViewData: {}
          })
        }}
        font={{ weight: 'semi-bold', size: 'xsmall' }}
        icon="right-bar-notification"
        iconProps={{ size: 28 }}
        text={getString('notifications.notificationRules')}
        withoutCurrentColor={true}
      />
      {isFlowControlEnabled && (
        <Button
          className={cx(css.iconButton, css.flowControlIcon, {
            [css.selected]: type === DrawerTypes.FlowControl
          })}
          onClick={() => {
            updatePipelineView({
              ...pipelineView,
              isDrawerOpened: true,
              drawerData: { type: DrawerTypes.FlowControl },
              isSplitViewOpen: false,
              splitViewData: {}
            })
          }}
          font={{ weight: 'semi-bold', size: 'xsmall' }}
          icon="settings"
          iconProps={{ size: 20 }}
          text={getString('pipeline.barriers.flowControl')}
        />
      )}

      <Button
        className={cx(css.iconButton, css.variablesIcon, { [css.selected]: type === DrawerTypes.PipelineVariables })}
        onClick={() =>
          updatePipelineView({
            ...pipelineView,
            isDrawerOpened: true,
            drawerData: { type: DrawerTypes.PipelineVariables },
            isSplitViewOpen: false,
            splitViewData: {}
          })
        }
        font={{ weight: 'semi-bold', size: 'xsmall' }}
        icon="pipeline-variables"
        iconProps={{ size: 20 }}
        text={getString('variablesText')}
        data-testid="input-variable"
      />
      <div />
      {isCodebaseDialogOpen && (
        <Dialog
          isOpen={true}
          title={
            // TODO: Move to strings
            codebaseStatus === CodebaseStatuses.NotConfigured ? 'Configure Codebase' : 'Edit Codebase Configuration'
          }
          onClose={closeCodebaseDialog}
        >
          <Formik
            enableReinitialize
            initialValues={codebaseInitialValues}
            validationSchema={Yup.object().shape({
              connectorRef: Yup.mixed().required(getString('fieldRequired', { field: getString('connector') })),
              ...(connectionType === 'Account' && {
                repoName: Yup.string().required(getString('validation.repositoryName'))
              })
            })}
            validate={values => {
              const errors = {}
              if (getMultiTypeFromValue(values.depth) === MultiTypeInputType.FIXED) {
                try {
                  Yup.number()
                    .integer(getString('pipeline.onlyPositiveInteger'))
                    .positive(getString('pipeline.onlyPositiveInteger'))
                    .typeError(getString('pipeline.onlyPositiveInteger'))
                    .validateSync(values.depth)
                } catch (error) {
                  set(errors, 'depth', error.message)
                }
              }
              try {
                generateSchemaForLimitMemory({ getString }).validateSync(values.memoryLimit)
              } catch (error) {
                set(errors, 'memoryLimit', error.message)
              }
              try {
                generateSchemaForLimitCPU({ getString }).validateSync(values.cpuLimit)
              } catch (error) {
                set(errors, 'cpuLimit', error.message)
              }
              return errors
            }}
            onSubmit={(values): void => {
              set(pipeline, 'properties.ci.codebase', {
                connectorRef:
                  typeof values.connectorRef === 'string' ? values.connectorRef : values.connectorRef?.value,
                ...(values.repoName && { repoName: values.repoName }),
                build: RUNTIME_INPUT_VALUE
              })

              // Repo level connectors should not have repoName
              if (connectionType === 'Repo' && (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName) {
                delete (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName
              }

              if (get(pipeline, 'properties.ci.codebase.depth') !== values.depth) {
                const depthValue =
                  getMultiTypeFromValue(values.depth) === MultiTypeInputType.FIXED
                    ? values.depth
                      ? Number.parseInt(values.depth)
                      : undefined
                    : values.depth
                set(pipeline, 'properties.ci.codebase.depth', depthValue)
              }

              const sslVerifyVal = values.sslVerify === undefined ? values.sslVerify : !!values.sslVerify
              if (get(pipeline, 'properties.ci.codebase.sslVerify') !== sslVerifyVal) {
                set(pipeline, 'properties.ci.codebase.sslVerify', sslVerifyVal)
              }

              if (get(pipeline, 'properties.ci.codebase.resources.limits.memory') !== values.memoryLimit) {
                set(pipeline, 'properties.ci.codebase.resources.limits.memory', values.memoryLimit)
              }

              if (get(pipeline, 'properties.ci.codebase.resources.limits.cpu') !== values.cpuLimit) {
                set(pipeline, 'properties.ci.codebase.resources.limits.cpu', values.cpuLimit)
              }

              updatePipeline(pipeline)

              closeCodebaseDialog()
            }}
          >
            {({ values, setFieldValue, submitForm, errors }) => (
              <>
                <div className={Classes.DIALOG_BODY}>
                  <FormikForm>
                    <ConnectorReferenceField
                      name="connectorRef"
                      type={['Git', 'Github', 'Gitlab', 'Bitbucket', 'Codecommit']}
                      selected={values.connectorRef}
                      width={460}
                      error={errors?.connectorRef}
                      label={getString('connector')}
                      placeholder={loading ? getString('loading') : getString('select')}
                      disabled={loading}
                      accountIdentifier={accountId}
                      projectIdentifier={projectIdentifier}
                      orgIdentifier={orgIdentifier}
                      onChange={(value, scope) => {
                        setConnectionType(value.type === 'Git' ? value.spec.connectionType : value.spec.type)
                        setConnectorUrl(value.spec.url)

                        setFieldValue('connectorRef', {
                          label: value.name || '',
                          value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${value.identifier}`,
                          scope: scope,
                          live: value?.status?.status === 'SUCCESS',
                          connector: value
                        })
                      }}
                      gitScope={{ repo: repoIdentifier || '', branch, getDefaultFromOtherRepo: true }}
                    />
                    {connectionType === 'Repo' ? (
                      <>
                        <Text margin={{ bottom: 'xsmall' }}>
                          {getString('pipelineSteps.build.create.repositoryNameLabel')}
                        </Text>
                        <TextInput name="repoName" value={connectorUrl} style={{ flexGrow: 1 }} disabled />
                      </>
                    ) : (
                      <>
                        <FormInput.Text
                          // TODO: Move to strings, in EditStageView too
                          label={'Repository Name'}
                          name="repoName"
                          style={{ flexGrow: 1 }}
                        />
                        {connectorUrl.length > 0 ? (
                          <div className={css.predefinedValue}>
                            {(connectorUrl[connectorUrl.length - 1] === '/' ? connectorUrl : connectorUrl + '/') +
                              (values.repoName ? values.repoName : '')}
                          </div>
                        ) : null}
                      </>
                    )}
                    <Accordion>
                      <Accordion.Panel
                        id="advanced"
                        summary={
                          <Layout.Horizontal>
                            <Text font={{ weight: 'bold' }}>{getString('advancedTitle')}</Text>&nbsp;
                            <Text>{getString('pipeline.optionalLabel')}</Text>
                          </Layout.Horizontal>
                        }
                        details={
                          <div>
                            <FormInput.Text
                              name="depth"
                              label={
                                <div className={css.labelWrapper}>
                                  <Text>{getString('pipeline.depth')}</Text>
                                  <Button
                                    icon="question"
                                    minimal
                                    tooltip={getString('pipeline.depth')}
                                    iconProps={{ size: 14 }}
                                  />
                                </div>
                              }
                              style={{ width: '50%' }}
                            />
                            <FormInput.Select
                              name="sslVerify"
                              label={
                                <div className={css.labelWrapper}>
                                  <Text>{getString('pipeline.sslVerify')}</Text>
                                  <Button
                                    icon="question"
                                    minimal
                                    tooltip={getString('pipeline.sslVerify')}
                                    iconProps={{ size: 14 }}
                                  />
                                </div>
                              }
                              items={sslVerifyOptions}
                              style={{ width: '50%' }}
                            />
                            <Text margin={{ top: 'small' }}>
                              {getString('pipelineSteps.setContainerResources')}
                              <Button
                                icon="question"
                                minimal
                                tooltip={getString('pipelineSteps.setContainerResourcesTooltip')}
                                iconProps={{ size: 14 }}
                              />
                            </Text>
                            <Layout.Horizontal spacing="small">
                              <FormInput.Text
                                name="memoryLimit"
                                label={
                                  <Text margin={{ bottom: 'xsmall' }}>
                                    {getString('pipelineSteps.limitMemoryLabel')}
                                  </Text>
                                }
                                placeholder={getString('pipelineSteps.limitMemoryPlaceholder')}
                                style={{ flex: 1 }}
                              />
                              <FormInput.Text
                                name="cpuLimit"
                                label={
                                  <Text margin={{ bottom: 'xsmall' }}>{getString('pipelineSteps.limitCPULabel')}</Text>
                                }
                                placeholder={getString('pipelineSteps.limitCPUPlaceholder')}
                                style={{ flex: 1 }}
                              />
                            </Layout.Horizontal>
                          </div>
                        }
                      />
                    </Accordion>
                  </FormikForm>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                  <Button intent="primary" text={getString('save')} onClick={submitForm} /> &nbsp; &nbsp;
                  <Button text={getString('cancel')} onClick={closeCodebaseDialog} />
                </div>
              </>
            )}
          </Formik>
        </Dialog>
      )}
      <RightDrawer />
    </div>
  )
}
