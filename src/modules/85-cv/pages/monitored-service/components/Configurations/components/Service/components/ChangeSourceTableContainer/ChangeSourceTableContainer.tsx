/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams } from 'react-router-dom'
import { ButtonVariation } from '@wings-software/uicore'
import RbacButton from '@rbac/components/Button/Button'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import CardWithOuterTitle from '@cv/pages/health-source/common/CardWithOuterTitle/CardWithOuterTitle'
import ChangeSourceTable from '@cv/pages/ChangeSource/ChangeSourceTable/ChangeSourceTable'
import type { ChangeSourceDTO } from 'services/cv'
import { useStrings } from 'framework/strings'

export default function ChangeSourceTableContainer({
  value,
  onEdit,
  onSuccess,
  onAddNewChangeSource
}: {
  value: any
  onSuccess: (data: ChangeSourceDTO[]) => void
  onEdit: (data: any) => void
  onAddNewChangeSource: (data: any) => void
}): JSX.Element {
  const { getString } = useStrings()
  const { projectIdentifier } = useParams<ProjectPathProps>()
  return (
    <CardWithOuterTitle>
      <>
        <ChangeSourceTable onEdit={onEdit} value={value} onSuccess={onSuccess} />
        <RbacButton
          icon="plus"
          text={getString('cv.changeSource.addChangeSource')}
          variation={ButtonVariation.LINK}
          onClick={onAddNewChangeSource}
          margin={{ top: 'small' }}
          permission={{
            permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
            resource: {
              resourceType: ResourceType.MONITOREDSERVICE,
              resourceIdentifier: projectIdentifier
            }
          }}
        />
      </>
    </CardWithOuterTitle>
  )
}
