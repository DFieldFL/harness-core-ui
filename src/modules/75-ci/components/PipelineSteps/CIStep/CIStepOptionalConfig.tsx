/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import isEmpty from 'lodash/isEmpty'
import cx from 'classnames'
import { Color, Container, Layout, MultiTypeInputType, Text } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { StringsMap } from 'stringTypes'
import { FormMultiTypeCheckboxField } from '@common/components/MultiTypeCheckbox/MultiTypeCheckbox'
import { MultiTypeTextField, MultiTypeTextProps } from '@common/components/MultiTypeText/MultiTypeText'
import MultiTypeMap from '@common/components/MultiTypeMap/MultiTypeMap'
import { MultiTypeMapInputSet } from '@common/components/MultiTypeMapInputSet/MultiTypeMapInputSet'
import MultiTypeList from '@common/components/MultiTypeList/MultiTypeList'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import { ArchiveFormatOptions } from '../../../constants/Constants'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

interface CIStepOptionalConfigProps {
  readonly?: boolean
  enableFields: {
    [key: string]: { [key: string]: any }
  }
  allowableTypes: MultiTypeInputType[]
  stepViewType: StepViewType
  path?: string
}

export const getOptionalSubLabel = (
  tooltip: string,
  getString: (key: keyof StringsMap, vars?: Record<string, any> | undefined) => string
) => (
  <Text
    tooltipProps={tooltip ? { dataTooltipId: tooltip } : {}}
    className={css.inpLabel}
    color={Color.GREY_400}
    font={{ size: 'small', weight: 'semi-bold' }}
    style={{ textTransform: 'capitalize' }}
  >
    {getString?.('common.optionalLabel')}
  </Text>
)

export const CIStepOptionalConfig: React.FC<CIStepOptionalConfigProps> = props => {
  const { readonly, enableFields, allowableTypes, stepViewType, path } = props
  const { getString } = useStrings()
  const { expressions } = useVariablesExpression()
  const prefix = isEmpty(path) ? '' : `${path}.`

  const stepCss = stepViewType === StepViewType.DeploymentForm ? css.sm : css.lg

  const buildArgsRenderCommonProps = {
    name: `${prefix}spec.buildArgs`,
    valueMultiTextInputProps: { expressions, allowableTypes },
    multiTypeFieldSelectorProps: {
      label: (
        <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
          <Text
            style={{ display: 'flex', alignItems: 'center' }}
            className={css.inpLabel}
            color={Color.GREY_800}
            font={{ size: 'small', weight: 'semi-bold' }}
          >
            {getString('pipelineSteps.buildArgsLabel')}
          </Text>
          &nbsp;
          {getOptionalSubLabel('buildArgs', getString)}
        </Layout.Horizontal>
      )
    },
    disabled: readonly
  }

  const renderMultiTypeTextField = React.useCallback(
    ({
      name,
      tooltipId,
      labelKey,
      inputProps
    }: {
      name: string
      tooltipId: string
      labelKey: keyof StringsMap
      inputProps: MultiTypeTextProps['multiTextInputProps']
    }) => (
      <MultiTypeTextField
        name={name}
        label={
          <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
            <Text
              margin={{ top: 'small' }}
              className={css.inpLabel}
              color={Color.GREY_600}
              font={{ size: 'small', weight: 'semi-bold' }}
            >
              {getString(labelKey)}
            </Text>
            &nbsp;
            {getOptionalSubLabel(tooltipId, getString)}
          </Layout.Horizontal>
        }
        multiTextInputProps={inputProps}
      />
    ),
    []
  )

  const renderMultiTypeCheckboxField = React.useCallback(
    ({ name, tooltipId, labelKey }: { name: string; tooltipId: string; labelKey: keyof StringsMap }) => (
      <FormMultiTypeCheckboxField
        name={name}
        label={getString(labelKey)}
        multiTypeTextbox={{
          expressions,
          allowableTypes,
          disabled: readonly
        }}
        tooltipProps={{ dataTooltipId: tooltipId }}
        disabled={readonly}
      />
    ),
    []
  )

  const renderMultiTypeList = React.useCallback(
    ({
      name,
      tooltipId,
      labelKey,
      placeholderKey,
      allowedTypes
    }: {
      name: string
      tooltipId: string
      labelKey: keyof StringsMap
      placeholderKey?: keyof StringsMap
      allowedTypes?: MultiTypeInputType[]
    }) => (
      <MultiTypeList
        name={name}
        placeholder={placeholderKey ? getString(placeholderKey) : ''}
        multiTextInputProps={{
          expressions
        }}
        multiTypeFieldSelectorProps={{
          label: (
            <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
              <Text
                style={{ display: 'flex', alignItems: 'center' }}
                className={css.inpLabel}
                color={Color.GREY_800}
                font={{ size: 'small', weight: 'semi-bold' }}
              >
                {getString(labelKey)}
              </Text>
              &nbsp;
              {getOptionalSubLabel(tooltipId, getString)}
            </Layout.Horizontal>
          ),
          allowedTypes: allowedTypes
        }}
        disabled={readonly}
      />
    ),
    []
  )

  return (
    <>
      {!enableFields['spec.privileged']?.shouldHide &&
      Object.prototype.hasOwnProperty.call(enableFields, 'spec.privileged') ? (
        <div className={cx(css.formGroup, css.sm)}>
          {renderMultiTypeCheckboxField({
            name: `${prefix}spec.privileged`,
            tooltipId: 'privileged',
            labelKey: 'ci.privileged'
          })}
        </div>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.settings') ? (
        <Container className={cx(css.formGroup, css.bottomMargin5)}>
          <MultiTypeMap
            name={`${prefix}spec.settings`}
            valueMultiTextInputProps={{ expressions, allowableTypes }}
            multiTypeFieldSelectorProps={{
              label: (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text className={css.inpLabel} color={Color.GREY_800} font={{ size: 'small', weight: 'semi-bold' }}>
                    {getString('settingsLabel')}
                  </Text>
                  &nbsp;
                  {getOptionalSubLabel('pluginSettings', getString)}
                </Layout.Horizontal>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.reportPaths') ? (
        <Container className={cx(css.formGroup, stepCss)}>
          {renderMultiTypeList({
            name: `${prefix}spec.reportPaths`,
            placeholderKey: 'pipelineSteps.reportPathsPlaceholder',
            labelKey: 'pipelineSteps.reportPathsLabel',
            tooltipId: 'reportPaths',
            allowedTypes: allowableTypes.filter(type => type !== MultiTypeInputType.RUNTIME)
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.envVariables') ? (
        <Container className={cx(css.formGroup, stepCss)}>
          <MultiTypeMap
            name={`${prefix}spec.envVariables`}
            valueMultiTextInputProps={{ expressions, allowableTypes }}
            multiTypeFieldSelectorProps={{
              label: (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text
                    style={{ display: 'flex', alignItems: 'center' }}
                    className={css.inpLabel}
                    color={Color.GREY_800}
                    font={{ size: 'small', weight: 'semi-bold' }}
                  >
                    {getString('environmentVariables')}
                  </Text>
                  &nbsp;
                  {getOptionalSubLabel(enableFields['spec.envVariables'].tooltipId, getString)}
                </Layout.Horizontal>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.outputVariables') ? (
        <Container className={cx(css.formGroup, stepCss)}>
          {renderMultiTypeList({
            name: `${prefix}spec.outputVariables`,
            labelKey: 'pipelineSteps.outputVariablesLabel',
            tooltipId: 'outputVariables',
            allowedTypes: allowableTypes.filter(type => type !== MultiTypeInputType.RUNTIME)
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.entrypoint') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeList({
            name: `${prefix}spec.entrypoint`,
            labelKey: 'entryPointLabel',
            tooltipId: 'dependencyEntryPoint'
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.args') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeList({
            name: `${prefix}spec.args`,
            labelKey: 'argsLabel',
            tooltipId: 'dependencyArgs'
          })}
        </Container>
      ) : null}
      {!enableFields['spec.optimize']?.shouldHide &&
      Object.prototype.hasOwnProperty.call(enableFields, 'spec.optimize') ? (
        <div className={cx(css.formGroup, css.sm)}>
          {renderMultiTypeCheckboxField({
            name: `${prefix}spec.optimize`,
            tooltipId: 'optimize',
            labelKey: 'ci.optimize'
          })}
        </div>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.dockerfile') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.dockerfile`,
            tooltipId: 'dockerfile',
            labelKey: 'pipelineSteps.dockerfileLabel',
            inputProps: {
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.context') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.context`,
            tooltipId: 'context',
            labelKey: 'pipelineSteps.contextLabel',
            inputProps: {
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.labels') ? (
        <Container className={cx(css.formGroup, css.bottomMargin5)}>
          <MultiTypeMap
            name={`${prefix}spec.labels`}
            valueMultiTextInputProps={{ expressions, allowableTypes }}
            multiTypeFieldSelectorProps={{
              label: (
                <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                  <Text
                    style={{ display: 'flex', alignItems: 'center' }}
                    className={css.inpLabel}
                    color={Color.GREY_800}
                    font={{ size: 'small', weight: 'semi-bold' }}
                  >
                    {getString('pipelineSteps.labelsLabel')}
                  </Text>
                  &nbsp;
                  {getOptionalSubLabel('labels', getString)}
                </Layout.Horizontal>
              )
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.buildArgs') ? (
        <Container className={cx(css.formGroup, css.bottomMargin5)}>
          {stepViewType === StepViewType.Edit ? (
            <MultiTypeMap {...buildArgsRenderCommonProps} />
          ) : (
            <MultiTypeMapInputSet {...buildArgsRenderCommonProps} />
          )}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.endpoint') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.endpoint`,
            tooltipId: 'endpoint',
            labelKey: 'pipelineSteps.endpointLabel',
            inputProps: {
              placeholder: getString('pipelineSteps.endpointPlaceholder'),
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.target') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.target`,
            tooltipId: enableFields['spec.target'].tooltipId,
            labelKey: 'pipelineSteps.targetLabel',
            inputProps: {
              placeholder: getString('pipelineSteps.artifactsTargetPlaceholder'),
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly
            }
          })}
        </Container>
      ) : null}
      {!enableFields['spec.remoteCacheImage']?.shouldHide &&
      Object.prototype.hasOwnProperty.call(enableFields, 'spec.remoteCacheImage') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.remoteCacheImage`,
            tooltipId: 'gcrRemoteCache',
            labelKey: 'ci.remoteCacheImage.label',
            inputProps: {
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly,
              placeholder: getString('ci.remoteCacheImage.placeholder')
            }
          })}
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.archiveFormat') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          <MultiTypeSelectField
            name={`${prefix}spec.archiveFormat`}
            label={
              <Layout.Horizontal flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
                <Text
                  margin={{ top: 'small' }}
                  className={css.inpLabel}
                  color={Color.GREY_600}
                  font={{ size: 'small', weight: 'semi-bold' }}
                >
                  {getString('archiveFormat')}
                </Text>
                &nbsp;
                {getOptionalSubLabel('archiveFormat', getString)}
              </Layout.Horizontal>
            }
            multiTypeInputProps={{
              selectItems: ArchiveFormatOptions,
              multiTypeInputProps: {
                expressions,
                allowableTypes: allowableTypes.filter(
                  type => type !== MultiTypeInputType.RUNTIME && type !== MultiTypeInputType.EXPRESSION
                )
              },
              disabled: readonly
            }}
            disabled={readonly}
          />
        </Container>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.override') ? (
        <div className={cx(css.formGroup, css.sm, css.bottomMargin5)}>
          {renderMultiTypeCheckboxField({
            name: `${prefix}spec.override`,
            tooltipId: 'saveCacheOverride',
            labelKey: 'override'
          })}
        </div>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.pathStyle') ? (
        <div className={cx(css.formGroup, css.sm)}>
          {renderMultiTypeCheckboxField({
            name: `${prefix}spec.pathStyle`,
            tooltipId: 'pathStyle',
            labelKey: 'pathStyle'
          })}
        </div>
      ) : null}
      {Object.prototype.hasOwnProperty.call(enableFields, 'spec.failIfKeyNotFound') ? (
        <div className={cx(css.formGroup, css.sm, css.bottomMargin1)}>
          {renderMultiTypeCheckboxField({
            name: `${prefix}spec.failIfKeyNotFound`,
            tooltipId: 'failIfKeyNotFound',
            labelKey: 'failIfKeyNotFound'
          })}
        </div>
      ) : null}
      {!enableFields['spec.remoteCacheRepo']?.shouldHide &&
      Object.prototype.hasOwnProperty.call(enableFields, 'spec.remoteCacheRepo') ? (
        <Container className={cx(css.formGroup, stepCss, css.bottomMargin5)}>
          {renderMultiTypeTextField({
            name: `${prefix}spec.remoteCacheRepo`,
            tooltipId: 'dockerHubRemoteCache',
            labelKey: 'ci.remoteCacheRepository.label',
            inputProps: {
              multiTextInputProps: { expressions, allowableTypes },
              disabled: readonly,
              placeholder: getString('ci.remoteCacheImage.placeholder')
            }
          })}
        </Container>
      ) : null}
    </>
  )
}
