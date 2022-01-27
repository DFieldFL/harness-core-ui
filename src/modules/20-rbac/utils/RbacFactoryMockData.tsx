/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import type { ResourceHandler, ResourceCategoryHandler } from '@rbac/factories/RbacFactory'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { String } from 'framework/strings'

export const getResourceTypeHandlerMock = (resource: ResourceType): ResourceHandler | undefined => {
  switch (resource) {
    case ResourceType.PROJECT:
      return {
        icon: 'nav-project',
        label: 'projectsText',
        category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
        permissionLabels: {
          [PermissionIdentifier.UPDATE_PROJECT]: <String stringID="rbac.permissionLabels.createEdit" />,
          [PermissionIdentifier.VIEW_PROJECT]: <String stringID="rbac.permissionLabels.view" />,
          [PermissionIdentifier.DELETE_PROJECT]: <String stringID="rbac.permissionLabels.delete" />
        },
        // eslint-disable-next-line react/display-name
        addResourceModalBody: () => <></>
      }
    case ResourceType.ORGANIZATION:
      return {
        icon: 'settings',
        label: 'orgsText',
        category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
        permissionLabels: {
          [PermissionIdentifier.UPDATE_ORG]: <String stringID="rbac.permissionLabels.createEdit" />,
          [PermissionIdentifier.VIEW_ORG]: <String stringID="rbac.permissionLabels.view" />,
          [PermissionIdentifier.DELETE_ORG]: <String stringID="rbac.permissionLabels.delete" />
        },
        // eslint-disable-next-line react/display-name
        addResourceModalBody: () => <></>
      }
    case ResourceType.SECRET:
      return {
        icon: 'lock',
        label: 'common.secrets',
        category: ResourceCategory.SHARED_RESOURCES,
        // eslint-disable-next-line react/display-name
        addResourceModalBody: () => <></>
      }
    case ResourceType.CONNECTOR:
      return {
        icon: 'lock',
        label: 'connectorsLabel',
        category: ResourceCategory.SHARED_RESOURCES,
        // eslint-disable-next-line react/display-name
        addResourceModalBody: () => <></>
      }
    case ResourceType.DELEGATE:
      return {
        icon: 'main-delegates',
        label: 'delegate.delegates',
        category: ResourceCategory.SHARED_RESOURCES,
        // eslint-disable-next-line react/display-name
        addResourceModalBody: () => <></>
      }
  }
}

export const getResourceGroupTypeHandlerMock = (
  resource: ResourceType | ResourceCategory
): ResourceCategoryHandler | undefined => {
  switch (resource) {
    case ResourceCategory.SHARED_RESOURCES:
      return {
        icon: 'nav-project',
        label: 'rbac.categoryLabels.sharedResources'
      }
    case ResourceCategory.ADMINSTRATIVE_FUNCTIONS:
      return {
        icon: 'nav-project',
        label: 'adminFunctions'
      }
  }
}

export const getResourceCategoryListMock = (): Map<ResourceCategory | ResourceType, ResourceType[] | undefined> => {
  const mockMap = new Map()
  mockMap.set(ResourceCategory.ADMINSTRATIVE_FUNCTIONS, [ResourceType.ORGANIZATION, ResourceType.PROJECT])
  mockMap.set(ResourceCategory.SHARED_RESOURCES, [
    ResourceType.SECRET,
    ResourceType.CONNECTOR,
    ResourceType.DELEGATE,
    ResourceType.DELEGATECONFIGURATION
  ])
  return mockMap
}
