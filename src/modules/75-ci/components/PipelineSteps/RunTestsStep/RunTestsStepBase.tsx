/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FormEvent } from 'react'
import { useParams } from 'react-router-dom'
import {
  Text,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  Accordion,
  RadioButtonGroup,
  CodeBlock,
  Container,
  Color,
  Layout,
  FormInput,
  SelectOption
} from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import get from 'lodash/get'
import cx from 'classnames'
import type { K8sDirectInfraYaml } from 'services/ci'
import { Connectors } from '@connectors/constants'
import { StepFormikFowardRef, StepViewType, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { FormMultiTypeCheckboxField, FormMultiTypeTextAreaField, Separator } from '@common/components'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { useGitScope } from '@pipeline/utils/CIUtils'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import StepCommonFields, {
  GetImagePullPolicyOptions,
  GetShellOptions /*,{ /*usePullOptions }*/
} from '@pipeline/components/StepCommonFields/StepCommonFields'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import type { RunTestsStepProps, RunTestsStepData, RunTestsStepDataUI } from './RunTestsStep'
import { transformValuesFieldsConfig, getEditViewValidateFieldsConfig } from './RunTestsStepFunctionConfigs'
import { getOptionalSubLabel } from '../CIStep/CIStepOptionalConfig'
import { useGetPropagatedStageById, validateConnectorRefAndImageDepdendency } from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface FieldRenderProps {
  name: string
  fieldLabelKey: keyof StringsMap
  tooltipId: string
  renderOptionalSublabel?: boolean
  selectFieldOptions?: SelectOption[]
  onSelectChange?: (SelectOption: any) => void
}

const javaBuildToolOptions = [
  { label: 'Bazel', value: 'Bazel' },
  { label: 'Maven', value: 'Maven' },
  { label: 'Gradle', value: 'Gradle' }
]

const cSharpBuildToolOptions = [
  { label: 'Dotnet', value: 'Dotnet' },
  { label: 'Nunit Console', value: 'Nunitconsole' }
]

const enum Language {
  Java = 'Java',
  Csharp = 'Csharp'
}

const getBuildToolOptions = (language?: string): SelectOption[] | undefined => {
  if (language === Language.Java) {
    return javaBuildToolOptions
  } else if (language === Language.Csharp) {
    return cSharpBuildToolOptions
  }
  return undefined
}

export const RunTestsStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, allowableTypes, onChange }: RunTestsStepProps,
  formikRef: StepFormikFowardRef<RunTestsStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const [mavenSetupQuestionAnswer, setMavenSetupQuestionAnswer] = React.useState('yes')
  const currentStage = useGetPropagatedStageById(selectedStageId || '')
  const buildInfrastructureType = get(currentStage, 'stage.spec.infrastructure.type') as K8sDirectInfraYaml['type']
  const [languageOptions, setLanguageOptions] = React.useState<SelectOption[]>([
    { label: 'Csharp', value: Language.Csharp },
    { label: 'Java', value: Language.Java }
  ])

  React.useEffect(() => {
    if (buildInfrastructureType !== 'VM') {
      setLanguageOptions([{ label: 'Java', value: Language.Java }])
    }
  }, [buildInfrastructureType])

  const [buildToolOptions, setBuildToolOptions] = React.useState<SelectOption[]>(
    getBuildToolOptions(initialValues?.spec?.language) || []
  )

  const { getString } = useStrings()
  const gitScope = useGitScope()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const { expressions } = useVariablesExpression()

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const pullOptions = usePullOptions()

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const values = getInitialValuesInCorrectFormat<RunTestsStepData, RunTestsStepDataUI>(initialValues, transformValuesFieldsConfig, {
  //   pullOptions
  // })

  const renderMultiTypeTextField = React.useCallback(
    ({ name, fieldLabelKey, tooltipId, renderOptionalSublabel = false }: FieldRenderProps) => {
      return (
        <MultiTypeTextField
          name={name}
          label={
            <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
              <Text
                className={css.inpLabel}
                color={Color.GREY_600}
                font={{ size: 'small', weight: 'semi-bold' }}
                tooltipProps={renderOptionalSublabel ? {} : { dataTooltipId: tooltipId }}
              >
                {getString(fieldLabelKey)}
              </Text>
              {renderOptionalSublabel ? (
                <>
                  &nbsp;
                  {getOptionalSubLabel(tooltipId, getString)}
                </>
              ) : null}
            </Layout.Horizontal>
          }
          multiTextInputProps={{
            multiTextInputProps: { expressions },
            disabled: readonly
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )
    },
    []
  )

  const renderMultiTypeList = React.useCallback(({ name, fieldLabelKey, tooltipId }: FieldRenderProps) => {
    return (
      <MultiTypeList
        name={name}
        multiTypeFieldSelectorProps={{
          label: (
            <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
              <Text
                className={css.inpLabel}
                color={Color.GREY_800}
                font={{ size: 'small', weight: 'semi-bold' }}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                {getString(fieldLabelKey)}
              </Text>
              &nbsp;
              {getOptionalSubLabel(tooltipId, getString)}
            </Layout.Horizontal>
          ),
          allowedTypes: allowableTypes.filter(type => type !== MultiTypeInputType.RUNTIME)
        }}
        multiTextInputProps={{ expressions }}
        disabled={readonly}
      />
    )
  }, [])

  const renderMultiTypeSelectField = React.useCallback(
    ({ name, fieldLabelKey, tooltipId, selectFieldOptions = [], onSelectChange }: FieldRenderProps) => {
      return (
        <MultiTypeSelectField
          name={name}
          label={
            <Text
              className={css.inpLabel}
              color={Color.GREY_600}
              font={{ size: 'small', weight: 'semi-bold' }}
              tooltipProps={{ dataTooltipId: tooltipId }}
            >
              {getString(fieldLabelKey)}
            </Text>
          }
          multiTypeInputProps={{
            selectItems: selectFieldOptions,
            multiTypeInputProps: {
              onChange: option => onSelectChange?.(option),
              allowableTypes: [MultiTypeInputType.FIXED],
              expressions
            },
            disabled: readonly
          }}
          disabled={readonly}
        />
      )
    },
    []
  )

  const renderMultiTypeFieldSelector = React.useCallback(({ name, fieldLabelKey, tooltipId }: FieldRenderProps) => {
    return (
      <MultiTypeFieldSelector
        name={name}
        label={
          <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
            <Text
              className={css.inpLabel}
              color={Color.GREY_600}
              font={{ size: 'small', weight: 'semi-bold' }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              {getString(fieldLabelKey)}
            </Text>
            &nbsp;
            {getOptionalSubLabel(tooltipId, getString)}
          </Layout.Horizontal>
        }
        defaultValueToReset=""
        allowedTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
        expressionRender={() => {
          return <ShellScriptMonacoField name={name} scriptType="Bash" disabled={readonly} expressions={expressions} />
        }}
        style={{ flexGrow: 1, marginBottom: 0 }}
        disableTypeSelection={readonly}
      >
        <ShellScriptMonacoField name={name} scriptType="Bash" disabled={readonly} />
      </MultiTypeFieldSelector>
    )
  }, [])

  const renderConnectorRefAndImage = React.useCallback(
    (showOptionalSublabel: boolean) => (
      <>
        <Container className={css.bottomMargin3}>
          <FormMultiTypeConnectorField
            label={
              <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  {getString('pipelineSteps.connectorLabel')}
                </Text>
                &nbsp;
                {showOptionalSublabel ? getOptionalSubLabel('', getString) : null}
              </Layout.Horizontal>
            }
            type={[Connectors.GCP, Connectors.AWS, Connectors.DOCKER]}
            width={385}
            name={`spec.connectorRef`}
            placeholder={getString('select')}
            accountIdentifier={accountId}
            projectIdentifier={projectIdentifier}
            orgIdentifier={orgIdentifier}
            multiTypeProps={{
              expressions,
              allowableTypes,
              disabled: readonly
            }}
            gitScope={gitScope}
            setRefValue
          />
        </Container>
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeTextField
            name={`spec.image`}
            label={
              <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  tooltipProps={
                    showOptionalSublabel
                      ? {}
                      : {
                          dataTooltipId: 'image'
                        }
                  }
                  placeholder={getString('imagePlaceholder')}
                >
                  {getString('imageLabel')}
                </Text>
                &nbsp;
                {showOptionalSublabel ? getOptionalSubLabel('image', getString) : null}
              </Layout.Horizontal>
            }
          />
        </Container>
      </>
    ),
    []
  )

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<RunTestsStepData, RunTestsStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        {
          buildToolOptions,
          languageOptions,
          imagePullPolicyOptions: GetImagePullPolicyOptions(),
          shellOptions: buildInfrastructureType === 'VM' ? GetShellOptions(buildInfrastructureType) : []
        }
      )}
      formName="ciRunTests"
      validate={valuesToValidate => {
        if (buildInfrastructureType === 'VM') {
          return validateConnectorRefAndImageDepdendency(
            get(valuesToValidate, 'spec.connectorRef', ''),
            get(valuesToValidate, 'spec.image', ''),
            getString
          )
        }
        const schemaValues = getFormValuesInCorrectFormat<RunTestsStepDataUI, RunTestsStepData>(
          valuesToValidate,
          transformValuesFieldsConfig
        )
        onChange?.(schemaValues)
        return validate(
          valuesToValidate,
          getEditViewValidateFieldsConfig(buildInfrastructureType),
          {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || {},
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
            getString
          },
          stepViewType
        )
      }}
      onSubmit={(_values: RunTestsStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<RunTestsStepDataUI, RunTestsStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<RunTestsStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            {stepViewType !== StepViewType.Template ? (
              <Container className={cx(css.formGroup, css.lg, css.nameIdLabel)}>
                <FormInput.InputWithIdentifier
                  inputName="name"
                  idName="identifier"
                  isIdentifierEditable={isNewStep && !readonly}
                  inputGroupProps={{ disabled: readonly }}
                  inputLabel={getString('pipelineSteps.stepNameLabel')}
                />
              </Container>
            ) : null}
            <Container className={cx(css.formGroup, css.lg)}>
              <FormMultiTypeTextAreaField
                name={`description`}
                label={
                  <Text color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                    {getString('description')}
                  </Text>
                }
                multiTypeTextArea={{ expressions, allowableTypes, disabled: readonly }}
              />
            </Container>
            {buildInfrastructureType !== 'VM' ? (
              <>
                <Separator topSeparation={8} />
                {renderConnectorRefAndImage(false)}
              </>
            ) : null}
            <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
              {renderMultiTypeSelectField({
                name: 'spec.language',
                fieldLabelKey: 'languageLabel',
                tooltipId: 'runTestsLanguage',
                selectFieldOptions: languageOptions,
                onSelectChange: (option?: SelectOption) => {
                  const newBuildToolOptions = getBuildToolOptions(option?.value as string)
                  if (newBuildToolOptions) {
                    setBuildToolOptions(newBuildToolOptions)
                    formik.setFieldValue('spec.buildTool', '')
                  }
                }
              })}
            </Container>
            <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
              {renderMultiTypeSelectField({
                name: 'spec.buildTool',
                fieldLabelKey: 'buildToolLabel',
                tooltipId: 'runTestsBuildTool',
                selectFieldOptions: buildToolOptions
              })}
            </Container>
            {(formik.values?.spec?.language as any)?.value === Language.Java &&
              (formik.values?.spec?.buildTool as any)?.value === 'Maven' && (
                <>
                  <Text margin={{ top: 'small', bottom: 'small' }} color="grey800">
                    {getString('ci.runTestsMavenSetupTitle')}
                  </Text>
                  <Text font={{ size: 'small' }}>{getString('ci.runTestsMavenSetupText1')}</Text>
                  <RadioButtonGroup
                    name="run-tests-maven-setup"
                    inline={true}
                    selectedValue={mavenSetupQuestionAnswer}
                    onChange={(e: FormEvent<HTMLInputElement>) => {
                      setMavenSetupQuestionAnswer(e.currentTarget.value)
                    }}
                    options={[
                      { label: 'Yes', value: 'yes' },
                      { label: 'No', value: 'no' }
                    ]}
                    margin={{ bottom: 'small' }}
                  />
                  {mavenSetupQuestionAnswer === 'yes' && (
                    <>
                      <Text
                        font={{ size: 'small' }}
                        margin={{ bottom: 'xsmall' }}
                        tooltipProps={{ dataTooltipId: 'runTestsMavenSetupText2' }}
                      >
                        {getString('ci.runTestsMavenSetupText2')}
                      </Text>
                      <CodeBlock
                        allowCopy
                        codeToCopy="${env.HARNESS_JAVA_AGENT}"
                        format="pre"
                        snippet={getString('ci.runTestsMavenSetupSample')}
                      />
                    </>
                  )}
                </>
              )}
            {(formik.values?.spec?.language as any)?.value === Language.Java &&
              (formik.values?.spec?.buildTool as any)?.value === 'Gradle' && (
                <>
                  <Text margin={{ top: 'small', bottom: 'small' }} color="grey800">
                    {getString('ci.gradleNotesTitle')}
                  </Text>
                  <CodeBlock
                    allowCopy
                    codeToCopy={`tasks.withType(Test) {
  if(System.getProperty("HARNESS_JAVA_AGENT")) {
    jvmArgs += [System.getProperty("HARNESS_JAVA_AGENT")]
  }
}

gradle.projectsEvaluated {
        tasks.withType(Test) {
            filter {
                setFailOnNoMatchingTests(false)
            }
        }
}`}
                    format="pre"
                    snippet={getString('ci.gradleNote1')}
                  />
                  <Text margin={{ top: 'small' }} color="grey800">
                    {getString('ci.gradleNote2')}
                  </Text>
                </>
              )}
            <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
              {renderMultiTypeTextField({ name: 'spec.args', fieldLabelKey: 'argsLabel', tooltipId: 'runTestsArgs' })}
            </Container>
            <Container className={cx(css.formGroup, css.lg)}>
              {renderMultiTypeTextField({
                name: 'spec.packages',
                fieldLabelKey: 'packagesLabel',
                tooltipId: 'runTestsPackages'
              })}
            </Container>
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <Container margin={{ top: 'medium' }}>
                    {buildInfrastructureType === 'VM' ? renderConnectorRefAndImage(true) : null}
                    <Container className={cx(css.formGroup, css.sm, css.bottomMargin5)}>
                      <FormMultiTypeCheckboxField
                        name="spec.runOnlySelectedTests"
                        label={getString('runOnlySelectedTestsLabel')}
                        multiTypeTextbox={{ expressions, disabled: readonly }}
                        style={{ marginBottom: 'var(--spacing-small)' }}
                        disabled={readonly}
                      />
                    </Container>
                    <Container className={cx(css.formGroup, css.sm, css.bottomMargin5)}>
                      {renderMultiTypeTextField({
                        name: 'spec.testAnnotations',
                        fieldLabelKey: 'testAnnotationsLabel',
                        tooltipId: 'runTestsTestAnnotations',
                        renderOptionalSublabel: true
                      })}
                    </Container>
                    <Container className={css.bottomMargin5}>
                      <div
                        className={cx(css.fieldsGroup, css.withoutSpacing)}
                        style={{ marginBottom: 'var(--spacing-small)' }}
                      >
                        {renderMultiTypeFieldSelector({
                          name: 'spec.preCommand',
                          fieldLabelKey: 'preCommandLabel',
                          tooltipId: 'runTestsPreCommand'
                        })}
                        {getMultiTypeFromValue(formik?.values?.spec?.preCommand) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            style={{ marginTop: 17 }}
                            value={formik?.values?.spec?.preCommand as string}
                            type={getString('string')}
                            variableName="spec.preCommand"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={value => formik?.setFieldValue('spec.preCommand', value)}
                            isReadonly={readonly}
                          />
                        )}
                      </div>
                    </Container>
                    <Container className={css.bottomMargin5}>
                      <div
                        className={cx(css.fieldsGroup, css.withoutSpacing)}
                        style={{ marginBottom: 'var(--spacing-small)' }}
                      >
                        {renderMultiTypeFieldSelector({
                          name: 'spec.postCommand',
                          fieldLabelKey: 'postCommandLabel',
                          tooltipId: 'runTestsPostCommand'
                        })}
                        {getMultiTypeFromValue(formik?.values?.spec?.postCommand) === MultiTypeInputType.RUNTIME && (
                          <ConfigureOptions
                            style={{ marginTop: 17 }}
                            value={formik?.values?.spec?.postCommand as string}
                            type={getString('string')}
                            variableName="spec.postCommand"
                            showRequiredField={false}
                            showDefaultField={false}
                            showAdvanced={true}
                            onChange={value => formik?.setFieldValue('spec.postCommand', value)}
                            isReadonly={readonly}
                          />
                        )}
                      </div>
                    </Container>
                    <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
                      {renderMultiTypeList({
                        name: 'spec.reportPaths',
                        fieldLabelKey: 'pipelineSteps.reportPathsLabel',
                        tooltipId: 'reportPaths'
                      })}
                    </Container>
                    <Container className={cx(css.formGroup, css.bottomMargin5)}>
                      <MultiTypeMap
                        name="spec.envVariables"
                        multiTypeFieldSelectorProps={{
                          label: (
                            <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                              <Text
                                className={css.inpLabel}
                                color={Color.GREY_800}
                                font={{ size: 'small', weight: 'semi-bold' }}
                                style={{ display: 'flex', alignItems: 'center' }}
                              >
                                {getString('environmentVariables')}
                              </Text>
                              &nbsp;
                              {getOptionalSubLabel('environmentVariables', getString)}
                            </Layout.Horizontal>
                          )
                        }}
                        valueMultiTextInputProps={{ expressions }}
                        style={{ marginBottom: 'var(--spacing-small)' }}
                        disabled={readonly}
                      />
                    </Container>
                    <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
                      {renderMultiTypeList({
                        name: 'spec.outputVariables',
                        fieldLabelKey: 'pipelineSteps.outputVariablesLabel',
                        tooltipId: 'outputVariables'
                      })}
                    </Container>
                    <StepCommonFields
                      enableFields={[
                        ...(buildInfrastructureType === 'VM' ? ['spec.shell'] : []),
                        'spec.imagePullPolicy'
                      ]}
                      disabled={readonly}
                      allowableTypes={allowableTypes}
                      buildInfrastructureType={buildInfrastructureType}
                    />
                  </Container>
                }
              />
            </Accordion>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const RunTestsStepBaseWithRef = React.forwardRef(RunTestsStepBase)
