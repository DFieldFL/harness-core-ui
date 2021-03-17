import React from 'react'
import * as Yup from 'yup'
import type { ITreeNode } from '@blueprintjs/core'
import { Text, Color } from '@wings-software/uicore'
import get from 'lodash-es/get'
import { StringUtils } from '@common/exports'
import { useStrings } from 'framework/exports'

import type { NgPipeline, StageElement, StageElementWrapper } from 'services/cd-ng'
import i18n from './PipelineStudio.i18n'

export enum PipelineStudioView {
  ui = 'ui',
  yaml = 'yaml'
}
export interface NodeClasses {
  primary?: string
  secondary?: string
  empty?: string
}

export const IdentifierValidation = () => {
  const { getString } = useStrings()
  return {
    identifier: Yup.string()
      .trim()
      .required(getString('validation.identifierRequired'))
      .matches(/^(?![0-9])[0-9a-zA-Z_$]*$/, getString('validation.validIdRegex'))
      .notOneOf(StringUtils.illegalIdentifiers)
  }
}

const getStageTree = (
  stage: StageElement,
  classes: NodeClasses = {},
  { hideNonRuntimeFields = false, template = {} }: { hideNonRuntimeFields?: boolean; template?: {} } = {}
): ITreeNode => {
  const stageNode: ITreeNode = {
    id: `Stage.${stage.identifier}`,
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
  if (hideNonRuntimeFields) {
    const hasVariables = get(template, 'variables', null)
    hasVariables &&
      stageNode.childNodes?.push({
        id: `Stage.${stage.identifier}.Variables`,
        hasCaret: false,
        label: <Text>{i18n.customVariables}</Text>,
        className: classes.secondary
      })
  } else {
    stageNode.childNodes?.push({
      id: `Stage.${stage.identifier}.Variables`,
      hasCaret: false,
      label: <Text>{i18n.customVariables}</Text>,
      className: classes.secondary
    })
  }

  // only cd stage
  // TODO: Replace 'Deployment' literal with enum
  if (stage.type === 'Deployment') {
    const enabledChildList = Object.keys(get(template, 'spec.serviceConfig.serviceDefinition.spec', {}))
    const childNodes = []
    if (hideNonRuntimeFields) {
      enabledChildList.includes('artifacts') &&
        childNodes.push({
          id: `Stage.${stage.identifier}.Service.Artifacts`,
          hasCaret: false,
          label: <Text>{'Artifacts'}</Text>,
          className: classes.secondary
        })
      enabledChildList.includes('manifests') &&
        childNodes.push({
          id: `Stage.${stage.identifier}.Service.Manifests`,
          hasCaret: false,
          label: <Text>{'Manifests'}</Text>,
          className: classes.secondary
        })
      enabledChildList.includes('variables') &&
        childNodes.push({
          id: `Stage.${stage.identifier}.Service.Variables`,
          hasCaret: false,
          label: <Text>{'Variables'}</Text>,
          className: classes.secondary
        })
    } else {
      childNodes.push(
        ...[
          {
            id: `Stage.${stage.identifier}.Service.Artifacts`,
            hasCaret: false,
            label: <Text>{'Artifacts'}</Text>,
            className: classes.secondary
          },
          {
            id: `Stage.${stage.identifier}.Service.Manifests`,
            hasCaret: false,
            label: <Text>{'Manifests'}</Text>,
            className: classes.secondary
          },
          {
            id: `Stage.${stage.identifier}.Service.Variables`,
            hasCaret: false,
            label: <Text>{'Variables'}</Text>,
            className: classes.secondary
          }
        ]
      )
    }
    if (hideNonRuntimeFields) {
      Object.keys(get(template, 'spec', {})).includes('serviceConfig') &&
        stageNode.childNodes?.push({
          id: `Stage.${stage.identifier}.Service`,
          hasCaret: false,
          label: <Text>{i18n.service}</Text>,
          className: classes.secondary,
          isExpanded: true,
          childNodes
        })
    } else {
      stageNode.childNodes?.push({
        id: `Stage.${stage.identifier}.Service`,
        hasCaret: false,
        label: <Text>{i18n.service}</Text>,
        className: classes.secondary,
        isExpanded: true,
        childNodes
      })
    }
  }

  // only ci stage
  // TODO: Replace 'ci' literal with enum
  // TODO: hide as implementation is not done
  /*if (stage.type === 'CI') {
    stageNode.childNodes?.push({
      id: `Stage.${stage.identifier}.Dependencies`,
      hasCaret: false,
      label: <Text>{i18n.dependencies}</Text>,
      className: classes.secondary,
      isExpanded: false
    })
  }*/

  // common to ci and cd stage
  // TODO: temporary enable only for CD as Ci is not implemented
  if (stage.type === 'Deployment') {
    if (hideNonRuntimeFields) {
      const enabledChildList = Object.keys(get(template, 'spec', {}))
      enabledChildList.includes('infrastructure') &&
        stageNode.childNodes?.push({
          id: `Stage.${stage.identifier}.Infrastructure`,
          hasCaret: false,
          label: <Text>{i18n.infrastructure}</Text>,
          className: classes.secondary
        })

      enabledChildList.includes('execution') &&
        stageNode.childNodes?.push({
          id: `Stage.${stage.identifier}.Execution`,
          hasCaret: false,
          label: <Text>{i18n.execution}</Text>,
          className: classes.secondary
        })
    } else {
      stageNode.childNodes?.push(
        {
          id: `Stage.${stage.identifier}.Infrastructure`,
          hasCaret: false,
          label: <Text>{i18n.infrastructure}</Text>,
          className: classes.secondary
        },
        {
          id: `Stage.${stage.identifier}.Execution`,
          hasCaret: false,
          label: <Text>{i18n.execution}</Text>,
          className: classes.secondary
        }
      )
    }
  }
  return stageNode
}

export const getPipelineTree = (
  pipeline: NgPipeline,
  classes: NodeClasses = {},
  options: { hideNonRuntimeFields?: boolean; template?: { stages: [{ stage: {} }] } } = {}
): ITreeNode[] => {
  const returnNodes: ITreeNode[] = [
    {
      id: 'Pipeline',
      hasCaret: false,
      label: (
        <Text color={Color.GREY_800} style={{ fontWeight: 500 }}>
          {i18n.pipelineVariables}
        </Text>
      ),
      className: classes.primary
    }
  ]
  if (options.hideNonRuntimeFields) {
    get(options.template, 'variables', null) &&
      returnNodes.push({
        id: 'Pipeline.Variables',
        hasCaret: false,
        label: (
          <Text color={Color.GREY_800} style={{ fontWeight: 500 }}>
            {i18n.customVariables}
          </Text>
        ),
        className: classes.empty
      })
  } else {
    returnNodes.push({
      id: 'Pipeline.Variables',
      hasCaret: false,
      label: (
        <Text color={Color.GREY_800} style={{ fontWeight: 500 }}>
          {i18n.customVariables}
        </Text>
      ),
      className: classes.empty
    })
  }
  /* istanbul ignore else */ if (pipeline.stages && pipeline.stages?.length > 0 && options.template?.stages) {
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
    pipeline.stages.forEach((data, index) => {
      if (data.parallel && data.parallel.length > 0) {
        data.parallel.forEach((nodeP: StageElementWrapper) => {
          nodeP.stage && stages.childNodes?.push(getStageTree(nodeP.stage, classes))
        })
      } /* istanbul ignore else */ else if (data.stage && options.template?.stages?.[index]?.stage) {
        stages.childNodes?.push(
          getStageTree(data.stage, classes, { ...options, template: options.template?.stages?.[index]?.stage })
        )
      }
    })
    returnNodes.push(stages)
  }
  return returnNodes
}
