import { useParams } from 'react-router-dom'
import * as yup from 'yup'
import type { ObjectSchema } from 'yup'
import { useMemo } from 'react'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { GitRepo, useGetGitRepo, usePatchGitRepo } from 'services/cf'
import { useFeatureFlag } from '@common/hooks/useFeatureFlag'
import { FeatureFlag } from '@common/featureFlags'
import { useStrings } from 'framework/strings'

export interface GitDetails {
  branch: string
  filePath: string
  repoIdentifier: string
  rootFolder: string
  commitMsg: string
}
export interface GitSyncFormValues {
  gitDetails: GitDetails
  autoCommit: boolean
}
interface GitSyncFormMeta {
  gitSyncInitialValues: GitSyncFormValues
  gitSyncValidationSchema: ObjectSchema<Record<string, unknown> | undefined>
}

export interface UseGitSync {
  gitRepoDetails?: GitRepo
  isAutoCommitEnabled: boolean
  isGitSyncEnabled: boolean
  isGitSyncPaused: boolean
  isGitSyncActionsEnabled: boolean
  gitSyncLoading: boolean
  handleAutoCommit: (newAutoCommitValue: boolean) => Promise<void>
  handleGitPause: (newGitPauseValue: boolean) => Promise<void>
  getGitSyncFormMeta: (autoCommitMessage?: string) => GitSyncFormMeta
}

export const useGitSync = (): UseGitSync => {
  const { projectIdentifier, accountId, orgIdentifier } = useParams<ProjectPathProps & ModulePathParams>()
  const { getString } = useStrings()

  const getGitRepo = useGetGitRepo({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      org: orgIdentifier
    }
  })

  const patchGitRepo = usePatchGitRepo({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      org: orgIdentifier
    }
  })

  const FF_GITSYNC = useFeatureFlag(FeatureFlag.FF_GITSYNC)

  const isGitSyncEnabled = useMemo<boolean>(
    () => !!(FF_GITSYNC && getGitRepo?.data?.repoSet && getGitRepo?.data?.repoDetails?.enabled),
    [FF_GITSYNC, getGitRepo?.data?.repoDetails?.enabled, getGitRepo?.data?.repoSet]
  )

  const isAutoCommitEnabled = useMemo<boolean>(
    () => !!(FF_GITSYNC && getGitRepo?.data?.repoSet && getGitRepo?.data?.repoDetails?.autoCommit),
    [FF_GITSYNC, getGitRepo?.data?.repoDetails?.autoCommit, getGitRepo?.data?.repoSet]
  )

  const isGitSyncActionsEnabled = useMemo<boolean>(
    () => !!(FF_GITSYNC && getGitRepo?.data?.repoSet),
    [FF_GITSYNC, getGitRepo?.data?.repoSet]
  )

  const isGitSyncPaused = useMemo<boolean>(
    () => !!(FF_GITSYNC && getGitRepo?.data?.repoSet && !getGitRepo?.data?.repoDetails?.enabled),
    [FF_GITSYNC, getGitRepo?.data?.repoDetails?.enabled, getGitRepo?.data?.repoSet]
  )

  const getGitSyncFormMeta = (autoCommitMessage?: string): GitSyncFormMeta => ({
    gitSyncInitialValues: {
      gitDetails: {
        branch: getGitRepo?.data?.repoDetails?.branch || '',
        filePath: getGitRepo?.data?.repoDetails?.filePath || '',
        repoIdentifier: getGitRepo?.data?.repoDetails?.repoIdentifier || '',
        rootFolder: getGitRepo?.data?.repoDetails?.rootFolder || '',
        commitMsg:
          isAutoCommitEnabled && autoCommitMessage
            ? getString('cf.gitSync.autoCommitMsg', {
                msg: autoCommitMessage
              })
            : ''
      },
      autoCommit: isAutoCommitEnabled
    },
    gitSyncValidationSchema: yup.object().shape({
      commitMsg: isGitSyncEnabled ? yup.string().required(getString('cf.gitSync.commitMsgRequired')) : yup.string()
    })
  })

  const handleAutoCommit = async (newAutoCommitValue: boolean): Promise<void> => {
    if (isAutoCommitEnabled !== newAutoCommitValue) {
      const instruction = {
        instructions: [
          {
            kind: 'setAutoCommit',
            parameters: {
              autoCommit: newAutoCommitValue
            }
          }
        ]
      }

      await patchGitRepo.mutate(instruction)
      await getGitRepo.refetch()
    }
  }

  const handleGitPause = async (newGitPauseValue: boolean): Promise<void> => {
    const instruction = {
      instructions: [
        {
          kind: 'setEnabled',
          parameters: {
            enabled: newGitPauseValue
          }
        }
      ]
    }

    await patchGitRepo.mutate(instruction)
    await getGitRepo.refetch()
  }

  return {
    gitRepoDetails: getGitRepo?.data?.repoDetails,
    isAutoCommitEnabled,
    isGitSyncEnabled,
    isGitSyncPaused,
    isGitSyncActionsEnabled,
    gitSyncLoading: getGitRepo.loading || patchGitRepo.loading,
    handleAutoCommit,
    handleGitPause,
    getGitSyncFormMeta
  }
}
