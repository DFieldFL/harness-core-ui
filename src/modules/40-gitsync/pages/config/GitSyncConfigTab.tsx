/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useState } from 'react'
import {
  Container,
  Layout,
  Page,
  Button,
  ButtonVariation,
  PageSpinner,
  ExpandingSearchInput,
  Checkbox,
  useToaster,
  MultiSelectDropDown,
  SelectOption,
  MultiSelectOption,
  FontVariation,
  Color,
  useModalHook,
  Dialog
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { defaultTo } from 'lodash-es'
import debounce from 'p-debounce'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  GitFullSyncEntityInfoFilterKeys,
  PageGitFullSyncEntityInfoDTO,
  ResponsePageGitFullSyncEntityInfoDTO,
  triggerFullSyncPromise,
  useListFullSyncFiles
} from 'services/cd-ng'
import { useStrings } from 'framework/strings'
import { setPageNumber } from '@common/utils/utils'
import { Entities } from '@common/interfaces/GitSyncInterface'
import FullSyncForm from '@gitsync/components/FullSyncForm/FullSyncForm'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import GitFullSyncEntityList from './GitFullSyncEntityList'
import css from './GitSyncConfigTab.module.scss'

const enum SyncStatus {
  QUEUED = 'QUEUED',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  OVERRIDDEN = 'OVERRIDDEN'
}

const GitSyncConfigTab: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const [fullSyncEntities, setFullSyncEntities] = useState<PageGitFullSyncEntityInfoDTO | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [showOnlyFailed, setShowOnlyFailed] = useState(false)
  const [debounceWait, setDebounceWait] = useState<number>(0)
  const [selectedEntity, setSelectedEntity] = useState<MultiSelectOption[]>()

  const supportedGitEntities: SelectOption[] = [
    {
      label: getString('connectorsLabel'),
      value: defaultTo(Entities.CONNECTORS, '')
    },
    {
      label: getString('pipelines'),
      value: defaultTo(Entities.PIPELINES, '')
    },
    {
      label: getString('inputSetsText'),
      value: defaultTo(Entities.INPUT_SETS, '')
    },
    {
      label: getString('common.templates'),
      value: defaultTo(Entities.TEMPLATE, '')
    }
  ]

  const { mutate: getFullSyncFiles, loading } = useListFullSyncFiles({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier,
      pageIndex: page,
      pageSize: 10,
      searchTerm
    }
  })

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog isOpen={true} enforceFocus={false} onClose={hideModal} className={css.dialog}>
        <GitSyncStoreProvider>
          <FullSyncForm isNewUser={false} orgIdentifier={orgIdentifier} projectIdentifier={projectIdentifier} />
        </GitSyncStoreProvider>
      </Dialog>
    ),
    []
  )

  const fetchFullSyncFiles = (): Promise<ResponsePageGitFullSyncEntityInfoDTO> => {
    return getFullSyncFiles({
      syncStatus: showOnlyFailed ? SyncStatus.FAILED : undefined,
      entityTypes: selectedEntity?.map(
        (option: MultiSelectOption) => option.value
      ) as GitFullSyncEntityInfoFilterKeys['entityTypes']
    })
  }

  const debouncedGetFullSyncFiles = useCallback(
    debounceWait
      ? debounce(fetchFullSyncFiles, debounceWait)
      : () => {
          setDebounceWait(500)
          return fetchFullSyncFiles()
        },
    [getFullSyncFiles, showOnlyFailed, selectedEntity]
  )

  useEffect(() => {
    setPageNumber({ setPage, page, pageItemsCount: fullSyncEntities?.pageItemCount })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullSyncEntities])

  useEffect(() => {
    debouncedGetFullSyncFiles().then(response => setFullSyncEntities(response.data))
  }, [searchTerm, page, showOnlyFailed, selectedEntity, debouncedGetFullSyncFiles])

  const handleReSync = async (): Promise<void> => {
    const triggerFullSync = await triggerFullSyncPromise({
      queryParams: {
        accountIdentifier: accountId,
        orgIdentifier,
        projectIdentifier
      },
      body: undefined
    })
    setFullSyncEntities((await debouncedGetFullSyncFiles()).data)

    if (triggerFullSync.status === 'SUCCESS') {
      showSuccess(getString('gitsync.resyncSucessToaster'))
    } else {
      showError((triggerFullSync as Error)?.message || getString('gitsync.resyncFailToaster'))
    }
  }

  return (
    <>
      <Page.SubHeader>
        <Layout.Horizontal flex={{ justifyContent: 'space-between' }} width={'100%'}>
          <Layout.Horizontal spacing="medium">
            <Container border padding={{ top: 'xsmall', right: 'small', bottom: 'xsmall', left: 'small' }}>
              <Checkbox
                disabled={loading}
                name="syncFailedFilter"
                label={getString('gitsync.syncFailed')}
                font={{ variation: FontVariation.FORM_LABEL }}
                color={Color.GREY_900}
                onChange={e => {
                  setShowOnlyFailed(!!e.currentTarget.checked)
                }}
              />
            </Container>
            <MultiSelectDropDown
              buttonTestId={'entityTypeFilter'}
              value={selectedEntity}
              width={200}
              items={supportedGitEntities}
              usePortal={true}
              placeholder={getString('common.entityType')}
              className={css.entityTypeFilter}
              onChange={setSelectedEntity}
            />
          </Layout.Horizontal>
          <Layout.Horizontal spacing="medium">
            <ExpandingSearchInput
              alwaysExpanded
              width={250}
              placeholder={getString('search')}
              throttle={200}
              onChange={text => {
                setSearchTerm(text.trim())
                setPage(0)
              }}
            />
            <Button
              variation={ButtonVariation.SECONDARY}
              text={getString('gitsync.resyncButtonText')}
              disabled={loading}
              onClick={handleReSync}
            />
            <Button
              variation={ButtonVariation.SECONDARY}
              text={getString('gitsync.editConfigButtonText')}
              disabled={loading}
              onClick={() => showModal()}
            />
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Page.SubHeader>
      <Page.Body>
        {loading || debounceWait === 0 ? (
          <PageSpinner />
        ) : fullSyncEntities?.totalItems ? (
          <Container padding="xlarge" height={'100%'}>
            <GitFullSyncEntityList data={fullSyncEntities} gotoPage={(pageNumber: number) => setPage(pageNumber)} />
          </Container>
        ) : (
          <Page.NoDataCard message={getString('noData')} />
        )}
      </Page.Body>
    </>
  )
}

export default GitSyncConfigTab
