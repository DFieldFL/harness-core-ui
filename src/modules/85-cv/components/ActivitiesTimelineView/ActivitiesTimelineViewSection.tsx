import React, { useEffect, useState } from 'react'
import { Container, NoDataCard } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import {
  ListActivitiesForDashboardQueryParams,
  RestResponseListActivityDashboardDTO,
  useListActivitiesForDashboard
} from 'services/cv'
import { useStrings } from 'framework/strings'
import ActivitiesTimelineView, { ActivitiesTimelineViewProps, EventData } from './ActivitiesTimelineView'
import css from './ActivitiesTimelineView.module.scss'

export interface ActivitesTimelineViewSectionProps {
  startTime: number
  endTime: number
  environmentIdentifier?: string
  serviceIdentifier?: string
  timelineViewProps?: ActivitiesTimelineViewProps['timelineViewProps']
  selectedActivityId?: string
  className?: string
}

export default function ActivitesTimelineViewSection({
  startTime,
  endTime,
  environmentIdentifier,
  serviceIdentifier,
  timelineViewProps,
  selectedActivityId,
  className
}: ActivitesTimelineViewSectionProps): React.ReactElement {
  const [deployments, setDeployments] = useState<Array<EventData>>()
  const [infrastructureChanges, setInfrastructureChanges] = useState<Array<EventData>>()
  const [otherChanges, setOtherChanges] = useState<Array<EventData>>()
  const [preselectedActivity, setPreselectedActivity] = useState<EventData>()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps>()
  const { getString } = useStrings()

  const {
    data,
    refetch: getActivities,
    loading,
    error
  } = useListActivitiesForDashboard({
    lazy: true,
    resolve: (res: RestResponseListActivityDashboardDTO) => {
      if (res) {
        const deploymentsData: Array<EventData> = []
        const infrastructureChangesData: Array<EventData> = []
        const otherChangesData: Array<EventData> = []
        res?.resource?.forEach(activity => {
          const { activityName, activityStartTime, verificationStatus, activityType, activityId } = activity || {}
          if (!activityName || !activityStartTime || !verificationStatus || !activityType) return
          const eventData: EventData = {
            startTime: activityStartTime,
            name: activityName,
            activityId,
            activityType,
            verificationResult: verificationStatus
          }
          switch (activityType) {
            case 'DEPLOYMENT':
              deploymentsData.push(eventData)
              break
            case 'KUBERNETES':
            case 'INFRASTRUCTURE':
              infrastructureChangesData.push(eventData)
              break
            case 'CUSTOM' as any:
            case 'OTHER':
              otherChangesData.push(eventData)
          }
          if (selectedActivityId === activity.activityId) {
            eventData.headerLabels = {
              primary: `2 ${getString('hours')} ${getString('cv.activityTimeline.beforeChange').toLocaleUpperCase()}`
            }
            setPreselectedActivity(eventData)
          }
        })
        setDeployments(deploymentsData)
        setInfrastructureChanges(infrastructureChangesData)
        setOtherChanges(otherChangesData)
      }
      return res
    }
  })

  useEffect(() => {
    if (startTime && endTime) {
      getActivities({
        queryParams: {
          accountId,
          orgIdentifier,
          projectIdentifier,
          environmentIdentifier,
          serviceIdentifier,
          startTime: startTime,
          endTime: endTime
        } as ListActivitiesForDashboardQueryParams
      })
    }
  }, [startTime, endTime, environmentIdentifier, serviceIdentifier])

  if (error?.message) {
    return (
      <Container height={200}>
        <NoDataCard
          icon="error"
          iconSize={30}
          buttonText={getString('retry')}
          message={error.message}
          onClick={() =>
            getActivities({
              queryParams: {
                accountId,
                orgIdentifier,
                projectIdentifier,
                environmentIdentifier,
                startTime: startTime,
                endTime: endTime
              }
            })
          }
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
          buttonText={getString('retry')}
          message={getString('cv.activityTimeline.noChanges')}
          onClick={() =>
            getActivities({
              queryParams: {
                accountId,
                orgIdentifier,
                projectIdentifier,
                environmentIdentifier,
                startTime: startTime,
                endTime: endTime
              }
            })
          }
          containerClassName={css.activityTimelineNoData}
        />
      </Container>
    )
  }

  return (
    <ActivitiesTimelineView
      startTime={startTime}
      endTime={endTime}
      preselectedEvent={preselectedActivity}
      className={className}
      deployments={deployments}
      infrastructureChanges={infrastructureChanges}
      otherChanges={otherChanges}
      timelineViewProps={{
        ...timelineViewProps,
        loading
      }}
    />
  )
}
