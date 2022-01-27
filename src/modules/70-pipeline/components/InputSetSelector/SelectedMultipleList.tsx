/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { clone, defaultTo } from 'lodash-es'
import cx from 'classnames'

import { Checkbox, Color, Container, Icon, Layout, Text } from '@harness/uicore'
import { isInputSetInvalid } from '@pipeline/utils/inputSetUtils'
import { Badge } from '@pipeline/pages/utils/Badge/Badge'
import { useStrings } from 'framework/strings'
import type { EntityGitDetails, InputSetErrorWrapper, InputSetSummaryResponse } from 'services/pipeline-ng'
import { getIconByType, InputSetValue, onDragEnd, onDragLeave, onDragOver, onDragStart } from './utils'
import { InputSetGitDetails } from './InputSetGitDetails'
import css from './InputSetSelector.module.scss'

interface SelectedMultipleListProps {
  selectedInputSets: InputSetValue[]
  setSelectedInputSets: React.Dispatch<React.SetStateAction<InputSetValue[]>>
  onCheckBoxHandler: (
    checked: boolean,
    label: string,
    val: string,
    type: InputSetSummaryResponse['inputSetType'],
    inputSetGitDetails: EntityGitDetails | null,
    inputSetErrorDetails?: InputSetErrorWrapper,
    overlaySetErrorDetails?: { [key: string]: string }
  ) => void
}

export default function SelectedMultipleList(props: SelectedMultipleListProps): JSX.Element {
  const { selectedInputSets, setSelectedInputSets, onCheckBoxHandler } = props
  const { getString } = useStrings()

  const onDropPreSelect = React.useCallback(
    (event: React.DragEvent<HTMLLIElement>, droppedLocation: InputSetValue) => {
      if (event.preventDefault) {
        event.preventDefault()
      }
      const data = event.dataTransfer.getData('data')
      if (data) {
        try {
          const dropInputSet: InputSetValue = JSON.parse(data)
          const clonedSelectedInputSets = clone(selectedInputSets)
          const droppedItem = clonedSelectedInputSets.filter(item => item.value === dropInputSet.value)[0]
          if (droppedItem) {
            const droppedItemIndex = clonedSelectedInputSets.indexOf(droppedItem)
            const droppedLocationIndex = clonedSelectedInputSets.indexOf(droppedLocation)
            clonedSelectedInputSets.splice(droppedItemIndex, 1)
            clonedSelectedInputSets.splice(droppedLocationIndex, 0, droppedItem)
            setSelectedInputSets(clonedSelectedInputSets)
          }
          // eslint-disable-next-line no-empty
        } catch {}
      }
      event.currentTarget.classList.remove(css.dragOver)
    },
    [selectedInputSets]
  )

  return (
    <>
      {selectedInputSets.map((selected, index) => (
        <li
          className={cx(css.item)}
          onClick={() => {
            onCheckBoxHandler(
              false,
              selected.label,
              selected.value as string,
              selected.type,
              defaultTo(selected.gitDetails, {}),
              selected.inputSetErrorDetails,
              selected.overlaySetErrorDetails
            )
          }}
          key={`${index}-${selected.value as string}`}
          data-testid={`${index}-${selected.value as string}`}
          draggable={true}
          onDragStart={event => {
            onDragStart(event, selected)
          }}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={event => onDropPreSelect(event, selected)}
        >
          <Layout.Horizontal flex={{ distribution: 'space-between' }}>
            <Checkbox
              className={css.checkbox}
              labelElement={
                <Layout.Horizontal flex={{ alignItems: 'center' }} padding={{ left: true }}>
                  <Icon name={getIconByType(selected.type)}></Icon>
                  <Container margin={{ left: true }} className={css.nameIdContainer}>
                    <Text lineClamp={1} font={{ weight: 'bold' }} color={Color.GREY_800}>
                      {selected.label}
                    </Text>
                    <Text font="small" lineClamp={1} margin={{ top: 'xsmall' }} color={Color.GREY_450}>
                      {getString('idLabel', { id: selected.value })}
                    </Text>
                  </Container>
                </Layout.Horizontal>
              }
              checked={true}
            />
            {selected.gitDetails?.repoIdentifier ? <InputSetGitDetails gitDetails={selected.gitDetails} /> : null}
            {isInputSetInvalid(selected) && (
              <Container padding={{ left: 'large' }}>
                <Badge
                  text={'common.invalid'}
                  iconName="error-outline"
                  showTooltip={true}
                  entityName={selected.name}
                  entityType={selected.inputSetType === 'INPUT_SET' ? 'Input Set' : 'Overlay Input Set'}
                  uuidToErrorResponseMap={selected.inputSetErrorDetails?.uuidToErrorResponseMap}
                  overlaySetErrorDetails={selected.overlaySetErrorDetails}
                />
              </Container>
            )}
          </Layout.Horizontal>
          <span className={css.order}>
            <Text className={css.orderText}>{index + 1}</Text>
            <Icon name="drag-handle-vertical" className={css.drag} size={16} />
          </span>
        </li>
      ))}
    </>
  )
}
