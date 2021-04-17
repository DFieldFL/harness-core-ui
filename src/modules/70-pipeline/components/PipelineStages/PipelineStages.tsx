import React from 'react'
import { useDeepCompareEffect } from '@common/hooks'
import { AddStageView } from './views/AddStageView'
import type { PipelineStageProps } from './PipelineStage'

// eslint-disable-next-line @typescript-eslint/ban-types
export interface PipelineStagesProps<T = {}> {
  children: Array<React.ReactElement<PipelineStageProps>>
  minimal?: boolean
  stageType?: string
  isParallel?: boolean
  getNewStageFromType?: (type: string, clearDefaultValues?: boolean) => T
  stageProps?: T
  onSelectStage?: (stageType: string, stage?: T) => void
  showSelectMenu?: boolean
}

interface PipelineStageMap extends Omit<PipelineStageProps, 'minimal'> {
  index: number
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function PipelineStages<T = {}>({
  children,
  showSelectMenu,
  isParallel = false,
  onSelectStage,
  getNewStageFromType,
  stageType,
  stageProps,
  minimal = false
}: PipelineStagesProps<T>): JSX.Element {
  const [stages, setStages] = React.useState<Map<string, PipelineStageMap>>(new Map())

  React.useLayoutEffect(() => {
    const stagesLocal: Map<string, PipelineStageMap> = new Map()
    const steps = React.Children.toArray(children) as React.ReactElement<PipelineStageProps>[]
    steps.forEach((child, i: number) => {
      stagesLocal.set(child.props.type, {
        ...child.props,
        index: i
      })
    })
    setStages(stagesLocal)
  }, [children])

  const [showMenu, setShowMenu] = React.useState(showSelectMenu)
  const [type, setType] = React.useState(stageType)

  React.useEffect(() => {
    if (stageType) {
      setType(stageType)
    }
  }, [stageType])

  React.useEffect(() => {
    if (showSelectMenu) {
      setShowMenu(true)
    }
  }, [showSelectMenu])
  const selected = stages.get(type || '')

  // We are using this to deep compare the selected var and run forceUpdate from popper js to recompute the position of the popover.
  // This stops an expanding popover from overflowing

  useDeepCompareEffect(() => {
    window.dispatchEvent(new CustomEvent('UPDATE_POPOVER_POSITION'))
  }, [selected])

  const selectedStageIndex = selected?.index || 0
  const stage = React.Children.toArray(children)[selectedStageIndex] as React.ReactElement<PipelineStageProps>
  return (
    <>
      {showSelectMenu && showMenu && (
        <AddStageView
          stages={[...stages].map(item => item[1])}
          isParallel={isParallel}
          callback={selectedType => {
            if (getNewStageFromType) {
              setShowMenu(false)
              setType(selectedType)
            } else {
              onSelectStage?.(selectedType)
            }
          }}
        />
      )}
      {!showSelectMenu && selected && stage && (
        <>{React.cloneElement(stage, { ...selected, key: selected.type, minimal, stageProps })}</>
      )}
      {!showMenu && showSelectMenu && type && stage && (
        <>
          {React.cloneElement(stage, {
            ...selected,
            minimal: true,
            stageProps: {
              data: getNewStageFromType?.(type, true),
              onSubmit: (stageData: T) => {
                onSelectStage?.(type, stageData)
              }
            }
          })}
        </>
      )}
    </>
  )
}
