import { renderHook } from '@testing-library/react-hooks'

import { TestWrapper } from '@common/utils/testUtils'

import { useModuleInfo } from '../useModuleInfo'

describe('useModuleInfo tests', () => {
  test('works with hardcoded path', () => {
    const { result } = renderHook(() => useModuleInfo(), {
      wrapper: TestWrapper,
      initialProps: { path: '/account/my_account_id/cd/orgs/my_org/projects/my_project' }
    })

    expect(result.current.module).toBe('cd')
  })

  test('works with paramterized path', () => {
    const { result } = renderHook(() => useModuleInfo(), {
      wrapper: TestWrapper,
      initialProps: {
        path: '/account/:accountId/:module(cd)/orgs/:orgIdentifier/projects/:projectIdentifier',
        pathParams: {
          projectIdentifier: 'my_project',
          orgIdentifier: 'my_org',
          module: 'cd',
          accountId: 'my_account_id'
        }
      }
    })

    expect(result.current.module).toBe('cd')
  })

  test('handles other paths', () => {
    const { result } = renderHook(() => useModuleInfo(), {
      wrapper: TestWrapper,
      initialProps: {
        path: '/login'
      }
    })

    expect(result.current.module).toBe(undefined)
  })
})
