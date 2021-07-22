import React, { useState } from 'react'
import { Button, TextInput, useModalHook } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useGetTriggerListForTarget } from 'services/pipeline-ng'
import { AddDrawer } from '@common/components'
import { DrawerContext } from '@common/components/AddDrawer/AddDrawer'
import type { GitQueryParams, PipelineType } from '@common/interfaces/RouteInterfaces'
import { usePermission } from '@rbac/hooks/usePermission'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { TriggersListSection, GoToEditWizardInterface } from './TriggersListSection'
import { TriggerTypes } from '../utils/TriggersWizardPageUtils'
import {
  ArtifactSourceProviders,
  getCategoryItems,
  ItemInterface,
  TriggerDataInterface
} from '../utils/TriggersListUtils'
import css from './TriggersList.module.scss'

interface TriggersListPropsInterface {
  onNewTriggerClick: (val: TriggerDataInterface) => void
}
// This is temporary feature flag for NewArtifact Trigger
const NG_NEWARTIFACT_TRIGGER = (true && window.location.href.includes('localhost')) || false
export default function TriggersList(props: TriggersListPropsInterface & GitQueryParams): JSX.Element {
  const { onNewTriggerClick, repoIdentifier, branch } = props

  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier, module } = useParams<
    PipelineType<{
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
      pipelineIdentifier: string
    }>
  >()

  const [searchParam, setSearchParam] = useState('')
  const { getString } = useStrings()

  const {
    data: triggerListResponse,
    error,
    refetch,
    loading
  } = useGetTriggerListForTarget({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      targetIdentifier: pipelineIdentifier,
      searchTerm: searchParam
    },
    debounce: 300
  })
  const triggerList = triggerListResponse?.data?.content || undefined
  const history = useHistory()

  const [isEditable] = usePermission(
    {
      resourceScope: {
        projectIdentifier: projectIdentifier,
        orgIdentifier: orgIdentifier,
        accountIdentifier: accountId
      },
      resource: {
        resourceType: ResourceType.PIPELINE,
        resourceIdentifier: pipelineIdentifier
      },
      permissions: [PermissionIdentifier.EDIT_PIPELINE],
      options: {
        skipCache: true
      }
    },
    [projectIdentifier, orgIdentifier, accountId, pipelineIdentifier]
  )

  const goToEditWizard = ({ triggerIdentifier, triggerType }: GoToEditWizardInterface): void => {
    history.push(
      routes.toTriggersWizardPage({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        triggerIdentifier,
        triggerType,
        module,
        repoIdentifier,
        branch
      })
    )
  }
  const goToDetails = ({ triggerIdentifier }: GoToEditWizardInterface): void => {
    history.push(
      routes.toTriggersDetailPage({
        accountId,
        orgIdentifier,
        projectIdentifier,
        pipelineIdentifier,
        triggerIdentifier,
        module,
        repoIdentifier,
        branch
      })
    )
  }

  const [openDrawer, hideDrawer] = useModalHook(() => {
    const onSelect = (val: ItemInterface): void => {
      if (val?.categoryValue) {
        hideDrawer()
        onNewTriggerClick({
          triggerType: val.categoryValue,
          sourceRepo: (val.categoryValue === TriggerTypes.WEBHOOK && val.value) || undefined
        })
      }
    }

    const categoryItems = getCategoryItems(getString)
    if (NG_NEWARTIFACT_TRIGGER) {
      categoryItems.categories.push({
        categoryLabel: getString('pipeline.triggers.onNewArtifactTitle'),
        categoryValue: 'NewArtifact',
        items: [
          {
            itemLabel: getString('pipeline.triggers.newArtifactLabel'),
            value: ArtifactSourceProviders.NewArtifact.value,
            iconName: ArtifactSourceProviders.NewArtifact.iconName
          },
          {
            itemLabel: getString('pipeline.triggers.newManifestLabel'),
            value: ArtifactSourceProviders.NewManifest.value,
            iconName: ArtifactSourceProviders.NewManifest.iconName
          }
        ]
      })
    }

    return (
      <AddDrawer
        addDrawerMap={categoryItems}
        onSelect={onSelect}
        onClose={hideDrawer}
        drawerContext={DrawerContext.STUDIO}
      />
    )
  })

  return (
    <>
      <Page.SubHeader>
        <Button
          disabled={!isEditable}
          text={getString('pipeline.triggers.newTrigger')}
          intent="primary"
          onClick={openDrawer}
        ></Button>
        <TextInput
          leftIcon="search"
          placeholder={getString('search')}
          data-name="search"
          className={css.search}
          value={searchParam}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchParam(e.target.value.trim())
          }}
        />
      </Page.SubHeader>

      <Page.Body
        loading={loading}
        error={error?.message}
        retryOnError={() => refetch()}
        noData={
          !searchParam
            ? {
                when: () => Array.isArray(triggerList) && triggerList.length === 0,
                icon: 'yaml-builder-trigger',
                message: getString('pipeline.triggers.aboutTriggers'),
                buttonText: getString('pipeline.triggers.addNewTrigger'),
                onClick: openDrawer,
                buttonDisabled: !isEditable
              }
            : {
                when: () => Array.isArray(triggerList) && triggerList.length === 0,
                icon: 'yaml-builder-trigger',
                message: getString('pipeline.triggers.noTriggersFound')
              }
        }
      >
        <TriggersListSection
          data={triggerList}
          refetchTriggerList={refetch}
          goToEditWizard={goToEditWizard}
          goToDetails={goToDetails}
        />
      </Page.Body>
    </>
  )
}
