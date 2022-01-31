/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useStrings } from 'framework/strings'
import MultiTypeMapInputSet from '@common/components/MultiTypeMapInputSet/MultiTypeMapInputSet'
import MultiTypeListInputSet from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import { MultiTypeList } from '@common/components/MultiTypeList/MultiTypeList'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { shouldRenderRunTimeInputView } from './StepUtils'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface ArtifactoryInputSetProps {
  template?: Record<string, any>
  path?: string
  readonly?: boolean
  formik?: any
  stepViewType: StepViewType
  allowableTypes: MultiTypeInputType[]
}

export const ArtifactoryInputSetCommonField: React.FC<ArtifactoryInputSetProps> = ({
  template,
  path,
  readonly,
  formik,
  stepViewType,
  allowableTypes
}) => {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  const tagsRenderProps = {
    name: `${isEmpty(path) ? '' : `${path}.`}spec.tags`,
    multiTextInputProps: {
      allowableTypes,
      expressions
    },
    multiTypeFieldSelectorProps: {
      label: (
        <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'tags' }}>
          {getString('tagsLabel')}
        </Text>
      )
    },
    disabled: readonly,
    style: { marginBottom: 'var(--spacing-small)' }
  }

  return (
    <>
      {shouldRenderRunTimeInputView(template?.spec?.tags) &&
        (stepViewType === StepViewType.InputSet ? (
          <MultiTypeList {...tagsRenderProps} />
        ) : (
          <MultiTypeListInputSet {...tagsRenderProps} />
        ))}
      {getMultiTypeFromValue(template?.spec?.optimize) === MultiTypeInputType.RUNTIME && (
        <div className={cx(css.formGroup, css.sm)}>
          <FormMultiTypeCheckboxField
            name={`${isEmpty(path) ? '' : `${path}.`}spec.optimize`}
            label={getString('ci.optimize')}
            disabled={readonly}
            multiTypeTextbox={{
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
      {getMultiTypeFromValue(template?.spec?.dockerfile) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.dockerfile`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'dockerfile' }}>
              {getString('pipelineSteps.dockerfileLabel')}
            </Text>
          }
          multiTextInputProps={{
            disabled: readonly,
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.context) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.context`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'context' }}>
              {getString('pipelineSteps.contextLabel')}
            </Text>
          }
          multiTextInputProps={{
            disabled: readonly,
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {shouldRenderRunTimeInputView(template?.spec?.labels) && (
        <MultiTypeMapInputSet
          name={`${isEmpty(path) ? '' : `${path}.`}spec.labels`}
          valueMultiTextInputProps={{
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
            expressions
          }}
          multiTypeFieldSelectorProps={{
            label: (
              <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'labels' }}>
                {getString('pipelineSteps.labelsLabel')}
              </Text>
            ),
            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
          formik={formik}
        />
      )}
      {shouldRenderRunTimeInputView(template?.spec?.buildArgs) && (
        <MultiTypeMapInputSet
          name={`${isEmpty(path) ? '' : `${path}.`}spec.buildArgs`}
          valueMultiTextInputProps={{
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
            expressions
          }}
          multiTypeFieldSelectorProps={{
            label: (
              <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'buildArgs' }}>
                {getString('pipelineSteps.buildArgsLabel')}
              </Text>
            ),
            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
          formik={formik}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.target) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.target`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'target' }}>
              {getString('pipelineSteps.targetLabel')}
            </Text>
          }
          multiTextInputProps={{
            disabled: readonly,
            multiTextInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            }
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
    </>
  )
}
