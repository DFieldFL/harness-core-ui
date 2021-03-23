import React, { useEffect, useState } from 'react'
import { Button, Card, Color, Container, Icon, Layout, Text } from '@wings-software/uicore'

import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import produce from 'immer'
import { useStrings } from 'framework/exports'
import { Page, useToaster } from '@common/exports'
import { PageSpinner } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import {
  Permission,
  Role,
  useGetPermissionList,
  useGetRole,
  useUpdateRole,
  useGetPermissionResourceTypesList
} from 'services/rbac'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import PermissionCard from '@rbac/components/PermissionCard/PermissionCard'
import RbacFactory from '@rbac/factories/RbacFactory'
import type { ResourceType, ResourceTypeGroup } from '@rbac/interfaces/ResourceType'
import { getPermissionMap } from '@rbac/pages/RoleDetails/utils.tsx'
import routes from '@common/RouteDefinitions'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import css from './RoleDetails.module.scss'

const RoleDetails: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, roleIdentifier, module } = useParams()
  const [resource, setResource] = useState<ResourceType>()
  const [resourceGroupTypeList, setResourceGroupTypeList] = useState<(ResourceType | ResourceTypeGroup)[]>()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const [permissions, setPermissions] = useState<string[]>([])
  const [isUpdated, setIsUpdated] = useState<boolean>(false)
  const listRef: Map<ResourceType, HTMLDivElement | null> = new Map()
  const { data, loading, error, refetch } = useGetRole({
    identifier: roleIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { data: resourceGroups } = useGetPermissionResourceTypesList({
    queryParams: { accountIdentifier: accountId, projectIdentifier, orgIdentifier }
  })

  const { mutate: addPermissions } = useUpdateRole({
    identifier: roleIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const { data: permissionList } = useGetPermissionList({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })
  useEffect(() => {
    setPermissions(data?.data?.role.permissions || /* istanbul ignore next */ [])
    setIsUpdated(false)
  }, [data?.data])

  useEffect(() => {
    setResourceGroupTypeList(RbacFactory.getResourceGroupTypeList((resourceGroups?.data || []) as ResourceType[]))
  }, [resourceGroups?.data])

  const permissionsMap: Map<ResourceType, Permission[]> = getPermissionMap(permissionList?.data)

  const isPermissionEnabled = (_permission: string): boolean => {
    if (data?.data?.role.permissions?.includes(_permission)) return true
    return false
  }

  const onChangePermission = async (permission: string, isAdd: boolean): Promise<void> => {
    if (isAdd) setPermissions(_permissions => [...permissions, permission])
    else {
      setPermissions(_permissions =>
        produce(_permissions, draft => {
          draft?.splice(permissions.indexOf(permission), 1)
        })
      )
    }
    setIsUpdated(true)
  }

  const submitChanges = async (role: Role): Promise<void> => {
    role['permissions'] = permissions
    try {
      const updated = await addPermissions(role)
      /* istanbul ignore else */ if (updated) {
        showSuccess(getString('roleDetails.permissionUpdatedSuccess'))
        refetch()
      }
    } catch (e) {
      /* istanbul ignore next */
      showError(e.data?.message || e.message)
    }
  }
  const role = data?.data?.role
  if (loading) return <PageSpinner />
  if (error) return <PageError message={error.message} onClick={() => refetch()} />
  if (!role) return <></>
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
                  url: routes.toRoles({ accountId, orgIdentifier, projectIdentifier, module }),
                  label: getString('roles')
                },
                {
                  url: '#',
                  label: role.name
                }
              ]}
            />
            <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} spacing="medium">
              {/* TODO: REPLACE WITH ROLE ICON */}
              <Icon name="nav-project-selected" size={40} />
              <Layout.Vertical padding={{ left: 'medium' }} spacing="xsmall">
                <Text color={Color.BLACK} font="medium">
                  {role.name}
                </Text>
                <Text>{role.description}</Text>
                <Layout.Horizontal padding={{ top: 'small' }}>
                  <TagsRenderer tags={role.tags || /* istanbul ignore next */ {}} length={6} />
                </Layout.Horizontal>
              </Layout.Vertical>
            </Layout.Horizontal>
          </Layout.Vertical>
        }
        toolbar={
          <Layout.Horizontal flex>
            {data?.data?.createdAt && (
              <Layout.Vertical
                padding={{ right: 'small' }}
                border={{ right: true, color: Color.GREY_300 }}
                spacing="xsmall"
              >
                <Text>{getString('created')}</Text>
                <ReactTimeago date={data.data.createdAt} />
              </Layout.Vertical>
            )}
            {data?.data?.lastModifiedAt && (
              <Layout.Vertical spacing="xsmall" padding={{ left: 'small' }}>
                <Text>{getString('lastUpdated')}</Text>
                <ReactTimeago date={data.data.lastModifiedAt} />
              </Layout.Vertical>
            )}
          </Layout.Horizontal>
        }
      />
      <Page.Body>
        <Layout.Horizontal className={css.body}>
          <Container className={css.resourceList}>
            <Layout.Vertical flex spacing="small">
              {resourceGroupTypeList?.map(resourceType => {
                const resourceHandler = RbacFactory.getResourceGroupTypeHandler(resourceType)
                return (
                  resourceHandler && (
                    <Card
                      interactive
                      key={resourceType}
                      data-testid={`resourceCard-${resourceType}`}
                      className={css.card}
                      onClick={() => {
                        setResource(resourceType as ResourceType)
                        const elem = listRef.get(resourceType as ResourceType)
                        elem?.scrollIntoView()
                      }}
                    >
                      <Layout.Horizontal flex spacing="small">
                        <Icon name={resourceHandler.icon} />
                        <Text color={Color.BLACK}>{resourceHandler.label} </Text>
                      </Layout.Horizontal>
                    </Card>
                  )
                )
              })}
            </Layout.Vertical>
          </Container>
          <Container padding="large">
            <Layout.Vertical>
              <Layout.Horizontal flex padding="medium" spacing="medium">
                <Text color={Color.BLACK} font={{ size: 'medium', weight: 'semi-bold' }} padding={{ left: 'medium' }}>
                  {getString('roleDetails.updateRolePermissions')}
                </Text>
                <Layout.Horizontal flex={{ justifyContent: 'flex-end' }} spacing="small">
                  {isUpdated && <Text color={Color.BLACK}>{getString('unsavedChanges')}</Text>}
                  <Button onClick={() => submitChanges(role)} text={getString('applyChanges')} intent="primary" />
                </Layout.Horizontal>
              </Layout.Horizontal>
              {resourceGroupTypeList?.map(resourceType => {
                return (
                  <div
                    key={resourceType}
                    ref={input => {
                      listRef.set(resourceType as ResourceType, input)
                    }}
                  >
                    <PermissionCard
                      selected={resourceType === resource}
                      permissionMap={permissionsMap}
                      resourceType={resourceType}
                      isDefault={data?.data?.harnessManaged}
                      onChangePermission={onChangePermission}
                      isPermissionEnabled={isPermissionEnabled}
                    />
                  </div>
                )
              })}
            </Layout.Vertical>
          </Container>
        </Layout.Horizontal>
      </Page.Body>
    </>
  )
}

export default RoleDetails
