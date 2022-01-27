/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { renderHook } from '@testing-library/react-hooks'
import { TestWrapper } from '@common/utils/testUtils'
import { Experiences } from '@common/constants/Utils'
import { useUpdateLSDefaultExperience } from '../useUpdateLSDefaultExperience'

const updateLSDefaultExperienceMock = jest.fn()
jest.mock('@common/hooks/useUpdateLSDefaultExperience', () => {
  return {
    useUpdateLSDefaultExperience: () => {
      return { updateLSDefaultExperience: updateLSDefaultExperienceMock }
    }
  }
})
describe('useUpdateLSDefaultExperience', () => {
  test('useUpdateLSDefaultExperience', () => {
    const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
      <TestWrapper pathParams={{ accountId: '123' }}>{children}</TestWrapper>
    )
    const { result } = renderHook(() => useUpdateLSDefaultExperience(), { wrapper })
    result.current.updateLSDefaultExperience(Experiences.CG)
    expect(updateLSDefaultExperienceMock).toHaveBeenCalled()
  })
})
