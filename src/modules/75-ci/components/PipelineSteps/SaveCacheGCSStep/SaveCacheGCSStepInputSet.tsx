import React from 'react'
import { Text, getMultiTypeFromValue, MultiTypeInputType, FormikForm } from '@wings-software/uicore'
import { isEmpty } from 'lodash-es'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/strings'
import MultiTypeListInputSet from '@common/components/MultiTypeListInputSet/MultiTypeListInputSet'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import { MultiTypeTextField } from '@common/components/MultiTypeText/MultiTypeText'
import { FormMultiTypeCheckboxField } from '@common/components'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { MultiTypeSelectField } from '@common/components/MultiTypeSelect/MultiTypeSelect'
import StepCommonFieldsInputSet from '@pipeline/components/StepCommonFields/StepCommonFieldsInputSet'
import { useVariablesExpression } from '@pipeline/components/PipelineStudio/PiplineHooks/useVariablesExpression'
import type { GitQueryParams } from '@common/interfaces/RouteInterfaces'
import type { SaveCacheGCSStepProps } from './SaveCacheGCSStep'
import { ArchiveFormatOptions } from '../../../constants/Constants'
import css from '@pipeline/components/PipelineSteps/Steps/Steps.module.scss'

export const SaveCacheGCSStepInputSet: React.FC<SaveCacheGCSStepProps> = ({
  template,
  path,
  readonly,
  stepViewType
}) => {
  const { getString } = useStrings()

  const { expressions } = useVariablesExpression()

  const {
    accountId,
    projectIdentifier,
    orgIdentifier,
    repoIdentifier: repo = '',
    branch
  } = useParams<
    {
      projectIdentifier: string
      orgIdentifier: string
      accountId: string
    } & GitQueryParams
  >()

  return (
    <FormikForm className={css.removeBpPopoverWrapperTopMargin} style={{ width: '50%' }}>
      {getMultiTypeFromValue(template?.spec?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <FormMultiTypeConnectorField
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'gcpConnector' }}>
              {getString('pipelineSteps.gcpConnectorLabel')}
            </Text>
          }
          type={'Gcp'}
          setRefValue
          accountIdentifier={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={stepViewType === StepViewType.DeploymentForm ? 391 : 455}
          gitScope={{ branch, repo, getDefaultFromOtherRepo: true }}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.connectorRef`}
          placeholder={getString('select')}
          multiTypeProps={{
            expressions,
            disabled: readonly,
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
          }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.bucket) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.bucket`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'gcsBucket' }}>
              {getString('pipelineSteps.bucketLabel')}
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
      {getMultiTypeFromValue(template?.spec?.key) === MultiTypeInputType.RUNTIME && (
        <MultiTypeTextField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.key`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'saveCacheKey' }}>
              {getString('keyLabel')}
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
      {getMultiTypeFromValue(template?.spec?.sourcePaths as string) === MultiTypeInputType.RUNTIME && (
        <MultiTypeListInputSet
          name={`${isEmpty(path) ? '' : `${path}.`}spec.sourcePaths`}
          multiTypeFieldSelectorProps={{
            label: (
              <Text
                style={{ display: 'flex', alignItems: 'center' }}
                tooltipProps={{ dataTooltipId: 'saveCacheSourcePaths' }}
              >
                {getString('pipelineSteps.sourcePathsLabel')}
              </Text>
            ),
            allowedTypes: [MultiTypeInputType.FIXED]
          }}
          multiTextInputProps={{
            allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
            expressions
          }}
          disabled={readonly}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.archiveFormat) === MultiTypeInputType.RUNTIME && (
        <MultiTypeSelectField
          className={css.removeBpLabelMargin}
          name={`${isEmpty(path) ? '' : `${path}.`}spec.archiveFormat`}
          label={
            <Text style={{ display: 'flex', alignItems: 'center' }} tooltipProps={{ dataTooltipId: 'archiveFormat' }}>
              {getString('archiveFormat')}
            </Text>
          }
          multiTypeInputProps={{
            selectItems: ArchiveFormatOptions,
            multiTypeInputProps: {
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED]
            },
            disabled: readonly
          }}
          style={{ marginBottom: 'var(--spacing-small)' }}
        />
      )}
      {getMultiTypeFromValue(template?.spec?.override) === MultiTypeInputType.RUNTIME && (
        <div className={cx(css.formGroup, css.sm)}>
          <FormMultiTypeCheckboxField
            name={`${isEmpty(path) ? '' : `${path}.`}spec.override`}
            label={getString('override')}
            multiTypeTextbox={{
              expressions,
              allowableTypes: [MultiTypeInputType.EXPRESSION, MultiTypeInputType.FIXED],
              disabled: readonly
            }}
            style={{ marginBottom: 'var(--spacing-small)' }}
            setToFalseWhenEmpty={true}
          />
        </div>
      )}
      <StepCommonFieldsInputSet path={path} readonly={readonly} template={template} />
    </FormikForm>
  )
}
