import React, { useState } from 'react'
import { Menu, Spinner } from '@blueprintjs/core'
import { Card, Container, Icon, Layout, Popover, Text } from '@wings-software/uikit'
import type { Column } from 'react-table'
import { Page } from '@common/exports'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/exports'
import type { Feature, Segment } from 'services/cf'
import CreateTargetSegmentModal from './CreateTargetSegmentModal'
import css from './CFTargetsPage.module.scss'

const UsedByCell: React.FC<any> = ({ value }: any) => {
  const [open, setOpen] = useState(false)
  const { getString } = useStrings()
  return (
    <Layout.Horizontal flex={{ distribution: 'space-between', align: 'center-center' }}>
      <Text>{value.length} flags</Text>
      <Popover isOpen={open} onInteraction={setOpen}>
        <Icon size={24} name="Options" />
        <Menu>
          <Menu.Item icon="edit" text={getString('edit')} />
          <Menu.Item icon="cross" text={getString('delete')} />
        </Menu>
      </Popover>
    </Layout.Horizontal>
  )
}

interface TargetSegmentsProps {
  loading: boolean
  segments: Segment[]
  flags: Feature[]
  pagination?: {
    itemCount: number
    pageCount: number
    pageIndex: number
    pageSize: number
    gotoPage: (pageNumber: number) => void
  }
  project: string
  environment: string
  onCreateSegment: () => void
}

const TargetSegmentsView: React.FC<TargetSegmentsProps> = ({
  loading,
  segments,
  flags,
  pagination,
  project,
  environment,
  onCreateSegment
}) => {
  const { getString } = useStrings()

  type CustomColumn<T extends Record<string, any>> = Column<T>
  const columnDefs: CustomColumn<Segment>[] = [
    {
      Header: getString('cf.segments.create').toLocaleUpperCase(),
      accessor: 'name',
      width: '30%'
    },
    {
      Header: getString('cf.segments.targetDefinition').toLocaleUpperCase(),
      accessor: () => 'Not yet implemented',
      width: '30%'
    },
    {
      Header: getString('cf.segments.usingSegment').toLocaleUpperCase(),
      accessor: (row: Segment) =>
        flags?.filter(f =>
          f.envProperties?.variationMap?.find(vm => vm.targetSegments?.find(ts => ts === row.identifier))
        ) || [],
      Cell: UsedByCell,
      width: '40%'
    }
  ]

  if (loading) {
    return (
      <Container flex style={{ justifyContent: 'center', height: '100%' }}>
        <Spinner size={50} />
      </Container>
    )
  }

  return (
    <Page.Body>
      <Card style={{ width: '100%' }}>
        <CreateTargetSegmentModal project={project} environment={environment} onCreate={onCreateSegment} />
      </Card>
      <Container flex padding="medium">
        <Table<Segment> className={css.table} columns={columnDefs} data={segments} pagination={pagination} />
      </Container>
    </Page.Body>
  )
}

export default TargetSegmentsView
