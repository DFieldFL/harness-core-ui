import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Container } from '@wings-software/uikit'
import { isNumber } from 'lodash-es'
import { ActivityTrack, ActivityTrackProps } from './ActivityTrack/ActivityTrack'
import { Activity, computePositionOnTimeline, computeTimelineHeight } from './ActivityTrack/ActivityTrackUtils'
import ActivityTimelineIntervalMarker from './ActivityTimelineIntervalMarker/ActivityTimelineIntervalMarker'
import { SelectedActivitySummaryCard } from './SelectedActivitySummaryCard/SelectedActivitySummaryCard'
import { LineFromSelectedActivityCard } from './LineFromSelectedActivityCard/LineFromSelectedActivityCard'
import { ActivityTimelineScrubber } from './ActivityTimelineScrubber/ActivityTimelineScrubber'
import css from './ActivityTimeline.module.scss'

export interface ActivityTimelineViewProps {
  activityTracks: ActivityTrackProps[]
  timelineStartTime: number
  timelineEndTime: number
  onLoadMore: (startTime: number) => void
  renderSummaryCardContent: (selectedActivity: Activity) => JSX.Element
}

type ScrollThresholdInfo = {
  scrollTopHeight: number
  nextPageStartTime: number
}

function determineLoadMoreThreshold(
  activityTracks: ActivityTrackProps[],
  timelineStartTime: number,
  timelineEndTime: number
): ScrollThresholdInfo {
  let [minStartTime, maxStartTime] = [Infinity, 0]
  for (const activityTrack of activityTracks) {
    const { activities = [] } = activityTrack || {}
    if (isNumber(activities[0]?.startTime) && activities[0].startTime < minStartTime) {
      minStartTime = activities[0].startTime
    }
    if (
      isNumber(activities[activities.length - 1]?.startTime) &&
      activities[activities.length - 1].startTime > maxStartTime
    ) {
      maxStartTime = activities[activities.length - 1].startTime
    }
  }

  const thresholdTimestamp = Math.floor((maxStartTime - timelineStartTime) * 0.6) + timelineStartTime
  const { timelineHeight, totalTimeDifference } = computeTimelineHeight(timelineStartTime, timelineEndTime)
  return {
    scrollTopHeight: computePositionOnTimeline(
      timelineStartTime,
      thresholdTimestamp,
      totalTimeDifference,
      timelineHeight
    ),
    nextPageStartTime: maxStartTime
  }
}

export function ActivityTimeline(props: ActivityTimelineViewProps): JSX.Element {
  const { activityTracks, timelineStartTime, timelineEndTime, renderSummaryCardContent, onLoadMore } = props
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null)
  const [activitySummaryCardRef, setActivitySummaryCardRef] = useState<HTMLDivElement | null>(null)
  const [nextScrollTopThreshold, setNextScrollTopThreshold] = useState<ScrollThresholdInfo>(
    determineLoadMoreThreshold(activityTracks, timelineStartTime, timelineEndTime)
  )
  const [timelineTrackContainerHeight, setTimelineTrackHeight] = useState<number | undefined>()
  const containerRef = useRef<HTMLDivElement>(null)
  const onScrollCallback = useCallback(
    e => {
      if (
        e.target?.scrollTop > nextScrollTopThreshold.scrollTopHeight &&
        nextScrollTopThreshold.nextPageStartTime === timelineEndTime
      ) {
        onLoadMore(nextScrollTopThreshold.nextPageStartTime)
      }
    },
    [nextScrollTopThreshold, timelineStartTime, timelineEndTime]
  )

  const scrubberData = useMemo(() => activityTracks?.map(track => track.activities), [activityTracks])

  useEffect(() => {
    setNextScrollTopThreshold(determineLoadMoreThreshold(activityTracks, timelineStartTime, timelineEndTime))
  }, [activityTracks, timelineStartTime, timelineEndTime])

  useLayoutEffect(() => {
    if (!containerRef?.current) return
    containerRef.current.addEventListener('scroll', onScrollCallback)
    return () => containerRef?.current?.removeEventListener('scroll', onScrollCallback)
  }, [onScrollCallback, containerRef])

  useLayoutEffect(() => {
    const pageHeader = document.querySelector('[class*="PageHeader"]')
    let contentHeight = window.innerHeight
    if (pageHeader) contentHeight -= pageHeader.getBoundingClientRect().height
    setTimelineTrackHeight(contentHeight)
  }, [])

  return (
    <Container className={css.main}>
      <ActivityTimelineScrubber
        timelineStartTime={timelineStartTime}
        timelineEndTime={timelineEndTime}
        scrubberData={scrubberData}
      />
      <div className={css.tracksAndIntervalMarkers} ref={containerRef} style={{ height: timelineTrackContainerHeight }}>
        <LineFromSelectedActivityCard
          key={selectedActivity?.uuid}
          selectedActivity={selectedActivity}
          timelineContainerRef={containerRef?.current}
          selectedActivitySummaryCardRef={activitySummaryCardRef}
        />
        <Container className={css.activityTracks}>
          {activityTracks.map(activityTrackProps => (
            <ActivityTrack
              {...activityTrackProps}
              key={activityTrackProps.trackName}
              onActivityClick={activity => setSelectedActivity(activity)}
            />
          ))}
        </Container>
        <Container className={css.dayMarkersAndSummaryCard}>
          <ActivityTimelineIntervalMarker startTime={timelineStartTime} endTime={timelineEndTime} />
          {selectedActivity ? (
            <SelectedActivitySummaryCard
              selectedActivity={selectedActivity}
              renderSummaryCardContent={renderSummaryCardContent}
              activityTimelineContainerRef={containerRef?.current}
              setCardRef={setActivitySummaryCardRef}
            />
          ) : null}
        </Container>
      </div>
    </Container>
  )
}
