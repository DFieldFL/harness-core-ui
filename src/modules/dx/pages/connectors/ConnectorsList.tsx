import React from 'react'
import { Layout, Container } from '@wings-software/uikit'
import { DelegateSetupModal } from '../../../cd/modals/DelegateSetupModal/DelegateSetupModal'
import CustomTable from '../../../common/components/CustomTable/CustomTable'
import { data as rowData, columns } from '../../../cd/pages/Resources/SampleColumnsData'
import css from './ConnectorsList.module.scss'

const ConnectorsList = () => {
  return (
    <Layout.Vertical style={{ background: 'var(--grey-100)' }}>
      <Container>
        <Layout.Horizontal id="layout-horizontal-sample" spacing="none" padding="xlarge" className={css.listWrapper}>
          <div style={{ width: 200 }}>
            <DelegateSetupModal />   
          </div>
          <div style={{ flexGrow: 1 }}></div>
        </Layout.Horizontal>
      </Container>
      <Container style={{ height: '100%' }}>
        <Layout.Horizontal style={{ height: '100%' }}>
          <CustomTable data={rowData} columns={columns} />
        </Layout.Horizontal>
      </Container>
    </Layout.Vertical>
  )
}

export default ConnectorsList
