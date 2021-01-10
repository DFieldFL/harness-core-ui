import React from 'react'
import debounce from 'lodash-es/debounce'
import noop from 'lodash-es/noop'
import cloneDeep from 'lodash-es/cloneDeep'
import get from 'lodash-es/get'
import isEmpty from 'lodash-es/isEmpty'
import {
  IconName,
  Tabs,
  Tab,
  Layout,
  Text,
  Color,
  getMultiTypeFromValue,
  MultiTypeInputType,
  TextInput
} from '@wings-software/uicore'
import { FormGroup } from '@blueprintjs/core'
import WorkflowVariables from '@pipeline/components/WorkflowVariablesSelection/WorkflowVariables'
import ArtifactsSelection from '@pipeline/components/ArtifactsSelection/ArtifactsSelection'
import ManifestSelection from '@pipeline/components/ManifestSelection/ManifestSelection'
import { StepViewType } from '@pipeline/exports'
import type { ServiceSpec } from 'services/cd-ng'
import { Step } from '@pipeline/components/AbstractSteps/Step'
import { useStrings } from 'framework/exports'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepType } from '../../PipelineStepInterface'
interface KubernetesServiceInputFormProps {
  initialValues: K8SDirectServiceStep
  onUpdate?: ((data: ServiceSpec) => void) | undefined
  stepViewType?: StepViewType
  template?: ServiceSpec
  factory?: AbstractStepFactory
}

const setupMode = {
  PROPAGATE: 'PROPAGATE',
  DIFFERENT: 'DIFFRENT'
}
const KubernetesServiceSpecInputForm: React.FC<KubernetesServiceInputFormProps> = ({
  initialValues: { stageIndex = 0, setupModeType, handleTabChange },
  factory
}) => {
  const { getString } = useStrings()
  return (
    <Tabs id="serviceSpecifications" onChange={handleTabChange}>
      <Tab
        id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
        title={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
        panel={
          <ArtifactsSelection
            isForOverrideSets={false}
            isForPredefinedSets={stageIndex > 0 && setupModeType === setupMode.PROPAGATE}
          />
        }
      />
      <Tab
        id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
        title={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
        panel={
          <ManifestSelection
            isForOverrideSets={false}
            isForPredefinedSets={stageIndex > 0 && setupModeType === setupMode.PROPAGATE}
          />
        }
      />
      <Tab
        id={getString('pipelineSteps.build.stageSpecifications.variablesDetails')}
        title={getString('pipelineSteps.build.stageSpecifications.variablesDetails')}
        panel={
          <WorkflowVariables
            factory={factory as any}
            isForOverrideSets={false}
            isForPredefinedSets={stageIndex > 0 && setupModeType === setupMode.PROPAGATE}
          />
        }
      />
    </Tabs>
  )
}

const KubernetesServiceSpecEditable: React.FC<KubernetesServiceInputFormProps> = ({
  initialValues,
  template,
  onUpdate
}) => {
  const delayedOnUpdate = React.useRef(debounce(onUpdate || noop, 300)).current
  const [state, setState] = React.useState(initialValues)
  React.useEffect(() => {
    if (isEmpty(state)) {
      setState(cloneDeep(initialValues))
    }
  }, [initialValues])

  const updateState = ({ index, key, value, artifactType }: any) => {
    const updatedState: any = cloneDeep(state)
    if (artifactType === 'primary' && updatedState?.artifacts[artifactType]) {
      updatedState.artifacts[artifactType].spec[key] = value
    }

    if (artifactType === 'sidecars' && updatedState?.artifacts[artifactType]) {
      updatedState.artifacts[artifactType][index].sidecar.spec[key] = value
    }
    if (artifactType === 'manifests' && updatedState?.manifests) {
      updatedState.manifests[index].manifest.spec.store.spec[key] = value
    }
    delayedOnUpdate(updatedState)

    return setState(updatedState)
  }
  const { getString } = useStrings()

  return (
    <Layout.Vertical spacing="medium">
      <>
        {template?.artifacts?.primary && (
          <Text style={{ fontSize: 16, color: Color.BLACK, marginTop: 15, fontWeight: 'bold' }}>
            {getString('primaryArtifactText')}
          </Text>
        )}
        {template?.artifacts?.primary && (
          <Layout.Vertical key="primary">
            {getMultiTypeFromValue(get(template, `artifacts.primary.spec.connectorRef`, '')) ===
              MultiTypeInputType.RUNTIME && (
              <FormGroup labelFor={'connectorRef'} label={getString('pipelineSteps.deploy.inputSet.artifactServer')}>
                <TextInput
                  style={{ width: 400 }}
                  name="connectorRef"
                  defaultValue={
                    getMultiTypeFromValue(get(initialValues, `artifacts.primary.spec.connectorRef`, '')) ===
                    MultiTypeInputType.RUNTIME
                      ? ''
                      : get(initialValues, `artifacts.primary.spec.connectorRef`, '')
                  }
                  onChange={(event: React.FormEvent<HTMLInputElement>) => {
                    updateState({
                      value: event.currentTarget.value,
                      key: 'connectorRef',
                      artifactType: 'primary'
                    })
                  }}
                ></TextInput>
              </FormGroup>
            )}
            {getMultiTypeFromValue(get(template, `artifacts.primary.spec.imagePath`, '')) ===
              MultiTypeInputType.RUNTIME && (
              <FormGroup labelFor="imagePath" label={getString('pipelineSteps.deploy.inputSet.imagePath')}>
                <TextInput
                  style={{ width: 400 }}
                  name="imagePath"
                  defaultValue={
                    getMultiTypeFromValue(get(initialValues, `artifacts.primary.spec.imagePath`, '')) ===
                    MultiTypeInputType.RUNTIME
                      ? ''
                      : get(initialValues, `artifacts.primary.spec.imagePath`, '')
                  }
                  onChange={(event: React.FormEvent<HTMLInputElement>) => {
                    updateState({
                      value: event.currentTarget.value,
                      key: 'imagePath',
                      artifactType: 'primary'
                    })
                  }}
                ></TextInput>
              </FormGroup>
            )}
          </Layout.Vertical>
        )}
        {template?.artifacts?.sidecars?.length && (
          <Text style={{ fontSize: 16, color: Color.BLACK, marginTop: 15, fontWeight: 'bold' }}>
            {getString('sidecarArtifactText')}
          </Text>
        )}
        {template?.artifacts?.sidecars?.map(
          (
            {
              sidecar: {
                identifier,
                spec: { connectorRef, imagePath }
              }
            }: any,
            index: number
          ) => {
            const connectorRefValue = get(initialValues, `artifacts.sidecars[${index}].sidecar.spec.connectorRef`, '')
            const imagePathValue = get(initialValues, `artifacts.sidecars[${index}].sidecar.spec.imagePath`, '')

            return (
              <Layout.Vertical key={identifier}>
                <Text style={{ fontSize: 16, color: Color.BLACK, marginTop: 15 }}>{identifier}</Text>
                {getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME && (
                  <FormGroup
                    labelFor={'connectorRef'}
                    label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
                  >
                    <TextInput
                      style={{ width: 400 }}
                      name="connectorRef"
                      defaultValue={
                        getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.RUNTIME ? '' : connectorRefValue
                      }
                      onChange={(event: React.FormEvent<HTMLInputElement>) => {
                        updateState({
                          index,
                          value: event.currentTarget.value,
                          key: 'connectorRef',
                          artifactType: 'sidecars'
                        })
                      }}
                    ></TextInput>
                  </FormGroup>
                )}
                {getMultiTypeFromValue(imagePath) === MultiTypeInputType.RUNTIME && (
                  <FormGroup labelFor="imagePath" label={getString('pipelineSteps.deploy.inputSet.imagePath')}>
                    <TextInput
                      style={{ width: 400 }}
                      name="imagePath"
                      defaultValue={
                        getMultiTypeFromValue(imagePathValue) === MultiTypeInputType.RUNTIME ? '' : imagePathValue
                      }
                      onChange={(event: React.FormEvent<HTMLInputElement>) => {
                        updateState({
                          index,
                          value: event.currentTarget.value,
                          key: 'imagePath',
                          artifactType: 'sidecars'
                        })
                      }}
                    ></TextInput>
                  </FormGroup>
                )}
              </Layout.Vertical>
            )
          }
        )}
      </>
      <>
        {template?.manifests?.length && (
          <Text style={{ fontSize: 16, color: Color.BLACK, marginTop: 15, fontWeight: 'bold' }}>
            {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
          </Text>
        )}
        {template?.manifests?.map?.(
          (
            {
              manifest: {
                identifier,
                spec: {
                  store: {
                    spec: { branch, connectorRef }
                  }
                }
              }
            }: any,
            index: number
          ) => {
            const branchValue = get(initialValues, `manifests[${index}].manifest.spec.store.spec.branch`, '')
            const connectorRefValue = get(
              initialValues,
              `manifests[${index}].manifest.spec.store.spec.connectorRef`,
              ''
            )
            return (
              <Layout.Vertical key={identifier}>
                <Text style={{ fontSize: 16, color: Color.BLACK, marginTop: 15 }}>{identifier}</Text>{' '}
                {getMultiTypeFromValue(connectorRef) === MultiTypeInputType.RUNTIME && (
                  <FormGroup
                    labelFor={'connectorRef'}
                    label={getString('pipelineSteps.deploy.inputSet.artifactServer')}
                  >
                    <TextInput
                      style={{ width: 400 }}
                      name="connectorRef"
                      defaultValue={
                        getMultiTypeFromValue(connectorRefValue) === MultiTypeInputType.RUNTIME ? '' : connectorRefValue
                      }
                      onChange={(event: React.FormEvent<HTMLInputElement>) => {
                        updateState({
                          index,
                          value: event.currentTarget.value,
                          key: 'connectorRef',
                          artifactType: 'manifests'
                        })
                      }}
                    ></TextInput>
                  </FormGroup>
                )}
                {getMultiTypeFromValue(branch) === MultiTypeInputType.RUNTIME && (
                  <FormGroup labelFor={'branch'} label={getString('pipelineSteps.deploy.inputSet.branch')}>
                    <TextInput
                      style={{ width: 400 }}
                      name="branch"
                      defaultValue={
                        getMultiTypeFromValue(branchValue) === MultiTypeInputType.RUNTIME ? '' : branchValue
                      }
                      onChange={(event: React.FormEvent<HTMLInputElement>) => {
                        updateState({
                          index,
                          value: event.currentTarget.value,
                          key: 'branch',
                          artifactType: 'manifests'
                        })
                      }}
                    ></TextInput>
                  </FormGroup>
                )}
              </Layout.Vertical>
            )
          }
        )}
      </>
    </Layout.Vertical>
  )
}

export interface K8SDirectServiceStep extends ServiceSpec {
  stageIndex?: number
  setupModeType?: string
  handleTabChange?: (tab: string) => void
}

export class KubernetesServiceSpec extends Step<ServiceSpec> {
  protected type = StepType.K8sServiceSpec
  protected defaultValues: ServiceSpec = {}

  protected stepIcon: IconName = 'service-kubernetes'
  protected stepName = 'Deplyment Service'
  protected stepPaletteVisible = false
  validateInputSet(): object {
    return {}
  }
  renderStep(
    initialValues: K8SDirectServiceStep,
    onUpdate?: ((data: K8SDirectServiceStep) => void) | undefined,
    stepViewType?: StepViewType | undefined,
    inputSetData?: {
      template?: ServiceSpec
    },
    factory?: AbstractStepFactory
  ): JSX.Element {
    if (stepViewType === StepViewType.InputSet || stepViewType === StepViewType.DeploymentForm) {
      return (
        <KubernetesServiceSpecEditable
          initialValues={initialValues}
          onUpdate={onUpdate}
          stepViewType={stepViewType}
          template={inputSetData?.template}
        />
      )
    }

    return (
      <KubernetesServiceSpecInputForm
        factory={factory}
        initialValues={initialValues}
        onUpdate={onUpdate}
        stepViewType={stepViewType}
      />
    )
  }
}
