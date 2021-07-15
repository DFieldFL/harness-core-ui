import React from 'react'
import { fireEvent, act, render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import DelegateConfigurations from '../DelegateConfigurations'
import ProfileMock from './ProfilesMock'

const mockGetCallFunction = jest.fn()
jest.mock('services/cd-ng', () => ({
  useListDelegateConfigsNgV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: ProfileMock, refetch: jest.fn(), error: null, loading: false }
  }),
  useDeleteDelegateConfigNgV2: jest.fn().mockImplementation(args => {
    mockGetCallFunction(args)
    return { data: {}, refetch: jest.fn(), error: null, loading: false }
  }),
  useAddDelegateProfileNgV2: jest.fn().mockImplementation(() => ({
    mutate: jest.fn()
  }))
}))

jest.mock('@common/exports', () => ({
  TimeAgo: jest.fn().mockImplementation(() => <div />),
  useConfirmationDialog: jest.fn().mockImplementation(async ({ onCloseDialog }) => {
    await onCloseDialog(true)
  })
}))

describe('Delegates Configurations Page', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateConfigurations />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })
  test('render data and add new', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateConfigurations />
      </TestWrapper>
    )

    const addBtn = container.getElementsByTagName('button')[0]
    act(() => {
      fireEvent.click(addBtn)
    })

    expect(container).toMatchSnapshot()
  })
  test('delete delegate configuration', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/delegates" pathParams={{ accountId: 'dummy' }}>
        <DelegateConfigurations />
      </TestWrapper>
    )

    const allSvgMenus = container.querySelectorAll('svg[data-icon="more"]')
    const nonPrimaryProfileMenu = allSvgMenus[1]

    fireEvent.click(nonPrimaryProfileMenu!)

    const deleteAction = document.body.querySelector('span[icon="cross"]')
    fireEvent.click(deleteAction!)
    expect(container).toMatchSnapshot()
  })
})
