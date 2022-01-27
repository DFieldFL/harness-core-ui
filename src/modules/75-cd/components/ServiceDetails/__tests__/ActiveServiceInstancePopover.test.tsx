/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { ActiveServiceInstancePopover } from '@cd/components/ServiceDetails/ActiveServiceInstances/ActiveServiceInstancePopover'
import * as cdngServices from 'services/cd-ng'
import { mockserviceInstanceDetails } from './mocks'

jest
  .spyOn(cdngServices, 'useGetActiveInstancesByServiceIdEnvIdAndBuildIds')
  .mockImplementation(() => mockserviceInstanceDetails as any)

describe('ActiveServiceInstancePopover', () => {
  test('should render ActiveServiceInstancePopover', () => {
    const { container } = render(
      <TestWrapper
        path="account/:accountId/cd/orgs/:orgIdentifier/projects/:projectIdentifier/services"
        pathParams={{ accountId: 'dummy', orgIdentifier: 'dummy', projectIdentifier: 'dummy' }}
      >
        <ActiveServiceInstancePopover buildId="buildId" envId="envId" instanceNum={0} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
