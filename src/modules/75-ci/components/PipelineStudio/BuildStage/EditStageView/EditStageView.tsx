/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import {
  Text,
  Container,
  Formik,
  FormikForm,
  FormInput,
  Button,
  Switch,
  HarnessDocTooltip,
  TextInput,
  RUNTIME_INPUT_VALUE,
  Color
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { defaultTo, isEmpty, set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import type { FormikErrors } from 'formik'
import { produce } from 'immer'
import { parse } from 'yaml'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { ConnectorInfoDTO, useGetConnector } from 'services/cd-ng'
import {
  PipelineContextType,
  usePipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import {
  ConnectorReferenceField,
  ConnectorReferenceFieldProps
} from '@connectors/components/ConnectorReferenceField/ConnectorReferenceField'
import { NameId, NameIdDescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { IdentifierSchemaWithoutHook, NameSchemaWithoutHook } from '@common/utils/Validation'
import { Scope } from '@common/interfaces/SecretsInterface'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'
import { useGitScope } from '@pipeline/utils/CIUtils'
import type { BuildStageElementConfig, StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { TemplateSummaryResponse } from 'services/template-ng'
import { createTemplate, getTemplateNameWithLabel } from '@pipeline/utils/templateUtils'
import css from './EditStageView.module.scss'

export interface EditStageView {
  data?: StageElementWrapper<BuildStageElementConfig>
  template?: TemplateSummaryResponse
  onSubmit?: (
    values: StageElementWrapper<BuildStageElementConfig>,
    identifier: string,
    pipeline?: PipelineInfoConfig
  ) => void
  onChange?: (values: Values) => void
}

interface Values {
  identifier: string
  name: string
  description?: string
  tags?: { [key: string]: string }
  cloneCodebase?: boolean
  connectorRef?: ConnectorReferenceFieldProps['selected']
  repoName?: string
}

export const EditStageView: React.FC<EditStageView> = ({ data, template, onSubmit, onChange }): JSX.Element => {
  const { getString } = useStrings()
  const [connectionType, setConnectionType] = React.useState('')
  const [connectorUrl, setConnectorUrl] = React.useState('')
  const gitScope = useGitScope()
  const repositoryNameLabel = getString('common.repositoryName')

  const {
    state: { pipeline, templateTypes },
    contextType,
    isReadonly,
    setTemplateTypes
  } = usePipelineContext()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const initialValues: Values = {
    identifier: data?.stage?.identifier || '',
    name: data?.stage?.name || '',
    description: data?.stage?.description,
    tags: data?.stage?.tags,
    cloneCodebase: defaultTo(
      template
        ? parse(defaultTo(template.yaml, '')).template.spec.spec.cloneCodebase
        : data?.stage?.spec?.cloneCodebase,
      true
    )
  }

  const codebase = (pipeline as PipelineInfoConfig)?.properties?.ci?.codebase

  const connectorId = getIdentifierFromValue((codebase?.connectorRef as string) || '')
  const initialScope = getScopeFromValue((codebase?.connectorRef as string) || '')

  const {
    data: connector,
    loading,
    refetch
  } = useGetConnector({
    identifier: connectorId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined,
      ...(gitScope?.repo && gitScope.branch
        ? { repoIdentifier: gitScope.repo, branch: gitScope.branch, getDefaultFromOtherRepo: true }
        : {})
    },
    lazy: true,
    debounce: 300
  })

  if (connector?.data?.connector) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    initialValues.connectorRef = {
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

  const validationSchema = () =>
    Yup.lazy((values: Values): any =>
      Yup.object().shape({
        ...(contextType === PipelineContextType.Pipeline && {
          name: NameSchemaWithoutHook(getString, {
            requiredErrorMsg: getString('fieldRequired', { field: getString('stageNameLabel') })
          }),
          identifier: IdentifierSchemaWithoutHook(getString)
        }),
        ...(!codebase &&
          contextType === PipelineContextType.Pipeline &&
          values.cloneCodebase && {
            connectorRef: Yup.mixed().required(getString('fieldRequired', { field: getString('connector') })),
            ...(connectionType === 'Account' && {
              repoName: Yup.string().required(getString('fieldRequired', { field: repositoryNameLabel }))
            })
          })
      })
    )

  const handleValidate = (values: Values): FormikErrors<Values> => {
    const errors: { name?: string } = {}
    if (isDuplicateStageId(values.identifier, pipeline?.stages || [])) {
      errors.name = getString('validation.identifierDuplicate')
    }
    if (data) {
      onChange?.(values)
    }
    return errors
  }

  const handleSubmit = (values: Values): void => {
    if (data?.stage) {
      // TODO: Add Codebase verification
      let pipelineData: PipelineInfoConfig | undefined = undefined
      if (values.cloneCodebase && values.connectorRef) {
        pipelineData = produce(pipeline, draft => {
          set(draft, 'properties.ci.codebase', {
            connectorRef: typeof values.connectorRef === 'string' ? values.connectorRef : values.connectorRef?.value,
            ...(values.repoName && { repoName: values.repoName }),
            build: RUNTIME_INPUT_VALUE
          })

          // Repo level connectors should not have repoName
          if (connectionType === 'Repo' && (draft as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName) {
            delete (draft as PipelineInfoConfig)?.properties?.ci?.codebase?.repoName
          }
        })
      }

      if (template) {
        if (template.identifier && template.childType) {
          templateTypes[template.identifier] = template.childType
          setTemplateTypes(templateTypes)
        }
        onSubmit?.({ stage: createTemplate(values, template) }, values.identifier, pipelineData)
      } else {
        data.stage.identifier = values.identifier
        data.stage.name = values.name
        if (values.description) data.stage.description = values.description
        if (values.tags) data.stage.tags = values.tags
        if (!data.stage.spec) data.stage.spec = {} as any
        set(data, 'stage.spec.cloneCodebase', values.cloneCodebase)
        onSubmit?.(data, values.identifier, pipelineData)
      }
    }
  }

  return (
    <div className={css.stageCreate}>
      <Container padding="medium">
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={validationSchema}
          validate={handleValidate}
          formName="ciEditStage"
          onSubmit={handleSubmit}
        >
          {formikProps => (
            <FormikForm>
              <Text
                font={{ size: 'medium', weight: 'semi-bold' }}
                icon="ci-main"
                iconProps={{ size: 24, margin: { right: 'xsmall' } }}
                margin={{ bottom: 'medium' }}
                className={css.addStageHeading}
              >
                {getString('pipelineSteps.build.create.aboutYourStage')}
              </Text>
              {contextType === PipelineContextType.Pipeline &&
                (template ? (
                  <NameId
                    identifierProps={{
                      inputLabel: getString('stageNameLabel'),
                      inputGroupProps: {
                        disabled: isReadonly,
                        placeholder: getString('pipeline.aboutYourStage.stageNamePlaceholder')
                      }
                    }}
                  />
                ) : (
                  <NameIdDescriptionTags
                    formikProps={formikProps}
                    identifierProps={{
                      inputLabel: getString('stageNameLabel'),
                      inputGroupProps: {
                        disabled: isReadonly,
                        placeholder: getString('pipeline.aboutYourStage.stageNamePlaceholder')
                      }
                    }}
                    descriptionProps={{ disabled: isReadonly }}
                    tagsProps={{ disabled: isReadonly }}
                  />
                ))}
              {template ? (
                <Text
                  icon={'template-library'}
                  margin={{ top: 'medium', bottom: 'medium' }}
                  font={{ size: 'small' }}
                  iconProps={{ size: 12, margin: { right: 'xsmall' } }}
                  color={Color.BLACK}
                >
                  {`Using Template: ${getTemplateNameWithLabel(template)}`}
                </Text>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 'var(--spacing-small)' }}>
                  <Switch
                    label={getString('cloneCodebaseLabel')}
                    onChange={e => formikProps.setFieldValue('cloneCodebase', e.currentTarget.checked)}
                    defaultChecked={formikProps.values.cloneCodebase}
                    disabled={isReadonly}
                  />
                  <HarnessDocTooltip tooltipId="cloneCodebase" useStandAlone={true} />
                </div>
              )}
              {/* We don't need to configure CI Codebase if it is already configured or we are skipping Clone Codebase step */}
              {!codebase && formikProps.values.cloneCodebase && contextType === PipelineContextType.Pipeline && (
                <div className={css.configureCodebase}>
                  <Text
                    font={{ size: 'normal', weight: 'semi-bold' }}
                    icon="cog"
                    iconProps={{ size: 16 }}
                    margin={{ bottom: 'medium' }}
                    style={{ color: 'var(--grey-700)' }}
                  >
                    {getString('pipelineSteps.build.create.configureCodebase')}
                  </Text>
                  <Text margin={{ bottom: 'medium' }}>
                    {getString('pipelineSteps.build.create.configureCodebaseHelperText')}
                  </Text>
                  <ConnectorReferenceField
                    className={css.connector}
                    error={
                      formikProps.submitCount && formikProps.errors.connectorRef
                        ? formikProps.errors.connectorRef
                        : undefined
                    }
                    name="connectorRef"
                    type={['Git', 'Github', 'Gitlab', 'Bitbucket', 'Codecommit']}
                    selected={formikProps.values.connectorRef}
                    label={getString('connector')}
                    width={366}
                    placeholder={loading ? getString('loading') : getString('connectors.selectConnector')}
                    disabled={loading || isReadonly}
                    accountIdentifier={accountId}
                    projectIdentifier={projectIdentifier}
                    orgIdentifier={orgIdentifier}
                    onChange={(value, scope) => {
                      setConnectionType(value.type === 'Git' ? value.spec.connectionType : value.spec.type)
                      setConnectorUrl(value.spec.url)

                      formikProps.setFieldValue('connectorRef', {
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
                      <Text margin={{ bottom: 'xsmall' }}>{repositoryNameLabel}</Text>
                      <TextInput name="repoName" value={connectorUrl} style={{ flexGrow: 1 }} disabled />
                    </>
                  ) : (
                    <>
                      <FormInput.Text
                        className={css.repositoryUrl}
                        label={repositoryNameLabel}
                        name="repoName"
                        style={{ flexGrow: 1 }}
                        disabled={isReadonly}
                        placeholder={getString('pipeline.manifestType.repoNamePlaceholder')}
                      />
                      {connectorUrl.length > 0 ? (
                        <Text className={css.predefinedValue} width={380} lineClamp={1}>
                          {(connectorUrl[connectorUrl.length - 1] === '/' ? connectorUrl : connectorUrl + '/') +
                            (formikProps.values.repoName ? formikProps.values.repoName : '')}
                        </Text>
                      ) : null}
                    </>
                  )}
                </div>
              )}
              <Button
                type="submit"
                intent="primary"
                text={getString('pipelineSteps.build.create.setupStage')}
                margin={{ top: 'small' }}
              />
            </FormikForm>
          )}
        </Formik>
      </Container>
    </div>
  )
}
