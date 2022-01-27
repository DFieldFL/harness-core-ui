/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import produce from 'immer'
import type { SelectOption } from '@wings-software/uicore'
import { RbacResourceGroupTypes } from '@rbac/constants/utils'
import type { ResourceType } from '@rbac/interfaces/ResourceType'
import { isDynamicResourceSelector, isScopeResourceSelector, SelectionType } from '@rbac/utils/utils'
import type {
  ResourceGroupDTO,
  ResourceGroupRequestRequestBody,
  ResourceSelector,
  ResponseResourceTypeDTO,
  ResourceType as BEResourceType
} from 'services/resourcegroups'
import { Scope } from '@common/interfaces/SecretsInterface'
import type { UseStringsReturn } from 'framework/strings'
import RbacFactory from '@rbac/factories/RbacFactory'

export enum SelectorScope {
  CURRENT = 'CURRENT',
  INCLUDE_CHILD_SCOPES = 'INCLUDE_CHILD_SCOPES'
}

enum ValidatorTypes {
  BY_RESOURCE_IDENTIFIER = 'BY_RESOURCE_IDENTIFIER',
  BY_RESOURCE_TYPE = 'BY_RESOURCE_TYPE',
  BY_RESOURCE_TYPE_INCLUDING_CHILD_SCOPES = 'BY_RESOURCE_TYPE_INCLUDING_CHILD_SCOPES'
}

export const getSelectedResourcesMap = (
  resourceTypes: ResourceType[],
  resourceSelectorList?: ResourceSelector[]
): Map<ResourceType, string[] | string> => {
  const map: Map<ResourceType, string[] | string> = new Map()
  resourceSelectorList?.map(resourceSelector => {
    if (isDynamicResourceSelector(resourceSelector.type)) {
      map.set(resourceSelector.resourceType, RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR)
    } else if (isScopeResourceSelector(resourceSelector.type)) {
      resourceTypes.forEach(resourceType => {
        map.set(resourceType, RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR)
      })
    } else {
      map.set(resourceSelector.resourceType, resourceSelector.identifiers)
    }
  })
  return map
}

export const validateResourceSelectors = (value: ResourceSelector[]): ResourceType[] => {
  return value
    .filter(val => {
      if (!isDynamicResourceSelector(val.type)) {
        if (val.identifiers?.length < 1) {
          return true
        }
      }
      return false
    })
    .map(val => val.resourceType)
}

export const getResourceSelectorsfromMap = (
  map: Map<ResourceType, string[] | string>,
  selectedScope: SelectorScope
): ResourceSelector[] => {
  const resourceSelectors: ResourceSelector[] = []
  map.forEach((value, key) => {
    if (isDynamicResourceSelector(value)) {
      resourceSelectors.push({
        type: RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR,
        resourceType: key,
        includeChildScopes: selectedScope === SelectorScope.INCLUDE_CHILD_SCOPES
      })
    } else {
      resourceSelectors.push({
        type: RbacResourceGroupTypes.STATIC_RESOURCE_SELECTOR,
        resourceType: key,
        identifiers: value,
        includeChildScopes: selectedScope === SelectorScope.INCLUDE_CHILD_SCOPES
      })
    }
  })
  return resourceSelectors
}

export const computeResourceMapOnChange = (
  setSelectedResourceMap: (value: React.SetStateAction<Map<ResourceType, string | string[]>>) => void,
  selectedResourcesMap: Map<ResourceType, string | string[]>,
  resourceType: ResourceType,
  isAdd: boolean,
  identifiers?: string[]
): void => {
  if (identifiers) {
    if (isAdd) {
      setSelectedResourceMap(
        produce(selectedResourcesMap, draft => {
          draft.set(resourceType, identifiers)
        })
      )
    } else {
      setSelectedResourceMap(
        produce(selectedResourcesMap, draft => {
          if (Array.isArray(draft.get(resourceType))) {
            draft.set(
              resourceType,
              (draft.get(resourceType) as string[]).filter(el => !identifiers.includes(el))
            )
          }
          if (draft.get(resourceType)?.length === 0) {
            draft.delete(resourceType)
          }
        })
      )
    }
  } else {
    if (isAdd) {
      setSelectedResourceMap(
        produce(selectedResourcesMap, draft => {
          draft.set(resourceType, RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR)
        })
      )
    } else {
      setSelectedResourceMap(
        produce(selectedResourcesMap, draft => {
          draft.delete(resourceType)
        })
      )
    }
  }
}

export const computeResourceMapOnMultiChange = (
  setSelectedResourceMap: (value: React.SetStateAction<Map<ResourceType, string | string[]>>) => void,
  selectedResourcesMap: Map<ResourceType, string | string[]>,
  types: ResourceType[],
  isAdd: boolean
): void => {
  if (isAdd) {
    setSelectedResourceMap(
      produce(selectedResourcesMap, draft => {
        types.forEach(resourceType => {
          draft.set(resourceType, RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR)
        })
      })
    )
  } else {
    setSelectedResourceMap(
      produce(selectedResourcesMap, draft => {
        types.forEach(resourceType => {
          draft.delete(resourceType)
        })
      })
    )
  }
}

export const getResourceTypes = (data: BEResourceType[]): ResourceType[] => {
  return (data.map(val => val.name) || []) as ResourceType[]
}

export const getScopeLabelFromApi = (
  getString: UseStringsReturn['getString'],
  scope: Scope,
  resourceSelectors?: ResourceSelector[]
): string => {
  const selectorScope = getScopeForResourceGroup(resourceSelectors)
  const dropDownItems = getScopeDropDownItems(scope, getString)
  const option = dropDownItems.filter(item => item.value === selectorScope)
  return option.length ? option[0].label : ''
}

export const getScopeDropDownItems = (scope: Scope, getString: UseStringsReturn['getString']): SelectOption[] => {
  switch (scope) {
    case Scope.PROJECT:
      return [{ label: getString('rbac.scopeItems.projectOnly'), value: SelectorScope.CURRENT }]
    case Scope.ORG:
      return [
        { label: getString('rbac.scopeItems.orgOnly'), value: SelectorScope.CURRENT },
        { label: getString('rbac.scopeItems.orgAll'), value: SelectorScope.INCLUDE_CHILD_SCOPES }
      ]
    case Scope.ACCOUNT:
    default:
      return [
        { label: getString('rbac.scopeItems.accountOnly'), value: SelectorScope.CURRENT },
        { label: getString('rbac.scopeItems.accountAll'), value: SelectorScope.INCLUDE_CHILD_SCOPES }
      ]
  }
}

export const getResourceSelectionType = (resourceSelectors?: ResourceSelector[]): SelectionType => {
  if (resourceSelectors?.find(selector => isScopeResourceSelector(selector.type))) {
    return SelectionType.ALL
  } else {
    return SelectionType.SPECIFIED
  }
}

export const getScopeForResourceGroup = (resourceSelectors?: ResourceSelector[]): SelectorScope => {
  if (resourceSelectors?.find(selector => selector.includeChildScopes === true)) {
    return SelectorScope.INCLUDE_CHILD_SCOPES
  } else {
    return SelectorScope.CURRENT
  }
}
export const getFormattedDataForApi = (
  data: ResourceGroupDTO,
  selectionType: SelectionType,
  selectedScope: SelectorScope,
  resourceSelectors: ResourceSelector[]
): ResourceGroupRequestRequestBody => {
  const { accountIdentifier, orgIdentifier, projectIdentifier } = data
  return {
    resourcegroup: {
      ...data,
      resourceSelectors:
        selectionType === SelectionType.ALL
          ? [
              {
                type: 'ResourceSelectorByScope',
                includeChildScopes: selectedScope === SelectorScope.INCLUDE_CHILD_SCOPES,
                scope: {
                  accountIdentifier,
                  orgIdentifier,
                  projectIdentifier
                }
              }
            ]
          : resourceSelectors
    }
  }
}

export const getFilteredResourceTypes = (
  data: ResponseResourceTypeDTO | null,
  selectedScope: SelectorScope
): ResourceType[] => {
  const resourceTypes = data?.data?.resourceTypes || []
  if (selectedScope === SelectorScope.CURRENT) {
    return resourceTypes?.reduce((acc: ResourceType[], value) => {
      if (
        value.name &&
        RbacFactory.isRegisteredResourceType(value.name as ResourceType) &&
        value.validatorTypes?.includes(ValidatorTypes.BY_RESOURCE_TYPE)
      ) {
        acc.push(value.name as ResourceType)
      }
      return acc
    }, [])
  }

  return getResourceTypes(resourceTypes)
}

export const cleanUpResourcesMap = (
  resourceTypes: ResourceType[],
  selectedResourcesMap: Map<ResourceType, string | string[]>,
  selectionType: SelectionType
): Map<ResourceType, string | string[]> => {
  const types = [...resourceTypes]
  selectedResourcesMap.forEach((_value, key) => {
    if (!types.includes(key)) {
      selectedResourcesMap.delete(key)
    } else {
      types.splice(types.indexOf(key), 1)
      selectedResourcesMap.set(key, RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR)
    }
  })
  if (selectionType === SelectionType.ALL) {
    types.map(resourceType => {
      selectedResourcesMap.set(resourceType, RbacResourceGroupTypes.DYNAMIC_RESOURCE_SELECTOR)
    })
  }
  return selectedResourcesMap
}
