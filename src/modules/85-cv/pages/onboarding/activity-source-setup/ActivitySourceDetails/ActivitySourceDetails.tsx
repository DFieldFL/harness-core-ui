import React from 'react'
import { Container, Text, IconName } from '@wings-software/uicore'
import { AddDescriptionAndKVTagsWithIdentifier } from '@common/components/AddDescriptionAndTags/AddDescriptionAndTags'
import { CVSelectionCard } from '@cv/components/CVSelectionCard/CVSelectionCard'
import { useStrings } from 'framework/strings'
import css from './ActivitySourceDetails.module.scss'

interface ActivitySourceDetailsProps {
  heading: string
  iconName: IconName
  iconLabel: string
  iconSize?: number
  isEditMode?: boolean
}

const ActivitySourceDetails: React.FC<ActivitySourceDetailsProps> = props => {
  const { getString } = useStrings()
  return (
    <Container className={css.mainDetails}>
      <Text font={{ size: 'medium' }} margin={{ top: 'large', bottom: 'large' }}>
        {props.heading}
      </Text>
      <CVSelectionCard
        isSelected={true}
        className={css.monitoringCard}
        iconProps={{
          size: props.iconSize ?? 40,
          name: props.iconName
        }}
        cardLabel={props.iconLabel}
        renderLabelOutsideCard={true}
      />
      <AddDescriptionAndKVTagsWithIdentifier
        identifierProps={{
          inputLabel: getString('cv.activitySources.name'),
          isIdentifierEditable: !props.isEditMode
        }}
      />
    </Container>
  )
}

export default ActivitySourceDetails
