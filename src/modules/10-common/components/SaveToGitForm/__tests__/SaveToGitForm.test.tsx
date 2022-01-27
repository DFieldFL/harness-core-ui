/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, act, fireEvent, RenderResult } from '@testing-library/react'
import { noop } from 'lodash-es'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import SaveToGitForm from '../SaveToGitForm'

const createGitSynRepo = jest.fn()
const fetchBranches = jest.fn(() => Promise.resolve([]))

jest.mock('services/cd-ng', () => ({
  usePostGitSync: jest.fn().mockImplementation(() => ({ mutate: createGitSynRepo })),
  getListOfBranchesByGitConfigPromise: jest.fn().mockImplementation(() => fetchBranches()),
  useGetListOfBranchesWithStatus: jest.fn().mockImplementation(() => fetchBranches()),
  getListOfBranchesWithStatusPromise: jest.fn().mockImplementation(() => Promise.resolve(['master', 'dev']))
}))

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }

describe('Save to git form', () => {
  const setup = (): RenderResult =>
    render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
      >
        <SaveToGitForm
          {...pathParams}
          isEditing={false}
          resource={{ type: 'Connectors', name: 'testConnector', identifier: 'testConnector' }}
          onSuccess={noop}
          onClose={noop}
        />
      </GitSyncTestWrapper>
    )

  test('rendering form to git save form without git credential in user profile', async () => {
    const { container, getByText } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
        gitSyncStoreValues={{ codeManagers: [] }}
      >
        <SaveToGitForm
          {...pathParams}
          isEditing={false}
          resource={{ type: 'Connectors', name: 'testConnector', identifier: 'testConnector' }}
          onSuccess={noop}
          onClose={noop}
        />
      </GitSyncTestWrapper>
    )
    await waitFor(() => {
      expect(getByText('common.git.saveResourceLabel')).toBeTruthy()
    })

    expect(container).toMatchSnapshot()
  })

  test('rendering form to save resouces', async () => {
    const { container, getByText } = setup()
    await waitFor(() => {
      expect(getByText('common.git.saveResourceLabel')).toBeTruthy()
    })

    // All required validation test
    await act(async () => {
      fireEvent.click(getByText('save'))
    })
    expect(container).toMatchSnapshot()
    const newBranchRadioBtn = document.querySelector('[data-test="newBranchRadioBtn"]')
    act(() => {
      fireEvent.click(newBranchRadioBtn!)
      expect(container).toMatchSnapshot()
    })
  })

  test('Test enabling branch selector logic', async () => {
    const { container } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
      >
        <SaveToGitForm
          {...pathParams}
          isEditing={false}
          resource={{
            type: 'Connectors',
            name: 'testConnector',
            identifier: 'testConnector',
            gitDetails: {
              branch: 'feature-branch'
            }
          }}
          onSuccess={noop}
          onClose={noop}
        />
      </GitSyncTestWrapper>
    )
    // for same branch, no value should be prepopulated in branch selector
    const branchSelectorInput = container.querySelector('input[name="targetBranch"]') as HTMLInputElement
    expect(branchSelectorInput).toBeTruthy()
    expect(branchSelectorInput.value).toBe('')
    const newBranchRadioBtn = document.querySelector('[data-test="newBranchRadioBtn"]') as HTMLInputElement
    await act(async () => {
      fireEvent.click(newBranchRadioBtn!)
      expect(newBranchRadioBtn.value).toBe('on')
      expect(branchSelectorInput.disabled).toBe(true)
      const createPRCheckbox = container.querySelector('input[name="createPr"]') as HTMLInputElement
      fireEvent.click(createPRCheckbox!)
      expect(createPRCheckbox.value).toBe('on')
    })
  })
})
