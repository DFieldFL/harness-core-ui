import React, { useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'

import { noop } from 'lodash-es'
import { GitSyncConfig, SourceCodeManagerDTO, useGetSourceCodeManagers, useListGitSync } from 'services/cd-ng'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'

export interface GitSyncStoreProps {
  readonly gitSyncRepos: GitSyncConfig[]
  readonly codeManagers: SourceCodeManagerDTO[]
  readonly loadingRepos: boolean
  updateStore(data: Partial<Pick<GitSyncStoreProps, 'gitSyncRepos'>>): void
  refreshStore(): void
}

export const GitSyncStoreContext = React.createContext<GitSyncStoreProps>({
  gitSyncRepos: [],
  codeManagers: [],
  loadingRepos: false,
  updateStore: noop,
  refreshStore: noop
})

export const useGitSyncStore = (): GitSyncStoreProps => {
  return React.useContext(GitSyncStoreContext)
}

export const GitSyncStoreProvider: React.FC = props => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()

  //Note: right now we support git-sync only at project level
  const { data: dataAllGitSync, loading: loadingRepos, refetch } = useListGitSync({
    queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier },
    lazy: true
  })

  const [storeData, setStoreData] = React.useState<Omit<GitSyncStoreProps, 'updateStore' | 'strings'>>({
    gitSyncRepos: [],
    codeManagers: [],
    loadingRepos,
    refreshStore: refetch
  })

  const { data: codeManagers, loading: loadingCodeManagers } = useGetSourceCodeManagers({})

  useEffect(() => {
    if (!loadingCodeManagers) {
      setStoreData(prevStateData => ({
        ...prevStateData,
        codeManagers: codeManagers?.data || []
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingCodeManagers])

  useEffect(() => {
    if (!loadingRepos) {
      setStoreData(prevStateData => ({
        ...prevStateData,
        loadingRepos: false,
        gitSyncRepos: dataAllGitSync || []
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingRepos])

  useEffect(() => {
    if (projectIdentifier) {
      refetch()
      setStoreData(prevStateData => ({
        ...prevStateData,
        loadingRepos: true
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIdentifier])

  const updateStore = useCallback(
    () => (data: Partial<Pick<GitSyncStoreProps, 'gitSyncRepos'>>): void => {
      setStoreData(prevState => ({
        ...prevState,
        gitSyncRepos: data.gitSyncRepos || prevState.gitSyncRepos
      }))
    },
    []
  )

  return (
    <GitSyncStoreContext.Provider
      value={{
        ...storeData,
        updateStore
      }}
    >
      {loadingRepos ? <PageSpinner /> : props.children}
    </GitSyncStoreContext.Provider>
  )
}
