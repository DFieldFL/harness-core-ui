import React from 'react'
import { Container } from '@wings-software/uikit'
import { Page } from 'modules/common/exports'
import i18n from './CVDashboardPage.i18n'
import { CategoryRiskCards } from './CategoryRiskCards/CategoryRiskCards'
import css from './CVDashboardPage.module.scss'

export const CDDashboardPage: React.FC = () => {
  return (
    <>
      <Page.Header title={i18n.pageTitleText} />
      <Page.Body>
        <Container className={css.main}>
          <CategoryRiskCards />
        </Container>
      </Page.Body>
    </>
  )
}

export default CDDashboardPage
