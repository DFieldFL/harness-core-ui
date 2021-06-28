import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'

import { fromPairs } from 'lodash-es'
import { Project, useGetProject, useGetCurrentUserInfo, UserInfo, isGitSyncEnabledPromise } from 'services/cd-ng'
import { useGetFeatureFlags } from 'services/portal'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/exports'

export type FeatureFlagMap = Record<string, boolean>

/**
 * Application Store - essential application-level states which are shareable
 * across Framework and Modules. These states are writeable within Frameworks.
 * Modules are allowed to read only.
 */
export interface AppStoreContextProps {
  readonly selectedProject?: Project
  readonly isGitSyncEnabled?: boolean
  readonly currentUserInfo: UserInfo
  /** feature flags */
  readonly featureFlags: FeatureFlagMap

  updateAppStore(
    data: Partial<Pick<AppStoreContextProps, 'selectedProject' | 'isGitSyncEnabled' | 'currentUserInfo'>>
  ): void
}

export const AppStoreContext = React.createContext<AppStoreContextProps>({
  featureFlags: {},
  currentUserInfo: {},
  isGitSyncEnabled: false,
  updateAppStore: () => void 0
})

export function useAppStore(): AppStoreContextProps {
  return React.useContext(AppStoreContext)
}

export function AppStoreProvider(props: React.PropsWithChildren<unknown>): React.ReactElement {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const [state, setState] = React.useState<Omit<AppStoreContextProps, 'updateAppStore' | 'strings'>>({
    featureFlags: {},
    currentUserInfo: {},
    isGitSyncEnabled: false
  })

  const { showError } = useToaster()

  const { data: featureFlags, loading: featureFlagsLoading } = useGetFeatureFlags({
    accountId,
    pathParams: { accountId }
  })

  const { refetch, data: project, error: errorFetchingProjectDetails } = useGetProject({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier
    },
    lazy: true
  })

  const { data: userInfo, loading: userInfoLoading } = useGetCurrentUserInfo({})

  useEffect(() => {
    const toasterMessage = (errorFetchingProjectDetails?.data as any)?.message || errorFetchingProjectDetails?.message
    if (toasterMessage) {
      showError(toasterMessage)
    }
  }, [errorFetchingProjectDetails])

  // update feature flags in context
  useEffect(() => {
    // TODO: Handle better if fetching feature flags fails
    if (featureFlags) {
      const featureFlagsMap = fromPairs(
        featureFlags?.resource?.map(flag => {
          return [flag.name, !!flag.enabled]
        })
      )

      // don't redirect on local because it goes into infinite loop
      // because there may be no current gen to go to
      if (!__DEV__ && !featureFlagsMap['NEXT_GEN_ENABLED']) {
        window.location.href = window.location.pathname.replace(/\/ng\//, '/')
      }

      setState(prevState => ({
        ...prevState,
        featureFlags: featureFlagsMap
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featureFlags])

  // update gitSyncEnabled when selectedProject changes
  useEffect(() => {
    if (projectIdentifier && state.featureFlags['GIT_SYNC_NG']) {
      isGitSyncEnabledPromise({
        queryParams: { accountIdentifier: accountId, orgIdentifier, projectIdentifier }
      }).then(status => {
        setState(prevState => ({
          ...prevState,
          isGitSyncEnabled: !!status
        }))
      })
    } else {
      setState(prevState => ({
        ...prevState,
        isGitSyncEnabled: false
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedProject, state.featureFlags['GIT_SYNC_NG'], projectIdentifier, orgIdentifier])

  // set selectedProject when projectDetails are fetched
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      selectedProject: project?.data?.project
    }))
  }, [project?.data?.project])

  // update selectedProject when projectIdentifier in URL changes
  useEffect(() => {
    if (projectIdentifier && orgIdentifier) {
      refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIdentifier, orgIdentifier])

  // clear selectedProject when accountId changes
  useEffect(() => {
    setState(prevState => ({
      ...prevState,
      selectedProject: undefined
    }))
  }, [accountId])

  React.useEffect(() => {
    if (userInfo?.data) {
      const user = userInfo.data
      setState(prevState => ({
        ...prevState,
        currentUserInfo: user
      }))
    }
    //TODO: Logout if we don't have userInfo???
  }, [userInfo?.data])

  function updateAppStore(
    data: Partial<Pick<AppStoreContextProps, 'selectedProject' | 'isGitSyncEnabled' | 'currentUserInfo'>>
  ): void {
    setState(prevState => ({
      ...prevState,
      selectedProject: data.selectedProject,
      isGitSyncEnabled: data.isGitSyncEnabled || prevState?.isGitSyncEnabled,
      currentUserInfo: data.currentUserInfo || prevState?.currentUserInfo
    }))
  }

  return (
    <AppStoreContext.Provider
      value={{
        ...state,
        updateAppStore
      }}
    >
      {featureFlagsLoading || userInfoLoading ? <PageSpinner /> : props.children}
    </AppStoreContext.Provider>
  )
}
