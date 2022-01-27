import React, { FC } from 'react'
import { SelectOption, FormInput, ButtonVariation, Button } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { useOperatorsFromYaml } from '@cf/constants'

import css from './RuleRow.module.scss'

export interface RuleRowProps {
  namePrefix: string
  targetAttributeItems: SelectOption[]
  onDelete: () => void
}

const RuleRow: FC<RuleRowProps> = ({ namePrefix, targetAttributeItems, onDelete }) => {
  const { getString } = useStrings()
  const [operators] = useOperatorsFromYaml()

  return (
    <>
      <div className={css.fields}>
        <FormInput.Select
          name={`${namePrefix}.attribute`}
          items={targetAttributeItems}
          selectProps={{ inputProps: { 'aria-label': getString('cf.segmentDetail.attribute') } }}
        />
        <FormInput.Select
          name={`${namePrefix}.op`}
          items={operators}
          selectProps={{ inputProps: { 'aria-label': getString('cf.segmentDetail.operator') } }}
        />
        <FormInput.TagInput
          name={`${namePrefix}.values`}
          itemFromNewTag={tag => tag}
          items={[]}
          tagInputProps={{
            showClearAllButton: true,
            allowNewTag: true,
            showAddTagButton: false,
            inputProps: { 'aria-label': getString('cf.segmentDetail.values') }
          }}
          labelFor={tag => tag as string}
        />
      </div>
      <Button
        onClick={e => {
          e.preventDefault()
          onDelete()
        }}
        icon="trash"
        variation={ButtonVariation.ICON}
        aria-label={getString('cf.segmentDetail.removeRule')}
      />
    </>
  )
}

export default RuleRow
