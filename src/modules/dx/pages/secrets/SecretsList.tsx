import React, { useMemo } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import ReactTimeago from 'react-timeago'
import { Menu, Position } from '@blueprintjs/core'
import type { Column, Renderer, CellProps } from 'react-table'

import Table from 'modules/common/components/Table/Table'
import { PageSpinner } from 'modules/common/components/Page/PageSpinner'
import { useListSecretsForAccount } from 'services/cd-ng'
import type { EncryptedDataDTO } from 'services/cd-ng'
import useCreateSecretModal, { SecretType } from 'modules/dx/modals/CreateSecretModal/useCreateSecretModal'
import { Text, Color, Layout, Icon, Button, TextInput, SelectV2, Popover, Container } from '@wings-software/uikit'
import { routeSecretDetails } from '../../routes'
import { linkTo } from 'framework/exports'

import css from './SecretsList.module.scss'
import i18n from './SecretsList.i18n'
import { PageError } from 'modules/common/components/Page/PageError'

const getStringForType = (type?: string): string => {
  if (!type) return ''
  switch (type) {
    case 'SECRET_TEXT':
      return 'Text'
    case 'CONFIG_FILE':
      return 'File'
    default:
      return 'Other'
  }
}

const renderColumnSecret: Renderer<CellProps<EncryptedDataDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal>
      <Icon name="key" size={28} padding={{ top: 'xsmall', right: 'small' }} />
      <div>
        <Text color={Color.BLACK}>{data.name}</Text>
        <Text color={Color.GREY_400}>{data.uuid}</Text>
      </div>
    </Layout.Horizontal>
  )
}

const renderColumnDetails: Renderer<CellProps<EncryptedDataDTO>> = ({ row }) => {
  const data = row.original
  return (
    <>
      <Text color={Color.BLACK}>{data.encryptedBy}</Text>
      <Text color={Color.GREY_400}>{getStringForType(data.type)}</Text>
    </>
  )
}

const renderColumnActivity: Renderer<CellProps<EncryptedDataDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small">
      <Icon name="activity" />
      <ReactTimeago date={(data as any).lastUpdatedAt} />
    </Layout.Horizontal>
  )
}

const SecretsList: React.FC = () => {
  const { accountId } = useParams()
  const history = useHistory()
  const { openCreateSecretModal } = useCreateSecretModal()
  const { data: secretsResponse, loading, error, refetch } = useListSecretsForAccount({
    queryParams: { accountIdentifier: accountId, type: 'SECRET_TEXT' }
  })

  const columns: Column<EncryptedDataDTO>[] = useMemo(
    () => [
      {
        Header: i18n.table.secret,
        accessor: 'name',
        width: '33%',
        Cell: renderColumnSecret
      },
      {
        Header: i18n.table.secretManager,
        accessor: 'encryptedBy',
        width: '33%',
        Cell: renderColumnDetails
      },
      {
        Header: i18n.table.lastActivity,
        accessor: 'lastUpdatedAt',
        width: '33%',
        Cell: renderColumnActivity
      }
    ],
    []
  )

  // TODO: remove `any` once backend fixes the type
  const data: EncryptedDataDTO[] = useMemo(() => (secretsResponse?.data as any)?.response || [], [secretsResponse])

  if (loading) return <PageSpinner />
  if (error) return <PageError message={error.message} onClick={() => refetch()} />

  return (
    <div>
      <Layout.Horizontal flex className={css.header}>
        <Popover minimal position={Position.BOTTOM_LEFT}>
          <Button intent="primary" text={i18n.newSecret.button} icon="plus" rightIcon="chevron-down" />
          <Menu large>
            <Menu.Item
              text={i18n.newSecret.text}
              labelElement={<Icon name="font" />}
              onClick={() => openCreateSecretModal(SecretType.TEXT)}
            />
            <Menu.Item
              text={i18n.newSecret.file}
              labelElement={<Icon name="document" />}
              onClick={() => openCreateSecretModal(SecretType.FILE)}
            />
            <Menu.Divider />
            <Menu.Item text={i18n.newSecret.yaml} />
          </Menu>
        </Popover>
        <Layout.Horizontal spacing="small">
          <TextInput leftIcon="search" placeholder="Search" />
          <span>
            <SelectV2 items={[]} filterable={false} disabled>
              <Button text="Select Saved Filter" rightIcon="chevron-down" disabled />
            </SelectV2>
          </span>
        </Layout.Horizontal>
      </Layout.Horizontal>
      {data.length > 0 ? (
        <Table<EncryptedDataDTO>
          className={css.table}
          columns={columns}
          data={data}
          onRowClick={secret => {
            history.push(
              linkTo(routeSecretDetails, {
                secretId: secret.uuid
              })
            )
          }}
        />
      ) : (
        <Container width="100%" height="100%" flex={{ align: 'center-center' }} padding="xlarge">
          There are no secrets
        </Container>
      )}
    </div>
  )
}

export default SecretsList
