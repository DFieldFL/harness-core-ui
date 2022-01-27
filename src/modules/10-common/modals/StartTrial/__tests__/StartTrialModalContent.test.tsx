/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'

import { TestWrapper } from '@common/utils/testUtils'
import type { Module } from '@common/interfaces/RouteInterfaces'

import { Editions } from '@common/constants/SubscriptionTypes'
import { useLicenseStore } from 'framework/LicenseStore/LicenseStoreContext'
import { useUpdateAccountDefaultExperienceNG } from 'services/cd-ng'
import StartTrialModalContent, { StartTrialModalContentProps } from '../StartTrialModalContent'

jest.mock('framework/LicenseStore/LicenseStoreContext')
const useLicenseStoreMock = useLicenseStore as jest.MockedFunction<any>
jest.mock('services/cd-ng')
const useUpdateAccountDefaultExperienceNGMock = useUpdateAccountDefaultExperienceNG as jest.MockedFunction<any>
const updateLSDefaultExperienceMock = jest.fn()
jest.mock('@common/hooks/useUpdateLSDefaultExperience', () => ({
  useUpdateLSDefaultExperience: jest.fn().mockImplementation(() => {
    return { updateLSDefaultExperience: updateLSDefaultExperienceMock }
  })
}))
useLicenseStoreMock.mockImplementation(() => {
  return {
    licenseInformation: {}
  }
})
const updateDefaultExperience = jest.fn(() => Promise.resolve({}))
useUpdateAccountDefaultExperienceNGMock.mockImplementation(() => {
  return { mutate: updateDefaultExperience }
})

describe('StartTrialModalContent', () => {
  describe('Rendering', () => {
    test('that the content renders', () => {
      const props = {
        handleStartTrial: jest.fn(),
        module: 'ce' as Module
      }

      const { container, getByText } = render(
        <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
          <StartTrialModalContent {...props} />
        </TestWrapper>
      )
      expect(getByText('common.purpose.ce.description')).toBeDefined()
      expect(container).toMatchSnapshot()
    })

    test('test that the warning container renders', async () => {
      const props = {
        handleStartTrial: jest.fn(),
        module: 'ce' as Module
      }

      const { container, getByText } = render(
        <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
          <StartTrialModalContent {...props} />
        </TestWrapper>
      )
      expect(getByText('common.purpose.ce.description')).toBeDefined()

      expect(container).toMatchSnapshot()
    })

    test('test that adding a source query param updates the button text', async () => {
      const startTrialMock = jest.fn()

      const props = {
        handleStartTrial: startTrialMock,
        module: 'ce' as Module
      }

      const { container } = render(
        <TestWrapper
          path="/account/:accountId"
          queryParams={{ source: 'signup' }}
          pathParams={{ accountId: 'testAcc' }}
        >
          <StartTrialModalContent {...props} />
        </TestWrapper>
      )

      expect(container).toMatchSnapshot()
    })

    test('Trial Modal with one license', () => {
      useLicenseStoreMock.mockImplementation(() => {
        return {
          licenseInformation: { CE: { edition: Editions.FREE } }
        }
      })
      const props: StartTrialModalContentProps = {
        handleStartTrial: jest.fn(),
        module: 'cd' as Module
      }
      const { container, getByText } = render(
        <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
          <StartTrialModalContent {...props} />
        </TestWrapper>
      )

      fireEvent.click(getByText('common.purpose.cd.1stGen.title'))
      fireEvent.click(getByText('common.launchFirstGen'))
      expect(updateDefaultExperience).not.toBeCalled()

      expect(container).toMatchSnapshot()
    })

    test('Trial Modal with no licenses ', async () => {
      useLicenseStoreMock.mockImplementation(() => {
        return {
          licenseInformation: {}
        }
      })
      const props: StartTrialModalContentProps = {
        handleStartTrial: jest.fn(),
        module: 'cd' as Module
      }

      const { getByText } = render(
        <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
          <StartTrialModalContent {...props} />
        </TestWrapper>
      )
      fireEvent.click(getByText('common.purpose.cd.1stGen.title'))
      fireEvent.click(getByText('common.launchFirstGen'))
      await waitFor(() => expect(updateDefaultExperience).toHaveBeenCalled())
      expect(updateLSDefaultExperienceMock).toHaveBeenCalled()
    })
  })
})
