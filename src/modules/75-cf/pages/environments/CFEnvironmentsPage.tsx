import React, { useMemo, useState, useEffect } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { Column } from 'react-table'
import { get } from 'lodash-es'
import { Menu, Position } from '@blueprintjs/core'
import { Button, Container, Layout, Pagination, Text } from '@wings-software/uicore'
import { EnvironmentResponseDTO, useDeleteEnvironment, useGetEnvironmentListForProject } from 'services/cd-ng'
import Table from '@common/components/Table/Table'
import { useToaster } from '@common/exports'
import { IdentifierText } from '@cf/components/IdentifierText/IdentifierText'
import { CF_DEFAULT_PAGE_SIZE } from '@cf/utils/CFUtils'
import { EnvironmentType } from '@common/constants/EnvironmentType'
import { useConfirmAction } from '@common/hooks/useConfirmAction'
import { useEnvStrings } from '@cf/hooks/environment'
import { ListingPageTemplate } from '@cf/components/ListingPageTemplate/ListingPageTemplate'
import EnvironmentDialog from '@cf/components/CreateEnvironmentDialog/EnvironmentDialog'
import routes from '@common/RouteDefinitions'
import { withTableData } from '../../utils/table-utils'
import css from './CFEnvironmentsPage.module.scss'

type EnvData = { environment: EnvironmentResponseDTO }
const withEnvironment = withTableData<EnvironmentResponseDTO, EnvData>(({ row }) => ({ environment: row.original }))
const withActions = withTableData<
  EnvironmentResponseDTO,
  EnvData & { actions: { [P in 'onEdit' | 'onDelete']?: (id: string) => void } }
>(({ row, column }) => ({
  environment: row.original,
  actions: (column as any).actions as { [P in 'onEdit' | 'onDelete']?: (id: string) => void }
}))

const TypeCell = withEnvironment(({ environment }) => {
  const { getString } = useEnvStrings()
  return <Text>{getString(environment.type === EnvironmentType.PRODUCTION ? 'production' : 'nonProduction')}</Text>
})

const NameCell = withEnvironment(({ environment }) => {
  const { getString } = useEnvStrings()
  const tags = Object.entries(environment.tags ?? {}).reduce((acc: any[], [key, value]: [string, string]) => {
    return [...acc, { name: key, value: value }]
  }, [])
  return (
    <Layout.Horizontal
      flex={{ distribution: 'space-between', align: 'center-center' }}
      padding={{ left: 'small', right: 'small' }}
      style={{ maxWidth: 'calc(100% - var(--spacing-medium))' }}
    >
      <Layout.Vertical spacing="xsmall" style={{ maxWidth: 'calc(100% - 100px)' }}>
        <Text style={{ color: '#22222A', fontWeight: 500 }}>{environment.name}</Text>

        {environment.description && (
          <Container>
            <Text style={{ color: '#6B6D85', fontSize: '12px', lineHeight: '18px' }}>{environment.description}</Text>
          </Container>
        )}

        <Container padding={{ top: 'xsmall' }} margin={{ bottom: 'xsmall' }}>
          <IdentifierText identifier={environment.identifier} inline style={{ padding: 'var(--spacing-xsmall)' }} />
        </Container>
      </Layout.Vertical>
      <Layout.Horizontal>
        <Text
          width={100}
          flex
          icon="main-tags"
          style={{ justifyContent: 'center' }}
          tooltip={
            tags.length ? (
              <>
                <Text>{getString('tagsLabel').toUpperCase()}</Text>
                {tags.map((elem, i) => (
                  <Text key={`${elem.value}-${i}`}>{elem.value}</Text>
                ))}
              </>
            ) : undefined
          }
          tooltipProps={{
            portalClassName: css.tagsPopover,
            position: Position.RIGHT
          }}
        >
          {tags.length}
        </Text>
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
})

const ModilfiedByCell = withActions(({ environment, actions }) => {
  const { getString } = useEnvStrings()
  const identifier = environment.identifier as string
  const deleteEnvironment = useConfirmAction({
    title: getString('cf.environments.delete.title'),
    message: (
      <span
        dangerouslySetInnerHTML={{ __html: getString('cf.environments.delete.message', { name: environment.name }) }}
      />
    ),
    action: () => {
      actions.onDelete?.(identifier)
    }
  })

  return (
    <Layout.Horizontal style={{ alignItems: 'center', justifyContent: 'flex-end' }}>
      {/* TODO: Add user info when BE is ready */}
      <Container
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
        }}
      >
        <Button
          minimal
          icon="Options"
          iconProps={{ size: 24 }}
          style={{ marginLeft: 'auto' }}
          tooltip={
            <Menu style={{ minWidth: 'unset' }}>
              <Menu.Item icon="edit" text={getString('edit')} onClick={() => actions.onEdit?.(identifier)} />
              <Menu.Item icon="cross" text={getString('delete')} onClick={deleteEnvironment} />
            </Menu>
          }
          tooltipProps={{ isDark: true, interactionKind: 'click', hasBackdrop: true }}
        />
      </Container>
    </Layout.Horizontal>
  )
})

type CustomColumn<T extends Record<string, any>> = Column<T>

const CFEnvironmentsPage: React.FC<{}> = () => {
  const { getEnvString, getString } = useEnvStrings()
  const { showError, showSuccess, clear } = useToaster()
  const history = useHistory()
  const [page, setPage] = useState(0)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<Record<string, string>>()
  const queryParams = useMemo(() => {
    return {
      accountId,
      orgIdentifier,
      projectIdentifier,
      size: CF_DEFAULT_PAGE_SIZE,
      page
    }
  }, [accountId, orgIdentifier, projectIdentifier, page])
  const { data: envData, loading, error, refetch } = useGetEnvironmentListForProject({
    queryParams
  })
  const { mutate: deleteEnvironment } = useDeleteEnvironment({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier
    }
  })
  const environments = envData?.data?.content
  const hasEnvs = Boolean(!loading && envData?.data?.content?.length)
  const emptyEnvs = Boolean(!loading && envData?.data?.content?.length === 0)

  const handleEdit = (id: string) => {
    history.push(
      routes.toCFEnvironmentDetails({
        environmentIdentifier: id,
        projectIdentifier,
        orgIdentifier,
        accountId
      })
    )
  }

  const handleDeleteEnv = async (id: string) => {
    try {
      await deleteEnvironment(id)
      showSuccess(`Successfully deleted environment ${id}`)
      refetch()
    } catch (e) {
      showError(get(e, 'data.message', e?.message), 0)
    }
  }

  useEffect(() => {
    return () => clear()
  }, [])

  const columns: CustomColumn<EnvironmentResponseDTO>[] = useMemo(
    () => [
      {
        Header: getString('environment').toUpperCase(),
        id: 'name',
        width: '75%',
        accessor: 'name',
        Cell: NameCell
      },
      {
        Header: getString('typeLabel').toUpperCase(),
        id: 'type',
        accessor: 'type',
        width: '15%',
        Cell: TypeCell
      },
      {
        id: 'modifiedBy',
        width: '10%',
        Cell: ModilfiedByCell,
        actions: {
          onEdit: handleEdit,
          onDelete: handleDeleteEnv
        }
      }
    ],
    [getString, getEnvString, handleDeleteEnv]
  )
  const title = getString('environments')

  return (
    <ListingPageTemplate
      pageTitle={title}
      header={title}
      toolbar={
        <Layout.Horizontal>
          <EnvironmentDialog disabled={loading} onCreate={() => refetch()} />
        </Layout.Horizontal>
      }
      content={
        <>
          {hasEnvs && (
            <Container padding={{ top: 'medium', right: 'xxlarge', left: 'xxlarge' }}>
              <Table<EnvironmentResponseDTO>
                columns={columns}
                data={(environments as EnvironmentResponseDTO[]) || []}
                onRowClick={({ identifier }) => handleEdit(identifier as string)}
              />
            </Container>
          )}
          {emptyEnvs && (
            <Layout.Vertical className={css.heightOverride}>
              <Text font="large" margin={{ bottom: 'huge' }} color="grey400">
                {getEnvString('empty')}
              </Text>
              <EnvironmentDialog onCreate={() => refetch()} />
            </Layout.Vertical>
          )}
        </>
      }
      pagination={
        <Pagination
          itemCount={envData?.data?.totalItems || 0}
          pageSize={envData?.data?.pageSize || 0}
          pageCount={envData?.data?.totalPages || 0}
          pageIndex={page}
          gotoPage={index => {
            setPage(index)
            refetch({ queryParams: { ...queryParams, page: index } })
          }}
        />
      }
      error={error}
      retryOnError={() => {
        refetch()
      }}
      loading={loading}
    />
  )
}

export default CFEnvironmentsPage
