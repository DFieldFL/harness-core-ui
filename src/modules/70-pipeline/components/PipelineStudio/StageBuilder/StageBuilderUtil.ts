/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { flatMap, findIndex, cloneDeep, set } from 'lodash-es'
import { Color, Utils } from '@wings-software/uicore'
import { v4 as uuid } from 'uuid'
import type { NodeModelListener, LinkModelListener, DiagramEngine } from '@projectstorm/react-diagrams-core'
import produce from 'immer'
import { parse } from 'yaml'
import type {
  StageElementWrapperConfig,
  PageConnectorResponse,
  PipelineInfoConfig,
  DeploymentStageConfig
} from 'services/cd-ng'
import type * as Diagram from '@pipeline/components/Diagram'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import type { StageType } from '@pipeline/utils/stageHelpers'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import type { TemplateSummaryResponse } from 'services/template-ng'
import type { SelectorData } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { EmptyStageName } from '../PipelineConstants'
import type { PipelineContextInterface, StagesMap } from '../PipelineContext/PipelineContext'
import { getStageFromPipeline } from '../PipelineContext/helpers'

export interface StageState {
  isConfigured: boolean
  stage: StageElementWrapperConfig
}

export interface PopoverData {
  data?: StageElementWrapperConfig
  isStageView: boolean
  contextType?: string
  groupStages?: StageElementWrapperConfig[]
  isGroupStage?: boolean
  stagesMap: StagesMap
  groupSelectedStageId?: string
  isParallel?: boolean
  event?: Diagram.DefaultNodeEvent
  addStage?: (
    newStage: StageElementWrapperConfig,
    isParallel?: boolean,
    event?: Diagram.DefaultNodeEvent,
    insertAt?: number,
    openSetupAfterAdd?: boolean,
    pipeline?: PipelineInfoConfig
  ) => void
  onSubmitPrimaryData?: (values: StageElementWrapperConfig, identifier: string) => void
  onClickGroupStage?: (stageId: string, type: StageType) => void
  renderPipelineStage: PipelineContextInterface['renderPipelineStage']
  isHoverView?: boolean
  templateTypes: { [key: string]: string }
  setTemplateTypes: (data: { [key: string]: string }) => void
  openTemplateSelector: (selectorData: SelectorData) => void
  closeTemplateSelector: () => void
}

export const getStageIndexByIdentifier = (
  pipeline: PipelineInfoConfig,
  identifier?: string
): { stageIndex: number; parallelStageIndex: number } => {
  const stageDetails = { stageIndex: -1, parallelStageIndex: -1 }
  if (pipeline?.stages) {
    for (const [index, stage] of pipeline.stages.entries()) {
      if (stage?.stage?.identifier === identifier) {
        stageDetails.stageIndex = index
        break
      }
      if (stage?.parallel) {
        const targetStageIndex = stage.parallel.findIndex(pstage => pstage.stage?.identifier === identifier)
        if (targetStageIndex > -1) {
          stageDetails.stageIndex = index
          stageDetails.parallelStageIndex = targetStageIndex
          break
        }
      }
    }
  }
  return stageDetails
}

export const getNewStageFromTemplate = (
  template: TemplateSummaryResponse,
  clearDefaultValues = false
): StageElementWrapperConfig => {
  return {
    stage: {
      ...parse(template?.yaml || '')?.template.spec,
      name: clearDefaultValues ? '' : EmptyStageName,
      identifier: clearDefaultValues ? '' : uuid()
    }
  }
}

export const getNewStageFromType = (type: string, clearDefaultValues = false): StageElementWrapperConfig => {
  // TODO: replace string with type
  if (type === 'ci') {
    return {
      stage: {
        name: clearDefaultValues ? '' : EmptyStageName,
        identifier: clearDefaultValues ? '' : uuid(),
        description: '',
        type: type,
        spec: {
          serviceDependencies: [],
          execution: {}
        } as any
      }
    }
  }

  return {
    stage: {
      name: clearDefaultValues ? '' : EmptyStageName,
      identifier: clearDefaultValues ? '' : uuid(),
      description: '',
      type: type,
      spec: {}
    }
  }
}

export interface Listeners {
  nodeListeners: NodeModelListener
  linkListeners: LinkModelListener
}

export const EmptyNodeSeparator = '$node$'

export const getCommonStyles = (isSelected: boolean): React.CSSProperties => ({
  background: isSelected ? 'var(--pipeline-selected-node)' : Utils.getRealCSSColor(Color.WHITE),
  borderColor: isSelected ? 'var(--diagram-selected)' : 'var(--pipeline-grey-border)',
  borderWidth: isSelected ? '2px' : '1px'
})

export const getStatus = (
  connectorRef: string,
  fetchedConnectorResponse: PageConnectorResponse | undefined,
  accountId: string
): { status?: string; color: string } => {
  if (!connectorRef || !fetchedConnectorResponse) {
    return { status: '', color: '' }
  }

  const connectorScope = getScopeFromValue(connectorRef)
  const connector = getIdentifierFromValue(connectorRef)
  const filteredConnector = fetchedConnectorResponse?.content?.find(item => item.connector?.identifier === connector)
  const scope = getScopeFromDTO({
    accountIdentifier: accountId,
    orgIdentifier: filteredConnector?.connector?.orgIdentifier,
    projectIdentifier: filteredConnector?.connector?.projectIdentifier
  })

  const status = scope === connectorScope ? filteredConnector?.status?.status : ''
  const color = status && status === 'FAILURE' ? Color.RED_500 : status ? Color.GREEN_500 : ''
  return { status, color }
}

export const getStageIndexFromPipeline = (data: PipelineInfoConfig, identifier?: string): { index: number } => {
  let _index = 0

  const { stages } = getFlattenedStages(data)

  _index = findIndex(stages, o => o.stage?.identifier === identifier)
  return { index: _index }
}

export const getFlattenedStages = (
  data: Partial<PipelineInfoConfig>
): {
  stages: StageElementWrapperConfig[]
} => {
  let stages = []
  stages = flatMap(data?.stages || [], (n: StageElementWrapperConfig) => {
    const k = []
    if (n.parallel) {
      k.push(...n['parallel'])
    } else {
      k.push(n)
    }
    return k
  })
  return { stages }
}

export const mayBeStripCIProps = (pipeline: PipelineInfoConfig): boolean => {
  // no CI stages exist
  const areCIStagesAbsent = pipeline?.stages?.every(stage => stage.stage?.type !== 'CI')
  if (areCIStagesAbsent) {
    const props = Object.keys(pipeline.properties || {})
    // figure out if only properties that are left is related to ci
    const isCIOnly = props.length === 1 && props[0] === 'ci'
    if (isCIOnly) {
      return delete pipeline.properties
    }
    // otherwise figure out if properties object has a ci prop
    const hasCI = props.some(prop => prop === 'ci')
    if (hasCI && pipeline.properties?.ci) {
      return delete pipeline.properties.ci
    }
  }
  return false
}

export const removeNodeFromPipeline = (
  nodeResponse: { stage?: StageElementWrapperConfig; parent?: StageElementWrapperConfig },
  data: PipelineInfoConfig,
  stageMap?: Map<string, StageState>,
  updateStateMap = true
): boolean => {
  const { stage: node, parent } = nodeResponse
  if (node && data.stages) {
    const index = data.stages.indexOf(node)
    if (index > -1) {
      data?.stages?.splice(index, 1)
      if (updateStateMap) {
        stageMap?.delete(node.stage?.identifier || '')

        data.stages?.map(currentStage => {
          const spec = currentStage.stage?.spec as DeploymentStageConfig
          if (spec?.serviceConfig?.useFromStage?.stage === node?.stage?.identifier) {
            spec.serviceConfig = {}
          }
        })
      }
      return true
    } else if (parent?.parallel) {
      const parallelIndex = parent.parallel?.indexOf(node)
      if (parallelIndex > -1) {
        parent.parallel.splice(parallelIndex, 1)
        if (parent.parallel.length === 0) {
          const emptyParallel = data?.stages?.indexOf(parent)
          if (emptyParallel !== undefined && emptyParallel > -1) {
            data?.stages?.splice(emptyParallel, 1)
          }
        } else if (parent.parallel.length === 1) {
          const oneStageParallel = data?.stages?.indexOf(parent)
          if (oneStageParallel !== undefined && oneStageParallel > -1) {
            data?.stages?.splice(oneStageParallel, 1, parent.parallel[0])
          }
        }
        if (updateStateMap) {
          stageMap?.delete(node.stage?.identifier || '')
        }
        return true
      }
    }
  }
  return false
}
export const getDependantStages = (pipeline: PipelineInfoConfig, node?: StageElementWrapper): string[] => {
  const dependantStages: string[] = []
  const flattenedStages = getFlattenedStages(pipeline).stages

  flattenedStages?.forEach(currentStage => {
    if (
      (currentStage.stage?.spec as DeploymentStageConfig)?.serviceConfig?.useFromStage?.stage ===
      node?.stage?.identifier
    ) {
      dependantStages.push(currentStage.stage?.name || '')
    }
  })
  return dependantStages
}
export const resetDiagram = (engine: DiagramEngine): void => {
  engine.getModel().setZoomLevel(100)
  engine.getModel().setOffset(0, 0)
  engine.repaintCanvas()
}

export const isDuplicateStageId = (id: string, stages: StageElementWrapperConfig[], updateMode?: boolean): boolean => {
  const flattenedStages = getFlattenedStages({
    stages
  })
  if (!updateMode) return flattenedStages.stages?.some(({ stage }) => stage?.identifier === id)
  let duplicatesCount = 0
  for (const stage of flattenedStages.stages) {
    if (stage.stage?.identifier === id) {
      duplicatesCount++
    }
  }
  return duplicatesCount > 1
}

export const getConnectorNameFromValue = (
  connectorRef: string,
  fetchedConnectorResponse: PageConnectorResponse | undefined
): string | undefined => {
  if (!connectorRef || !fetchedConnectorResponse) {
    return ''
  }

  const connector = getIdentifierFromValue(connectorRef)
  const filteredConnector = fetchedConnectorResponse?.content?.find(item => item.connector?.identifier === connector)
  const connectorName = filteredConnector?.connector?.name
  return connectorName
}

export const resetServiceSelectionForStages = (
  stages: string[] = [],
  pipeline: PipelineInfoConfig
): StageElementWrapperConfig[] => {
  const stagesCopy = cloneDeep(pipeline.stages) || []
  stages.forEach(stageId => {
    const { stage, parent = null } = getStageFromPipeline(stageId, pipeline)
    if (!stage) {
      return
    }

    if (parent) {
      const { parallelStageIndex, stageIndex: parentStageIndex } = getStageIndexByIdentifier(pipeline, stageId)
      const updatedStage = resetStageServiceSpec(stagesCopy?.[parentStageIndex]?.parallel?.[parallelStageIndex] || {})
      set(stagesCopy, [parentStageIndex, 'parallel', parallelStageIndex], updatedStage)
      return
    }
    let stageIndex = pipeline.stages?.indexOf(stage)
    stageIndex = stageIndex !== undefined ? stageIndex : -1
    const updatedStage = resetStageServiceSpec(stage)
    stagesCopy[stageIndex] = updatedStage
  })
  return stagesCopy
}

export const getAffectedDependentStages = (
  dependentStages: string[] = [],
  dropIndex: number,
  pipeline: PipelineInfoConfig,
  parallelStageIndex = -1
): string[] => {
  const affectedStages: Set<string> = new Set()
  dependentStages.forEach(stageId => {
    const { stage: currentStage, parent = null } = getStageFromPipeline(stageId, pipeline)
    if (!currentStage) {
      return false
    }
    if (parent) {
      parent?.parallel?.forEach((pStageId: StageElementWrapperConfig, index: number) => {
        const stageIndex = dependentStages.indexOf(pStageId?.stage?.identifier || '')
        if (parallelStageIndex !== -1) {
          stageIndex > -1 && index <= parallelStageIndex && affectedStages.add(stageId)
        } else {
          stageIndex > -1 && index <= dropIndex && affectedStages.add(stageId)
        }
      })
      return
    }
    const stageIndex = pipeline.stages?.indexOf(currentStage || {})

    if (stageIndex !== undefined && stageIndex > -1) {
      return stageIndex <= dropIndex && affectedStages.add(stageId)
    }
    return
  })
  return [...affectedStages]
}

export const resetStageServiceSpec = (stage: StageElementWrapperConfig): StageElementWrapperConfig =>
  produce(stage, draft => {
    const spec = (draft.stage?.spec as DeploymentStageConfig) || {}
    spec.serviceConfig = {
      serviceRef: '',
      serviceDefinition: {
        type: 'Kubernetes',
        spec: {
          artifacts: {
            sidecars: []
          },
          manifests: [],

          artifactOverrideSets: [],
          manifestOverrideSets: []
        }
      }
    }
  })
