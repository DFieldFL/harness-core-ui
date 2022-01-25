/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { Types as TransformValuesTypes } from '@pipeline/components/PipelineSteps/Steps/StepsTransformValuesUtils'
import { Types as ValidationFieldTypes } from '@pipeline/components/PipelineSteps/Steps/StepsValidateUtils'

const specConnectorRef = 'spec.connectorRef'
const specImage = 'spec.image'
const specPrivileged = 'spec.privileged'
const specSettings = 'spec.settings'
const specRunAsUser = 'spec.runAsUser'

export const transformValuesFieldsConfig = [
  {
    name: 'identifier',
    type: TransformValuesTypes.Text
  },
  {
    name: 'name',
    type: TransformValuesTypes.Text
  },
  {
    name: 'description',
    type: TransformValuesTypes.Text
  },
  {
    name: specConnectorRef,
    type: TransformValuesTypes.Text
  },
  {
    name: specImage,
    type: TransformValuesTypes.Text
  },
  {
    name: specPrivileged,
    type: TransformValuesTypes.Boolean
  },
  {
    name: 'spec.reportPaths',
    type: TransformValuesTypes.ReportPaths
  },
  {
    name: specSettings,
    type: TransformValuesTypes.Map
  },
  {
    name: 'spec.imagePullPolicy',
    type: TransformValuesTypes.ImagePullPolicy
  },
  {
    name: specRunAsUser,
    type: TransformValuesTypes.Text
  },
  {
    name: 'spec.limitMemory',
    type: TransformValuesTypes.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: TransformValuesTypes.LimitCPU
  },
  {
    name: 'timeout',
    type: TransformValuesTypes.Text
  }
]

export const editViewValidateFieldsConfig = [
  {
    name: 'identifier',
    type: ValidationFieldTypes.Identifier,
    label: 'identifier',
    isRequired: true
  },
  {
    name: 'name',
    type: ValidationFieldTypes.Name,
    label: 'pipelineSteps.stepNameLabel',
    isRequired: true
  },
  {
    name: specConnectorRef,
    type: ValidationFieldTypes.Text,
    label: 'pipelineSteps.connectorLabel',
    isRequired: true
  },
  {
    name: specImage,
    type: ValidationFieldTypes.Text,
    label: 'imageLabel',
    isRequired: true
  },
  {
    name: specPrivileged,
    type: ValidationFieldTypes.Boolean
  },
  {
    name: specSettings,
    type: ValidationFieldTypes.Map
  },
  {
    label: 'pipeline.stepCommonFields.runAsUser',
    name: specRunAsUser,
    type: ValidationFieldTypes.Numeric
  },
  {
    name: 'spec.limitMemory',
    type: ValidationFieldTypes.LimitMemory
  },
  {
    name: 'spec.limitCPU',
    type: ValidationFieldTypes.LimitCPU
  },
  {
    name: 'timeout',
    type: ValidationFieldTypes.Timeout
  }
]

export function getInputSetViewValidateFieldsConfig(
  isRequired = true
): Array<{ name: string; type: ValidationFieldTypes; label?: string; isRequired?: boolean }> {
  return [
    {
      name: specConnectorRef,
      type: ValidationFieldTypes.Text,
      label: 'pipelineSteps.connectorLabel',
      isRequired
    },
    {
      name: specImage,
      type: ValidationFieldTypes.Text,
      label: 'imageLabel',
      isRequired
    },
    {
      name: specPrivileged,
      type: ValidationFieldTypes.Boolean
    },
    {
      name: specSettings,
      type: ValidationFieldTypes.Map
    },
    {
      name: 'spec.imagePullPolicy',
      type: ValidationFieldTypes.ImagePullPolicy
    },
    {
      name: specRunAsUser,
      type: ValidationFieldTypes.Numeric
    },
    {
      name: 'spec.resources.limits.memory',
      type: ValidationFieldTypes.LimitMemory
    },
    {
      name: 'spec.resources.limits.cpu',
      type: ValidationFieldTypes.LimitCPU
    },
    {
      name: 'timeout',
      type: ValidationFieldTypes.Timeout
    }
  ]
}
