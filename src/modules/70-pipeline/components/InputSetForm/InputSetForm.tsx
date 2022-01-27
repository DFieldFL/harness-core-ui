/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import * as Yup from 'yup'
import { cloneDeep, defaultTo, isEmpty, isNull, isUndefined, omit, omitBy } from 'lodash-es'
import {
  Button,
  Container,
  Formik,
  FormikForm,
  Layout,
  NestedAccordionProvider,
  FontVariation,
  Text,
  Color,
  ButtonVariation,
  PageHeader,
  PageBody,
  VisualYamlSelectedView as SelectedView,
  VisualYamlToggle
} from '@wings-software/uicore'
import { useHistory, useParams } from 'react-router-dom'
import { parse } from 'yaml'
import type { FormikErrors, FormikProps } from 'formik'
import type { PipelineInfoConfig } from 'services/cd-ng'
import {
  useGetTemplateFromPipeline,
  useGetPipeline,
  useCreateInputSetForPipeline,
  useGetInputSetForPipeline,
  useUpdateInputSetForPipeline,
  InputSetResponse,
  ResponseInputSetResponse,
  useGetMergeInputSetFromPipelineTemplateWithListInput,
  ResponsePMSPipelineResponseDTO,
  EntityGitDetails
} from 'services/pipeline-ng'

import { useToaster } from '@common/exports'
import type { YamlBuilderHandlerBinding, YamlBuilderProps } from '@common/interfaces/YAMLBuilderProps'
import type { InputSetGitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { NameIdDescriptionTags } from '@common/components'
import routes from '@common/RouteDefinitions'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { getFormattedErrors } from '@pipeline/utils/runPipelineUtils'
import { useStrings } from 'framework/strings'
import { AppStoreContext } from 'framework/AppStore/AppStoreContext'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useMutateAsGet, useQueryParams } from '@common/hooks'
import { UseSaveSuccessResponse, useSaveToGitDialog } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import GitContextForm, { GitContextProps } from '@common/components/GitContextForm/GitContextForm'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { changeEmptyValuesToRunTimeInput } from '@pipeline/utils/stageHelpers'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import { useGetYamlWithTemplateRefsResolved } from 'services/template-ng'
import { PipelineInputSetForm } from '../PipelineInputSetForm/PipelineInputSetForm'
import { clearRuntimeInput, validatePipeline } from '../PipelineStudio/StepUtil'
import { factory } from '../PipelineSteps/Steps/__tests__/StepTestUtil'
import { YamlBuilderMemo } from '../PipelineStudio/PipelineYamlView/PipelineYamlView'
import GitPopover from '../GitPopover/GitPopover'
import { ErrorsStrip } from '../ErrorsStrip/ErrorsStrip'
import { StepViewType } from '../AbstractSteps/Step'
import css from './InputSetForm.module.scss'

export interface InputSetDTO extends Omit<InputSetResponse, 'identifier' | 'pipeline'> {
  pipeline?: PipelineInfoConfig
  identifier?: string
  repo?: string
  branch?: string
}

interface SaveInputSetDTO {
  inputSet: InputSetDTO
}

const getDefaultInputSet = (
  template: PipelineInfoConfig,
  orgIdentifier: string,
  projectIdentifier: string
): InputSetDTO => ({
  name: '',
  identifier: '',
  description: undefined,
  orgIdentifier,
  projectIdentifier,
  pipeline: template,
  repo: '',
  branch: ''
})

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `input-set.yaml`,
  entityType: 'InputSets',
  width: 620,
  height: 360,
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false,
    removeEmptyObject: false,
    removeEmptyArray: false
  }
}

const clearNullUndefined = /* istanbul ignore next */ (data: InputSetDTO): InputSetDTO => {
  const omittedInputset = omitBy(omitBy(data, isUndefined), isNull)
  return changeEmptyValuesToRunTimeInput(cloneDeep(omittedInputset), '')
}

export interface InputSetFormProps {
  executionView?: boolean
}

export const InputSetForm: React.FC<InputSetFormProps> = (props): JSX.Element => {
  const { executionView } = props
  const { getString } = useStrings()
  const [isEdit, setIsEdit] = React.useState(false)
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, inputSetIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch, inputSetRepoIdentifier, inputSetBranch } = useQueryParams<InputSetGitQueryParams>()
  const [savedInputSetObj, setSavedInputSetObj] = React.useState<InputSetDTO>({})
  const [initialGitDetails, setInitialGitDetails] = React.useState<EntityGitDetails>({ repoIdentifier, branch })
  const { isGitSyncEnabled } = React.useContext(AppStoreContext)
  const history = useHistory()
  const {
    refetch: refetchTemplate,
    data: template,
    loading: loadingTemplate
  } = useMutateAsGet(useGetTemplateFromPipeline, {
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    },
    body: {
      stageIdentifiers: []
    },
    lazy: true
  })

  const [isEditable] = usePermission(
    {
      resourceScope: {
        projectIdentifier,
        orgIdentifier,
        accountIdentifier: accountId
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE],
      options: {
        skipCache: true
      }
    },
    [projectIdentifier, orgIdentifier, accountId, pipelineIdentifier]
  )

  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const [formErrors, setFormErrors] = React.useState<Record<string, any>>({})
  const { showSuccess, showError } = useToaster()

  const {
    data: inputSetResponse,
    refetch,
    loading: loadingInputSet
  } = useGetInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      repoIdentifier: inputSetRepoIdentifier,
      branch: inputSetBranch
    },
    inputSetIdentifier: inputSetIdentifier || '',
    lazy: true
  })

  const [mergeTemplate, setMergeTemplate] = React.useState<string>()
  // const { openNestedPath } = useNestedAccordion()
  const { mutate: mergeInputSet, loading: loadingMerge } = useGetMergeInputSetFromPipelineTemplateWithListInput({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier,
      pipelineIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch,
      repoIdentifier: inputSetRepoIdentifier,
      branch: inputSetBranch
    }
  })

  const { mutate: createInputSet, loading: createInputSetLoading } = useCreateInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch
    },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })
  const { mutate: updateInputSet, loading: updateInputSetLoading } = useUpdateInputSetForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      pipelineIdentifier,
      projectIdentifier,
      pipelineRepoID: repoIdentifier,
      pipelineBranch: branch
    },
    inputSetIdentifier: '',
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const {
    data: pipeline,
    loading: loadingPipeline,
    refetch: refetchPipeline
  } = useGetPipeline({
    pipelineIdentifier,
    lazy: true,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      repoIdentifier,
      branch
    }
  })

  const { data: templateRefsResolvedPipeline, loading: loadingResolvedPipeline } = useMutateAsGet(
    useGetYamlWithTemplateRefsResolved,
    {
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        pipelineIdentifier,
        projectIdentifier
      },
      body: {
        originalEntityYaml: yamlStringify(parse(pipeline?.data?.yamlPipeline || '')?.pipeline)
      }
    }
  )

  const inputSet = React.useMemo(() => {
    if (inputSetResponse?.data) {
      const inputSetObj = inputSetResponse?.data

      const parsedInputSetObj = parse(inputSetObj?.inputSetYaml || '')
      /*
        Context of the below if block
        We need to populate existing values of input set in the form.
        The values are to be filled come from 'merge' API i.e. mergeTemplate object
        But if the merge API fails (due to invalid input set or any other reason) - we populate the value from the input set response recevied (parsedInputSetObj).
      */
      const parsedPipelineWithValues = mergeTemplate
        ? parse(mergeTemplate || /* istanbul ignore next */ '')?.pipeline || /* istanbul ignore next */ {}
        : parsedInputSetObj?.inputSet?.pipeline

      if (isGitSyncEnabled && parsedInputSetObj && parsedInputSetObj.inputSet) {
        return {
          name: parsedInputSetObj.inputSet.name,
          tags: parsedInputSetObj.inputSet.tags,
          identifier: parsedInputSetObj.inputSet.identifier,
          description: parsedInputSetObj.inputSet.description,
          orgIdentifier: parsedInputSetObj.inputSet.orgIdentifier,
          projectIdentifier: parsedInputSetObj.inputSet.projectIdentifier,
          pipeline: clearRuntimeInput(parsedPipelineWithValues),
          gitDetails: defaultTo(inputSetObj.gitDetails, {}),
          entityValidityDetails: defaultTo(inputSetObj.entityValidityDetails, {})
        }
      }
      return {
        name: inputSetObj.name,
        tags: inputSetObj.tags,
        identifier: inputSetObj.identifier || /* istanbul ignore next */ '',
        description: inputSetObj?.description,
        orgIdentifier,
        projectIdentifier,
        pipeline: clearRuntimeInput(parsedPipelineWithValues),
        gitDetails: inputSetObj.gitDetails ?? {},
        entityValidityDetails: inputSetObj.entityValidityDetails ?? {}
      }
    }
    return getDefaultInputSet(
      clearRuntimeInput(parse(template?.data?.inputSetTemplateYaml || /* istanbul ignore next */ '')?.pipeline as any),
      orgIdentifier,
      projectIdentifier
    )
  }, [mergeTemplate, inputSetResponse?.data, template?.data?.inputSetTemplateYaml, isGitSyncEnabled])

  const [disableVisualView, setDisableVisualView] = React.useState(inputSet.entityValidityDetails?.valid === false)

  const formikRef = React.useRef<FormikProps<InputSetDTO & GitContextProps>>()

  React.useEffect(() => {
    if (inputSet.entityValidityDetails?.valid === false || selectedView === SelectedView.YAML) {
      setSelectedView(SelectedView.YAML)
    } else {
      setSelectedView(SelectedView.VISUAL)
    }
  }, [inputSet, inputSet.entityValidityDetails?.valid])

  React.useEffect(() => {
    if (inputSet.entityValidityDetails?.valid === false) {
      setDisableVisualView(true)
    } else {
      setDisableVisualView(false)
    }
  }, [inputSet.entityValidityDetails?.valid])

  React.useEffect(() => {
    if (inputSetIdentifier !== '-1') {
      setIsEdit(true)
      refetch({ pathParams: { inputSetIdentifier: inputSetIdentifier } })
      refetchTemplate()
      refetchPipeline()
      mergeInputSet({ inputSetReferences: [inputSetIdentifier] })
        .then(response => {
          setMergeTemplate(response.data?.pipelineYaml)
        })
        .catch(e => {
          setMergeTemplate(undefined)
          showError(e?.data?.message || e?.message, undefined, 'pipeline.get.template')
        })
    } else {
      refetchTemplate()
      refetchPipeline()

      setIsEdit(false)
    }
  }, [inputSetIdentifier])

  useDocumentTitle([
    parse(pipeline?.data?.yamlPipeline || '')?.pipeline?.name || getString('pipelines'),
    isEdit ? inputSetResponse?.data?.name || '' : getString('inputSets.newInputSetLabel')
  ])

  const handleModeSwitch = React.useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const yaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
        const inputSetYamlVisual = parse(yaml).inputSet as InputSetDTO
        if (inputSetYamlVisual) {
          inputSet.name = inputSetYamlVisual.name
          inputSet.identifier = inputSetYamlVisual.identifier
          inputSet.description = inputSetYamlVisual.description
          inputSet.pipeline = inputSetYamlVisual.pipeline

          formikRef.current?.setValues({
            ...omit(inputSet, 'gitDetails', 'entityValidityDetails'),
            repo: defaultTo(repoIdentifier, ''),
            branch: defaultTo(branch, '')
          })
        }
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml, inputSet]
  )

  const createUpdateInputSet = async (inputSetObj: InputSetDTO, gitDetails?: SaveToGitFormInterface, objectId = '') => {
    let response: ResponseInputSetResponse | null = null
    try {
      if (isEdit) {
        if (inputSetObj.identifier) {
          response = await updateInputSet(yamlStringify({ inputSet: clearNullUndefined(inputSetObj) }) as any, {
            pathParams: {
              inputSetIdentifier: inputSetObj.identifier || /* istanbul ignore next */ ''
            },
            queryParams: {
              accountIdentifier: accountId,
              orgIdentifier,
              pipelineIdentifier,
              projectIdentifier,
              pipelineRepoID: repoIdentifier,
              pipelineBranch: branch,
              ...(gitDetails ? { ...gitDetails, lastObjectId: objectId } : {}),
              ...(gitDetails && gitDetails.isNewBranch ? { baseBranch: initialGitDetails.branch } : {})
            }
          })
        } else {
          throw new Error(getString('pipeline.triggers.validation.identifier'))
        }
      } else {
        response = await createInputSet(yamlStringify({ inputSet: clearNullUndefined(inputSetObj) }) as any, {
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            pipelineIdentifier,
            projectIdentifier,
            pipelineRepoID: repoIdentifier,
            pipelineBranch: branch,
            ...(gitDetails ?? {}),
            ...(gitDetails && gitDetails.isNewBranch ? { baseBranch: initialGitDetails.branch } : {})
          }
        })
      }
      /* istanbul ignore else */
      if (response) {
        if (response.data?.errorResponse) {
          const errors = getFormattedErrors(response.data.inputSetErrorWrapper?.uuidToErrorResponseMap)
          if (Object.keys(errors).length) {
            setFormErrors(errors)
            // This is done because when git sync is enabled, errors are displayed in a modal
          } else if (!isGitSyncEnabled) {
            showError(getString('inputSets.inputSetSavedError'), undefined, 'pipeline.create.inputset')
          }
        } else {
          if (!isGitSyncEnabled) {
            showSuccess(getString('inputSets.inputSetSaved'))
            history.goBack()
          }
        }
      }
    } catch (e) {
      // This is done because when git sync is enabled, errors are displayed in a modal
      if (!isGitSyncEnabled) {
        showError(
          e?.data?.message || e?.message || getString('commonError'),
          undefined,
          'pipeline.update.create.inputset'
        )
      }
      throw e
    }
    return {
      status: response?.status, // nextCallback can be added if required
      nextCallback: () => history.goBack()
    }
  }

  const { openSaveToGitDialog } = useSaveToGitDialog<SaveInputSetDTO>({
    onSuccess: (
      gitData: SaveToGitFormInterface,
      payload?: SaveInputSetDTO,
      objectId?: string
    ): Promise<UseSaveSuccessResponse> => createUpdateInputSet(payload?.inputSet || savedInputSetObj, gitData, objectId)
  })

  const handleSubmit = React.useCallback(
    async (inputSetObjWithGitInfo: InputSetDTO, gitDetails?: EntityGitDetails) => {
      const inputSetObj = omit(inputSetObjWithGitInfo, 'repo', 'branch')
      setSavedInputSetObj(inputSetObj)
      setInitialGitDetails(gitDetails as EntityGitDetails)
      if (inputSetObj) {
        if (isGitSyncEnabled) {
          openSaveToGitDialog({
            isEditing: isEdit,
            resource: {
              type: 'InputSets',
              name: inputSetObj.name as string,
              identifier: inputSetObj.identifier as string,
              gitDetails: isEdit ? inputSetResponse?.data?.gitDetails : gitDetails
            },
            payload: { inputSet: inputSetObj }
          })
        } else {
          createUpdateInputSet(inputSetObj)
        }
      }
    },
    [isEdit, updateInputSet, createInputSet, showSuccess, showError, isGitSyncEnabled, inputSetResponse, pipeline]
  )
  const NameIdSchema = Yup.object({
    name: NameSchema(),
    identifier: IdentifierSchema()
  })
  const child = (
    <Container className={css.inputSetForm}>
      <Layout.Vertical spacing="medium">
        <Formik<InputSetDTO & GitContextProps>
          initialValues={{
            ...omit(inputSet, 'gitDetails', 'entityValidityDetails'),
            repo: defaultTo(repoIdentifier, ''),
            branch: defaultTo(branch, '')
          }}
          enableReinitialize={true}
          formName="inputSetForm"
          validationSchema={NameIdSchema}
          validate={async values => {
            let errors: FormikErrors<InputSetDTO> = {}
            try {
              await NameIdSchema.validate(values)
            } catch (err: any) {
              if (err.name === 'ValidationError') {
                errors = { [err.path]: err.message }
              }
            }
            if (values.pipeline && template?.data?.inputSetTemplateYaml && pipeline?.data?.yamlPipeline) {
              errors.pipeline = validatePipeline({
                pipeline: values.pipeline,
                template: parse(template.data.inputSetTemplateYaml).pipeline,
                originalPipeline: parse(pipeline.data.yamlPipeline).pipeline,
                getString,
                viewType: StepViewType.InputSet
              }) as any

              if (isEmpty(errors.pipeline)) delete errors.pipeline
            }

            if (!isEmpty(formErrors)) {
              setFormErrors(errors)
            }

            return errors
          }}
          onSubmit={values => {
            handleSubmit(values, { repoIdentifier: values.repo, branch: values.branch })
          }}
        >
          {formikProps => {
            formikRef.current = formikProps
            return (
              <>
                {selectedView === SelectedView.VISUAL ? (
                  <div className={css.inputsetGrid}>
                    <div>
                      <ErrorsStrip formErrors={formErrors} />
                      <FormikForm>
                        {executionView ? null : (
                          <Layout.Vertical className={css.content} padding="xlarge">
                            <NameIdDescriptionTags
                              className={css.nameiddescription}
                              identifierProps={{
                                inputLabel: getString('name'),
                                isIdentifierEditable: !isEdit && isEditable,
                                inputGroupProps: {
                                  disabled: !isEditable
                                }
                              }}
                              descriptionProps={{ disabled: !isEditable }}
                              tagsProps={{
                                disabled: !isEditable
                              }}
                              formikProps={formikProps}
                            />
                            {isGitSyncEnabled && (
                              <GitSyncStoreProvider>
                                <GitContextForm
                                  formikProps={formikProps}
                                  gitDetails={
                                    isEdit
                                      ? { ...inputSet.gitDetails, getDefaultFromOtherRepo: true }
                                      : { repoIdentifier, branch, getDefaultFromOtherRepo: true }
                                  }
                                  className={css.gitContextForm}
                                />
                              </GitSyncStoreProvider>
                            )}
                            {templateRefsResolvedPipeline?.data?.mergedPipelineYaml &&
                              template?.data?.inputSetTemplateYaml &&
                              parse(template.data.inputSetTemplateYaml) && (
                                <PipelineInputSetForm
                                  path="pipeline"
                                  readonly={!isEditable}
                                  originalPipeline={parse(templateRefsResolvedPipeline?.data?.mergedPipelineYaml)}
                                  template={parse(template.data?.inputSetTemplateYaml || '').pipeline}
                                  viewType={StepViewType.InputSet}
                                />
                              )}
                          </Layout.Vertical>
                        )}
                        <Layout.Horizontal className={css.footer} padding="xlarge">
                          <Button
                            variation={ButtonVariation.PRIMARY}
                            type="submit"
                            onClick={e => {
                              e.preventDefault()
                              formikProps.validateForm().then(errors => {
                                setFormErrors(errors)
                                if (
                                  formikProps?.values?.name?.length &&
                                  formikProps?.values?.identifier?.length &&
                                  isEmpty(formikProps.errors)
                                ) {
                                  handleSubmit(formikProps.values, {
                                    repoIdentifier: formikProps.values.repo,
                                    branch: formikProps.values.branch
                                  })
                                }
                              })
                            }}
                            text={getString('save')}
                            disabled={!isEditable}
                          />
                          &nbsp; &nbsp;
                          <Button
                            variation={ButtonVariation.TERTIARY}
                            onClick={() => {
                              history.goBack()
                            }}
                            text={getString('cancel')}
                          />
                        </Layout.Horizontal>
                      </FormikForm>
                    </div>
                  </div>
                ) : (
                  <div className={css.editor}>
                    <ErrorsStrip formErrors={formErrors} />
                    <Layout.Vertical className={css.content} padding="xlarge">
                      <YamlBuilderMemo
                        {...yamlBuilderReadOnlyModeProps}
                        existingJSON={{ inputSet: omit(formikProps?.values, 'inputSetReferences', 'repo', 'branch') }}
                        bind={setYamlHandler}
                        isReadOnlyMode={!isEditable}
                        invocationMap={factory.getInvocationMap()}
                        height="calc(100vh - 230px)"
                        width="calc(100vw - 350px)"
                        showSnippetSection={false}
                        isEditModeSupported={isEditable}
                      />
                    </Layout.Vertical>
                    <Layout.Horizontal className={css.footer} padding="xlarge">
                      <Button
                        variation={ButtonVariation.PRIMARY}
                        type="submit"
                        disabled={!isEditable}
                        text={getString('save')}
                        onClick={() => {
                          const latestYaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
                          const inputSetDto: InputSetDTO = parse(latestYaml)?.inputSet
                          handleSubmit(inputSetDto, {
                            repoIdentifier: formikProps.values.repo,
                            branch: formikProps.values.branch
                          })
                        }}
                      />
                      &nbsp; &nbsp;
                      <Button
                        variation={ButtonVariation.TERTIARY}
                        onClick={() => {
                          history.goBack()
                        }}
                        text={getString('cancel')}
                      />
                    </Layout.Horizontal>
                  </div>
                )}
              </>
            )
          }}
        </Formik>
      </Layout.Vertical>
    </Container>
  )

  return executionView ? (
    child
  ) : (
    <InputSetFormWrapper
      loading={
        loadingInputSet ||
        loadingPipeline ||
        loadingResolvedPipeline ||
        loadingTemplate ||
        (!isGitSyncEnabled && (createInputSetLoading || updateInputSetLoading)) ||
        loadingMerge
      }
      isEdit={isEdit}
      selectedView={selectedView}
      handleModeSwitch={handleModeSwitch}
      inputSet={inputSet}
      pipeline={pipeline}
      isGitSyncEnabled={isGitSyncEnabled}
      disableVisualView={disableVisualView}
    >
      {child}
    </InputSetFormWrapper>
  )
}

export interface InputSetFormWrapperProps {
  isEdit: boolean
  children: React.ReactNode
  selectedView: SelectedView
  loading: boolean
  handleModeSwitch(mode: SelectedView): void
  inputSet: InputSetDTO
  pipeline: ResponsePMSPipelineResponseDTO | null
  isGitSyncEnabled?: boolean
  disableVisualView: boolean
}

export function InputSetFormWrapper(props: InputSetFormWrapperProps): React.ReactElement {
  const {
    isEdit,
    children,
    selectedView,
    handleModeSwitch,
    loading,
    inputSet,
    pipeline,
    isGitSyncEnabled,
    disableVisualView
  } = props
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { getString } = useStrings()

  return (
    <React.Fragment>
      <GitSyncStoreProvider>
        <PageHeader
          className={css.pageHeaderStyles}
          title={
            <Layout.Horizontal width="42%">
              <Text lineClamp={1} color={Color.GREY_800} font={{ weight: 'bold', variation: FontVariation.H4 }}>
                {isEdit
                  ? getString('inputSets.editTitle', { name: inputSet.name })
                  : getString('inputSets.newInputSetLabel')}
              </Text>
              {isGitSyncEnabled && isEdit && (
                <GitPopover data={inputSet.gitDetails || {}} iconProps={{ margin: { left: 'small', top: 'xsmall' } }} />
              )}
              <div className={css.optionBtns}>
                <VisualYamlToggle
                  selectedView={selectedView}
                  onChange={nextMode => {
                    handleModeSwitch(nextMode)
                  }}
                  disableToggle={disableVisualView}
                />
              </div>
            </Layout.Horizontal>
          }
          breadcrumbs={
            <NGBreadcrumbs
              links={[
                {
                  url: routes.toPipelines({ orgIdentifier, projectIdentifier, accountId, module }),
                  label: getString('pipelines')
                },
                {
                  url: routes.toInputSetList({
                    orgIdentifier,
                    projectIdentifier,
                    accountId,
                    pipelineIdentifier,
                    module,
                    branch: pipeline?.data?.gitDetails?.branch,
                    repoIdentifier: pipeline?.data?.gitDetails?.repoIdentifier
                  }),
                  label: parse(pipeline?.data?.yamlPipeline || '')?.pipeline.name || ''
                }
              ]}
            />
          }
        />
      </GitSyncStoreProvider>
      <PageBody loading={loading}>{children}</PageBody>
    </React.Fragment>
  )
}

export const EnhancedInputSetForm: React.FC<InputSetFormProps> = props => {
  return (
    <NestedAccordionProvider>
      <InputSetForm {...props} />
    </NestedAccordionProvider>
  )
}
