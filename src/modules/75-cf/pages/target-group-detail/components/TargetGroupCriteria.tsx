/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC } from 'react'
import { ButtonVariation, FontVariation, Heading, Layout, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { Segment } from 'services/cf'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'

import useEditTargetGroupCriteriaDialog from '../hooks/useEditTargetGroupCriteriaDialog'
import TargetGroupCriteriaTargetListing from './TargetGroupCriteriaTargetListing'
import TargetGroupCriteriaConditionListing from './TargetGroupCriteriaConditionListing'

import css from './TargetGroupCriteria.module.scss'

export interface TargetGroupCriteriaProps {
  targetGroup: Segment
  reloadTargetGroup: () => void
}

const TargetGroupCriteria: FC<TargetGroupCriteriaProps> = ({ targetGroup, reloadTargetGroup }) => {
  const { getString } = useStrings()
  const { activeEnvironment } = useActiveEnvironment()
  const [openCriteriaDialog] = useEditTargetGroupCriteriaDialog(targetGroup, reloadTargetGroup)

  return (
    <aside className={css.layout}>
      <Layout.Horizontal flex={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
        <Heading level={3} font={{ variation: FontVariation.H5 }}>
          {getString('cf.segmentDetail.criteria')}
        </Heading>
        <RbacButton
          text={getString('edit')}
          variation={ButtonVariation.LINK}
          icon="edit"
          onClick={openCriteriaDialog}
          permission={{
            resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
            permission: PermissionIdentifier.EDIT_FF_TARGETGROUP
          }}
        />
      </Layout.Horizontal>

      <section className={css.section}>
        <Heading level={4} font={{ variation: FontVariation.H6 }}>
          {getString('cf.segmentDetail.specificTargets')}
        </Heading>

        <div className={css.subSection}>
          <Text font={{ variation: FontVariation.FORM_LABEL }}>
            {getString('cf.segmentDetail.includeTheFollowing')}:
          </Text>
          <TargetGroupCriteriaTargetListing targets={targetGroup.included} />
        </div>

        <div className={css.subSection}>
          <Text font={{ variation: FontVariation.FORM_LABEL }}>
            {getString('cf.segmentDetail.excludeTheFollowing')}:
          </Text>
          <TargetGroupCriteriaTargetListing targets={targetGroup.excluded} />
        </div>
      </section>

      <section className={css.section}>
        <Heading level={4} font={{ variation: FontVariation.H6 }}>
          {getString('cf.segmentDetail.targetBasedOnCondition')}
        </Heading>

        <TargetGroupCriteriaConditionListing rules={targetGroup.rules} />
      </section>
    </aside>
  )
}

export default TargetGroupCriteria
