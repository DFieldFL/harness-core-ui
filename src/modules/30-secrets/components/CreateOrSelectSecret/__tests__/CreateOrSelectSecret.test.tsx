/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { noop } from 'lodash-es'
import { render, waitFor, fireEvent, act } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import CreateOrSelectSecret from '../CreateOrSelectSecret'
import connectorsListMockData from './connectorsListMockdata.json'
import secretsListMockData from './secretsListMockData.json'
import connectorDetailsMockData from './getConnectorMock.json'

const successCallback = jest.fn()

jest.mock('services/cd-ng', () => ({
  ...(jest.requireActual('services/cd-ng') as any),
  useGetConnectorList: () => {
    return {
      data: connectorsListMockData,
      refetch: jest.fn()
    }
  },
  useGetConnector: () => {
    return {
      data: connectorDetailsMockData,
      refetch: jest.fn()
    }
  }
}))

describe('CreateOrSelectSecret', () => {
  test('render', async () => {
    const { container, getByText } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'dummy' }}>
        <CreateOrSelectSecret
          type="SecretText"
          onSuccess={successCallback}
          secretsListMockData={secretsListMockData as any}
          handleInlineSSHSecretCreation={noop}
        />
      </TestWrapper>
    )

    await waitFor(() => {
      expect(getByText('demo-1')).toBeDefined()
    })
    expect(container).toMatchSnapshot()
    const $secret = getByText('demo-1')
    await act(async () => {
      fireEvent.click($secret)
    })

    const $applyBtn = getByText('entityReference.apply')
    await act(async () => {
      fireEvent.click($applyBtn)
    })

    expect(successCallback).toHaveBeenCalled()
  })
})
