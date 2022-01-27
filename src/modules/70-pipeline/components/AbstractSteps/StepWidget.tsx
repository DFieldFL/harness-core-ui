/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { MultiTypeInputType, Text } from '@wings-software/uicore'

import { String } from 'framework/strings'
import type { AbstractStepFactory } from './AbstractStepFactory'
import { StepViewType } from './Step'
import type { StepProps, StepFormikFowardRef } from './Step'
import type { StepType } from '../PipelineSteps/PipelineStepInterface'

export interface StepWidgetProps<T = unknown, U = unknown> extends Omit<StepProps<T, U>, 'path'> {
  factory: AbstractStepFactory
  type: StepType
  isNewStep?: boolean
  allValues?: T
  template?: T
  path?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onUpdate?: (data: any) => void
  onChange?: (data: any) => void
  readonly?: boolean
  allowableTypes: MultiTypeInputType[]
}

export function StepWidget<T = unknown, U = unknown>(
  {
    factory,
    type,
    initialValues,
    allValues,
    template,
    isNewStep = true,
    path = '',
    stepViewType = StepViewType.Edit,
    onUpdate,
    onChange,
    readonly,
    allowableTypes,
    customStepProps
  }: StepWidgetProps<T, U>,
  formikRef: StepFormikFowardRef<T>
): JSX.Element | null {
  const step = factory?.getStep<T>(type)
  if (!step) {
    return __DEV__ ? <Text intent="warning">Step not found</Text> : null
  } else if (stepViewType === StepViewType.InputVariable && !step.hasStepVariables) {
    return __DEV__ ? (
      <Text intent="warning">
        <String stringID="wip" />
      </Text>
    ) : null
  } else {
    const values = step?.getDefaultValues(initialValues, stepViewType)
    return (
      <>
        {step.renderStep({
          initialValues: values,
          formikRef,
          onUpdate,
          onChange,
          isNewStep,
          stepViewType,
          inputSetData: { template, allValues, path, readonly },
          factory,
          readonly,
          path,
          customStepProps,
          allowableTypes
        })}
      </>
    )
  }
}

export const StepWidgetWithFormikRef = React.forwardRef(StepWidget)
