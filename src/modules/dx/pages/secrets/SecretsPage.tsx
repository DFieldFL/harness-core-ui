import React, { useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout, Popover, Button, Icon, TextInput, Container } from '@wings-software/uikit'
import { Menu, Position } from '@blueprintjs/core'

import { useListSecrets } from 'services/cd-ng'
import type { ResponseDTONGPageResponseEncryptedDataDTO } from 'services/cd-ng'

import { linkTo } from 'framework/exports'
import { routeCreateSecretFromYaml } from 'modules/dx/routes'
import useCreateSecretModal from 'modules/dx/modals/CreateSecretModal/useCreateSecretModal'
import { PageSpinner } from 'modules/common/components/Page/PageSpinner'
import { PageError } from 'modules/common/components/Page/PageError'
import type { UseGetMockData } from 'modules/common/utils/testUtils'

import SecretsList from './views/SecretsListView/SecretsList'

import i18n from './SecretsPage.i18n'
import css from './SecretsPage.module.scss'

interface SecretsPageProps {
  mockData?: UseGetMockData<ResponseDTONGPageResponseEncryptedDataDTO>
}

const SecretsPage: React.FC<SecretsPageProps> = ({ mockData }) => {
  const { accountId } = useParams()
  const history = useHistory()
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [page, setPage] = useState(0)

  const { data: secretsResponse, loading, error, refetch } = useListSecrets({
    queryParams: { account: accountId, searchTerm, page, size: 10 },
    mock: mockData,
    debounce: 300
  })
  const { openCreateSecretModal } = useCreateSecretModal({
    onSuccess: () => {
      refetch()
    }
  })

  return (
    <div className={css.page}>
      <Layout.Horizontal flex className={css.header}>
        <Popover minimal position={Position.BOTTOM_LEFT}>
          <Button intent="primary" text={i18n.newSecret.button} icon="plus" rightIcon="chevron-down" />
          <Menu large>
            <Menu.Item
              text={i18n.newSecret.text}
              labelElement={<Icon name="font" />}
              onClick={() => openCreateSecretModal('SecretText')}
            />
            <Menu.Item
              text={i18n.newSecret.file}
              labelElement={<Icon name="document" />}
              onClick={() => openCreateSecretModal('SecretFile')}
            />
            <Menu.Divider />
            <Menu.Item
              text={i18n.newSecret.yaml}
              onClick={() => {
                history.push(linkTo(routeCreateSecretFromYaml))
              }}
            />
          </Menu>
        </Popover>
        <Layout.Horizontal spacing="small">
          <TextInput
            leftIcon="search"
            placeholder="Search"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value.trim())
            }}
          />
        </Layout.Horizontal>
      </Layout.Horizontal>

      {loading ? (
        <div style={{ position: 'relative', height: 'calc(100vh - 128px)' }}>
          <PageSpinner />
        </div>
      ) : error ? (
        <div style={{ paddingTop: '200px' }}>
          <PageError message={error.message} onClick={() => refetch()} />
        </div>
      ) : secretsResponse?.data?.content ? (
        <SecretsList secrets={secretsResponse} refetch={refetch} gotoPage={pageNumber => setPage(pageNumber)} />
      ) : (
        <Container flex={{ align: 'center-center' }} padding="xxlarge">
          No Data
        </Container>
      )}
    </div>
  )
}

export default SecretsPage
