/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { MultiTypeInputType } from '@harness/uicore'

import { TestWrapper } from '@common/utils/testUtils'

import { StepViewType } from '@pipeline/components/AbstractSteps/Step'
import { KubernetesServiceSpecInputSetMode } from '../KubernetesServiceSpecInputSetMode'

describe('<KubernetesServiceSpecInputSetMode /> tests', () => {
  test('snapshot test for kubernetes service spec input set mode', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesServiceSpecInputSetMode
          stageIdentifier=""
          allowableTypes={[MultiTypeInputType.EXPRESSION]}
          initialValues={{}}
          allValues={{
            artifacts: {
              primary: {
                type: 'DockerRegistry',
                spec: {}
              }
            }
          }}
          template={{
            manifests: [
              {
                manifest: {
                  identifier: 'manifest_1',
                  spec: {},
                  type: 'K8sManifest'
                }
              }
            ],
            variables: [
              {
                type: 'String',
                description: 'k8sVariable'
              }
            ]
          }}
          stepViewType={StepViewType.DeploymentForm}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
