import React from 'react'
import {
  Text,
  Formik,
  FormInput,
  Button,
  getMultiTypeFromValue,
  MultiTypeInputType,
  FormikForm,
  Accordion
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { FormikProps } from 'formik'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { FormMultiTypeCheckboxField } from '@common/components'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'

import StepCommonFields from '@pipeline/components/StepCommonFields/StepCommonFields'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { useGitScope } from '@ci/services/CIUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './RestoreCacheS3StepFunctionConfigs'
import type { RestoreCacheS3StepData, RestoreCacheS3StepDataUI, RestoreCacheS3StepProps } from './RestoreCacheS3Step'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const RestoreCacheS3StepBase = (
  { initialValues, onUpdate, isNewStep = true, readonly }: RestoreCacheS3StepProps,
  formikRef: StepFormikFowardRef<RestoreCacheS3StepData>
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

  const archiveFormatOptions = [
    { label: 'Tar', value: 'Tar' },
    { label: 'Gzip', value: 'Gzip' }
  ]

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<RestoreCacheS3StepData, RestoreCacheS3StepDataUI>(
        initialValues,
        transformValuesFieldsConfig,
        { archiveFormatOptions }
      )}
      formName="restoreCacheS3"
      validate={valuesToValidate => {
        return validate(valuesToValidate, editViewValidateFieldsConfig, {
          initialValues,
          steps: currentStage?.stage?.spec?.execution?.steps || {},
          serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
          getString
        })
      }}
      onSubmit={(_values: RestoreCacheS3StepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<RestoreCacheS3StepDataUI, RestoreCacheS3StepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<RestoreCacheS3StepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <FormInput.InputWithIdentifier
              inputName="name"
              idName="identifier"
              isIdentifierEditable={isNewStep}
              inputLabel={getString('pipelineSteps.stepNameLabel')}
              inputGroupProps={{ disabled: readonly }}
            />
            <FormMultiTypeConnectorField
              label={
                <Text style={{ display: 'flex', alignItems: 'center' }}>
                  {getString('pipelineSteps.awsConnectorLabel')}
                  <Button
                    icon="question"
                    minimal
                    tooltip={getString('pipelineSteps.restoreCacheAwsConnectorInfo')}
                    iconProps={{ size: 14 }}
                  />
                </Text>
              }
              type={'Aws'}
              width={getMultiTypeFromValue(formik.values.spec.connectorRef) === MultiTypeInputType.RUNTIME ? 515 : 560}
              name="spec.connectorRef"
              placeholder={getString('select')}
              accountIdentifier={accountId}
              projectIdentifier={projectIdentifier}
              orgIdentifier={orgIdentifier}
              multiTypeProps={{ expressions, disabled: readonly }}
              gitScope={gitScope}
              style={{ marginBottom: 'var(--spacing-small)' }}
            />
            <MultiTypeTextField
              name="spec.region"
              label={
                <Text>
                  {getString('regionLabel')}
                  <Button
                    icon="question"
                    minimal
                    tooltip={getString('pipelineSteps.regionInfo')}
                    iconProps={{ size: 14 }}
                  />
                </Text>
              }
              multiTextInputProps={{
                placeholder: getString('pipelineSteps.regionPlaceholder'),
                multiTextInputProps: { expressions },
                disabled: readonly
              }}
              style={{ marginBottom: 'var(--spacing-small)' }}
            />
            <MultiTypeTextField
              name="spec.bucket"
              label={
                <Text>
                  {getString('pipelineSteps.bucketLabel')}
                  <Button
                    icon="question"
                    minimal
                    tooltip={getString('pipelineSteps.S3BucketInfo')}
                    iconProps={{ size: 14 }}
                  />
                </Text>
              }
              multiTextInputProps={{
                multiTextInputProps: { expressions },
                disabled: readonly
              }}
              style={{ marginBottom: 'var(--spacing-small)' }}
            />
            <MultiTypeTextField
              name="spec.key"
              label={
                <Text>
                  {getString('keyLabel')}
                  <Button
                    icon="question"
                    minimal
                    tooltip={getString('pipelineSteps.restoreCacheKeyInfo')}
                    iconProps={{ size: 14 }}
                  />
                </Text>
              }
              multiTextInputProps={{
                multiTextInputProps: { expressions },
                disabled: readonly
              }}
            />
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <>
                    <MultiTypeTextField
                      name="spec.endpoint"
                      label={
                        <Text>
                          {getString('pipelineSteps.endpointLabel')}
                          <Button
                            icon="question"
                            minimal
                            tooltip={getString('pipelineSteps.endpointInfo')}
                            iconProps={{ size: 14 }}
                          />
                        </Text>
                      }
                      multiTextInputProps={{
                        placeholder: getString('pipelineSteps.endpointPlaceholder'),
                        multiTextInputProps: { expressions },
                        disabled: readonly
                      }}
                      style={{ marginBottom: 'var(--spacing-small)' }}
                    />
                    <MultiTypeSelectField
                      name="spec.archiveFormat"
                      label={
                        <Text margin={{ top: 'small' }}>
                          {getString('archiveFormat')}
                          <Button
                            icon="question"
                            minimal
                            tooltip={getString('archiveFormatInfo')}
                            iconProps={{ size: 14 }}
                          />
                        </Text>
                      }
                      multiTypeInputProps={{
                        selectItems: archiveFormatOptions,
                        multiTypeInputProps: { expressions },
                        disabled: readonly
                      }}
                      style={{ marginBottom: 'var(--spacing-medium)' }}
                      disabled={readonly}
                    />
                    <FormMultiTypeCheckboxField
                      name="spec.pathStyle"
                      label={getString('pathStyle')}
                      multiTypeTextbox={{
                        children: (
                          <Button
                            icon="question"
                            minimal
                            tooltip={getString('ci.pipelineSteps.pathStyleInfo')}
                            iconProps={{ size: 14 }}
                          />
                        ),
                        expressions,
                        disabled: readonly
                      }}
                      style={{ marginBottom: 'var(--spacing-medium)' }}
                      disabled={readonly}
                    />
                    <FormMultiTypeCheckboxField
                      name="spec.failIfKeyNotFound"
                      label={getString('failIfKeyNotFound')}
                      multiTypeTextbox={{
                        children: (
                          <Button
                            icon="question"
                            minimal
                            tooltip={getString('ci.pipelineSteps.failIfKeyNotFoundInfo')}
                            iconProps={{ size: 14 }}
                          />
                        ),
                        expressions,
                        disabled: readonly
                      }}
                      style={{ marginBottom: 'var(--spacing-small)' }}
                      disabled={readonly}
                    />
                    <StepCommonFields disabled={readonly} />
                  </>
                }
              />
            </Accordion>
          </FormikForm>
        )
      }}
    </Formik>
  )
}

export const RestoreCacheS3StepBaseWithRef = React.forwardRef(RestoreCacheS3StepBase)
