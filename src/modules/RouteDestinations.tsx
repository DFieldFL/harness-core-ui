import React, { Suspense } from 'react'
import { Switch, Route, Link, useRouteMatch } from 'react-router-dom'

// import RoutesTemp from 'nav/Routes1'

import { ModalProvider } from '@wings-software/uicore'
import AccessControlRoutes from 'accesscontrol/AccessControlRoutes'
import delegatesRoutes from '@delegates/RouteDestinations'
import commonRoutes from '@common/RouteDestinations'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'

import rbacRoutes from '@rbac/RouteDestinations'

import projectsOrgsRoutes from '@projects-orgs/RouteDestinations'
import connectorRoutes from '@connectors/RouteDestinations'
import userProfileRoutes from '@user-profile/RouteDestinations'
import '@pipeline/RouteDestinations'
import '@templates-library/RouteDestinations'
import CDRoutes from '@cd/RouteDestinations'
import CIRoutes from '@ci/RouteDestinations'
import CVRoutes from '@cv/RouteDestinations'
import CFRoutes from '@cf/RouteDestinations'
import CERoutes from '@ce/RouteDestinations'
import DASHBOARDRoutes from '@dashboards/RouteDestinations'
import AccountSideNav from '@common/components/AccountSideNav/AccountSideNav'
import type { SidebarContext } from '@common/navigation/SidebarProvider'

import NotFoundPage from '@common/pages/404/NotFoundPage'
import { AppStoreContext, useAppStore } from 'framework/AppStore/AppStoreContext'

import UseCreateSecretModalReturn from '@secrets/modals/CreateSecretModal/useCreateUpdateSecretModal'

// eslint-disable-next-line import/no-unresolved
export const AccountSideNavProps: SidebarContext = {
  navComponent: AccountSideNav,
  icon: 'nav-settings',
  title: 'Account Settings'
}
const CurrentUserDetails = () => {
  const { currentUserInfo, updateAppStore } = useAppStore()
  return (
    <div>
      <h4>Current user email id in NGUI: {currentUserInfo.email} </h4>

      <button
        onClick={() => {
          updateAppStore({
            currentUserInfo: {
              email: 'Changed email id from NGUI latest'
            }
          })
        }}
      >
        change email id from NGUI
      </button>
    </div>
  )
}
function CD() {
  const { url } = useRouteMatch()
  return (
    <div>
      <h2>CD App</h2>
      <ul>
        <li>
          <Link to={`${url}/home`}>Access Control Home</Link>
        </li>
        <CurrentUserDetails />
      </ul>
      <Suspense fallback={<h1>Still Loading…</h1>}>
        {AccessControlRoutes({
          commonComponents: { secrets: UseCreateSecretModalReturn },
          parentContextObj: { parentContext: { appStoreContext: AppStoreContext } },
          renderUrl: url
        })}
      </Suspense>
    </div>
  )
}
export default function RouteDestinations(): React.ReactElement {
  const { CDNG_ENABLED, CVNG_ENABLED, CING_ENABLED, CENG_ENABLED, CFNG_ENABLED } = useFeatureFlags()
  return (
    <Switch>
      {...commonRoutes.props.children}
      {...rbacRoutes.props.children}
      {...delegatesRoutes.props.children}
      {...projectsOrgsRoutes.props.children}
      {...DASHBOARDRoutes.props.children}
      {...connectorRoutes.props.children}
      {...userProfileRoutes.props.children}

      {...CING_ENABLED ? CIRoutes.props.children : []}
      {...CDNG_ENABLED ? CDRoutes.props.children : []}
      {...CVNG_ENABLED ? CVRoutes.props.children : []}

      <Route path="/account/:accountId/childapp">
        {/* <RoutesTemp contextObj={AppStoreContext} /> */}
        <ModalProvider>
          <CD />
        </ModalProvider>
      </Route>

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
