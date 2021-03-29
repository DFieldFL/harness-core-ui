import React from 'react'
import { Button } from '@wings-software/uicore'
import { Collapse } from '@blueprintjs/core'
import cx from 'classnames'

import type { KeyValueCriteriaSpec, JexlCriteria, ConditionDTO } from 'services/pipeline-ng'
import { String } from 'framework/exports'

import css from '../ApprovalStepDetails.module.scss'

export interface JiraCriteriaProps {
  type: 'approval' | 'rejection'
  criteria: KeyValueCriteriaSpec | JexlCriteria
}

const titles: Record<JiraCriteriaProps['type'], string> = {
  approval: 'execution.approvals.approvalCriteriaTitle',
  rejection: 'execution.approvals.rejectionCriteriaTitle'
}

const conditionStr: Record<ConditionDTO['op'], string> = {
  equals: 'execution.approvals.conditions.equals',
  'not equals': 'execution.approvals.conditions.not_equals',
  contains: 'execution.approvals.conditions.contains',
  in: 'execution.approvals.conditions.in',
  'not in': 'execution.approvals.conditions.not_in'
}

export function JiraCriteria(props: JiraCriteriaProps): React.ReactElement {
  const { type, criteria } = props
  const [expanded, setExpanded] = React.useState(true)

  function toggle(): void {
    setExpanded(status => !status)
  }

  return (
    <div className={css.jiraCriteria}>
      <div className={css.title}>
        <String stringID={titles[type]} />
        <Button
          icon="chevron-down"
          minimal
          small
          className={cx(css.toggle, { [css.open]: expanded })}
          onClick={toggle}
        />
      </div>
      <Collapse isOpen={expanded}>
        {criteria.type === 'KeyValues' ? (
          <div className={css.collapseContainer}>
            <String
              tagName="div"
              stringID={
                criteria.matchAnyCondition
                  ? 'execution.approvals.anyConditionsMsg'
                  : 'execution.approvals.allConditionsMsg'
              }
            />
            <ul className={css.conditions}>
              {(criteria.conditions || []).map((condition: ConditionDTO, i: number) => (
                <li key={i}>
                  <String stringID={conditionStr[condition.op]} vars={condition} />
                  {condition.value.split(',').map((key, j) => (
                    <span className={css.key} key={j}>
                      {key}
                    </span>
                  ))}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {criteria.type === 'Jexl' ? (
          <div className={css.collapseContainer}>
            <String stringID="common.jexlExpression" />
            <div className={css.jexl}>{criteria.expression}</div>
          </div>
        ) : null}
      </Collapse>
    </div>
  )
}
