/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Route } from 'react-router-dom'

import { noop, pick } from 'lodash-es'

import { TestWrapper, TestWrapperProps } from '@common/utils/testUtils'
import { GitSyncStoreContext, GitSyncStoreProps } from '../../../framework/GitRepoStore/GitSyncStoreContext'
import gitSyncListResponse from './__tests__/mocks/gitSyncRepoListMock.json'

export interface GitSyncTestWrapperProps extends TestWrapperProps {
  gitSyncStoreValues?: Partial<GitSyncStoreProps>
}

export const GitSyncTestWrapper: React.FC<GitSyncTestWrapperProps> = props => {
  const { defaultAppStoreValues, gitSyncStoreValues } = props
  return (
    <TestWrapper
      {...pick(props, ['path', 'pathParams', 'queryParams'])}
      defaultAppStoreValues={{
        featureFlags: {},
        updateAppStore: () => void 0,
        selectedProject: {
          identifier: 'dummy',
          name: 'dummy',
          modules: ['CI']
        },
        isGitSyncEnabled: true,
        connectivityMode: 'DELEGATE',
        ...defaultAppStoreValues
      }}
    >
      <GitSyncStoreContext.Provider
        value={
          {
            gitSyncRepos: gitSyncListResponse,
            codeManagers: [{ authentication: { spec: { spec: { username: 'dev' } } } }],
            updateStore: noop,
            refreshStore: noop,
            ...gitSyncStoreValues
          } as GitSyncStoreProps
        }
      >
        <Route exact path={props.path}>
          {props.children}
        </Route>
      </GitSyncStoreContext.Provider>
    </TestWrapper>
  )
}
