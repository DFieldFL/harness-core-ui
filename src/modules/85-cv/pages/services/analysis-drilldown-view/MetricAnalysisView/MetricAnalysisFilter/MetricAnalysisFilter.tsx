import React, { useState } from 'react'
import { Container, Text, Select, Color, SelectOption, SelectProps } from '@wings-software/uikit'
import i18n from './MetricAnalysisFilter.i18n'
import css from './MetricAnalysisFilter.module.scss'

export const MetricAnalysisFilterType = {
  ANOMALOUS: 'ANOMALOUS',
  ALL_METRICS: 'ALL_METRICS'
}

export const FILTER_OPTIONS: SelectOption[] = [
  {
    label: i18n.filterByDropdownOptionLabels.anomalous,
    value: MetricAnalysisFilterType.ANOMALOUS
  },
  {
    label: i18n.filterByDropdownOptionLabels.allMetrics,
    value: MetricAnalysisFilterType.ALL_METRICS
  }
]

interface MetricAnalysisFilterProps {
  onChangeFilter?: (updatedOption: string) => void
  defaultFilterValue?: SelectOption
}

export function MetricAnalysisFilter(props: MetricAnalysisFilterProps): JSX.Element {
  const { onChangeFilter, defaultFilterValue } = props
  const [selectedOption, setSelectedOption] = useState(defaultFilterValue || FILTER_OPTIONS[0])
  return (
    <Container className={css.main}>
      <Container className={css.filterOptionContainer}>
        <Text color={Color.BLACK} font={{ size: 'small' }}>
          {i18n.filterText}
        </Text>
        <Select
          items={FILTER_OPTIONS}
          value={selectedOption}
          className={css.filterByOptions}
          onChange={(selectedItem: SelectOption) => {
            if (selectedItem?.value !== selectedOption?.value) {
              setSelectedOption(selectedItem)
              onChangeFilter?.(selectedItem.value as string)
            }
          }}
          size={'small' as SelectProps['size']}
        />
      </Container>
      <input className={css.filterInput} placeholder={i18n.searchInputPlaceholderText} />
    </Container>
  )
}
