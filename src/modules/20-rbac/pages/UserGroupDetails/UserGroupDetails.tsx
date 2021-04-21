import React from 'react'
import { Text, Layout, Color, Card, Container, Button } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import { useStrings } from 'framework/strings'
import { useGetUserGroupAggregate } from 'services/cd-ng'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { PageSpinner } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import RoleBindingsList from '@rbac/components/RoleBindingsList/RoleBindingsList'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { PrincipalType, useRoleAssignmentModal } from '@rbac/modals/RoleAssignmentModal/useRoleAssignmentModal'
import MemberList from './views/MemberList'
import css from './UserGroupDetails.module.scss'

const UserGroupDetails: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier, module, userGroupIdentifier } = useParams<
    PipelineType<ProjectPathProps & { userGroupIdentifier: string }>
  >()

  const { data, loading, error, refetch } = useGetUserGroupAggregate({
    identifier: userGroupIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { openRoleAssignmentModal } = useRoleAssignmentModal({
    onSuccess: refetch
  })

  const userGroup = data?.data?.userGroupDTO
  const users = data?.data?.users
  const roleBindings = data?.data?.roleAssignmentsMetadataDTO?.map(item => ({
    item: `${item.roleName} - ${item.resourceGroupName}`,
    managed: item.managedRole
  }))

  if (loading) return <PageSpinner />
  if (error) return <PageError message={error.message} onClick={() => refetch()} />
  if (!userGroup) return <></>
  return (
    <>
      <Page.Header
        size="xlarge"
        className={css.header}
        title={
          <Layout.Vertical>
            <Breadcrumbs
              links={[
                {
                  url: routes.toAccessControl({ accountId, orgIdentifier, projectIdentifier, module }),
                  label: getString('accessControl')
                },
                {
                  url: routes.toUserGroups({ accountId, orgIdentifier, projectIdentifier, module }),
                  label: getString('common.userGroups')
                },
                {
                  url: '#',
                  label: userGroup.name || ''
                }
              ]}
            />
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="medium">
              <Layout.Vertical padding={{ left: 'medium' }} spacing="xsmall">
                <Text color={Color.BLACK} font="medium">
                  {userGroup.name}
                </Text>
                <Text>{userGroup.description}</Text>
                <Layout.Horizontal padding={{ top: 'small' }}>
                  <TagsRenderer tags={userGroup.tags || /* istanbul ignore next */ {}} length={6} />
                </Layout.Horizontal>
              </Layout.Vertical>
            </Layout.Horizontal>
          </Layout.Vertical>
        }
        toolbar={
          <Layout.Horizontal flex>
            {userGroup.lastModifiedAt && (
              <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
                <Text>{getString('lastUpdated')}</Text>
                <ReactTimeago date={userGroup.lastModifiedAt} />
              </Layout.Vertical>
            )}
          </Layout.Horizontal>
        }
      />
      <Page.Body className={css.body}>
        <Container width="50%" className={css.membersContainer}>
          <Layout.Vertical spacing="medium" padding={{ bottom: 'large' }}>
            <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
              {getString('members')}
            </Text>
            <MemberList users={users} refetch={refetch} userGroupIdentifier={userGroupIdentifier} />
          </Layout.Vertical>
        </Container>
        <Container width="50%" className={css.detailsContainer}>
          <Layout.Vertical spacing="medium" padding={{ bottom: 'large' }}>
            <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }}>
              {getString('rbac.roleBinding')}
            </Text>
            <Card className={css.card}>
              <RoleBindingsList data={roleBindings} />
            </Card>
            <Layout.Horizontal
              flex={{ alignItems: 'center', justifyContent: 'flex-start' }}
              padding={{ top: 'medium' }}
            >
              <Button
                data-testid={'addRole-UserGroup'}
                text={getString('common.plusNumber', { number: getString('common.role') })}
                minimal
                className={css.addButton}
                onClick={event => {
                  event.stopPropagation()
                  openRoleAssignmentModal(PrincipalType.USER_GROUP, userGroup, data?.data?.roleAssignmentsMetadataDTO)
                }}
              />
            </Layout.Horizontal>
          </Layout.Vertical>
        </Container>
      </Page.Body>
    </>
  )
}

export default UserGroupDetails
