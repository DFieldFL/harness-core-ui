import { isEqual, omit } from 'lodash-es'
import type { SelectOption } from '@wings-software/uicore'
import type { Clause, Target } from 'services/cf'
import patch, { getDiff, Instruction } from '@cf/utils/instructions'

export function getTargetInstructions(
  existing: Target[],
  selections: SelectOption[],
  addFn: (targets: string[]) => Instruction,
  removeFn: (targets: string[]) => Instruction
): Instruction[] {
  const instructions: Instruction[] = []
  const selectionIds = selections.map(({ value }) => value as string)

  const [newTargets, removedTargets] = getDiff<string, string>(
    existing.map(({ identifier }) => identifier),
    selectionIds
  )

  if (newTargets.length) {
    instructions.push(addFn(newTargets))
  }

  if (removedTargets.length) {
    instructions.push(removeFn(removedTargets))
  }

  return instructions
}

export function getRulesInstructions(existing: Clause[], rules: Clause[]): Instruction[] {
  const removedRules = existing.filter(({ id: existingId }) => !rules.find(({ id }) => id === existingId))

  const newRules = rules.filter(rule => !rule?.id)

  const editedRules = rules.filter(rule => {
    const existingRule = existing.find(({ id }) => id === rule.id)

    return !!existingRule && !isEqual(rule, existingRule)
  })

  return [
    ...removedRules.map(({ id }) => patch.creators.removeClauseOnSegment(id)),
    ...newRules.map(rule => patch.creators.addClauseToSegment(omit(rule, ['id']))),
    ...editedRules.map(rule =>
      patch.creators.updateClauseOnSegment({ ...omit(rule, ['id', 'negate']), clauseID: rule.id })
    )
  ]
}
