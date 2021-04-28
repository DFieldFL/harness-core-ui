import React from 'react'
import { Icon, timeToDisplayText, Text, Color, Layout, Container } from '@wings-software/uicore'
import moment from 'moment'
import ExecutionStatusLabel from '@pipeline/components/ExecutionStatusLabel/ExecutionStatusLabel'
import { ExecutionStatusEnum } from '@pipeline/utils/statusHelpers'
import { StringUtils } from '@common/exports'
import { useStrings } from 'framework/strings'
import css from './HoverCard.module.scss'

export interface HoverCardProps {
  data?: any
  barrier?: {
    barrierInfoLoading?: boolean
    barrierData?: any
  }
  children?: any
}

export default function HoverCard(props: HoverCardProps): React.ReactElement {
  const { data } = props
  const { getString } = useStrings()
  const startTime = moment(data?.data?.startTs).format(StringUtils.DEFAULT_DATE_FORMAT)
  let delta = data?.data?.startTs ? Math.abs(data?.data?.startTs - (data?.data?.endTs || Date.now())) : 0

  delta = Math.round(delta / 1000) * 1000
  const timeText = timeToDisplayText(delta)
  return (
    <Container className={css.hovercard}>
      <Layout.Horizontal padding="medium">
        <Layout.Vertical style={{ flex: 1 }} flex={{ alignItems: 'flex-start' }} margin={{ right: 'medium' }}>
          <Text style={{ fontSize: '14px' }} font={{ weight: 'semi-bold' }} color={Color.BLACK}>
            {data.name}
          </Text>
          {data.status !== ExecutionStatusEnum.Skipped && (
            <Layout.Horizontal spacing={'xsmall'}>
              {!!startTime && (
                <Container margin={{ right: 'small' }}>
                  <Text inline={true} font={{ size: 'small' }} color={Color.GREY_500}>
                    {getString('pipeline.startTime')}:{' '}
                  </Text>
                  <Text inline={true} font={{ size: 'small' }} color={Color.BLACK}>
                    {startTime}
                  </Text>
                </Container>
              )}
              {!!timeText && (
                <Container>
                  <Text inline={true} font={{ size: 'small' }} color={Color.GREY_500}>
                    {getString('pipeline.duration')}:{' '}
                  </Text>
                  <Text inline={true} font={{ size: 'small' }} color={Color.BLACK}>
                    {timeText}
                  </Text>
                </Container>
              )}
            </Layout.Horizontal>
          )}
        </Layout.Vertical>
        <ExecutionStatusLabel status={data?.status} className={css.statusLabel} />
      </Layout.Horizontal>
      {data.status === ExecutionStatusEnum.Failed && (
        <Layout.Horizontal
          background={Color.RED_300}
          padding={{ right: 'medium', top: 'small', bottom: 'small', left: 'small' }}
        >
          <Container flex={{ justifyContent: 'center', alignItems: 'start' }} width={32}>
            <Icon name="warning-sign" color={Color.RED_500} size={16} />
          </Container>
          <Layout.Vertical spacing={'xsmall'} style={{ flex: 1 }}>
            <Text style={{ fontSize: '12px' }} color={Color.RED_500}>
              {data?.data?.failureInfo?.message || data?.data?.failureInfo?.errorMessage}
            </Text>
          </Layout.Vertical>
        </Layout.Horizontal>
      )}
      {props?.children}
    </Container>
  )
}
