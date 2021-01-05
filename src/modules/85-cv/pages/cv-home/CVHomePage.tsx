import React from 'react'
import { Color, Layout, Text } from '@wings-software/uicore'
import { Page } from '@common/exports'
import i18n from './CVHomePage.i18n'

const CVHomePage: React.FC = () => {
  return (
    <Page.Body>
      <Layout.Vertical padding="large">
        <Text color={Color.BLACK} font={{ size: 'large', weight: 'bold' }}>
          {i18n.dashboard}
        </Text>
      </Layout.Vertical>
    </Page.Body>
  )
}

export default CVHomePage
