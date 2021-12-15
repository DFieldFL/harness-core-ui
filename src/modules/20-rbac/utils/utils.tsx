import React, { ReactNode } from 'react'
import { Menu } from '@blueprintjs/core'
import type { ItemRenderer } from '@blueprintjs/select'
import {
  IconName,
  Layout,
  MultiSelectOption,
  Text,
  Avatar,
  Color,
  ModalErrorHandlerBinding,
  getErrorInfoFromErrorObject,
  SelectOption
} from '@wings-software/uicore'
import { defaultTo } from 'lodash-es'
import type { StringsMap } from 'stringTypes'
import type { AccessControlCheckError, RoleAssignmentMetadataDTO, UserMetadataDTO } from 'services/cd-ng'
import { Scope } from '@common/interfaces/SecretsInterface'
import type {
  Assignment,
  RoleOption,
  ResourceGroupOption
} from '@rbac/modals/RoleAssignmentModal/views/UserRoleAssigment'
import { isEmail } from '@common/utils/Validation'
import { RbacResourceGroupTypes } from '@rbac/constants/utils'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ResourceType } from '@common/interfaces/ResourceInterface'
import type { FeatureRequest } from 'framework/featureStore/featureStoreUtil'
import type { PermissionsRequest } from '@rbac/hooks/usePermission'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import type { UseStringsReturn } from 'framework/strings'
import css from './utils.module.scss'

export interface UserItem extends MultiSelectOption {
  email?: string
}

export enum PrincipalType {
  USER = 'USER',
  USER_GROUP = 'USER_GROUP',
  SERVICE = 'SERVICE_ACCOUNT'
}

export const getRoleIcon = (roleIdentifier: string): IconName => {
  switch (roleIdentifier) {
    case '_account_viewer':
    case '_organization_viewer':
    case '_project_viewer':
      return 'viewerRole'
    case '_account_admin':
    case '_organization_admin':
    case '_project_admin':
      return 'adminRole'
    case '_pipeline_executor':
      return 'pipeline-executor'
    default:
      return 'customRole'
  }
}

export const UserTagRenderer = (item: UserItem, validate = false): React.ReactNode => (
  <Layout.Horizontal key={item.value.toString()} flex spacing="small">
    <Avatar name={item.label} email={item.value.toString()} size="xsmall" hoverCard={false} />
    <Text color={validate && !isEmail(item.value.toString().toLowerCase()) ? Color.RED_500 : Color.BLACK}>
      {item.label}
    </Text>
  </Layout.Horizontal>
)

export const UserItemRenderer: ItemRenderer<UserItem> = (item, { handleClick }) => (
  <Menu.Item
    key={item.value.toString()}
    text={
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
        <Avatar name={item.label} email={item.email || item.value.toString()} size="small" hoverCard={false} />
        <Layout.Vertical padding={{ left: 'small' }}>
          <Text color={Color.BLACK}>{item.label}</Text>
          <Text color={Color.GREY_700}>{item.email || item.value}</Text>
        </Layout.Vertical>
      </Layout.Horizontal>
    }
    onClick={handleClick}
  />
)

export enum InvitationStatus {
  USER_INVITED_SUCCESSFULLY = 'USER_INVITED_SUCCESSFULLY',
  USER_ADDED_SUCCESSFULLY = 'USER_ADDED_SUCCESSFULLY',
  USER_ALREADY_ADDED = 'USER_ALREADY_ADDED',
  USER_ALREADY_INVITED = 'USER_ALREADY_INVITED',
  FAIL = 'FAIL'
}

interface HandleInvitationResponse {
  responseType: InvitationStatus
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
  showSuccess: (message: string | ReactNode, timeout?: number, key?: string) => void
  modalErrorHandler?: ModalErrorHandlerBinding
  onSubmit?: () => void
  onUserAdded?: () => void
}

export const handleInvitationResponse = ({
  responseType,
  getString,
  showSuccess,
  modalErrorHandler,
  onSubmit,
  onUserAdded
}: HandleInvitationResponse): void => {
  switch (responseType) {
    case InvitationStatus.USER_INVITED_SUCCESSFULLY: {
      onSubmit?.()
      return showSuccess(getString('rbac.usersPage.invitationSuccess'))
    }
    case InvitationStatus.USER_ADDED_SUCCESSFULLY: {
      onUserAdded?.()
      return showSuccess(getString('rbac.usersPage.userAddedSuccess'))
    }
    case InvitationStatus.USER_ALREADY_ADDED:
      return showSuccess(getString('rbac.usersPage.userAlreadyAdded'))
    case InvitationStatus.USER_ALREADY_INVITED:
      return showSuccess(getString('rbac.usersPage.userAlreadyInvited'))
    default:
      return modalErrorHandler?.showDanger(getString('rbac.usersPage.invitationError'))
  }
}

export const getScopeBasedManagedResourceGroup = (
  scope: Scope,
  getString: UseStringsReturn['getString']
): SelectOption => {
  switch (scope) {
    case Scope.ACCOUNT:
      return {
        label: getString('rbac.allAccountResources'),
        value: '_all_account_level_resources'
      }
    case Scope.ORG:
      return {
        label: getString('rbac.allOrgResources'),
        value: '_all_organization_level_resources'
      }
    case Scope.PROJECT:
      return {
        label: getString('rbac.allProjectResources'),
        value: '_all_project_level_resources'
      }
    default:
      return {
        label: getString('rbac.allResources'),
        value: '_all_resources'
      }
  }
}

export const getScopeBasedDefaultAssignment = (
  scope: Scope,
  getString: UseStringsReturn['getString'],
  isCommunity: boolean
): Assignment[] => {
  if (isCommunity) {
    return []
  } else {
    const resourceGroup: ResourceGroupOption = {
      managedRoleAssignment: true,
      ...getScopeBasedManagedResourceGroup(scope, getString)
    }
    switch (scope) {
      case Scope.ACCOUNT:
        return [
          {
            role: {
              label: getString('common.accViewer'),
              value: '_account_viewer',
              managed: true,
              managedRoleAssignment: true
            },
            resourceGroup
          }
        ]
      case Scope.ORG:
        return [
          {
            role: {
              label: getString('common.orgViewer'),
              value: '_organization_viewer',
              managed: true,
              managedRoleAssignment: true
            },
            resourceGroup
          }
        ]
      case Scope.PROJECT:
        return [
          {
            role: {
              label: getString('common.projectViewer'),
              value: '_project_viewer',
              managed: true,
              managedRoleAssignment: true
            },
            resourceGroup
          }
        ]
      default:
        return []
    }
  }
}

export const isAssignmentFieldDisabled = (value: RoleOption | ResourceGroupOption): boolean => {
  if (value.assignmentIdentifier || value.managedRoleAssignment) {
    return true
  }
  return false
}
export const isDynamicResourceSelector = (value: string | string[]): boolean => {
  if (value === RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR) {
    return true
  }
  return false
}

interface ErrorHandlerProps {
  data: AccessControlCheckError
}

export const getRBACErrorMessage = (error: ErrorHandlerProps): string | React.ReactElement => {
  const err = error?.data
  if (err?.code === 'NG_ACCESS_DENIED' && err?.failedPermissionChecks?.length) {
    const { permission, resourceType, resourceScope } = err.failedPermissionChecks[0]
    if (permission && resourceType && resourceScope) {
      return (
        <RBACTooltip
          permission={permission as PermissionIdentifier}
          resourceType={resourceType as ResourceType}
          resourceScope={resourceScope}
          className={css.tooltip}
        />
      )
    }
  }
  return getErrorInfoFromErrorObject(error)
}

export const getAssignments = (roleBindings: RoleAssignmentMetadataDTO[]): Assignment[] => {
  return (
    roleBindings?.map(roleAssignment => {
      return {
        role: {
          label: roleAssignment.roleName,
          value: roleAssignment.roleIdentifier,
          managed: roleAssignment.managedRole,
          assignmentIdentifier: roleAssignment.identifier,
          managedRoleAssignment: roleAssignment.managedRoleAssignment
        },
        resourceGroup: {
          label: roleAssignment.resourceGroupName || '',
          value: roleAssignment.resourceGroupIdentifier || '',
          managedRoleAssignment: roleAssignment.managedRoleAssignment,
          assignmentIdentifier: roleAssignment.identifier
        }
      }
    }) || []
  )
}

interface FeatureProps {
  featureRequest: FeatureRequest
  isPermissionPrioritized?: boolean
}

interface TooltipProps {
  permissionRequest?: Omit<PermissionsRequest, 'permissions'> & { permission: PermissionIdentifier }
  featureProps?: FeatureProps
  canDoAction: boolean
  featureEnabled: boolean
}

interface TooltipReturn {
  tooltip?: React.ReactElement
}

export function getTooltip({
  permissionRequest,
  featureProps,
  canDoAction,
  featureEnabled
}: TooltipProps): TooltipReturn {
  // if permission check override the priorirty
  if (featureProps?.isPermissionPrioritized && permissionRequest && !canDoAction) {
    return {
      tooltip: (
        <RBACTooltip
          permission={permissionRequest.permission}
          resourceType={permissionRequest.resource.resourceType}
          resourceScope={permissionRequest.resourceScope}
        />
      )
    }
  }

  // feature check by default take priority
  if (featureProps?.featureRequest && !featureEnabled) {
    return {
      tooltip: <FeatureWarningTooltip featureName={featureProps?.featureRequest.featureName} />
    }
  }

  // permission check
  if (permissionRequest && !canDoAction) {
    return {
      tooltip: (
        <RBACTooltip
          permission={permissionRequest.permission}
          resourceType={permissionRequest.resource.resourceType}
          resourceScope={permissionRequest.resourceScope}
        />
      )
    }
  }

  return {}
}

export const getUserName = (user: UserMetadataDTO): string => {
  return defaultTo(user.name, user.email)
}
