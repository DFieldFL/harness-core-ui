/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'

import { ServicePopoverCard } from '../ServicePopoverCard'

describe('<ServicePopoverCard /> tests', () => {
  test('snapshot test for service popover card', () => {
    const { container } = render(
      <TestWrapper>
        <ServicePopoverCard
          service={{
            deploymentType: 'deploymentType',
            displayName: 'displayName',
            identifier: 'identifier',
            artifacts: {
              primary: {
                displayName: 'art1',
                type: 'artifact'
              },
              sidecars: [
                {
                  displayName: 'sidecar1',
                  type: 'sidecar'
                }
              ]
            }
          }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('snapshot test when there are no artifacts', () => {
    const { container } = render(
      <TestWrapper>
        <ServicePopoverCard
          service={{
            deploymentType: 'deploymentType',
            displayName: 'displayName',
            identifier: 'identifier'
          }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
