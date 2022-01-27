/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { FC, useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Button, ButtonVariation, FontVariation, Heading, PageError, SelectOption } from '@wings-software/uicore'
import { FieldArray } from 'formik'
import { useStrings } from 'framework/strings'
import { useGetAllTargetAttributes, Clause, Segment } from 'services/cf'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { FeatureFlagBucketBy, getErrorMessage } from '@cf/utils/CFUtils'
import RuleRow from './RuleRow'

import css from './TargetBasedOnConditions.module.scss'
import sectionCss from './Section.module.scss'

export interface TargetBasedOnConditionsProps {
  targetGroup: Segment
  values: { rules: Clause[] }
}

const TargetBasedOnConditions: FC<TargetBasedOnConditionsProps> = ({ targetGroup, values }) => {
  const { getString } = useStrings()

  const {
    accountId: accountIdentifier,
    orgIdentifier: org,
    projectIdentifier: project
  } = useParams<Record<string, string>>()

  const {
    data: targetAttributes,
    loading,
    error,
    refetch: refetchTargetAttributes
  } = useGetAllTargetAttributes({
    queryParams: {
      environment: targetGroup.environment as string,
      accountIdentifier,
      org,
      project
    }
  })

  const targetAttributeItems = useMemo<SelectOption[]>(
    () => [
      {
        label: getString('name'),
        value: FeatureFlagBucketBy.NAME
      },
      {
        label: getString('identifier'),
        value: FeatureFlagBucketBy.IDENTIFIER
      },
      ...(targetAttributes || [])
        .filter(attribute => attribute !== FeatureFlagBucketBy.NAME && attribute !== FeatureFlagBucketBy.IDENTIFIER)
        .sort((a, b) => a.localeCompare(b))
        .map(attribute => ({ label: attribute, value: attribute }))
    ],
    [targetAttributes]
  )

  return (
    <section className={sectionCss.section}>
      {loading && <ContainerSpinner />}
      {error && <PageError message={getErrorMessage(error)} onClick={async () => await refetchTargetAttributes()} />}
      {targetAttributes && (
        <>
          <Heading level={3} font={{ variation: FontVariation.FORM_SUB_SECTION }}>
            {getString('cf.segmentDetail.targetBasedOnCondition')}
          </Heading>

          <FieldArray
            name="rules"
            render={arrayHelpers => (
              <>
                {values.rules.length > 0 && (
                  <div className={css.rows} data-testid="rule-rows">
                    {values.rules.map((_, index) => (
                      <RuleRow
                        key={index}
                        namePrefix={`${arrayHelpers.name}[${index}]`}
                        targetAttributeItems={targetAttributeItems}
                        onDelete={() => arrayHelpers.remove(index)}
                      />
                    ))}
                  </div>
                )}
                <Button
                  text={getString('cf.segmentDetail.addRule')}
                  variation={ButtonVariation.LINK}
                  icon="plus"
                  onClick={e => {
                    e.preventDefault()
                    arrayHelpers.push({
                      id: '',
                      attribute: '',
                      op: '',
                      values: [],
                      negate: false
                    })
                  }}
                />
              </>
            )}
          />
        </>
      )}
    </section>
  )
}

export default TargetBasedOnConditions
