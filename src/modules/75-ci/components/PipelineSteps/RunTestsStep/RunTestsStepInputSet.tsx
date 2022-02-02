/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Color, Container } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import StepCommonFieldsInputSet from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFieldsInputSet'
import MultiTypeMapInputSet from '@common/components/MultiTypeMapInputSet/MultiTypeMapInputSet'
import MultiTypeListInputSet from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { FormMultiTypeCheckboxField } from '@common/components'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { Connectors } from '@connectors/constants'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { RunTestsStepProps } from './RunTestsStep'
import { shouldRenderRunTimeInputView } from '../CIStep/StepUtils'
import { CIStep } from '../CIStep/CIStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RunTestsStepInputSetBasic: React.FC<RunTestsStepProps> = ({
  template,
  path,
  readonly,
  stepViewType,
  allowableTypes,
  formik
}) => {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`
  const stepCss = stepViewType === StepViewType.DeploymentForm ? css.sm : css.lg

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        allowableTypes={allowableTypes}
        enableFields={{
          ...(getMultiTypeFromValue(template?.description) === MultiTypeInputType.RUNTIME && {
            description: {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && {
            'spec.connectorRef': {
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'connector' }}
                >
                  {getString('pipelineSteps.connectorLabel')}
                </Text>
              ),
              type: [Connectors.GCP, Connectors.AWS, Connectors.DOCKER]
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.image) === MultiTypeInputType.RUNTIME && {
            'spec.image': {
              tooltipId: 'pluginImageInfo',
              multiTextInputProps: {
                placeholder: getString('pluginImagePlaceholder'),
                disabled: readonly,
                multiTextInputProps: {
                  expressions,
                  allowableTypes
                }
              }
            }
          })
        }}
        path={path || ''}
      />
      {getMultiTypeFromValue(template?.spec?.args) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            className={css.removeBpLabelMargin}
            name={`${prefix}spec.args`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: 'runTestsArgs' }}
              >
                {getString('argsLabel')}
              </Text>
            }
            multiTextInputProps={{
              multiTextInputProps: {
                expressions,
                allowableTypes
              },
              disabled: readonly
            }}
          />
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.packages) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            className={css.removeBpLabelMargin}
            name={`${prefix}spec.packages`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: 'runTestsPackages' }}
              >
                {getString('packagesLabel')}
              </Text>
            }
            multiTextInputProps={{
              multiTextInputProps: {
                expressions,
                allowableTypes
              },
              disabled: readonly
            }}
          />
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.runOnlySelectedTests) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <FormMultiTypeCheckboxField
            name={`${prefix}spec.runOnlySelectedTests`}
            label={getString('runOnlySelectedTestsLabel')}
            multiTypeTextbox={{
              expressions,
              disabled: readonly,
              allowableTypes
            }}
            setToFalseWhenEmpty={true}
          />
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.testAnnotations) === MultiTypeInputType.RUNTIME && (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeTextField
            className={css.removeBpLabelMargin}
            name={`${prefix}spec.testAnnotations`}
            label={
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={{ dataTooltipId: 'runTestsTestAnnotations' }}
              >
                {getString('testAnnotationsLabel')}
              </Text>
            }
            multiTextInputProps={{
              multiTextInputProps: {
                expressions,
                allowableTypes
              },
              disabled: readonly
            }}
          />
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.preCommand) === MultiTypeInputType.RUNTIME && (
        <Container className={css.bottomMargin5}>
          <div className={cx(css.fieldsGroup, css.withoutSpacing)} style={{ marginBottom: 'var(--spacing-small)' }}>
            <MultiTypeFieldSelector
              name={`${prefix}spec.preCommand`}
              label={
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'runTestsPreCommand' }}
                >
                  {getString('preCommandLabel')}
                </Text>
              }
              defaultValueToReset=""
              allowedTypes={allowableTypes}
              expressionRender={() => {
                return (
                  <ShellScriptMonacoField
                    title={getString('preCommandLabel')}
                    name={`${prefix}spec.preCommand`}
                    scriptType="Bash"
                    expressions={expressions}
                    disabled={readonly}
                  />
                )
              }}
              style={{ flexGrow: 1, marginBottom: 0 }}
              disableTypeSelection={readonly}
            >
              <ShellScriptMonacoField
                title={getString('preCommandLabel')}
                name={`${prefix}spec.preCommand`}
                scriptType="Bash"
                expressions={expressions}
                disabled={readonly}
              />
            </MultiTypeFieldSelector>
          </div>
        </Container>
      )}
      {getMultiTypeFromValue(template?.spec?.postCommand) === MultiTypeInputType.RUNTIME && (
        <Container className={css.bottomMargin5}>
          <div className={cx(css.fieldsGroup, css.withoutSpacing)} style={{ marginBottom: 'var(--spacing-small)' }}>
            <MultiTypeFieldSelector
              name={`${prefix}spec.postCommand`}
              label={
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'runTestsPostCommand' }}
                >
                  {getString('postCommandLabel')}
                </Text>
              }
              defaultValueToReset=""
              allowedTypes={allowableTypes}
              expressionRender={() => {
                return (
                  <ShellScriptMonacoField
                    title={getString('postCommandLabel')}
                    name={`${prefix}spec.postCommand`}
                    scriptType="Bash"
                    expressions={expressions}
                    disabled={readonly}
                  />
                )
              }}
              style={{ flexGrow: 1, marginBottom: 0 }}
              disableTypeSelection={readonly}
            >
              <ShellScriptMonacoField
                title={getString('postCommandLabel')}
                name={`${prefix}spec.postCommand`}
                scriptType="Bash"
                expressions={expressions}
                disabled={readonly}
              />
            </MultiTypeFieldSelector>
          </div>
        </Container>
      )}
      {shouldRenderRunTimeInputView(template?.spec?.reports?.spec?.paths) && (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeListInputSet
            name={`${prefix}spec.reports.spec.paths`}
            multiTextInputProps={{
              allowableTypes,
              expressions
            }}
            multiTypeFieldSelectorProps={{
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_800}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'reportPaths' }}
                >
                  {getString('pipelineSteps.reportPathsLabel')}
                </Text>
              ),
              allowedTypes: allowableTypes.filter(
                type => type !== MultiTypeInputType.EXPRESSION && type !== MultiTypeInputType.RUNTIME
              )
            }}
            placeholder={getString('pipelineSteps.reportPathsPlaceholder')}
            disabled={readonly}
          />
        </Container>
      )}
      {shouldRenderRunTimeInputView(template?.spec?.envVariables) && (
        <Container className={cx(css.formGroup, css.bottomMargin5)}>
          <MultiTypeMapInputSet
            name={`${prefix}spec.envVariables`}
            valueMultiTextInputProps={{
              allowableTypes,
              expressions
            }}
            multiTypeFieldSelectorProps={{
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_800}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'environmentVariables' }}
                >
                  {getString('environmentVariables')}
                </Text>
              ),
              allowedTypes: allowableTypes.filter(type => type !== MultiTypeInputType.EXPRESSION)
            }}
            disabled={readonly}
            formik={formik}
          />
        </Container>
      )}
      {shouldRenderRunTimeInputView(template?.spec?.outputVariables) && (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeListInputSet
            name={`${prefix}spec.outputVariables`}
            withObjectStructure
            keyName="name"
            multiTextInputProps={{
              allowableTypes,
              expressions
            }}
            multiTypeFieldSelectorProps={{
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_800}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'outputVariables' }}
                >
                  {getString('pipelineSteps.outputVariablesLabel')}
                </Text>
              ),
              allowedTypes: allowableTypes.filter(
                type => type !== MultiTypeInputType.EXPRESSION && type !== MultiTypeInputType.RUNTIME
              )
            }}
            disabled={readonly}
          />
        </Container>
      )}
      <StepCommonFieldsInputSet
        path={path}
        readonly={readonly}
        template={template}
        allowableTypes={allowableTypes}
        stepViewType={stepViewType}
      />
    </FormikForm>
  )
}

const RunTestsStepInputSet = connect(RunTestsStepInputSetBasic)
export { RunTestsStepInputSet }
