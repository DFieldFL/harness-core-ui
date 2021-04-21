import React, { useState } from 'react'
import type { CellProps } from 'react-table'
import { isEmpty as _isEmpty } from 'lodash-es'
import { Radio } from '@blueprintjs/core'
import { Text, Color, Container, ExpandingSearchInput, Layout, Button, Icon } from '@wings-software/uicore'
import type { GatewayDetails } from '@ce/components/COCreateGateway/models'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/strings'
import type { ASGMinimal, PortConfig, TargetGroupMinimal } from 'services/lw'
import { Utils } from '@ce/common/Utils'

interface COAsgSelectorprops {
  scalingGroups: ASGMinimal[]
  selectedScalingGroup: ASGMinimal | undefined
  setSelectedAsg: (asg: ASGMinimal) => void
  search: (t: string) => void
  setGatewayDetails: (gatewayDetails: GatewayDetails) => void
  gatewayDetails: GatewayDetails
  onAsgAddSuccess?: (updatedGatewayDetails: GatewayDetails) => void
  loading: boolean
}

function TableCell(tableProps: CellProps<ASGMinimal>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK}>
      {tableProps.value}
    </Text>
  )
}
function NameCell(tableProps: CellProps<ASGMinimal>): JSX.Element {
  return (
    <Text lineClamp={1} color={Color.BLACK}>
      {`${tableProps.value} ${tableProps.row.original.id}`}
    </Text>
  )
}

const TOTAL_ITEMS_PER_PAGE = 5

const COAsgSelector: React.FC<COAsgSelectorprops> = props => {
  const [selectedAsg, setSelectedAsg] = useState<ASGMinimal | undefined>(props.selectedScalingGroup)
  const [pageIndex, setPageIndex] = useState<number>(0)
  const isAsgSelected = !_isEmpty(selectedAsg)
  const { getString } = useStrings()
  function TableCheck(tableProps: CellProps<ASGMinimal>): JSX.Element {
    return (
      <Radio
        checked={selectedAsg?.name === tableProps.row.original.name}
        onClick={_ => setSelectedAsg(tableProps.row.original)}
      />
    )
  }

  const addAsg = () => {
    const newAsg = { ...selectedAsg }
    props.setSelectedAsg(newAsg)
    const updatedGatewayDetails = { ...props.gatewayDetails }
    const updatedRouting = { ...props.gatewayDetails.routing }
    updatedRouting.instance.scale_group = newAsg // eslint-disable-line
    updatedRouting.ports = (newAsg as ASGMinimal).target_groups?.map((tg: TargetGroupMinimal) =>
      Utils.getTargetGroupObject(tg.port as number, tg.protocol as string)
    ) as PortConfig[]
    updatedGatewayDetails.routing = { ...updatedRouting }
    props.setGatewayDetails(updatedGatewayDetails)
    props.onAsgAddSuccess?.(updatedGatewayDetails)
  }

  return (
    <Container>
      <Layout.Vertical spacing="large">
        <Container style={{ paddingBottom: 20, borderBottom: '1px solid #CDD3DD' }}>
          <Text font={'large'}>Select Auto scaling group</Text>
          <Text color={Color.BLUE_700} style={{ marginTop: 10 }}>
            <Icon name="info-sign" size={16} color={Color.BLUE_700} style={{ marginRight: 7 }}></Icon>
            <span>{getString('ce.co.autoStoppingRule.configuration.asgSelectionInfoText')}</span>
          </Text>
        </Container>
        <Layout.Horizontal
          style={{
            paddingBottom: 20,
            paddingTop: 20,
            borderBottom: '1px solid #CDD3DD',
            justifyContent: 'space-between'
          }}
        >
          <Button
            onClick={addAsg}
            disabled={!isAsgSelected}
            style={{
              backgroundColor: isAsgSelected ? '#0278D5' : 'inherit',
              color: isAsgSelected ? '#F3F3FA' : 'inherit'
            }}
          >
            {'Add selected'}
          </Button>
          <ExpandingSearchInput onChange={(text: string) => props.search(text)} />
        </Layout.Horizontal>
        <Container>
          {props.loading && (
            <Layout.Horizontal flex={{ justifyContent: 'center' }}>
              <Icon name="spinner" size={24} color="blue500" />
            </Layout.Horizontal>
          )}
          {!props.loading && (
            <Table<ASGMinimal>
              data={(props.scalingGroups || []).slice(
                pageIndex * TOTAL_ITEMS_PER_PAGE,
                pageIndex * TOTAL_ITEMS_PER_PAGE + TOTAL_ITEMS_PER_PAGE
              )}
              pagination={{
                pageSize: TOTAL_ITEMS_PER_PAGE,
                pageIndex: pageIndex,
                pageCount: Math.ceil((props.scalingGroups || []).length / TOTAL_ITEMS_PER_PAGE),
                itemCount: (props.scalingGroups || []).length,
                gotoPage: newPageIndex => setPageIndex(newPageIndex)
              }}
              columns={[
                {
                  Header: '',
                  id: 'selected',
                  Cell: TableCheck,
                  width: '5%',
                  disableSortBy: true
                },
                {
                  accessor: 'name',
                  Header: getString('ce.co.instanceSelector.name'),
                  width: '70%',
                  Cell: NameCell,
                  disableSortBy: true
                },
                {
                  accessor: 'desired',
                  Header: 'Instances',
                  width: '10%',
                  Cell: TableCell,
                  disableSortBy: true
                },
                {
                  accessor: 'region',
                  Header: getString('regionLabel'),
                  width: '10%',
                  Cell: TableCell,
                  disableSortBy: true
                }
              ]}
            />
          )}
        </Container>
      </Layout.Vertical>
    </Container>
  )
}

export default COAsgSelector
