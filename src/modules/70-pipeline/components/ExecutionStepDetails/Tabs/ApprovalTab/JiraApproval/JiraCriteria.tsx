import React from 'react'
import { Button } from '@wings-software/uicore'
import { Collapse } from '@blueprintjs/core'
import cx from 'classnames'

import type { KeyValueCriteriaSpec, JexlCriteriaSpec, ConditionDTO } from 'services/pipeline-ng'
import { String, StringKeys } from 'framework/exports'

import css from '../ApprovalStepDetails.module.scss'

export interface JiraCriteriaProps {
  type: 'approval' | 'rejection'
  criteria: KeyValueCriteriaSpec | JexlCriteriaSpec
}

const titles: Record<JiraCriteriaProps['type'], StringKeys> = {
  approval: 'pipeline.jiraApprovalStep.approvalCriteria',
  rejection: 'pipeline.jiraApprovalStep.rejectionCriteria'
}

const conditionStr: Record<ConditionDTO['operator'], StringKeys> = {
  equals: 'execution.approvals.conditions.equals',
  'not equals': 'execution.approvals.conditions.not_equals',
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
                  <String stringID={conditionStr[condition.operator]} vars={condition} />
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
