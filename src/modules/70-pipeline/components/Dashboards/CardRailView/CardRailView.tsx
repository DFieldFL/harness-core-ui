import React, { useRef, useEffect, useState } from 'react'
import { Container, Link, Text, Icon, Color } from '@wings-software/uicore'
import classnames from 'classnames'
import { Classes } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import EmptyRepositories from './EmptyRepositories.svg'
import EmptyFailedBuilds from './EmptyFailedBuilds.svg'
import EmptyActiveBuilds from './EmptyActiveBuilds.svg'
import RepoIconUrl from './RepoIcon.svg'
import FailedBuildIconUrl from './FailedBuildIcon.svg'
import NoServices from '../images/NoServices.svg'
import NoDeployments from '../images/NoDeployments.svg'
import Active from './Active.svg'
import styles from './CardRailView.module.scss'

export interface CardRailViewProps {
  contentType:
    | 'REPOSITORY'
    | 'FAILED_BUILD'
    | 'ACTIVE_BUILD'
    | 'WORKLOAD'
    | 'FAILED_DEPLOYMENT'
    | 'ACTIVE_DEPLOYMENT'
    | 'PENDING_DEPLOYMENT'
  titleSideContent?: React.ReactNode
  isLoading?: boolean
  onShowAll?(): void
  isCIPage?: boolean
  children?: React.ReactNode
}

export default function CardRailView({
  contentType,
  titleSideContent,
  isLoading,
  onShowAll,
  children,
  isCIPage
}: CardRailViewProps) {
  const { getString } = useStrings()
  const contentRef = useRef<HTMLDivElement>(null)
  const [scrollbarVisible, setScrollbarVisible] = useState(false)
  const titles = {
    REPOSITORY: getString('repositories'),
    FAILED_BUILD: getString('pipeline.dashboards.failedBuilds'),
    ACTIVE_BUILD: getString('pipeline.dashboards.activeBuilds'),
    WORKLOAD: getString('services'),
    FAILED_DEPLOYMENT: getString('pipeline.dashboards.failedDeployments'),
    ACTIVE_DEPLOYMENT: getString('pipeline.dashboards.activeDeployments'),
    PENDING_DEPLOYMENT: getString('pipeline.dashboards.pendingDeployments')
  }

  const icons = {
    REPOSITORY: isCIPage ? <img height={15} width={16} src={RepoIconUrl} /> : RepoIconUrl,
    FAILED_BUILD: <img src={FailedBuildIconUrl} />,
    ACTIVE_BUILD: <Icon name="ci-pending-build" className={styles.pendingBuildIcon} />,
    WORKLOAD: <img height={15} width={16} src={RepoIconUrl} />,
    FAILED_DEPLOYMENT: <Icon name="execution-warning" size={20} color={Color.RED_500} />,
    ACTIVE_DEPLOYMENT: <img src={Active} className={styles.activeDepIcon} />,
    PENDING_DEPLOYMENT: <Icon name="play" size={20} color={Color.GREEN_500} />
  }

  const emptyIcons = {
    REPOSITORY: EmptyRepositories,
    FAILED_BUILD: EmptyFailedBuilds,
    ACTIVE_BUILD: EmptyActiveBuilds,
    WORKLOAD: NoServices,
    FAILED_DEPLOYMENT: NoDeployments,
    ACTIVE_DEPLOYMENT: NoDeployments,
    PENDING_DEPLOYMENT: NoDeployments
  }

  const emptyMsg = {
    REPOSITORY: getString('pipeline.dashboards.noRepositories'),
    FAILED_BUILD: getString('pipeline.dashboards.noFailedBuilds'),
    ACTIVE_BUILD: getString('pipeline.dashboards.noActiveBuilds'),
    WORKLOAD: getString('pipeline.dashboards.noWorkloads'),
    FAILED_DEPLOYMENT: getString('pipeline.dashboards.noFailedDeployments'),
    ACTIVE_DEPLOYMENT: getString('pipeline.dashboards.noActiveDeployments'),
    PENDING_DEPLOYMENT: getString('pipeline.dashboards.noPendingDeployments')
  }

  const onResize = () => {
    if (contentRef.current) {
      const visible = contentRef.current.scrollHeight > contentRef.current.offsetHeight
      if (scrollbarVisible !== visible) {
        setScrollbarVisible(visible)
      }
    }
  }

  useEffect(() => {
    onResize()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  })

  const isEmpty = !isLoading && React.Children.count(children) === 0
  return (
    <Container className={styles.main}>
      <Container className={styles.header}>
        <Container className={styles.headerTitle}>
          {icons[contentType]}
          <Text className={styles.title} tooltipProps={{ dataTooltipId: `overview_${contentType}` }}>
            {titles[contentType]} ({React.Children.count(children)})
          </Text>
        </Container>
        {titleSideContent}
      </Container>
      <Container
        ref={contentRef}
        padding={scrollbarVisible ? { right: 'xsmall' } : undefined}
        className={classnames(styles.content, { [styles.contentEmpty]: isEmpty })}
      >
        {isEmpty && (
          <Container className={styles.emptyView}>
            <Container className={styles.emptyViewCard}>
              <img src={emptyIcons[contentType]} />
              <Text>{emptyMsg[contentType]}</Text>
            </Container>
          </Container>
        )}
        {isLoading && (
          <>
            <Container height={60} className={Classes.SKELETON} />
            <Container height={60} className={Classes.SKELETON} />
            <Container height={60} className={Classes.SKELETON} />
          </>
        )}
        {!isEmpty && !isLoading && children}
      </Container>
      {onShowAll && !isEmpty && !isLoading && (
        <Link className={styles.showMoreLink} withoutHref onClick={onShowAll}>
          {getString('seeAll')}
        </Link>
      )}
    </Container>
  )
}
