import React, { useState, useEffect } from 'react'
import { ButtonVariation, ExpandingSearchInput, Layout } from '@wings-software/uicore'

import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { PageHeader } from '@common/components/Page/PageHeader'
import { Page } from '@common/exports'
import { useGetUserGroupAggregateList } from 'services/cd-ng'
import { useUserGroupModal } from '@rbac/modals/UserGroupModal/useUserGroupModal'
import UserGroupsListView from '@rbac/pages/UserGroups/views/UserGroupsListView'
import { useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import ManagePrincipalButton from '@rbac/components/ManagePrincipalButton/ManagePrincipalButton'
import { setPageNumber } from '@common/utils/utils'

const UserGroupsPage: React.FC = () => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  useDocumentTitle(getString('common.userGroups'))
  const [page, setPage] = useState(0)
  const [searchTerm, setsearchTerm] = useState<string>('')
  const { data, loading, error, refetch } = useGetUserGroupAggregateList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pageIndex: page,
      pageSize: 10,
      searchTerm: searchTerm
    },
    debounce: 300
  })

  useEffect(() => {
    setPageNumber({ setPage, page, pageItemsCount: data?.data?.pageItemCount })
  }, [data?.data])

  const { openUserGroupModal } = useUserGroupModal({
    onSuccess: refetch
  })

  const { openRoleAssignmentModal } = useRoleAssignmentModal({
    onSuccess: refetch
  })

  const newUserGroupsBtn = (): JSX.Element => (
    <ManagePrincipalButton
      text={getString('rbac.userGroupPage.newUserGroup')}
      variation={ButtonVariation.PRIMARY}
      icon="plus"
      onClick={() => openUserGroupModal()}
      resourceType={ResourceType.USERGROUP}
    />
  )

  return (
    <>
      <PageHeader
        title={<Layout.Horizontal>{newUserGroupsBtn()}</Layout.Horizontal>}
        toolbar={
          <Layout.Horizontal margin={{ right: 'small' }} height="xxxlarge">
            <ExpandingSearchInput
              alwaysExpanded
              placeholder={getString('rbac.userGroupPage.search')}
              onChange={text => {
                setsearchTerm(text.trim())
                setPage(0)
              }}
              width={250}
            />
          </Layout.Horizontal>
        }
      />
      <Page.Body
        loading={loading}
        error={(error?.data as Error)?.message || error?.message}
        retryOnError={() => refetch()}
        noData={
          !searchTerm
            ? {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('rbac.userGroupPage.noDataText'),
                button: newUserGroupsBtn()
              }
            : {
                when: () => !data?.data?.content?.length,
                icon: 'nav-project',
                message: getString('rbac.userGroupPage.noUserGroups')
              }
        }
      >
        <UserGroupsListView
          data={data}
          openRoleAssignmentModal={openRoleAssignmentModal}
          gotoPage={(pageNumber: number) => setPage(pageNumber)}
          reload={refetch}
          openUserGroupModal={openUserGroupModal}
        />
      </Page.Body>
    </>
  )
}

export default UserGroupsPage
