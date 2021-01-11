import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Color, Container, Link, Text } from '@wings-software/uicore'
import type { CellProps } from 'react-table'
import { Classes } from '@blueprintjs/core'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { StackdriverDashboardDTO, useGetStackdriverDashboards } from 'services/cv'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import { Table } from '@common/components'
import { TableColumnWithFilter } from '@cv/components/TableColumnWithFilter/TableColumnWithFilter'
import { useStrings } from 'framework/exports'
import { PageError } from '@common/components/Page/PageError'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { ManualInputQueryModal } from '../ManualInputQueryModal/ManualInputQueryModal'
import { buildGCOMetricInfo, GCOMonitoringSourceInfo } from '../GoogleCloudOperationsMonitoringSourceUtils'
import { getManuallyCreatedQueries } from '../GoogleCloudOperationsMonitoringSourceUtils'
import css from './SelectGCODashboards.module.scss'

export interface SelectDashboardProps {
  data: GCOMonitoringSourceInfo
  onNext: (data: GCOMonitoringSourceInfo) => void
  onPrevious: () => void
}

type TableData = {
  selected: boolean
  dashboard: StackdriverDashboardDTO
}

const TOTAL_ITEMS_PER_PAGE = 10

function initializeTableData(
  selectedDashboards: Map<string, StackdriverDashboardDTO>,
  dashboards?: StackdriverDashboardDTO[]
): TableData[] {
  if (!dashboards) return []

  const tableData: TableData[] = []
  for (const dashboard of dashboards) {
    if (!dashboard || !dashboard.path || !dashboard.name) continue
    tableData.push({
      selected: selectedDashboards.has(dashboard.name),
      dashboard: dashboard
    })
  }

  return tableData
}

function initializeSelectedDashboards(dashboards?: StackdriverDashboardDTO[]): Map<string, StackdriverDashboardDTO> {
  if (!dashboards?.length) {
    return new Map()
  }

  const selectedDashboards = new Map<string, StackdriverDashboardDTO>()
  for (const dashboard of dashboards) {
    if (dashboard?.name && dashboard.path) {
      selectedDashboards.set(dashboard.name, dashboard)
    }
  }

  return selectedDashboards
}

export function SelectGCODashboards(props: SelectDashboardProps): JSX.Element {
  const { onNext, onPrevious, data: propsData } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [{ pageOffset, filteredDashboard }, setFilterAndPageOffset] = useState<{
    pageOffset: number
    filteredDashboard?: string
  }>({
    pageOffset: 0,
    filteredDashboard: undefined
  })
  const { data, loading, error, refetch: refetchDashboards } = useGetStackdriverDashboards({
    queryParams: {
      accountId,
      projectIdentifier,
      orgIdentifier,
      connectorIdentifier: (propsData?.connectorRef?.value as string) || '',
      pageSize: TOTAL_ITEMS_PER_PAGE,
      offset: pageOffset,
      filter: filteredDashboard
    }
  })
  const [selectedDashboards, setSelectedDashboards] = useState<Map<string, StackdriverDashboardDTO>>(
    initializeSelectedDashboards(propsData.selectedDashboards)
  )
  const [tableData, setTableData] = useState<TableData[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    if (loading) {
      const loadingItems = Array<TableData>(TOTAL_ITEMS_PER_PAGE).fill(
        { selected: false, dashboard: { name: getString('loading') } },
        0,
        TOTAL_ITEMS_PER_PAGE
      )
      setTableData(loadingItems)
    } else {
      setTableData(initializeTableData(selectedDashboards, data?.resource?.content))
    }
  }, [data, loading])

  if (error?.message) {
    return <PageError className={css.loadingErrorNoData} message={error.message} onClick={() => refetchDashboards()} />
  }

  const { content, pageIndex = -1, totalItems = 0, totalPages = 0, pageSize = 0 } = data?.resource || {}

  if (!content?.length && !loading) {
    return (
      <Container>
        <NoDataCard
          icon="warning-sign"
          className={css.loadingErrorNoData}
          message={getString('cv.monitoringSources.gco.selectDashboardsPage.noDataText')}
          buttonText={getString('cv.monitoringSources.gco.addManualInputQuery')}
          onClick={() => setIsModalOpen(true)}
        />
        {isModalOpen && (
          <ManualInputQueryModal
            manuallyInputQueries={getManuallyCreatedQueries(propsData.selectedMetrics)}
            onSubmit={values => {
              if (!propsData.selectedMetrics) {
                propsData.selectedMetrics = new Map()
              }
              propsData.selectedMetrics.set(
                values.metricName,
                buildGCOMetricInfo({ isManualQuery: true, metricName: values.metricName })
              )
              onNext({ ...propsData, selectedDashboards: Array.from(selectedDashboards.values()) })
            }}
            closeModal={() => setIsModalOpen(false)}
          />
        )}
      </Container>
    )
  }

  return (
    <Container className={css.main}>
      <Table<TableData>
        data={tableData}
        onRowClick={(rowData, index) => {
          const newTableData = [...tableData]
          newTableData[index].selected = !rowData.selected
          setTableData(newTableData)
          if (newTableData[index].selected) {
            selectedDashboards.set(rowData.dashboard.name || '', rowData.dashboard)
          } else {
            selectedDashboards.delete(rowData.dashboard.name || '')
          }
          setSelectedDashboards(new Map(selectedDashboards))
        }}
        pagination={{
          pageSize: pageSize || 0,
          pageIndex: pageIndex,
          pageCount: totalPages,
          itemCount: totalItems,
          gotoPage: newPageIndex => setFilterAndPageOffset({ pageOffset: newPageIndex, filteredDashboard })
        }}
        columns={[
          {
            Header: '',
            accessor: 'selected',
            width: '10%',
            disableSortBy: true,
            Cell: function CheckColumn(tableProps: CellProps<TableData>) {
              const { original, index } = tableProps.row
              return loading ? (
                <Container height={16} width={16} className={Classes.SKELETON} />
              ) : (
                <input
                  type="checkbox"
                  checked={tableProps.value}
                  onChange={() => {
                    const newTableData = [...tableData]
                    newTableData[index].selected = !tableProps.value
                    setTableData(newTableData)
                    if (newTableData[index].selected) {
                      selectedDashboards.set(original.dashboard.name || '', original.dashboard)
                    } else {
                      selectedDashboards.delete(original.dashboard.name || '')
                    }
                    setSelectedDashboards(new Map(selectedDashboards))
                  }}
                />
              )
            }
          },
          {
            Header: (
              <Container className={css.columnContainer}>
                <Link withoutHref onClick={() => setIsModalOpen(true)} className={css.manualQueryLink}>
                  {getString('cv.monitoringSources.gco.addManualInputQuery')}
                </Link>
                <TableColumnWithFilter
                  columnName={getString('cv.monitoringSources.gco.selectDashboardsPage.dashboardColumnName')}
                  appliedFilter={filteredDashboard}
                  className={css.filterStyle}
                  onFilter={(filterValue: string) =>
                    setFilterAndPageOffset({ pageOffset: 0, filteredDashboard: filterValue })
                  }
                />
              </Container>
            ),
            accessor: 'dashboard',
            width: '90%',
            disableSortBy: true,
            Cell: function DashboardName(cellProps: CellProps<TableData>) {
              return loading ? (
                <Container height={16} width="100%" className={Classes.SKELETON} />
              ) : (
                <Text icon="service-stackdriver" color={Color.BLACK}>
                  {cellProps.value.name}
                </Text>
              )
            }
          }
        ]}
      />
      {isModalOpen && (
        <ManualInputQueryModal
          manuallyInputQueries={getManuallyCreatedQueries(propsData.selectedMetrics)}
          onSubmit={values => {
            if (!propsData.selectedMetrics) {
              propsData.selectedMetrics = new Map()
            }
            propsData.selectedMetrics.set(
              values.metricName,
              buildGCOMetricInfo({ isManualQuery: true, metricName: values.metricName })
            )
            onNext({ ...propsData, selectedDashboards: Array.from(selectedDashboards.values()) })
          }}
          closeModal={() => setIsModalOpen(false)}
        />
      )}
      <SubmitAndPreviousButtons
        onNextClick={() => onNext({ ...propsData, selectedDashboards: Array.from(selectedDashboards.values()) })}
        onPreviousClick={onPrevious}
      />
    </Container>
  )
}
