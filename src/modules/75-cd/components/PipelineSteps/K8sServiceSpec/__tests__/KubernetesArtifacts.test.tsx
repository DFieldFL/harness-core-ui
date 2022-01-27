/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import { ArtifactSourceBaseFactory } from '@cd/factory/ArtifactSourceFactory/ArtifactSourceBaseFactory'
import { KubernetesArtifacts } from '../KubernetesArtifacts'

describe('<KubernetesArtifacts /> tests', () => {
  test('snapshot test for kubernetes artifacts', () => {
    const { container } = render(
      <TestWrapper>
        <KubernetesArtifacts
          type={'artifact'}
          initialValues={{}}
          readonly
          stageIdentifier="stage-0"
          artifactSourceBaseFactory={new ArtifactSourceBaseFactory()}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
