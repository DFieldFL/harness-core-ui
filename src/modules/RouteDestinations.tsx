import React from 'react'
import { Switch, Route } from 'react-router-dom'

import delegatesRoutes from '@delegates/RouteDestinations'
import commonRoutes from '@common/RouteDestinations'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import authSettingsRoutes from '@auth-settings/RouteDestinations'
import secretsRoutes from '@secrets/RouteDestinations'
import rbacRoutes from '@rbac/RouteDestinations'
import projectsOrgsRoutes from '@projects-orgs/RouteDestinations'
import connectorRoutes from '@connectors/RouteDestinations'
import userProfileRoutes from '@user-profile/RouteDestinations'
import '@pipeline/RouteDestinations'
import templatesRoutes from '@templates-library/RouteDestination'
import CDRoutes from '@cd/RouteDestinations'
import CIRoutes from '@ci/RouteDestinations'
import CVRoutes from '@cv/RouteDestinations'
import ArgoRoutes from '@argo/RouteDestinations'
import CFRoutes from '@cf/RouteDestinations'
import CERoutes from '@ce/RouteDestinations'
import DASHBOARDRoutes from '@dashboards/RouteDestinations'
import NotFoundPage from '@common/pages/404/NotFoundPage'

export default function RouteDestinations(): React.ReactElement {
  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED, NG_TEMPLATES_LIBRARY_ENABLED } =
    useFeatureFlags()

  return (
    <Switch>
      {...commonRoutes.props.children}
      {...authSettingsRoutes.props.children}
      {...secretsRoutes.props.children}
      {...rbacRoutes.props.children}
      {...delegatesRoutes.props.children}
      {...projectsOrgsRoutes.props.children}
      {...DASHBOARDRoutes.props.children}
      {...connectorRoutes.props.children}
      {...userProfileRoutes.props.children}
      {...NG_TEMPLATES_LIBRARY_ENABLED ? templatesRoutes.props.children : []}
      {...CING_ENABLED ? CIRoutes.props.children : []}
      {...CDNG_ENABLED ? CDRoutes.props.children : []}
      {...CVNG_ENABLED ? CVRoutes.props.children : []}
      {...ArgoRoutes.props.children}
      {CENG_ENABLED ? (
        <Route path="/account/:accountId/:module(ce)">
          <CERoutes />
        </Route>
      ) : null}
      {...CFNG_ENABLED ? CFRoutes.props.children : []}
      <Route path="*">
        <NotFoundPage />
      </Route>
    </Switch>
  )
}
