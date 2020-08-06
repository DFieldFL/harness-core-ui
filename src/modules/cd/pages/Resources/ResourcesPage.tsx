import React from 'react'
import { Layout, Container } from '@wings-software/uikit'
import cx from 'classnames'
import { Route, Switch } from 'react-router'
import { Link, useRouteMatch, Redirect } from 'react-router-dom'
import { Page } from 'modules/common/exports'
import ConnectorsList from 'modules/dx/pages/connectors/ConnectorsList'
import SecretsPage from 'modules/dx/pages/secrets/SecretsPage'
import SecretDetails from 'modules/dx/pages/secretDetails/SecretDetails'
import i18n from './ResourcesPage.i18n'
import css from './ResourcesPage.module.scss'

interface Categories {
  [key: string]: string
}

const categories: Categories = {
  connectors: i18n.connectors,
  secrets: i18n.secrets,
  delegates: i18n.delegates,
  templates: i18n.templates,
  fileStore: i18n.fileStore
}

const ResourcesPage: React.FC = () => {
  const { path, url } = useRouteMatch()

  const [activeCategory, setActiveCategory] = React.useState(1)

  return (
    <>
      <Page.Header
        title={i18n.title}
        toolbar={
          <Container>
            <Layout.Horizontal spacing="medium">
              {Object.keys(categories).map((data, index) => {
                return (
                  <Link
                    className={cx(css.tags, activeCategory === index && css.activeTag)}
                    onClick={() => setActiveCategory(index)}
                    key={data + index}
                    to={`${url}/${data}`}
                  >
                    {categories[data]}
                  </Link>
                )
              })}
            </Layout.Horizontal>
          </Container>
        }
      />
      <Page.Body>
        <Switch>
          <Redirect exact from={`${path}/`} to={`${path}/connectors`} />
          <Route path={`${path}/connectors`} component={ConnectorsList} />
          <Route path={`${path}/secrets/:secretId`} component={SecretDetails} />
          <Route path={`${path}/secrets`} component={SecretsPage} />
        </Switch>
      </Page.Body>
    </>
  )
}

export default ResourcesPage
