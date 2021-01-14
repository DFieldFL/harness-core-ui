import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import routes from '@common/RouteDefinitions'
import { accountPathProps } from '@common/utils/routeUtils'
import GenericErrorPage from './GenericErrorPage'

describe('Generic Error Page', () => {
  test('valid error code', () => {
    const { container } = render(
      <TestWrapper
        path={routes.toGenericError({ ...accountPathProps })}
        pathParams={{ accountId: 'dummy' }}
        queryParams={{ code: 'INVITE_EXPIRED' }}
      >
        <GenericErrorPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
  })

  test('invalid error code', () => {
    const message = 'error message'
    const { container, getByText } = render(
      <TestWrapper
        path={routes.toGenericError({ ...accountPathProps })}
        pathParams={{ accountId: 'dummy' }}
        queryParams={{ code: 'DOESNT_EXIST', message }}
      >
        <GenericErrorPage />
      </TestWrapper>
    )

    expect(container).toMatchSnapshot()
    expect(getByText(message)).toBeTruthy()
  })
})
