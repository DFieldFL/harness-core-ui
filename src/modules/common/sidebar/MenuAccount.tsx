import { Container, Layout } from '@wings-software/uikit'
import { linkTo, Sidebar, isRouteActive } from 'framework/exports'
import React from 'react'
import * as routes from '../routes'
import i18n from './MenuAccount.i18n'

export const MenuAccount: React.FC = () => {
  return (
    <Layout.Vertical spacing="medium">
      <Sidebar.Title upperText={i18n.account} lowerText={i18n.settings} />
      <Container style={{ marginTop: '25px' }}>
        <Layout.Vertical>
          <Sidebar.Link
            href={linkTo(routes.routeAdmin)}
            label={i18n.admin}
            icon="nav-account-admin"
            selected={isRouteActive(routes.routeAdmin)}
          />
          <Sidebar.Link
            href={linkTo(routes.routeOrganizations)}
            label={i18n.organizations}
            icon="nav-organization-hover"
            selected={isRouteActive(routes.routeOrganizations)}
          />
          <Sidebar.Link
            href={linkTo(routes.routeGovernance)}
            label={i18n.governance}
            icon="nav-governance"
            selected={isRouteActive(routes.routeGovernance)}
          />
          {/* <Sidebar.Link
            href={linkTo(routes.routeResources)}
            label={i18n.resources}
            icon="nav-resources"
            selected={isRouteActive(routes.routeResources)}
          /> */}
        </Layout.Vertical>
      </Container>
    </Layout.Vertical>
  )
}
