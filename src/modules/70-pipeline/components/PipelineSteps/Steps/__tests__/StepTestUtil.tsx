import React from 'react'
import { Button, Formik, Text } from '@wings-software/uicore'
import { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepWidgetWithFormikRef, StepWidgetProps } from '@pipeline/components/AbstractSteps/StepWidget'
import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { StepViewType, StepFormikFowardRef } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/strings'

class StepTestFactory extends AbstractStepFactory {
  protected type = 'test-factory'
}

export const factory = new StepTestFactory()

const FormikTestWrapper: React.FC<StepWidgetProps> = props => {
  const { getString } = useStrings()
  const stepRef = React.useRef(null)
  return (
    <Formik
      initialValues={props.initialValues}
      validate={values => {
        return (
          factory.getStep(props.type)?.validateInputSet({
            data: values,
            template: props.template,
            getString,
            viewType: StepViewType.DeploymentForm
          }) || {}
        )
      }}
      onSubmit={data => props.onUpdate?.(data)}
    >
      {({ errors, submitForm }) => (
        <>
          <StepWidgetWithFormikRef ref={stepRef} {...props} />
          <Text>Errors</Text>
          <pre>{JSON.stringify(errors, null, 2)}</pre>
          <Button
            text="Submit"
            intent="primary"
            onClick={e => {
              e.stopPropagation()
              submitForm()
            }}
          />
        </>
      )}
    </Formik>
  )
}

export interface TestStepWidgetProps extends Omit<StepWidgetProps, 'factory'> {
  testWrapperProps?: TestWrapperProps
}

export function TestStepWidgetWithoutRef(props: TestStepWidgetProps, ref: StepFormikFowardRef): React.ReactElement {
  const type = props.stepViewType
  return (
    <TestWrapper {...props.testWrapperProps}>
      {type === StepViewType.InputSet || type === StepViewType.DeploymentForm ? (
        <FormikTestWrapper factory={factory} {...props} />
      ) : (
        <StepWidgetWithFormikRef ref={ref} factory={factory} {...props} />
      )}
    </TestWrapper>
  )
}

export const TestStepWidget = React.forwardRef(TestStepWidgetWithoutRef)
