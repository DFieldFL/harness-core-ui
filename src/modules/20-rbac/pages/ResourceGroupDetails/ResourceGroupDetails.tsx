/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import {
  Text,
  Layout,
  Container,
  Color,
  Icon,
  ButtonVariation,
  useToaster,
  Page,
  getErrorInfoFromErrorObject,
  Card,
  Button,
  DropDown,
  FontVariation
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import { defaultTo } from 'lodash-es'
import type { ModulePathParams, ResourceGroupDetailsPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import ResourceTypeList from '@rbac/components/ResourceTypeList/ResourceTypeList'
import {
  useGetResourceGroup,
  useUpdateResourceGroup,
  ResourceGroupRequestRequestBody,
  ResourceGroupDTO,
  useGetResourceTypes
} from 'services/resourcegroups'
import { ResourceType, ResourceCategory } from '@rbac/interfaces/ResourceType'
import ResourcesCard from '@rbac/components/ResourcesCard/ResourcesCard'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import RbacFactory from '@rbac/factories/RbacFactory'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { usePermission } from '@rbac/hooks/usePermission'
import { SelectionType } from '@rbac/utils/utils'
import { getScopeFromDTO } from '@common/components/EntityReference/EntityReference'
import {
  cleanUpResourcesMap,
  computeResourceMapOnChange,
  computeResourceMapOnMultiChange,
  getFilteredResourceTypes,
  getFormattedDataForApi,
  getResourceSelectionType,
  getResourceSelectorsfromMap,
  getScopeDropDownItems,
  getScopeForResourceGroup,
  getSelectedResourcesMap,
  SelectorScope,
  validateResourceSelectors
} from './utils'
import css from './ResourceGroupDetails.module.scss'

const ResourceGroupDetails: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier, resourceGroupIdentifier, module } = useParams<
    ResourceGroupDetailsPathProps & ModulePathParams
  >()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const [isUpdated, setIsUpdated] = useState<boolean>(false)
  const [selectedScope, setSelectedScope] = useState<SelectorScope>(SelectorScope.CURRENT)
  const [selectionType, setSelectionType] = useState<SelectionType>(SelectionType.SPECIFIED)
  const [selectedResourcesMap, setSelectedResourceMap] = useState<Map<ResourceType, string[] | string>>(new Map())
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([])
  const [resourceCategoryMap, setResourceCategoryMap] =
    useState<Map<ResourceType | ResourceCategory, ResourceType[] | undefined>>()
  const scope = getScopeFromDTO({ accountIdentifier: accountId, orgIdentifier, projectIdentifier })

  const [canEdit] = usePermission(
    {
      resource: {
        resourceType: ResourceType.RESOURCEGROUP,
        resourceIdentifier: resourceGroupIdentifier
      },
      permissions: [PermissionIdentifier.UPDATE_RESOURCEGROUP]
    },
    [resourceGroupIdentifier]
  )

  const {
    data: resourceGroupDetails,
    error: errorInGettingResourceGroup,
    loading,
    refetch
  } = useGetResourceGroup({
    identifier: resourceGroupIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  const { data: resourceTypeData } = useGetResourceTypes({
    queryParams: {
      accountIdentifier: accountId,
      projectIdentifier,
      orgIdentifier
    }
  })

  useEffect(() => {
    const selectors = resourceGroupDetails?.data?.resourceGroup.resourceSelectors
    setSelectedResourceMap(
      getSelectedResourcesMap(resourceTypes, resourceGroupDetails?.data?.resourceGroup.resourceSelectors)
    )
    setIsUpdated(false)
    setSelectionType(getResourceSelectionType(selectors))
    setSelectedScope(getScopeForResourceGroup(selectors))
  }, [resourceGroupDetails?.data?.resourceGroup])

  useEffect(() => {
    const types = getFilteredResourceTypes(resourceTypeData, selectedScope)
    setResourceTypes(types)
    setResourceCategoryMap(_map => RbacFactory.getResourceCategoryList(types))
    setSelectedResourceMap(_selectedResourcesMap => cleanUpResourcesMap(types, _selectedResourcesMap, selectionType))
  }, [selectedScope, resourceTypeData])

  const { mutate: updateResourceGroup, loading: updating } = useUpdateResourceGroup({
    identifier: defaultTo(resourceGroupIdentifier, ''),
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    }
  })

  const updateResourceGroupData = async (data: ResourceGroupDTO): Promise<void> => {
    const resourceSelectors = getResourceSelectorsfromMap(selectedResourcesMap, selectedScope)
    const invalidResources = validateResourceSelectors(resourceSelectors)?.map(val =>
      getString(defaultTo(RbacFactory.getResourceTypeLabelKey(val), 'string'))
    )
    if (invalidResources.length > 0) {
      showError(getString('rbac.resourceSelectorErrorMessage', { resources: invalidResources.toString() }))
      return
    }
    const dataToSubmit: ResourceGroupRequestRequestBody = getFormattedDataForApi(
      data,
      selectionType,
      selectedScope,
      resourceSelectors
    )

    try {
      const updated = await updateResourceGroup(dataToSubmit)
      if (updated) {
        showSuccess(getString('rbac.resourceGroup.updateSuccess'))
        refetch()
      }
    } /* istanbul ignore next */ catch (err) {
      showError(getErrorInfoFromErrorObject(err))
    }
  }

  const disableSelection = (): boolean => {
    return selectionType === SelectionType.ALL || selectedScope === SelectorScope.INCLUDE_CHILD_SCOPES
  }

  const onResourceSelectionChange = (resourceType: ResourceType, isAdd: boolean, identifiers?: string[]): void => {
    setIsUpdated(true)
    computeResourceMapOnChange(setSelectedResourceMap, selectedResourcesMap, resourceType, isAdd, identifiers)
  }

  const onSelectionTypeChange = (type: SelectionType): void => {
    setSelectionType(type)
    setIsUpdated(true)
    if (type === SelectionType.ALL) {
      computeResourceMapOnMultiChange(setSelectedResourceMap, selectedResourcesMap, resourceTypes, true)
    }
  }

  const onResourceCategorySelect = (types: ResourceType[], isAdd: boolean): void => {
    setIsUpdated(true)
    computeResourceMapOnMultiChange(setSelectedResourceMap, selectedResourcesMap, types, isAdd)
  }

  const resourceGroup = resourceGroupDetails?.data?.resourceGroup
  const isHarnessManaged = resourceGroupDetails?.data?.harnessManaged
  const disableAddingResources = isHarnessManaged || !canEdit || selectionType === SelectionType.ALL

  useDocumentTitle([defaultTo(resourceGroup?.name, ''), getString('resourceGroups')])

  if (loading) return <Page.Spinner />
  if (errorInGettingResourceGroup)
    return (
      <Page.Error
        message={defaultTo((errorInGettingResourceGroup.data as Error)?.message, errorInGettingResourceGroup.message)}
      />
    )
  if (!resourceGroup)
    return <Page.NoDataCard icon="resources-icon" message={getString('rbac.resourceGroup.noResourceGroupFound')} />

  return (
    <>
      <Page.Header
        size="xlarge"
        breadcrumbs={
          <NGBreadcrumbs
            links={[
              {
                url: routes.toResourceGroups({ accountId, orgIdentifier, projectIdentifier, module }),
                label: `${getString('accessControl')}: ${getString('resourceGroups')}`
              }
            ]}
          />
        }
        title={
          <Layout.Horizontal spacing="medium" flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
            <div style={{ backgroundColor: resourceGroup.color }} className={css.colorDiv}></div>
            <Layout.Vertical padding={{ left: 'small' }} spacing="xsmall">
              <Text font="medium" lineClamp={1} color={Color.BLACK} width={700}>
                {resourceGroup.name}
              </Text>
              {resourceGroup.description && (
                <Text lineClamp={1} color={Color.GREY_400} width={700}>
                  {resourceGroup.description}
                </Text>
              )}
            </Layout.Vertical>
          </Layout.Horizontal>
        }
        toolbar={
          <Layout.Horizontal margin={{ top: 'huge' }}>
            <Layout.Horizontal
              padding={{ right: 'small' }}
              border={{ right: true, color: Color.GREY_300 }}
              spacing="xsmall"
            >
              <Text font="small">{getString('created').toUpperCase()}:</Text>
              <Text lineClamp={1} color={Color.BLACK} font="small">
                {isHarnessManaged ? (
                  <Text lineClamp={1} color={Color.BLACK}>
                    {getString('rbac.resourceGroup.builtInResourceGroup')}
                  </Text>
                ) : (
                  <ReactTimeago date={defaultTo(resourceGroupDetails?.data?.createdAt, '')} />
                )}
              </Text>
            </Layout.Horizontal>
            <Layout.Horizontal spacing="xsmall" padding={{ left: 'small' }}>
              <Text font="small">{getString('lastUpdated').toUpperCase()}:</Text>
              <Text lineClamp={1} color={Color.BLACK} font="small">
                {isHarnessManaged ? (
                  <Text lineClamp={1} color={Color.BLACK}>
                    {getString('rbac.resourceGroup.builtInResourceGroup')}
                  </Text>
                ) : (
                  <ReactTimeago date={defaultTo(resourceGroupDetails?.data?.lastModifiedAt, '')} />
                )}
              </Text>
            </Layout.Horizontal>
          </Layout.Horizontal>
        }
      />
      <Page.Body loading={updating || loading} className={css.resourceGroupDetails}>
        {!isHarnessManaged && (
          <Card className={css.subHeader}>
            <Layout.Horizontal flex={{ justifyContent: 'space-between' }} width="100%">
              <Text color={Color.BLACK}>{getString('rbac.resourceGroup.selectionHeading')}</Text>
              <Layout.Horizontal flex={{ justifyContent: 'flex-end' }} spacing="medium">
                {isUpdated && (
                  <Layout.Horizontal spacing="xsmall" flex>
                    <Icon name="dot" color={Color.ORANGE_600} size={20} />
                    <Text color={Color.ORANGE_600}>{getString('unsavedChanges')}</Text>
                  </Layout.Horizontal>
                )}
                <RbacButton
                  text={getString('applyChanges')}
                  onClick={() => updateResourceGroupData(resourceGroup)}
                  disabled={updating || !isUpdated}
                  variation={ButtonVariation.PRIMARY}
                  permission={{
                    resource: {
                      resourceType: ResourceType.RESOURCEGROUP,
                      resourceIdentifier: resourceGroupIdentifier
                    },
                    permission: PermissionIdentifier.UPDATE_RESOURCEGROUP
                  }}
                />
                <Button
                  text={getString('common.discard')}
                  onClick={() => refetch()}
                  disabled={!isUpdated}
                  variation={ButtonVariation.TERTIARY}
                />
              </Layout.Horizontal>
            </Layout.Horizontal>
          </Card>
        )}
        <Container className={css.pageContainer}>
          <Container padding="xlarge" className={css.resourceTypeListContainer}>
            <ResourceTypeList
              selectionType={selectionType}
              resourceCategoryMap={resourceCategoryMap}
              onResourceSelectionChange={onResourceSelectionChange}
              onResourceCategorySelect={onResourceCategorySelect}
              preSelectedResourceList={Array.from(selectedResourcesMap.keys())}
              disableAddingResources={disableAddingResources}
              onSelectionTypeChange={onSelectionTypeChange}
            />
          </Container>
          <Container
            padding="xlarge"
            onDrop={event => {
              const resourceCategory: ResourceType | ResourceCategory = event.dataTransfer.getData('text/plain') as
                | ResourceType
                | ResourceCategory
              const types = resourceCategoryMap?.get(resourceCategory)
              if (types) {
                onResourceCategorySelect(types, true)
              } else onResourceSelectionChange(resourceCategory as ResourceType, true)

              event.preventDefault()
              event.stopPropagation()
            }}
            onDragOver={event => {
              event.dataTransfer.dropEffect = 'copy'
              event.preventDefault()
            }}
          >
            <Layout.Vertical spacing="small">
              <Layout.Horizontal spacing="small" flex={{ justifyContent: 'flex-start' }} padding={{ bottom: 'small' }}>
                <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_800}>
                  {getString('common.scope')}
                </Text>
                <DropDown
                  items={getScopeDropDownItems(scope, getString)}
                  icon="settings"
                  value={selectedScope}
                  onChange={item => {
                    setIsUpdated(true)
                    setSelectedScope(item.value as SelectorScope)
                  }}
                  width={300}
                  filterable={false}
                />
              </Layout.Horizontal>

              {Array.from(selectedResourcesMap.keys()).length === 0 && (
                <Page.NoDataCard
                  message={getString('rbac.resourceGroup.dragAndDropData')}
                  icon="drag-handle-horizontal"
                  iconSize={100}
                />
              )}
              {Array.from(selectedResourcesMap.keys()).length !== 0 &&
                Array.from(selectedResourcesMap.keys()).map(resourceType => {
                  return (
                    <ResourcesCard
                      key={resourceType}
                      resourceType={resourceType}
                      resourceValues={defaultTo(selectedResourcesMap.get(resourceType), [])}
                      onResourceSelectionChange={onResourceSelectionChange}
                      disableAddingResources={isHarnessManaged}
                      disableSelection={disableSelection()}
                    />
                  )
                })}
            </Layout.Vertical>
          </Container>
        </Container>
      </Page.Body>
    </>
  )
}

export default ResourceGroupDetails
