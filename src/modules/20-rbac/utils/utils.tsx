/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactNode } from 'react'
import { IconName, ModalErrorHandlerBinding, getErrorInfoFromErrorObject, SelectOption } from '@wings-software/uicore'
import { defaultTo } from 'lodash-es'
import type { StringsMap } from 'stringTypes'
import type {
  AccessControlCheckError,
  RoleAssignmentMetadataDTO,
  UserMetadataDTO,
  Scope as CDScope
} from 'services/cd-ng'
import { Scope } from '@common/interfaces/SecretsInterface'
import type {
  Assignment,
  RoleOption,
  ResourceGroupOption
} from '@rbac/modals/RoleAssignmentModal/views/UserRoleAssigment'
import { RbacResourceGroupTypes } from '@rbac/constants/utils'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ResourceType } from '@rbac/interfaces/ResourceType'
import type { FeatureRequest } from 'framework/featureStore/featureStoreUtil'
import type { PermissionsRequest } from '@rbac/hooks/usePermission'
import { FeatureWarningTooltip } from '@common/components/FeatureWarning/FeatureWarningWithTooltip'
import type { UseStringsReturn } from 'framework/strings'
import type { ProjectSelectOption } from '@audit-trail/components/FilterDrawer/FilterDrawer'
import css from './utils.module.scss'

export enum PrincipalType {
  USER = 'USER',
  USER_GROUP = 'USER_GROUP',
  SERVICE = 'SERVICE_ACCOUNT'
}

export enum SelectionType {
  ALL = 'ALL',
  SPECIFIED = 'SPECIFIED'
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
  return value === RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR
}

export const isScopeResourceSelector = (value: string): boolean => {
  return value === RbacResourceGroupTypes.SCOPE_RESOURCE_SELECTOR
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

export const isNewRoleAssignment = (assignment: Assignment): boolean => {
  return !(assignment.role.assignmentIdentifier || assignment.resourceGroup.assignmentIdentifier)
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

export const generateScopeList = (org: string, projects: ProjectSelectOption[], accountId: string): CDScope[] => {
  if (projects.length > 0) {
    return projects.map(project => ({
      accountIdentifier: accountId,
      orgIdentifier: project.orgIdentifier,
      projectIdentifier: project.value as string
    }))
  }
  return [
    {
      accountIdentifier: accountId,
      orgIdentifier: org as string
    }
  ]
}
