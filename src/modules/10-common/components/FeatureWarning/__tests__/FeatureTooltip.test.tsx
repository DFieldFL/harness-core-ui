/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { useFeatureModule, useFeatureRequiredPlans } from '@common/hooks/useFeatures'
import type { CheckFeatureReturn } from 'framework/featureStore/featureStoreUtil'
import FeatureTooltip from '../FeatureTooltip'

jest.mock('@common/hooks/useFeatures')
const useFeatureModuleMock = useFeatureModule as jest.MockedFunction<any>
useFeatureModuleMock.mockImplementation(() => {
  return 'CI'
})

const useFeatureRequiredPlansMock = useFeatureRequiredPlans as jest.MockedFunction<any>
useFeatureRequiredPlansMock.mockImplementation(() => {
  return []
})

const features = new Map<FeatureIdentifier, CheckFeatureReturn>()
features.set(FeatureIdentifier.BUILDS, {
  enabled: false,
  featureDetail: {
    featureName: FeatureIdentifier.BUILDS,
    enabled: false,
    moduleType: 'CD',
    limit: 100,
    count: 200
  }
})
features.set(FeatureIdentifier.DEPLOYMENTS, {
  enabled: false,
  featureDetail: {
    featureName: FeatureIdentifier.DEPLOYMENTS,
    enabled: false,
    moduleType: 'CI',
    limit: 100,
    count: 200
  }
})

const warningMesasge = <p>this is warning message</p>

describe('FeatureTooltip', () => {
  test('FeatureTooltip with warning message', () => {
    const { container, getByText } = render(
      <TestWrapper path={routes.toRoleDetails({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <FeatureTooltip features={features} warningMessage={warningMesasge} />
      </TestWrapper>
    )
    expect(getByText('this is warning message')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  test('FeatureTooltip without warning message', () => {
    const { container, queryByText, getByText } = render(
      <TestWrapper path={routes.toRoleDetails({ ...accountPathProps })} pathParams={{ accountId: 'dummy' }}>
        <FeatureTooltip features={features} />
      </TestWrapper>
    )
    expect(queryByText('this is warning message')).not.toBeInTheDocument()
    expect(getByText('common.purpose.cd.continuous')).toBeInTheDocument()
    expect(getByText('common.purpose.ci.continuous')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })
})
