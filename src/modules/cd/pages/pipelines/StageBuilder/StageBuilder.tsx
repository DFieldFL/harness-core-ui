import React from 'react'
import { Icon } from '@wings-software/uikit'
import { debounce } from 'lodash'
import type { NodeModelListener, LinkModelListener } from '@projectstorm/react-diagrams-core'
import SplitPane from 'react-split-pane'
import { Diagram } from 'modules/common/exports'
import { DynamicPopover, DynamicPopoverHandlerBinding } from 'modules/common/components/DynamicPopover/DynamicPopover'
import { CanvasButtons } from 'modules/cd/common/CanvasButtons/CanvasButtons'
import type { StageElementWrapper, CDPipeline } from 'services/cd-ng'
import { StageBuilderModel } from './StageBuilderModel'
import StageSetupShell from '../../../common/StageSetupShell/StageSetupShell'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import { EmptyStageName, MinimumSplitPaneSize, DefaultSplitPaneSize } from '../PipelineConstants'
import {
  getNewStageFromType,
  StageType,
  PopoverData,
  getStageFromPipeline,
  EmptyNodeSeparator,
  resetDiagram
} from './StageBuilderUtil'
import { EditStageView } from './views/EditStageView'
import { StageList } from './views/StageList'
import { AddStageView } from './views/AddStageView'
import css from './StageBuilder.module.scss'

export interface StageState {
  isConfigured: boolean
  stage: StageElementWrapper
}

export type StageStateMap = Map<string, StageState>

const initializeStageStateMap = (pipeline: CDPipeline, mapState: StageStateMap): void => {
  if (pipeline.stages) {
    pipeline.stages.forEach((node: StageElementWrapper) => {
      if (node.stage && node.stage.name !== EmptyStageName) {
        mapState.set(node.stage.identifier, { isConfigured: true, stage: node })
      } else if (node.parallel) {
        node.parallel.forEach((parallelNode: StageElementWrapper) => {
          if (parallelNode.stage && parallelNode.stage.name !== EmptyStageName) {
            mapState.set(parallelNode.stage.identifier, { isConfigured: true, stage: parallelNode })
          }
        })
      }
    })
  }
}

export const renderPopover = ({
  data,
  addStage,
  isParallel,
  isGroupStage,
  groupStages,
  groupSelectedStageId,
  onClickGroupStage,
  event,
  isStageView,
  onSubmitPrimaryData
}: PopoverData): JSX.Element => {
  if (isStageView && data) {
    const stageData = {
      stage: {
        ...data.stage,
        identifier: data?.stage.name === EmptyStageName ? '' : data.stage.identifier,
        name: data?.stage.name === EmptyStageName ? '' : data.stage.name
      }
    }
    return (
      <EditStageView
        data={stageData}
        onSubmit={(values, identifier) => {
          data.stage = {
            ...values.stage
          }
          onSubmitPrimaryData?.(values, identifier)
        }}
      />
    )
  } else if (isGroupStage) {
    return <StageList stages={groupStages || []} selectedStageId={groupSelectedStageId} onClick={onClickGroupStage} />
  }
  return <AddStageView isParallel={isParallel} callback={type => addStage?.(type, isParallel, event)} />
}

export const StageBuilder: React.FC<{}> = (): JSX.Element => {
  const {
    state: {
      pipeline,
      pipelineView: { isSetupStageOpen, selectedStageId },
      isInitialized
    },
    updatePipeline,
    updatePipelineView
  } = React.useContext(PipelineContext)

  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<PopoverData> | undefined
  >()

  const canvasRef = React.useRef<HTMLDivElement | null>(null)

  const [stageMap, setStageMap] = React.useState(new Map<string, StageState>())

  const addStage = (type: StageType, isParallel = false, event?: Diagram.DefaultNodeEvent): void => {
    if (!pipeline.stages) {
      pipeline.stages = []
    }
    if (event?.entity && event.entity instanceof Diagram.DefaultLinkModel) {
      let node = event.entity.getSourcePort().getNode() as Diagram.DefaultNodeModel
      let { stage } = getStageFromPipeline(pipeline, node.getIdentifier())
      let next = 1
      if (!stage) {
        node = event.entity.getTargetPort().getNode() as Diagram.DefaultNodeModel
        stage = getStageFromPipeline(pipeline, node.getIdentifier()).stage
        next = 0
      }
      if (stage) {
        const index = pipeline.stages.indexOf(stage)
        if (index > -1) {
          pipeline.stages.splice(index + next, 0, {
            stage: getNewStageFromType(type)
          })
        }
      } else {
        // parallel next parallel case
        let nodeParallel = event.entity.getSourcePort().getNode() as Diagram.DefaultNodeModel
        let nodeId = nodeParallel.getIdentifier().split(EmptyNodeSeparator)[1]
        stage = getStageFromPipeline(pipeline, nodeId).parent
        next = 1
        if (!stage) {
          nodeParallel = event.entity.getTargetPort().getNode() as Diagram.DefaultNodeModel
          nodeId = nodeParallel.getIdentifier().split(EmptyNodeSeparator)[2]
          stage = getStageFromPipeline(pipeline, nodeId).parent
          next = 0
        }
        if (stage) {
          const index = pipeline.stages.indexOf(stage)
          if (index > -1) {
            pipeline.stages.splice(index + next, 0, {
              stage: getNewStageFromType(type)
            })
          }
        }
      }
    } else if (isParallel && event?.entity && event.entity instanceof Diagram.DefaultNodeModel) {
      const { stage, parent } = getStageFromPipeline(pipeline, event.entity.getIdentifier())
      if (stage) {
        if (parent && parent.parallel && parent.parallel.length > 0) {
          parent.parallel.push({
            stage: getNewStageFromType(type)
          })
        } else {
          const index = pipeline.stages.indexOf(stage)
          if (index > -1) {
            pipeline.stages.splice(index, 1, {
              parallel: [
                stage,
                {
                  stage: getNewStageFromType(type)
                }
              ]
            })
          }
        }
      }
    } else {
      pipeline.stages.push({
        stage: getNewStageFromType(type)
      })
    }
    dynamicPopoverHandler?.hide()
    model.addUpdateGraph(pipeline, { nodeListeners, linkListeners }, selectedStageId)
    engine.repaintCanvas()
    updatePipeline(pipeline)
  }

  React.useEffect(() => {
    if (isInitialized && !isSetupStageOpen) {
      const map = new Map<string, StageState>()
      initializeStageStateMap(pipeline, map)
      setStageMap(map)
    }
  }, [isInitialized, pipeline, isSetupStageOpen])

  const nodeListeners: NodeModelListener = {
    // Can not remove this Any because of React Diagram Issue
    [Diagram.Event.ClickNode]: (event: any) => {
      const eventTemp = event as Diagram.DefaultNodeEvent
      const nodeRender = document.querySelector(`[data-nodeid="${eventTemp.entity.getID()}"]`)
      if (nodeRender && eventTemp.entity) {
        if (eventTemp.entity.getType() === Diagram.DiagramType.CreateNew) {
          dynamicPopoverHandler?.show(
            nodeRender,
            {
              addStage,
              isStageView: false
            },
            { useArrows: true, darkMode: true }
          )
        } else if (eventTemp.entity.getType() === Diagram.DiagramType.GroupNode && selectedStageId) {
          const parent = getStageFromPipeline(pipeline, eventTemp.entity.getIdentifier()).parent
          if (parent?.parallel) {
            dynamicPopoverHandler?.show(
              nodeRender,
              {
                isGroupStage: true,
                groupSelectedStageId: selectedStageId,
                isStageView: false,
                groupStages: parent.parallel,
                onClickGroupStage: (stageId: string) => {
                  dynamicPopoverHandler?.hide()
                  resetDiagram(engine)
                  updatePipelineView({ isSetupStageOpen: true, selectedStageId: stageId })
                }
              },
              { useArrows: true, darkMode: true }
            )
          }
        } else if (eventTemp.entity.getType() !== Diagram.DiagramType.StartNode) {
          const data = getStageFromPipeline(pipeline, eventTemp.entity.getIdentifier()).stage
          if (isSetupStageOpen && data?.stage?.identifier) {
            resetDiagram(engine)
            updatePipelineView({ isSetupStageOpen: true, selectedStageId: data?.stage?.identifier })
          } else if (!isSetupStageOpen) {
            if (stageMap.has(data?.stage?.identifier)) {
              resetDiagram(engine)
              updatePipelineView({ isSetupStageOpen: true, selectedStageId: data?.stage?.identifier })
            } else {
              dynamicPopoverHandler?.show(
                nodeRender,
                {
                  isStageView: true,
                  data,
                  onSubmitPrimaryData: (node, identifier) => {
                    updatePipeline(pipeline)
                    stageMap.set(node.stage.identifier, { isConfigured: true, stage: node })
                    dynamicPopoverHandler.hide()
                    resetDiagram(engine)
                    updatePipelineView({ isSetupStageOpen: true, selectedStageId: identifier })
                  }
                },
                { useArrows: false, darkMode: false }
              )
            }
          }
        }
      }
    },
    // Can not remove this Any because of React Diagram Issue
    [Diagram.Event.RemoveNode]: (event: any) => {
      const eventTemp = event as Diagram.DefaultNodeEvent
      const { stage: node, parent } = getStageFromPipeline(pipeline, eventTemp.entity.getIdentifier())
      if (node && pipeline.stages) {
        const index = pipeline.stages.indexOf(node)
        if (index > -1) {
          pipeline?.stages?.splice(index, 1)
          stageMap.delete(node.stage.identifier)
          updatePipeline(pipeline)
        } else if (parent?.parallel) {
          const parallelIndex = parent.parallel?.indexOf(node)
          if (parallelIndex > -1) {
            parent.parallel.splice(parallelIndex, 1)
            if (parent.parallel.length === 0) {
              const emptyParallel = pipeline?.stages?.indexOf(parent)
              if (emptyParallel && emptyParallel > -1) {
                pipeline?.stages?.splice(emptyParallel, 1)
              }
            }
            stageMap.delete(node.stage.identifier)
            updatePipeline(pipeline)
          }
        }
      }
    },
    [Diagram.Event.AddParallelNode]: (event: any) => {
      const eventTemp = event as Diagram.DefaultNodeEvent
      eventTemp.stopPropagation()
      if (eventTemp.target) {
        dynamicPopoverHandler?.show(
          eventTemp.target,
          {
            addStage,
            isParallel: true,
            isStageView: false,
            event: eventTemp
          },
          { useArrows: true, darkMode: true },
          eventTemp.callback
        )
      }
    }
  }

  const linkListeners: LinkModelListener = {
    [Diagram.Event.AddLinkClicked]: (event: any) => {
      const eventTemp = event as Diagram.DefaultNodeEvent
      const linkRender = document.querySelector(`[data-linkid="${eventTemp.entity.getID()}"] circle`)
      if (linkRender) {
        dynamicPopoverHandler?.show(
          linkRender,
          {
            addStage,
            isStageView: false,
            event: eventTemp
          },
          { useArrows: true, darkMode: true }
        )
      }
    }
  }
  //1) setup the diagram engine
  const engine = React.useMemo(() => Diagram.createEngine(), [])

  //2) setup the diagram model
  const model = React.useMemo(() => new StageBuilderModel(), [])
  const [splitPaneSize, setSplitPaneSize] = React.useState(DefaultSplitPaneSize)

  model.addUpdateGraph(pipeline, { nodeListeners, linkListeners }, selectedStageId, splitPaneSize)
  const setSplitPaneSizeDeb = debounce(setSplitPaneSize, 200)
  // load model into engine
  engine.setModel(model)

  const StageCanvas = (
    <div
      className={css.canvas}
      ref={canvasRef}
      onClick={e => {
        const div = e.target as HTMLDivElement
        if (div === canvasRef.current?.children[0]) {
          dynamicPopoverHandler?.hide()
        }
        if (isSetupStageOpen) {
          updatePipelineView({ isSetupStageOpen: false, selectedStageId: undefined })
        }
      }}
    >
      <Diagram.CanvasWidget engine={engine} />
      <DynamicPopover
        darkMode={true}
        className={css.renderPopover}
        render={renderPopover}
        bind={setDynamicPopoverHandler}
      />

      <CanvasButtons engine={engine} callback={() => dynamicPopoverHandler?.hide()} />
    </div>
  )

  return (
    <div className={css.canvas}>
      {isSetupStageOpen ? (
        <SplitPane
          size={splitPaneSize}
          split="horizontal"
          minSize={MinimumSplitPaneSize}
          onChange={size => setSplitPaneSizeDeb(size)}
        >
          {StageCanvas}
          <div style={{ width: '100%', height: `calc(100vh - ${splitPaneSize + 70}px)`, overflow: 'scroll' }}>
            <div className={css.splitButtons}>
              <Icon
                name="up"
                size={15}
                className={css.stageDecrease}
                onClick={() => {
                  setSplitPaneSize(MinimumSplitPaneSize)
                }}
              />
              <span className={css.separator} />
              <Icon
                name="down"
                size={15}
                className={css.stageIncrease}
                onClick={() => {
                  setSplitPaneSize(prev => prev + 100)
                }}
              />
            </div>
            <StageSetupShell />
          </div>
        </SplitPane>
      ) : (
        StageCanvas
      )}
    </div>
  )
}
