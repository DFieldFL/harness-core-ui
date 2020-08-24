import React from 'react'
import { Tabs, Tab, Formik, Text, MultiTypeInput } from '@wings-software/uikit'
import { FormGroup } from '@blueprintjs/core'
import type { ExecutionWrapper } from 'services/cd-ng'
import { StepWidget } from 'modules/common/exports'
import factory from 'modules/cd/common/PipelineSteps/PipelineStepFactory'
import { StepType } from 'modules/cd/common/PipelineSteps/PipelineStepInterface'
import i18n from './StepCommands.18n'
import { RightBar } from '../RightBar/RightBar'
import css from './StepCommands.module.scss'

export interface StepCommandsProps {
  step: ExecutionWrapper
  onChange: (step: ExecutionWrapper) => void
  isStepGroup: boolean
}

const AdvancedStep: React.FC<StepCommandsProps> = ({ step }) => {
  return (
    <Formik
      onSubmit={values => {
        JSON.stringify(values)
      }}
      initialValues={{ condition: step.condition, failureStrategy: step.failureStrategy }}
    >
      {() => {
        return (
          <>
            <Text className={css.boldLabel} font={{ size: 'medium' }}>
              {i18n.skipCondition}
            </Text>
            <FormGroup labelFor="condition" label={i18n.specifyConditionToSkipThisStep}>
              <MultiTypeInput />
            </FormGroup>
            <Text className={css.boldLabel} font={{ size: 'medium' }}>
              {i18n.failureStrategy}
            </Text>
            <FormGroup labelFor="failureStrategy" label={i18n.ifCondition}>
              <MultiTypeInput />
            </FormGroup>
            <FormGroup labelFor="failureStrategy" label={i18n.do}>
              <MultiTypeInput />
            </FormGroup>
            <Text className={css.boldLabel} font={{ size: 'medium' }}>
              {i18n.output}
            </Text>
            <Text>$stages.dev.step.output</Text>
          </>
        )
      }}
    </Formik>
  )
}

export const StepCommands: React.FC<StepCommandsProps> = ({ step, onChange, isStepGroup }) => {
  return (
    <div className={css.stepCommand}>
      <div className={css.stepTabs}>
        <Tabs id="step-commands">
          <Tab
            id="step-configuration"
            title={isStepGroup ? i18n.stepGroupConfiguration : i18n.stepConfiguration}
            panel={
              <StepWidget
                factory={factory}
                initialValues={step}
                onUpdate={onChange}
                type={isStepGroup ? StepType.StepGroup : step.type}
              />
            }
          />
          <Tab
            id="advanced"
            title={i18n.advanced}
            panel={<AdvancedStep step={step} onChange={onChange} isStepGroup={isStepGroup} />}
          />
        </Tabs>
      </div>
      <RightBar />
    </div>
  )
}
