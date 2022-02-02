/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Icon, timeToDisplayText, Text, Color, Layout, Container } from '@wings-software/uicore'
import moment from 'moment'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { StringUtils } from '@common/exports'
import { useStrings } from 'framework/strings'

export interface StageHeaderProps {
  data?: any
}

export default function StageHeader(props: StageHeaderProps): React.ReactElement {
  const { data } = props
  const { getString } = useStrings()
  let delta = data?.data?.startTs ? Math.abs(data?.data?.startTs - (data?.data?.endTs || Date.now())) : 0

  delta = Math.round(delta / 1000) * 1000
  const timeText = timeToDisplayText(delta)
  return (
    <Container>
      <Layout.Horizontal padding="medium">
        <Layout.Vertical style={{ flex: 1 }} flex={{ alignItems: 'flex-start' }} margin={{ right: 'medium' }}>
          <Text width={300} lineClamp={1} font={{ weight: 'semi-bold', size: 'normal' }} color={Color.BLACK}>
            {data.name}
          </Text>
          {data.status !== ExecutionStatusEnum.Skipped && (
            <Layout.Horizontal spacing={'xsmall'}>
              {!!data?.data?.startTs && (
                <Container margin={{ right: 'small' }}>
                  <Text inline={true} font={{ size: 'small' }} color={Color.GREY_500}>
                    {getString('pipeline.startTime')}:{' '}
                  </Text>
                  <Text inline={true} font={{ size: 'small' }} color={Color.BLACK}>
                    {moment(data.data.startTs).format(StringUtils.DEFAULT_DATE_FORMAT)}
                  </Text>
                </Container>
              )}
              {!!timeText && (
                <Container>
                  <Text inline={true} font={{ size: 'small' }} color={Color.GREY_500}>
                    {getString('pipeline.duration')}:
                  </Text>
                  <Text inline={true} font={{ size: 'small' }} color={Color.BLACK}>
                    {timeText}
                  </Text>
                </Container>
              )}
            </Layout.Horizontal>
          )}
        </Layout.Vertical>
        <ExecutionStatusLabel status={data?.status === 'IgnoreFailed' ? 'Failed' : data?.status} />
      </Layout.Horizontal>
      {data.status === ExecutionStatusEnum.Failed && (
        <Layout.Horizontal
          background={Color.RED_100}
          padding={{ right: 'medium', top: 'small', bottom: 'small', left: 'small' }}
        >
          <Container flex={{ justifyContent: 'center', alignItems: 'start' }} width={32}>
            <Icon name="warning-sign" color={Color.RED_500} size={16} />
          </Container>
          <Layout.Vertical spacing={'xsmall'} style={{ flex: 1 }}>
            <Text style={{ fontSize: '12px', wordBreak: 'break-word' }} lineClamp={4} color={Color.RED_500}>
              {data?.data?.failureInfo?.message || data?.data?.failureInfo?.errorMessage}
            </Text>
          </Layout.Vertical>
        </Layout.Horizontal>
      )}
    </Container>
  )
}
