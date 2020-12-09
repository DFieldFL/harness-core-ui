import React from 'react'
import { render, waitFor, queryByText, fireEvent } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { ModalProvider } from '@wings-software/uikit'
import { AppStoreContext as StringsContext, AppStoreContextProps } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/exports'
import strings from 'strings/strings.en.yaml'
import { GetTriggerResponse } from './webhookMockResponses'
import { GetPipelineResponse, GetTriggerListForTargetResponse } from './sharedMockResponses'
import TriggersPage from '../TriggersPage'

const mockDelete = jest.fn().mockReturnValue(Promise.resolve({ data: {}, status: {} }))
const mockUpdateTriggerStatus = jest.fn().mockReturnValue(Promise.resolve({ data: {}, status: {} }))
const mockRedirecToWizard = jest.fn()
jest.mock('services/cd-ng', () => ({
  useGetTriggerListForTarget: jest.fn(() => GetTriggerListForTargetResponse),
  useGetPipeline: jest.fn(() => GetPipelineResponse),
  useGetTrigger: jest.fn(() => GetTriggerResponse),
  useDeleteTrigger: jest.fn().mockImplementation(() => ({ mutate: mockDelete })),
  useUpdateTriggerStatus: jest.fn().mockImplementation(() => ({ mutate: mockUpdateTriggerStatus }))
}))

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(() => {
    return {
      projectIdentifier: 'projectIdentifier',
      orgIdentifier: 'orgIdentifier',
      accountId: 'accountId'
    }
  }),
  useHistory: jest.fn(() => {
    mockRedirecToWizard()
    return { push: jest.fn() }
  })
}))

const value: AppStoreContextProps = {
  projects: [],
  organisationsMap: new Map(),
  user: {},
  strings,
  updateAppStore: jest.fn()
}

const wrapper = ({ children }: React.PropsWithChildren<{}>): React.ReactElement => (
  <StringsContext.Provider value={value}>{children}</StringsContext.Provider>
)
const { result } = renderHook(() => useStrings(), { wrapper })

function WrapperComponent(): JSX.Element {
  return (
    <StringsContext.Provider value={value}>
      <TriggersPage />
    </StringsContext.Provider>
  )
}

describe('TriggersPage Triggers tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - Shows Trigger List', async () => {
      render(
        <ModalProvider>
          <WrapperComponent />
        </ModalProvider>
      )
      await waitFor(() =>
        expect(result.current.getString('pipeline-triggers.triggerLabel').toUpperCase()).not.toBeNull()
      )
      expect(document.body).toMatchSnapshot()
    })
  })
  describe('Interactivity', () => {
    test('Delete a trigger', async () => {
      const { container } = render(
        <ModalProvider>
          <WrapperComponent />
        </ModalProvider>
      )
      await waitFor(() =>
        expect(result.current.getString('pipeline-triggers.triggerLabel').toUpperCase()).not.toBeNull()
      )
      const firstActionButton = container.querySelectorAll('[class*="actionButton"]')?.[0]
      if (!firstActionButton) {
        throw Error('No action button')
      }
      fireEvent.click(firstActionButton)

      const deleteButton = queryByText(document.body, result.current.getString('delete'))

      if (!deleteButton) {
        throw Error('No error button')
      }
      fireEvent.click(deleteButton)
      await waitFor(() => expect(result.current.getString('pipeline-triggers.confirmDelete')).not.toBeNull())

      const confirmDeleteButton = document.body.querySelector('[class*="bp3-dialog-footer"] [class*="intent-primary"]')
      if (!confirmDeleteButton) {
        throw Error('No error button')
      }
      fireEvent.click(confirmDeleteButton)

      expect(mockDelete).toBeCalledWith('AllValues', { headers: { 'content-type': 'application/json' } })
    })

    test('Edit a trigger redirects to Trigger Wizard', async () => {
      const { container } = render(
        <ModalProvider>
          <WrapperComponent />
        </ModalProvider>
      )
      await waitFor(() =>
        expect(result.current.getString('pipeline-triggers.triggerLabel').toUpperCase()).not.toBeNull()
      )
      const firstActionButton = container.querySelectorAll('[class*="actionButton"]')?.[0]
      if (!firstActionButton) {
        throw Error('No action button')
      }
      fireEvent.click(firstActionButton)

      const editButton = queryByText(document.body, result.current.getString('edit'))

      if (!editButton) {
        throw Error('No edit button')
      }
      fireEvent.click(editButton)
      expect(mockRedirecToWizard).toBeCalled()
    })

    test('Add a trigger redirects to Trigger Wizard', async () => {
      const { container } = render(
        <StringsContext.Provider value={value}>
          <ModalProvider>
            <TriggersPage />
          </ModalProvider>
        </StringsContext.Provider>
      )
      await waitFor(() =>
        expect(result.current.getString('pipeline-triggers.triggerLabel').toUpperCase()).not.toBeNull()
      )
      const addTriggerButton = queryByText(container, result.current.getString('pipeline-triggers.newTrigger'))
      if (!addTriggerButton) {
        throw Error('No action button')
      }
      fireEvent.click(addTriggerButton)

      expect(mockRedirecToWizard).toBeCalled()
    })
  })
})
