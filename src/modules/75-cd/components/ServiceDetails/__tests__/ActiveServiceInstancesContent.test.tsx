/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ActiveServiceInstancesContent } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancesContent'
import * as cdngServices from 'services/cd-ng'
import { envBuildInstanceCount } from '@cd/mock'

jest.mock('highcharts-react-official', () => () => <></>)

jest.spyOn(cdngServices, 'useGetEnvBuildInstanceCount').mockImplementation(() => {
  return { loading: false, error: false, data: envBuildInstanceCount, refetch: jest.fn() } as any
})

describe('ActiveServiceInstancesContent', () => {
  test('should render ActiveServiceInstancesContent', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ActiveServiceInstancesContent />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
