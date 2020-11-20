import React from 'react'
import {
  Text,
  Formik,
  FormInput,
  Button,
  getMultiTypeFromValue,
  IconName,
  MultiTypeInputType,
  Layout,
  FormikForm
} from '@wings-software/uikit'
import { isEmpty } from 'lodash-es'
import * as yup from 'yup'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { useStrings } from 'framework/exports'
import { ConfigureOptions, PipelineContext, StepViewType } from '@pipeline/exports'
import { FormMultiTypeConnectorField } from '@connectors/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  getIdentifierFromValue,
  getScopeFromDTO,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { Scope } from '@common/interfaces/SecretsInterface'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import { ConnectorInfoDTO, useGetConnector } from 'services/cd-ng'
import { StepType } from '../../PipelineStepInterface'
import { PipelineStep } from '../../PipelineStep'
import { removeEmptyKeys } from '../StepsUtils'
import css from './SaveCacheGCSStep.module.scss'
import stepCss from '../Steps.module.scss'

export enum LimitMemoryUnits {
  Mi = 'Mi',
  Gi = 'Gi'
}

const validationSchema = yup.object().shape({
  identifier: yup.string().trim().required(),
  name: yup.string(),
  description: yup.string(),
  spec: yup
    .object()
    .shape({
      connectorRef: yup.mixed().required(),
      key: yup.string().trim().required(),
      bucket: yup.string().trim().required(),
      sourcePath: yup.array().compact().required(),
      target: yup.string(),
      limitCPU: yup
        .number()
        .transform((v, o) => (o === '' ? null : v))
        .nullable(true)
        .min(0),
      limitMemory: yup
        .number()
        .transform((v, o) => (o === '' ? null : v))
        .nullable(true)
        .min(0),
      timeout: yup.string()
    })
    .required()
})

export interface SaveCacheGCSStepWidgetProps {
  initialValues: any //SaveCacheGCSStepData
  onUpdate?: (data: any) => void //SaveCacheGCSStepData
  stepViewType?: StepViewType
}

const SaveCacheGCSStepWidget: React.FC<SaveCacheGCSStepWidgetProps> = ({ initialValues, onUpdate }): JSX.Element => {
  const {
    state: { pipelineView },
    updatePipelineView
  } = React.useContext(PipelineContext)

  const { getString } = useStrings()
  const { getString: getPipelineStepsString } = useStrings('pipeline-steps')

  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()

  const connectorId = getIdentifierFromValue((initialValues.spec.connectorRef as string) || '')
  const initialScope = getScopeFromValue((initialValues.spec.connectorRef as string) || '')

  const { data: connector, loading, refetch } = useGetConnector({
    identifier: connectorId,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: initialScope === Scope.ORG || initialScope === Scope.PROJECT ? orgIdentifier : undefined,
      projectIdentifier: initialScope === Scope.PROJECT ? projectIdentifier : undefined
    },
    lazy: true,
    debounce: 300
  })

  React.useEffect(() => {
    if (
      !isEmpty(initialValues.spec.connectorRef) &&
      getMultiTypeFromValue(initialValues.spec.connectorRef || '') === MultiTypeInputType.FIXED
    ) {
      refetch()
    }
  }, [initialValues.spec.connectorRef])

  function getInitialValuesInCorrectFormat(): any {
    const limitMemory = initialValues.spec?.resources?.limit?.memory
    const limitCPU = initialValues.spec?.resources?.limit?.cpu

    return removeEmptyKeys({
      ...initialValues,
      spec: {
        ...initialValues.spec,
        limitMemory,
        limitMemoryUnits: LimitMemoryUnits.Mi,
        limitCPU
      }
    })
  }

  const values = getInitialValuesInCorrectFormat()

  if (
    connector?.data?.connector &&
    getMultiTypeFromValue(initialValues.spec.connectorRef || '') === MultiTypeInputType.FIXED
  ) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    values.spec.connectorRef = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope
    }
  } else {
    // do not apply if we are loading connectors (this will keep "Loading" as placeholder in a input field)
    if (!loading) {
      values.spec.connectorRef = initialValues.spec.connectorRef
    }
  }

  const handleCancelClick = (): void => {
    updatePipelineView({
      ...pipelineView,
      isDrawerOpened: false,
      drawerData: { type: DrawerTypes.StepConfig }
    })
  }

  return (
    <>
      <Text className={stepCss.boldLabel} font={{ size: 'medium' }}>
        {getPipelineStepsString('saveCacheGCS.title')}
      </Text>
      <Formik
        enableReinitialize={true}
        initialValues={values}
        validationSchema={validationSchema}
        onSubmit={_values => {
          const resources: { limit?: { memory?: number; cpu?: number } } = {}

          if (_values.spec.limitMemory || _values.spec.limitCPU) {
            resources.limit = {}

            if (_values.spec.limitMemory) {
              resources.limit.memory = parseInt(_values.spec.limitMemory, 10)
            }

            if (_values.spec.limitCPU) {
              resources.limit.cpu = parseInt(_values.spec.limitCPU, 10)
            }
          }

          delete _values.spec.limitMemory
          delete _values.spec.limitMemoryUnits
          delete _values.spec.limitCPU

          const schemaValues = {
            identifier: _values.identifier,
            name: _values.name,
            description: _values.description,
            spec: {
              ..._values.spec,
              connectorRef: _values.spec.connectorRef?.value || _values.spec.connectorRef,
              resources
            }
          }

          onUpdate?.(removeEmptyKeys(schemaValues))
        }}
      >
        {({ values: formValues, setFieldValue, handleSubmit }) => (
          <FormikForm>
            <div className={css.fieldsSection}>
              <FormInput.InputWithIdentifier
                inputName="name"
                idName="identifier"
                inputLabel={getString('pipelineSteps.stepNameLabel')}
              />
              <FormInput.TextArea name="description" label={getString('pipelineSteps.descriptionLabel')} />
              <Text margin={{ top: 'medium', bottom: 'xsmall' }}>
                {getPipelineStepsString('saveCacheGCS.connectorLabel')}
              </Text>
              <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                <FormMultiTypeConnectorField
                  type="Gcp"
                  name="spec.connectorRef"
                  label=""
                  placeholder={loading ? getString('loading') : getString('pipelineSteps.connectorPlaceholder')}
                  disabled={loading}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                />
                {getMultiTypeFromValue(formValues?.spec.connectorRef) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues?.spec.connectorRef as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Text>{getPipelineStepsString('saveCacheGCS.connectorLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="spec.connectorRef"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      setFieldValue('spec.connectorRef', value)
                    }}
                  />
                )}
              </div>
              <Text margin={{ top: 'medium', bottom: 'xsmall' }}>{getString('pipelineSteps.keyLabel')}</Text>
              <div className={cx(css.fieldsGroup, css.withoutSpacing, css.bottomSpacing)}>
                <FormInput.MultiTextInput name="spec.key" label="" style={{ flexGrow: 1 }} />
                {getMultiTypeFromValue(formValues.spec.key) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues.spec.key as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Text>{getString('pipelineSteps.keyLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="spec.key"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => setFieldValue('spec.key', value)}
                  />
                )}
              </div>
              <Text margin={{ top: 'medium', bottom: 'xsmall' }}>{getString('pipelineSteps.bucketLabel')}</Text>
              <div className={cx(css.fieldsGroup, css.withoutSpacing, css.bottomSpacing)}>
                <FormInput.MultiTextInput name="spec.bucket" label="" style={{ flexGrow: 1 }} />
                {getMultiTypeFromValue(formValues.spec.bucket) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues.spec.bucket as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Text>{getString('pipelineSteps.bucketLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="spec.bucket"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => setFieldValue('spec.bucket', value)}
                  />
                )}
              </div>
              <FormInput.TagInput
                name="spec.sourcePath"
                label={getString('pipelineSteps.sourcePathLabel')}
                items={[]}
                labelFor={name => name as string}
                itemFromNewTag={newTag => newTag}
                tagInputProps={{
                  className: '',
                  noInputBorder: true,
                  openOnKeyDown: false,
                  showAddTagButton: false,
                  fill: true,
                  showNewlyCreatedItemsInList: false,
                  allowNewTag: true,
                  placeholder: ''
                }}
              />
            </div>
            <div className={css.fieldsSection}>
              <Text className={css.optionalConfiguration} font={{ weight: 'semi-bold' }} margin={{ bottom: 'medium' }}>
                {getString('pipelineSteps.optionalConfiguration')}
              </Text>
              <Text margin={{ bottom: 'xsmall' }}>{getString('pipelineSteps.targetLabel')}</Text>
              <div className={cx(css.fieldsGroup, css.withoutSpacing, css.bottomSpacing)}>
                <FormInput.MultiTextInput name="spec.target" label="" style={{ flexGrow: 1 }} />
                {getMultiTypeFromValue(formValues.spec.target) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues.spec.target as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Text>{getString('pipelineSteps.targetLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="spec.target"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => setFieldValue('spec.target', value)}
                  />
                )}
              </div>
              <div>
                <Text>
                  {getString('pipelineSteps.setContainerResources')}
                  <Button icon="question" minimal tooltip={getString('pipelineSteps.setContainerResourcesTooltip')} />
                </Text>
                <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                  <div>
                    <FormInput.Text
                      name="spec.limitMemory"
                      inputGroup={{ type: 'number', min: 0 }}
                      label={getString('pipelineSteps.limitMemoryLabel')}
                      placeholder={getString('pipelineSteps.limitMemoryPlaceholder')}
                    />
                    <Text font="xsmall" margin={{ top: 'small' }}>
                      {getString('pipelineSteps.limitMemoryExample')}
                    </Text>
                  </div>
                  <FormInput.Select
                    name="spec.limitMemoryUnits"
                    items={[
                      { label: getString('pipelineSteps.limitMemoryUnitMiLabel'), value: LimitMemoryUnits.Mi },
                      { label: getString('pipelineSteps.limitMemoryUnitGiLabel'), value: LimitMemoryUnits.Gi }
                    ]}
                  />
                  <div>
                    <FormInput.Text
                      name="spec.limitCPU"
                      inputGroup={{ type: 'number', min: 0 }}
                      label={getString('pipelineSteps.limitCPULabel')}
                      placeholder={getString('pipelineSteps.limitCPUPlaceholder')}
                    />
                    <Text font="xsmall" margin={{ top: 'small' }}>
                      {getString('pipelineSteps.limitCPUExample')}
                    </Text>
                  </div>
                </div>
              </div>
              <Text margin={{ top: 'medium', bottom: 'xsmall' }}>{getString('pipelineSteps.timeoutLabel')}</Text>
              <div className={cx(css.fieldsGroup, css.withoutSpacing)}>
                <FormInput.MultiTextInput name="spec.timeout" label="" style={{ flexGrow: 1 }} />
                {getMultiTypeFromValue(formValues.spec.timeout) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formValues.spec.timeout as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Text>{getString('pipelineSteps.timeoutLabel')}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="spec.timeout"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => setFieldValue('spec.timeout', value)}
                  />
                )}
              </div>
              <div style={{ marginBottom: 'var(--spacing-medium)' }} />
            </div>
            <div className={css.buttonsWrapper}>
              <Button
                onClick={() => handleSubmit()}
                intent="primary"
                type="submit"
                text={getString('save')}
                margin={{ right: 'xxlarge' }}
              />
              <Button text={getString('cancel')} minimal onClick={handleCancelClick} />
            </div>
          </FormikForm>
        )}
      </Formik>
    </>
  )
}

export class SaveCacheGCSStep extends PipelineStep<any /*SaveCacheGCSStepData*/> {
  renderStep(
    initialValues: any, //SaveCacheGCSStepData
    onUpdate?: (data: any) => void, //SaveCacheGCSStepData
    stepViewType?: StepViewType
  ): JSX.Element {
    return <SaveCacheGCSStepWidget initialValues={initialValues} onUpdate={onUpdate} stepViewType={stepViewType} />
  }

  protected type = StepType.SaveCacheGCS
  // TODO: Add i18n support
  protected stepName = 'Save Cache to GCS'
  protected stepIcon: IconName = 'save-cache-step'

  protected defaultValues: any /*SaveCacheGCSStepData*/ = {
    identifier: '',
    spec: {}
  }
}
