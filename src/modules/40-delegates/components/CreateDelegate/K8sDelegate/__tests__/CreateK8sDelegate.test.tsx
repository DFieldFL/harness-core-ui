import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CreateK8sDelegate from '../CreateK8sDelegate'
import DelegateSizesmock from './DelegateSizesmock.json'
jest.mock('modules/10-common/components/YAMLBuilder/YamlBuilder', () => {
  const ComponentToMock = () => <div>yamlDiv</div>
  return ComponentToMock
})
const mockGetCallFunction = jest.fn()
jest.mock('services/portal', () => ({
  useGetDelegateProfilesV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useGetDelegateSizes: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: DelegateSizesmock, refetch: jest.fn(), error: null, loading: false }
  }),
  useValidateKubernetesYaml: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  })
}))
describe('Create K8s Delegate', () => {
  test('render data', () => {
    const onBack = jest.fn()
    const { container } = render(
      <TestWrapper>
        <CreateK8sDelegate onBack={onBack} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
