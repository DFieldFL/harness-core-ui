import React, { useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Layout, SelectOption, Heading, Text, Switch } from '@wings-software/uicore'
import { parse, stringify } from 'yaml'
import { isEmpty, isUndefined, merge } from 'lodash-es'
import { Page, useToaster } from '@common/exports'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { Wizard } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import routes from '@common/RouteDefinitions'
import { NgPipeline, useGetConnector, GetConnectorQueryParams } from 'services/cd-ng'
import {
  useGetPipeline,
  useGetTemplateFromPipeline,
  useCreateTrigger,
  useGetTrigger,
  useUpdateTrigger,
  NGTriggerConfig,
  NGTriggerSource
} from 'services/pipeline-ng'
import { useStrings } from 'framework/exports'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import { clearRuntimeInput } from '@pipeline/components/PipelineStudio/StepUtil'
import { Scope } from '@common/interfaces/SecretsInterface'
import { getIdentifierFromValue, getScopeFromValue } from '@common/components/EntityReference/EntityReference'
import type { AddConditionInterface } from './views/AddConditionsSection'
import { GitSourceProviders } from './utils/TriggersListUtils'
import { eventTypes } from './utils/TriggersWizardPageUtils'
import { WebhookTriggerConfigPanel, WebhookConditionsPanel, WebhookPipelineInputPanel } from './views'
import {
  clearNullUndefined,
  ConnectorRefInterface,
  FlatInitialValuesInterface,
  FlatOnEditValuesInterface,
  FlatValidFormikValuesInterface,
  getQueryParamsOnNew,
  getWizardMap,
  PayloadConditionTypes,
  ResponseStatus,
  TriggerTypes,
  getValidationSchema
} from './utils/TriggersWizardPageUtils'
import css from './TriggersWizardPage.module.scss'
const TriggersWizardPage: React.FC = (): JSX.Element => {
  const { orgIdentifier, accountId, projectIdentifier, pipelineIdentifier, triggerIdentifier, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
      pipelineIdentifier: string
      targetIdentifier: string
      triggerIdentifier: string
    }>
  >()
  const history = useHistory()
  const { location } = useHistory()
  const { getString } = useStrings()
  // use passed params on new trigger
  const queryParamsOnNew = location?.search ? getQueryParamsOnNew(location.search) : undefined
  const { sourceRepo: sourceRepoOnNew, triggerType: triggerTypeOnNew } = queryParamsOnNew || {}

  const { data: template } = useGetTemplateFromPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, pipelineIdentifier, projectIdentifier }
  })

  const { data: triggerResponse, loading: loadingGetTrigger } = useGetTrigger({
    triggerIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier
    }
  })

  const [connectorScopeParams, setConnectorScopeParams] = useState<GetConnectorQueryParams | undefined>(undefined)

  const { mutate: createTrigger, error: createTriggerErrorResponse, loading: createTriggerLoading } = useCreateTrigger({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const { mutate: updateTrigger, error: updateTriggerErrorResponse, loading: updateTriggerLoading } = useUpdateTrigger({
    triggerIdentifier,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const [enabledStatus, setEnabledStatus] = useState<boolean>(true)
  const [getTriggerErrorMessage, setGetTriggerErrorMessage] = useState<string>('')
  const [currentPipeline, setCurrentPipeline] = useState<{ pipeline?: NgPipeline } | undefined>(undefined)
  const [onEditInitialValues, setOnEditInitialValues] = useState<
    | FlatOnEditValuesInterface
    | { pipeline?: string; identifier?: string; connectorRef?: { identifier?: string; scope?: string } }
  >({})

  const { data: connectorData, refetch: getConnectorDetails } = useGetConnector({
    identifier: getIdentifierFromValue(onEditInitialValues?.connectorRef?.identifier || '') as string,
    queryParams: connectorScopeParams,
    lazy: true
  })

  useEffect(() => {
    setCurrentPipeline(
      merge(clearRuntimeInput(parse(template?.data?.inputSetTemplateYaml || '')), currentPipeline || {}) as {
        pipeline: NgPipeline
      }
    )
  }, [template?.data?.inputSetTemplateYaml])

  useEffect(() => {
    if (onEditInitialValues?.connectorRef?.identifier && !isUndefined(connectorScopeParams)) {
      getConnectorDetails()
    }
  }, [onEditInitialValues?.connectorRef?.identifier, connectorScopeParams])

  useEffect(() => {
    if (connectorData?.data?.connector?.name && onEditInitialValues?.connectorRef?.identifier) {
      const { connector } = connectorData.data
      const connectorRef = {
        ...onEditInitialValues.connectorRef,
        label: connector.name,
        connector
      }
      setOnEditInitialValues({ ...onEditInitialValues, connectorRef })
    }
  }, [connectorData?.data?.connector?.name, onEditInitialValues?.connectorRef?.identifier])

  useEffect(() => {
    if (triggerResponse?.data?.enabled === false) {
      setEnabledStatus(false)
    }
  }, [triggerResponse?.data?.enabled])

  const { data: pipelineResponse } = useGetPipeline({
    pipelineIdentifier,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const originalPipeline: NgPipeline | undefined = parse((pipelineResponse?.data?.yamlPipeline as any) || '')?.pipeline

  useEffect(() => {
    if (triggerResponse?.data?.yaml && triggerResponse.data.type) {
      let newOnEditInitialValues: FlatOnEditValuesInterface | undefined
      let gitRepoSpecCopy
      try {
        const triggerResponseJson = parse(triggerResponse.data.yaml)
        const {
          trigger: {
            name,
            identifier,
            description,
            tags,
            source: {
              spec: {
                spec: { actions, event, gitRepoSpec, payloadConditions, headerConditions, authToken },
                type
              }
            },
            target: {
              targetIdentifier,
              spec: { runtimeInputYaml: pipelineYaml }
            }
          }
        } = triggerResponseJson
        const { value: sourceBranchValue, operator: sourceBranchOperator } =
          payloadConditions?.find(
            (payloadCondition: AddConditionInterface) => payloadCondition.key === PayloadConditionTypes.SOURCE_BRANCH
          ) || {}
        const { value: targetBranchValue, operator: targetBranchOperator } =
          payloadConditions?.find(
            (payloadCondition: AddConditionInterface) => payloadCondition.key === PayloadConditionTypes.TARGET_BRANCH
          ) || {}
        let pipelineJson = undefined
        try {
          pipelineJson = parse(pipelineYaml)?.pipeline
        } catch (e) {
          // set error
          setGetTriggerErrorMessage(getString('pipeline-triggers.cannotParseInputValues'))
        }

        newOnEditInitialValues = {
          name,
          identifier,
          description,
          tags,
          pipeline: pipelineJson,
          sourceRepo: type,
          triggerType: triggerResponse.data.type,
          event: event,
          targetIdentifier,
          secureToken: authToken?.spec?.value,
          actions: actions?.map((action: string) => ({ label: action, value: action })),
          anyAction: actions?.length === 0,
          sourceBranchOperator,
          sourceBranchValue,
          targetBranchOperator,
          targetBranchValue,
          headerConditions,
          payloadConditions: payloadConditions?.filter(
            (payloadCondition: AddConditionInterface) =>
              payloadCondition.key !== PayloadConditionTypes.SOURCE_BRANCH &&
              payloadCondition.key !== PayloadConditionTypes.TARGET_BRANCH
          )
        }
        gitRepoSpecCopy = gitRepoSpec
      } catch (e) {
        // set error
        setGetTriggerErrorMessage(getString('pipeline-triggers.cannotParseTriggersData'))
      }

      if (
        newOnEditInitialValues &&
        newOnEditInitialValues.sourceRepo !== GitSourceProviders.CUSTOM.value &&
        gitRepoSpecCopy?.identifier
      ) {
        const connectorRef: ConnectorRefInterface = {
          identifier: gitRepoSpecCopy.identifier,
          value: gitRepoSpecCopy.identifier
        }
        const connectorParams: GetConnectorQueryParams = {
          accountIdentifier: accountId
        }

        if (getScopeFromValue(gitRepoSpecCopy.identifier) === Scope.ORG) {
          connectorParams.orgIdentifier = orgIdentifier
        } else if (getScopeFromValue(gitRepoSpecCopy.identifier) === Scope.PROJECT) {
          connectorParams.orgIdentifier = orgIdentifier
          connectorParams.projectIdentifier = projectIdentifier
        }

        setConnectorScopeParams(connectorParams)

        newOnEditInitialValues.connectorRef = connectorRef

        if (gitRepoSpecCopy?.repoName) {
          newOnEditInitialValues.repoName = gitRepoSpecCopy.repoName
        }
      }

      setOnEditInitialValues({ ...onEditInitialValues, ...newOnEditInitialValues })
    }
  }, [triggerIdentifier, triggerResponse])

  // enable later
  // useEffect(() => {
  //   const onEditoriginalPipeline = (pipelineResponse?.data?.ngPipeline as any)?.pipeline
  //   if (originalPipeline) {
  //     setOnEditInitialValues({ ...onEditInitialValues, originalPipeline: onEditoriginalPipeline })
  //   }
  // }, [pipelineResponse])

  const returnToTriggersPage = (): void => {
    history.push(
      routes.toTriggersPage({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        module
      })
    )
  }
  const { showSuccess } = useToaster()
  const handleSubmit = async (val: FlatValidFormikValuesInterface): Promise<void> => {
    const {
      name,
      identifier,
      description,
      tags,
      pipeline: pipelineRuntimeInput,
      sourceRepo: formikValueSourceRepo,
      triggerType: formikValueTriggerType,
      repoName,
      connectorRef,
      event,
      actions,
      targetIdentifier,
      sourceBranchOperator,
      sourceBranchValue,
      targetBranchOperator,
      targetBranchValue,
      headerConditions = [],
      payloadConditions = [],
      secureToken
    } = val

    if (formikValueSourceRepo !== GitSourceProviders.CUSTOM.value) {
      if (targetBranchOperator && targetBranchValue?.trim()) {
        payloadConditions.unshift({
          key: PayloadConditionTypes.TARGET_BRANCH,
          operator: targetBranchOperator,
          value: targetBranchValue
        })
      }
      if (sourceBranchOperator && sourceBranchValue?.trim() && event !== eventTypes.PUSH) {
        payloadConditions.unshift({
          key: PayloadConditionTypes.SOURCE_BRANCH,
          operator: sourceBranchOperator,
          value: sourceBranchValue
        })
      }
    }

    // actions will be required thru validation
    const actionsValues = ((actions as unknown) as SelectOption[])?.map(action => action.value)
    const stringifyPipelineRuntimeInput = stringify({ pipeline: clearNullUndefined(pipelineRuntimeInput) })
    const triggerJson: NGTriggerConfig = {
      name,
      identifier,
      enabled: enabledStatus,
      description,
      tags,
      target: {
        targetIdentifier: targetIdentifier || pipelineIdentifier,
        type: 'Pipeline',
        spec: {
          runtimeInputYaml: stringifyPipelineRuntimeInput
        }
      },
      source: {
        type: (formikValueTriggerType as unknown) as NGTriggerSource['type'],
        spec: {
          type: formikValueSourceRepo,
          spec: {
            gitRepoSpec: { identifier: connectorRef?.value, repoName },
            event,
            actions: actionsValues
          }
        }
      }
    }

    if (formikValueSourceRepo === GitSourceProviders.CUSTOM.value && secureToken && triggerJson.source?.spec) {
      triggerJson.source.spec.spec = { authToken: { type: 'inline', spec: { value: secureToken } } }
    }

    if (!isEmpty(payloadConditions) && triggerJson.source?.spec) {
      triggerJson.source.spec.spec.payloadConditions = payloadConditions
    }

    if (!isEmpty(headerConditions) && triggerJson.source?.spec) {
      triggerJson.source.spec.spec.headerConditions = headerConditions
    }

    if (onEditInitialValues?.identifier) {
      const { status, data } = await updateTrigger(stringify({ trigger: clearNullUndefined(triggerJson) }) as any)
      if (status === ResponseStatus.SUCCESS) {
        showSuccess(getString('pipeline-triggers.toast.successfulUpdate', { name: data?.name }))
        history.push(
          routes.toTriggersPage({
            accountId,
            orgIdentifier,
            projectIdentifier,
            pipelineIdentifier,
            module
          })
        )
      }
      // error flow sent to Wizard
    } else {
      const { status, data } = await createTrigger(stringify({ trigger: clearNullUndefined(triggerJson) }) as any)
      if (status === ResponseStatus.SUCCESS) {
        showSuccess(getString('pipeline-triggers.toast.successfulCreate', { name: data?.name }))
        history.push(
          routes.toTriggersPage({
            accountId,
            orgIdentifier,
            projectIdentifier,
            pipelineIdentifier,
            module
          })
        )
      }
    }
  }

  const initialValues: FlatInitialValuesInterface = Object.assign(
    {
      triggerType: (triggerTypeOnNew as unknown) as NGTriggerSource['type'],
      sourceRepo: sourceRepoOnNew,
      identifier: '',
      tags: {},
      pipeline: currentPipeline?.pipeline,
      originalPipeline
    },
    onEditInitialValues
  )

  const wizardMap =
    initialValues.sourceRepo && initialValues.triggerType
      ? getWizardMap({ triggerType: initialValues.triggerType, getString, triggerName: initialValues?.name })
      : undefined

  const titleWithSwitch = (
    <Layout.Horizontal
      spacing="medium"
      style={{ paddingLeft: 'var(--spacing-large)', paddingTop: 'var(--spacing-xsmall)', alignItems: 'baseline' }}
    >
      <Heading level={2}>{wizardMap?.wizardLabel}</Heading>
      <Text>{getString('enabledLabel')}</Text>

      <Switch
        label=""
        data-name="enabled-switch"
        key={Date.now()}
        checked={enabledStatus}
        onChange={() => setEnabledStatus(!enabledStatus)}
      />
    </Layout.Horizontal>
  )

  const errorToasterMessage =
    ((createTriggerErrorResponse?.data as unknown) as { message?: string })?.message ||
    ((updateTriggerErrorResponse?.data as unknown) as { message?: string })?.message
  // ((getTriggerErrorResponse?.data as unknown) as { message?: string })?.message
  const renderWebhookWizard = (): JSX.Element | undefined => {
    const isEdit = !!onEditInitialValues?.identifier
    if (!wizardMap) return undefined
    return (
      <Wizard
        formikInitialProps={{
          initialValues,
          onSubmit: (val: FlatValidFormikValuesInterface) => handleSubmit(val),
          validationSchema: getValidationSchema(getString),
          enableReinitialize: true
        }}
        className={css.tabs}
        wizardMap={wizardMap}
        tabWidth="218px"
        onHide={returnToTriggersPage}
        // defaultTabId="Conditions"
        submitLabel={
          isEdit ? getString('pipeline-triggers.updateTrigger') : getString('pipeline-triggers.createTrigger')
        }
        disableSubmit={loadingGetTrigger || createTriggerLoading || updateTriggerLoading}
        isEdit={isEdit}
        errorToasterMessage={errorToasterMessage}
        showVisualYaml={false}
        leftNav={titleWithSwitch}
      >
        <WebhookTriggerConfigPanel />
        <WebhookConditionsPanel />
        <WebhookPipelineInputPanel />
      </Wizard>
    )
  }

  if (initialValues?.triggerType && !Object.values(TriggerTypes).includes(initialValues.triggerType)) {
    return (
      <Layout.Vertical spacing="medium" padding="medium">
        <Page.Body>
          <h2>{getString('pipeline-triggers.pageNotFound')}</h2>
        </Page.Body>
      </Layout.Vertical>
    )
  }

  return triggerIdentifier && !getTriggerErrorMessage && !wizardMap ? (
    <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
      <PageSpinner />
    </div>
  ) : (
    <>
      <Page.Body>
        {!loadingGetTrigger && getTriggerErrorMessage && <PageError message={getTriggerErrorMessage} />}
        {initialValues.triggerType === TriggerTypes.WEBHOOK && renderWebhookWizard()}
      </Page.Body>
    </>
  )
}
export default TriggersWizardPage
