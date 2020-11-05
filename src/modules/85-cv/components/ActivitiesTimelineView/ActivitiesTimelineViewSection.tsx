import React, { useEffect, useState } from 'react'
import { Container } from '@wings-software/uikit'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { RestResponseListActivityDashboardDTO, useListActivitiesForDashboard } from 'services/cv'
import { useRouteParams } from 'framework/exports'
import ActivitiesTimelineView, { ActivitiesTimelineViewProps, EventData } from './ActivitiesTimelineView'
import i18n from './ActivitiesTimelineView.i18n'
import css from './ActivitiesTimelineView.module.scss'

export interface ActivitesTimelineViewSectionProps {
  startTime: number
  endTime: number
  environmentIdentifier?: string
  timelineViewProps?: ActivitiesTimelineViewProps['timelineViewProps']
  className?: string
}

export default function ActivitesTimelineViewSection({
  startTime,
  endTime,
  environmentIdentifier,
  timelineViewProps,
  className
}: ActivitesTimelineViewSectionProps) {
  const [deployments, setDeployments] = useState<Array<EventData>>()
  const [configChanges, setConfigChanges] = useState<Array<EventData>>()
  const [infrastructureChanges, setInfrastructureChanges] = useState<Array<EventData>>()
  const [otherChanges, setOtherChanges] = useState<Array<EventData>>()
  const {
    params: { accountId, projectIdentifier, orgIdentifier }
  } = useRouteParams()

  const { data, refetch: getActivities, loading, error } = useListActivitiesForDashboard({
    lazy: true,
    resolve: (res: RestResponseListActivityDashboardDTO) => {
      if (res) {
        const deploymentsData: Array<EventData> = []
        const configChangesData: Array<EventData> = []
        const infrastructureChangesData: Array<EventData> = []
        const otherChangesData: Array<EventData> = []
        res?.resource?.forEach(activity => {
          const { activityName, activityStartTime, verificationStatus, activityType } = activity || {}
          if (!activityName || !activityStartTime || !verificationStatus || !activityType) return
          const eventData = {
            startTime: activityStartTime,
            name: activityName,
            verificationResult: verificationStatus
          }
          switch (activityType) {
            case 'DEPLOYMENT':
              deploymentsData.push(eventData)
              break
            case 'CUSTOM':
              configChangesData.push(eventData)
              break
            case 'INFRASTRUCTURE':
              infrastructureChangesData.push(eventData)
              break
          }
          setDeployments(deploymentsData)
          setConfigChanges(configChangesData)
          setInfrastructureChanges(infrastructureChangesData)
          setOtherChanges(otherChangesData)
        })
      }
      return res
    }
  })

  useEffect(() => {
    if (startTime && endTime) {
      getActivities({
        queryParams: {
          accountId,
          orgIdentifier: orgIdentifier as string,
          projectIdentifier: projectIdentifier as string,
          environmentIdentifier,
          startTime: startTime,
          endTime: endTime
        }
      })
    }
  }, [startTime, endTime, environmentIdentifier])

  if (error?.message) {
    return (
      <Container height={200}>
        <NoDataCard
          icon="error"
          iconSize={30}
          buttonText={i18n.retry}
          message={error.message}
          onClick={() => getActivities()}
          className={css.errorAndNoData}
        />
      </Container>
    )
  }

  if (!startTime || !endTime || (!loading && !data?.resource?.length)) {
    return (
      <Container height={200}>
        <NoDataCard
          icon="warning-sign"
          iconSize={30}
          buttonText={i18n.retry}
          message={i18n.noDataText}
          onClick={() => getActivities()}
          className={css.errorAndNoData}
        />
      </Container>
    )
  }

  return (
    <ActivitiesTimelineView
      startTime={startTime}
      endTime={endTime}
      className={className}
      deployments={deployments}
      configChanges={configChanges}
      infrastructureChanges={infrastructureChanges}
      otherChanges={otherChanges}
      timelineViewProps={{
        ...timelineViewProps,
        loading
      }}
    />
  )
}
