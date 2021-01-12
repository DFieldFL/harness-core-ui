import React from 'react'
import { isNull, isUndefined, omit, omitBy } from 'lodash-es'
import cx from 'classnames'
import { Classes, Dialog, IDialogProps } from '@blueprintjs/core'
import * as Yup from 'yup'
import { Button, Color, Formik, FormikForm, FormInput, Icon, Layout, SelectOption, Text } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { parse, stringify } from 'yaml'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import { CompletionItemKind } from 'vscode-languageserver-types'
import { pipelineSchema } from '@common/services/mocks/pipeline-schema.ts'
import type { NgPipeline } from 'services/cd-ng'

import {
  OverlayInputSetResponse,
  useGetPipeline,
  Failure,
  useGetInputSetsListForPipeline,
  useGetOverlayInputSetForPipeline,
  useCreateOverlayInputSetForPipeline,
  useUpdateOverlayInputSetForPipeline,
  ResponseOverlayInputSetResponse
} from 'services/pipeline-ng'

import { useToaster } from '@common/exports'
import type {
  YamlBuilderHandlerBinding,
  YamlBuilderProps,
  InvocationMapFunction,
  CompletionItemInterface
} from '@common/interfaces/YAMLBuilderProps'
import YAMLBuilder from '@common/components/YAMLBuilder/YamlBuilder'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { AddDescriptionAndKVTagsWithIdentifier } from '@common/components/AddDescriptionAndTags/AddDescriptionAndTags'
import i18n from './OverlayInputSetForm.18n'
import css from './OverlayInputSetForm.module.scss'

export interface OverlayInputSetDTO extends Omit<OverlayInputSetResponse, 'identifier'> {
  pipeline?: NgPipeline
  identifier?: string
}

const getDefaultInputSet = (): OverlayInputSetDTO => ({
  name: undefined,
  identifier: '',
  description: undefined,
  inputSetReferences: [],
  tags: {}
})

export interface OverlayInputSetFormProps {
  hideForm: () => void
  identifier?: string
}

enum SelectedView {
  VISUAL = 'VISUAL',
  YAML = 'YAML'
}

const dialogProps: Omit<IDialogProps, 'isOpen'> = {
  usePortal: true,
  autoFocus: true,
  canEscapeKeyClose: true,
  canOutsideClickClose: true,
  enforceFocus: true,
  style: { minWidth: 700, minHeight: 600 }
}

const yamlBuilderReadOnlyModeProps: YamlBuilderProps = {
  fileName: `overlay-input-set.yaml`,
  entityType: 'Pipelines',
  width: 620,
  height: 360,
  showSnippetSection: false,
  yamlSanityConfig: {
    removeEmptyString: false
  }
}

const clearNullUndefined = /* istanbul ignore next */ (data: OverlayInputSetDTO): OverlayInputSetDTO =>
  omitBy(omitBy(data, isUndefined), isNull)

const getTitle = (isEdit: boolean, inputSet: OverlayInputSetDTO): string => {
  if (isEdit) {
    return i18n.editOverlayTitle(inputSet.name || /* istanbul ignore next */ '')
  } else {
    return i18n.newOverlayInputSet
  }
}

export const OverlayInputSetForm: React.FC<OverlayInputSetFormProps> = ({ hideForm, identifier }): JSX.Element => {
  const [isOpen, setIsOpen] = React.useState(true)
  const [isEdit, setIsEdit] = React.useState(false)
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
    pipelineIdentifier: string
  }>()

  const [selectedView, setSelectedView] = React.useState<SelectedView>(SelectedView.VISUAL)
  const [yamlHandler, setYamlHandler] = React.useState<YamlBuilderHandlerBinding | undefined>()
  const { showSuccess, showError } = useToaster()

  const {
    data: overlayInputSetResponse,
    refetch: refetchOverlay,
    loading: loadingOverlayInputSet,
    error: errorOverlayInputSet
  } = useGetOverlayInputSetForPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, pipelineIdentifier, projectIdentifier },
    inputSetIdentifier: identifier || '',
    lazy: true
  })

  const {
    mutate: createOverlayInputSet,
    error: createOverlayInputSetError,
    loading: createOverlayInputSetLoading
  } = useCreateOverlayInputSetForPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, pipelineIdentifier, projectIdentifier },
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })
  const {
    mutate: updateOverlayInputSet,
    error: updateOverlayInputSetError,
    loading: updateOverlayInputSetLoading
  } = useUpdateOverlayInputSetForPipeline({
    queryParams: { accountIdentifier: accountId, orgIdentifier, pipelineIdentifier, projectIdentifier },
    inputSetIdentifier: '',
    requestOptions: { headers: { 'content-type': 'application/yaml' } }
  })

  const {
    data: inputSetList,
    refetch: refetchInputSetList,
    loading: loadingInputSetList,
    error: errorInputSetList
  } = useGetInputSetsListForPipeline({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pipelineIdentifier,
      inputSetType: 'INPUT_SET'
    },
    debounce: 300,
    lazy: true
  })

  const { loading: loadingPipeline, error: errorPipeline } = useGetPipeline({
    pipelineIdentifier,
    lazy: true,
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
  })

  const inputSet = React.useMemo(() => {
    if (overlayInputSetResponse?.data) {
      const inputSetObj = overlayInputSetResponse?.data
      return {
        name: inputSetObj.name,
        tags: inputSetObj.tags,
        identifier: inputSetObj.identifier || /* istanbul ignore next */ '',
        description: inputSetObj?.description,
        inputSetReferences: inputSetObj?.inputSetReferences || /* istanbul ignore next */ []
      }
    }
    return getDefaultInputSet()
  }, [overlayInputSetResponse?.data])

  const inputSetListOptions: SelectOption[] = React.useMemo(() => {
    return (
      inputSetList?.data?.content?.map(item => ({
        label: item.name || /* istanbul ignore next */ '',
        value: item.identifier || /* istanbul ignore next */ ''
      })) || []
    )
  }, [inputSetList?.data?.content?.map])

  const inputSetListYaml: CompletionItemInterface[] = React.useMemo(() => {
    return (
      inputSetList?.data?.content?.map(item => ({
        label: item.name || /* istanbul ignore next */ '',
        insertText: item.identifier || /* istanbul ignore next */ '',
        kind: CompletionItemKind.Field
      })) || []
    )
  }, [inputSetList?.data?.content?.map])

  React.useEffect(() => {
    if (identifier) {
      setIsEdit(true)

      refetchInputSetList()
      refetchOverlay({ pathParams: { inputSetIdentifier: identifier } })
    } else {
      refetchInputSetList()
      setIsEdit(false)
    }
  }, [identifier])

  const handleModeSwitch = React.useCallback(
    (view: SelectedView) => {
      if (view === SelectedView.VISUAL) {
        const yaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''
        const inputSetYamlVisual = parse(yaml).overlayInputSet as OverlayInputSetDTO
        inputSet.name = inputSetYamlVisual.name
        inputSet.identifier = inputSetYamlVisual.identifier
        inputSet.description = inputSetYamlVisual.description
        inputSet.pipeline = inputSetYamlVisual.pipeline
      }
      setSelectedView(view)
    },
    [yamlHandler?.getLatestYaml, inputSet]
  )

  const closeForm = React.useCallback(() => {
    setIsOpen(false)
    hideForm()
  }, [hideForm])

  const handleSubmit = React.useCallback(
    async (inputSetObj: OverlayInputSetDTO) => {
      if (inputSetObj) {
        delete inputSetObj.pipeline
        try {
          let response: ResponseOverlayInputSetResponse | null = null
          /* istanbul ignore else */
          if (isEdit) {
            response = await updateOverlayInputSet(
              stringify({ overlayInputSet: clearNullUndefined(inputSetObj) }) as any,
              {
                pathParams: { inputSetIdentifier: inputSetObj.identifier || /* istanbul ignore next */ '' }
              }
            )
          } else {
            response = await createOverlayInputSet(
              stringify({ overlayInputSet: clearNullUndefined(inputSetObj) }) as any
            )
          }
          /* istanbul ignore else */
          if (response) {
            if (response.data?.errorResponse) {
              showError(i18n.overlayInputSetSavedError)
            } else {
              showSuccess(i18n.overlayInputSetSaved)
            }
          }
          closeForm()
        } catch (_e) {
          // showError(e?.message || i18n.commonError)
        }
      }
    },
    [isEdit, showSuccess, closeForm, showError, createOverlayInputSet, updateOverlayInputSet]
  )

  const onDragStart = React.useCallback((event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.setData('data', index.toString())
    event.currentTarget.classList.add(css.dragging)
  }, [])

  const onDragEnd = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragging)
  }, [])

  const onDragLeave = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragOver)
  }, [])

  const onDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    /* istanbul ignore else */
    if (event.preventDefault) {
      event.preventDefault()
    }
    event.currentTarget.classList.add(css.dragOver)
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>, arrayHelpers: FieldArrayRenderProps, droppedIndex: number) => {
      /* istanbul ignore else */
      if (event.preventDefault) {
        event.preventDefault()
      }
      const data = event.dataTransfer.getData('data')
      /* istanbul ignore else */
      if (data) {
        const index = parseInt(data, 10)
        arrayHelpers.swap(index, droppedIndex)
      }
      event.currentTarget.classList.remove(css.dragOver)
    },
    []
  )
  /* istanbul ignore else */
  if (
    errorPipeline ||
    createOverlayInputSetError ||
    updateOverlayInputSetError ||
    errorOverlayInputSet ||
    errorInputSetList
  ) {
    /* istanbul ignore next */
    showError(
      (errorPipeline?.data as Failure)?.message ||
        (createOverlayInputSetError?.data as Failure)?.message ||
        (updateOverlayInputSetError?.data as Failure)?.message ||
        (errorOverlayInputSet?.data as Failure)?.message ||
        (errorInputSetList?.data as Failure)?.message ||
        i18n.commonError
    )
  }

  const invocationMap: YamlBuilderProps['invocationMap'] = new Map<RegExp, InvocationMapFunction>()
  invocationMap.set(
    /^.+\.inputSetReferences$/,
    (_matchingPath: string, _currentYaml: string): Promise<CompletionItemInterface[]> => {
      return new Promise(resolve => {
        resolve(inputSetListYaml)
      })
    }
  )

  return (
    <Dialog title={getTitle(isEdit, inputSet)} onClose={() => closeForm()} isOpen={isOpen} {...dialogProps}>
      {(loadingPipeline ||
        createOverlayInputSetLoading ||
        updateOverlayInputSetLoading ||
        loadingInputSetList ||
        loadingOverlayInputSet) && /* istanbul ignore next */ <PageSpinner />}
      <div className={Classes.DIALOG_BODY}>
        <Layout.Vertical spacing="medium">
          <div className={css.optionBtns}>
            <div
              className={cx(css.item, { [css.selected]: selectedView === SelectedView.VISUAL })}
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

          <Formik<OverlayInputSetDTO>
            initialValues={{ ...inputSet }}
            enableReinitialize={true}
            validationSchema={Yup.object().shape({
              name: Yup.string().trim().required(i18n.nameIsRequired)
            })}
            onSubmit={values => {
              handleSubmit(values)
            }}
          >
            {({ values }) => {
              return (
                <>
                  {selectedView === SelectedView.VISUAL ? (
                    <FormikForm>
                      <div className={css.inputSetForm}>
                        <AddDescriptionAndKVTagsWithIdentifier
                          className={css.inputSetName}
                          identifierProps={{
                            inputLabel: i18n.overlaySetName,
                            isIdentifierEditable: !isEdit
                          }}
                        />

                        <Layout.Vertical padding={{ top: 'large', bottom: 'xxxlarge' }} spacing="small">
                          <Text font={{ size: 'medium' }}>{i18n.selectInputSets}</Text>
                          <Text icon="info-sign" iconProps={{ color: Color.BLUE_450, size: 23, padding: 'small' }}>
                            {i18n.selectInputSetsHelp}
                          </Text>
                          <Layout.Vertical padding={{ top: 'xxxlarge', bottom: 'large' }}>
                            <FieldArray
                              name="inputSetReferences"
                              render={arrayHelpers => (
                                <Layout.Vertical>
                                  {values.inputSetReferences?.map((inputReference, index) => (
                                    <Layout.Horizontal
                                      key={`${index}-${inputReference}`}
                                      flex={{ distribution: 'space-between' }}
                                      style={{ alignItems: 'end' }}
                                    >
                                      <Layout.Horizontal
                                        spacing="medium"
                                        style={{ alignItems: 'baseline' }}
                                        draggable={true}
                                        onDragStart={event => {
                                          onDragStart(event, index)
                                        }}
                                        data-testid={inputReference}
                                        onDragEnd={onDragEnd}
                                        onDragOver={onDragOver}
                                        onDragLeave={onDragLeave}
                                        onDrop={event => onDrop(event, arrayHelpers, index)}
                                      >
                                        <Icon name="drag-handle-vertical" className={css.drag} />
                                        <Text>{`${index + 1}.`}</Text>
                                        <FormInput.Select
                                          items={inputSetListOptions}
                                          name={`inputSetReferences[${index}]`}
                                          style={{ width: 400 }}
                                          placeholder={i18n.selectInputSet}
                                        />
                                      </Layout.Horizontal>
                                      <Button minimal icon="delete" onClick={() => arrayHelpers.remove(index)} />
                                    </Layout.Horizontal>
                                  ))}
                                  <span>
                                    <Button
                                      minimal
                                      text={i18n.addInputSet}
                                      intent="primary"
                                      onClick={() => arrayHelpers.push('')}
                                    />
                                  </span>
                                </Layout.Vertical>
                              )}
                            />
                          </Layout.Vertical>
                        </Layout.Vertical>
                      </div>
                      <div className={Classes.DIALOG_FOOTER}>
                        <Button intent="primary" type="submit" text={i18n.save} />
                        &nbsp; &nbsp;
                        <Button onClick={closeForm} text={i18n.cancel} />
                      </div>
                    </FormikForm>
                  ) : (
                    <div className={css.editor}>
                      <YAMLBuilder
                        {...yamlBuilderReadOnlyModeProps}
                        existingJSON={{ overlayInputSet: omit(values, 'pipeline') }}
                        invocationMap={invocationMap}
                        bind={setYamlHandler}
                        schema={pipelineSchema}
                      />
                      <Layout.Horizontal padding={{ top: 'medium' }}>
                        <Button
                          intent="primary"
                          type="submit"
                          text={i18n.save}
                          onClick={() => {
                            const latestYaml = yamlHandler?.getLatestYaml() || /* istanbul ignore next */ ''

                            handleSubmit(parse(latestYaml)?.overlayInputSet)
                          }}
                        />
                        &nbsp; &nbsp;
                        <Button onClick={closeForm} text={i18n.cancel} />
                      </Layout.Horizontal>
                    </div>
                  )}
                </>
              )
            }}
          </Formik>
        </Layout.Vertical>
      </div>
    </Dialog>
  )
}
