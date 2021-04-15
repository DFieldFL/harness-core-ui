import React from 'react'
import { Icon } from '@wings-software/uicore'
import type { IconName } from '@wings-software/uicore'

import { String, StringKeys } from 'framework/exports'

import { Strategy, testIds } from './StrategyConfig'
import css from './StrategySelection.module.scss'

export const strategyIconMap: Record<Strategy, IconName> = {
  [Strategy.Ignore]: 'delete',
  [Strategy.Abort]: 'ban-circle',
  [Strategy.MarkAsSuccess]: 'tick',
  [Strategy.StageRollback]: 'repeat',
  [Strategy.StepGroupRollback]: 'repeat',
  [Strategy.Retry]: 'refresh',
  [Strategy.ManualIntervention]: 'hand-up'
}

export interface StrategyIconProps {
  strategy: Strategy
  onChange?(e: React.ChangeEvent<HTMLInputElement>): void
  checked?: boolean
}

const stringsMap: Record<Strategy, StringKeys> = {
  [Strategy.Ignore]: 'pipeline.failureStrategies.strategiesLabel.Ignore',
  [Strategy.Abort]: 'pipeline.failureStrategies.strategiesLabel.Abort',
  [Strategy.MarkAsSuccess]: 'pipeline.failureStrategies.strategiesLabel.MarkAsSuccess',
  [Strategy.StageRollback]: 'pipeline.failureStrategies.strategiesLabel.StageRollback',
  [Strategy.StepGroupRollback]: 'pipeline.failureStrategies.strategiesLabel.StepGroupRollback',
  [Strategy.Retry]: 'pipeline.failureStrategies.strategiesLabel.Retry',
  [Strategy.ManualIntervention]: 'pipeline.failureStrategies.strategiesLabel.ManualIntervention'
}

export function StrategyIcon({ strategy, onChange, checked }: StrategyIconProps): React.ReactElement {
  return (
    <label className={css.strategyIcon}>
      <div className={css.icon}>
        {checked ? <div className={css.checkMark} /> : null}
        <Icon name={strategyIconMap[strategy]} size={22} />
      </div>
      <String className={css.iconText} stringID={stringsMap[strategy]} />
      <input
        type="checkbox"
        data-testid={testIds[strategy]}
        name={name}
        value={strategy}
        onChange={onChange}
        checked={checked}
      />
    </label>
  )
}
