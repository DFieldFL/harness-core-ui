/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Text, SelectOption, MultiTypeInputType, Container, Layout, Color } from '@wings-software/uicore'
import cx from 'classnames'
import { connect } from 'formik'
import type { K8sDirectInfraYaml } from 'services/ci'
import { useStrings } from 'framework/strings'
import { FormMultiTypeDurationField } from '@common/components/MultiTypeDuration/MultiTypeDuration'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { useVariablesExpression } from '../PipelineStudio/PiplineHooks/useVariablesExpression'
import type { PullOption } from '../PipelineSteps/Steps/StepsTypes'
import css from '../PipelineSteps/Steps/Steps.module.scss'

export type PullOptions = { label: string; value: PullOption }[]

export const usePullOptions: () => PullOptions = () => {
  const { getString } = useStrings()
  return [
    { label: getString('pipelineSteps.pullIfNotExistsLabel'), value: 'ifNotExists' },
    { label: getString('pipelineSteps.pullNeverLabel'), value: 'never' },
    { label: getString('pipelineSteps.pullAlwaysLabel'), value: 'always' }
  ]
}

export const GetShellOptions = (buildInfrastructureType?: K8sDirectInfraYaml['type']): SelectOption[] => {
  const { getString } = useStrings()
  const fixedOptions = [
    { label: getString('common.bash'), value: 'Bash' },
    { label: getString('common.shell'), value: 'Sh' }
  ]
  return buildInfrastructureType === 'VM'
    ? [...fixedOptions, { label: getString('common.powershell'), value: 'Powershell' }]
    : fixedOptions
}

export const GetImagePullPolicyOptions: () => SelectOption[] = () => {
  const { getString } = useStrings()
  return [
    { label: getString('pipelineSteps.pullAlwaysLabel'), value: 'Always' },
    { label: getString('pipeline.stepCommonFields.ifNotPresent'), value: 'IfNotPresent' },
    { label: getString('pipelineSteps.pullNeverLabel'), value: 'Never' }
  ]
}

interface StepCommonFieldsProps {
  withoutTimeout?: boolean
  disabled?: boolean
  enableFields?: string[]
  allowableTypes: MultiTypeInputType[]
  buildInfrastructureType: K8sDirectInfraYaml['type']
}

const StepCommonFields = ({
  withoutTimeout,
  disabled,
  enableFields = [],
  allowableTypes,
  buildInfrastructureType
}: StepCommonFieldsProps): JSX.Element => {
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()

  const isVMBuildInfraType = buildInfrastructureType === 'VM'

  return (
    <>
      {enableFields.includes('spec.imagePullPolicy') && (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeSelectField
            name="spec.imagePullPolicy"
            label={
              <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                  {getString('pipelineSteps.pullLabel')}
                </Text>
                &nbsp;
                <Text
                  tooltipProps={{ dataTooltipId: 'imagePullPolicy' }}
                  className={css.inpLabel}
                  color={Color.GREY_400}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {getString('common.optionalLabel')}
                </Text>
              </Layout.Horizontal>
            }
            multiTypeInputProps={{
              selectItems: GetImagePullPolicyOptions(),
              placeholder: getString('select'),
              multiTypeInputProps: {
                expressions,
                selectProps: { addClearBtn: true, items: GetImagePullPolicyOptions() },
                allowableTypes: [MultiTypeInputType.FIXED]
              },
              disabled
            }}
            disabled={disabled}
            configureOptionsProps={{ variableName: 'spec.imagePullPolicy' }}
          />
        </Container>
      )}
      {enableFields.includes('spec.shell') && (
        <Container className={cx(css.formGroup, css.lg, css.bottomMargin5)}>
          <MultiTypeSelectField
            name="spec.shell"
            label={
              <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                  {getString('common.shell')}
                </Text>
                &nbsp;
                <Text
                  tooltipProps={{ dataTooltipId: 'shell' }}
                  className={css.inpLabel}
                  color={Color.GREY_400}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {getString('common.optionalLabel')}
                </Text>
              </Layout.Horizontal>
            }
            multiTypeInputProps={{
              selectItems: GetImagePullPolicyOptions(),
              placeholder: getString('select'),
              multiTypeInputProps: {
                expressions,
                selectProps: { addClearBtn: true, items: GetShellOptions(buildInfrastructureType) },
                allowableTypes: [MultiTypeInputType.FIXED]
              },
              disabled
            }}
            disabled={disabled}
            configureOptionsProps={{ variableName: 'spec.shell' }}
          />
        </Container>
      )}
      {!isVMBuildInfraType ? (
        <Container className={cx(css.formGroup, css.lg)}>
          <MultiTypeTextField
            label={
              <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                  {getString('pipeline.stepCommonFields.runAsUser')}
                </Text>
                &nbsp;
                <Text
                  tooltipProps={{ dataTooltipId: 'runAsUser' }}
                  className={css.inpLabel}
                  color={Color.GREY_400}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {getString('common.optionalLabel')}
                </Text>
              </Layout.Horizontal>
            }
            name="spec.runAsUser"
            multiTextInputProps={{
              multiTextInputProps: { expressions },
              disabled,
              placeholder: '1000'
            }}
          />
        </Container>
      ) : null}
      {!isVMBuildInfraType ? (
        <Layout.Vertical className={cx(css.bottomMargin5, css.topMargin5)} spacing="medium">
          <Text
            className={css.inpLabel}
            color={Color.GREY_600}
            font={{ size: 'small', weight: 'semi-bold' }}
            tooltipProps={{ dataTooltipId: 'setContainerResources' }}
          >
            {getString('pipelineSteps.setContainerResources')}
          </Text>
          <Layout.Horizontal spacing="small">
            <MultiTypeTextField
              name="spec.limitMemory"
              label={
                <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                  <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                    {getString('pipelineSteps.limitMemoryLabel')}
                  </Text>
                  &nbsp;
                  <Text
                    tooltipProps={{ dataTooltipId: 'limitMemory' }}
                    className={css.inpLabel}
                    color={Color.GREY_400}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {getString('common.optionalLabel')}
                  </Text>
                </Layout.Horizontal>
              }
              multiTextInputProps={{
                multiTextInputProps: {
                  expressions,
                  allowableTypes: allowableTypes.filter(type => type !== MultiTypeInputType.RUNTIME)
                },
                disabled
              }}
              configureOptionsProps={{ variableName: 'spec.limit.memory' }}
              style={{ flexGrow: 1, flexBasis: '50%' }}
            />
            <MultiTypeTextField
              name="spec.limitCPU"
              label={
                <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                  <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                    {getString('pipelineSteps.limitCPULabel')}
                  </Text>
                  &nbsp;
                  <Text
                    tooltipProps={{ dataTooltipId: 'limitCPULabel' }}
                    className={css.inpLabel}
                    color={Color.GREY_400}
                    font={{ size: 'small', weight: 'semi-bold' }}
                    style={{ textTransform: 'capitalize' }}
                  >
                    {getString('common.optionalLabel')}
                  </Text>
                </Layout.Horizontal>
              }
              multiTextInputProps={{
                multiTextInputProps: { expressions },
                disabled
              }}
              configureOptionsProps={{ variableName: 'spec.limit.cpu' }}
              style={{ flexGrow: 1, flexBasis: '50%' }}
            />
          </Layout.Horizontal>
        </Layout.Vertical>
      ) : null}
      {!withoutTimeout ? (
        <Container className={cx(css.formGroup, css.sm, css.bottomMargin5)}>
          <FormMultiTypeDurationField
            className={css.removeBpLabelMargin}
            name="timeout"
            multiTypeDurationProps={{ expressions, allowableTypes }}
            label={
              <Layout.Horizontal style={{ display: 'flex', alignItems: 'baseline' }}>
                <Text className={css.inpLabel} color={Color.GREY_600} font={{ size: 'small', weight: 'semi-bold' }}>
                  {getString('pipelineSteps.timeoutLabel')}
                </Text>
                &nbsp;
                <Text
                  tooltipProps={{ dataTooltipId: 'timeout' }}
                  className={css.inpLabel}
                  color={Color.GREY_400}
                  font={{ size: 'small', weight: 'semi-bold' }}
                  style={{ textTransform: 'capitalize' }}
                >
                  {getString('common.optionalLabel')}
                </Text>
              </Layout.Horizontal>
            }
            disabled={disabled}
          />
        </Container>
      ) : null}
    </>
  )
}

export default connect(StepCommonFields)
