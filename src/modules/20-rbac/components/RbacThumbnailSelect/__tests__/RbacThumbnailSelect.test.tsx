/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { act, render, fireEvent, waitFor } from '@testing-library/react'
import * as useFeaturesLib from '@common/hooks/useFeatures'
import { TestWrapper } from '@common/utils/testUtils'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { RbacThumbnailItem, RbacThumbnailSelect } from '../RbacThumbnailSelect'

const getNonRbacSampleItems = (): RbacThumbnailItem[] => [{ label: 'I1', value: 'i1', icon: 'nav-organization-hover' }]
const getRbacSampleItems = (): RbacThumbnailItem[] => [
  {
    label: 'I1',
    value: 'i1',
    icon: 'nav-organization-hover',
    featureProps: { featureRequest: { featureName: FeatureIdentifier.TEST1 } }
  }
]

describe('RBAC ThumbnailSelect', () => {
  test('renders items without RBAC restrictions', () => {
    const { container } = render(<RbacThumbnailSelect items={getNonRbacSampleItems()} name="nonRbacThumbnail" />)
    expect(container).toMatchSnapshot('non rbac items')
  })

  test('renders items with RBAC restrictions', async () => {
    jest.spyOn(useFeaturesLib, 'useFeature').mockReturnValue({ enabled: false })
    const { container, queryByText } = render(
      <TestWrapper>
        <RbacThumbnailSelect items={getRbacSampleItems()} name="rRbacThumbnail" />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot('rbac items should be disabled')

    const targetElement = container.querySelector('.bp3-popover-target')
    act(() => {
      fireEvent.mouseOver(targetElement!)
    })
    await waitFor(() => expect(queryByText('common.levelUp')).toBeTruthy())
  })
})
