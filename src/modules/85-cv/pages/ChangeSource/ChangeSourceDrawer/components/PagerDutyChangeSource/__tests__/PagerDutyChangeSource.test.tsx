import React from 'react'
import type { FormikProps } from 'formik'
import { render, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import * as cvServices from 'services/cv'
import PagerDutyChangeSource from '../PagerDutyChangeSource'
import type { UpdatedChangeSourceDTO } from '../../../ChangeSourceDrawer.types'

describe('Test PagerDuty Change Source', () => {
  test('PagerDuty ChangeSource renders in create mode', async () => {
    jest.spyOn(cvServices, 'useGetServicesFromPagerDuty').mockImplementation(
      () =>
        ({
          loading: false,
          error: null,
          data: {},
          refetch: jest.fn()
        } as any)
    )
    const { container, getByText } = render(
      <TestWrapper>
        <PagerDutyChangeSource
          formik={
            {
              values: {
                spec: {}
              }
            } as FormikProps<UpdatedChangeSourceDTO>
          }
        />
      </TestWrapper>
    )

    await waitFor(() => expect(getByText('cv.changeSource.connectChangeSource')).toBeTruthy())
    await waitFor(() => expect(getByText('cv.changeSource.PageDuty.pagerDutyService')).toBeTruthy())

    expect(container).toMatchSnapshot()
  })
})
