/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import { TestWrapper } from '@common/utils/testUtils'
import * as managerServices from 'services/cd-ng'
import CopyGroupForm from '../CopyGroupForm'
import { orgData } from './mockData'

jest
  .spyOn(managerServices, 'useGetOrganizationAggregateDTOList')
  .mockImplementation(() => ({ data: orgData, loading: false } as any))

describe('Copy group form test', () => {
  test('render', async () => {
    const renderObj = render(
      <TestWrapper>
        <CopyGroupForm closeModal={jest.fn} identifier="dummy_identifier" />
      </TestWrapper>
    )
    const orgDropdown = renderObj.container.querySelectorAll('.bp3-popover-target')[0]

    await act(async () => {
      fireEvent.click(orgDropdown)
    })

    expect(renderObj.container).toMatchSnapshot()
  })
})
