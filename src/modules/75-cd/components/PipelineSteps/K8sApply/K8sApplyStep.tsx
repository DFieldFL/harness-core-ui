import React from 'react'
import {
  IconName,
  Formik,
  FormInput,
  Button,
  Layout,
  getMultiTypeFromValue,
  MultiTypeInputType
} from '@wings-software/uicore'
import cx from 'classnames'
import { FieldArray, FormikErrors, FormikProps, yupToFormErrors } from 'formik'
import * as Yup from 'yup'
import { v4 as uuid } from 'uuid'
import type {} from 'formik'
import { isEmpty } from 'lodash-es'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import { StepViewType, StepProps, ValidateInputSetProps } from '@pipeline/components/AbstractSteps/Step'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import type { StepElementConfig, K8sApplyStepInfo } from 'services/cd-ng'

import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { FormMultiTypeCheckboxField } from '@common/components'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { useStrings } from 'framework/strings'

import {
  FormMultiTypeDurationField,
  getDurationValidationSchema
} from '@common/components/MultiTypeDuration/MultiTypeDuration'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'

import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import List from '@common/components/List/List'
import stepCss from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export interface K8sApplyData extends StepElementConfig {
  spec: Omit<K8sApplyStepInfo, 'skipDryRun' | 'skipSteadyStateCheck'> & {
    skipDryRun: boolean
    skipSteadyStateCheck?: boolean
  }
}

export interface K8sApplyVariableStepProps {
  initialValues: K8sApplyData
  stageIdentifier: string
  onUpdate?(data: K8sApplyFormData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: K8sApplyData
}

interface FilePathConfig {
  value: string
  id: string
}
interface K8sApplyFormData extends StepElementConfig {
  spec: {
    skipDryRun: boolean
    skipSteadyStateCheck?: boolean
    filePaths?: FilePathConfig[] | string
  }
}

interface K8sApplyProps {
  initialValues: K8sApplyData
  onUpdate?: (data: K8sApplyData) => void
  stepViewType?: StepViewType
  isNewStep?: boolean
  isDisabled?: boolean
  inputSetData?: {
    template?: K8sApplyData
    path?: string
  }
  readonly?: boolean
}

const formatData = (data: K8sApplyFormData): K8sApplyData => {
  return {
    ...data,
    spec: {
      ...data?.spec,
      skipDryRun: data?.spec?.skipDryRun,
      skipSteadyStateCheck: data?.spec?.skipSteadyStateCheck,
      filePaths:
        getMultiTypeFromValue(data?.spec?.filePaths as string) === MultiTypeInputType.RUNTIME
          ? data?.spec?.filePaths
          : ((data?.spec?.filePaths || []) as FilePathConfig[])?.map((item: FilePathConfig) => item.value)
    }
  }
}

function K8sApplyDeployWidget(props: K8sApplyProps, formikRef: StepFormikFowardRef<K8sApplyData>): React.ReactElement {
  const { initialValues, onUpdate, isNewStep = true, isDisabled } = props
  const { getString } = useStrings()
  const defaultValueToReset = [{ value: '', id: uuid() }]

  const { expressions } = useVariablesExpression()

  return (
    <>
      <Formik<K8sApplyFormData>
        enableReinitialize={true}
        onSubmit={(values: K8sApplyFormData) => {
          const formData = {
            ...values,
            spec: {
              ...values.spec,
              skipDryRun: values?.spec?.skipDryRun || false,
              skipSteadyStateCheck: values?.spec?.skipSteadyStateCheck || false,
              filePaths: values?.spec?.filePaths
            }
          }
          onUpdate?.(formData)
        }}
        formName="k8Apply"
        initialValues={initialValues}
        validationSchema={Yup.object().shape({
          name: NameSchema({ requiredErrorMsg: getString('pipelineSteps.stepNameRequired') }),
          timeout: getDurationValidationSchema({ minimum: '10s' }).required(
            getString('validation.timeout10SecMinimum')
          ),
          spec: Yup.object().shape({
            filePaths: Yup.lazy(value =>
              getMultiTypeFromValue(value as boolean) === MultiTypeInputType.FIXED
                ? Yup.array(
                    Yup.object().shape({
                      value: Yup.string().required(getString('cd.pathCannotBeEmpty'))
                    })
                  ).required(getString('cd.filePathRequired'))
                : Yup.string()
            )
          }),
          identifier: IdentifierSchema()
        })}
      >
        {(formik: FormikProps<K8sApplyFormData>) => {
          const { values, setFieldValue } = formik
          setFormikRef(formikRef, formik)
          return (
            <>
              <div className={cx(stepCss.formGroup, stepCss.lg)}>
                <FormInput.InputWithIdentifier
                  inputLabel={getString('name')}
                  isIdentifierEditable={isNewStep}
                  inputGroupProps={{ disabled: isDisabled }}
                />
              </div>
              <div className={cx(stepCss.formGroup, stepCss.sm)}>
                <FormMultiTypeDurationField
                  name="timeout"
                  disabled={isDisabled}
                  label={getString('pipelineSteps.timeoutLabel')}
                  multiTypeDurationProps={{ enableConfigureOptions: false, disabled: isDisabled }}
                />
                {getMultiTypeFromValue(values.timeout) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={values.timeout as string}
                    type="String"
                    variableName="timeout"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      setFieldValue('timeout', value)
                    }}
                    isReadonly={isDisabled}
                  />
                )}
              </div>
              <div className={stepCss.divider} />
              <div className={stepCss.formGroup}>
                <MultiTypeFieldSelector
                  defaultValueToReset={defaultValueToReset}
                  name={'spec.filePaths'}
                  label={getString('common.git.filePath')}
                >
                  <FieldArray
                    name="spec.filePaths"
                    render={arrayHelpers => (
                      <Layout.Vertical>
                        {(values?.spec?.filePaths as FilePathConfig[])?.map((path: FilePathConfig, index: number) => (
                          <Layout.Horizontal
                            key={path.id}
                            flex={{ distribution: 'space-between' }}
                            style={{ alignItems: 'end' }}
                          >
                            <FormInput.MultiTextInput
                              label=""
                              placeholder={getString('cd.filePathPlaceholder')}
                              name={`spec.filePaths[${index}].value`}
                              multiTextInputProps={{
                                allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
                                expressions,
                                textProps: { disabled: isDisabled }
                              }}
                              disabled={isDisabled}
                              style={{ width: '430px' }}
                            />

                            <Button
                              minimal
                              icon="main-trash"
                              onClick={() => arrayHelpers.remove(index)}
                              disabled={isDisabled}
                            />
                          </Layout.Horizontal>
                        ))}
                        <span>
                          <Button
                            minimal
                            text={getString('addFileText')}
                            intent="primary"
                            onClick={() => {
                              arrayHelpers.push({ value: '', id: uuid() })
                            }}
                            disabled={isDisabled}
                          />
                        </span>
                      </Layout.Vertical>
                    )}
                  />
                </MultiTypeFieldSelector>
              </div>

              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormMultiTypeCheckboxField
                  name="spec.skipDryRun"
                  label={getString('pipelineSteps.skipDryRun')}
                  disabled={isDisabled}
                  multiTypeTextbox={{ expressions }}
                />
                {getMultiTypeFromValue(values.spec?.skipDryRun) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={(values.spec.skipDryRun || '') as string}
                    type="String"
                    variableName="spec.skipDryRun"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      setFieldValue('spec.skipDryRun', value)
                    }}
                    isReadonly={isDisabled}
                  />
                )}
              </div>
              <div className={cx(stepCss.formGroup, stepCss.md)}>
                <FormMultiTypeCheckboxField
                  name="spec.skipSteadyStateCheck"
                  disabled={isDisabled}
                  label={getString('pipelineSteps.skipSteadyStateCheck')}
                  multiTypeTextbox={{ expressions }}
                />
                {getMultiTypeFromValue(values.spec?.skipSteadyStateCheck) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={(values.spec.skipSteadyStateCheck || '') as string}
                    type="String"
                    variableName="spec.skipSteadyStateCheck"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      setFieldValue('spec.skipSteadyStateCheck', value)
                    }}
                    isReadonly={isDisabled}
                  />
                )}
              </div>
            </>
          )
        }}
      </Formik>
    </>
  )
}

const K8sApplyInputStep: React.FC<K8sApplyProps> = ({ inputSetData, readonly }) => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  return (
    <>
      {getMultiTypeFromValue(inputSetData?.template?.timeout) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.sm)}>
          <FormMultiTypeDurationField
            multiTypeDurationProps={{
              enableConfigureOptions: false,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              expressions,
              disabled: readonly
            }}
            className={stepCss.checkbox}
            label={getString('pipelineSteps.timeoutLabel')}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}timeout`}
            disabled={readonly}
          />
        </div>
      )}

      {getMultiTypeFromValue(inputSetData?.template?.spec?.filePaths) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <List
            label={getString('filePaths')}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.filePaths`}
            disabled={readonly}
            expressions={expressions}
            style={{ marginBottom: 'var(--spacing-small)' }}
            isNameOfArrayType
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.skipDryRun) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            multiTypeTextbox={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              disabled: readonly
            }}
            disabled={readonly}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.skipDryRun`}
            className={stepCss.checkbox}
            label={getString('pipelineSteps.skipDryRun')}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
      {getMultiTypeFromValue(inputSetData?.template?.spec?.skipSteadyStateCheck) === MultiTypeInputType.RUNTIME && (
        <div className={cx(stepCss.formGroup, stepCss.md)}>
          <FormMultiTypeCheckboxField
            multiTypeTextbox={{
              expressions,
              allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION],
              disabled: readonly
            }}
            disabled={readonly}
            name={`${isEmpty(inputSetData?.path) ? '' : `${inputSetData?.path}.`}spec.skipSteadyStateCheck`}
            className={stepCss.checkbox}
            label={getString('pipelineSteps.skipSteadyStateCheck')}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
    </>
  )
}

const K8sApplyVariableStep: React.FC<K8sApplyVariableStepProps> = ({ variablesData, metadataMap, initialValues }) => {
  return (
    <VariablesListTable
      className={stepCss.topSpacingLarge}
      data={variablesData.spec}
      originalData={initialValues.spec}
      metadataMap={metadataMap}
    />
  )
}

const K8sApplyDeployWidgetWithRef = React.forwardRef(K8sApplyDeployWidget)
export class K8sApplyStep extends PipelineStep<K8sApplyData> {
  constructor() {
    super()
    this._hasStepVariables = true
    this._hasDelegateSelectionVisible = true
  }
  renderStep(props: StepProps<K8sApplyData>): JSX.Element {
    const { initialValues, onUpdate, stepViewType, inputSetData, formikRef, customStepProps, isNewStep, readonly } =
      props
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <K8sApplyInputStep
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          inputSetData={inputSetData}
          readonly={!!inputSetData?.readonly}
        />
      )
    } else if (stepViewType === StepViewType.InputVariable) {
      return (
        <K8sApplyVariableStep
          {...(customStepProps as K8sApplyVariableStepProps)}
          initialValues={initialValues}
          onUpdate={data => onUpdate?.(formatData(data))}
        />
      )
    }
    return (
      <K8sApplyDeployWidgetWithRef
        initialValues={this.getInitialValues(initialValues)}
        onUpdate={data => onUpdate?.(this.processFormData(data))}
        isNewStep={isNewStep}
        stepViewType={stepViewType}
        readonly={!!inputSetData?.readonly}
        isDisabled={readonly}
        ref={formikRef}
      />
    )
  }
  validateInputSet({
    data,
    template,
    getString,
    viewType
  }: ValidateInputSetProps<K8sApplyData>): FormikErrors<K8sApplyData> {
    const isRequired = viewType === StepViewType.DeploymentForm
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errors = {} as any
    if (getMultiTypeFromValue(template?.timeout) === MultiTypeInputType.RUNTIME) {
      let timeoutSchema = getDurationValidationSchema({ minimum: '10s' })
      if (isRequired) {
        timeoutSchema = timeoutSchema.required(getString?.('validation.timeout10SecMinimum'))
      }
      const timeout = Yup.object().shape({
        timeout: timeoutSchema
      })

      try {
        timeout.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    if (getMultiTypeFromValue(template?.spec?.filePaths) === MultiTypeInputType.RUNTIME) {
      let filePathSchema = Yup.object().shape({
        spec: Yup.object().shape({
          filePaths: Yup.array(Yup.string().trim()).ensure().nullable()
        })
      })
      if (isRequired) {
        filePathSchema = Yup.object().shape({
          spec: Yup.object().shape({
            filePaths: Yup.array(Yup.string().trim().required(getString?.('cd.pathCannotBeEmpty')))
              .required(getString?.('cd.filePathRequired'))
              .min(1, getString?.('cd.filePathRequired'))
              .ensure()
          })
        })
      }
      try {
        filePathSchema.validateSync(data)
      } catch (e) {
        /* istanbul ignore else */
        if (e instanceof Yup.ValidationError) {
          const err = yupToFormErrors(e)

          Object.assign(errors, err)
        }
      }
    }
    /* istanbul ignore else */
    if (isEmpty(errors.spec)) {
      delete errors.spec
    }
    return errors
  }

  private getInitialValues(initialValues: any): K8sApplyFormData {
    return {
      ...initialValues,
      spec: {
        ...initialValues.spec,
        filePaths:
          getMultiTypeFromValue(initialValues?.spec?.filePaths) === MultiTypeInputType.RUNTIME
            ? initialValues?.spec?.filePaths
            : initialValues?.spec?.filePaths?.length
            ? (initialValues?.spec?.filePaths || [])?.map((item: string) => ({
                value: item,
                id: uuid()
              }))
            : [{ value: '', id: uuid() }]
      }
    }
  }

  processFormData(data: any): K8sApplyData {
    return {
      ...data,
      spec: {
        ...data.spec,
        skipDryRun: data?.spec?.skipDryRun,
        skipSteadyStateCheck: data?.spec?.skipSteadyStateCheck,
        filePaths:
          getMultiTypeFromValue(data?.spec?.filePaths) === MultiTypeInputType.RUNTIME
            ? data?.spec?.filePaths
            : (data?.spec?.filePaths || [])?.map((item: FilePathConfig) => item.value)
      }
    }
  }

  protected type = StepType.K8sApply
  protected stepName = 'K8s Apply'
  protected stepIcon: IconName = 'code'

  protected defaultValues: K8sApplyData = {
    identifier: '',
    timeout: '10m',
    name: '',
    type: StepType.K8sApply,
    spec: {
      filePaths: [],
      skipDryRun: false,
      skipSteadyStateCheck: false
    }
  }
}
