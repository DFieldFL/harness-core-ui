/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import cx from 'classnames'
import {
  Text,
  Formik,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  Accordion,
  Color,
  Container,
  FormInput,
  Layout
} from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import get from 'lodash/get'
import type { K8sDirectInfraYaml } from 'services/ci'
import { Connectors } from '@connectors/constants'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { StepFormikFowardRef, StepViewType, setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import MultiTypeFieldSelector from '@common/components/MultiTypeFieldSelector/MultiTypeFieldSelector'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { ConfigureOptions } from '@common/components/ConfigureOptions/ConfigureOptions'
import { ShellScriptMonacoField } from '@common/components/ShellScriptMonaco/ShellScriptMonaco'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { FormMultiTypeTextAreaField, Separator } from '@common/components'
import StepCommonFields, {
  GetImagePullPolicyOptions,
  GetShellOptions
} from '@pipeline/components/StepCommonFields/StepCommonFields'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useGitScope } from '@pipeline/utils/CIUtils'
import type { RunStepProps, RunStepData, RunStepDataUI } from './RunStep'
import { transformValuesFieldsConfig, getEditViewValidateFieldsConfig } from './RunStepFunctionConfigs'
import { CIStepOptionalConfig, getOptionalSubLabel } from '../CIStep/CIStepOptionalConfig'
import { useGetPropagatedStageById, validateConnectorRefAndImageDepdendency } from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RunStepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly, stepViewType, allowableTypes, onChange }: RunStepProps,
  formikRef: StepFormikFowardRef<RunStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const gitScope = useGitScope()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  const buildInfrastructureType = get(currentStage, 'stage.spec.infrastructure.type') as K8sDirectInfraYaml['type']

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
      initialValues={getInitialValuesInCorrectFormat<RunStepData, RunStepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { imagePullPolicyOptions: GetImagePullPolicyOptions(), shellOptions: GetShellOptions(buildInfrastructureType) }
      )}
      formName="ciRunStep"
      validate={valuesToValidate => {
        /* If a user configures AWS VMs as an infra, the steps can be executed directly on the VMS or in a container on a VM. 
        For the latter case, even though Container Registry and Image are optional for AWS VMs infra, they both need to be specified for container to be spawned properly */
        if (buildInfrastructureType === 'VM') {
          return validateConnectorRefAndImageDepdendency(
            get(valuesToValidate, 'spec.connectorRef', ''),
            get(valuesToValidate, 'spec.image', ''),
            getString
          )
        }
        const schemaValues = getFormValuesInCorrectFormat<RunStepDataUI, RunStepData>(
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
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || [],
            getString
          },
          stepViewType
        )
      }}
      onSubmit={(_values: RunStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<RunStepDataUI, RunStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<RunStepData>) => {
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
            <div className={cx(css.fieldsGroup, css.withoutSpacing, css.topPadding3, css.bottomPadding3)}>
              <MultiTypeFieldSelector
                name="spec.command"
                label={
                  <Text
                    color={Color.GREY_800}
                    font={{ size: 'normal', weight: 'bold' }}
                    className={css.inpLabel}
                    style={{ display: 'flex', alignItems: 'center' }}
                    tooltipProps={{ dataTooltipId: 'runCommand' }}
                  >
                    {getString('commandLabel')}
                  </Text>
                }
                defaultValueToReset=""
                skipRenderValueInExpressionLabel
                allowedTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED, MultiTypeInputType.RUNTIME]}
                expressionRender={() => {
                  return (
                    <ShellScriptMonacoField
                      title={getString('commandLabel')}
                      name="spec.command"
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
                  title={getString('commandLabel')}
                  name="spec.command"
                  scriptType="Bash"
                  disabled={readonly}
                  expressions={expressions}
                />
              </MultiTypeFieldSelector>
              {getMultiTypeFromValue(formik?.values?.spec?.command) === MultiTypeInputType.RUNTIME && (
                <ConfigureOptions
                  style={{ marginTop: 17 }}
                  value={formik?.values?.spec?.command as string}
                  type={getString('string')}
                  variableName="spec.command"
                  showRequiredField={false}
                  showDefaultField={false}
                  showAdvanced={true}
                  onChange={value => formik?.setFieldValue('spec.command', value)}
                  isReadonly={readonly}
                />
              )}
            </div>
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <Container margin={{ top: 'medium' }}>
                    {buildInfrastructureType === 'VM' ? renderConnectorRefAndImage(true) : null}
                    <CIStepOptionalConfig
                      stepViewType={stepViewType}
                      readonly={readonly}
                      enableFields={{
                        'spec.privileged': { shouldHide: buildInfrastructureType === 'VM' },
                        'spec.reportPaths': {},
                        'spec.envVariables': { tooltipId: 'environmentVariables' },
                        'spec.outputVariables': {}
                      }}
                      allowableTypes={allowableTypes}
                    />
                    <StepCommonFields
                      enableFields={['spec.imagePullPolicy', 'spec.shell']}
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

export const RunStepBaseWithRef = React.forwardRef(RunStepBase)
