import React, { useEffect, useState } from 'react'
import { Container, Text, Color } from '@wings-software/uikit'
import cx from 'classnames'
import type { FontProps } from '@wings-software/uikit/dist/styled-props/font/FontProps'
import CVProgressBar from '@cv/components/CVProgressBar/CVProgressBar'
import type { ActivityVerificationSummary } from 'services/cv'
import i18n from './ActivityProgressIndicator.i18n'
import css from './ActivityProgressIndicator.module.scss'

interface ActivityProgressIndicatorProps {
  data?: ActivityVerificationSummary | null
  className?: string
}

const XSMALL_FONT_SIZE: FontProps = {
  size: 'xsmall'
}

export default function ActivityProgressIndicator(props: ActivityProgressIndicatorProps): JSX.Element {
  const {
    progressPercentage: progress,
    total,
    progress: progressCount,
    passed,
    failed,
    remainingTimeMs,
    startTime,
    durationMs,
    aggregatedStatus
  } = props.data || {}
  const [progressValue, setProgressValue] = useState(0)
  const isValidProgressValue = props.data && progress !== undefined && progress !== null && progress > -1
  useEffect(() => {
    if (isValidProgressValue) {
      const timeoutRefNumber = setTimeout(() => {
        setProgressValue(progress || 0)
        clearTimeout(timeoutRefNumber)
      }, 250)
    }
  }, [isValidProgressValue])

  if (!isValidProgressValue) {
    return (
      <Container className={cx(props.className, css.notStarted)}>
        <Text font={XSMALL_FONT_SIZE}>{i18n.verificationNotStarted}</Text>
        <CVProgressBar />
      </Container>
    )
  }

  const minutesRemaining = Math.floor((remainingTimeMs ?? 0) / 1000 / 60)
  const duration = Math.floor((durationMs ?? 0) / 1000 / 60)

  let progressDescription = `${progressCount} ${i18n.verificationsInProgress} (${minutesRemaining} ${i18n.minutesRemaining})`
  if (progress === 100) {
    progressDescription = `${passed}/${total} ${i18n.verifications} ${i18n.passedVerification}`
  }

  return (
    <Container className={props.className}>
      {!!failed && (
        <Text color={progress === 100 ? undefined : Color.BLACK} font={XSMALL_FONT_SIZE}>
          {`${failed} ${i18n.failed}`}
        </Text>
      )}
      <Text color={progress === 100 ? undefined : Color.BLACK} font={XSMALL_FONT_SIZE}>
        {progressDescription}
      </Text>
      <CVProgressBar status={aggregatedStatus} value={progressValue} />
      <Container flex>
        {startTime !== undefined && startTime !== null && (
          <Text color={Color.GREY_300} font={XSMALL_FONT_SIZE}>
            {`${i18n.startOn} ${new Date(startTime).toLocaleString()}`}
          </Text>
        )}
        {duration !== undefined && duration !== null && (
          <Text color={Color.GREY_300} font={XSMALL_FONT_SIZE}>
            {duration}
          </Text>
        )}
      </Container>
    </Container>
  )
}
