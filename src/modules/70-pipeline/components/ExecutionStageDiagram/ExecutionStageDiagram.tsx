import React from 'react'
import { useParams } from 'react-router-dom'
import classNames from 'classnames'
import { noop, find, isNil, debounce } from 'lodash-es'
import type { NodeModelListener } from '@projectstorm/react-diagrams-core'
import type { BaseModelListener } from '@projectstorm/react-canvas-core'
import { Button, Layout, Icon } from '@wings-software/uicore'
import { Select } from '@blueprintjs/select'
import { Tooltip } from '@blueprintjs/core'
import { GraphCanvasState, useExecutionContext } from '@pipeline/pages/execution/ExecutionContext/ExecutionContext'
import type { PipelineType } from '@common/interfaces/RouteInterfaces'
import type { ExecutionPathParams } from '@pipeline/utils/executionUtils'
import { usePermission } from '@rbac/hooks/usePermission'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ExecutionPipeline, ExecutionPipelineItem, StageOptions } from './ExecutionPipelineModel'
import { ExecutionStageDiagramModel, GridStyleInterface, NodeStyleInterface } from './ExecutionStageDiagramModel'
import ExecutionActions from '../ExecutionActions/ExecutionActions'
import {
  focusRunningNode,
  getGroupsFromData,
  getStageFromDiagramEvent,
  GroupState,
  moveStageToFocus
} from './ExecutionStageDiagramUtils'
import { CanvasButtons, CanvasButtonsActions } from '../CanvasButtons/CanvasButtons'
import * as Diagram from '../Diagram'
import css from './ExecutionStageDiagram.module.scss'

abstract class ItemEvent<T> extends Event {
  readonly stage: ExecutionPipelineItem<T>
  readonly stageTarget: HTMLElement

  constructor(eventName: string, stage: ExecutionPipelineItem<T>, target: HTMLElement) {
    super(eventName)
    this.stage = stage
    this.stageTarget = target
  }
}

const StageSelection = Select.ofType<StageOptions>()

export class ItemClickEvent<T> extends ItemEvent<T> {
  constructor(stage: ExecutionPipelineItem<T>, target: HTMLElement) {
    super('ItemClickEvent', stage, target)
  }
}

export class ItemMouseEnterEvent<T> extends ItemEvent<T> {
  constructor(stage: ExecutionPipelineItem<T>, target: HTMLElement) {
    super('ItemMouseEnterEvent', stage, target)
  }
}

export class ItemMouseLeaveEvent<T> extends ItemEvent<T> {
  constructor(stage: ExecutionPipelineItem<T>, target: HTMLElement) {
    super('ItemMouseLeaveEvent', stage, target)
  }
}

export interface ExecutionStageDiagramProps<T> {
  /** pipeline definition */
  data: ExecutionPipeline<T>
  /** selected item id */
  selectedIdentifier: string // TODO: 1. add node style for each type/shape 2. add default value
  /** node style  */
  nodeStyle?: NodeStyleInterface
  /** grid style */
  gridStyle: GridStyleInterface
  loading?: boolean
  showStartEndNode?: boolean // Default: true
  showEndNode?: boolean // Default: true
  diagramContainerHeight?: number
  itemClickHandler?: (event: ItemClickEvent<T>) => void
  itemMouseEnter?: (event: ItemMouseEnterEvent<T>) => void
  itemMouseLeave?: (event: ItemMouseLeaveEvent<T>) => void
  canvasListener?: (action: CanvasButtonsActions) => void
  isWhiteBackground?: boolean // Default: false
  className?: string
  showStageSelection?: boolean // Default: false
  selectedStage?: StageOptions
  stageSelectionOptions?: StageOptions[]
  onChangeStageSelection?: (value: StageOptions) => void
  canvasBtnsClass?: string
  graphCanvasState?: GraphCanvasState
  setGraphCanvasState?: (state: GraphCanvasState) => void
}

export default function ExecutionStageDiagram<T>(props: ExecutionStageDiagramProps<T>): React.ReactElement {
  const {
    data,
    className,
    selectedIdentifier,
    nodeStyle = { width: 50, height: 50 },
    gridStyle,
    diagramContainerHeight,
    showStartEndNode = true,
    showEndNode = true,
    itemClickHandler = noop,
    itemMouseEnter = noop,
    itemMouseLeave = noop,
    canvasListener = noop,
    loading = false,
    selectedStage,
    showStageSelection = false,
    stageSelectionOptions,
    onChangeStageSelection,
    isWhiteBackground = false,
    canvasBtnsClass = '',
    graphCanvasState,
    setGraphCanvasState
  } = props

  const debounceSetGraphCanvasState = React.useRef(
    debounce((values: any) => {
      return setGraphCanvasState?.(values)
    }, 250)
  ).current

  const { orgIdentifier, projectIdentifier, executionIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<ExecutionPathParams>
  >()

  const { pipelineStagesMap, refetch, pipelineExecutionDetail, allNodeMap } = useExecutionContext()
  const [autoPosition, setAutoPosition] = React.useState(true)

  const [groupStage, setGroupStage] = React.useState<Map<string, GroupState<T>>>()

  React.useEffect(() => {
    const stageData = getGroupsFromData(data.items)
    setGroupStage(stageData)
  }, [data])

  const currentStage = pipelineStagesMap.get(selectedStage?.value || '')
  const updateGroupStage = (event: Diagram.DefaultNodeEvent): void => {
    const group = groupStage?.get(event.entity.getIdentifier())
    if (group && groupStage) {
      groupStage?.set(event.entity.getIdentifier(), {
        ...group,
        collapsed: !group.collapsed
      })
      setGroupStage(new Map([...groupStage]))
    }
  }

  //setup the diagram engine
  const engine = React.useMemo(() => Diagram.createEngine({}), [])

  //setup the diagram model
  const model = React.useMemo(() => new ExecutionStageDiagramModel(), [])
  model.setDefaultNodeStyle(nodeStyle)
  model.setGridStyle(gridStyle)

  // Graph position and zoom set (set values from context)
  React.useEffect(() => {
    const { offsetX, offsetY, zoom } = graphCanvasState || {}
    if (!isNil(offsetX) && offsetX !== model.getOffsetX() && !isNil(offsetY) && offsetY !== model.getOffsetY()) {
      model.setOffset(offsetX, offsetY)
    }
    if (!isNil(zoom) && zoom !== model.getZoomLevel()) {
      model.setZoomLevel(zoom)
    }
  }, [graphCanvasState, model])

  // Graph position and zoom change - event handling (update context value)
  React.useEffect(() => {
    const offsetUpdateHandler = function (event: any) {
      if (graphCanvasState) {
        graphCanvasState.offsetX = event.offsetX
        graphCanvasState.offsetY = event.offsetY
        debounceSetGraphCanvasState({
          ...graphCanvasState
        })
      }
    }
    const zoomUpdateHandler = function (event: any) {
      if (graphCanvasState) {
        graphCanvasState.zoom = event.zoom
        debounceSetGraphCanvasState({ ...graphCanvasState })
      }
    }
    const listenerHandle = model.registerListener({
      [Diagram.Event.OffsetUpdated]: offsetUpdateHandler,
      [Diagram.Event.ZoomUpdated]: zoomUpdateHandler
    })
    return () => {
      model.deregisterListener(listenerHandle)
    }
  }, [model])

  const nodeListeners: NodeModelListener = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Diagram.Event.ClickNode]: (event: any) => {
      /* istanbul ignore else */ if (autoPosition) {
        setAutoPosition(false)
      }
      const group = groupStage?.get(event.entity.getIdentifier())
      if (group && group.collapsed) {
        updateGroupStage(event)
      } else {
        const stage = getStageFromDiagramEvent(event, data)
        /* istanbul ignore else */ if (stage) itemClickHandler(new ItemClickEvent(stage, event.target))
      }
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Diagram.Event.MouseEnterNode]: (event: any) => {
      const stage = getStageFromDiagramEvent(event, data)
      /* istanbul ignore else */ if (stage) itemMouseEnter(new ItemMouseEnterEvent(stage, event.target))
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [Diagram.Event.MouseLeaveNode]: (event: any) => {
      const stage = getStageFromDiagramEvent(event, data)
      // dynamicPopoverHandler?.hide()
      /* istanbul ignore else */ if (stage) itemMouseLeave(new ItemMouseLeaveEvent(stage, event.target))
    }
  }
  const layerListeners: BaseModelListener = {
    [Diagram.Event.StepGroupCollapsed]: (event: any) => updateGroupStage(event)
  }

  React.useEffect(() => {
    setAutoPosition(true)
  }, [data.identifier])

  React.useEffect(() => {
    moveStageToFocus(engine, selectedIdentifier, true, true)
  }, [selectedIdentifier])

  React.useEffect(() => {
    model.clearAllNodesAndLinks()
    engine.repaintCanvas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.identifier])

  React.useEffect(() => {
    !loading &&
      model.addUpdateGraph(
        data,
        { nodeListeners: nodeListeners, linkListeners: {}, layerListeners },
        selectedIdentifier,
        diagramContainerHeight,
        showStartEndNode,
        showEndNode,
        groupStage
      )
  }, [
    data,
    diagramContainerHeight,
    groupStage,
    layerListeners,
    loading,
    model,
    nodeListeners,
    selectedIdentifier,
    showStartEndNode,
    showEndNode
  ])

  const [canEdit, canExecute] = usePermission(
    {
      resourceScope: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier as string
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE, PermissionIdentifier.EXECUTE_PIPELINE]
    },
    [orgIdentifier, projectIdentifier, accountId, pipelineIdentifier]
  )

  //Load model into engine
  engine.setModel(model)
  autoPosition && focusRunningNode(engine, data)
  const stageNode = find(allNodeMap, node => node.setupId === selectedStage?.value)

  return (
    <div className={classNames(css.main, { [css.whiteBackground]: isWhiteBackground }, className)}>
      <Diagram.CanvasWidget engine={engine} className={css.canvas} />
      {showStageSelection && selectedStage && selectedStage?.value?.length > 0 && (
        <Layout.Horizontal spacing="xxlarge" className={css.stageSelection}>
          <div className={css.groupLabels}>
            <StageSelection
              itemRenderer={(item, { handleClick, modifiers: { disabled } }) => (
                <div key={item.value}>
                  <Button
                    icon={item.icon?.name}
                    text={item.label}
                    className={css.stageItem}
                    disabled={disabled}
                    minimal
                    onClick={e => handleClick(e as React.MouseEvent<HTMLElement, MouseEvent>)}
                  />
                </div>
              )}
              itemDisabled={item => {
                return item.disabled ?? false
              }}
              itemPredicate={(query, item, _index, exactMatch) => {
                const normalizedValue = item.value.toLowerCase()
                const normalizedQuery = query.toLowerCase()
                /* istanbul ignore if */ if (exactMatch) {
                  return normalizedValue === normalizedQuery
                } else {
                  return normalizedValue.indexOf(normalizedQuery) > -1 || item.label.indexOf(normalizedQuery) > -1
                }
              }}
              items={stageSelectionOptions || /* istanbul ignore next */ []}
              onItemSelect={item => onChangeStageSelection?.(item)}
            >
              <Button
                className={css.stageButton}
                icon={selectedStage.icon?.name}
                text={selectedStage.label}
                rightIcon="caret-down"
              />
            </StageSelection>
            <ExecutionActions
              executionStatus={pipelineExecutionDetail?.pipelineExecutionSummary?.status}
              refetch={refetch}
              params={{
                orgIdentifier,
                pipelineIdentifier,
                projectIdentifier,
                accountId,
                executionIdentifier,
                module
              }}
              noMenu
              stageId={stageNode?.uuid}
              canEdit={canEdit}
              canExecute={canExecute}
            />
          </div>
          {groupStage && groupStage.size > 1 && (
            // Do not render groupStage if the size is less than 1
            // In approval stage, we do not have service/innfra/execution sections
            <div className={css.groupLabels}>
              {[...groupStage]
                .filter(item => item[1].showInLabel)
                .map(item => (
                  <span
                    onClick={e => {
                      e.currentTarget.classList.add(css.selectedLabel)
                      moveStageToFocus(engine, item[1].identifier)
                    }}
                    onAnimationEnd={e => {
                      e.currentTarget.classList.remove(css.selectedLabel)
                    }}
                    className={css.label}
                    key={item[0]}
                  >
                    {item[1].name}
                  </span>
                ))}
            </div>
          )}
          {currentStage?.failureInfo?.message && (
            <div>
              <Tooltip content={currentStage?.failureInfo?.message} portalClassName={css.errorTooltip}>
                <Icon data-testId="stage-error-tooltip" className={css.stageError} name="warning-sign" size={18} />
              </Tooltip>
            </div>
          )}
        </Layout.Horizontal>
      )}
      <CanvasButtons
        engine={engine}
        className={canvasBtnsClass}
        callback={action => {
          canvasListener(action)
        }}
        tooltipPosition="right"
      />
    </div>
  )
}
