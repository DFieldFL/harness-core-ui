import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { Connectors } from '@connectors/constants'
import { CIStep } from '@ci/components/PipelineSteps/CIStep/CIStep'
import { CIStepOptionalConfig } from '@ci/components/PipelineSteps/CIStep/CIStepOptionalConfig'
import type { ZeroNorthStepProps } from './ZeroNorthStep'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const ZeroNorthStepInputSet: React.FC<ZeroNorthStepProps> = ({ template, path, readonly, stepViewType }) => {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin} style={{ width: '50%' }}>
      <CIStep
        readonly={readonly}
        stepViewType={stepViewType}
        allowableTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]}
        enableFields={{
          ...(getMultiTypeFromValue(template?.description) === MultiTypeInputType.RUNTIME && {
            description: {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && {
            'spec.connectorRef': {
              label: (
                <Text
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ display: 'flex', alignItems: 'center' }}
                  tooltipProps={{ dataTooltipId: 'connector' }}
                >
                  {getString('pipelineSteps.connectorLabel')}
                </Text>
              ),
              type: [Connectors.GCP, Connectors.AWS, Connectors.DOCKER],
              multiTypeProps: {
                allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
              }
            }
          }),
          ...(getMultiTypeFromValue(template?.spec?.image) === MultiTypeInputType.RUNTIME && {
            'spec.image': {
              tooltipId: 'pluginImageInfo',
              multiTextInputProps: {
                placeholder: getString('pluginImagePlaceholder'),
                disabled: readonly,
                multiTextInputProps: {
                  expressions,
                  allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
                }
              }
            }
          })
        }}
        isInputSetView={true}
      />
      <CIStepOptionalConfig
        readonly={readonly}
        enableFields={{
          ...(getMultiTypeFromValue(template?.spec?.privileged) === MultiTypeInputType.RUNTIME && {
            'spec.privileged': {}
          }),
          ...(getMultiTypeFromValue(template?.spec?.settings as string) === MultiTypeInputType.RUNTIME && {
            'spec.settings': {}
          })
        }}
        allowableTypes={[MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]}
        isInputSetView={true}
      />
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} />
    </FormikForm>
  )
}
