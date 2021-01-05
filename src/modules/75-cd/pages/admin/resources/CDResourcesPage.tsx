import { Container, Layout } from '@wings-software/uicore'
import React from 'react'
import { NavLink, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/exports'
import i18n from './CDResourcesPage.i18n'
import css from './CDResourcesPage.module.scss'

const CDResourcesPage: React.FC = ({ children }) => {
  const { orgIdentifier, projectIdentifier, accountId } = useParams()
  return (
    <>
      <Page.Header
        title={i18n.title}
        toolbar={
          <Container>
            <Layout.Horizontal spacing="medium">
              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toCDResourcesConnectors({ orgIdentifier, projectIdentifier, accountId })}
              >
                {i18n.connectors}
              </NavLink>

              <NavLink
                className={css.tags}
                activeClassName={css.activeTag}
                to={routes.toCDResourcesSecretsListing({ orgIdentifier, projectIdentifier, accountId })}
              >
                {i18n.secrets}
              </NavLink>

              <NavLink className={css.tags} to="#TBD">
                {i18n.delegates}
              </NavLink>

              <NavLink className={css.tags} to="#TBD">
                {i18n.templates}
              </NavLink>

              <NavLink className={css.tags} to="#TBD">
                {i18n.fileStore}
              </NavLink>
            </Layout.Horizontal>
          </Container>
        }
      />
      <Page.Body>{children}</Page.Body>
    </>
  )
}

export default CDResourcesPage
