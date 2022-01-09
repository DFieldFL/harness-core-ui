import React from 'react'

import cx from 'classnames'
import type { Scope } from '@common/interfaces/SecretsInterface'
import type { IconProps } from '@wings-software/uicore/dist/icons/Icon'
import { Collapse, Pagination, PaginationProps } from '@wings-software/uicore'
import type { EntityReferenceResponse } from '../EntityReference/EntityReference'
import css from './CollapsableList.module.scss'

export interface CollapsableTableProps<T> {
  selectedRecord: T | undefined
  setSelectedRecord: (val: T | undefined) => void
  data: EntityReferenceResponse<T>[]
  recordRender: (args: { item: EntityReferenceResponse<T>; selectedScope: Scope; selected?: boolean }) => JSX.Element
  collapsedRecordRender?: (args: {
    item: EntityReferenceResponse<T>
    selectedScope: Scope
    selected?: boolean
  }) => JSX.Element
  pagination: PaginationProps
  selectedScope: Scope
}

export function CollapsableList<T>(props: CollapsableTableProps<T>): JSX.Element {
  return (
    <>
      <div className={cx(css.referenceList, { [css.referenceListOverflow]: props.data.length > 5 })}>
        {props.data.map((item: EntityReferenceResponse<T>) => (
          //   <div
          //     key={item.identifier}
          //     className={cx(css.listItem, {
          //       [css.selectedItem]: props.selectedRecord === item.record
          //     })}
          //     onClick={() => props.setSelectedRecord(props.selectedRecord === item.record ? undefined : item.record)}
          //   >
          //     {props.recordRender({
          //       item,
          //       selectedScope: props.selectedScope as any,
          //       selected: props.selectedRecord === item.record
          //     })}
          //   </div>

          <Collapse
            key={item.identifier}
            collapsedIcon="main-chevron-right"
            expandedIcon="main-chevron-down"
            iconProps={{ size: 12 } as IconProps}
            isRemovable={false}
            collapseClassName={cx(css.collapseWrapper, {
              [css.selectedItem]: props.selectedRecord === item.record
            })}
            collapseHeaderClassName={css.collapseHeader}
            heading={
              <div
                onClick={e => {
                  e.preventDefault()
                  e.stopPropagation()
                  props.setSelectedRecord(props.selectedRecord === item.record ? undefined : item.record)
                }}
                className={css.collapeHeaderContent}
              >
                {props.recordRender({
                  item,
                  selectedScope: props.selectedScope as any,
                  selected: props.selectedRecord === item.record
                })}
              </div>
            }
            enableIconClick={true}
          >
            {props.collapsedRecordRender?.({
              item,
              selectedScope: props.selectedScope as any,
              selected: props.selectedRecord === item.record
            })}
          </Collapse>
        ))}
      </div>
      <Pagination {...props.pagination} />
    </>
  )
}
