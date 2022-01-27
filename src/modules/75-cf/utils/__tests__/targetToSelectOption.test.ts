import type { Target } from 'services/cf'
import targetToSelectOption from '../targetToSelectOption'

describe('targetToSelectOption', () => {
  test('it should return a select option when passed a target', async () => {
    const target: Target = {
      identifier: 'test-123',
      name: 'Target Name',
      account: '',
      environment: '',
      org: '',
      project: ''
    }

    expect(targetToSelectOption(target)).toEqual(
      expect.objectContaining({ label: target.name, value: target.identifier })
    )
  })
})
