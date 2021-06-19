import React from 'react'
import { Color, Container, Formik, Layout } from '@wings-software/uicore'
import { debounce, noop } from 'lodash-es'
import type { FormikProps } from 'formik'
import type { StageElementWrapper, StageWhenCondition } from 'services/cd-ng'
import { StepMode as Modes } from '@pipeline/utils/stepUtils'
import ConditionalExecutionHeader from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionHeader'
import ConditionalExecutionStatus from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionStatus'
import ConditionalExecutionCondition from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionCondition'
import {
  ConditionalExecutionOption,
  PipelineOrStageStatus
} from '../../PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils'

export interface ConditionalExecutionProps {
  selectedStage: StageElementWrapper
  isReadonly: boolean

  onUpdate(when: StageWhenCondition): void
}

export default function ConditionalExecution(props: ConditionalExecutionProps): React.ReactElement {
  const {
    selectedStage: { stage },
    onUpdate,
    isReadonly
  } = props

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = React.useCallback(
    debounce(({ status, enableJEXL, condition }: ConditionalExecutionOption): void => {
      onUpdate({
        pipelineStatus: status,
        ...(enableJEXL &&
          !!condition?.trim() && {
            condition: condition?.trim()
          })
      })
    }, 300),
    [onUpdate]
  )

  return (
    <Formik
      initialValues={{
        status: stage.when?.pipelineStatus || PipelineOrStageStatus.SUCCESS,
        enableJEXL: !!stage.when?.condition,
        condition: stage.when?.condition
      }}
      formName="condExecStudio"
      onSubmit={noop}
      validate={debouncedUpdate}
    >
      {(formikProps: FormikProps<ConditionalExecutionOption>) => {
        return (
          <Container width={846} padding={{ left: 'medium', right: 'huge' }}>
            <ConditionalExecutionHeader mode={Modes.STAGE} />
            <Layout.Horizontal
              padding={{ top: 'xxlarge', bottom: 'medium' }}
              margin={{ top: 'medium' }}
              border={{ top: true, color: Color.GREY_200 }}
            >
              <Container width={'48%'} padding={{ right: 'xxlarge' }} border={{ right: true, color: Color.GREY_200 }}>
                <ConditionalExecutionStatus formikProps={formikProps} mode={Modes.STAGE} isReadonly={isReadonly} />
              </Container>
              <Container width={'52%'} padding={{ left: 'xxlarge' }}>
                <ConditionalExecutionCondition formikProps={formikProps} mode={Modes.STAGE} isReadonly={isReadonly} />
              </Container>
            </Layout.Horizontal>
          </Container>
        )
      }}
    </Formik>
  )
}
