/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { fireEvent, render, waitFor, queryByAttribute, findAllByText, findByText } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { noop } from 'lodash-es'
import { TestWrapper } from '@common/utils/testUtils'
import useCreateGitSyncModal from '@gitsync/modals/useCreateGitSyncModal'
import { gitHubMock } from '@gitsync/components/gitSyncRepoForm/__tests__/mockData'

const pathParams = { accountId: 'dummy', orgIdentifier: 'default', projectIdentifier: 'dummyProject' }

const createGitSynRepo = jest.fn()
const getGitConnector = jest.fn(() => Promise.resolve({}))
const isSaas = jest.fn(() =>
  Promise.resolve({
    data: { saasGit: true }
  })
)

jest.mock('services/cd-ng', () => ({
  usePostGitSync: jest.fn().mockImplementation(() => ({ mutate: createGitSynRepo })),
  useGetConnector: jest.fn().mockImplementation(() => ({ data: gitHubMock, refetch: getGitConnector })),
  getConnectorListPromise: jest.fn().mockImplementation(() => Promise.resolve(gitHubMock)),
  getListOfBranchesByConnectorPromise: jest
    .fn()
    .mockResolvedValue({ data: ['master', 'devBranch'], status: 'SUCCESS' }),
  useGetTestGitRepoConnectionResult: jest.fn().mockImplementation(() => ({ mutate: jest.fn })),
  useIsSaasGit: jest.fn().mockImplementation(() => ({ mutate: isSaas })),
  usePostGitSyncSetting: jest.fn().mockImplementation(() => {
    return {
      mutate: jest.fn()
    }
  })
}))

describe('Test useCreateGitSyncModal', () => {
  const TestComponent = () => {
    const { openGitSyncModal } = useCreateGitSyncModal({
      onSuccess: noop,
      onClose: noop
    })
    return (
      <div
        className="useCreateGitSyncModalTestOpenDialog"
        onClick={() => openGitSyncModal(true, false, undefined)}
      ></div>
    )
  }
  test('should open useCreateGitSyncModal', async () => {
    const { container, getByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
      >
        <TestComponent />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('.useCreateGitSyncModalTestOpenDialog')!)
    await waitFor(() => expect(() => getByText('gitsync.configureHarnessFolder')).toBeTruthy())
  })
  test('should open useCreateGitSyncModal', async () => {
    const { container, getByText, queryByText } = render(
      <TestWrapper
        path="/account/:accountId/ci/orgs/:orgIdentifier/projects/:projectIdentifier/admin/git-sync/repos"
        pathParams={pathParams}
      >
        <TestComponent />
      </TestWrapper>
    )
    fireEvent.click(container.querySelector('.useCreateGitSyncModalTestOpenDialog')!)
    await waitFor(() => expect(() => getByText('gitsync.configureHarnessFolder')).toBeTruthy())

    await waitFor(() => {
      expect(getByText('selectGitProvider')).toBeTruthy()
    })

    let dialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    const connnectorRefInput = queryByAttribute('data-testid', dialog, /gitConnector/)
    expect(connnectorRefInput).toBeTruthy()
    fireEvent.click(connnectorRefInput!)

    await act(async () => {
      const connectorSelectorDialog = document.getElementsByClassName('bp3-dialog')[1]
      const githubConnector = await findAllByText(connectorSelectorDialog as HTMLElement, 'ValidGithubRepo')
      expect(githubConnector).toBeTruthy()
      fireEvent.click(githubConnector?.[0])
      const applySelected = getByText('entityReference.apply')
      await act(async () => {
        fireEvent.click(applySelected)
      })
    })

    const nameInput = queryByAttribute('name', dialog, 'name')
    expect(nameInput).toBeDefined()

    await act(async () => {
      fireEvent.change(nameInput!, { target: { value: 'repoName' } })
    })

    const rootfolderInput = queryByAttribute('name', dialog, 'rootfolder')
    expect(rootfolderInput).toBeDefined()

    await act(async () => {
      fireEvent.change(rootfolderInput!, { target: { value: 'src' } })
    })

    const icons = dialog.querySelectorAll('[icon="chevron-down"]')
    const branchInputIcon = icons[icons.length - 1]
    expect(branchInputIcon).toBeDefined()

    act(() => {
      fireEvent.click(branchInputIcon!)
    })

    await waitFor(() => expect(queryByText('devBranch')).toBeTruthy())

    act(() => {
      fireEvent.click(getByText('devBranch'))
    })

    await act(async () => {
      const continueBtn = await findByText(dialog, 'continue')
      fireEvent.click(continueBtn)
    })

    dialog = document.getElementsByClassName('bp3-dialog')[0] as HTMLElement

    await waitFor(() => {
      expect(findByText(dialog, 'gitsync.connectToGitProvider')).toBeTruthy()
    })

    expect(isSaas).toBeCalledTimes(1)
    await act(async () => {
      const submitBtn = await findByText(dialog, 'save')
      fireEvent.click(submitBtn)
    })

    expect(createGitSynRepo).toBeCalledTimes(1)
    expect(createGitSynRepo).toHaveBeenCalledWith({
      branch: 'devBranch',
      gitConnectorRef: 'ValidGithubRepo',
      gitConnectorType: 'Github',
      gitSyncFolderConfigDTOs: [
        {
          isDefault: true,
          rootFolder: '/src/.harness/'
        }
      ],
      identifier: 'repoName',
      name: 'repoName',
      orgIdentifier: 'default',
      projectIdentifier: 'dummyProject',
      repo: 'https://github.com/wings-software/sunnykesh-gitSync'
    })
  })
})
