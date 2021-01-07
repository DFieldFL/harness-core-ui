import React from 'react'
import { act, fireEvent, getByText, queryByText, render, RenderResult, waitFor } from '@testing-library/react'

import { findDialogContainer, findPopoverContainer, TestWrapper } from '@common/utils/testUtils'
import SecretsPage from '../SecretsPage'

import mockData from './secretsListMock.json'

jest.useFakeTimers()

describe('Secrets Page', () => {
  test('render data', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <SecretsPage mock={{ loading: false, data: mockData as any }} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('search', async () => {
    const { getByPlaceholderText } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <SecretsPage mock={{ loading: false, data: mockData as any }} />
      </TestWrapper>
    )

    const searchBox = getByPlaceholderText('Search')
    expect(searchBox).not.toBe(null)
    await act(async () => {
      fireEvent.change(searchBox!, { target: { value: 'test' } })
    })
    expect(searchBox).toMatchSnapshot()
  })

  test('render loading', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <SecretsPage mock={{ loading: true }} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render error', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <SecretsPage mock={{ loading: false, error: { message: 'Something Went Wrong' } as any }} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('render empty', () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <SecretsPage mock={{ loading: false, data: { data: { empty: true } } as any }} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})

jest.mock('react-timeago', () => () => 'dummy date')

describe('Secrets List', () => {
  let container: HTMLElement
  let getAllByText: RenderResult['getAllByText']

  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper path="/account/:accountId/resources/secrets" pathParams={{ accountId: 'dummy' }}>
        <SecretsPage mock={{ loading: false, data: mockData as any }} />
      </TestWrapper>
    )
    container = renderObj.container
    getAllByText = renderObj.getAllByText
  })

  test('render', () => {
    expect(container).toMatchSnapshot()
    expect(container.querySelectorAll('div.row').length).toBe(4)
  })

  test('Edit SSH', async () => {
    const menu = container?.querySelectorAll("[id='Options_svg__a']")[0]
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    const edit = getByText(popover as HTMLElement, 'Edit')
    await act(async () => {
      fireEvent.click(edit)
    })
    expect(container).toMatchSnapshot()
  })

  test('Edit SecretText', async () => {
    const menu = container?.querySelectorAll("[id='Options_svg__a']")[1]
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    const edit = getByText(popover as HTMLElement, 'Edit')
    await act(async () => {
      fireEvent.click(edit)
    })
    expect(container).toMatchSnapshot()
  })

  test('Edit SecretFile', async () => {
    const menu = container?.querySelectorAll("[id='Options_svg__a']")[2]
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    const edit = getByText(popover as HTMLElement, 'Edit')
    await act(async () => {
      fireEvent.click(edit)
    })
    expect(container).toMatchSnapshot()
  })

  test('Delete SSH', async () => {
    const menu = container?.querySelectorAll("[id='Options_svg__a']")[0]
    fireEvent.click(menu!)
    const popover = findPopoverContainer()
    const deleteButton = getByText(popover as HTMLElement, 'Delete')
    await act(async () => {
      fireEvent.click(deleteButton)
      await waitFor(() => getByText(document.body, 'Delete Secret'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()
      const deleteBtn = queryByText(form as HTMLElement, 'Delete')
      fireEvent.click(deleteBtn!)
    })
    expect(container).toMatchSnapshot()
  })

  test('Verify Connection SSH', async () => {
    const testConnection = getAllByText('TEST CONNECTION')[0]
    let form = findDialogContainer()
    await act(async () => {
      fireEvent.click(testConnection)
      await waitFor(() => getByText(document.body, 'Test Connection'))
    })
    form = findDialogContainer()
    expect(form).toBeTruthy()
    await act(async () => {
      fireEvent.click(form?.querySelector('[icon="cross"]')!)
    })
    form = findDialogContainer()
    expect(form).not.toBeTruthy()
  })
})
