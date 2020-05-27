import { FocusStyleManager } from '@blueprintjs/core'
import type { Route } from 'framework'
import { LayoutManager } from 'framework/layout/LayoutManager'
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { HashRouter, Route as ReactRoute, Switch } from 'react-router-dom'
import { RouteMounter } from '../route/RouteMounter'
import { routeRegistry } from 'framework/registry'
import { AppStoreProvider } from '../hooks/useAppStore'
import './app.scss'

FocusStyleManager.onlyShowFocusOnTabs()

// TODO: Move this thing out
const AppShell: React.FC = ({ children }) => {
  return <>{children}</>
}

const App: React.FC = () => {
  const [activeRouteInfo, setActiveRouteInfo] = useState<Route>()

  return (
    <AppStoreProvider>
      <HashRouter>
        <AppShell>
          <LayoutManager route={activeRouteInfo}>
            <Switch>
              {Object.values(routeRegistry).map(route => (
                <ReactRoute path={route.path} key={route.path}>
                  <RouteMounter route={route} onEnter={setActiveRouteInfo} />
                </ReactRoute>
              ))}
            </Switch>
          </LayoutManager>
        </AppShell>
      </HashRouter>
    </AppStoreProvider>
  )
}

ReactDOM.render(<App />, document.getElementById('react-root'))
