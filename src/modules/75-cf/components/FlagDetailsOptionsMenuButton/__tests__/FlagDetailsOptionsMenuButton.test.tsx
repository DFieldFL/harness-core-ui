/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { render, RenderResult, screen, waitFor, fireEvent } from '@testing-library/react'
import React from 'react'
import userEvent from '@testing-library/user-event'
import { TestWrapper } from '@common/utils/testUtils'
import mockFeature from '@cf/utils/testData/data/mockFeature'
import mockGitSync from '@cf/utils/testData/data/mockGitSync'
import * as gitSync from '@cf/hooks/useGitSync'
import * as useFeaturesMock from '@common/hooks/useFeatures'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import type { FlagDetailsOptionsMenuButtonProps } from '../FlagDetailsOptionsMenuButton'
import FlagDetailsOptionsMenuButton from '../FlagDetailsOptionsMenuButton'

const renderComponent = (props: Partial<FlagDetailsOptionsMenuButtonProps> = {}): RenderResult => {
  return render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <FlagDetailsOptionsMenuButton
        featureFlag={mockFeature}
        gitSync={{ ...mockGitSync, isGitSyncEnabled: false }}
        deleteFeatureFlag={jest.fn()}
        queryParams={{
          accountIdentifier: 'test_acc',
          org: 'test_org',
          project: 'test_project',
          commitMsg: 'test message'
        }}
        refetchFlag={jest.fn()}
        submitPatch={jest.fn(() => Promise.resolve(mockFeature))}
        {...props}
      />
    </TestWrapper>
  )
}

describe('FlagDetailsOptionsMenuButton', () => {
  beforeEach(() => jest.spyOn(useFeaturesMock, 'useGetFirstDisabledFeature').mockReturnValue({ featureEnabled: true }))

  test('it should render menu correctly when options button clicked', async () => {
    renderComponent()

    userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
    expect(document.querySelector('[data-icon="edit"]')).toBeInTheDocument()
    expect(document.querySelector('[data-icon="trash"]')).toBeInTheDocument()

    expect(screen.getAllByText('edit')[1]).toBeInTheDocument()
    expect(screen.getByText('delete')).toBeInTheDocument()
  })

  describe('FlagOptionsButton - Delete', () => {
    test('it should render confirm modal correctly when delete option clicked', async () => {
      renderComponent()

      userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

      expect(screen.getByText('cf.featureFlags.deleteFlag')).toBeInTheDocument()
      expect(screen.getByText('cf.featureFlags.deleteFlagMessage')).toBeInTheDocument()

      expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'cancel' })).toBeInTheDocument()
    })

    test('it should display plan enforcement popup when limits reached', async () => {
      jest
        .spyOn(useFeaturesMock, 'useGetFirstDisabledFeature')
        .mockReturnValue({ featureEnabled: false, disabledFeatureName: FeatureIdentifier.MAUS })

      renderComponent()

      userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)

      fireEvent.mouseOver(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

      await waitFor(() => expect(screen.getByText('cf.planEnforcement.upgradeRequired')).toBeInTheDocument())
    })

    test('it should call callback when confirm delete button clicked', async () => {
      const deleteFlagMock = jest.fn()

      renderComponent({ deleteFeatureFlag: deleteFlagMock })

      userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

      expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()

      userEvent.click(screen.getByRole('button', { name: 'delete' }))

      expect(deleteFlagMock).toBeCalledWith('new_flag', {
        queryParams: { accountIdentifier: 'test_acc', commitMsg: '', org: 'test_org', project: 'test_project' }
      })
    })

    test('it should open Git Modal when confirm delete button clicked and Git Sync enabled', async () => {
      jest.spyOn(gitSync, 'useGitSync').mockReturnValue(mockGitSync)
      const deleteFlagMock = jest.fn()

      renderComponent({ deleteFeatureFlag: deleteFlagMock, gitSync: mockGitSync })

      userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

      expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()

      userEvent.click(screen.getByRole('button', { name: 'delete' }))
      expect(document.querySelector('#save-flag-to-git-modal-body')).toBeInTheDocument()
    })

    test('it should close Git Modal when cancel button clicked', async () => {
      jest.spyOn(gitSync, 'useGitSync').mockReturnValue(mockGitSync)

      renderComponent({ gitSync: mockGitSync })

      userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

      expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()

      userEvent.click(screen.getByRole('button', { name: 'delete' }))
      expect(document.querySelector('#save-flag-to-git-modal-body')).toBeInTheDocument()

      userEvent.click(screen.getByTestId('save-flag-to-git-modal-cancel-button'))

      expect(document.querySelector('#save-flag-to-git-modal-body')).not.toBeInTheDocument()
    })

    test('it should call callback when confirm delete button clicked and Git Sync autocommit enabled', async () => {
      const deleteFlagMock = jest.fn()

      renderComponent({
        deleteFeatureFlag: deleteFlagMock,
        gitSync: { ...mockGitSync, isAutoCommitEnabled: true }
      })

      userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

      expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()

      userEvent.click(screen.getByRole('button', { name: 'delete' }))

      expect(deleteFlagMock).toBeCalledWith('new_flag', {
        queryParams: { accountIdentifier: 'test_acc', commitMsg: '', org: 'test_org', project: 'test_project' }
      })
    })

    test('it should call callback when Git Modal confirm button clicked', async () => {
      jest.spyOn(gitSync, 'useGitSync').mockReturnValue(mockGitSync)
      const deleteFlagMock = jest.fn()

      renderComponent({ deleteFeatureFlag: deleteFlagMock, gitSync: mockGitSync })

      userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

      expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()

      userEvent.click(screen.getByRole('button', { name: 'delete' }))
      expect(document.querySelector('#save-flag-to-git-modal-body')).toBeInTheDocument()

      // enter a commit message
      const commitTextbox = screen.getByPlaceholderText('common.git.commitMessage')
      userEvent.type(commitTextbox, 'test commit message')

      // submit
      userEvent.click(screen.getByTestId('save-flag-to-git-modal-save-button'))

      await waitFor(() =>
        expect(deleteFlagMock).toBeCalledWith('new_flag', {
          queryParams: {
            accountIdentifier: 'test_acc',
            commitMsg: 'test commit message',
            org: 'test_org',
            project: 'test_project'
          }
        })
      )
    })

    test('it should call callback when Git Modal confirm button clicked', async () => {
      jest.spyOn(gitSync, 'useGitSync').mockReturnValue(mockGitSync)
      const deleteFlagMock = jest.fn()

      renderComponent({ deleteFeatureFlag: deleteFlagMock, gitSync: mockGitSync })

      userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

      expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()

      userEvent.click(screen.getByRole('button', { name: 'delete' }))
      expect(document.querySelector('#save-flag-to-git-modal-body')).toBeInTheDocument()

      // enter a commit message
      const commitTextbox = screen.getByPlaceholderText('common.git.commitMessage')
      userEvent.type(commitTextbox, 'test commit message')

      // submit
      userEvent.click(screen.getByTestId('save-flag-to-git-modal-save-button'))

      await waitFor(() =>
        expect(deleteFlagMock).toBeCalledWith('new_flag', {
          queryParams: {
            accountIdentifier: 'test_acc',
            commitMsg: 'test commit message',
            org: 'test_org',
            project: 'test_project'
          }
        })
      )
    })

    test('it should call auto commit endpoint when auto commit value selected in Git Modal', async () => {
      jest.spyOn(gitSync, 'useGitSync').mockReturnValue(mockGitSync)
      const handleAutoCommitMock = jest.fn()

      renderComponent({ gitSync: { ...mockGitSync, handleAutoCommit: handleAutoCommitMock } })

      userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      userEvent.click(document.querySelector('[data-icon="trash"]') as HTMLButtonElement)

      expect(screen.getByRole('button', { name: 'delete' })).toBeInTheDocument()

      userEvent.click(screen.getByRole('button', { name: 'delete' }))
      expect(document.querySelector('#save-flag-to-git-modal-body')).toBeInTheDocument()

      // enter a commit message
      const commitTextbox = screen.getByPlaceholderText('common.git.commitMessage')
      userEvent.type(commitTextbox, 'test commit message')

      // toggle autocommit value
      const autoCommitCheckbox = document.querySelector("input[name='autoCommit']") as HTMLInputElement
      userEvent.click(autoCommitCheckbox)
      expect(autoCommitCheckbox).toBeChecked()

      // submit
      userEvent.click(screen.getByTestId('save-flag-to-git-modal-save-button'))

      await waitFor(() => expect(handleAutoCommitMock).toBeCalledWith(true))
    })
  })

  describe('FlagOptionsButton - Edit', () => {
    test('it should render edit flag modal correctly on click', async () => {
      renderComponent()

      userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      userEvent.click(document.querySelector('[data-icon="edit"]') as HTMLButtonElement)

      expect(screen.getByTestId('edit-flag-form')).toBeInTheDocument()

      expect(screen.getByTestId('edit-flag-form')).toHaveFormValues({
        name: 'new flag',
        description: '',
        permanent: false
      })

      expect(screen.getByText('save')).toBeInTheDocument()
      expect(screen.getByText('cancel')).toBeInTheDocument()
    })

    test('it should call callback correctly on save click', async () => {
      const submitPatchMock = jest.fn(() => Promise.resolve(mockFeature))

      renderComponent({ submitPatch: submitPatchMock })

      userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      userEvent.click(document.querySelector('[data-icon="edit"]') as HTMLButtonElement)

      userEvent.type(document.querySelector("input[name='name']") as HTMLInputElement, ' UPDATED')

      expect(document.querySelector("input[name='name']")).toHaveValue('new flag UPDATED')

      userEvent.click(screen.getByText('save'))

      await waitFor(() =>
        expect(submitPatchMock).toBeCalledWith({
          instructions: [
            {
              kind: 'updateName',
              parameters: {
                name: 'new flag UPDATED'
              }
            }
          ]
        })
      )

      // assert modal closes
      expect(screen.queryByTestId('edit-flag-form')).not.toBeInTheDocument()
    })

    test('it should close modal on cancel click', async () => {
      const submitPatchMock = jest.fn(() => Promise.resolve(mockFeature))

      renderComponent({ submitPatch: submitPatchMock })

      userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      userEvent.click(document.querySelector('[data-icon="edit"]') as HTMLButtonElement)

      userEvent.click(screen.getByText('cancel'))

      // assert modal closes
      expect(screen.queryByTestId('edit-flag-form')).not.toBeInTheDocument()
    })

    test('it should render edit flag modal correctly when Git Sync enabled on click', async () => {
      renderComponent({ gitSync: mockGitSync })

      userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      userEvent.click(document.querySelector('[data-icon="edit"]') as HTMLButtonElement)

      expect(screen.getByTestId('edit-flag-form')).toBeInTheDocument()

      expect(screen.getByTestId('edit-flag-form')).toHaveFormValues({
        name: 'new flag',
        description: '',
        permanent: false,
        'gitDetails.filePath': '/flags.yaml',
        'gitDetails.rootFolder': '/.harness/',
        'gitDetails.branch': 'main'
      })

      expect(screen.getByText('save')).toBeInTheDocument()
      expect(screen.getByText('cancel')).toBeInTheDocument()
    })

    test('it should call callback correctly on save click when Git Sync enabled', async () => {
      const submitPatchMock = jest.fn(() => Promise.resolve(mockFeature))

      renderComponent({ gitSync: mockGitSync, submitPatch: submitPatchMock })

      userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      userEvent.click(document.querySelector('[data-icon="edit"]') as HTMLButtonElement)

      await waitFor(() => expect(screen.getByTestId('edit-flag-form')).toBeInTheDocument())

      userEvent.type(document.querySelector("input[name='name']") as HTMLInputElement, ' UPDATED')
      userEvent.type(
        document.querySelector("textarea[name='gitDetails.commitMsg']") as HTMLInputElement,
        'Updating flag name'
      )

      expect(document.querySelector("input[name='name']")).toHaveValue('new flag UPDATED')
      expect(document.querySelector("textarea[name='gitDetails.commitMsg']")).toHaveValue('Updating flag name')

      userEvent.click(screen.getByText('save'))

      await waitFor(() =>
        expect(submitPatchMock).toBeCalledWith({
          gitDetails: {
            branch: 'main',
            commitMsg: 'Updating flag name',
            filePath: '/flags.yaml',
            repoIdentifier: 'harnesstest',
            rootFolder: '/.harness/'
          },
          instructions: [
            {
              kind: 'updateName',
              parameters: {
                name: 'new flag UPDATED'
              }
            }
          ]
        })
      )

      // assert modal closes
      expect(screen.queryByTestId('edit-flag-form')).not.toBeInTheDocument()
    })

    test('it should call auto commit endpoint when user toggles input', async () => {
      const handleAutoCommitMock = jest.fn()
      renderComponent({ gitSync: { ...mockGitSync, handleAutoCommit: handleAutoCommitMock } })

      userEvent.click(document.querySelector('[data-icon="Options"]') as HTMLButtonElement)
      userEvent.click(document.querySelector('[data-icon="edit"]') as HTMLButtonElement)

      await waitFor(() => expect(screen.getByTestId('edit-flag-form')).toBeInTheDocument())

      userEvent.type(document.querySelector("input[name='name']") as HTMLInputElement, ' UPDATED')
      userEvent.type(
        document.querySelector("textarea[name='gitDetails.commitMsg']") as HTMLInputElement,
        'Updating flag name'
      )

      expect(document.querySelector("input[name='name']")).toHaveValue('new flag UPDATED')
      expect(document.querySelector("textarea[name='gitDetails.commitMsg']")).toHaveValue('Updating flag name')

      const autoCommitCheckbox = document.querySelector("input[name='autoCommit']") as HTMLInputElement
      userEvent.click(autoCommitCheckbox)
      expect(autoCommitCheckbox).toBeChecked()

      userEvent.click(screen.getByText('save'))

      await waitFor(() => expect(handleAutoCommitMock).toBeCalledWith(true))

      // assert modal closes
      expect(screen.queryByTestId('edit-flag-form')).not.toBeInTheDocument()
    })
  })
})
