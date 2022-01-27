/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, FC } from 'react'
import { useParams } from 'react-router-dom'
import { Layout, Icon, Text, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'

import { useGetDelegatesHeartbeatDetailsV2 } from 'services/portal'
import { POLL_INTERVAL, TIME_OUT } from '@delegates/constants'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import DelegateInstallationError from '@delegates/components/CreateDelegate/components/DelegateInstallationError/DelegateInstallationError'

import css from './StepProcessing.module.scss'

interface StepDelegateData {
  name?: string
  replicas?: number
  onSuccessHandler?: () => void
}

const StepProcessing: FC<StepDelegateData> = props => {
  const { name, replicas, onSuccessHandler } = props
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [isHeartBeatVerified, setVerifyHeartBeat] = useState(false)
  const [counter, setCounter] = useState(0)
  const {
    data,
    loading,
    refetch: verifyHeartBeat
  } = useGetDelegatesHeartbeatDetailsV2({
    queryParams: {
      accountId,
      projectId: projectIdentifier,
      orgId: orgIdentifier,
      delegateName: name
    },
    debounce: 200
  })

  React.useEffect(() => {
    if (
      !loading &&
      (!data || (data && data?.resource?.numberOfConnectedDelegates !== replicas)) &&
      !showError &&
      !showSuccess
    ) {
      const timerId = window.setTimeout(() => {
        setCounter(counter + POLL_INTERVAL)
        verifyHeartBeat()
      }, POLL_INTERVAL)

      if (counter >= TIME_OUT * (replicas || 1)) {
        window.clearTimeout(timerId)
        setVerifyHeartBeat(true)
        setShowError(true)
      }

      return () => {
        window.clearTimeout(timerId)
      }
    } else if (data?.resource?.numberOfConnectedDelegates === replicas) {
      setVerifyHeartBeat(true)
      setShowSuccess(true)
      onSuccessHandler && onSuccessHandler()
    }
  }, [data, verifyHeartBeat, loading, onSuccessHandler])

  if (showError) {
    return <DelegateInstallationError />
  } else if (showSuccess && isHeartBeatVerified) {
    return (
      <Layout.Horizontal spacing="medium" className={css.checkItemsWrapper}>
        <Icon size={10} color={Color.GREEN_500} name="command-artifact-check" className={css.checkIcon} />
        <Text font={{ weight: 'bold' }}>{getString('delegate.successVerification.delegateInstalled')}</Text>
      </Layout.Horizontal>
    )
  }
  const connectedDelegates = data?.resource?.numberOfConnectedDelegates || 0
  const iconColor = connectedDelegates === 0 ? Color.YELLOW_500 : Color.GREEN_500
  return (
    <Layout.Vertical spacing="xxlarge">
      <Layout.Horizontal padding="large">
        <Icon size={16} name="steps-spinner" style={{ marginRight: '12px' }} />
        <Text font="small">{getString('delegate.successVerification.checkDelegateInstalled')}</Text>
      </Layout.Horizontal>
      <Layout.Vertical padding="large">
        <Layout.Horizontal spacing="medium" className={css.checkItemsWrapper}>
          <Icon size={10} color={iconColor} name="command-artifact-check" className={css.checkIcon} />
          <Text font={{ weight: 'bold' }}>
            {connectedDelegates === 0
              ? getString('delegates.successVerification.checkingForHeartbeat')
              : getString('delegate.successVerification.heartbeatReceived')}
          </Text>
        </Layout.Horizontal>
      </Layout.Vertical>
    </Layout.Vertical>
  )
}

export default StepProcessing
