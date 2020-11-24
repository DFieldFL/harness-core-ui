import React from 'react'
import { fireEvent, render, RenderResult, waitFor } from '@testing-library/react'
import { TestWrapper } from '@common/utils/testUtils'
import { routeOrganizations, routeOrgGitSync, routeOrgGovernance, routeOrgResources } from 'navigation/accounts/routes'
import { routeProjects } from 'navigation/projects/routes'
import OrganizationDetailsPage from '../OrganizationDetails/OrganizationDetailsPage'
import { getOrgMockData } from './OrganizationsMockData'

jest.mock('services/cd-ng', () => ({
  useGetOrganization: jest.fn().mockImplementation(() => {
    return { ...getOrgMockData, refetch: jest.fn(), error: null, loading: false }
  })
}))
describe('Organization Details', () => {
  let container: HTMLElement
  let getByText: RenderResult['getByText']
  let getByTestId: RenderResult['getByTestId']
  beforeEach(async () => {
    const renderObj = render(
      <TestWrapper
        path="/account/:accountId/organizations/:orgIdentifier"
        pathParams={{ accountId: 'testAcc', orgIdentifier: 'testOrg' }}
      >
        <OrganizationDetailsPage />
      </TestWrapper>
    )
    container = renderObj.container
    getByText = renderObj.getByText
    getByTestId = renderObj.getByTestId
  })
  test('Render', async () => {
    expect(container).toMatchSnapshot()
  }),
    test('View Projects', async () => {
      const viewProjects = getByText('View Projects')
      fireEvent.click(viewProjects)
      await waitFor(() => getByTestId('location'))
      expect(
        getByTestId('location').innerHTML.endsWith(
          `${routeProjects.url()}?orgId=${getOrgMockData.data.data.identifier}`
        )
      ).toBeTruthy()
    }),
    test('Manage Organizations', async () => {
      const back = getByText('Manage Organizations /')
      fireEvent.click(back)
      await waitFor(() => getByTestId('location'))
      expect(getByTestId('location').innerHTML.endsWith(routeOrganizations.url())).toBeTruthy()
    }),
    test('Route Resources', async () => {
      const resources = getByText('Resources')
      fireEvent.click(resources)
      await waitFor(() => getByTestId('location'))
      expect(
        getByTestId('location').innerHTML.endsWith(
          routeOrgResources.url({ orgIdentifier: getOrgMockData.data.data.identifier })
        )
      ).toBeTruthy()
    }),
    test('Route Governance', async () => {
      const governance = getByText('Governance')
      fireEvent.click(governance)
      await waitFor(() => getByTestId('location'))
      expect(
        getByTestId('location').innerHTML.endsWith(
          routeOrgGovernance.url({ orgIdentifier: getOrgMockData.data.data.identifier })
        )
      ).toBeTruthy()
    }),
    test('Route Git Sync', async () => {
      const git = getByText('Git Sync')
      fireEvent.click(git)
      await waitFor(() => getByTestId('location'))
      expect(
        getByTestId('location').innerHTML.endsWith(
          routeOrgGitSync.url({ orgIdentifier: getOrgMockData.data.data.identifier })
        )
      ).toBeTruthy()
    })
})
