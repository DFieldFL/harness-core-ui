import React from 'react'
import { NestedAccordionProvider, useNestedAccordion, Button } from '@wings-software/uicore'
import type { ITreeNode } from '@blueprintjs/core'

import { get } from 'lodash-es'

import type { StageElementWrapper } from 'services/cd-ng'
import { PageSpinner } from '@common/components'
import { String } from 'framework/exports'

import { PageError } from '@common/components/Page/PageError'
import { usePipelineVariables } from '@pipeline/components/PipelineVariablesContext/PipelineVariablesContext'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import { getPipelineTree } from '../PipelineUtils'
import StagesTree, { stagesTreeNodeClasses } from '../../StagesThree/StagesTree'
import PipelineCard from './Cards/PipelineCard'
import StageCard from './Cards/StageCard'

import { DrawerTypes } from '../PipelineContext/PipelineActions'
import css from './PipelineVariables.module.scss'

export const PipelineVariables: React.FC = (): JSX.Element => {
  const {
    updatePipeline,
    stepsFactory,
    state: { pipeline: originalPipeline, pipelineView },
    updatePipelineView
  } = usePipelineContext()
  const { variablesPipeline, metadataMap, error, initLoading } = usePipelineVariables()

  const { openNestedPath } = useNestedAccordion()
  const [nodes, updateNodes] = React.useState<ITreeNode[]>([])

  const [selectedTreeNodeId, setSelectedTreeNodeId] = React.useState<string>('Pipeline_Variables')

  React.useEffect(() => {
    updateNodes(getPipelineTree(originalPipeline, stagesTreeNodeClasses))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalPipeline])

  const stagesCards: JSX.Element[] = []
  /* istanbul ignore else */
  if (variablesPipeline.stages && variablesPipeline.stages?.length > 0) {
    variablesPipeline.stages?.forEach((data, i) => {
      if (data.parallel && data.parallel.length > 0) {
        data.parallel.forEach((nodeP: StageElementWrapper, j: number) => {
          nodeP.stage &&
            stagesCards.push(
              <StageCard
                originalStage={get(originalPipeline, `stages[${i}].parallel[${j}].stage`)}
                key={nodeP.stage.identifier}
                stage={nodeP.stage}
                metadataMap={metadataMap}
              />
            )
        })
      } /* istanbul ignore else */ else if (data.stage) {
        stagesCards.push(
          <StageCard
            key={data.stage.identifier}
            stage={data.stage}
            originalStage={get(originalPipeline, `stages[${i}].stage`)}
            metadataMap={metadataMap}
          />
        )
      }
    })
  }

  function handleSelectionChange(id: string): void {
    setSelectedTreeNodeId(id)
    openNestedPath(id)

    document.getElementById(`${id}-panel`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  if (initLoading) return <PageSpinner />

  return (
    <div className={css.pipelineVariables}>
      <div className={css.variablesContainer}>
        <div className={css.header}>
          <String stringID="variablesText" />
          <Button
            minimal
            icon="cross"
            onClick={() => {
              updatePipelineView({ ...pipelineView, isDrawerOpened: false, drawerData: { type: DrawerTypes.AddStep } })
            }}
          />
        </div>
        {error ? (
          <PageError message={error.message || (error as string)} />
        ) : (
          <div className={css.content}>
            <StagesTree
              className={css.stagesTree}
              contents={nodes}
              selectedId={selectedTreeNodeId}
              selectionChange={handleSelectionChange}
            />
            <div className={css.variableList}>
              <String stringID="pipeline" className={css.title} />
              <div className={css.variableListHeader}>
                <String stringID="variableLabel" />
                <String stringID="valueLabel" />
              </div>
              <PipelineCard
                pipeline={variablesPipeline}
                originalPipeline={originalPipeline}
                stepsFactory={stepsFactory}
                updatePipeline={updatePipeline}
                metadataMap={metadataMap}
              />
              {stagesCards.length > 0 ? (
                <React.Fragment>
                  <String stringID="stages" className={css.title} />
                  <div className={css.variableListHeader}>
                    <String stringID="variableLabel" />
                    <String stringID="valueLabel" />
                  </div>
                  {stagesCards}
                </React.Fragment>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function PipelineVariablesWrapper(): React.ReactElement {
  return (
    <NestedAccordionProvider>
      <PipelineVariables />
    </NestedAccordionProvider>
  )
}
