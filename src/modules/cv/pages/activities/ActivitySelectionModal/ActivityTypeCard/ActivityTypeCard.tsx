import React, { useCallback } from 'react'
import { Card, Container, Icon, IconName, Text, Color } from '@wings-software/uikit'
import css from './ActivityTypeCard.module.scss'
import cx from 'classnames'

interface ActivityTypeCardProps {
  iconName: IconName
  activityType?: string
  activityName: string
  className?: string
  onClick?: (activityName: string) => void
}

export default function ActivityTypeCard(props: ActivityTypeCardProps): JSX.Element {
  const { iconName, activityType, activityName, className, onClick } = props
  const onCardClickCallback = useCallback(() => onClick?.(activityName), [activityName, onClick])
  return (
    <Card className={cx(css.main, className, onClick ? css.cursor : undefined)} onClick={onCardClickCallback}>
      <Container className={css.iconTitleContainer}>
        <Icon name={iconName} />
        <Text className={css.activityType} color={Color.WHITE}>
          {activityType}
        </Text>
      </Container>
      <Text className={css.activityName} color={Color.GREY_200}>
        {activityName}
      </Text>
    </Card>
  )
}
