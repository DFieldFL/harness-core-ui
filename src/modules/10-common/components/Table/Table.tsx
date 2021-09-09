import React from 'react'
import { useTable, Column, Row, useSortBy, usePagination, useResizeColumns } from 'react-table'
import cx from 'classnames'
import { Icon, Pagination, PaginationProps } from '@wings-software/uicore'
import css from './Table.module.scss'

export interface TableProps<Data extends Record<string, any>> {
  /**
   * Column Configuration
   */
  columns: Column<Data>[]
  data: Data[]
  className?: string
  /**
   * Is the table sortable?
   * @default true
   */
  sortable?: boolean
  hideHeaders?: boolean
  pagination?: PaginationProps
  onRowClick?: (data: Data, index: number) => void
  rowDataTestID?: (data: Data, index: number) => string
  getRowClassName?: (row: Row<Data>) => string
  /**
   * Removes the "card" UI from rows
   * @default false
   */
  minimal?: boolean
}

const Table = <Data extends Record<string, any>>(props: TableProps<Data>): React.ReactElement => {
  const {
    columns,
    data,
    className,
    sortable = false,
    hideHeaders = false,
    pagination,
    rowDataTestID,
    getRowClassName
  } = props

  const defaultColumn = React.useMemo(
    () => ({
      minWidth: 30,
      width: 150,
      maxWidth: 400
    }),
    []
  )

  const { headerGroups, page, prepareRow, state, getTableBodyProps, getTableProps } = useTable(
    {
      columns,
      data,
      defaultColumn,
      initialState: { pageIndex: pagination?.pageIndex || 0 },
      manualPagination: true,
      pageCount: pagination?.pageCount || -1
    },
    useSortBy,
    usePagination,
    useResizeColumns // provides header.getRezierProps
  )

  return (
    <div {...getTableProps()} className={cx(css.table, className)}>
      {
        <pre>
          <code>{JSON.stringify(state, null, 2)}</code>
        </pre>
      }
      {hideHeaders
        ? null
        : headerGroups.map(headerGroup => {
            return (
              // react key is not needed since it's generated/added by `react-table`
              // via the getHeaderGroupProps() function
              // eslint-disable-next-line react/jsx-key
              <div
                {...headerGroup.getHeaderGroupProps()}
                className={cx(css.header, { [css.minimal]: !!props.minimal })}
              >
                {headerGroup.headers.map(header => {
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <div
                      {...header.getHeaderProps(sortable ? header.getSortByToggleProps() : void 0)}
                      {...header.getHeaderProps(true ? header.getHeaderProps() : void 0)}
                      className={cx(css.cell, { [css.sortable]: sortable }, css.th)}
                      style={{ width: header.width }}
                    >
                      {header.render('Header')}
                      {sortable && header.canSort ? (
                        <Icon
                          name={
                            header.isSorted
                              ? header.isSortedDesc
                                ? 'caret-up'
                                : 'caret-down'
                              : 'double-caret-vertical'
                          }
                          size={15}
                          padding={{ left: 'small' }}
                        />
                      ) : null}
                      <div
                        {...header.getResizerProps()}
                        className={cx(css.resizer, header.isResizing && css.isResizing)}
                      />
                    </div>
                  )
                })}
              </div>
            )
          })}
      <div {...getTableBodyProps()} className={css.body}>
        {page.map(row => {
          prepareRow(row)
          return (
            // eslint-disable-next-line react/jsx-key
            <div
              {...row.getRowProps()}
              className={cx(
                css.row,
                {
                  [css.card]: !props.minimal,
                  [css.clickable]: !!props.onRowClick,
                  [css.minimal]: !!props.minimal
                },
                getRowClassName?.(row)
              )}
              onClick={() => {
                props.onRowClick?.(row.original, row.index)
              }}
              data-testid={rowDataTestID?.(row.original, row.index)}
            >
              {row.cells.map((cell, index) => {
                return (
                  // eslint-disable-next-line react/jsx-key
                  <div
                    {...cell.getCellProps()}
                    className={css.cell}
                    style={{ width: headerGroups[0].headers[index].width }}
                  >
                    {cell.render('Cell')}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
      {pagination ? <Pagination {...pagination} /> : null}
    </div>
  )
}

export default Table
