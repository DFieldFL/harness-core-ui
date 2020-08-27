import { Button, Container } from '@wings-software/uikit'
import React from 'react'
import { Page } from 'modules/common/exports'
import i18n from './CVAccessControlPage.i18n'

const CVBuildSettingsPage: React.FC = () => {
  const tbd: () => void = () => {
    alert('TBD')
  }

  return (
    <>
      <Page.Header
        title={i18n.title}
        toolbar={
          <Container>
            <Button text={i18n.newItem} onClick={tbd} />
          </Container>
        }
      />
      <Page.Body>
        <Page.NoDataCard icon="nav-dashboard" message={i18n.noData} buttonText={i18n.newItem} onClick={tbd} />
      </Page.Body>
    </>
  )
}

export default CVBuildSettingsPage
