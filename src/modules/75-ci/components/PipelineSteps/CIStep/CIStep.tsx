/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import isEmpty from 'lodash/isEmpty'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { FormInput, Text, Container, Color, MultiTypeInputType } from '@wings-software/uicore'
import { MultiTypeTextField, MultiTypeTextProps } from '@common/components/MultiTypeText/MultiTypeText'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { FormMultiTypeTextAreaField } from '@common/components'
import { useGitScope } from '@pipeline/utils/CIUtils'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { ConnectorRefWidth } from '@pipeline/utils/constants'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface CIStepProps {
  isNewStep?: boolean
  readonly?: boolean
  stepLabel?: string
  enableFields: {
    [key: string]: { [key: string]: any }
  }
  formik?: FormikProps<any>
  stepViewType: StepViewType
  allowableTypes: MultiTypeInputType[]
  path?: string
}

export const CIStep: React.FC<CIStepProps> = props => {
  const { isNewStep, readonly, stepLabel, enableFields, stepViewType, allowableTypes, path } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const { getString } = useStrings()
  const gitScope = useGitScope()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`

  const stepCss = stepViewType === StepViewType.DeploymentForm ? css.sm : css.lg

  const renderMultiTypeTextField = React.useCallback(
    ({
      name,
      tooltipId,
      labelKey,
      inputProps
    }: {
      name: string
      tooltipId: string
      labelKey: keyof StringsMap
      inputProps: MultiTypeTextProps['multiTextInputProps']
    }) => (
      <MultiTypeTextField
        name={name}
        label={
          <Text
            className={css.inpLabel}
            color={Color.GREY_600}
            font={{ size: 'small', weight: 'semi-bold' }}
            tooltipProps={{
              dataTooltipId: tooltipId
            }}
          >
            {getString(labelKey)}
          </Text>
        }
        multiTextInputProps={inputProps}
      />
    ),
    []
  )

  const renderMultiTypeList = React.useCallback(
    ({ name, tooltipId, labelKey }: { name: string; tooltipId: string; labelKey: keyof StringsMap }) => (
      <MultiTypeList
        name={name}
        multiTextInputProps={{ expressions, allowableTypes }}
        multiTypeFieldSelectorProps={{
          label: (
            <Text
              className={css.inpLabel}
              color={Color.GREY_600}
              font={{ size: 'small', weight: 'semi-bold' }}
              style={{ display: 'flex', alignItems: 'center' }}
              tooltipProps={{ dataTooltipId: tooltipId }}
            >
              {getString(labelKey)}
            </Text>
          )
        }}
        disabled={readonly}
      />
    ),
    []
  )

  return (
    <>
      {stepViewType !== StepViewType.Template && Object.prototype.hasOwnProperty.call(enableFields, 'name') ? (
        <Container className={cx(css.formGroup, stepCss, css.nameIdLabel)}>
          <FormInput.InputWithIdentifier
            inputName="name"
            idName="identifier"
            isIdentifierEditable={isNewStep && !readonly}
            inputGroupProps={{ disabled: readonly }}
            inputLabel={stepLabel ?? getString('pipelineSteps.stepNameLabel')}
          />
        </Container>
      ) : null}
      <Container className={cx(css.formGroup, stepCss)}>
        {Object.prototype.hasOwnProperty.call(enableFields, 'description') ? (
          <FormMultiTypeTextAreaField
            name={`${prefix}description`}
            label={
              <Text color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                {getString('description')}
              </Text>
            }
            multiTypeTextArea={{ expressions, allowableTypes, disabled: readonly }}
          />
        ) : null}
      </Container>
      {!enableFields['spec.connectorRef']?.shouldHide &&
      Object.prototype.hasOwnProperty.call(enableFields, 'spec.connectorRef') ? (
        <Container className={css.bottomMargin3}>
          <FormMultiTypeConnectorField
            label={enableFields['spec.connectorRef'].label}
            type={enableFields['spec.connectorRef'].type}
            width={
              stepViewType === StepViewType.DeploymentForm
                ? ConnectorRefWidth.DeploymentFormView
                : stepViewType === StepViewType.InputSet
                ? ConnectorRefWidth.InputSetView
                : ConnectorRefWidth.DefaultView
            }
            name={`${prefix}spec.connectorRef`}
            placeholder={getString('select')}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            multiTypeProps={{
              expressions,
              allowableTypes,
              disabled: readonly,
              ...enableFields['spec.connectorRef'].multiTypeProps
            }}
            gitScope={gitScope}
            setRefValue
          />
        </Container>
      ) : null}
      {!enableFields['spec.connectorRef']?.shouldHide &&
      Object.prototype.hasOwnProperty.call(enableFields, 'spec.image') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.image`,
            tooltipId: enableFields['spec.image'].tooltipId,
            labelKey: 'imageLabel',
            inputProps: enableFields['spec.image'].multiTextInputProps
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.target') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.target`,
            tooltipId: enableFields['spec.target'].tooltipId,
            labelKey: 'pipelineSteps.targetLabel',
            inputProps: {
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.repo') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.repo`,
            tooltipId: 'dockerHubRepository',
            labelKey: 'connectors.docker.dockerRepository',
            inputProps: {
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.host') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.host`,
            tooltipId: 'gcrHost',
            labelKey: 'pipelineSteps.hostLabel',
            inputProps: {
              placeholder: getString('pipelineSteps.hostPlaceholder'),
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.projectID') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.projectID`,
            tooltipId: 'gcrProjectID',
            labelKey: 'pipelineSteps.projectIDLabel',
            inputProps: {
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.region') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.region`,
            tooltipId: 'region',
            labelKey: 'regionLabel',
            inputProps: {
              placeholder: getString('pipelineSteps.regionPlaceholder'),
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.bucket') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.bucket`,
            tooltipId: enableFields['spec.bucket'].tooltipId,
            labelKey: 'pipelineSteps.bucketLabel',
            inputProps: {
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.key') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.key`,
            tooltipId: enableFields['spec.key'].tooltipId,
            labelKey: 'keyLabel',
            inputProps: {
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.sourcePaths') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeList({
            name: `${prefix}spec.sourcePaths`,
            tooltipId: 'saveCacheSourcePaths',
            labelKey: 'pipelineSteps.sourcePathsLabel'
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.sourcePath') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.sourcePath`,
            tooltipId: 'sourcePath',
            labelKey: 'pipelineSteps.sourcePathLabel',
            inputProps: {
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.account') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.account`,
            tooltipId: 'ecrAccount',
            labelKey: 'common.accountId',
            inputProps: {
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.imageName') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.imageName`,
            tooltipId: 'imageName',
            labelKey: 'imageNameLabel',
            inputProps: {
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.tags') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeList({
            name: `${prefix}spec.tags`,
            tooltipId: 'tags',
            labelKey: 'tagsLabel'
          })}
        </Container>
      ) : null}
    </>
  )
}
