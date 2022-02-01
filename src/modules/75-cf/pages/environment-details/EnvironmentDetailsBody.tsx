/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useContext, useMemo, useState } from 'react'
import {
  Button,
  Color,
  Container,
  FontVariation,
  Heading,
  Layout,
  Pagination,
  Tab,
  Tabs,
  Text,
  Utils,
  PageError,
  TableV2
} from '@wings-software/uicore'
import { get } from 'lodash-es'
import type { Column } from 'react-table'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { ApiKey, useDeleteApiKey, useGetAllAPIKeys } from 'services/cf'
import { useToaster } from '@common/exports'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { useEnvStrings } from '@cf/hooks/environment'
import { CF_DEFAULT_PAGE_SIZE, EnvironmentSDKKeyType, getErrorMessage } from '@cf/utils/CFUtils'
import { withTableData } from '@cf/utils/table-utils'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import AddKeyDialog from '../../components/AddKeyDialog/AddKeyDialog'
import css from './EnvironmentDetails.module.scss'

type CustomColumn<T extends Record<string, any>> = Column<T>

type RowFunctions = {
  environmentIdentifier: string
  isNew: (id: string) => boolean
  onDelete: (id: string, name: string) => void
  getSecret: (id: string, fallback: string) => string
}
const defaultContext = { environmentIdentifier: '', isNew: () => false, onDelete: () => false, getSecret: () => '' }
const RowContext = React.createContext<RowFunctions>(defaultContext)

const withApiKey = withTableData<ApiKey, { apiKey: ApiKey }>(({ row }) => ({ apiKey: row.original }))

const NameCell = withApiKey(({ apiKey }) => <Text font={{ weight: 'bold' }}>{apiKey.name}</Text>)
const TypeCell = withApiKey(({ apiKey }) => {
  const { getEnvString } = useEnvStrings()

  return <Text>{getEnvString(`apiKeys.${apiKey.type.toLowerCase()}Type`)}</Text>
})

const ApiInfoCell = withApiKey(({ apiKey }) => {
  const { environmentIdentifier, isNew, onDelete, getSecret } = useContext(RowContext) ?? defaultContext
  const { getString, getEnvString } = useEnvStrings()
  const { showSuccess, showError } = useToaster()
  const showCopy = isNew(apiKey.identifier)

  const apiKeyText = showCopy ? getSecret(apiKey.identifier, apiKey.apiKey) : apiKey.apiKey

  const handleCopy = (): void => {
    Utils.copy(apiKeyText)
      .then(() => showSuccess(getString('clipboardCopySuccess')))
      .catch(() => showError(getString('clipboardCopyFail'), undefined, 'cf.copy.text.error'))
  }

  return (
    <Layout.Horizontal flex={{ distribution: 'space-between' }}>
      <Layout.Horizontal spacing="small" flex={{ alignItems: 'center' }} className={css.keyContainer}>
        <Text font={{ weight: 'bold' }} className={css.keyType}>
          {apiKey.type === EnvironmentSDKKeyType.CLIENT ? getString(`common.clientId`) : getString('secretType')}:
        </Text>
        {showCopy ? (
          <div className={css.keyCopyContainer}>
            <Text
              font={{ mono: true }}
              rightIcon="main-clone"
              rightIconProps={{
                onClick: handleCopy,
                color: Color.GREY_350,
                className: css.keyCopyIcon
              }}
              padding="small"
              className={css.keyCopy}
            >
              {apiKeyText}
            </Text>
            <Text font={{ variation: FontVariation.TINY }} color={Color.ORANGE_900} className={css.keyRedactionWarning}>
              {getEnvString('apiKeys.redactionWarning')}
            </Text>
          </div>
        ) : (
          <Text>{apiKeyText}</Text>
        )}
      </Layout.Horizontal>
      <Container>
        <RbacButton
          minimal
          icon="trash"
          iconProps={{
            size: 16
          }}
          className={css.keyDeleteButton}
          tooltip={
            <Container width="350px" padding="medium">
              <Heading level={2} font={{ weight: 'semi-bold' }} margin={{ bottom: 'small' }}>
                {getEnvString('apiKeys.deleteTitle')}
              </Heading>
              <Text margin={{ bottom: 'medium' }}>
                {getEnvString('apiKeys.deleteMessage', { keyName: apiKey.name })}
              </Text>
              <Container flex>
                <span />
                <Layout.Horizontal spacing="small">
                  <Button text={getString('cancel')} className="bp3-popover-dismiss" />
                  <Button
                    intent="danger"
                    text={getString('delete')}
                    className="bp3-popover-dismiss"
                    onClick={() => onDelete(apiKey.identifier, apiKey.name)}
                  />
                </Layout.Horizontal>
              </Container>
            </Container>
          }
          tooltipProps={{
            interactionKind: 'click'
          }}
          permission={{
            resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: environmentIdentifier },
            permission: PermissionIdentifier.EDIT_ENVIRONMENT
          }}
        />
      </Container>
    </Layout.Horizontal>
  )
})

const EnvironmentSDKKeys: React.FC<{ environment: EnvironmentResponseDTO }> = ({ environment }) => {
  const { showSuccess, showError } = useToaster()
  const { getString, getEnvString } = useEnvStrings()
  const [recents, setRecents] = useState<ApiKey[]>([])
  const [page, setPage] = useState<number>(0)

  const queryParams = {
    project: environment.projectIdentifier as string,
    environment: environment.identifier as string,
    account: environment.accountId as string,
    accountIdentifier: environment.accountId as string,
    org: environment.orgIdentifier as string
  }

  const { data, loading, error, refetch } = useGetAllAPIKeys({
    queryParams: {
      ...queryParams,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      pageNumber: page
    }
  })

  const { mutate: deleteKey } = useDeleteApiKey({ queryParams })
  const handleDelete = (id: string, keyName: string): void => {
    deleteKey(id)
      .then(() => showSuccess(getString('cf.environments.apiKeys.deleteSuccess', { keyName })))
      .then(() => refetch())
      .catch(deleteError =>
        showError(get(deleteError, 'data.error', deleteError?.message), undefined, 'cf.delete.api.key.error')
      )
  }

  const { apiKeys, ...pagination } = data ?? {
    itemCount: 0,
    pageCount: 0,
    pageIndex: 0,
    pageSize: CF_DEFAULT_PAGE_SIZE
  }
  const hasData = !error && !loading && (apiKeys || []).length > 0
  const emptyData = !error && !loading && (apiKeys || []).length === 0

  const columns: CustomColumn<ApiKey>[] = useMemo(
    () => [
      {
        Header: getString('name').toUpperCase(),
        accessor: 'name',
        width: '25%',
        Cell: NameCell
      },
      {
        Header: getString('typeLabel').toUpperCase(),
        accessor: 'type',
        width: '10%',
        Cell: TypeCell
      },
      {
        id: 'info',
        width: '65%',
        Cell: ApiInfoCell
      }
    ],
    []
  )

  return (
    <Container width="100%" height="calc(100vh - 174px)">
      {hasData && (
        <Layout.Vertical
          padding={{ top: 'xxxlarge', left: 'xxlarge' }}
          height="100%"
          flex={{ justifyContent: 'flex-start', alignItems: 'flex-start' }}
        >
          <Layout.Horizontal width="100%" flex={{ distribution: 'space-between', alignItems: 'baseline' }}>
            <Heading level={2} font={{ variation: FontVariation.H5 }}>
              {getEnvString('apiKeys.title')}
            </Heading>
            <AddKeyDialog
              environment={environment}
              onCreate={(newKey: ApiKey, hideCreate) => {
                setRecents([...recents, newKey])
                hideCreate()
                refetch()
              }}
            />
          </Layout.Horizontal>
          <Text color={Color.GREY_800} padding={{ top: 'small', bottom: 'xxlarge' }}>
            {getEnvString('apiKeys.message')}
          </Text>
          <Container className={css.content}>
            <Container className={css.table}>
              <RowContext.Provider
                value={{
                  environmentIdentifier: environment.identifier as string,
                  isNew: (id: string) => Boolean(recents.find(r => r.identifier === id)),
                  onDelete: handleDelete,
                  getSecret: (id: string, fallback: string) =>
                    recents.find(r => r.identifier === id)?.apiKey || fallback
                }}
              >
                <TableV2<ApiKey> data={(apiKeys || []) as ApiKey[]} columns={columns} />
              </RowContext.Provider>
            </Container>
            {!!pagination.itemCount && (
              <Container className={css.paginationContainer}>
                <Pagination
                  itemCount={pagination.itemCount}
                  pageCount={pagination.pageCount}
                  pageIndex={pagination.pageIndex}
                  pageSize={CF_DEFAULT_PAGE_SIZE}
                  gotoPage={(index: number) => {
                    setPage(index)
                    refetch({ queryParams: { ...queryParams, pageNumber: index } })
                  }}
                />
              </Container>
            )}
          </Container>
        </Layout.Vertical>
      )}

      {emptyData && (
        <Layout.Vertical width="100%" height="100%" flex={{ align: 'center-center' }} spacing="medium">
          <Text>{getEnvString('apiKeys.noKeysFound')}</Text>
          <AddKeyDialog
            primary
            environment={environment}
            onCreate={(newKey: ApiKey, hideCreate) => {
              setRecents([...recents, newKey])
              hideCreate()
              refetch()
            }}
          />
        </Layout.Vertical>
      )}

      {loading && (
        <Layout.Horizontal width="100%" height="100%" flex={{ align: 'center-center' }}>
          <ContainerSpinner />
        </Layout.Horizontal>
      )}

      {error && (
        <PageError
          message={getErrorMessage(error)}
          onClick={() => {
            setPage(0)
            refetch()
          }}
        />
      )}
    </Container>
  )
}

const CFEnvironmentDetailsBody: React.FC<{
  environment: EnvironmentResponseDTO
}> = ({ environment }) => {
  return (
    <Container className={css.envTabs}>
      <Tabs id="envDetailsTabs">
        <Tab id="settings" title="Settings" panel={<EnvironmentSDKKeys environment={environment} />} />
      </Tabs>
    </Container>
  )
}

export default CFEnvironmentDetailsBody
