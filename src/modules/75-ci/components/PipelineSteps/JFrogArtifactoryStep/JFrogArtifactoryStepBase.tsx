/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, Formik, FormikForm, Accordion, Color, Container } from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import get from 'lodash/get'
import type { K8sDirectInfraYaml } from 'services/ci'
import { Connectors } from '@connectors/constants'
import type { StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { setFormikRef } from '@pipeline/components/AbstractSteps/Step'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useStrings } from 'framework/strings'

import StepCommonFields /*,{ /*usePullOptions }*/ from '@ci/components/PipelineSteps/StepCommonFields/StepCommonFields'
import {
  getInitialValuesInCorrectFormat,
  getFormValuesInCorrectFormat
} from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { validate } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'
import { transformValuesFieldsConfig, editViewValidateFieldsConfig } from './JFrogArtifactoryStepFunctionConfigs'
import type {
  JFrogArtifactoryStepProps,
  JFrogArtifactoryStepData,
  JFrogArtifactoryStepDataUI
} from './JFrogArtifactoryStep'
import { CIStep } from '../CIStep/CIStep'
import { useGetPropagatedStageById } from '../CIStep/StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const JFrogArtifactoryStepBase = (
  { initialValues, onUpdate, isNewStep, readonly, stepViewType, allowableTypes, onChange }: JFrogArtifactoryStepProps,
  formikRef: StepFormikFowardRef<JFrogArtifactoryStepData>
): JSX.Element => {
  const {
    state: {
      selectionState: { selectedStageId }
    }
  } = usePipelineContext()

  const { getString } = useStrings()

  const currentStage = useGetPropagatedStageById(selectedStageId || '')

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const pullOptions = usePullOptions()

  // TODO: Right now we do not support Image Pull Policy but will do in the future
  // const values = getInitialValuesInCorrectFormat<JFrogArtifactoryStepData, JFrogArtifactoryStepDataUI>(initialValues, transformValuesFieldsConfig, {
  //   pullOptions
  // })

  const buildInfrastructureType = get(currentStage, 'stage.spec.infrastructure.type') as K8sDirectInfraYaml['type']

  return (
    <Formik
      initialValues={getInitialValuesInCorrectFormat<JFrogArtifactoryStepData, JFrogArtifactoryStepDataUI>(
        initialValues,
        transformValuesFieldsConfig
      )}
      formName="jfrogArt"
      validate={valuesToValidate => {
        const schemaValues = getFormValuesInCorrectFormat<JFrogArtifactoryStepDataUI, JFrogArtifactoryStepData>(
          valuesToValidate,
          transformValuesFieldsConfig
        )
        onChange?.(schemaValues)
        return validate(
          valuesToValidate,
          editViewValidateFieldsConfig,
          {
            initialValues,
            steps: currentStage?.stage?.spec?.execution?.steps || {},
            serviceDependencies: currentStage?.stage?.spec?.serviceDependencies || {},
            getString
          },
          stepViewType
        )
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
                name: {},
                description: {},
                'spec.connectorRef': {
                  label: (
                    <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                      {getString('ci.artifactoryConnectorLabel')}
                    </Text>
                  ),
                  type: Connectors.ARTIFACTORY
                },
                'spec.sourcePath': {},
                'spec.target': { tooltipId: 'jFrogArtifactoryTarget' }
              }}
              stepViewType={stepViewType}
              allowableTypes={allowableTypes}
              formik={formik}
            />
            <Accordion className={css.accordion}>
              <Accordion.Panel
                id="optional-config"
                summary={getString('common.optionalConfig')}
                details={
                  <Container margin={{ top: 'medium' }}>
                    <StepCommonFields
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

export const JFrogArtifactoryStepBaseWithRef = React.forwardRef(JFrogArtifactoryStepBase)
