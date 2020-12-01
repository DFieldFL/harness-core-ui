import React from 'react'
import { Text, Button, Container, IconName, Color } from '@wings-software/uikit'
import { useHistory } from 'react-router-dom'
import { Classes } from '@blueprintjs/core'
import cx from 'classnames'
import { isNumber } from 'lodash-es'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import {
  MetricCategoryNames,
  MetricCategoriesWithRiskScore
} from '@cv/components/MetricCategoriesWithRiskScore/MetricCategoriesWithRiskScore'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import CVProgressBar from '@cv/components/CVProgressBar/CVProgressBar'
import { useGetRecentActivityVerificationResults, ActivityVerificationResultDTO, CategoryRisk } from 'services/cv'
import i18n from './RecentActivityChanges.i18n'
import ActivityType from '../ActivityType/ActivityType'
import css from './RecentActivityChanges.module.scss'

interface ActivityVerificationProgressWithRiskProps {
  activityStartTime?: number
  status?: ActivityVerificationResultDTO['status']
  overallRisk?: number
  progressPercentage?: number
  remainingTime?: number
}

const ACTIVITY_COLUMN_NAMES = Object.values(i18n.activityChangesColumnNames).map(columnName => (
  <Text
    width={columnName === i18n.activityChangesColumnNames.otherChanges ? 200 : 300}
    key={columnName}
    font={{ weight: 'bold', size: 'small' }}
    style={{ textTransform: 'uppercase' }}
  >
    {columnName}
  </Text>
))

const LOADING_SKELETON_DATA: ActivityVerificationResultDTO[] = [
  {
    activityType: 'DEPLOYMENT',
    activityName: 'Configuration Change',
    serviceIdentifier: 'Manager',
    preActivityRisks: [
      {
        category: MetricCategoryNames.INFRASTRUCTURE as CategoryRisk['category'],
        risk: 55
      },
      {
        category: MetricCategoryNames.ERRORS as CategoryRisk['category'],
        risk: 25
      },
      {
        category: MetricCategoryNames.PERFORMANCE as CategoryRisk['category'],
        risk: 30
      }
    ],
    progressPercentage: 43,
    activityStartTime: new Date().getTime(),
    status: 'IN_PROGRESS',
    postActivityRisks: [
      {
        category: MetricCategoryNames.INFRASTRUCTURE as CategoryRisk['category'],
        risk: 55
      },
      {
        category: MetricCategoryNames.ERRORS as CategoryRisk['category'],
        risk: 25
      },
      {
        category: MetricCategoryNames.PERFORMANCE as CategoryRisk['category'],
        risk: 30
      }
    ]
  },
  {
    activityType: 'INFRASTRUCTURE',
    activityName: 'Infrastruture Update',
    serviceIdentifier: 'Delegate',
    preActivityRisks: [
      {
        category: MetricCategoryNames.INFRASTRUCTURE as CategoryRisk['category'],
        risk: 55
      },
      {
        category: MetricCategoryNames.ERRORS as CategoryRisk['category'],
        risk: 25
      },
      {
        category: MetricCategoryNames.PERFORMANCE as CategoryRisk['category'],
        risk: 30
      }
    ],
    progressPercentage: 43,
    activityStartTime: new Date().getTime(),
    status: 'IN_PROGRESS',
    postActivityRisks: [
      {
        category: MetricCategoryNames.INFRASTRUCTURE as CategoryRisk['category'],
        risk: 55
      },
      {
        category: MetricCategoryNames.ERRORS as CategoryRisk['category'],
        risk: 25
      },
      {
        category: MetricCategoryNames.PERFORMANCE as CategoryRisk['category'],
        risk: 30
      }
    ]
  },
  {
    activityType: 'INFRASTRUCTURE',
    activityName: 'Database Upgrade',
    serviceIdentifier: 'MongoDB',
    preActivityRisks: [
      {
        category: MetricCategoryNames.INFRASTRUCTURE as CategoryRisk['category'],
        risk: 55
      },
      {
        category: MetricCategoryNames.ERRORS as CategoryRisk['category'],
        risk: 25
      },
      {
        category: MetricCategoryNames.PERFORMANCE as CategoryRisk['category'],
        risk: 30
      }
    ],
    progressPercentage: 43,
    activityStartTime: new Date().getTime(),
    status: 'IN_PROGRESS',
    postActivityRisks: [
      {
        category: MetricCategoryNames.INFRASTRUCTURE as CategoryRisk['category'],
        risk: 55
      },
      {
        category: MetricCategoryNames.ERRORS as CategoryRisk['category'],
        risk: 25
      },
      {
        category: MetricCategoryNames.PERFORMANCE as CategoryRisk['category'],
        risk: 30
      }
    ]
  }
]

const EmptyCategoryRiskArray = [
  {
    category: MetricCategoryNames.ERRORS as CategoryRisk['category'],
    risk: -1
  },
  {
    category: MetricCategoryNames.PERFORMANCE as CategoryRisk['category'],
    risk: -1
  },
  {
    category: MetricCategoryNames.INFRASTRUCTURE as CategoryRisk['category'],
    risk: -1
  }
]

function activityTypeToIcon(activityType: ActivityVerificationResultDTO['activityType']): IconName {
  switch (activityType) {
    case 'DEPLOYMENT':
      return 'nav-cd'
    case 'INFRASTRUCTURE':
      return 'service-kubernetes'
    case 'CUSTOM':
      return 'wrench'
    default:
      return 'custom-service'
  }
}

function ActivityVerificationProgressWithRisk(props: ActivityVerificationProgressWithRiskProps): JSX.Element {
  const { progressPercentage, overallRisk = 0, status, remainingTime, activityStartTime } = props
  let progressStatus = ''
  if (!isNumber(progressPercentage)) {
    progressStatus = ''
  } else if (progressPercentage === 0 && (status === 'IN_PROGRESS' || status === 'NOT_STARTED')) {
    progressStatus = i18n.verificationProgressText.initiated
  } else if ((progressPercentage < 100 && status !== 'IN_PROGRESS') || progressPercentage === 100) {
    progressStatus = `${i18n.verificationProgressText.verification} ${
      status === 'VERIFICATION_PASSED' ? i18n.verificationProgressText.passed : i18n.verificationProgressText.failed
    } (${i18n.verificationProgressText.riskScore}: ${overallRisk})`
  } else if (progressPercentage < 100) {
    progressStatus = `${i18n.verificationProgressText.inProgress} (${
      remainingTime ? Math.floor(remainingTime / (1000 * 60)) : ''
    } ${i18n.verificationProgressText.remainingTime})`
  }
  return (
    <Container className={css.verificationProgress}>
      <Text color={Color.BLACK} font={{ size: 'small' }}>
        {progressStatus}
      </Text>
      <CVProgressBar value={progressPercentage} riskScore={overallRisk} />
      {activityStartTime && (
        <Text color={Color.GREY_300} font={{ size: 'small' }}>{`${i18n.verificationProgressText.startedOn} ${new Date(
          activityStartTime
        ).toLocaleString()}`}</Text>
      )}
    </Container>
  )
}

export default function ActivityChanges(): JSX.Element {
  const history = useHistory()
  const { projectIdentifier, orgIdentifier, accountId } = useParams()
  const { loading, error, data, refetch: refetchActivities } = useGetRecentActivityVerificationResults({
    queryParams: {
      accountId,
      projectIdentifier: projectIdentifier as string,
      orgIdentifier: orgIdentifier as string,
      size: 3
    }
  })

  if (error?.message) {
    return (
      <ul className={css.activityList}>
        <li className={css.headerRow}>{ACTIVITY_COLUMN_NAMES}</li>
        <NoDataCard
          icon="error"
          iconSize={30}
          message={error.message}
          className={css.noData}
          buttonText={i18n.retryText}
          onClick={() => refetchActivities()}
        />
      </ul>
    )
  }

  if (!loading && !data?.resource?.length) {
    return (
      <ul className={css.activityList}>
        <li className={css.headerRow}>{ACTIVITY_COLUMN_NAMES}</li>
        <NoDataCard
          icon="warning-sign"
          iconSize={30}
          message={i18n.noActivitiesMessaging}
          className={css.noData}
          buttonText={i18n.noActivitiesButtonText}
          onClick={() =>
            history.push(
              routes.toCVDataSources({
                projectIdentifier: projectIdentifier as string,
                orgIdentifier: orgIdentifier as string,
                accountId
              })
            )
          }
        />
      </ul>
    )
  }

  const recentActivities = !loading ? data?.resource : LOADING_SKELETON_DATA
  return (
    <ul className={css.activityList}>
      <li className={css.headerRow}>{ACTIVITY_COLUMN_NAMES}</li>
      {recentActivities?.map(recentActivity => {
        const {
          activityName,
          serviceIdentifier,
          activityType,
          activityStartTime,
          remainingTimeMs,
          status,
          overallRisk,
          progressPercentage,
          preActivityRisks,
          postActivityRisks
        } = recentActivity || {}
        return (
          <li
            key={`${recentActivity.activityType}-${recentActivity.activityName}-${recentActivity.serviceIdentifier}`}
            className={cx(css.dataRow, loading ? Classes.SKELETON : undefined)}
            onClick={() =>
              history.push(
                routes.toCVActivityChangesPage({
                  activityId: recentActivity.activityId as string,
                  projectIdentifier: projectIdentifier as string,
                  orgIdentifier: orgIdentifier as string,
                  accountId
                })
              )
            }
          >
            <ActivityType
              serviceName={serviceIdentifier || ''}
              buildName={activityName || ''}
              iconProps={{ name: activityTypeToIcon(activityType), size: 25 }}
            />
            <MetricCategoriesWithRiskScore
              categoriesWithRiskScores={preActivityRisks || EmptyCategoryRiskArray}
              className={css.dataColumn}
            />
            <Container className={css.columnWrapp}>
              <ActivityVerificationProgressWithRisk
                activityStartTime={activityStartTime}
                status={status}
                overallRisk={overallRisk}
                progressPercentage={progressPercentage}
                remainingTime={remainingTimeMs}
              />
            </Container>
            <MetricCategoriesWithRiskScore
              categoriesWithRiskScores={postActivityRisks || EmptyCategoryRiskArray}
              className={css.dataColumn}
            />
          </li>
        )
      })}
      <Button
        style={{
          margin: '0 auto',
          display: 'block',
          fontSize: 'var(--font-size-small)'
        }}
        minimal
        intent="primary"
      >
        {i18n.viewAllActivities}
      </Button>
    </ul>
  )
}
