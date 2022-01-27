/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useMemo } from 'react'
import type { CellProps, Renderer } from 'react-table'
import { defaultTo } from 'lodash-es'
import type { GetDataError } from 'restful-react'
import ReactTimeago from 'react-timeago'
import { Tooltip } from '@blueprintjs/core'
import { Color, Container, Icon, Layout, Text, PageError, TableV2 } from '@wings-software/uicore'
import type { TableProps } from '@harness/uicore'
import DelegateEmptyState from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/icons/DelegateEmptyState.svg'
import { delegateTypeToIcon } from '@common/utils/delegateUtils'
import { useStrings } from 'framework/strings'
import { TagsViewer } from '@common/components/TagsViewer/TagsViewer'
import type {
  DelegateInnerCustom,
  DelegateGroupDetailsCustom
} from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/DelegateSelector'
import { useTroubleshootModal } from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/TroubleshootModal'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import css from '@connectors/components/CreateConnector/commonSteps/DelegateSelectorStep/DelegateSelector/DelegateSelector.module.scss'

export interface DelegateSelectorTableProps {
  data: (DelegateGroupDetailsCustom | DelegateInnerCustom)[] | null
  loading: boolean
  error: GetDataError<unknown> | null
  refetch: () => Promise<void>
  showMatchesSelectorColumn?: boolean
}

const RenderDelegateIcon: Renderer<CellProps<DelegateGroupDetailsCustom | DelegateInnerCustom>> = ({ row }) => {
  const { checked } = row.original
  return checked ? (
    <Container flex={{ justifyContent: 'center' }}>
      <Icon name={'tick'} color={Color.GREEN_700} size={24} />
    </Container>
  ) : (
    <></>
  )
}

const RenderDelegateName: Renderer<CellProps<DelegateGroupDetailsCustom | DelegateInnerCustom>> = ({ row }) => {
  const {
    delegateType = '',
    groupHostName,
    groupName,
    delegateInstanceDetails,
    sizeDetails
  } = row.original as DelegateGroupDetailsCustom
  const { getString } = useStrings()
  let nameText = ''
  let subText = ''
  const groupNameSubText = getString('delegates.delegateInstances', {
    current: delegateInstanceDetails?.length,
    total: sizeDetails?.replicas
  })
  nameText = `${groupName} ${groupNameSubText}`
  subText = groupHostName || ''
  return (
    <Layout.Horizontal>
      <Icon name={delegateTypeToIcon(delegateType)} size={24} />
      <Layout.Vertical padding={{ left: 'small' }} width="85%" className={css.delegateNameContainer}>
        <Tooltip position="top" content={nameText}>
          <Text color={Color.BLACK} className={css.delegateName}>
            {nameText}
          </Text>
        </Tooltip>
        <Tooltip position="top" content={subText}>
          <Text color={Color.GREY_400} className={css.delegateName}>
            {subText}
          </Text>
        </Tooltip>
      </Layout.Vertical>
    </Layout.Horizontal>
  )
}

const RenderHeartbeat: Renderer<CellProps<DelegateGroupDetailsCustom | DelegateInnerCustom>> = ({ row, column }) => {
  const { activelyConnected, lastHeartBeat } = row.original
  const { getString } = useStrings()
  const { onClick } = column as unknown as { onClick: () => void }
  if (!lastHeartBeat) {
    return (
      <Layout.Vertical>
        <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }} margin={{ bottom: 'xsmall' }}>
          <Icon name="spinner" size={10} margin={{ right: 'xsmall' }} />
          <Text font={{ size: 'small', weight: 'bold' }}>{getString('connectors.delegate.waitingForConnection')}</Text>
        </Layout.Horizontal>
        <Text
          font={{ size: 'xsmall', weight: 'semi-bold' }}
          color={Color.PRIMARY_6}
          className={css.troubleshoot}
          onClick={() => onClick?.()}
        >{`(${getString('delegates.delegateNotInstalled.tabs.commonProblems.troubleshoot')})`}</Text>
      </Layout.Vertical>
    )
  }

  const color: Color = activelyConnected ? Color.GREEN_600 : Color.GREY_400
  return (
    <Layout.Horizontal flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Icon name="full-circle" size={10} color={color} margin={{ right: 'small' }} />
      <ReactTimeago date={lastHeartBeat} live />
    </Layout.Horizontal>
  )
}

const RenderTags: Renderer<CellProps<DelegateGroupDetailsCustom | DelegateInnerCustom>> = ({ row }) => {
  let delegateTags = []
  const delegateTagData = row.original as DelegateGroupDetailsCustom
  delegateTags = [
    ...Object.keys(defaultTo(delegateTagData.groupImplicitSelectors, {})),
    ...defaultTo(delegateTagData.groupCustomSelectors, [])
  ]

  return (
    <Container className={css.tagContainer}>
      <TagsViewer tags={delegateTags} />
    </Container>
  )
}

export const DelegateSelectorTable: React.FC<DelegateSelectorTableProps> = props => {
  const { data, error, loading, refetch, showMatchesSelectorColumn = true } = props
  const { getString } = useStrings()
  const { showModal } = useTroubleshootModal()
  const columns: TableProps<DelegateGroupDetailsCustom | DelegateInnerCustom>['columns'] = useMemo(
    () => {
      const cols = [
        {
          Header: getString('delegate.DelegateName').toLocaleUpperCase(),
          id: 'name',
          width: '35%',
          accessor: (row: DelegateInnerCustom) => row.delegateName || row.hostName,
          Cell: RenderDelegateName
        },
        {
          Header: getString('connectors.delegate.hearbeat').toLocaleUpperCase(),
          id: 'connectivity',
          width: '20%',
          Cell: RenderHeartbeat,
          onClick: showModal
        },
        {
          Header: getString('tagsLabel').toLocaleUpperCase(),
          id: 'tags',
          width: showMatchesSelectorColumn ? '35%' : '45%',
          Cell: RenderTags
        }
      ]
      if (showMatchesSelectorColumn) {
        cols.push({
          Header: getString('connectors.delegate.matchesSelectors').toLocaleUpperCase(),
          id: 'delegateIcon',
          width: '10%',
          Cell: RenderDelegateIcon
        })
      }
      return cols
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, showMatchesSelectorColumn]
  )
  const getContent = (): React.ReactElement => {
    if (data && data.length) {
      return <TableV2 columns={columns} data={data} className={css.table} />
    }
    if (!data && loading) {
      return <ContainerSpinner data-name="delegateTableLoadingState" />
    }
    if (error) {
      return <PageError message={error?.message} onClick={() => refetch()} data-name="delegateTableErrorState" />
    }
    return (
      <Layout.Vertical height="100%" flex={{ align: 'center-center' }} data-name="delegateTableEmptyState">
        <img width="100%" height="100%" src={DelegateEmptyState} style={{ alignSelf: 'center' }} />
        <Text>{getString('connectors.delegate.noDelegates')}</Text>
      </Layout.Vertical>
    )
  }
  return (
    <Container
      padding={{ left: 'small', right: 'small', top: 'small' }}
      background={Color.WHITE}
      height={265}
      data-name="delegateContentContainer"
      className={css.delegateContentContainer}
    >
      {getContent()}
    </Container>
  )
}
