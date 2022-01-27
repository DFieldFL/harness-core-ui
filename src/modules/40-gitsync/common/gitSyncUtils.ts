/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { IconName } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import { useEffect, useState } from 'react'
import { Connectors } from '@connectors/constants'
import type { GitSyncConfig, ConnectorInfoDTO, GitSyncEntityDTO, EntityGitDetails } from 'services/cd-ng'
import type { ModulePathParams, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { getPipelineListPromise } from 'services/pipeline-ng'
import { GitSuffixRegex } from '@common/utils/StringUtils'
import { getAllFeaturesPromise } from 'services/cf'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

export const getGitConnectorIcon = (type: GitSyncConfig['gitConnectorType']): IconName => {
  switch (type) {
    case Connectors.GITHUB:
      return 'github'
    case Connectors.GITLAB:
      return 'service-gotlab'
    case Connectors.BITBUCKET:
      return 'bitbucket-selected'
    default:
      return 'cog'
  }
}

export const modalTypes = {
  GIT_SYNC_REP: 'gitSyncRepo',
  GIT_SYNC_BRANCH: 'gitSyncBranch'
}

export interface ConnectorCardInterface {
  type: ConnectorInfoDTO['type']
  disabled?: boolean
  icon: {
    default: IconName
    selected: IconName
  }
}

export const gitCards: Array<ConnectorCardInterface> = [
  {
    type: Connectors.GITHUB,
    icon: {
      default: 'github-unselected',
      selected: 'github-selected'
    }
  }
  // {
  //   type: Connectors.GITLAB,
  //   disabled: true,
  //   icon: {
  //     default: 'gitlab-unselected',
  //     selected: 'gitlab-selected'
  //   }
  // },
  // {
  //   type: Connectors.BITBUCKET,
  //   disabled: true,
  //   icon: {
  //     default: 'bitbucket-unselected',
  //     selected: 'bitbucket-selected'
  //   }
  // }
]

export const getRepoPath = (gitRepo: GitSyncConfig): string => {
  let basePath = ''
  switch (gitRepo.gitConnectorType) {
    case Connectors.GITHUB:
      basePath = 'https://github.com/'
      break
    case Connectors.GITLAB:
      basePath = 'https://gitlab.com/'
      break
    case Connectors.BITBUCKET:
      basePath = 'https://bitbucket.com/'
  }

  return gitRepo.repo ? gitRepo.repo.replace(GitSuffixRegex, '').split(basePath)?.[1] ?? '' : ''
}

export const getRepoUrl = (baseUrl: string, repoName: string) => {
  if (!baseUrl) {
    return ''
  }
  if (baseUrl.endsWith('/')) {
    return baseUrl + repoName
  }
  return `${baseUrl}/${repoName}`
}

export const getHarnessFolderPathWithSuffix = (folderPath: string, suffix: string): string => {
  const sanitizedRootFolder = folderPath.split('/').reduce(rootFolderFormatter, '')
  return sanitizedRootFolder.concat(suffix)
}

const rootFolderFormatter = (previousValue: string, currentValue: string): string => {
  /* Convert folder paths like
    /* ///////a/////b////c///// to a/b/c/ */
  /* a/////b////c to a/b/c */
  /* ///////a/////b////c to a/b/c */
  const folderPart = currentValue.trim()
  return folderPart ? `${previousValue}/${folderPart}` : previousValue
}

export const getCompleteGitPath = (repo: string, folderPath: string, suffix: string): string => {
  // Convert repo url like
  /* https://github.com/wings-software/vb.git//// to https://github.com/wings-software/vb */
  /* https://github.com/wings-software/vb.git to https://github.com/wings-software/vb */
  const sanitizedRepo = repo.replace(GitSuffixRegex, '')
  const sanitizedRootFolder = folderPath.split('/').reduce(rootFolderFormatter, '')
  if (sanitizedRootFolder) {
    return sanitizedRepo.endsWith('/')
      ? `${sanitizedRepo}${sanitizedRootFolder.substring(1)}${suffix}`
      : `${sanitizedRepo}${sanitizedRootFolder}${suffix}`
  } else {
    return `${sanitizedRepo}${sanitizedRepo.endsWith('/') ? suffix.substring(1) : suffix}`
  }
  return ''
}

export const getExternalUrl = (config: GitSyncConfig, folderPath?: string): string => {
  const { repo, branch, gitConnectorType } = config
  if (!repo || !branch || !folderPath) {
    return ''
  }
  switch (gitConnectorType) {
    case Connectors.GITHUB:
      return `${repo}/tree/${branch}${folderPath.startsWith('/') ? '' : '/'}${folderPath}`
    case Connectors.GITLAB:
    case Connectors.BITBUCKET:
    default:
      return ''
  }
}

export const getEntityUrl = (entity: GitSyncEntityDTO): string => {
  const { repoUrl, folderPath, branch, entityGitPath } = entity
  if (repoUrl && branch && folderPath && entityGitPath) {
    return `${repoUrl}/blob/${branch}/${folderPath}${entityGitPath}`
  } else {
    return ''
  }
}

export const getRepoEntityObject = (
  repo: GitSyncConfig | undefined,
  gitDetails: EntityGitDetails
): GitSyncEntityDTO => {
  return {
    repoUrl: repo?.repo,
    folderPath: gitDetails?.rootFolder,
    branch: repo?.branch,
    entityGitPath: gitDetails?.filePath
  }
}

/**
 * This hook will be used to decide whether user can enable git experience for any project or not.
 * Current conditions where Git Sync cannot be enabled:
 *  - If Pipelines have been created
 *  - If Feature Flags have been created
 * Once complete sync will be implemented, blocking user to enable the gitSync will be not required.
 */

export const useCanEnableGitExperience = (queryParam: ProjectPathProps & ModulePathParams): boolean => {
  const { NG_GIT_FULL_SYNC, FF_GITSYNC } = useFeatureFlags()
  const [canEnableGit, setCanEnableGit] = useState<boolean>(false)

  useEffect(() => {
    const defaultQueryParamsForPipelines = {
      ...pick(queryParam, ['projectIdentifier', 'orgIdentifier']),
      accountIdentifier: queryParam.accountId,
      searchTerm: '',
      page: 0,
      size: 1
    }

    const checkEnableGitConditions = async (): Promise<void> => {
      try {
        const pipelinesResponse = await getPipelineListPromise({
          queryParams: defaultQueryParamsForPipelines,
          body: { filterType: 'PipelineSetup' }
        })

        const hasPipelines = !!(
          pipelinesResponse?.status === 'SUCCESS' &&
          pipelinesResponse?.data?.totalElements &&
          pipelinesResponse?.data?.totalElements > 0
        )

        let hasFeatureFlags = false

        if (FF_GITSYNC) {
          const featureFlagsResponse = await getAllFeaturesPromise({
            queryParams: {
              accountIdentifier: queryParam.accountId,
              org: queryParam.orgIdentifier,
              project: queryParam.projectIdentifier
            }
          })

          hasFeatureFlags = !!(featureFlagsResponse && featureFlagsResponse.itemCount > 0)
        }

        if (hasFeatureFlags === false && hasPipelines === false) {
          setCanEnableGit(true)
        }
      } catch (error) {
        setCanEnableGit(true)
      }
    }

    checkEnableGitConditions()
  }, [])

  return NG_GIT_FULL_SYNC ? true : canEnableGit
}
