/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import cx from 'classnames'

import {
  Layout,
  Text,
  Button,
  Icon,
  StepWizard,
  Color,
  Label,
  FormikTooltipContext,
  HarnessDocTooltip,
  ButtonVariation,
  MultiTypeInputType
} from '@wings-software/uicore'
import { Classes, MenuItem, Popover, PopoverInteractionKind, Menu, Dialog, IDialogProps } from '@blueprintjs/core'
import { FieldArray, FieldArrayRenderProps } from 'formik'
import type { FormikProps } from 'formik'

import { useStrings } from 'framework/strings'
import type { TerraformVarFileWrapper } from 'services/cd-ng'

import { RemoteVar, TerraformData, TerraformStoreTypes } from '../TerraformInterfaces'
import { TFRemoteWizard } from './TFRemoteWizard'
import { TFVarStore } from './TFVarStore'

import InlineVarFile from './InlineVarFile'

import css from './TerraformVarfile.module.scss'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface TfVarFileProps {
  formik: FormikProps<TerraformData>
  isReadonly?: boolean
  allowableTypes: MultiTypeInputType[]
}

export default function TfVarFileList(props: TfVarFileProps): React.ReactElement {
  const { formik, isReadonly = false, allowableTypes } = props
  const inlineInitValues: TerraformVarFileWrapper = {
    varFile: {
      spec: {},
      identifier: '',
      type: TerraformStoreTypes.Inline
    }
  }
  const remoteInitialValues: TerraformVarFileWrapper = {
    varFile: {
      spec: {},
      identifier: '',
      type: TerraformStoreTypes.Remote
    }
  }

  const [showTfModal, setShowTfModal] = React.useState(false)
  const [isEditMode, setIsEditMode] = React.useState(false)
  const [selectedVar, setSelectedVar] = React.useState(inlineInitValues as any)
  const [selectedVarIndex, setSelectedVarIndex] = React.useState<number>(-1)
  const [showRemoteWizard, setShowRemoteWizard] = React.useState(false)
  const { getString } = useStrings()

  const remoteRender = (varFile: TerraformVarFileWrapper, index: number): React.ReactElement => {
    const remoteVar = varFile?.varFile as any
    return (
      <div className={css.configField}>
        <Layout.Horizontal>
          {varFile?.varFile?.type === getString('remote') && <Icon name="remote" className={css.iconPosition} />}
          <Text className={css.branch}>{remoteVar?.identifier}</Text>
        </Layout.Horizontal>
        <Icon
          name="edit"
          onClick={() => {
            /* istanbul ignore next */
            setShowRemoteWizard(true)
            setSelectedVar(varFile)
            setSelectedVarIndex(index)
            setIsEditMode(true)
          }}
        />
      </div>
    )
  }

  const inlineRender = (varFile: TerraformVarFileWrapper, index: number): React.ReactElement => {
    const inlineVar = varFile?.varFile as any
    return (
      <div className={css.configField}>
        <Layout.Horizontal>
          {inlineVar?.type === getString('inline') && <Icon name="Inline" className={css.iconPosition} />}
          <Text className={css.branch}>{inlineVar?.identifier}</Text>
        </Layout.Horizontal>
        <Icon
          name="edit"
          onClick={() => {
            /* istanbul ignore next */
            setShowTfModal(true)
            setIsEditMode(true)
            setSelectedVarIndex(index)
            setSelectedVar(varFile)
          }}
        />
      </div>
    )
  }

  const DIALOG_PROPS: IDialogProps = {
    isOpen: true,
    usePortal: true,
    autoFocus: true,
    canEscapeKeyClose: true,
    canOutsideClickClose: true,
    enforceFocus: false,
    style: { width: 1175, minHeight: 640, borderLeft: 0, paddingBottom: 0, position: 'relative', overflow: 'hidden' }
  }

  const getTitle = () => (
    <Layout.Vertical flex style={{ justifyContent: 'center', alignItems: 'center' }}>
      <Icon name="remotefile" className={css.remoteIcon} size={50} />
      <Text color={Color.WHITE}>{getString('pipelineSteps.remoteFile')}</Text>
    </Layout.Vertical>
  )
  /* istanbul ignore next */
  const onDragStart = React.useCallback((event: React.DragEvent<HTMLDivElement>, index: number) => {
    event.dataTransfer.setData('data', index.toString())
    event.currentTarget.classList.add(css.dragging)
  }, [])
  /* istanbul ignore next */
  const onDragEnd = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragging)
  }, [])
  /* istanbul ignore next */
  const onDragLeave = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.currentTarget.classList.remove(css.dragOver)
  }, [])
  /* istanbul ignore next */
  const onDragOver = React.useCallback((event: React.DragEvent<HTMLDivElement>) => {
    /* istanbul ignore else */
    if (event.preventDefault) {
      event.preventDefault()
    }
    event.currentTarget.classList.add(css.dragOver)
    event.dataTransfer.dropEffect = 'move'
  }, [])
  /* istanbul ignore next */
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
  /* istanbul ignore next */
  const onCloseOfRemoteWizard = () => {
    setShowRemoteWizard(false)
    setIsEditMode(false)
    setSelectedVar(remoteInitialValues)
  }
  /* istanbul ignore next */
  const onCloseOfInlineVarForm = () => {
    setShowTfModal(false)
    setIsEditMode(false)
    setSelectedVar(inlineInitValues)
  }
  const tooltipContext = React.useContext(FormikTooltipContext)
  const dataTooltipId = tooltipContext?.formName ? `${tooltipContext?.formName}_${name}` : ''
  return (
    <Layout.Vertical>
      <Label style={{ color: Color.GREY_900 }} className={css.tfVarLabel} data-tooltip-id={dataTooltipId}>
        {getString('optionalField', { name: getString('cd.terraformVarFiles') })}
        <HarnessDocTooltip useStandAlone={true} tooltipId={dataTooltipId} />
      </Label>
      <div className={cx(stepCss.formGroup, css.tfVarMargin)}>
        <FieldArray
          name="spec.configuration.spec.varFiles"
          render={arrayHelpers => {
            return (
              <div>
                {formik.values?.spec?.configuration?.spec?.varFiles?.map((varFile: TerraformVarFileWrapper, i) => {
                  return (
                    <Layout.Horizontal
                      className={css.addMarginTop}
                      key={`${varFile?.varFile?.spec?.type}`}
                      flex={{ distribution: 'space-between' }}
                      style={{ alignItems: 'end' }}
                    >
                      <Layout.Horizontal
                        spacing="medium"
                        style={{ alignItems: 'baseline' }}
                        className={css.tfContainer}
                        key={varFile?.varFile?.spec?.type}
                        draggable={true}
                        onDragEnd={onDragEnd}
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDragStart={event => {
                          /* istanbul ignore next */
                          onDragStart(event, i)
                        }}
                        onDrop={event => onDrop(event, arrayHelpers, i)}
                      >
                        <Icon name="drag-handle-vertical" className={css.drag} />
                        {(formik.values.spec?.configuration?.spec?.varFiles || [])?.length > 1 && (
                          <Text color={Color.BLACK}>{`${i + 1}.`}</Text>
                        )}
                        {varFile?.varFile?.type === TerraformStoreTypes.Remote && remoteRender(varFile, i)}
                        {varFile?.varFile?.type === TerraformStoreTypes.Inline && inlineRender(varFile, i)}
                        <Button
                          minimal
                          icon="main-trash"
                          data-testid={`remove-tfvar-file-${i}`}
                          onClick={() => arrayHelpers.remove(i)}
                        />
                      </Layout.Horizontal>
                    </Layout.Horizontal>
                  )
                })}
                <Popover
                  interactionKind={PopoverInteractionKind.CLICK}
                  boundary="viewport"
                  popoverClassName={Classes.DARK}
                  content={
                    <Menu className={css.tfMenu}>
                      <MenuItem
                        text={<Text intent="primary">{getString('cd.addInline')} </Text>}
                        icon={<Icon name="Inline" className={css.iconMargin} />}
                        onClick={() => {
                          setShowTfModal(true)
                        }}
                      />

                      <MenuItem
                        text={<Text intent="primary">{getString('cd.addRemote')}</Text>}
                        icon={<Icon name="Inline" className={css.iconMargin} />}
                        onClick={() => setShowRemoteWizard(true)}
                      />
                    </Menu>
                  }
                >
                  <Button variation={ButtonVariation.LINK} data-testid="add-tfvar-file" className={css.addTfVarFile}>
                    {getString('plusAdd')}
                  </Button>
                </Popover>
                {showRemoteWizard && (
                  <Dialog
                    {...DIALOG_PROPS}
                    isOpen={true}
                    isCloseButtonShown
                    onClose={() => {
                      onCloseOfRemoteWizard()
                    }}
                    className={cx(css.modal, Classes.DIALOG)}
                  >
                    <div className={css.createTfWizard}>
                      <StepWizard title={getTitle()} initialStep={1} className={css.manifestWizard}>
                        <TFVarStore
                          name={getString('cd.tfVarStore')}
                          initialValues={isEditMode ? selectedVar : remoteInitialValues}
                          isEditMode={isEditMode}
                          allowableTypes={allowableTypes}
                        />
                        <TFRemoteWizard
                          name={getString('cd.varFileDetails')}
                          onSubmitCallBack={(values: RemoteVar) => {
                            if (isEditMode) {
                              arrayHelpers.replace(selectedVarIndex, values)
                            } else {
                              arrayHelpers.push(values)
                            }
                            onCloseOfRemoteWizard()
                          }}
                          isEditMode={isEditMode}
                          allowableTypes={allowableTypes}
                          // initialValues={remoteInitialValues}
                        />
                      </StepWizard>
                    </div>
                    <Button
                      minimal
                      icon="cross"
                      iconProps={{ size: 18 }}
                      onClick={() => {
                        setShowRemoteWizard(false)
                      }}
                      className={css.crossIcon}
                    />
                  </Dialog>
                )}
                {showTfModal && (
                  <InlineVarFile
                    arrayHelpers={arrayHelpers}
                    isEditMode={isEditMode}
                    selectedVarIndex={selectedVarIndex}
                    showTfModal={showTfModal}
                    selectedVar={selectedVar}
                    onClose={() => {
                      onCloseOfInlineVarForm()
                    }}
                    onSubmit={() => {
                      onCloseOfInlineVarForm()
                    }}
                    isReadonly={isReadonly}
                    allowableTypes={allowableTypes}
                  />
                )}
              </div>
            )
          }}
        />
      </div>
    </Layout.Vertical>
  )
}
