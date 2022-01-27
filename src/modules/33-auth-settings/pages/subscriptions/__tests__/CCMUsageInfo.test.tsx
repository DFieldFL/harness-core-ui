/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as useGetUsageAndLimit from '@common/hooks/useGetUsageAndLimit'
import CCMUsageInfo from '../overview/CCMUsageInfo'

const useGetUsageAndLimitReturnMock = {
  limitData: {
    limit: {
      ccm: {
        totalSpendLimit: 250000
      }
    }
  },
  usageData: {
    usage: {
      ccm: {
        activeSpend: {
          count: 200000,
          displayName: ''
        }
      }
    }
  }
}

jest.spyOn(useGetUsageAndLimit, 'useGetUsageAndLimit').mockReturnValue(useGetUsageAndLimitReturnMock)

describe('CCMUsageInfo', () => {
  test('CCMUsageInfo', () => {
    const { container, getByText } = render(
      <TestWrapper>
        <CCMUsageInfo />
      </TestWrapper>
    )
    expect(getByText('common.subscriptions.usage.cloudSpend')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
