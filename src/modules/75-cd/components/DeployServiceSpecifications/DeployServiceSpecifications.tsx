import React from 'react'
import { Layout, Button, Card, Icon, Text, Label, SelectOption, Tabs, Tab, IconName } from '@wings-software/uicore'

import isEmpty from 'lodash-es/isEmpty'
import cx from 'classnames'
import { debounce, get, set } from 'lodash-es'
import {
  PipelineContext,
  getStageIndexFromPipeline,
  getPrevoiusStageFromIndex,
  StepWidget,
  StepViewType
} from '@pipeline/exports'
import { useStrings, String } from 'framework/exports'

import OverrideSets from '@pipeline/components/OverrideSets/OverrideSets'
import type { K8SDirectServiceStep } from '@cd/components/PipelineSteps/K8sServiceSpec/K8sServiceSpec'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import type { NgPipeline, ServiceConfig } from 'services/cd-ng'
import factory from '@pipeline/components/PipelineSteps/PipelineStepFactory'
import i18n from './DeployServiceSpecifications.i18n'
import css from './DeployServiceSpecifications.module.scss'

const specificationTypes = {
  SPECIFICATION: 'SPECIFICATION',
  OVERRIDES: 'OVERRIDES'
}

const setupMode = {
  PROPAGATE: 'PROPAGATE',
  DIFFERENT: 'DIFFRENT'
}

const supportedDeploymentTypes: { name: string; icon: IconName; enabled: boolean }[] = [
  {
    name: i18n.deploymentTypes.kubernetes,
    icon: 'service-kubernetes',
    enabled: true
  },
  {
    name: i18n.deploymentTypes.amazonEcs,
    icon: 'service-ecs',
    enabled: false
  },
  {
    name: i18n.deploymentTypes.amazonAmi,
    icon: 'main-service-ami',
    enabled: false
  },
  {
    name: i18n.deploymentTypes.awsCodeDeploy,
    icon: 'app-aws-code-deploy',
    enabled: false
  },
  {
    name: i18n.deploymentTypes.winrm,
    icon: 'command-winrm',
    enabled: false
  },
  {
    name: i18n.deploymentTypes.awsLambda,
    icon: 'app-aws-lambda',
    enabled: false
  },
  {
    name: i18n.deploymentTypes.pcf,
    icon: 'service-pivotal',
    enabled: false
  },
  {
    name: i18n.deploymentTypes.ssh,
    icon: 'secret-ssh',
    enabled: false
  }
]

export default function DeployServiceSpecifications(props: React.PropsWithChildren<unknown>): JSX.Element {
  const { getString } = useStrings()
  const [selectedTab, setSelectedTab] = React.useState(
    getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')
  )
  const [specSelected, setSelectedSpec] = React.useState(specificationTypes.SPECIFICATION)
  const [setupModeType, setSetupMode] = React.useState('')
  const [checkedItems, setCheckedItems] = React.useState({ overrideSetCheckbox: false })
  const [isConfigVisible, setConfigVisibility] = React.useState(false)
  const [selectedPropagatedState, setSelectedPropagatedState] = React.useState<SelectOption>()
  // const [canUseFromStage, setCanUseFromStage] = React.useState(false)
  const handleTabChange = (data: string): void => {
    setSelectedTab(data)
  }
  const previousStageList: { label: string; value: string }[] = []
  const {
    state: {
      pipeline,
      pipelineView: {
        splitViewData: { selectedStageId }
      }
    },
    getStageFromPipeline,
    updatePipeline
  } = React.useContext(PipelineContext)

  const debounceUpdatePipeline = React.useRef(
    debounce((pipelineData: NgPipeline) => {
      return updatePipeline(pipelineData)
    }, 500)
  ).current

  const { stage = {} } = getStageFromPipeline(selectedStageId || '')
  const { index: stageIndex } = getStageIndexFromPipeline(pipeline, selectedStageId || '')
  const { stages } = getPrevoiusStageFromIndex(pipeline)
  const [parentStage, setParentStage] = React.useState<{ [key: string]: any }>({})

  React.useEffect(() => {
    if (stages && stages.length > 0) {
      const currentStageType = stage?.stage?.type
      stages.forEach((item, index) => {
        if (
          index < stageIndex &&
          currentStageType === item?.stage?.type &&
          !get(item.stage, `spec.serviceConfig.useFromStage.stage`)
        ) {
          previousStageList.push({
            label: `Previous Stage ${item.stage.name} [${item.stage.identifier}]`,
            value: item.stage.identifier
          })
        }
      })
    }
    if (isEmpty(parentStage) && stage?.stage?.spec?.serviceConfig?.useFromStage?.stage) {
      const parentStageName = stage?.stage?.spec?.serviceConfig?.useFromStage?.stage
      const { index } = getStageIndexFromPipeline(pipeline, parentStageName)
      setParentStage(stages[index])
    }
  }, [stages])

  React.useEffect(() => {
    if (stage?.stage) {
      if (!stage.stage.spec) {
        stage.stage.spec = {}
      }

      if (
        !stage.stage.spec.serviceConfig?.serviceDefinition &&
        setupModeType === setupMode.DIFFERENT &&
        !stage.stage.spec.serviceConfig?.useFromStage?.stage
      ) {
        setDefaultServiceSchema()
        setSelectedPropagatedState({ label: '', value: '' })
        setSetupMode(setupMode.DIFFERENT)
      } else if (
        setupModeType === setupMode.PROPAGATE &&
        stageIndex > 0 &&
        !stage.stage.spec.serviceConfig?.serviceDefinition &&
        !stage.stage.spec.serviceConfig?.useFromStage?.stage
      ) {
        stage.stage.spec = {
          serviceConfig: {
            useFromStage: {
              stage: null
            },
            stageOverrides: {}
          }
        }
        debounceUpdatePipeline(pipeline)

        setSetupMode(setupMode.PROPAGATE)
      }
    }
  }, [setupModeType, stageIndex, stage?.stage])

  const setDefaultServiceSchema = (): void => {
    stage.stage.spec = {
      serviceConfig: {
        serviceRef: '',
        serviceDefinition: {
          type: 'Kubernetes',
          spec: {
            artifacts: {
              // primary: null,
              sidecars: []
            },
            manifests: [],
            // variables: [],
            artifactOverrideSets: [],
            manifestOverrideSets: []
            // variableOverrideSets: []
          }
        }
      }
    }
    debounceUpdatePipeline(pipeline)
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const _isChecked = (event.target as HTMLInputElement).checked
    const currentSpec = stage?.stage.spec?.serviceConfig
    setCheckedItems({
      ...checkedItems,
      overrideSetCheckbox: _isChecked
    })
    if (_isChecked) {
      currentSpec.stageOverrides = {
        artifacts: {
          // primary: null,
          sidecars: []
        },
        manifests: [],
        // variables: [],
        useArtifactOverrideSets: [],
        useManifestOverrideSets: []
        // useVariableOverrideSets: []
      }

      debounceUpdatePipeline(pipeline)
      setConfigVisibility(true)
    } else {
      currentSpec.stageOverrides = null
      debounceUpdatePipeline(pipeline)
      setConfigVisibility(false)
    }
  }

  React.useEffect(() => {
    if (
      !stage?.stage?.spec?.serviceConfig?.serviceDefinition?.type &&
      !stage?.stage?.spec.serviceConfig?.useFromStage
    ) {
      set(stage as {}, 'stage.spec.serviceConfig.serviceDefinition.type', 'Kubernetes')
      debounceUpdatePipeline(pipeline)
    }
  }, [])

  React.useEffect(() => {
    if (stageIndex === 0) {
      setSetupMode(setupMode.DIFFERENT)
    }
  }, [stageIndex])

  React.useEffect(() => {
    const useFromStage = stage?.stage?.spec.serviceConfig?.useFromStage
    const stageOverrides = stage?.stage?.spec.serviceConfig?.stageOverrides
    const serviceDefinition = stage?.stage?.spec.serviceConfig?.serviceDefinition

    if (useFromStage) {
      setSetupMode(setupMode.PROPAGATE)
      if (previousStageList && previousStageList.length > 0) {
        const selectedIdentifier = useFromStage?.stage
        const selectedOption = previousStageList.find(v => v.value === selectedIdentifier)

        if (selectedOption?.value !== selectedPropagatedState?.value) {
          setSelectedPropagatedState(selectedOption)
          if (stageOverrides) {
            if (!checkedItems.overrideSetCheckbox) {
              setCheckedItems({
                ...checkedItems,
                overrideSetCheckbox: true
              })
              if (!isConfigVisible) {
                setConfigVisibility(true)
              }
            }
          } else {
            setCheckedItems({
              ...checkedItems,
              overrideSetCheckbox: false
            })
            setConfigVisibility(false)
          }
          debounceUpdatePipeline(pipeline)
        }
      }
      if (stageOverrides) {
        if (!checkedItems.overrideSetCheckbox) {
          setCheckedItems({
            ...checkedItems,
            overrideSetCheckbox: true
          })
          if (!isConfigVisible) {
            setConfigVisibility(true)
          }
        }
        if (!setupModeType) {
          setSetupMode(setupMode.PROPAGATE)
        }
      }
    } else if (serviceDefinition) {
      setSelectedPropagatedState({ label: '', value: '' })
      setSetupMode(setupMode.DIFFERENT)
    }
  }, [stage?.stage?.spec])

  return (
    <Layout.Vertical className={css.serviceOverrides}>
      {stageIndex > 0 && setupModeType === setupMode.PROPAGATE && selectedPropagatedState?.label && (
        <Layout.Horizontal flex={true} className={cx(css.specTabs, css.tabHeading)}>
          <Button minimal text={i18n.stageOverrideLabel} className={css.selected} />
        </Layout.Horizontal>
      )}
      {stageIndex > 0 && setupModeType === setupMode.PROPAGATE && selectedPropagatedState?.label && (
        <Layout.Vertical spacing="medium" padding="xxlarge">
          <Layout.Horizontal spacing="small" style={{ alignItems: 'center' }}>
            <input
              type="checkbox"
              id="overrideSetCheckbox"
              checked={checkedItems['overrideSetCheckbox']}
              className={css.overideCheckbox}
              onChange={handleChange}
            />
            <Label style={{ fontSize: 16, color: 'var(--grey-600)' }} htmlFor="overrideSetCheckbox">
              {i18n.overidesCondition}
            </Label>
          </Layout.Horizontal>

          <Text style={{ fontSize: 14, color: 'var(-grey-300)' }}>{i18n.overideInfoText}</Text>
        </Layout.Vertical>
      )}
      {(stageIndex === 0 || setupModeType === setupMode.DIFFERENT) && (
        <>
          <Layout.Vertical spacing="large">
            <div className={cx(css.serviceSection, css.noPadVertical)}>
              <Layout.Vertical flex={true} className={cx(css.specTabs, css.tabHeading)}>
                {i18n.serviceDetailLabel}
              </Layout.Vertical>
              <Layout.Horizontal spacing="medium">
                <StepWidget
                  type={StepType.DeployService}
                  initialValues={{ ...{ serviceRef: '' }, ...get(stage, 'stage.spec.serviceConfig', {}) }}
                  onUpdate={(value: ServiceConfig) => {
                    const serviceObj = get(stage, 'stage.spec.serviceConfig', {})
                    if (value.service) {
                      serviceObj.service = value.service
                      delete serviceObj.serviceRef
                    } else if (value.serviceRef) {
                      serviceObj.serviceRef = value.serviceRef
                      delete serviceObj.service
                    }
                    debounceUpdatePipeline(pipeline)
                  }}
                  factory={factory}
                  stepViewType={StepViewType.Edit}
                />
              </Layout.Horizontal>
            </div>
          </Layout.Vertical>
          <div className={css.serviceSection}>
            <Layout.Vertical flex={true} className={cx(css.specTabs, css.tabHeading)}>
              {<String stringID="pipelineSteps.deploy.serviceSpecifications.serviceDefinition" />}
            </Layout.Vertical>
            <div className={css.artifactType}>
              <div>
                <div className={css.serviceSpecType}>
                  <div>
                    <Button
                      minimal
                      style={{ fontSize: '14px', fontWeight: 'bold' }}
                      text={i18n.serviceSpecificationLabel}
                      onClick={() => setSelectedSpec(specificationTypes.SPECIFICATION)}
                      className={cx({
                        [css.selected]: specSelected === specificationTypes.SPECIFICATION,
                        [css.nopadleft]: true
                      })}
                    />
                  </div>
                  <div className={css.stageOverridesTab}></div>
                </div>
              </div>
              {specSelected === specificationTypes.SPECIFICATION && (
                <Layout.Vertical
                  spacing="medium"
                  style={{ display: 'inline-block', marginTop: '12px', marginBottom: '40px' }}
                >
                  <Text style={{ fontSize: 16, color: 'var(--grey-400)', marginBottom: 'var(--spacing-medium)' }}>
                    {i18n.deploymentTypeLabel}
                  </Text>

                  <Layout.Horizontal>
                    {supportedDeploymentTypes.map((type: { name: string; icon: IconName; enabled: boolean }) => (
                      <div
                        key={type.name}
                        className={css.squareCardContainer}

                        // style={{ width: 90, padding: 'var(--spacing-small) 0', marginRight: 'var(--spacing-small)' }}
                      >
                        <Card
                          disabled={!type.enabled}
                          interactive={true}
                          selected={type.name === i18n.deploymentTypes.kubernetes ? true : false}
                          cornerSelected={type.name === i18n.deploymentTypes.kubernetes ? true : false}
                          // style={{ width: 90, padding: 'var(--spacing-small) 0', marginRight: 'var(--spacing-small)' }}
                          className={cx({ [css.disabled]: !type.enabled }, css.squareCard)}
                        >
                          <Icon name={type.icon as IconName} size={26} height={26} />
                        </Card>
                        <Text
                          style={{
                            fontSize: '12px',
                            color: type.enabled ? 'var(--grey-900)' : 'var(--grey-350)',
                            textAlign: 'center'
                          }}
                        >
                          {type.name}
                        </Text>
                      </div>
                    ))}
                  </Layout.Horizontal>
                </Layout.Vertical>
              )}
              <div className={css.artifactType}>
                {(isConfigVisible || stageIndex === 0 || setupModeType === setupMode.DIFFERENT) && (
                  <div>
                    <StepWidget<K8SDirectServiceStep>
                      factory={factory}
                      initialValues={{ stageIndex, setupModeType, handleTabChange }}
                      type={StepType.K8sServiceSpec}
                      stepViewType={StepViewType.Edit}
                    />
                  </div>
                )}
              </div>

              <OverrideSets selectedTab={selectedTab} />
            </div>
          </div>
        </>
      )}
      {setupModeType === setupMode.PROPAGATE && selectedPropagatedState?.label && checkedItems.overrideSetCheckbox && (
        <div className={cx(css.artifactType, css.overrideAlignCenter)}>
          <Tabs id="serviceSpecifications" onChange={handleTabChange}>
            <Tab
              id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
              title={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.artifacts')}
            />
            <Tab
              id={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
              title={getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
            />
            <Tab id={getString('variablesText')} title={getString('variablesText')} />
          </Tabs>
          <OverrideSets
            selectedTab={selectedTab}
            isPropagating={true}
            parentStage={parentStage?.stage?.identifier as string}
          />
        </div>
      )}
      <React.Fragment>{props.children}</React.Fragment>
    </Layout.Vertical>
  )
}
