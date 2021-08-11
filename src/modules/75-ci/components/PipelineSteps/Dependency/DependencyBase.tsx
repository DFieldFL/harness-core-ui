import React from 'react'
import {
  Text,
  Formik,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  Accordion
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { FormMultiTypeTextAreaField } from '@common/components/MultiTypeTextArea/MultiTypeTextArea'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import StepCommonFields, { GetImagePullPolicyOptions } from '@pipeline/components/StepCommonFields/StepCommonFields'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { useGitScope } from '@ci/services/CIUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './DependencyFunctionConfigs'
import type { DependencyProps, DependencyData, DependencyDataUI } from './Dependency'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const DependencyBase = (
  { initialValues, onUpdate, isNewStep, readonly }: DependencyProps,
  formikRef: StepFormikFowardRef<DependencyData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = React.useContext(PipelineContext)

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const gitScope = useGitScope()

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(selectedStageId || '')

  return (
    <Formik<DependencyDataUI>
      initialValues={getInitialValuesInCorrectFormat<DependencyData, DependencyDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { imagePullPolicyOptions: GetImagePullPolicyOptions() }
      )}
      formName="dependencyBase"
      validate={valuesToValidate => {
        return validate(valuesToValidate, editViewValidateFieldsConfig, {
          initialValues,
          steps: currentStage?.stage?.spec?.execution?.steps || [],
          serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || [],
          type: StepType.Dependency,
          getString
        })
      }}
      onSubmit={(_values: DependencyDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<DependencyDataUI, DependencyData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {formik => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <div style={{ padding: 'var(--spacing-large)' }}>
              <FormInput.InputWithIdentifier
                inputName="name"
                idName="identifier"
                isIdentifierEditable={isNewStep}
                inputLabel={getString('dependencyNameLabel')}
                inputGroupProps={{ disabled: readonly }}
              />
              <FormMultiTypeTextAreaField
                className={css.removeBpLabelMargin}
                name="description"
                label={<Text margin={{ bottom: 'xsmall' }}>{getString('description')}</Text>}
                style={{ marginBottom: 'var(--spacing-xsmall)' }}
                multiTypeTextArea={{
                  disabled: readonly,
                  expressions
                }}
              />
              <FormMultiTypeConnectorField
                label={
                  <Text
                    style={{ display: 'flex', alignItems: 'center' }}
                    tooltipProps={{
                      dataTooltipId: 'dependencyConnector'
                    }}
                  >
                    {getString('pipelineSteps.connectorLabel')}
                  </Text>
                }
                type={['Gcp', 'Aws', 'DockerRegistry']}
                width={
                  getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME ? 515 : 560
                }
                name="spec.connectorRef"
                placeholder={getString('select')}
                accountIdentifier={accountId}
                projectIdentifier={projectIdentifier}
                orgIdentifier={orgIdentifier}
                style={{ marginBottom: 0 }}
                multiTypeProps={{ expressions, disabled: readonly }}
                gitScope={gitScope}
              />
              <MultiTypeTextField
                name="spec.image"
                label={
                  <Text
                    margin={{ top: 'small' }}
                    tooltipProps={{
                      dataTooltipId: 'image'
                    }}
                  >
                    {getString('imageLabel')}
                  </Text>
                }
                multiTextInputProps={{
                  placeholder: getString('dependencyImagePlaceholder'),
                  disabled: readonly,
                  multiTextInputProps: {
                    expressions,
                    allowableTypes: [
                      MultiTypeInputType.EXPRESSION,
                      MultiTypeInputType.FIXED,
                      MultiTypeInputType.RUNTIME
                    ],
                    textProps: {
                      autoComplete: 'off'
                    }
                  }
                }}
              />
              <Accordion className={css.accordion}>
                <Accordion.Panel
                  id="optional-config"
                  summary={getString('common.optionalConfig')}
                  details={
                    <>
                      <FormMultiTypeCheckboxField
                        name="spec.privileged"
                        label={getString('ci.privileged')}
                        multiTypeTextbox={{
                          expressions
                        }}
                        tooltipProps={{ dataTooltipId: 'privileged' }}
                        disabled={readonly}
                      />
                      <MultiTypeMap
                        name="spec.envVariables"
                        valueMultiTextInputProps={{ expressions }}
                        multiTypeFieldSelectorProps={{
                          label: (
                            <Text
                              style={{ display: 'flex', alignItems: 'center' }}
                              tooltipProps={{ dataTooltipId: 'dependencyEnvironmentVariables' }}
                            >
                              {getString('environmentVariables')}
                            </Text>
                          )
                        }}
                        disabled={readonly}
                      />
                      <MultiTypeList
                        name="spec.entrypoint"
                        multiTextInputProps={{ expressions }}
                        multiTypeFieldSelectorProps={{
                          label: (
                            <Text
                              style={{ display: 'flex', alignItems: 'center' }}
                              tooltipProps={{ dataTooltipId: 'dependencyEntryPoint' }}
                            >
                              {getString('entryPointLabel')}
                            </Text>
                          )
                        }}
                        disabled={readonly}
                        style={{ marginTop: 'var(--spacing-small)', marginBottom: 'var(--spacing-small)' }}
                      />
                      <MultiTypeList
                        name="spec.args"
                        multiTextInputProps={{ expressions }}
                        multiTypeFieldSelectorProps={{
                          label: (
                            <Text
                              style={{ display: 'flex', alignItems: 'center' }}
                              tooltipProps={{ dataTooltipId: 'dependencyArgs' }}
                            >
                              {getString('argsLabel')}
                            </Text>
                          )
                        }}
                        disabled={readonly}
                      />
                      <StepCommonFields enableFields={['spec.imagePullPolicy']} withoutTimeout disabled={readonly} />
                    </>
                  }
                />
              </Accordion>
            </div>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const DependencyBaseWithRef = React.forwardRef(DependencyBase)
