import { FocusStyleManager } from '@blueprintjs/core'
import type { RouteEntry } from 'framework'
import { LayoutManager } from 'framework/layout/LayoutManager'
import React, { useState } from 'react'
import ReactDOM from 'react-dom'
import { RecoilRoot } from 'recoil'
import { HashRouter, Route, Switch } from 'react-router-dom'
import { RouteMounter } from '../route/RouteMounter'
// import AppShell from './AppShell'
import { Routes } from 'modules'
import './app.scss'

FocusStyleManager.onlyShowFocusOnTabs()

// TODO: Move this thing out
const AppShell: React.FC = ({ children }) => {
  console.log('AppShell')
  return <>{children}</>
}

const App: React.FC = () => {
  const [activeRouteEntry, setActiveRouteEntry] = useState<RouteEntry>()

  return (
    <HashRouter>
      <RecoilRoot>
        <AppShell>
          <LayoutManager routeEntry={activeRouteEntry}>
            <Switch>
              {Object.values(Routes).map(routeEntry => (
                <Route path={routeEntry.path} key={routeEntry.path}>
                  <RouteMounter routeEntry={routeEntry} onEnter={setActiveRouteEntry} />
                </Route>
              ))}
            </Switch>
          </LayoutManager>
        </AppShell>
      </RecoilRoot>
    </HashRouter>
  )
}

ReactDOM.render(<App />, document.getElementById('react-root'))
