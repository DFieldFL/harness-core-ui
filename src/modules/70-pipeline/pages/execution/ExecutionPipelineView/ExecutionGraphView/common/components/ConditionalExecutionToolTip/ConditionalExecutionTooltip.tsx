import React from 'react'
import { Color, Container, Icon, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import {
  ModeEntityNameMap,
  ParentModeEntityNameMap,
  PipelineOrStageStatus,
  statusToStatusMapping,
  statusToStringIdMapping
} from '@pipeline/components/PipelineSteps/AdvancedSteps/ConditionalExecutionPanel/ConditionalExecutionPanelUtils'
import { Modes } from '@pipeline/components/PipelineSteps/AdvancedSteps/common'
import type { StringsMap } from 'stringTypes'
import type { ConditionalExecutionNodeRunInfo } from '@pipeline/utils/types'
import type { ExpressionBlock } from 'services/cd-ng'

export interface ConditionalExecutionToolTipProps {
  mode: Modes
  data: ConditionalExecutionNodeRunInfo
}

const processConditionData = (
  whenCondition: string
): {
  status: PipelineOrStageStatus
  statusStringId: keyof StringsMap
  condition: string | undefined
} => {
  const whenConditionInfo: string[] = whenCondition.split(' && ')
  const statusInfo: string = whenConditionInfo.shift()!.replace(/[^a-zA-Z]/g, '')
  let condition
  if (whenConditionInfo.length > 0) {
    condition = whenConditionInfo.join(' && ').slice(1, -1)
  }
  return {
    status: statusToStatusMapping[statusInfo],
    statusStringId: statusToStringIdMapping[statusInfo],
    condition
  }
}

const processResolvedVariables = (expressions: ExpressionBlock[] | undefined) => {
  const resolvedVariablesStrings: string[] = []
  expressions?.forEach(expression => {
    const expressionStr: string = expression.expression || ''
    if (!!expressionStr && !statusToStatusMapping[expressionStr]) {
      const str: string = expressionStr.split('.').pop() + ' = ' + expression.expressionValue
      resolvedVariablesStrings.push(str)
    }
  })
  return resolvedVariablesStrings
}

export default function ConditionalExecutionTooltip(props: ConditionalExecutionToolTipProps): React.ReactElement {
  const {
    mode,
    data: { whenCondition, expressions }
  } = props
  const { getString } = useStrings()
  const { status, statusStringId, condition } = processConditionData(whenCondition!)
  const resolvedVariablesStrings = processResolvedVariables(expressions)

  if (status === PipelineOrStageStatus.SUCCESS && !condition?.trim()) {
    return <></>
  }

  return (
    <Layout.Horizontal
      border={{ top: true, width: 0.5, color: Color.GREY_200 }}
      padding={{ right: 'xlarge', top: 'small', bottom: 'small', left: 'small' }}
    >
      <Container flex={{ justifyContent: 'center', alignItems: 'start' }} width={32}>
        <Icon name="conditional-execution" color={Color.GREY_600} size={20} />
      </Container>
      <Layout.Vertical spacing={'xsmall'} style={{ flex: 1 }} data-testid="hovercard-service">
        <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.BLACK}>
          {mode === Modes.STAGE && getString('pipeline.conditionalExecution.toolTip.stageTitle')}
          {mode === Modes.STEP && getString('pipeline.conditionalExecution.toolTip.stepTitle')}
        </Text>
        <Text
          padding={{ top: 'xsmall', bottom: condition !== undefined ? 'xsmall' : 'none' }}
          font={{ size: 'xsmall' }}
          style={{ lineHeight: '16px' }}
          color={Color.GREY_900}
        >
          {getString(statusStringId, {
            entity: ModeEntityNameMap[mode],
            parentEntity: ParentModeEntityNameMap[mode]
          })}
          {!!condition && (
            <Text
              inline={true}
              color={Color.BLACK}
              font={{ size: 'xsmall', weight: 'semi-bold' }}
              padding={{ left: 'xsmall', right: 'xsmall' }}
              margin={{ left: 'xsmall', right: 'xsmall' }}
              background={Color.GREY_100}
              border={{ radius: 3, color: Color.GREY_100 }}
            >
              {getString('pipeline.and')}
            </Text>
          )}
          {!!condition && getString('pipeline.conditionalExecution.belowExpression')}
        </Text>
        {!!condition && (
          <Container
            padding={'small'}
            background={Color.GREY_100}
            color={Color.GREY_900}
            font={{ size: 'small' }}
            style={{ wordBreak: 'break-word' }}
            border={{ width: 0.5, color: Color.GREY_200, radius: 4 }}
          >
            {condition}
          </Container>
        )}
        {resolvedVariablesStrings.length > 0 && (
          <Layout.Vertical spacing={'xsmall'}>
            <Text
              padding={{ top: 'small', bottom: 'xsmall' }}
              font={{ size: 'xsmall', weight: 'semi-bold' }}
              color={Color.GREY_500}
            >
              {getString('pipeline.conditionalExecution.toolTip.resolvedVariables')}
            </Text>
            {resolvedVariablesStrings.map(resolvedVariablesString => {
              return (
                <Text key={resolvedVariablesString} font={{ size: 'xsmall' }} lineClamp={1} color={Color.GREY_900}>
                  {resolvedVariablesString}
                </Text>
              )
            })}
          </Layout.Vertical>
        )}
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}
