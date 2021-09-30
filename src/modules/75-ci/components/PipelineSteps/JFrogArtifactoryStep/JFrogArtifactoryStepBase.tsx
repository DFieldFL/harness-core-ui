import React from 'react'
import { Text, Formik, FormikForm, Accordion } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { Connectors } from '@connectors/constants'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'

import StepCommonFields /*,{ /*usePullOptions }*/ from '@pipeline/components/StepCommonFields/StepCommonFields'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import type { BuildStageElementConfig } from '@pipeline/utils/pipelineTypes'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './JFrogArtifactoryStepFunctionConfigs'
import type {
  JFrogArtifactoryStepProps,
  JFrogArtifactoryStepData,
  JFrogArtifactoryStepDataUI
} from './JFrogArtifactoryStep'
import { CIStep } from '../CIStep/CIStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const JFrogArtifactoryStepBase = (
  { initialValues, onUpdate, isNewStep, readonly }: JFrogArtifactoryStepProps,
  formikRef: StepFormikFowardRef<JFrogArtifactoryStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    },
    getStageFromPipeline
  } = React.useContext(PipelineContext)

  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const { stage: currentStage } = getStageFromPipeline<BuildStageElementConfig>(selectedStageId || '')

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const pullOptions = usePullOptions()

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const values = getInitialValuesInCorrectFormat<JFrogArtifactoryStepData, JFrogArtifactoryStepDataUI>(initialValues, transformValuesFieldsConfig, {
  //   pullOptions
  // })

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<JFrogArtifactoryStepData, JFrogArtifactoryStepDataUI>(
        initialValues,
        transformValuesFieldsConfig
      )}
      formName="jfrogArt"
      validate={valuesToValidate => {
        return validate(valuesToValidate, editViewValidateFieldsConfig, {
          initialValues,
          steps: currentStage?.stage?.spec?.execution?.steps || {},
          serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
          getString
        })
      }}
      onSubmit={(_values: JFrogArtifactoryStepDataUI) => {
        const schemaValues = getFormValuesInCorrectFormat<JFrogArtifactoryStepDataUI, JFrogArtifactoryStepData>(
          _values,
          transformValuesFieldsConfig
        )
        onUpdate?.(schemaValues)
      }}
    >
      {(formik: FormikProps<JFrogArtifactoryStepData>) => {
        // This is required
        setFormikRef?.(formikRef, formik)

        return (
          <FormikForm>
            <CIStep
              isNewStep={isNewStep}
              readonly={readonly}
              enableFields={{
                description: {},
                'spec.connectorRef': {
                  label: <Text margin={{ bottom: 'xsmall' }}>{getString('pipelineSteps.connectorLabel')}</Text>,
                  type: Connectors.ARTIFACTORY
                },
                'spec.sourcePath': {},
                'spec.target': { tooltipId: 'jFrogArtifactoryTarget' }
              }}
              expressions={expressions}
              formik={formik}
            />
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <>
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

export const JFrogArtifactoryStepBaseWithRef = React.forwardRef(JFrogArtifactoryStepBase)
