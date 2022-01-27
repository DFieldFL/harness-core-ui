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
import * as usePlanEnforcementMock from '@cf/hooks/usePlanEnforcement'
import UsageLimitBanner from '../UsageLimitBanner'

const renderComponent = (): void => {
  render(
    <TestWrapper
      path="/account/:accountId/cf/orgs/:orgIdentifier/projects/:projectIdentifier/feature-flags"
      pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
    >
      <UsageLimitBanner />
    </TestWrapper>
  )
}

describe('UsageLimitBanner', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  beforeEach(() =>
    jest.spyOn(usePlanEnforcementMock, 'default').mockReturnValue({ isPlanEnforcementEnabled: true, isFreePlan: true })
  )

  describe('Team/Enterprise Plan', () => {
    beforeAll(() => {
      jest
        .spyOn(licenseStoreContextMock, 'useLicenseStore')
        .mockReturnValue({ licenseInformation: { CF: { edition: 'ENTERPRISE' } } } as any)
    })

    test('it should render correct message and links when limit lower boundary reached (90%)', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeClientMAUs: { count: 4500 } } } },
        limitData: { limit: { ff: { totalClientMAUs: 5000 } } }
      })

      renderComponent()

      // assert text
      expect(screen.getByText('cf.planEnforcement.teamEnterprisePlan.approachingLimit')).toBeInTheDocument()

      // assert links
      expect(screen.getByText('common.manageSubscription')).toBeInTheDocument()
    })

    test('it should render correct message and links when limit upper boundary reached (99%)', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeClientMAUs: { count: 4999 } } } },
        limitData: { limit: { ff: { totalClientMAUs: 5000 } } }
      })

      renderComponent()

      // assert text
      expect(screen.getByText('cf.planEnforcement.teamEnterprisePlan.approachingLimit')).toBeInTheDocument()

      // assert links
      expect(screen.getByText('common.manageSubscription')).toBeInTheDocument()
    })

    test('it should render correct message and links when limit reached (100%)', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeClientMAUs: { count: 5000 } } } },
        limitData: { limit: { ff: { totalClientMAUs: 5000 } } }
      })

      renderComponent()

      // assert text
      expect(screen.getByText('cf.planEnforcement.teamEnterprisePlan.upgradeRequired')).toBeInTheDocument()

      // assert links
      expect(screen.getByText('common.manageSubscription')).toBeInTheDocument()
    })

    test('it should render correct message and links when passed limit (over 100%)', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeClientMAUs: { count: 5001 } } } },
        limitData: { limit: { ff: { totalClientMAUs: 5000 } } }
      })

      renderComponent()

      // assert text
      expect(screen.getByText('cf.planEnforcement.teamEnterprisePlan.upgradeRequired')).toBeInTheDocument()

      // assert links
      expect(screen.getByText('common.manageSubscription')).toBeInTheDocument()
    })

    test('it should not render banner when MAU count is below lower limit (90%)', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeClientMAUs: { count: 100 } } } },
        limitData: { limit: { ff: { totalClientMAUs: 5000 } } }
      })

      renderComponent()

      // assert text
      expect(screen.queryByText('cf.planEnforcement.teamEnterprisePlan.upgradeRequired')).not.toBeInTheDocument()

      // assert links
      expect(screen.queryByText('common.manageSubscription')).not.toBeInTheDocument()
    })

    test('it should not render banner if MAU count is 0', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeClientMAUs: { count: 0 } } } },
        limitData: { limit: { ff: { totalClientMAUs: 5000 } } }
      })

      renderComponent()

      // assert text
      expect(screen.queryByText('cf.planEnforcement.teamEnterprisePlan.upgradeRequired')).not.toBeInTheDocument()

      // assert links
      expect(screen.queryByText('common.manageSubscription')).not.toBeInTheDocument()
    })
  })

  describe('Free Plan Tests', () => {
    beforeAll(() => {
      jest
        .spyOn(licenseStoreContextMock, 'useLicenseStore')
        .mockReturnValue({ licenseInformation: { CF: { edition: 'FREE' } } } as any)
    })

    test('it should render correct message and links when limit lower boundary reached (90%)', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeClientMAUs: { count: 4500 } } } },
        limitData: { limit: { ff: { totalClientMAUs: 5000 } } }
      })

      renderComponent()

      // assert text
      expect(screen.getByText('cf.planEnforcement.freePlan.approachingLimit')).toBeInTheDocument()

      // assert links
      expect(screen.getByText('Common.viewusage')).toBeInTheDocument()
      expect(screen.getByText('common.explorePlans')).toBeInTheDocument()
    })

    test('it should render correct message and links when limit upper boundary reached (99%)', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeClientMAUs: { count: 4999 } } } },
        limitData: { limit: { ff: { totalClientMAUs: 5000 } } }
      })

      renderComponent()

      // assert text
      expect(screen.getByText('cf.planEnforcement.freePlan.approachingLimit')).toBeInTheDocument()

      // assert links
      expect(screen.getByText('Common.viewusage')).toBeInTheDocument()
      expect(screen.getByText('common.explorePlans')).toBeInTheDocument()
    })

    test('it should render correct message and links when limit reached (100%)', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeClientMAUs: { count: 5000 } } } },
        limitData: { limit: { ff: { totalClientMAUs: 5000 } } }
      })

      renderComponent()

      // assert text
      expect(screen.getByText('COMMON.FEATURE.UPGRADEREQUIRED.TITLE')).toBeInTheDocument()
      expect(screen.getByText('cf.planEnforcement.freePlan.upgradeRequired')).toBeInTheDocument()

      // assert links
      expect(screen.getByText('Common.viewusage')).toBeInTheDocument()
      expect(screen.getByText('common.explorePlans')).toBeInTheDocument()
    })

    test('it should render correct message and links when passed limit (over 100%)', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeClientMAUs: { count: 5001 } } } },
        limitData: { limit: { ff: { totalClientMAUs: 5000 } } }
      })

      renderComponent()

      // assert text
      expect(screen.getByText('COMMON.FEATURE.UPGRADEREQUIRED.TITLE')).toBeInTheDocument()
      expect(screen.getByText('cf.planEnforcement.freePlan.upgradeRequired')).toBeInTheDocument()

      // assert links
      expect(screen.getByText('Common.viewusage')).toBeInTheDocument()
      expect(screen.getByText('common.explorePlans')).toBeInTheDocument()
    })

    test('it should not render banner when MAU count is below lower limit (90%)', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeClientMAUs: { count: 100 } } } },
        limitData: { limit: { ff: { totalClientMAUs: 5000 } } }
      })

      renderComponent()

      // assert text
      expect(screen.queryByText('COMMON.FEATURE.UPGRADEREQUIRED.TITLE')).not.toBeInTheDocument()
      expect(screen.queryByText('cf.planEnforcement.freePlan.upgradeRequired')).not.toBeInTheDocument()

      // assert links
      expect(screen.queryByText('Common.viewusage')).not.toBeInTheDocument()
      expect(screen.queryByText('common.explorePlans')).not.toBeInTheDocument()
    })

    test('it should not render banner when MAU count is 0', async () => {
      jest.spyOn(useGetUsageAndLimitMock, 'useGetUsageAndLimit').mockReturnValue({
        usageData: { usage: { ff: { activeClientMAUs: { count: 0 } } } },
        limitData: { limit: { ff: { totalClientMAUs: 5000 } } }
      })

      renderComponent()

      // assert text
      expect(screen.queryByText('COMMON.FEATURE.UPGRADEREQUIRED.TITLE')).not.toBeInTheDocument()
      expect(screen.queryByText('cf.planEnforcement.freePlan.upgradeRequired')).not.toBeInTheDocument()

      // assert links
      expect(screen.queryByText('Common.viewusage')).not.toBeInTheDocument()
      expect(screen.queryByText('common.explorePlans')).not.toBeInTheDocument()
    })
  })
})
