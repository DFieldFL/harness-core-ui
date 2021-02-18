import cx from 'classnames'
import React, { useState } from 'react'
import { Container } from '@wings-software/uicore'
import type { Feature } from 'services/cf'
import { AuditLogsToolbar } from './AuditLogsToolbar'
import { AuditLogsList } from './AuditLogsList'

export interface AuditLogsProps {
  flagData: Feature
  objectType: 'FeatureActivation' | 'Segment'
  className?: string
}

const SEVEN_DAYS_IN_MILLIS = 7 * 24 * 60 * 60 * 1000
const now = Date.now()

export const AuditLogs: React.FC<AuditLogsProps> = ({ className, flagData, objectType }) => {
  const [startDate, setStartDate] = useState<Date>(new Date(now - SEVEN_DAYS_IN_MILLIS))
  const [endDate, setEndDate] = useState<Date>(new Date(now))

  return (
    <Container className={cx(className)}>
      <AuditLogsToolbar
        startDate={startDate}
        endDate={endDate}
        onSelectedDateRangeChange={selectedDates => {
          setStartDate(selectedDates[0])
          setEndDate(selectedDates[1])
        }}
      />
      <AuditLogsList startDate={startDate} endDate={endDate} flagData={flagData} objectType={objectType} />
    </Container>
  )
}
