import React, { Dispatch, SetStateAction, useContext, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Pagination, PaginationProps, PageError } from '@wings-software/uicore'
import {
  GitErrorExperienceSubTab,
  GitErrorExperienceTab,
  GitSyncErrorState
} from '@gitsync/pages/errors/GitSyncErrorContext'
import {
  ListGitToHarnessErrorsCommitsQueryParams,
  useListGitToHarnessErrorsCommits,
  GitSyncErrorAggregateByCommitDTO,
  useListGitSyncErrors,
  GitSyncErrorDTO
} from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PageSpinner } from '@common/components'
import { Toggle, ToggleProps } from '@common/components/Toggle/Toggle'
import { useStrings } from 'framework/strings'
import type { GitSyncErrorMessageProps } from '@gitsync/components/GitSyncErrorMessage/GitSyncErrorMessageItem'
import { GitSyncErrorMessage } from '@gitsync/components/GitSyncErrorMessage/GitSyncErrorMessage'
import styles from '@gitsync/pages/errors/GitSyncErrorsPanel/GitSyncErrorsPanel.module.scss'

const parseDataForCommitView = (data: GitSyncErrorAggregateByCommitDTO[] = []): GitSyncErrorMessageProps[] => {
  return data.map(item => ({
    title: item.commitMessage || '',
    count: item.failedCount,
    repo: item.repoId,
    branch: item.branchName,
    commitId: item.gitCommitId,
    timestamp: item.createdAt,
    items: (item.errorsForSummaryView || []).map(error => ({
      title: error.completeFilePath,
      reason: error.failureReason || '',
      ...(error.status === 'RESOLVED' ? { fixCommit: error.additionalErrorDetails?.['resolvedByCommitId'] } : {})
    }))
  }))
}

const parseDataForFileView = (data: GitSyncErrorDTO[] = []): GitSyncErrorMessageProps[] => {
  return data.map(item => ({
    title: item.completeFilePath || '',
    timestamp: item.createdAt,
    items: [
      {
        reason: item.failureReason || '',
        showDetails: () => {
          /**/
        }
      }
    ]
  }))
}

const parseDataForConnectivityView = (data: GitSyncErrorDTO[] = []): GitSyncErrorMessageProps[] => {
  return data.map(item => ({
    title: item.failureReason || '',
    repo: item.repoId,
    branch: item.branchName,
    timestamp: item.createdAt,
    items: []
  }))
}

const GitErrorExperienceToggle: React.FC<{
  selectedTab: GitErrorExperienceTab
  setView: Dispatch<SetStateAction<GitErrorExperienceSubTab | null>>
}> = props => {
  const { getString } = useStrings()
  const { selectedTab, setView } = props
  if (selectedTab === GitErrorExperienceTab.ALL_ERRORS) {
    const toggleProps: ToggleProps<GitErrorExperienceSubTab> = {
      options: [
        {
          label: getString('commits'),
          value: GitErrorExperienceSubTab.ALL_ERRORS_COMMIT_VIEW
        },
        {
          label: getString('common.files'),
          value: GitErrorExperienceSubTab.ALL_ERRORS_FILE_VIEW
        }
      ],
      beforeOnChange: (view, callback) => {
        setView(view)
        callback(view)
      },
      className: styles.toggle
    }
    return (
      <Layout.Horizontal flex={{ justifyContent: 'center' }}>
        <Toggle {...toggleProps} />
      </Layout.Horizontal>
    )
  }
  return <></>
}

export const GitSyncErrorsPanel: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { selectedTab, view, setView, searchTerm, branch, repoIdentifier } = useContext(GitSyncErrorState)
  const isCommitView = view === GitErrorExperienceSubTab.ALL_ERRORS_COMMIT_VIEW
  const isFileView = view === GitErrorExperienceSubTab.ALL_ERRORS_FILE_VIEW

  const [pageIndex, setPageIndex] = useState(0)

  const queryParams: ListGitToHarnessErrorsCommitsQueryParams = {
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    searchTerm,
    branch,
    repoIdentifier,
    pageIndex,
    pageSize: 10,
    ...(isCommitView ? {} : { gitToHarness: isFileView })
  }

  const { data, loading, error, refetch } = (isCommitView ? useListGitToHarnessErrorsCommits : useListGitSyncErrors)({
    queryParams
  })

  const paginationProps: PaginationProps = {
    itemCount: data?.data?.totalItems || 0,
    pageSize: data?.data?.pageSize || 0,
    pageCount: data?.data?.totalPages || 0,
    pageIndex: data?.data?.pageIndex || 0,
    gotoPage: pageNumber => setPageIndex(pageNumber)
  }

  const Component = (): React.ReactElement => {
    if (loading) {
      return <PageSpinner />
    }
    if (error) {
      return <PageError onClick={() => refetch()} />
    }
    const parsedData = (
      isCommitView ? parseDataForCommitView : isFileView ? parseDataForFileView : parseDataForConnectivityView
    )(data?.data?.content)
    return (
      <Layout.Vertical height="100%">
        <Layout.Vertical className={styles.gitSyncErrorsPanel}>
          {parsedData.map(item => (
            <GitSyncErrorMessage key={item.commitId} {...item} />
          ))}
        </Layout.Vertical>
        <Pagination {...paginationProps} />
      </Layout.Vertical>
    )
  }

  return (
    <Layout.Vertical padding={{ left: 'large', right: 'large' }}>
      <GitErrorExperienceToggle selectedTab={selectedTab} setView={setView} />
      <Component />
    </Layout.Vertical>
  )
}
