import React from 'react'
import { Color, Container, Layout, Text } from '@wings-software/uicore'
import type { NodeModelListener } from '@projectstorm/react-diagrams-core'
import { set } from 'lodash-es'
import { useParams } from 'react-router-dom'
import {
  CreateNewModel,
  CreateNewWidget,
  DefaultNodeModel,
  DefaultNodeWidget,
  Event
} from '@pipeline/components/Diagram'
import type { StageElementConfig } from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { stagesCollection } from '@pipeline/components/PipelineStudio/Stages/StagesCollection'
import { DynamicPopover } from '@common/components'
import { renderPopover } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilder'
import type { DynamicPopoverHandlerBinding } from '@common/components/DynamicPopover/DynamicPopover'
import {
  StageAttributes,
  usePipelineContext
} from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import { useGlobalEventListener } from '@common/hooks'
import type { StageElementWrapper } from '@pipeline/utils/pipelineTypes'
import { PopoverData, getCommonStyles } from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilderUtil'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import type { TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import { TemplateContext } from '@templates-library/components/TemplateStudio/TemplateContext/TemplateContext'
import { DefaultNewStageId } from '@templates-library/components/TemplateStudio/StageTemplateCanvas/StageTemplateForm/StageTemplateForm'
import stageBuilderCss from '@pipeline/components/PipelineStudio/StageBuilder/StageBuilder.module.scss'
import css from './StageTemplateDiagram.module.scss'

const CREATE_NODE_ID = 'create-node'

export const StageTemplateDiagram = (): JSX.Element => {
  const {
    state: { template, gitDetails }
  } = React.useContext(TemplateContext)
  const {
    state: { pipeline },
    stagesMap,
    renderPipelineStage,
    updatePipeline
  } = usePipelineContext()
  const { getString } = useStrings()
  const [dynamicPopoverHandler, setDynamicPopoverHandler] = React.useState<
    DynamicPopoverHandlerBinding<PopoverData> | undefined
  >()
  const [stageData, setStageData] = React.useState<StageAttributes>()
  const canvasRef = React.useRef<HTMLDivElement | null>(null)
  const { templateIdentifier } = useParams<TemplateStudioPathProps>()

  useGlobalEventListener('CLOSE_CREATE_STAGE_POPOVER', () => {
    dynamicPopoverHandler?.hide()
  })

  const openStageSelection = (nodeId: string) => {
    dynamicPopoverHandler?.show(
      `[data-nodeid="${nodeId}"]`,
      {
        addStage: (newStage: StageElementWrapper) => {
          dynamicPopoverHandler?.hide()
          set(pipeline, 'stages[0].stage', { ...newStage.stage, identifier: DefaultNewStageId })
          updatePipeline(pipeline)
        },
        isStageView: false,
        renderPipelineStage,
        stagesMap: stagesMap
      },
      { useArrows: true, darkMode: false, fixedPosition: false, placement: 'bottom-start' }
    )
  }

  const nodeListeners: NodeModelListener = {
    [Event.ClickNode]: (_event: any) => {
      dynamicPopoverHandler?.hide()
      if (templateIdentifier === DefaultNewTemplateId) {
        openStageSelection(CREATE_NODE_ID)
      }
    }
  }

  const getCreateNode = () => {
    const createNode = new CreateNewModel({
      id: CREATE_NODE_ID,
      width: 90,
      height: 40,
      customNodeStyle: { borderColor: 'var(--pipeline-grey-border)' },
      nodeClassName: css.createNewModal
    })
    createNode.registerListener(nodeListeners)
    return createNode
  }

  const getStageNode = (stage: StageElementConfig) => {
    const stageNode = new DefaultNodeModel({
      identifier: stage.identifier,
      id: stage.identifier,
      customNodeStyle: { ...getCommonStyles(false), borderColor: 'var(--primary-7)', borderStyle: 'solid' },
      name: stage.name,
      isInComplete: false,
      width: 90,
      defaultSelected: false,
      draggable: false,
      canDelete: false,
      conditionalExecutionEnabled: stage.when
        ? stage.when?.pipelineStatus !== 'Success' || !!stage.when?.condition?.trim()
        : false,
      allowAdd: false,
      height: 40,
      iconStyle: { color: 'var(--white)' },
      icon: stagesMap[stage.type]?.icon,
      nodeClassName: css.createNewModal,
      ...(stage.when && {})
    })
    stageNode.registerListener(nodeListeners)
    return stageNode
  }

  React.useEffect(() => {
    if (!!template.name && !(template.spec as StageElementConfig)?.type) {
      openStageSelection(CREATE_NODE_ID)
    }
  }, [template.name, gitDetails])

  React.useEffect(() => {
    const stageType = (template.spec as StageElementConfig)?.type
    if (stageType) {
      setStageData(stagesCollection.getStageAttributes(stageType, getString))
    }
  }, [(template.spec as StageElementConfig)?.type])

  return (
    <Container
      className={css.container}
      background={Color.FORM_BG}
      width={'100%'}
      padding={{ left: 'xxxlarge', right: 'xxxlarge' }}
      ref={canvasRef}
      onClick={e => {
        const div = e.target as HTMLDivElement
        if (div === canvasRef.current?.children[0]) {
          dynamicPopoverHandler?.hide()
        }
      }}
    >
      <Layout.Vertical height={'100%'} flex={{ justifyContent: 'center', alignItems: 'flex-start' }} spacing={'small'}>
        <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_600}>
          Stage Type
        </Text>
        <Container>
          <Layout.Horizontal>
            <Container data-nodeid={CREATE_NODE_ID}>
              {stageData ? (
                <DefaultNodeWidget node={getStageNode(template.spec as StageElementConfig)} />
              ) : (
                <CreateNewWidget node={getCreateNode()} />
              )}
            </Container>
            <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_600} className={css.stageType}>
              {stageData?.name || ''}
            </Text>
          </Layout.Horizontal>
        </Container>
      </Layout.Vertical>
      <DynamicPopover
        darkMode={false}
        className={stageBuilderCss.renderPopover}
        render={renderPopover}
        bind={setDynamicPopoverHandler}
      />
    </Container>
  )
}
