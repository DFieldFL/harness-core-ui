/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { get } from 'lodash-es'
import { useParams } from 'react-router-dom'
import cx from 'classnames'

import { useStrings } from 'framework/strings'
import type { ManifestConfigWrapper, ServiceSpec } from 'services/cd-ng'
import manifestSourceBaseFactory from '@cd/factory/ManifestSourceFactory/ManifestSourceBaseFactory'
import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import type { GitQueryParams, InputSetPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { useQueryParams } from '@common/hooks'

import type { K8SDirectServiceStep } from '../K8sServiceSpecInterface'
import css from './KubernetesManifests.module.scss'

export interface KubernetesManifestsProps {
  template?: ServiceSpec
  path?: string
  stepViewType?: StepViewType
  manifests?: ManifestConfigWrapper[]
  initialValues: K8SDirectServiceStep
  readonly: boolean
  stageIdentifier: string
  formik?: any
  expressions?: string[]
  fromTrigger?: boolean
}

export function KubernetesManifests(props: KubernetesManifestsProps): React.ReactElement {
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId, pipelineIdentifier } = useParams<
    PipelineType<InputSetPathProps> & { accountId: string }
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()

  const runtimeMode = props.stepViewType === StepViewType.InputSet || props.stepViewType === StepViewType.DeploymentForm
  const isManifestsRuntime = runtimeMode && !!get(props.template, 'manifests', false)
  return (
    <div className={cx(css.nopadLeft, css.accordionSummary)} id={`Stage.${props.stageIdentifier}.Service.Manifests`}>
      {!props.fromTrigger && (
        <div className={css.subheading}>
          {getString('pipelineSteps.deploy.serviceSpecifications.deploymentTypes.manifests')}
        </div>
      )}

      {props.template?.manifests
        ?.filter(m => !!m)
        ?.map?.(manifestData => {
          const manifestSource = manifestSourceBaseFactory.getManifestSource(manifestData.manifest?.type as string)

          manifestSource ? (
            <>
              {manifestSource.renderContent({
                ...props,
                isManifestsRuntime,
                getString,
                projectIdentifier,
                orgIdentifier,
                accountId,
                pipelineIdentifier,
                repoIdentifier,
                branch
              })}
            </>
          ) : null
        })}
    </div>
  )
}
