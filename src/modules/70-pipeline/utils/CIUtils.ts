/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { isEmpty } from 'lodash-es'
import moment from 'moment'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { usePipelineContext } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineContext'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

// Returns first 7 letters of commit ID
export function getShortCommitId(commitId: string): string {
  return commitId.slice(0, 7)
}

// TODO: Add singular forms, better using i18n because they have support for it
export function getTimeAgo(timeStamp: number): string {
  const currentDate = moment(new Date())
  const timeStampAsDate = moment(timeStamp)

  if (currentDate.diff(timeStampAsDate, 'days') > 30) {
    return `on ${timeStampAsDate.format('MMM D')}`
  } else if (currentDate.diff(timeStampAsDate, 'days') === 1) {
    return 'yesterday'
  } else if (currentDate.diff(timeStampAsDate, 'days') === 0) {
    if (currentDate.diff(timeStampAsDate, 'minutes') >= 60) {
      return `${currentDate.diff(timeStampAsDate, 'hours')} hours ago`
    } else {
      return `${currentDate.diff(timeStampAsDate, 'minutes')} minutes ago`
    }
  } else {
    return `${currentDate.diff(timeStampAsDate, 'days')} days ago`
  }
}

export function useGitScope(): GitFilterScope | undefined {
  const gitDetails = usePipelineContext()?.state?.gitDetails
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  if (!isEmpty(gitDetails)) {
    return {
      repo: gitDetails.repoIdentifier!,
      branch: gitDetails.branch!,
      getDefaultFromOtherRepo: true
    }
  } else if (!!repoIdentifier && !!branch) {
    return {
      repo: repoIdentifier,
      branch,
      getDefaultFromOtherRepo: true
    }
  }
}
