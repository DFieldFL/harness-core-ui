import React from 'react'
import type { ITreeNode } from '@blueprintjs/core'
import { Text, Color } from '@wings-software/uicore'
import type { NgPipeline, StageElement, StageElementWrapper } from 'services/cd-ng'
import i18n from './PipelineStudio.i18n'

export interface NodeClasses {
  primary?: string
  secondary?: string
  empty?: string
}

const getStageTree = (stage: StageElement, classes: NodeClasses = {}): ITreeNode => {
  const stageNode: ITreeNode = {
    id: `Stage${stage.identifier}`,
    hasCaret: true,
    label: (
      <Text color={Color.GREY_800} style={{ fontWeight: 600 }} width="147" lineClamp={1}>
        {stage.name}
      </Text>
    ),
    className: classes.primary,
    childNodes: []
  }

  // common to ci and cd stage
  stageNode.childNodes?.push({
    id: `Stage_Custom_Variables$${stage.identifier}`,
    hasCaret: false,
    label: <Text>{i18n.customVariables}</Text>,
    className: classes.secondary
  })

  // only cd stage
  // TODO: Replace 'Deployment' literal with enum
  if (stage.type === 'Deployment') {
    stageNode.childNodes?.push({
      id: `Stage_Service$${stage.identifier}`,
      hasCaret: false,
      label: <Text>{i18n.service}</Text>,
      className: classes.secondary,
      isExpanded: true,
      childNodes: [
        {
          id: `Stage_Service_Artifacts$${stage.identifier}`,
          hasCaret: false,
          label: <Text>{'Artifacts'}</Text>,
          className: classes.secondary
        }
      ]
    })
  }

  // only ci stage
  // TODO: Replace 'ci' literal with enum
  if (stage.type === 'ci') {
    stageNode.childNodes?.push({
      id: `Stage_Dependencies$${stage.identifier}`,
      hasCaret: false,
      label: <Text>{i18n.dependencies}</Text>,
      className: classes.secondary,
      isExpanded: false
    })
  }

  // common to ci and cd stage
  stageNode.childNodes?.push(
    {
      id: `Stage_Infrastructure$${stage.identifier}`,
      hasCaret: false,
      label: <Text>{i18n.infrastructure}</Text>,
      className: classes.secondary
    },
    {
      id: `Stage_Execution$${stage.identifier}`,
      hasCaret: false,
      label: <Text>{i18n.execution}</Text>,
      className: classes.secondary
    }
  )
  return stageNode
}

export const getPipelineTree = (pipeline: NgPipeline, classes: NodeClasses = {}): ITreeNode[] => {
  const returnNodes: ITreeNode[] = [
    {
      id: 'Pipeline_Variables',
      hasCaret: false,
      label: (
        <Text color={Color.GREY_800} style={{ fontWeight: 500 }}>
          {i18n.pipelineVariables}
        </Text>
      ),
      className: classes.primary
    },
    {
      id: 'Pipeline_Custom_Variables',
      hasCaret: false,
      label: (
        <Text color={Color.GREY_800} style={{ fontWeight: 500 }}>
          {i18n.customVariables}
        </Text>
      ),
      className: classes.empty
    }
  ]

  /* istanbul ignore else */ if (pipeline.stages && pipeline.stages?.length > 0) {
    const stages: ITreeNode = {
      id: 'Stages',
      hasCaret: true,
      isExpanded: true,
      label: (
        <Text color={Color.GREY_500} font={{ size: 'normal' }} style={{ fontWeight: 500 }}>
          {i18n.stages}
        </Text>
      ),
      childNodes: []
    }
    pipeline.stages.forEach(data => {
      if (data.parallel && data.parallel.length > 0) {
        data.parallel.forEach((nodeP: StageElementWrapper) => {
          nodeP.stage && stages.childNodes?.push(getStageTree(nodeP.stage))
        })
      } /* istanbul ignore else */ else if (data.stage) {
        stages.childNodes?.push(getStageTree(data.stage, classes))
      }
    })
    returnNodes.push(stages)
  }
  return returnNodes
}
