import React from 'react'
import { Button, ButtonVariation } from '@wings-software/uicore'
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
  return (
    <CardWithOuterTitle>
      <>
        <ChangeSourceTable onEdit={onEdit} value={value} onSuccess={onSuccess} />
        <Button
          icon="plus"
          text={getString('cv.changeSource.addChangeSource')}
          variation={ButtonVariation.LINK}
          onClick={onAddNewChangeSource}
          margin={{ top: 'small' }}
        />
      </>
    </CardWithOuterTitle>
  )
}
