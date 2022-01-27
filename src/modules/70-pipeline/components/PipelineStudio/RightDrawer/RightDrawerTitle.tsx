import React from 'react'
import { Button, Icon, Text, Color, FontVariation, ButtonVariation, ButtonSize } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { usePipelineContext } from '../PipelineContext/PipelineContext'
import type { StepData } from '../../AbstractSteps/AbstractStepFactory'
import css from './RightDrawer.module.scss'

export function RightDrawerTitle(props: {
  stepType: string
  toolTipType: string
  stepData: StepData | null | undefined
  discardChanges: () => void
  applyChanges: () => void
}): JSX.Element {
  const { stepsFactory } = usePipelineContext()
  const { stepType, toolTipType, stepData } = props
  const { getString } = useStrings()
  return (
    <div className={css.stepConfig}>
      <div className={css.title}>
        <Icon
          name={stepsFactory.getStepIcon(stepType || '')}
          {...(stepsFactory.getStepIconColor(stepType || '')
            ? { color: stepsFactory.getStepIconColor(stepType || '') }
            : {})}
          style={{ color: stepsFactory.getStepIconColor(stepType || '') }}
          size={24}
        />
        <Text
          lineClamp={1}
          color={Color.BLACK}
          tooltipProps={{ dataTooltipId: `${stepType}_stepName${toolTipType}` }}
          font={{ variation: FontVariation.H4 }}
        >
          {stepData ? stepData?.name : stepsFactory.getStepName(stepType || '')}
        </Text>
      </div>
      <div>
        <Button
          variation={ButtonVariation.SECONDARY}
          size={ButtonSize.SMALL}
          className={css.applyChanges}
          text={getString('applyChanges')}
          onClick={props.applyChanges}
        />
        <Button minimal className={css.discard} text={getString('pipeline.discard')} onClick={props.discardChanges} />
      </div>
    </div>
  )
}
