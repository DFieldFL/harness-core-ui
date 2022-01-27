/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo, useContext, useEffect, useState } from 'react'
import type { CellProps } from 'react-table'
import { Classes } from '@blueprintjs/core'
import { Color, Container, NoDataCard, PageError, Text, Utils } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import { SetupSourceTabsContext } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import type {
  MetricsDashboardListProps,
  TableDashboardItem,
  TableData
} from '@cv/components/MetricsDashboardList/MetricsDashboardList.type'
import { SetupSourceLayout } from '@cv/components/CVSetupSourcesView/SetupSourceLayout/SetupSourceLayout'
import { TableFilter } from '@cv/components/TableFilter/TableFilter'
import { Table } from '@common/components'
import {
  initializeSelectedDashboards,
  initializeTableData
} from '@cv/components/MetricsDashboardList/MetricsDashboardList.utils'
import { ManualInputQueryModal } from '@cv/pages/health-source/connectors/GCOMetricsHealthSource/components/ManualInputQueryModal/ManualInputQueryModal'
import { getManuallyCreatedQueries } from '@cv/pages/health-source/connectors/GCOMetricsHealthSource/GCOMetricsHealthSource.utils'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import css from './MetricsDashboardList.module.scss'

const TOTAL_ITEMS_PER_PAGE = 7

export default function MetricsDashboardList<T>(props: MetricsDashboardListProps<T>): JSX.Element {
  const { getString } = useStrings()
  const { tableItemMapper, defaultItemIcon, dashboardsRequest, manualQueryInputTitle } = props
  const [{ filter, pageOffset }, setFilterAndPageOffset] = useState<{
    pageOffset: number
    filter?: string
  }>({
    pageOffset: 0,
    filter: undefined
  })
  const { sourceData } = useContext(SetupSourceTabsContext)
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { onNext, onPrevious, sourceData: propsData } = useContext(SetupSourceTabsContext)
  const [tableData, setTableData] = useState<TableData[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDashboards, setSelectedDashboards] = useState(
    initializeSelectedDashboards(props.selectedDashboardList, tableItemMapper)
  )

  const { error, loading, data: dashboardList, refetch: refetchData } = dashboardsRequest

  const dashboardItems: TableDashboardItem[] = useMemo(() => {
    if (!dashboardList?.data?.content) {
      return []
    }
    return (
      dashboardList?.data?.content?.map((dashboard: T) => {
        return tableItemMapper(dashboard)
      }) || []
    )
  }, [dashboardList?.data?.content, tableItemMapper])

  const queryParams = useMemo(() => {
    return {
      accountId,
      projectIdentifier,
      orgIdentifier,
      connectorIdentifier: (sourceData?.connectorRef as string) || '',
      pageSize: TOTAL_ITEMS_PER_PAGE,
      offset: pageOffset,
      tracingId: Utils.randomId(),
      filter: filter
    }
  }, [filter, pageOffset, accountId, projectIdentifier, orgIdentifier, sourceData?.connectorRef])

  useEffect(() => {
    refetchData({
      queryParams: queryParams
    })
  }, [filter, refetchData, queryParams])

  useEffect(() => {
    if (loading) {
      const loadingItems = Array<TableData>(TOTAL_ITEMS_PER_PAGE).fill(
        { selected: false, dashboard: { name: getString('loading') } },
        0,
        TOTAL_ITEMS_PER_PAGE
      )
      setTableData(loadingItems)
    } else {
      setTableData(initializeTableData(selectedDashboards, dashboardItems))
    }
  }, [selectedDashboards, dashboardItems, loading])

  const { pageIndex = -1, pageItemCount = 0, totalPages = 0, pageSize = 0 } = dashboardList?.data || {}
  return (
    <SetupSourceLayout
      content={
        <Container className={css.main}>
          <TableFilter
            appliedFilter={filter}
            className={css.filterStyle}
            placeholder={getString('cv.monitoringSources.gco.searchForDashboardsPlaceholder')}
            onFilter={(filterValue: string) => setFilterAndPageOffset({ pageOffset: 0, filter: filterValue })}
          />
          <Table<TableData>
            data={tableData || []}
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
              pageSize: pageSize,
              pageIndex: pageIndex,
              pageCount: totalPages,
              itemCount: pageItemCount,
              gotoPage: newPageIndex => {
                setFilterAndPageOffset({ pageOffset: newPageIndex, filter: filter })
              }
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
                    <Text intent="primary" onClick={() => setIsModalOpen(true)} className={css.manualQueryLink}>
                      {getString('cv.monitoringSources.gco.addManualInputQuery')}
                    </Text>
                    <Text color={Color.BLACK}>{getString(props.tableTitle)}</Text>
                  </Container>
                ),
                accessor: 'dashboard',
                width: '90%',
                disableSortBy: true,
                Cell: function DashboardName(cellProps: CellProps<TableData>) {
                  return loading ? (
                    <Container height={16} width="100%" className={Classes.SKELETON} />
                  ) : (
                    <Text icon={defaultItemIcon} color={Color.BLACK}>
                      {cellProps.value.name}
                    </Text>
                  )
                }
              }
            ]}
          />
          {!loading && error?.data && (
            <PageError
              className={css.loadingErrorNoData}
              message={getErrorMessage(error)}
              onClick={() => refetchData({ queryParams: queryParams })}
            />
          )}
          {!loading && !error?.data && !dashboardItems?.length && (
            <NoDataCard
              icon="warning-sign"
              className={css.loadingErrorNoData}
              message={getString('cv.monitoringSources.gco.selectDashboardsPage.noDataText')}
              buttonText={getString('cv.monitoringSources.gco.addManualInputQuery')}
              onClick={() => setIsModalOpen(true)}
            />
          )}
          {isModalOpen && (
            <ManualInputQueryModal
              title={manualQueryInputTitle}
              manuallyInputQueries={getManuallyCreatedQueries(propsData.selectedMetrics)}
              onSubmit={values => {
                if (!propsData.selectedMetrics) {
                  propsData.selectedMetrics = new Map()
                }
                propsData.selectedMetrics.set(values.metricName, {
                  isManualQuery: true,
                  isCustomCreatedMetric: true,
                  metricName: values.metricName
                })
                onNext({ ...propsData, selectedDashboards: Array.from(selectedDashboards.values()) })
              }}
              closeModal={() => setIsModalOpen(false)}
            />
          )}
        </Container>
      }
      footerCTAProps={{
        onNext: () => onNext({ ...propsData, selectedDashboards: Array.from(selectedDashboards.values()) }),
        onPrevious: onPrevious,
        className: css.footer
      }}
    />
  )
}
