import React, { useState } from 'react'
import { Layout, Container, Button } from '@wings-software/uikit'
import { useParams } from 'react-router-dom'
import { useGetConnectorList, ResponseDTOPageConnectorSummaryDTO } from 'services/cd-ng'
import { PageSpinner } from 'modules/common/components/Page/PageSpinner'
import type { UseGetMockData } from 'modules/common/utils/testUtils'
import { ConnectorSetupModal } from '../../modals/ConnectorModal/ConnectorSetupModal'
import ConnectorsListView from './views/ConnectorsListView'
import css from './ConnectorsList.module.scss'

interface ConnectorsListProps {
  mockData?: UseGetMockData<ResponseDTOPageConnectorSummaryDTO>
}

const enum View {
  GRID,
  LIST
}
const ConnectorsList: React.FC<ConnectorsListProps> = ({ mockData }) => {
  const { accountId } = useParams()
  const [view, setView] = useState(View.LIST)
  const [page, setPage] = useState(0)

  const { loading, data, refetch: reloadConnectorList } = useGetConnectorList({
    accountIdentifier: accountId,
    queryParams: { page: page, size: 10 },
    mock: mockData
  })

  return (
    <Layout.Vertical height={'calc(100vh - 64px'}>
      <Container>
        <Layout.Horizontal className={css.header}>
          <Layout.Horizontal inline width="55%">
            <ConnectorSetupModal />
          </Layout.Horizontal>
          <Layout.Horizontal width="45%" className={css.view}>
            {/* <Button
              minimal
              icon="grid-view"
              intent={view === View.GRID ? 'primary' : 'none'}
              onClick={() => {
                setView(View.GRID)
              }}
            /> */}
            <Button
              minimal
              icon="list"
              intent={view === View.LIST ? 'primary' : 'none'}
              onClick={() => {
                setView(View.LIST)
              }}
            />
          </Layout.Horizontal>
        </Layout.Horizontal>
      </Container>
      {!loading ? (
        view === View.LIST && data?.data?.content?.length ? (
          <ConnectorsListView
            data={data?.data}
            reload={reloadConnectorList}
            gotoPage={pageNumber => setPage(pageNumber)}
          />
        ) : null
      ) : (
        <PageSpinner />
      )}
    </Layout.Vertical>
  )
}

export default ConnectorsList
