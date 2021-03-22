import React, { useCallback, useRef } from 'react'
import cx from 'classnames'
import { Formik } from 'formik'
import { cloneDeep, debounce } from 'lodash-es'
import { Accordion, Container, FormikForm, FormInput, Heading } from '@wings-software/uicore'
import Timeline from '@common/components/Timeline/Timeline'
import { Description } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { useStrings } from 'framework/exports'
import { PipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { isDuplicateStageId } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import type { NGVariable, StageElementConfig, StageElementWrapper } from 'services/cd-ng'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import SkipConditionsPanel from '@pipeline/components/PipelineSteps/AdvancedSteps/SkipConditionsPanel/SkipConditionsPanel'
import { Modes } from '@pipeline/components/PipelineSteps/AdvancedSteps/common'
import { StageTypes } from '@pipeline/components/PipelineStudio/Stages/StageTypes'
import { ApprovalTypeCards } from './ApprovalTypeCards'
import type { ApprovalStageOverviewProps } from './types'
import css from './ApprovalStageOverview.module.scss'

export const ApprovalStageOverview: React.FC<ApprovalStageOverviewProps> = props => {
  const {
    state: {
      pipeline: { stages = [] },
      pipelineView: {
        splitViewData: { selectedStageId }
      }
    },
    stepsFactory,
    updateStage,
    getStageFromPipeline
  } = React.useContext(PipelineContext)
  const { variablesPipeline, metadataMap } = usePipelineVariables()
  const { stage } = getStageFromPipeline(selectedStageId || '')
  const cloneOriginalData = cloneDeep(stage)

  const { getString } = useStrings()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const onTimelineItemClick = (id: string): void => {
    const element = document.querySelector(`#${id}`)
    if (scrollRef.current && element) {
      const elementTop = element.getBoundingClientRect().top
      const parentTop = scrollRef.current.getBoundingClientRect().top
      scrollRef.current.scrollTo({ top: elementTop - parentTop, behavior: 'smooth' })
    }
  }

  const updateStageDebounced = useCallback(
    debounce((values: StageElementWrapper): void => {
      // approvalType is just used in the UI, to populate the default steps for different approval types
      // For BE, the stage type is always 'Approval' and approval type is defined inside the step
      delete values.spec.approvalType
      values.type = StageTypes.APPROVAL
      updateStage({ ...stage?.stage, ...values })
    }, 300),
    [stage?.stage, updateStage]
  )

  const getTimelineNodes = useCallback(
    () => [
      {
        label: 'Stage Overview',
        id: 'stageOverview'
      },
      {
        label: 'Stage Variables',
        id: 'variables-panel'
      },
      {
        label: 'Skip Condition',
        id: 'skipCondition-panel'
      }
    ],
    []
  )

  return (
    <div className={css.approvalStageOverviewWrapper}>
      <Timeline onNodeClick={onTimelineItemClick} nodes={getTimelineNodes()} />
      <div className={css.content} ref={scrollRef}>
        <Accordion className={cx(css.sectionCard, css.shadow)} activeId="stageOverview">
          <Accordion.Panel
            id="stageOverview"
            summary={'Overview'}
            addDomId={true}
            details={
              <Container padding="medium">
                <Formik
                  enableReinitialize
                  initialValues={{
                    identifier: cloneOriginalData?.stage.identifier,
                    name: cloneOriginalData?.stage.name,
                    description: cloneOriginalData?.stage.description,
                    approvalType: cloneOriginalData?.stage.approvalType,
                    skipCondition: cloneOriginalData?.stage.skipCondition
                  }}
                  validationSchema={{}}
                  validate={values => {
                    const errors: { name?: string } = {}
                    if (isDuplicateStageId(values.identifier, stages)) {
                      errors.name = getString('validation.identifierDuplicate')
                    }
                    if (cloneOriginalData) {
                      updateStageDebounced({
                        ...cloneOriginalData.stage,
                        name: values?.name,
                        identifier: values?.identifier,
                        description: values?.description,
                        skipCondition: values?.skipCondition,
                        spec: {
                          ...cloneOriginalData.spec,
                          approvalType: values?.approvalType
                        }
                      })
                    }
                    return errors
                  }}
                  onSubmit={values => {
                    if (cloneOriginalData) {
                      updateStageDebounced({
                        ...cloneOriginalData.stage,
                        name: values?.name,
                        identifier: values?.identifier,
                        description: values?.description,
                        skipCondition: values?.skipCondition,
                        spec: {
                          ...cloneOriginalData.spec,
                          approvalType: values?.approvalType
                        }
                      })
                    }
                  }}
                >
                  {formikProps => (
                    <FormikForm>
                      <FormInput.InputWithIdentifier
                        inputLabel={getString('stageNameLabel')}
                        isIdentifierEditable={false}
                      />
                      <Description />
                      <Heading font={{ weight: 'semi-bold' }} level={3}>
                        {getString('approvalStage.approvalTypeHeading')}
                      </Heading>
                      <ApprovalTypeCards formikProps={formikProps} />
                    </FormikForm>
                  )}
                </Formik>
              </Container>
            }
          />
        </Accordion>

        <Accordion className={cx(css.sectionCard, css.shadow)} activeId="variables">
          <Accordion.Panel
            id="variables"
            summary={'Variables'}
            addDomId={true}
            details={
              <StepWidget<CustomVariablesData>
                factory={stepsFactory}
                initialValues={{
                  variables: (cloneOriginalData?.stage as StageElementConfig)?.variables || [],
                  canAddVariable: true
                }}
                type={StepType.CustomVariable}
                stepViewType={StepViewType.StageVariable}
                onUpdate={({ variables }: CustomVariablesData) => {
                  updateStageDebounced({
                    ...cloneOriginalData?.stage,
                    variables
                  })
                }}
                customStepProps={{
                  yamlProperties:
                    getStageFromPipeline(
                      cloneOriginalData?.stage?.identifier,
                      variablesPipeline
                    )?.stage?.variables?.map?.(
                      (variable: NGVariable) => metadataMap[variable.value || '']?.yamlProperties || {}
                    ) || []
                }}
              />
            }
          />
        </Accordion>

        <Accordion className={cx(css.sectionCard, css.shadow)} activeId="skipCondition">
          <Accordion.Panel
            id="skipCondition"
            summary={'Skip Condition'}
            addDomId={true}
            details={
              <Formik
                initialValues={{
                  skipCondition: cloneOriginalData?.stage?.skipCondition || ''
                }}
                validate={values => {
                  if (cloneOriginalData) {
                    updateStageDebounced({
                      ...cloneOriginalData.stage,
                      skipCondition: values?.skipCondition
                    })
                  }
                }}
                onSubmit={values => {
                  updateStageDebounced({
                    ...cloneOriginalData?.stage,
                    skipCondition: values?.skipCondition
                  })
                }}
              >
                <SkipConditionsPanel mode={Modes.STAGE} />
              </Formik>
            }
          />
        </Accordion>
        {props.children}
      </div>
    </div>
  )
}
