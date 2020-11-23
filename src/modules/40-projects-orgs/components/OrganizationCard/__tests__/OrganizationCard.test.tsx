import React from 'react'
import { render } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import type { Organization } from 'services/cd-ng'
import { OrganizationCard } from '@projects-orgs/components/OrganizationCard/OrganizationCard'

const organization: Organization = {
  accountIdentifier: 'dummy',
  identifier: 'orgId',
  name: 'Name',
  description: 'Organization Description ',
  tags: { tag1: '', tag2: 'tag3' }
}

describe('Organization Card test', () => {
  test('initializes ok ', async () => {
    const { container } = render(
      <TestWrapper path="/account/:accountId" pathParams={{ accountId: 'testAcc' }}>
        <OrganizationCard data={organization} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
