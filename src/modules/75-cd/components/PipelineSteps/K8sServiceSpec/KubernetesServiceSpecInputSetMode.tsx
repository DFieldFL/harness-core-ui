/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { connect } from 'formik'
import { Layout, MultiTypeInputType } from '@wings-software/uicore'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import type { ServiceSpec } from 'services/cd-ng'
import type { AbstractStepFactory } from '@pipeline/components/AbstractSteps/AbstractStepFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { StepWidget } from '@pipeline/components/AbstractSteps/StepWidget'
import type { CustomVariablesData } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableEditable'
import type { CustomVariableInputSetExtraProps } from '@pipeline/components/PipelineSteps/Steps/CustomVariables/CustomVariableInputSet'
import type { AllNGVariables } from '@pipeline/utils/types'
import { StepType } from '@pipeline/components/PipelineSteps/PipelineStepInterface'
import artifactSourceBaseFactory from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import type { K8SDirectServiceStep } from './K8sServiceSpecInterface'
import { KubernetesArtifacts } from './KubernetesArtifacts'
import { KubernetesManifests } from './KubernetesManifests/KubernetesManifests'
import { KubernetesSidecars } from './KubernetesSidecars'
import css from './K8sServiceSpec.module.scss'

export interface KubernetesInputSetProps {
  initialValues: K8SDirectServiceStep
  onUpdate?: ((data: ServiceSpec) => void) | undefined
  stepViewType?: StepViewType
  template?: ServiceSpec
  allValues?: ServiceSpec
  readonly?: boolean
  factory?: AbstractStepFactory
  path?: string
  stageIdentifier: string
  formik?: any
  allowableTypes: MultiTypeInputType[]
}

const KubernetesServiceSpecInputSetModeFormikForm = (props: KubernetesInputSetProps) => {
  const {
    template,
    path,
    factory,
    allValues,
    initialValues,
    onUpdate,
    readonly = false,
    stageIdentifier,
    stepViewType,
    formik,
    allowableTypes
  } = props
  const { getString } = useStrings()
  return (
    <Layout.Vertical spacing="medium">
      <KubernetesArtifacts
        template={template}
        type={allValues?.artifacts?.primary?.type || ''}
        artifactSourceBaseFactory={artifactSourceBaseFactory}
        stepViewType={stepViewType}
        stageIdentifier={stageIdentifier}
        artifacts={allValues?.artifacts}
        formik={formik}
        onUpdate={onUpdate}
        path={path}
        initialValues={initialValues}
        readonly={readonly}
      />
      <KubernetesSidecars />

      {!!template?.manifests?.length && (
        <KubernetesManifests
          template={template}
          path={path}
          stepViewType={stepViewType}
          manifests={allValues?.manifests}
          initialValues={initialValues}
          readonly={readonly}
          stageIdentifier={stageIdentifier}
          formik={formik}
        />
      )}
      {/* {!!template?.manifests?.length && (
        <ManifestInputForm
          template={template}
          path={path}
          allValues={allValues}
          initialValues={initialValues}
          readonly={readonly}
          stageIdentifier={stageIdentifier}
          formik={formik}
        />
      )} */}
      {!!template?.variables?.length && (
        <div id={`Stage.${stageIdentifier}.Service.Variables`} className={cx(css.nopadLeft, css.accordionSummary)}>
          <div className={css.subheading}>{getString('variablesText')}</div>

          <div className={css.nestedAccordions}>
            <StepWidget<CustomVariablesData, CustomVariableInputSetExtraProps>
              factory={factory as unknown as AbstractStepFactory}
              initialValues={{
                variables: (initialValues.variables || []) as AllNGVariables[],
                canAddVariable: true
              }}
              type={StepType.CustomVariable}
              stepViewType={StepViewType.InputSet}
              allowableTypes={allowableTypes}
              onUpdate={
                /*istanbul ignore next*/ ({ variables }: CustomVariablesData) => {
                  onUpdate?.({
                    variables: variables as any
                  })
                }
              }
              customStepProps={{
                template: { variables: (template?.variables || []) as AllNGVariables[] },
                path,
                allValues: { variables: (allValues?.variables || []) as AllNGVariables[] }
              }}
              readonly={readonly}
            />
          </div>
        </div>
      )}
    </Layout.Vertical>
  )
}

export const KubernetesServiceSpecInputSetMode = connect(KubernetesServiceSpecInputSetModeFormikForm)
