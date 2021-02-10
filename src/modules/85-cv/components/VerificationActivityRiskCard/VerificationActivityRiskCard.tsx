import React, { useEffect } from 'react'
import { Container, Link } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import CVProgressBar from '@cv/components/CVProgressBar/CVProgressBar'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useGetActivityVerificationResult, RestResponseActivityVerificationResultDTO } from 'services/cv'
import { useStrings } from 'framework/exports'
import VerificationStatusBar from '@cv/pages/dashboard/activity-changes-drilldown/VerificationStatusBar'
import css from './VerificationActivityRiskCard.module.scss'

interface VerificationActivityRiskCardProps {
  activityWithRisks?: RestResponseActivityVerificationResultDTO | null
  onClickKubernetesEvent?: () => void
}

export function VerificationActivityRiskCard(props: VerificationActivityRiskCardProps): JSX.Element {
  const { activityWithRisks, onClickKubernetesEvent } = props
  const { getString } = useStrings()
  return (
    <Container className={css.main}>
      <CVProgressBar
        value={activityWithRisks?.resource?.progressPercentage}
        status={activityWithRisks?.resource?.status}
      />
      {activityWithRisks && (
        <VerificationStatusBar
          status={activityWithRisks?.resource?.status}
          startTime={activityWithRisks?.resource?.activityStartTime as number}
          remainingTimeMs={activityWithRisks?.resource?.remainingTimeMs as number}
          cumulativeRisk={activityWithRisks?.resource?.overallRisk as number}
          scoresBeforeChanges={activityWithRisks?.resource?.preActivityRisks || []}
          scoresAfterChanges={activityWithRisks?.resource?.postActivityRisks || []}
        />
      )}
      {activityWithRisks?.resource?.activityType === 'KUBERNETES' && onClickKubernetesEvent && (
        <Link
          minimal
          withoutHref
          text={getString('cv.changesPage.viewKubernetesEvents')}
          className={css.kubernetesButton}
          onClick={() => onClickKubernetesEvent()}
        />
      )}
    </Container>
  )
}

export function VerificationActivityRiskCardWithApi({
  selectedActivityId
}: {
  selectedActivityId?: string
}): JSX.Element {
  const { accountId } = useParams<ProjectPathProps>()
  const { data: activityWithRisks, refetch } = useGetActivityVerificationResult({
    activityId: selectedActivityId || '',
    queryParams: { accountId },
    lazy: true
  })

  useEffect(() => {
    if (selectedActivityId) refetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedActivityId])

  return <VerificationActivityRiskCard activityWithRisks={activityWithRisks} />
}
