/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import cx from 'classnames'
import { useTable, usePagination, Column, useBlockLayout, Row } from 'react-table'
import { useSticky } from 'react-table-sticky'
import { Pagination } from '@wings-software/uicore'
import css from './Grid.module.scss'

interface GridProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  showPagination?: boolean
  onRowClick?: (row: Row<T>) => void
  onMouseEnter?: (row: Row<T>) => void
  onMouseLeave?: (row: Row<T>) => void
  totalItemCount?: number
  gridPageIndex?: number
  pageSize?: number
  fetchData?: (pageIndex: number, pageSize: number) => void
  isRowClickable?: boolean
}

const Grid = <T extends Record<string, unknown>>(props: GridProps<T>): JSX.Element => {
  const {
    showPagination = true,
    onRowClick,
    onMouseEnter,
    onMouseLeave,
    fetchData,
    totalItemCount = 0,
    pageSize: PAGE_SIZE = 10,
    gridPageIndex = 0,
    isRowClickable
  } = props

  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 150,
      width: 150,
      maxWidth: 400
    }),
    []
  )

  const { getTableProps, getTableBodyProps, headerGroups, prepareRow, page, pageCount } = useTable<T>(
    {
      columns: props.columns || [],
      data: props.data || [],
      defaultColumn,
      manualPagination: true,
      initialState: { pageSize: PAGE_SIZE, pageIndex: gridPageIndex },
      pageCount: Math.floor(totalItemCount / PAGE_SIZE) + (totalItemCount % PAGE_SIZE ? 1 : 0)
    },
    usePagination,
    useBlockLayout,
    useSticky
  )

  return (
    <div className={css.gridCtn}>
      <div {...getTableProps()} className={cx(css.table, css.sticky)}>
        <div className={css.header}>
          {headerGroups.map((headerGroup, id) => (
            <div {...headerGroup.getHeaderGroupProps()} className={css.tr} key={id}>
              {headerGroup.headers.map((column, idx) => (
                <div {...column.getHeaderProps()} className={cx(css.th, (column as any).className)} key={idx}>
                  {column.render('Header')}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div {...getTableBodyProps()} className={css.body}>
          {page.map((row, idx) => {
            prepareRow(row)
            return (
              <div
                {...row.getRowProps()}
                className={cx(css.tr, { [css.pointer]: isRowClickable })}
                key={idx}
                onClick={() => {
                  onRowClick && onRowClick(row)
                }}
                onMouseLeave={() => {
                  onMouseLeave && onMouseLeave(row)
                }}
                onMouseEnter={() => {
                  onMouseEnter && onMouseEnter(row)
                }}
              >
                {row.cells.map((cell, id) => (
                  <div {...cell.getCellProps()} className={cx(css.td, (cell.column as any).className)} key={id}>
                    <div className={css.cellValue}>{cell.render('Cell')}</div>
                  </div>
                ))}
              </div>
            )
          })}
        </div>
      </div>
      {showPagination && (
        <Pagination
          gotoPage={idx => {
            fetchData?.(idx, PAGE_SIZE)
          }}
          itemCount={totalItemCount || 0}
          pageCount={pageCount}
          pageIndex={gridPageIndex}
          pageSize={PAGE_SIZE}
        />
      )}
    </div>
  )
}

export default Grid
