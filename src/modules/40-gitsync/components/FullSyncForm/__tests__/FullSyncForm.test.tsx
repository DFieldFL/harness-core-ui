/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, queryByText } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { noop } from 'lodash-es'
import { GitSyncTestWrapper } from '@common/utils/gitSyncTestUtils'
import FullSyncForm from '../FullSyncForm'
import mockFullSyncConfig from './mockData/mockConfig.json'

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }

const fetchBranches = jest.fn(() => Promise.resolve([]))

jest.mock('services/cd-ng', () => ({
  createGitFullSyncConfigPromise: jest.fn().mockImplementation(() => noop()),
  triggerFullSyncPromise: jest.fn().mockImplementation(() => noop()),
  getListOfBranchesWithStatusPromise: jest.fn().mockImplementation(() => fetchBranches()),
  useGetGitFullSyncConfig: jest.fn().mockImplementation(() => {
    return { loading: false, data: mockFullSyncConfig }
  })
}))

describe('Test GitFullSyncForm', () => {
  test('Should render GitFullSyncForm', async () => {
    const { container } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
      >
        <FullSyncForm
          isNewUser={true}
          onClose={noop}
          onSuccess={noop}
          orgIdentifier={'default'}
          projectIdentifier={'dummyProject'}
        />
      </GitSyncTestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
  test('Should have new branch input hidden by default and it should appear when user selects it', async () => {
    const { container, getByText } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
      >
        <FullSyncForm
          isNewUser={true}
          onClose={noop}
          onSuccess={noop}
          orgIdentifier={'default'}
          projectIdentifier={'dummyProject'}
        />
      </GitSyncTestWrapper>
    )
    await waitFor(() => {
      expect(getByText('gitsync.createBranchTitle')).toBeDefined()
      const branchSelectorInput = container.querySelectorAll('input[name="branch"]') as unknown as HTMLInputElement[]
      expect(branchSelectorInput[0]).toBeTruthy()
      expect(branchSelectorInput[0].disabled).toBe(false)
      expect(queryByText(container, 'common.git.branchName')).toBeFalsy()
    })

    await act(async () => {
      const newBranchRadioBtn = document.querySelector('[data-test="newBranchRadioBtn"]') as HTMLInputElement
      fireEvent.click(newBranchRadioBtn!)
      expect(newBranchRadioBtn.value).toBe('on')
    })
  })

  test('Should have PR title hidden by default and it should appear when user selects create PR', async () => {
    const { container, getByText } = render(
      <GitSyncTestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
      >
        <FullSyncForm
          isNewUser={true}
          onClose={noop}
          onSuccess={noop}
          orgIdentifier={'default'}
          projectIdentifier={'dummyProject'}
        />
      </GitSyncTestWrapper>
    )

    await waitFor(() => {
      expect(getByText('gitsync.createBranchTitle')).toBeDefined()
    })

    expect(container.querySelector('input[name="prTitle"]')).toBeFalsy()
  })
})
