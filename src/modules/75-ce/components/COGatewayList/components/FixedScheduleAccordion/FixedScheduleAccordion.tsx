/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Intent } from '@blueprintjs/core'
import { isEmpty as _isEmpty, defaultTo as _defaultTo } from 'lodash-es'
import { Accordion, Color, Container, Heading, Icon, Layout, useConfirmationDialog } from '@wings-software/uicore'
import { Service, useCreateStaticSchedules, useDeleteStaticSchedule, useListStaticSchedules } from 'services/lw'
import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useToaster } from '@common/components'
import { AS_RESOURCE_TYPE } from '@ce/constants'
import { useStrings } from 'framework/strings'
import useFixedScheduleEditor from '@ce/common/FixedSchedule/useFixedScheduleEditor'
import { Utils } from '@ce/common/Utils'
import type { FixedScheduleClient } from '@ce/components/COCreateGateway/models'
import FixedSchedeulesList from '@ce/common/FixedSchedulesList/FixedSchedulesList'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import css from '../../COGatewayList.module.scss'

interface FixedScheduleAccordionProps {
  service?: Service
}

const FixedScheduleAccordion: React.FC<FixedScheduleAccordionProps> = props => {
  const { accountId } = useParams<AccountPathProps>()
  const { currentUserInfo } = useAppStore()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()

  const [selectedSchedule, setSelectedSchedule] = useState<FixedScheduleClient>()

  const { data, loading, refetch } = useListStaticSchedules({
    account_id: accountId,
    lazy: true
  })

  const { mutate: deleteSchedule } = useDeleteStaticSchedule({
    account_id: accountId,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: createStaticSchesules } = useCreateStaticSchedules({
    account_id: accountId
  })

  const fetchAllSchedules = () => {
    if (props.service?.cloud_account_id) {
      refetch({
        queryParams: {
          accountIdentifier: accountId,
          cloud_account_id: props.service.cloud_account_id,
          res_id: _defaultTo(props.service.id, '').toString(),
          res_type: AS_RESOURCE_TYPE.rule
        }
      })
    }
  }

  useEffect(() => {
    fetchAllSchedules()
  }, [props.service?.cloud_account_id])

  const handleScheduleDeletion = (isConfirmed: boolean) => {
    if (isConfirmed) {
      confirmScheduleDeletion()
    }
  }

  const confirmScheduleDeletion = async () => {
    try {
      await deleteSchedule(selectedSchedule?.id as number)
      showSuccess(
        getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.successfullyDeletedSchedule', {
          name: _defaultTo(selectedSchedule?.name, '')
        })
      )
    } catch (e) {
      showError(e.data?.message || e.data)
    }
    setSelectedSchedule(undefined)
    fetchAllSchedules()
  }

  const { openDialog } = useConfirmationDialog({
    intent: Intent.DANGER,
    confirmButtonText: getString('delete'),
    cancelButtonText: getString('cancel'),
    buttonIntent: Intent.DANGER,
    titleText: getString('ce.co.autoStoppingRule.configuration.step4.tabs.schedules.deleteScheduleTitle'),
    contentText: '',
    onCloseDialog: handleScheduleDeletion
  })

  const handleScheduleAddition = async (schedule: FixedScheduleClient) => {
    try {
      await createStaticSchesules(
        {
          schedule: Utils.convertScheduleClientToSchedule(schedule, {
            accountId,
            userId: _defaultTo(currentUserInfo.uuid, ''),
            ruleId: props.service?.id as number,
            scheduleId: schedule.id
          })
        },
        {
          queryParams: {
            accountIdentifier: accountId,
            cloud_account_id: _defaultTo(props.service?.cloud_account_id, '')
          }
        }
      )
      fetchAllSchedules()
    } catch (e) {
      showError(e.data?.message || e.data)
    }
  }

  const { openEditor } = useFixedScheduleEditor({
    schedule: selectedSchedule,
    addSchedule: handleScheduleAddition,
    isEdit: true,
    allCreatedSchedules: []
  })

  const onEditClick = (schedule: FixedScheduleClient) => {
    setSelectedSchedule(schedule)
    openEditor()
  }

  const onDeleteClick = (schedule: FixedScheduleClient) => {
    setSelectedSchedule(schedule)
    openDialog()
  }

  if (loading) {
    return (
      <Layout.Horizontal flex={{ justifyContent: 'center', alignItems: 'center' }}>
        <Icon name="loading" />
      </Layout.Horizontal>
    )
  }

  if (!props.service || _isEmpty(data?.response)) {
    return null
  }

  const scheduleClientData = data?.response?.map(s => Utils.convertScheduleToClientSchedule(s))

  return (
    <Accordion className={css.serviceAccordionContainer}>
      <Accordion.Panel
        id="fixedSchedules"
        summary={`${_defaultTo(data?.response?.length, '')} Fixed Schedule`}
        details={
          <Container className={css.scheduleAccordion}>
            <Heading level={4} color={Color.GREY_400}>
              ACTIVE SCHEDULES
            </Heading>
            <FixedSchedeulesList
              data={_defaultTo(scheduleClientData, [])}
              handleDelete={onDeleteClick}
              handleEdit={onEditClick}
              shrinkColumns={true}
            />
          </Container>
        }
      />
    </Accordion>
  )
}

export default FixedScheduleAccordion
