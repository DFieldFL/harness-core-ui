import React, { useEffect, useState } from 'react'
import type { CellProps } from 'react-table'
import {
  Text,
  Color,
  Layout,
  Container,
  Button,
  ExpandingSearchInput,
  // useModalHook,
  Icon
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { IconName } from '@blueprintjs/icons'
// import { Dialog, IconName, IDialogProps } from '@blueprintjs/core'
import routes from '@common/RouteDefinitions'
import { AccessPoint, useAccessPointActivity, useAccessPointRules, useAllAccessPoints } from 'services/lw'
import { Page } from '@common/components/Page/Page'
import Table from '@common/components/Table/Table'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { useToaster } from '@common/exports'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { PROVIDER_TYPES } from '@ce/constants'
import { useStrings } from 'framework/strings'
// import CreateAccessPointWizard from '../COGatewayAccess/CreateAccessPointWizard'
import DeleteAccessPoint from '../COAccessPointDelete/DeleteAccessPoint'
import { getRelativeTime } from '../COGatewayList/Utils'
// import LoadBalancerDnsConfig from '../COGatewayAccess/LoadBalancerDnsConfig'
import useCreateAccessPointDialog from './COCreateAccessPointDialog'
import TextWithToolTip, { textWithToolTipStatus } from '../TextWithTooltip/TextWithToolTip'
import css from './COAcessPointList.module.scss'

function NameCell(tableProps: CellProps<AccessPoint>): JSX.Element {
  return (
    <Text lineClamp={3} color={Color.BLACK} style={{ fontWeight: 600 }}>
      {tableProps.value}
    </Text>
  )
}

function DNSCell(tableProps: CellProps<AccessPoint>): JSX.Element {
  return <Text lineClamp={3}>{tableProps.row.original.metadata?.dns?.route53 ? 'Route 53' : 'Others'}</Text>
}
function CloudAccountCell(tableProps: CellProps<AccessPoint>): JSX.Element {
  return (
    <Layout.Horizontal spacing="medium">
      <Icon name={`service-${tableProps.row.original.type || 'aws'}` as IconName} size={24} />
      <Text lineClamp={3} color={Color.GREY_500}>
        {tableProps.value}
      </Text>
    </Layout.Horizontal>
  )
}

const COLoadBalancerList: React.FC = () => {
  const { showError } = useToaster()
  const { getString } = useStrings()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<{
    accountId: string
    orgIdentifier: string
    projectIdentifier: string
  }>()
  const [allAccessPoints, setAllAccessPoints] = useState<AccessPoint[]>([])
  const setAccessPoint = (newAccessPoint: AccessPoint) => {
    const newAccessPoints = [...allAccessPoints, newAccessPoint]
    setAllAccessPoints(newAccessPoints)
  }

  const { openCreateAccessPointModal } = useCreateAccessPointDialog({
    onAccessPointSave: savedLb => {
      // if (isCreateMode) {
      //   setAccessPointsList([{ label: savedLb.name as string, value: savedLb.id as string }, ...accessPointsList])
      // }
      setAccessPoint(savedLb)
    }
  })

  const [selectedAccessPoints, setSelectedAccessPoints] = useState<AccessPoint[]>([])
  function CheckBoxCell(tableProps: CellProps<AccessPoint>): JSX.Element {
    return (
      <input
        type="checkbox"
        checked={isSelectedAccessPoint(tableProps.row.original)}
        onChange={e => {
          if (e.currentTarget.checked) {
            selectedAccessPoints.push(tableProps.row.original)
          } else if (!e.currentTarget.checked && isSelectedAccessPoint(tableProps.row.original)) {
            selectedAccessPoints.splice(selectedAccessPoints.indexOf(tableProps.row.original), 1)
          }
          const newAccessPoints = [...selectedAccessPoints]
          setSelectedAccessPoints(newAccessPoints)
        }}
      />
    )
  }
  function isSelectedAccessPoint(item: AccessPoint): boolean {
    return selectedAccessPoints.findIndex(s => s.id == item.id) >= 0 ? true : false
  }

  function ActivityCell(tableProps: CellProps<AccessPoint>): JSX.Element {
    const { data: details, error: detailsError } = useAccessPointActivity({
      org_id: orgIdentifier, // eslint-disable-line
      project_id: projectIdentifier, // eslint-disable-line
      access_point_id: tableProps.row.original.id as string, // eslint-disable-line
      account_id: accountId, // eslint-disable-line
      queryParams: {
        accountIdentifier: accountId
      }
    })
    if (detailsError) {
      showError(detailsError.data || detailsError.message, undefined, 'ce.ap.activity.error')
    }
    return (
      <>
        {(details?.response?.created_at as string) ? (
          <Layout.Horizontal spacing="medium">
            <Icon name="history" />
            <Text lineClamp={3} color={Color.GREY_500}>
              {getRelativeTime(details?.response?.created_at as string, 'YYYY-MM-DDTHH:mm:ssZ')}
            </Text>
          </Layout.Horizontal>
        ) : !loading ? (
          '-'
        ) : (
          <Icon name="spinner" size={12} color="blue500" />
        )}
      </>
    )
  }
  function RulesCell(tableProps: CellProps<AccessPoint>): JSX.Element {
    const { data: details, error: detailsError, loading: detailsLoading } = useAccessPointRules({
      org_id: orgIdentifier, // eslint-disable-line
      project_id: projectIdentifier, // eslint-disable-line
      access_point_id: tableProps.row.original.id as string, // eslint-disable-line
      account_id: accountId, // eslint-disable-line
      queryParams: {
        accountIdentifier: accountId
      }
    })
    if (detailsError) {
      showError(detailsError.message, undefined, 'ce.ap.rules.error')
    }
    return (
      <>
        {details?.response?.length ? (
          <Layout.Horizontal spacing="medium">
            <Text lineClamp={3} color={Color.GREY_500}>
              {details?.response?.length} Rules
            </Text>
          </Layout.Horizontal>
        ) : !detailsLoading ? (
          '0 Rules'
        ) : (
          <Icon name="spinner" size={12} color="blue500" />
        )}
      </>
    )
  }

  // function RenderColumnMenu(tableProps: CellProps<AccessPoint>): JSX.Element {
  //   const row = tableProps.row
  //   const data = row.original.id
  //   const [menuOpen, setMenuOpen] = useState(false)
  //   const [openModal, hideModal] = useModalHook(() => (
  //     <Dialog onClose={hideModal} {...modalPropsLight}>
  //       <CreateAccessPointWizard
  //         accessPoint={row.original}
  //         closeModal={hideModal}
  //         refreshAccessPoints={() => undefined}
  //         isEditMod={true}
  //       />
  //     </Dialog>
  //   ))
  //   return (
  //     <Layout.Horizontal className={css.layout}>
  //       <Popover
  //         isOpen={menuOpen}
  //         onInteraction={nextOpenState => {
  //           setMenuOpen(nextOpenState)
  //         }}
  //         className={Classes.DARK}
  //         position={Position.BOTTOM_RIGHT}
  //       >
  //         <Button
  //           minimal
  //           icon="Options"
  //           onClick={e => {
  //             e.stopPropagation()
  //             setMenuOpen(true)
  //           }}
  //           data-testid={`menu-${data}`}
  //         />
  //         <Menu style={{ minWidth: 'unset' }}>
  //           <Menu.Item icon="edit" text="Edit" onClick={() => openModal()} />
  //           <Menu.Item
  //             icon="trash"
  //             text="Delete"
  //             onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => {
  //               e.stopPropagation()
  //               alert('you are deleting')
  //             }}
  //           />
  //         </Menu>
  //       </Popover>
  //     </Layout.Horizontal>
  //   )
  // }

  const StatusCell = ({ row }: CellProps<AccessPoint>) => {
    return (
      <TextWithToolTip
        messageText={row.original.status}
        errors={row.original.type === PROVIDER_TYPES.AZURE ? [{ error: row.original.metadata?.error }] : []}
        status={row.original.status === 'errored' ? textWithToolTipStatus.ERROR : textWithToolTipStatus.SUCCESS}
      />
    )
  }

  const { data, error, loading, refetch } = useAllAccessPoints({
    org_id: orgIdentifier, // eslint-disable-line
    project_id: projectIdentifier, // eslint-disable-line
    account_id: accountId, // eslint-disable-line
    queryParams: {
      accountIdentifier: accountId
    },
    debounce: 300
  })
  if (error) {
    showError(error.data || error.message, undefined, 'ce.all.ap.rules.error')
  }
  useEffect(() => {
    if (loading) {
      return
    }
    setAllAccessPoints(data?.response as AccessPoint[])
  }, [data?.response, loading])

  const refreshList = () => {
    refetch()
    setSelectedAccessPoints([])
  }
  return (
    <Container background={Color.WHITE} height="100vh">
      <Breadcrumbs
        className={css.breadCrumb}
        links={[
          {
            url: routes.toCECOAccessPoints({ orgIdentifier, projectIdentifier, accountId }),
            label: getString('ce.co.accessPoint.loadbalancers')
          }
        ]}
      />
      <>
        {!loading ? (
          <>
            <Page.Header title={getString('ce.co.accessPoint.landingPageTitle')} className={css.header} />
            <>
              <Layout.Horizontal padding="large">
                <Layout.Horizontal width="55%" spacing="medium">
                  <Button
                    intent="primary"
                    text={getString('ce.co.accessPoint.new')}
                    icon="plus"
                    onClick={() => openCreateAccessPointModal()}
                  />
                  <DeleteAccessPoint
                    accessPoints={selectedAccessPoints}
                    orgID={orgIdentifier}
                    projectID={projectIdentifier}
                    accountId={accountId}
                    refresh={refreshList}
                  />
                </Layout.Horizontal>
                <Layout.Horizontal spacing="small" width="45%" className={css.headerLayout}>
                  <Layout.Horizontal flex>
                    <ExpandingSearchInput
                      placeholder={getString('search')}
                      // onChange={text => {
                      //   // console.log(text)
                      //   // setSearchParam(text.trim())
                      // }}
                      className={css.search}
                    />
                  </Layout.Horizontal>
                </Layout.Horizontal>
              </Layout.Horizontal>
            </>
            {allAccessPoints?.length > 0 && (
              <Page.Body className={css.pageContainer}>
                <Table<AccessPoint>
                  data={allAccessPoints || []}
                  className={css.table}
                  columns={[
                    {
                      //eslint-disable-next-line
                      Header: () => {
                        return (
                          <input
                            type="checkbox"
                            checked={data?.response?.length == selectedAccessPoints.length}
                            onChange={e => {
                              if (e.currentTarget.checked) {
                                setSelectedAccessPoints([...allAccessPoints])
                              } else if (!e.currentTarget.checked) {
                                setSelectedAccessPoints([])
                              }
                            }}
                          />
                        )
                      },
                      id: 'check',
                      width: '5%',
                      Cell: CheckBoxCell
                    },
                    {
                      accessor: 'host_name',
                      Header: getString('name').toUpperCase(),
                      width: '20%',
                      Cell: NameCell
                    },
                    {
                      accessor: 'cloud_account_id',
                      Header: getString('ce.co.accessPoint.cloudAccount').toUpperCase(),
                      width: '20%',
                      Cell: CloudAccountCell
                    },
                    {
                      accessor: 'id',
                      Header: getString('ce.co.accessPoint.dnsProvider').toUpperCase(),
                      width: '10%',
                      Cell: DNSCell,
                      disableSortBy: true
                    },
                    {
                      accessor: 'name',
                      Header: getString('ce.co.accessPoint.asssociatedRules').toUpperCase(),
                      width: '15%',
                      Cell: RulesCell
                    },
                    {
                      accessor: 'status',
                      Header: getString('ce.co.accessPoint.lastActivity').toUpperCase(),
                      width: '15%',
                      Cell: ActivityCell
                    },
                    {
                      accessor: row => row.status,
                      Header: getString('ce.co.accessPoint.status').toUpperCase(),
                      Cell: StatusCell,
                      width: '15%'
                    }
                    // {
                    //   id: 'menu',
                    //   accessor: row => row.id,
                    //   width: '5%',
                    //   Cell: RenderColumnMenu,
                    //   disableSortBy: true
                    // }
                  ]}
                />
              </Page.Body>
            )}
          </>
        ) : (
          <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
            <PageSpinner />
          </div>
        )}
      </>
    </Container>
  )
}

export default COLoadBalancerList
