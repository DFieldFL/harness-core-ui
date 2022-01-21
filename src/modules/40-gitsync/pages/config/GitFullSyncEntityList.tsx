import React from 'react'
import type { CellProps, Column, Renderer } from 'react-table'
import { Color, Icon, Layout, TableV2, Text } from '@harness/uicore'
import type { IconProps } from '@harness/uicore/dist/icons/Icon'
import { useStrings } from 'framework/strings'
import type { PageGitFullSyncEntityInfoDTO, GitFullSyncEntityInfoDTO } from 'services/cd-ng'
import { getEntityIconName } from '../entities/EntityHelper'

interface GitFullSyncEntityListProps {
  data: PageGitFullSyncEntityInfoDTO
  gotoPage: (pageNumber: number) => void
}

const RenderEntityStatus = (prop: Record<'status', GitFullSyncEntityInfoDTO['syncStatus']>): JSX.Element => {
  const status = prop.status

  const icontProp: IconProps =
    status === 'FAILED'
      ? { name: 'warning-sign', color: Color.RED_900 }
      : status === 'SUCCESS'
      ? { name: 'success-tick' }
      : { name: 'queued' }
  const statusBackground = status === 'FAILED' ? Color.RED_100 : status === 'SUCCESS' ? Color.GREEN_100 : Color.GREY_100
  const highlightedColor = status === 'FAILED' ? Color.RED_900 : status === 'SUCCESS' ? Color.GREEN_700 : Color.GREY_900

  return (
    <Layout.Horizontal
      spacing="small"
      background={statusBackground}
      style={{ width: 'fit-content', borderRadius: '5px' }}
      padding={{ top: 'small', right: 'small', bottom: 'small', left: 'small' }}
    >
      <Icon {...icontProp}></Icon>
      <Text font={{ size: 'normal' }} color={highlightedColor}>
        {status}
      </Text>
    </Layout.Horizontal>
  )
}

const RenderEntityDetails: Renderer<CellProps<GitFullSyncEntityInfoDTO>> = ({ row }) => {
  const data = row.original
  const { getString } = useStrings()
  return (
    <Layout.Horizontal>
      <Icon
        name={getEntityIconName(data.entityType)}
        size={20}
        flex={{ alignItems: 'center' }}
        margin={{ right: 'medium' }}
      ></Icon>
      <Layout.Vertical spacing="small">
        <Text color={Color.GREY_900} font={{ weight: 'semi-bold' }}>
          {data.name}
        </Text>
        <Text> {`${getString('common.ID')}: ${data.name}`} </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const RenderColumnEntityStatus: Renderer<CellProps<GitFullSyncEntityInfoDTO>> = ({ row }) => {
  const data = row.original

  return data?.syncStatus ? <RenderEntityStatus status={data.syncStatus} /> : <></>
}

const RenderColumnEntityType: Renderer<CellProps<GitFullSyncEntityInfoDTO>> = ({ row }) => {
  const data = row.original

  return <Text> {data.entityType} </Text>
}

const RenderColumnRepo: Renderer<CellProps<GitFullSyncEntityInfoDTO>> = ({ row }) => {
  const data = row.original

  return <Text> {data.repoName} </Text>
}

const RenderColumnBranch: Renderer<CellProps<GitFullSyncEntityInfoDTO>> = ({ row }) => {
  const data = row.original

  return <Text> {data.branch} </Text>
}

const GitFullSyncEntityList: React.FC<GitFullSyncEntityListProps> = props => {
  const { data, gotoPage } = props

  const listData: GitFullSyncEntityInfoDTO[] = data?.content || []
  const columns: Column<GitFullSyncEntityInfoDTO>[] = [
    {
      Header: 'Entity Name',
      accessor: row => row.name,
      id: 'name',
      width: '30%',
      Cell: RenderEntityDetails
    },
    {
      Header: 'Status',
      accessor: row => row.syncStatus,
      width: '15%',
      Cell: RenderColumnEntityStatus
    },
    {
      Header: 'Type',
      accessor: row => row.entityType,
      id: 'type',
      width: '15%',
      Cell: RenderColumnEntityType
    },
    {
      Header: 'Repository',
      accessor: row => row.repoName,
      id: 'repository',
      width: '15%',
      Cell: RenderColumnRepo
    },
    {
      Header: 'Branch',
      accessor: row => row.branch,
      id: 'branch',
      width: '15%',
      Cell: RenderColumnBranch
    }
  ]

  return (
    <TableV2<GitFullSyncEntityInfoDTO>
      columns={columns}
      data={listData}
      name="GitFullSyncEntityList"
      sortable={true}
      pagination={{
        itemCount: data?.totalItems || 0,
        pageSize: data?.pageSize || 10,
        pageCount: data?.totalPages || -1,
        pageIndex: data?.pageIndex || 0,
        gotoPage
      }}
    />
  )
}

export default GitFullSyncEntityList
