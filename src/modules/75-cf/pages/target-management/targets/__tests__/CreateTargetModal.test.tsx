import React from 'react'
import {
  act,
  render,
  waitFor,
  getByText,
  fireEvent,
  getByPlaceholderText,
  getAllByPlaceholderText
} from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CreateTargetModal from '../CreateTargetModal'

describe('CreateTargetModal', () => {
  test('CreateTargetModal should render initial state correctly', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <CreateTargetModal loading={true} onSubmitTargets={jest.fn()} onSubmitUpload={jest.fn()} />
      </TestWrapper>
    )

    expect(getByText(container, 'cf.targets.create')).toBeDefined()

    const button = container.querySelector('button[type="button"]') as HTMLElement
    expect(button).toBeDefined()
    fireEvent.click(getByText(container, 'cf.targets.create'))

    await waitFor(() => expect(document.querySelector('.bp3-portal')).toBeDefined())

    expect(document.querySelector('.bp3-portal')).toMatchSnapshot()
  })

  test('CreateTargetModal should call callbacks properly', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }
    const onSubmitTargets = jest.fn()
    const onSubmitUpload = jest.fn()

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <CreateTargetModal loading={false} onSubmitTargets={onSubmitTargets} onSubmitUpload={onSubmitUpload} />
      </TestWrapper>
    )

    fireEvent.click(getByText(container, 'cf.targets.create'))

    await waitFor(() => expect(document.querySelector('.bp3-portal')).toBeDefined())

    fireEvent.change(document.querySelector('input[placeholder="cf.targets.enterName"]') as HTMLInputElement, {
      target: { value: 'Target1' }
    })
    fireEvent.change(document.querySelector('input[placeholder="cf.targets.enterValue"]') as HTMLInputElement, {
      target: { value: 'Target1' }
    })

    await waitFor(() =>
      expect(
        document.querySelector(
          '.bp3-portal [style*="height"] > button[type="button"][class*="intent-primary"][class*=disabled]'
        )
      ).toBeNull()
    )

    await act(async () => {
      fireEvent.click(
        document.querySelector(
          '.bp3-portal [style*="height"] > button[type="button"][class*="intent-primary"]'
        ) as HTMLButtonElement
      )
    })

    expect(onSubmitTargets).toBeCalledTimes(1)
  })

  test('CreateTargetModal should prevent invalid input', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <CreateTargetModal loading={true} onSubmitTargets={jest.fn()} onSubmitUpload={jest.fn()} />
      </TestWrapper>
    )

    expect(getByText(container, 'cf.targets.create')).toBeDefined()

    fireEvent.click(getByText(container, 'cf.targets.create'))

    const modal = document.querySelector('.bp3-portal') as HTMLElement
    await waitFor(() => expect(modal).toBeDefined())

    const nameInputField = getByPlaceholderText(modal, 'cf.targets.enterName') as HTMLInputElement
    const identifierInputField = getByPlaceholderText(modal, 'cf.targets.enterValue') as HTMLInputElement

    // valid input accepted
    fireEvent.input(nameInputField, { target: { value: 'name' } })
    expect(nameInputField.value).toEqual('name')

    fireEvent.input(identifierInputField, { target: { value: 'id' } })
    expect(identifierInputField.value).toEqual('id')

    // invalid input rejected
    fireEvent.input(nameInputField, { target: { value: '[]{}++' } })
    expect(nameInputField.value).toEqual('name')

    fireEvent.input(identifierInputField, { target: { value: '[]{}++' } })
    expect(identifierInputField.value).toEqual('id')
  })

  test('CreateTargetModal can add and remove rows', async () => {
    const params = { accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }

    const { container } = render(
      <TestWrapper
        path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/onboarding/detail"
        pathParams={params}
      >
        <CreateTargetModal loading={true} onSubmitTargets={jest.fn()} onSubmitUpload={jest.fn()} />
      </TestWrapper>
    )

    expect(getByText(container, 'cf.targets.create')).toBeDefined()

    await act(async () => {
      fireEvent.click(getByText(container, 'cf.targets.create'))
    })

    const modal = document.querySelector('.bp3-portal') as HTMLElement
    await waitFor(() => expect(modal).toBeDefined())

    // add row
    expect(getAllByPlaceholderText(modal, 'cf.targets.enterName').length).toBe(1)
    await act(async () => {
      fireEvent.click(document.querySelector('.bp3-icon-plus') as HTMLElement)
    })
    expect(getAllByPlaceholderText(modal, 'cf.targets.enterName').length).toBe(2)

    // remove row
    await act(async () => {
      fireEvent.click(document.querySelector('.bp3-icon-minus') as HTMLElement)
    })

    expect(getAllByPlaceholderText(modal, 'cf.targets.enterName').length).toBe(1)
  })
})
