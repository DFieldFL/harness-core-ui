import React from 'react'
import { Tabs, Tab, Button } from '@wings-software/uicore'
import { Expander } from '@blueprintjs/core'
import cx from 'classnames'
import type { FormikProps } from 'formik'
import { isEmpty } from 'lodash-es'

import { useStrings } from 'framework/strings'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { StepWidgetWithFormikRef } from '@pipeline/components/AbstractSteps/StepWidget'
import { AdvancedStepsWithRef } from '@pipeline/components/PipelineSteps/AdvancedSteps/AdvancedSteps'
import type { PipelineStep } from '@pipeline/components/PipelineSteps/PipelineStep'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { StageType } from '@pipeline/utils/stageHelpers'
import type { StepElementConfig } from 'services/cd-ng'
import type { StepCommandsProps } from './StepCommandTypes'
import css from './StepCommands.module.scss'

export type StepFormikRef<T = unknown> = {
  isDirty(): FormikProps<T>['dirty'] | undefined
  submitForm: FormikProps<T>['submitForm']
  getErrors(): FormikProps<T>['errors']
  setFieldError(key: string, error: string): void
  getValues(): T
}

export type StepCommandsRef<T = unknown> =
  | ((instance: StepFormikRef<T> | null) => void)
  | React.MutableRefObject<StepFormikRef<T> | null>
  | null

enum StepCommandTabs {
  StepConfiguration = 'StepConfiguration',
  Advanced = 'Advanced'
}

export function StepCommands(
  props: StepCommandsProps & { checkDuplicateStep?: () => boolean },
  ref: StepCommandsRef
): React.ReactElement {
  const {
    step,
    onChange,
    onUseTemplate,
    isStepGroup,
    isReadonly,
    stepsFactory,
    hiddenPanels,
    checkDuplicateStep,
    hasStepGroupAncestor,
    withoutTabs,
    isNewStep = true,
    stageType = StageType.DEPLOY
  } = props
  const { getString } = useStrings()
  const templatesEnabled = useFeatureFlag(FeatureFlag.NG_TEMPLATES)
  const [activeTab, setActiveTab] = React.useState(StepCommandTabs.StepConfiguration)
  const stepRef = React.useRef<FormikProps<unknown> | null>(null)
  const advancedConfRef = React.useRef<FormikProps<unknown> | null>(null)
  const isTemplateStep = (step as any)['template'] // TODO: fix this check later when BE is finalized

  async function handleTabChange(newTab: StepCommandTabs, prevTab: StepCommandTabs): Promise<void> {
    if (prevTab === StepCommandTabs.StepConfiguration && stepRef.current) {
      if (checkDuplicateStep?.()) {
        return Promise.resolve()
      }
      // please do not remove the await below.
      // This is required for errors to be populated correctly
      await stepRef.current.submitForm()

      if (isEmpty(stepRef.current.errors)) {
        setActiveTab(newTab)
      }
    } else if (prevTab === StepCommandTabs.Advanced && advancedConfRef.current) {
      // please do not remove the await below.
      // This is required for errors to be populated correctly
      await advancedConfRef.current.submitForm()

      if (isEmpty(advancedConfRef.current.errors)) {
        setActiveTab(newTab)
      }
    }
  }

  React.useImperativeHandle(ref, () => ({
    setFieldError(fieldName: string, error: string) {
      if (activeTab === StepCommandTabs.StepConfiguration && stepRef.current) {
        stepRef.current.setFieldError(fieldName, error)
      }
    },
    isDirty() {
      if (activeTab === StepCommandTabs.StepConfiguration && stepRef.current) {
        return stepRef.current.dirty
      }

      if (activeTab === StepCommandTabs.Advanced && advancedConfRef.current) {
        return advancedConfRef.current.dirty
      }
    },
    submitForm() {
      if (activeTab === StepCommandTabs.StepConfiguration && stepRef.current) {
        return stepRef.current.submitForm()
      }

      if (activeTab === StepCommandTabs.Advanced && advancedConfRef.current) {
        return advancedConfRef.current.submitForm()
      }
    },
    getErrors() {
      return activeTab === StepCommandTabs.StepConfiguration && stepRef.current
        ? stepRef.current.errors
        : activeTab === StepCommandTabs.Advanced && advancedConfRef.current
        ? advancedConfRef.current.errors
        : {}
    },
    getValues() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stepObj = isStepGroup
        ? (stepsFactory.getStep(StepType.StepGroup) as PipelineStep<any>)
        : (stepsFactory.getStep((step as StepElementConfig).type) as PipelineStep<any>)
      return activeTab === StepCommandTabs.StepConfiguration && stepRef.current
        ? stepObj.processFormData(stepRef.current.values)
        : activeTab === StepCommandTabs.Advanced && advancedConfRef.current
        ? advancedConfRef.current.values
        : {}
    }
  }))

  const getStepWidgetWithFormikRef = () => {
    const stepType: StepType = isStepGroup
      ? StepType.StepGroup
      : isTemplateStep
      ? StepType.Template
      : ((step as StepElementConfig).type as StepType)

    return (
      <StepWidgetWithFormikRef
        factory={stepsFactory}
        initialValues={step}
        readonly={isReadonly}
        isNewStep={isNewStep}
        onUpdate={onChange}
        type={stepType}
        ref={stepRef}
      />
    )
  }

  if (withoutTabs) {
    return <div className={cx(css.stepCommand, css.withoutTabs)}>{getStepWidgetWithFormikRef()}</div>
  }

  return (
    <div className={css.stepCommand}>
      <div className={cx(css.stepTabs, { stepTabsAdvanced: activeTab === StepCommandTabs.Advanced })}>
        <Tabs id="step-commands" selectedTabId={activeTab} onChange={handleTabChange}>
          <Tab
            id={StepCommandTabs.StepConfiguration}
            title={isStepGroup ? getString('stepGroupConfiguration') : getString('stepConfiguration')}
            panel={getStepWidgetWithFormikRef()}
          />
          <Tab
            id={StepCommandTabs.Advanced}
            title={getString('advancedTitle')}
            panel={
              <AdvancedStepsWithRef
                step={step}
                isReadonly={isReadonly}
                stepsFactory={stepsFactory}
                onChange={onChange}
                hiddenPanels={hiddenPanels}
                isStepGroup={isStepGroup}
                hasStepGroupAncestor={hasStepGroupAncestor}
                ref={advancedConfRef}
                stageType={stageType}
              />
            }
          />
          {templatesEnabled && (
            <>
              <Expander />
              <div>
                <Button
                  icon="library"
                  minimal
                  small
                  onClick={() => {
                    onUseTemplate?.(step)
                  }}
                  className={css.useTemplateBtn}
                >
                  {getString('common.useTemplate')}
                </Button>
                <Button withoutCurrentColor icon="upload-box" className={css.saveAsTempalteBtn} minimal small />
              </div>
            </>
          )}
        </Tabs>
      </div>
    </div>
  )
}

export const StepCommandsWithRef = React.forwardRef(StepCommands)
