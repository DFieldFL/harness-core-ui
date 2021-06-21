import React from 'react'
import { Container, Checkbox, TextInput } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import MenuItemWithDivider from '@ce/common/MenuItemWithDivider/MenuItemWithDivider'
import { COST_FILTER_KEYS, getFiltersLabelName } from '../constants'

import css from '../RecommendationFilters.module.scss'

interface ValuePopoverProps {
  valueMap: Record<string, string[]>
  setCurrentCost: React.Dispatch<React.SetStateAction<number>>
  selectedType: string
  setCurrentFilters: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  currentFilters: Record<string, boolean>
}

const ValuePopover: React.FC<ValuePopoverProps> = ({ valueMap, selectedType, setCurrentFilters, setCurrentCost }) => {
  const { getString } = useStrings()
  const costFiltersLabels = getFiltersLabelName(getString)

  const getValuesToShow: () => JSX.Element[] = () => {
    return valueMap[selectedType].map(item => {
      return (
        <Checkbox
          onClick={() => {
            setCurrentFilters(val => ({
              ...val,
              [item]: !val[item]
            }))
          }}
          key={item}
          className={css.checkbox}
          value={item}
          label={item}
        />
      )
    })
  }

  return (
    <Container padding="medium" className={css.popoverContainer}>
      {COST_FILTER_KEYS.includes(selectedType) ? (
        <>
          <MenuItemWithDivider text={costFiltersLabels[selectedType]} />
          <TextInput
            onChange={e => {
              const target = e.target as any
              setCurrentCost(Number(target.value))
            }}
            type="number"
            className={css.costInput}
            placeholder={getString('ce.recommendation.listPage.filters.enterCost')}
          />
        </>
      ) : (
        <>
          <MenuItemWithDivider text={getString('ce.recommendation.listPage.filters.resourceType')} />
          {getValuesToShow()}
        </>
      )}
    </Container>
  )
}

export default ValuePopover
