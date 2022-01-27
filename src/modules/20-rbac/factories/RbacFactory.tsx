/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type React from 'react'
import type { IconName } from '@harness/uicore'
import type { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import type { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ResourceScope } from '@rbac/interfaces/ResourceScope'
import type { StringsMap } from 'framework/strings/StringsContext'

export interface RbacResourceModalProps {
  searchTerm: string
  selectedData: string[]
  onSelectChange: (items: string[]) => void
  resourceScope: ResourceScope
}
export interface RbacResourceRendererProps {
  identifiers: string[]
  resourceScope: ResourceScope
  onResourceSelectionChange: (resourceType: ResourceType, isAdd: boolean, identifiers?: string[] | undefined) => void
  resourceType: ResourceType
}
export interface ResourceHandler {
  icon: IconName
  label: keyof StringsMap
  labelOverride?: keyof StringsMap | undefined
  permissionLabels?: {
    [key in PermissionIdentifier]?: string | React.ReactElement
  }
  addResourceModalBody?: (props: RbacResourceModalProps) => React.ReactElement
  staticResourceRenderer?: (props: RbacResourceRendererProps) => React.ReactElement
  category?: ResourceCategory
}

export interface ResourceCategoryHandler {
  icon: IconName
  label: keyof StringsMap
  resourceTypes?: Set<ResourceType>
}

class RbacFactory {
  private map: Map<ResourceType, ResourceHandler>
  private resourceCategoryMap: Map<ResourceCategory, ResourceCategoryHandler>

  constructor() {
    this.map = new Map()
    this.resourceCategoryMap = new Map()
  }

  registerResourceCategory(resourceCategory: ResourceCategory, handler: ResourceCategoryHandler): void {
    this.resourceCategoryMap.set(resourceCategory, handler)
  }

  registerResourceTypeHandler(resourceType: ResourceType, handler: ResourceHandler): void {
    this.map.set(resourceType, handler)
  }

  getResourceCategoryList(resources: ResourceType[]): Map<ResourceCategory | ResourceType, ResourceType[] | undefined> {
    const categoryMap: Map<ResourceCategory | ResourceType, ResourceType[] | undefined> = new Map()

    resources.map(resourceType => {
      const handler = this.map.get(resourceType)
      if (handler) {
        if (handler.category) {
          const resourceTypes = categoryMap.get(handler.category)
          if (resourceTypes) {
            categoryMap.set(handler.category, [...resourceTypes, resourceType])
          } else categoryMap.set(handler.category, [resourceType])
        } else {
          categoryMap.set(resourceType, undefined)
        }
      }
    })

    return categoryMap
  }

  getResourceCategoryHandler(resourceCategory: ResourceCategory): ResourceCategoryHandler | undefined {
    return this.resourceCategoryMap.get(resourceCategory)
  }

  getResourceTypeHandler(resourceType: ResourceType): ResourceHandler | undefined {
    return this.map.get(resourceType)
  }

  getResourceTypeLabelKey(resourceType: ResourceType): keyof StringsMap | undefined {
    return this.map.get(resourceType)?.label
  }

  isRegisteredResourceType(resourceType: ResourceType): boolean {
    return this.map.has(resourceType)
  }
}

export default new RbacFactory()
