import React from 'react'
import { render, act, fireEvent, waitFor, queryByText, queryAllByText } from '@testing-library/react'
import { TestWrapper, findDialogContainer } from '@common/utils/testUtils'
import LockoutPolicy from '@common/pages/AuthenticationSettings/Configuration/AccountAndOAuth/HarnessAccount/LockoutPolicy/LockoutPolicy'
import { mockResponse, loginSettings } from '@common/pages/AuthenticationSettings/__test__/mock'

const refetchAuthSettings = jest.fn()

jest.mock('services/cd-ng', () => ({
  updateLoginSettings: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  usePutLoginSettings: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  })
}))

const disabledLockoutPolicy = {
  ...loginSettings,
  userLockoutPolicy: {
    ...loginSettings.userLockoutPolicy,
    enableLockoutPolicy: false
  }
}

describe('LockoutPolicy', () => {
  test('Disable lockout policy', async () => {
    const { getByTestId, container } = render(
      <TestWrapper path="/account/:accountId/admin/authentication/configuration" pathParams={{ accountId: 'testAcc' }}>
        <LockoutPolicy loginSettings={loginSettings} refetchAuthSettings={refetchAuthSettings} />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const toggleLockoutPolicy = getByTestId('toggle-lockout-policy')
    act(() => {
      fireEvent.click(toggleLockoutPolicy)
    })

    await waitFor(() => queryByText(document.body, 'common.authSettings.disableLockoutPolicy'))
    const confirmDisable = findDialogContainer()
    expect(confirmDisable).toBeTruthy()

    const confirmBtn = queryByText(confirmDisable!, 'confirm')
    await act(async () => {
      fireEvent.click(confirmBtn!)
    })

    expect(queryByText(document.body, 'common.authSettings.lockoutPolicyDisabled')).toBeTruthy()
  }),
    test('Cancel enable lockout policy', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path="/account/:accountId/admin/authentication/configuration"
          pathParams={{ accountId: 'testAcc' }}
        >
          <LockoutPolicy loginSettings={disabledLockoutPolicy} refetchAuthSettings={refetchAuthSettings} />
        </TestWrapper>
      )

      const toggleLockoutPolicy = getByTestId('toggle-lockout-policy')
      act(() => {
        fireEvent.click(toggleLockoutPolicy)
      })

      await waitFor(() => queryByText(document.body, 'common.authSettings.lockoutPolicy'))
      const lockoutPolicyForm = findDialogContainer()
      expect(lockoutPolicyForm).toBeTruthy()

      const cancelButton = queryByText(lockoutPolicyForm!, 'cancel')
      await act(async () => {
        fireEvent.click(cancelButton!)
      })

      expect(cancelButton).toMatchSnapshot()
    }),
    test('Enable lockout policy', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path="/account/:accountId/admin/authentication/configuration"
          pathParams={{ accountId: 'testAcc' }}
        >
          <LockoutPolicy loginSettings={disabledLockoutPolicy} refetchAuthSettings={refetchAuthSettings} />
        </TestWrapper>
      )

      const toggleLockoutPolicy = getByTestId('toggle-lockout-policy')
      act(() => {
        fireEvent.click(toggleLockoutPolicy)
      })

      await waitFor(() => queryByText(document.body, 'common.authSettings.lockoutPolicy'))
      const lockoutPolicyForm = findDialogContainer()
      expect(lockoutPolicyForm).toBeTruthy()

      const notifyUserCheckbox = queryByText(lockoutPolicyForm!, 'common.authSettings.notifyUsersWhenTheyLocked')

      const saveButton = queryByText(lockoutPolicyForm!, 'save')
      await act(async () => {
        fireEvent.click(notifyUserCheckbox!)
        fireEvent.click(saveButton!)
      })

      expect(queryAllByText(document.body, 'common.authSettings.lockoutPolicyEnabled')).toBeTruthy()
    }),
    test('Update LockoutPolicy', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path="/account/:accountId/admin/authentication/configuration"
          pathParams={{ accountId: 'testAcc' }}
        >
          <LockoutPolicy loginSettings={loginSettings} refetchAuthSettings={refetchAuthSettings} />
        </TestWrapper>
      )

      const updateLockoutPolicy = getByTestId('update-lockout-policy')
      act(() => {
        fireEvent.click(updateLockoutPolicy)
      })

      await waitFor(() => queryByText(document.body, 'common.authSettings.lockoutPolicy'))
      const lockoutPolicyForm = findDialogContainer()
      expect(lockoutPolicyForm).toBeTruthy()

      const saveButton = queryByText(lockoutPolicyForm!, 'save')
      await act(async () => {
        fireEvent.click(saveButton!)
      })

      expect(queryAllByText(document.body, 'common.authSettings.lockoutPolicyEnabled')).toBeTruthy()
    })
})
