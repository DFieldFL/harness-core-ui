import React from 'react'
import {
  IconName,
  Text,
  Color,
  Layout,
  Formik,
  FormikForm,
  FormInput,
  getMultiTypeFromValue,
  MultiTypeInputType,
  Icon,
  TextInput
} from '@wings-software/uikit'
import { useParams } from 'react-router-dom'
import { debounce, noop, isEmpty } from 'lodash-es'
import { FormGroup } from '@blueprintjs/core'
import { StepViewType, ConfigureOptions } from '@pipeline/exports'
import { K8SDirectInfrastructure, useGetConnector, ConnectorInfoDTO } from 'services/cd-ng'
import {
  FormMultiTypeConnectorField,
  MultiTypeConnectorFieldProps
} from '@common/components/ConnectorReferenceField/FormMultiTypeConnectorField'
import {
  getScopeFromDTO,
  getIdentifierFromValue,
  getScopeFromValue
} from '@common/components/EntityReference/EntityReference'
import { getIconByType } from 'modules/dx/exports'
import { Scope } from '@common/interfaces/SecretsInterface'
import {
  ConnectorReferenceField,
  ConnectorReferenceFieldProps
} from '@common/components/ConnectorReferenceField/ConnectorReferenceField'
import { StepType } from '../../PipelineStepInterface'
import i18n from './KubernetesInfraSpec.18n'
import { PipelineStep } from '../../PipelineStep'

type K8SDirectInfrastructureTemplate = { [key in keyof K8SDirectInfrastructure]: string }
interface KubernetesInfraSpecEditableProps {
  initialValues: K8SDirectInfrastructure
  onUpdate?: (data: K8SDirectInfrastructure) => void
  stepViewType?: StepViewType
  template?: K8SDirectInfrastructureTemplate
}

interface FormValues extends Omit<K8SDirectInfrastructure, 'connectorRef'> {
  connectorRef: MultiTypeConnectorFieldProps['selected'] | string
}

const KubernetesInfraSpecEditable: React.FC<KubernetesInfraSpecEditableProps> = ({
  initialValues,
  onUpdate
}): JSX.Element => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const connectorRef = getIdentifierFromValue(initialValues.connectorRef || '')
  const initialScope = getScopeFromValue(initialValues.connectorRef || '')
  const { data: connector, loading, refetch } = useGetConnector({
    identifier: connectorRef,
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
      !isEmpty(initialValues.connectorRef) &&
      getMultiTypeFromValue(initialValues.connectorRef || '') === MultiTypeInputType.FIXED
    ) {
      refetch()
    }
  }, [initialValues.connectorRef])
  const values: FormValues = { ...initialValues, connectorRef: undefined }
  if (
    connector?.data?.connector &&
    getMultiTypeFromValue(initialValues.connectorRef || '') === MultiTypeInputType.FIXED
  ) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    values.connectorRef = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope
    }
  } else {
    values.connectorRef = initialValues.connectorRef
  }

  return (
    <Layout.Vertical spacing="medium">
      <Text style={{ fontSize: 16, color: Color.BLACK, marginTop: 15 }}>{i18n.stepName}</Text>
      <Formik
        enableReinitialize
        initialValues={values}
        validate={value => {
          const data: K8SDirectInfrastructure = {
            namespace: value.namespace,
            releaseName: value.releaseName,
            connectorRef: undefined
          }
          if (value.connectorRef) {
            data.connectorRef = (value.connectorRef as any)?.value || value.connectorRef
          }
          delayedOnUpdate(data)
        }}
        onSubmit={noop}
      >
        {formik => {
          return (
            <FormikForm>
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                <FormMultiTypeConnectorField
                  name="connectorRef"
                  label={i18n.k8ConnectorDropDownLabel}
                  placeholder={loading ? i18n.loading : i18n.k8ConnectorDropDownPlaceholder}
                  disabled={loading}
                  accountIdentifier={accountId}
                  projectIdentifier={projectIdentifier}
                  orgIdentifier={orgIdentifier}
                  width={400}
                />
                {getMultiTypeFromValue(formik.values.connectorRef) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values.connectorRef as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Icon name={getIconByType('K8sCluster')}></Icon>
                        <Text>{i18n.kubernetesConnector}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="dockerConnector"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('connectorRef', value)
                    }}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                <FormInput.MultiTextInput
                  name="namespace"
                  style={{ width: 400 }}
                  label={i18n.nameSpaceLabel}
                  placeholder={i18n.nameSpacePlaceholder}
                />
                {getMultiTypeFromValue(formik.values.namespace) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values.namespace as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Icon name={getIconByType('K8sCluster')}></Icon>
                        <Text>{i18n.kubernetesConnector}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="namespace"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('namespace', value)
                    }}
                  />
                )}
              </Layout.Horizontal>
              <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                <FormInput.MultiTextInput
                  name="releaseName"
                  style={{ width: 400 }}
                  label={i18n.releaseName}
                  placeholder={i18n.releaseNamePlaceholder}
                />
                {getMultiTypeFromValue(formik.values.releaseName) === MultiTypeInputType.RUNTIME && (
                  <ConfigureOptions
                    value={formik.values.releaseName as string}
                    type={
                      <Layout.Horizontal spacing="medium" style={{ alignItems: 'center' }}>
                        <Icon name={getIconByType('K8sCluster')}></Icon>
                        <Text>{i18n.kubernetesConnector}</Text>
                      </Layout.Horizontal>
                    }
                    variableName="releaseName"
                    showRequiredField={false}
                    showDefaultField={false}
                    showAdvanced={true}
                    onChange={value => {
                      formik.setFieldValue('releaseName', value)
                    }}
                  />
                )}
              </Layout.Horizontal>
            </FormikForm>
          )
        }}
      </Formik>
    </Layout.Vertical>
  )
}

const KubernetesInfraSpecInputForm: React.FC<KubernetesInfraSpecEditableProps> = ({
  onUpdate,
  initialValues,
  template
}) => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams<{
    projectIdentifier: string
    orgIdentifier: string
    accountId: string
  }>()
  const connectorRef = getIdentifierFromValue(initialValues.connectorRef || '')
  const initialScope = getScopeFromValue(initialValues.connectorRef || '')

  const { data: connector, loading, refetch } = useGetConnector({
    identifier: connectorRef,
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
      getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME &&
      getMultiTypeFromValue(initialValues?.connectorRef) !== MultiTypeInputType.RUNTIME
    ) {
      refetch()
    }
  }, [initialValues.connectorRef])

  let connectorSelected: ConnectorReferenceFieldProps['selected'] = undefined
  if (
    connector?.data?.connector &&
    getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME &&
    getMultiTypeFromValue(initialValues.connectorRef) === MultiTypeInputType.FIXED
  ) {
    const scope = getScopeFromDTO<ConnectorInfoDTO>(connector?.data?.connector)
    connectorSelected = {
      label: connector?.data?.connector.name || '',
      value: `${scope !== Scope.PROJECT ? `${scope}.` : ''}${connector?.data?.connector.identifier}`,
      scope: scope
    }
  }
  return (
    <Layout.Vertical padding="medium" spacing="small">
      {getMultiTypeFromValue(template?.connectorRef) === MultiTypeInputType.RUNTIME && (
        <ConnectorReferenceField
          accountIdentifier={accountId}
          selected={connectorSelected}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          width={400}
          name="connectorRef"
          label={i18n.k8ConnectorDropDownLabel}
          placeholder={loading ? i18n.loading : i18n.k8ConnectorDropDownPlaceholder}
          disabled={loading}
          onChange={(record, scope) => {
            onUpdate?.({
              ...initialValues,
              connectorRef:
                scope === Scope.ORG || scope === Scope.ACCOUNT ? `${scope}.${record?.identifier}` : record?.identifier
            })
          }}
        />
      )}
      {getMultiTypeFromValue(template?.releaseName) === MultiTypeInputType.RUNTIME && (
        <FormGroup labelFor="releaseName" label={i18n.releaseName}>
          <TextInput
            placeholder={i18n.releaseNamePlaceholder}
            style={{ width: 400 }}
            name="releaseName"
            value={
              getMultiTypeFromValue(initialValues.releaseName) === MultiTypeInputType.RUNTIME
                ? ''
                : initialValues.releaseName || ''
            }
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              onUpdate?.({ ...initialValues, releaseName: event.currentTarget.value })
            }}
          ></TextInput>
        </FormGroup>
      )}
      {getMultiTypeFromValue(template?.namespace) === MultiTypeInputType.RUNTIME && (
        <FormGroup labelFor="namespace" label={i18n.nameSpaceLabel}>
          <TextInput
            placeholder={i18n.nameSpacePlaceholder}
            style={{ width: 400 }}
            name="namespace"
            value={
              getMultiTypeFromValue(initialValues.namespace) === MultiTypeInputType.RUNTIME
                ? ''
                : initialValues.namespace || ''
            }
            onChange={(event: React.FormEvent<HTMLInputElement>) => {
              onUpdate?.({ ...initialValues, namespace: event.currentTarget.value })
            }}
          ></TextInput>
        </FormGroup>
      )}
    </Layout.Vertical>
  )
}

interface K8SDirectInfrastructureStep extends K8SDirectInfrastructure {
  name?: string
  identifier?: string
}

export class KubernetesInfraSpec extends PipelineStep<K8SDirectInfrastructureStep> {
  protected type = StepType.KubernetesInfraSpec
  protected defaultValues: K8SDirectInfrastructure = {}

  protected stepIcon: IconName = 'service-kubernetes'
  protected stepName: string = i18n.stepName
  protected stepPaletteVisible = false
  renderStep(
    initialValues: K8SDirectInfrastructure,
    onUpdate?: ((data: K8SDirectInfrastructure) => void) | undefined,
    stepViewType?: StepViewType | undefined,
    template?: K8SDirectInfrastructureTemplate
  ): JSX.Element {
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <KubernetesInfraSpecInputForm
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={template}
        />
      )
    }

    return (
      <KubernetesInfraSpecEditable
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
        template={template}
      />
    )
  }
}
