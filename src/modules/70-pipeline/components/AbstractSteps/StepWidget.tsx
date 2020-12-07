import React from 'react'
import { Text } from '@wings-software/uikit'
import type { AbstractStepFactory } from './AbstractStepFactory'
import i18n from './StepWidget.i18n'
import { StepViewType } from './Step'

export interface StepWidgetProps<T extends object = {}> {
  factory: AbstractStepFactory
  type: string
  initialValues: T
  allValues?: T
  template?: T
  stepViewType?: StepViewType
  onUpdate?: (data: T) => void
}

export function StepWidget<T extends object = {}>({
  factory,
  type,
  initialValues,
  allValues,
  template,
  stepViewType = StepViewType.Edit,
  onUpdate
}: StepWidgetProps<T>): JSX.Element {
  const step = factory.getStep<T>(type)

  if (!step) {
    return <Text intent="warning">{i18n.invalidStep}</Text>
  } else {
    const values = step?.getDefaultValues(initialValues, stepViewType)
    return <>{step.renderStep(values, onUpdate, stepViewType, template, allValues)}</>
  }
}
