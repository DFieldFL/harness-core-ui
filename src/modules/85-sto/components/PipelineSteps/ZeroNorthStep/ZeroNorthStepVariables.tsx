import React from 'react'
import type { VariableMergeServiceResponse } from 'services/pipeline-ng'
import { VariablesListTable } from '@pipeline/components/VariablesListTable/VariablesListTable'
import { flatObject } from '@ci/components/PipelineSteps/StepsFlatObject'
import type { ZeroNorthStepData } from './ZeroNorthStep'

export interface ZeroNorthStepVariablesProps {
  initialValues: ZeroNorthStepData
  stageIdentifier: string
  onUpdate?(data: ZeroNorthStepData): void
  metadataMap: Required<VariableMergeServiceResponse>['metadataMap']
  variablesData: ZeroNorthStepData
}

export const ZeroNorthStepVariables: React.FC<ZeroNorthStepVariablesProps> = ({
  variablesData,
  metadataMap,
  initialValues
}) => <VariablesListTable data={flatObject(variablesData)} originalData={initialValues} metadataMap={metadataMap} />
