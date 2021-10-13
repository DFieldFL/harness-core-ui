import React from 'react'
import { Route, Switch, Redirect, useHistory } from 'react-router-dom'
import NotFoundPage from '@common/pages/404/NotFoundPage'
import routes from '@common/RouteDefinitions'
import AppStorage from 'framework/utils/AppStorage'
import LoginPage from '@common/pages/login/LoginPage'
import SignupPage from '@common/pages/signup/SignupPage'
import { getLoginPageURL } from 'framework/utils/SessionUtils'
import RedirectPage from '@common/pages/redirect/Redirect'
import { returnUrlParams } from '@common/utils/routeUtils'

const RedirectToHome: React.FC = () => {
  const history = useHistory()
  const accountId = AppStorage.get('acctId')
  if (accountId) {
    return <Redirect to={routes.toHome({ accountId })} />
  } else {
    history.push({ pathname: routes.toRedirect(), search: returnUrlParams(getLoginPageURL({})) })
    return null
  }
}

const RouteDestinationsWithoutAuth: React.FC = () => {
  return (
    <Switch>
      <Route exact path="/">
        <RedirectToHome />
      </Route>
      {__DEV__ ? (
        <Route path={routes.toLogin()}>
          <LoginPage />
        </Route>
      ) : null}
      {__DEV__ ? (
        <Route path={routes.toSignup()}>
          <SignupPage />
        </Route>
      ) : null}
      <Route path={routes.toRedirect()}>
        <RedirectPage />
      </Route>
      <Route path="*">
        <NotFoundPage />
      </Route>
    </Switch>
  )
}

export default RouteDestinationsWithoutAuth
