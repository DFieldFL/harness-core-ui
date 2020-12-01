import React, { useState, useCallback } from 'react'
import { Container, Color, Button, useModalHook } from '@wings-software/uikit'
import { useHistory } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { ActivityDetailsActivityType, ActivityDetailsActivitySource } from '@cv/utils/routeUtils'
import { Page } from '@common/exports'
import {
  ActivitySelectionModal,
  ActivityType,
  isActivityType,
  VerificationJobName,
  ActivitySourceName
} from './ActivitySelectionModal/ActivitySelectionModal'
import i18n from './ActivitiesPage.i18n'
import ActivitiesListView from './ActivitiesListView'
import css from './ActivitiesPage.module.scss'

const VerificationJobTileSelectionToRoute = {
  [VerificationJobName.TEST]: ActivityDetailsActivityType.TEST,
  [VerificationJobName.BG]: ActivityDetailsActivityType.BG,
  [VerificationJobName.CANARY]: ActivityDetailsActivityType.CANARY,
  [VerificationJobName.HEALTH]: ActivityDetailsActivityType.HEALTH
}

const VerificationActivitySourceTileSelectionToRoute = {
  [ActivitySourceName.KUBERNETES]: ActivityDetailsActivitySource.KUBERNETES,
  [ActivitySourceName.AWS]: ActivityDetailsActivitySource.AWS,
  [ActivitySourceName.GCP]: ActivityDetailsActivitySource.GCP,
  [ActivitySourceName.AZURE]: ActivityDetailsActivitySource.AZURE
}

function NoActivities(): JSX.Element {
  const [selectedActivityType, setActivityType] = useState<ActivityType | undefined>()
  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId } = useParams()
  const onActivityTypeOptionClickCallback = useCallback(
    (activityName: string) => {
      let routePath
      if (selectedActivityType === 'activity-sources') {
        routePath = VerificationActivitySourceTileSelectionToRoute[activityName]
      } else if (selectedActivityType === 'verification-jobs') {
        routePath = VerificationJobTileSelectionToRoute[activityName]
      }

      if (routePath) {
        history.push(
          routes.toCVActivityDetails({
            activityType: routePath,
            projectIdentifier: projectIdentifier as string,
            orgIdentifier: orgIdentifier as string,
            accountId
          })
        )
      }
    },
    [history, selectedActivityType, orgIdentifier, projectIdentifier, accountId]
  )
  const [openModal, hideModal] = useModalHook(() => {
    return selectedActivityType ? (
      <ActivitySelectionModal
        activityType={selectedActivityType}
        onHide={hideModal}
        onClickActivity={onActivityTypeOptionClickCallback}
      />
    ) : (
      <span />
    )
  }, [selectedActivityType, onActivityTypeOptionClickCallback])
  const onActivityTypeClickCallback = useCallback(
    (selectedActivity: string) => () => {
      if (isActivityType(selectedActivity)) {
        setActivityType(selectedActivity)
        openModal()
      }
    },
    [openModal]
  )

  return (
    <Container className={css.noActivities}>
      <Container background={Color.GREY_200} margin={{ bottom: 'xlarge' }} className={css.activityPlaceholder} />
      <Container className={css.noActivityButtonsContainer}>
        {Object.values(i18n.noActivityButtons).map(buttonText => (
          <Button key={buttonText.label} onClick={onActivityTypeClickCallback(buttonText.value)}>
            {buttonText.label}
          </Button>
        ))}
      </Container>
    </Container>
  )
}

export default function ActivitiesPage(): JSX.Element {
  return (
    <>
      <Page.Header title={i18n.pageTitle} />
      <Page.Body>
        <Container className={css.main}>
          <NoActivities />
          <ActivitiesListView />
        </Container>
      </Page.Body>
    </>
  )
}
