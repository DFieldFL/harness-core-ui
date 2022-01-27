/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState, useEffect, FormEvent } from 'react'
import { Color, Layout, Select, SelectOption, Text } from '@wings-software/uicore'
import { Radio, RadioGroup } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import type { RetryInfo } from 'services/pipeline-ng'
import type { ParallelStageOption } from './RetryPipeline'
import css from './RetryPipeline.module.scss'

interface SelectStagetoRetryProps {
  stageResponse?: RetryInfo
  selectedStage: ParallelStageOption | null
  isParallelStage: boolean
  isAllStage: boolean
  isLastIndex: boolean
  handleStageChange: (value: ParallelStageOption) => void
  handleStageType: (e: FormEvent<HTMLInputElement>) => void
}

const SelectStagetoRetry = ({
  stageResponse,
  selectedStage,
  isParallelStage,
  isAllStage,
  isLastIndex,
  handleStageChange,
  handleStageType
}: SelectStagetoRetryProps): React.ReactElement | null => {
  const { getString } = useStrings()
  const [stageList, setStageList] = useState<SelectOption[]>([])

  useEffect(() => {
    if (stageResponse?.groups?.length) {
      const stageListValues = stageResponse.groups.map((stageGroup, idx) => {
        if (stageGroup.info?.length === 1) {
          return { label: stageGroup.info[0].name, value: stageGroup.info[0].identifier, isLastIndex: idx }
        } else {
          const parallelStagesLabel = stageGroup.info?.map(stageName => stageName.name).join(' | ')
          const parallelStagesValue = stageGroup.info?.map(stageName => stageName.identifier).join(' | ')
          return {
            label: parallelStagesLabel,
            value: parallelStagesValue,
            isLastIndex: idx
          }
        }
      })
      setStageList(stageListValues as SelectOption[])
    }
  }, [stageResponse])

  return (
    <div className={css.selectStageWrapper}>
      <Text
        tooltipProps={{ dataTooltipId: 'selectRetryStageText' }}
        color={Color.GREY_700}
        font={{ size: 'small', weight: 'semi-bold' }}
      >
        {stageResponse?.errorMessage ? stageResponse.errorMessage : getString('pipeline.stagetoRetryFrom')}
      </Text>
      {!!stageResponse?.groups?.length && (
        <Layout.Horizontal
          margin={{ top: 'medium' }}
          spacing="medium"
          flex={{ justifyContent: 'flex-start', alignItems: 'flex-end' }}
        >
          <Select
            name={'selectRetryStage'}
            value={selectedStage}
            items={stageList}
            onChange={handleStageChange as any}
            className={css.selectStage}
          />
          {isParallelStage && isLastIndex && (
            <RadioGroup inline selectedValue={isAllStage ? 'allparallel' : 'failedStages'} onChange={handleStageType}>
              <Radio label={getString('pipeline.runAllParallelstages')} value="allparallel" />
              <Radio label={getString('pipeline.runFailedStages')} value="failedStages" />
            </RadioGroup>
          )}
        </Layout.Horizontal>
      )}
    </div>
  )
}

export default SelectStagetoRetry
