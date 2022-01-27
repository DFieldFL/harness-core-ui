/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@wings-software/uicore'
import type { Clause, Target } from 'services/cf'
import { getRulesInstructions, getTargetInstructions } from '../getInstructions'

describe('getInstructions', () => {
  describe('getTargetInstructions', () => {
    const existingTargets = [{ identifier: 'xyz' }, { identifier: '987' }] as Target[]

    const selections: SelectOption[] = [
      { label: 'ABC', value: 'abc' },
      { label: 'Already Selected', value: 'xyz' },
      { label: '123', value: '123' }
    ]

    test('it should call the add fn for new selections', async () => {
      const addFnMock = jest.fn()

      getTargetInstructions(existingTargets, selections, addFnMock, jest.fn())

      expect(addFnMock).toHaveBeenCalledWith([selections[0].value, selections[2].value])
      expect(addFnMock).not.toEqual(expect.arrayContaining([selections[1].value]))
    })

    test('it should call the remove fn for targets not included in the selection', async () => {
      const removeFnMock = jest.fn()

      getTargetInstructions(existingTargets, selections, jest.fn(), removeFnMock)

      expect(removeFnMock).toHaveBeenCalledWith([existingTargets[1].identifier])
    })
  })

  describe('getRulesInstructions', () => {
    test('it should return instructions to remove existing rules', async () => {
      const existing = [{ id: '123' }, { id: 'xyz' }, { id: 'abc' }] as Clause[]
      const rules = [{ id: 'xyz' }] as Clause[]

      expect(getRulesInstructions(existing, rules)).toEqual([
        { kind: 'removeClause', parameters: { clauseID: existing[0].id } },
        { kind: 'removeClause', parameters: { clauseID: existing[2].id } }
      ])
    })

    test('it should return instructions to add new rules', async () => {
      const rules = [{ id: '', attribute: 'hello', op: 'starts_with', values: ['something'] }] as Clause[]

      expect(getRulesInstructions([], rules)).toEqual([
        {
          kind: 'addClause',
          parameters: {
            attribute: rules[0].attribute,
            op: rules[0].op,
            values: rules[0].values
          }
        }
      ])
    })

    test('it should return instructions to edit existing rules', async () => {
      const existing: Clause[] = [
        {
          id: '123',
          attribute: 'hello',
          op: 'starts_with',
          values: ['something'],
          negate: false
        }
      ]
      const rules: Clause[] = [
        {
          id: '123',
          attribute: 'goodbye',
          op: 'ends_with',
          values: ['something', 'else'],
          negate: false
        }
      ]

      expect(getRulesInstructions(existing, rules)).toEqual([
        {
          kind: 'updateClause',
          parameters: {
            clauseID: rules[0].id,
            attribute: rules[0].attribute,
            op: rules[0].op,
            values: rules[0].values
          }
        }
      ])
    })
  })
})
