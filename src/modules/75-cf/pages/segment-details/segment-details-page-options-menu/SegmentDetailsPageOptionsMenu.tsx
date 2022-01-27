/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { ReactElement } from 'react'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useStrings } from 'framework/strings'

export interface SegmentDetailsPageOptionsMenuProps {
  deleteSegmentConfirm: () => void
  activeEnvironment: string
}

const SegmentDetailsPageOptionsMenu = (props: SegmentDetailsPageOptionsMenuProps): ReactElement => {
  const { activeEnvironment, deleteSegmentConfirm } = props
  const { isPlanEnforcementEnabled } = usePlanEnforcement()
  const { getString } = useStrings()

  const planEnforcementProps = isPlanEnforcementEnabled
    ? {
        featuresProps: {
          featuresRequest: {
            featureNames: [FeatureIdentifier.MAUS]
          }
        }
      }
    : undefined

  return (
    <RbacOptionsMenuButton
      items={[
        {
          icon: 'cross',
          text: getString('delete'),
          onClick: deleteSegmentConfirm,
          permission: {
            resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
            permission: PermissionIdentifier.DELETE_FF_TARGETGROUP
          },
          ...planEnforcementProps
        }
      ]}
    />
  )
}

export default SegmentDetailsPageOptionsMenu
