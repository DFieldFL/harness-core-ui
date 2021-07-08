import React from 'react'
import { render, act, fireEvent, waitFor, queryByText, queryByAttribute, getByText } from '@testing-library/react'
import { TestWrapper, findDialogContainer, findPopoverContainer } from '@common/utils/testUtils'
import { setFieldValue, InputTypes } from '@common/utils/JestFormHelper'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { authSettings, mockResponse, permissionRequest } from '@auth-settings/pages/Configuration/__test__/mock'
import { AuthenticationMechanisms } from '@auth-settings/constants/utils'
import SAMLProvider from '../SAMLProvider'

jest.mock('services/cd-ng', () => ({
  useUploadSamlMetaData: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useUpdateSamlMetaData: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useGetSamlLoginTest: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse), refetch: () => Promise.resolve(mockResponse) }
  }),
  useDeleteSamlMetaData: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  }),
  useUpdateAuthMechanism: jest.fn().mockImplementation(() => {
    return { mutate: () => Promise.resolve(mockResponse) }
  })
}))

const refetchAuthSettings = jest.fn()
const setUpdating = jest.fn()

const samlSettings = {
  ...authSettings,
  ngAuthSettings: [
    {
      origin: 'harness.onelogin.com',
      logoutUrl: null,
      groupMembershipAttr: 'One Login Group',
      displayName: 'One Login',
      authorizationEnabled: true,
      settingsType: AuthenticationMechanisms.SAML
    }
  ],
  authenticationMechanism: AuthenticationMechanisms.SAML
}

const disabledSamlSettings = {
  ...samlSettings,
  authenticationMechanism: AuthenticationMechanisms.USER_PASSWORD
}

describe('SAML Provider', () => {
  test('Add SAML Provider', async () => {
    const { container } = render(
      <TestWrapper
        path={routes.toAuthenticationSettings({ ...accountPathProps })}
        pathParams={{ accountId: 'testAcc' }}
      >
        <SAMLProvider
          authSettings={authSettings}
          refetchAuthSettings={refetchAuthSettings}
          permissionRequest={permissionRequest}
          canEdit
          setUpdating={setUpdating}
        />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()

    const addSAMLProvider = queryByText(document.body, 'authSettings.plusSAMLProvider')
    expect(addSAMLProvider).toBeTruthy()
    act(() => {
      fireEvent.click(addSAMLProvider!)
    })

    await waitFor(() => queryByText(document.body, 'authSettings.addSAMLProvider'))
    const form = findDialogContainer()
    expect(form).toBeTruthy()

    const okta = queryByAttribute('data-icon', form!, 'service-okta')
    expect(okta).toBeTruthy()
    await act(async () => {
      fireEvent.click(okta!)
    })

    const changeButton = queryByText(document.body, 'change')
    act(() => {
      fireEvent.click(changeButton!)
    })

    const azure = queryByAttribute('data-icon', form!, 'service-azure')
    expect(azure).toBeTruthy()
    await act(async () => {
      fireEvent.click(azure!)
    })

    setFieldValue({ container: form!, type: InputTypes.TEXTFIELD, fieldId: 'displayName', value: 'Display name' })

    setFieldValue({ container: form!, type: InputTypes.TEXTFIELD, fieldId: 'groupMembershipAttr', value: 'MyGroup' })

    const addButton = queryByText(form!, 'add')
    await act(async () => {
      fireEvent.click(addButton!)
    })

    expect(queryByText(document.body, 'common.validation.fileIsRequired')).toBeTruthy()
  }),
    test('Edit SAML Provider', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <SAMLProvider
            authSettings={samlSettings}
            refetchAuthSettings={refetchAuthSettings}
            permissionRequest={permissionRequest}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const popoverButton = getByTestId('provider-button')
      fireEvent.click(popoverButton!)

      const popover = findPopoverContainer()

      const editSAMLProvider = getByText(popover!, 'edit')
      act(() => {
        fireEvent.click(editSAMLProvider)
      })

      await waitFor(() => getByText(document.body, 'authSettings.editSAMLProvider'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      const saveButton = queryByText(form!, 'save')
      await act(async () => {
        fireEvent.click(saveButton!)
      })

      expect(queryByText(document.body, 'authSettings.samlProviderUpdatedSuccessfully')).toBeTruthy()
    }),
    test('Delete SAML Provider', async () => {
      const { getByTestId } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <SAMLProvider
            authSettings={samlSettings}
            refetchAuthSettings={refetchAuthSettings}
            permissionRequest={permissionRequest}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const popoverButton = getByTestId('provider-button')
      fireEvent.click(popoverButton!)

      const popover = findPopoverContainer()

      const deleteSAMLProvider = getByText(popover!, 'delete')
      act(() => {
        fireEvent.click(deleteSAMLProvider)
      })

      await waitFor(() => getByText(document.body, 'authSettings.deleteSamlProvider'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      const confirmBtn = queryByText(form!, 'confirm')
      await act(async () => {
        fireEvent.click(confirmBtn!)
      })

      expect(queryByText(document.body, 'authSettings.samlProviderDeleted')).toBeTruthy()
    }),
    test('Cancel SAML provider modal', async () => {
      render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <SAMLProvider
            authSettings={authSettings}
            refetchAuthSettings={refetchAuthSettings}
            permissionRequest={permissionRequest}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const addSAMLProvider = queryByText(document.body, 'authSettings.plusSAMLProvider')
      expect(addSAMLProvider).toBeTruthy()
      act(() => {
        fireEvent.click(addSAMLProvider!)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.addSAMLProvider'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      const cancelButton = queryByText(form!, 'cancel')
      expect(cancelButton).toBeTruthy()
      await act(async () => {
        fireEvent.click(cancelButton!)
      })

      const removedForm = findDialogContainer()
      expect(removedForm).toBeFalsy()
    }),
    test('Enable SAML provider', async () => {
      const { container } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <SAMLProvider
            authSettings={disabledSamlSettings}
            refetchAuthSettings={refetchAuthSettings}
            permissionRequest={permissionRequest}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const radioButton = queryByText(container, 'authSettings.loginViaSAML')
      expect(radioButton).toBeTruthy()
      act(() => {
        fireEvent.click(radioButton!)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.enableSamlProvider'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      const confirmButton = queryByText(form!, 'confirm')
      expect(confirmButton).toBeTruthy()
      await act(async () => {
        fireEvent.click(confirmButton!)
      })

      expect(queryByText(document.body, 'authSettings.samlLoginEnabled')).toBeTruthy()
    }),
    test('Cancel enabling SAML provider', async () => {
      const { container } = render(
        <TestWrapper
          path={routes.toAuthenticationSettings({ ...accountPathProps })}
          pathParams={{ accountId: 'testAcc' }}
        >
          <SAMLProvider
            authSettings={disabledSamlSettings}
            refetchAuthSettings={refetchAuthSettings}
            permissionRequest={permissionRequest}
            canEdit
            setUpdating={setUpdating}
          />
        </TestWrapper>
      )

      const radioButton = queryByText(container, 'authSettings.loginViaSAML')
      expect(radioButton).toBeTruthy()
      act(() => {
        fireEvent.click(radioButton!)
      })

      await waitFor(() => queryByText(document.body, 'authSettings.enableSamlProvider'))
      const form = findDialogContainer()
      expect(form).toBeTruthy()

      const cancelButton = queryByText(form!, 'cancel')
      expect(cancelButton).toBeTruthy()
      await act(async () => {
        fireEvent.click(cancelButton!)
      })

      const removedForm = findDialogContainer()
      expect(removedForm).toBeFalsy()
    })
})
