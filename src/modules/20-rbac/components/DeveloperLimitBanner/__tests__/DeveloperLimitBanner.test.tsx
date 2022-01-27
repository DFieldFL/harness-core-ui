/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as useGetUsageAndLimitMock from '@common/hooks/useGetUsageAndLimit'
import * as licenseStoreContextMock from 'framework/LicenseStore/LicenseStoreContext'
import * as useFeatureFlagMock from '@common/hooks/useFeatureFlag'
import routes from '@common/RouteDefinitions'
import DeveloperLimitBanner from '../DeveloperLimitBanner'

const renderComponent = (): void => {
  render(
    <TestWrapper path={routes.toCFProject({ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' })}>
      <DeveloperLimitBanner />
    </TestWrapper>
  )
}

describe('DeveloperLimitBanner', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  beforeEach(() => jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(true))

  test('it should not render if feature flag is disabled', async () => {
    jest.spyOn(useFeatureFlagMock, 'useFeatureFlag').mockReturnValue(false)

    jest
      .spyOn(licenseStoreContextMock, 'useLicenseStore')
      .mockReturnValue({ licenseInformation: { CF: { edition: 'ENTERPRISE', licenseType: 'PAID' } } } as any)

    jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
      usageData: { usage: { ff: { activeFeatureFlagUsers: { count: 100 } } } },
      limitData: { limit: { ff: { totalFeatureFlagUnits: 100 } } }
    })

    renderComponent()

    // assert text
    expect(screen.queryByText('rbac.planEnforcement.ff.teamEnterprisePlan.upgradeRequired')).not.toBeInTheDocument()
    expect(screen.queryByText('rbac.planEnforcement.ff.teamEnterprisePlan.approachingLimit')).not.toBeInTheDocument()

    // assert links
    expect(screen.queryByText('common.manageSubscription')).not.toBeInTheDocument()
  })

  describe('Team/Enterprise Plan', () => {
    beforeAll(() => {
      jest
        .spyOn(licenseStoreContextMock, 'useLicenseStore')
        .mockReturnValue({ licenseInformation: { CF: { edition: 'ENTERPRISE', licenseType: 'PAID' } } } as any)
    })

    test('it should render correct message and links when limit lower boundary reached (90%)', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeFeatureFlagUsers: { count: 90 } } } },
        limitData: { limit: { ff: { totalFeatureFlagUnits: 100 } } }
      })

      renderComponent()

      // assert text
      expect(screen.getByText('rbac.planEnforcement.ff.teamEnterprisePlan.approachingLimit')).toBeInTheDocument()

      // assert links
      expect(screen.getByText('common.manageSubscription')).toBeInTheDocument()
    })

    test('it should render correct message and links when limit upper boundary reached (99%)', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeFeatureFlagUsers: { count: 99 } } } },
        limitData: { limit: { ff: { totalFeatureFlagUnits: 100 } } }
      })

      renderComponent()

      // assert text
      expect(screen.getByText('rbac.planEnforcement.ff.teamEnterprisePlan.approachingLimit')).toBeInTheDocument()

      // assert links
      expect(screen.getByText('common.manageSubscription')).toBeInTheDocument()
    })

    test('it should render correct message and links when limit reached (100%)', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeFeatureFlagUsers: { count: 100 } } } },
        limitData: { limit: { ff: { totalFeatureFlagUnits: 100 } } }
      })

      renderComponent()

      // assert text
      expect(screen.getByText('rbac.planEnforcement.ff.teamEnterprisePlan.upgradeRequired')).toBeInTheDocument()

      // assert links
      expect(screen.getByText('common.manageSubscription')).toBeInTheDocument()
    })

    test('it should render correct message and links when passed limit (over 100%)', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeFeatureFlagUsers: { count: 101 } } } },
        limitData: { limit: { ff: { totalFeatureFlagUnits: 100 } } }
      })

      renderComponent()

      // assert text
      expect(screen.getByText('rbac.planEnforcement.ff.teamEnterprisePlan.upgradeRequired')).toBeInTheDocument()

      // assert links
      expect(screen.getByText('common.manageSubscription')).toBeInTheDocument()
    })

    test('it should not render banner when MAU count is below lower limit (90%)', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeFeatureFlagUsers: { count: 89 } } } },
        limitData: { limit: { ff: { totalFeatureFlagUnits: 100 } } }
      })

      renderComponent()

      // assert text
      expect(screen.queryByText('rbac.planEnforcement.ff.teamEnterprisePlan.upgradeRequired')).not.toBeInTheDocument()
      expect(screen.queryByText('rbac.planEnforcement.ff.teamEnterprisePlan.approachingLimit')).not.toBeInTheDocument()

      // assert links
      expect(screen.queryByText('common.manageSubscription')).not.toBeInTheDocument()
    })

    test('it should not render banner if user count is 0', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeFeatureFlagUsers: { count: 0 } } } },
        limitData: { limit: { ff: { totalFeatureFlagUnits: 100 } } }
      })

      renderComponent()

      // assert text
      expect(screen.queryByText('rbac.planEnforcement.ff.teamEnterprisePlan.upgradeRequired')).not.toBeInTheDocument()
      expect(screen.queryByText('rbac.planEnforcement.ff.teamEnterprisePlan.approachingLimit')).not.toBeInTheDocument()

      // assert links
      expect(screen.queryByText('common.manageSubscription')).not.toBeInTheDocument()
    })

    describe('Free Plan Tests', () => {
      beforeAll(() => {
        jest
          .spyOn(licenseStoreContextMock, 'useLicenseStore')
          .mockReturnValue({ licenseInformation: { CF: { edition: 'FREE' } } } as any)
      })

      test('it should not render banner for FREE plans', async () => {
        jest
          .spyOn(licenseStoreContextMock, 'useLicenseStore')
          .mockReturnValue({ licenseInformation: { CF: { edition: 'FREE' } } } as any)

        jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
          usageData: { usage: { ff: { activeFeatureFlagUsers: { count: 90 } } } },
          limitData: { limit: { ff: { totalFeatureFlagUnits: 100 } } }
        })

        renderComponent()

        // assert text
        expect(screen.queryByText('rbac.planEnforcement.ff.teamEnterprisePlan.upgradeRequired')).not.toBeInTheDocument()
        expect(
          screen.queryByText('rbac.planEnforcement.ff.teamEnterprisePlan.approachingLimit')
        ).not.toBeInTheDocument()

        // assert links
        expect(screen.queryByText('common.manageSubscription')).not.toBeInTheDocument()
      })

      test('it should not render banner for ENTERPRISE FREE TRIAL plans', async () => {
        jest
          .spyOn(licenseStoreContextMock, 'useLicenseStore')
          .mockReturnValue({ licenseInformation: { CF: { edition: 'ENTERPRISE', licenseType: 'FREE' } } } as any)

        jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
          usageData: { usage: { ff: { activeFeatureFlagUsers: { count: 90 } } } },
          limitData: { limit: { ff: { totalFeatureFlagUnits: 100 } } }
        })

        renderComponent()

        // assert text
        expect(screen.queryByText('rbac.planEnforcement.ff.teamEnterprisePlan.upgradeRequired')).not.toBeInTheDocument()
        expect(
          screen.queryByText('rbac.planEnforcement.ff.teamEnterprisePlan.approachingLimit')
        ).not.toBeInTheDocument()

        // assert links
        expect(screen.queryByText('common.manageSubscription')).not.toBeInTheDocument()
      })

      test('it should not render banner for TEAM FREE TRIAL plans', async () => {
        jest
          .spyOn(licenseStoreContextMock, 'useLicenseStore')
          .mockReturnValue({ licenseInformation: { CF: { edition: 'TEAM', licenseType: 'FREE' } } } as any)

        jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
          usageData: { usage: { ff: { activeFeatureFlagUsers: { count: 90 } } } },
          limitData: { limit: { ff: { totalFeatureFlagUnits: 100 } } }
        })

        renderComponent()

        // assert text
        expect(screen.queryByText('rbac.planEnforcement.ff.teamEnterprisePlan.upgradeRequired')).not.toBeInTheDocument()
        expect(
          screen.queryByText('rbac.planEnforcement.ff.teamEnterprisePlan.approachingLimit')
        ).not.toBeInTheDocument()

        // assert links
        expect(screen.queryByText('common.manageSubscription')).not.toBeInTheDocument()
      })
    })
  })
})
