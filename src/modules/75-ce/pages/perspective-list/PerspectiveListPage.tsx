import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import { Layout, Text, Button, Container, ExpandingSearchInput, FlexExpander } from '@wings-software/uicore'
import { pick } from 'lodash-es'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { Page } from '@common/components/Page/Page'
import { PageSpinner, useToaster } from '@common/components'
import { useCreatePerspective, useDeletePerspective, CEView } from 'services/ce'
import {
  CcmMetaData,
  QlceView,
  useFetchAllPerspectivesQuery,
  useFetchCcmMetaDataQuery,
  ViewState,
  ViewType
} from 'services/ce/services'
import { generateId, CREATE_CALL_OBJECT } from '@ce/utils/perspectiveUtils'
import PerspectiveListView from '@ce/components/PerspectiveViews/PerspectiveListView'
import PerspectiveGridView from '@ce/components/PerspectiveViews/PerspectiveGridView'
import { useCreateConnectorMinimal } from '@ce/components/CreateConnector/CreateConnector'
import { Utils } from '@ce/common/Utils'
import bgImage from './images/perspectiveBg.png'
import css from './PerspectiveListPage.module.scss'

enum Views {
  LIST,
  GRID
}

const NoDataPerspectivePage = () => {
  const { openModal, closeModal } = useCreateConnectorMinimal({
    onSuccess: () => {
      closeModal()
    }
  })
  useEffect(() => {
    openModal()
  }, [])
  return (
    <div style={{ backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', height: '100%', width: '100%' }}></div>
  )
}

const PerspectiveListPage: React.FC = () => {
  const history = useHistory()
  const { accountId } = useParams<{
    accountId: string
  }>()
  const [searchParam, setSearchParam] = useState<string>('')
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [view, setView] = useState(Views.GRID)

  const [result, executeQuery] = useFetchAllPerspectivesQuery()
  const { data, fetching } = result

  const { mutate: createView, loading: createViewLoading } = useCreatePerspective({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const { mutate: deleteView } = useDeletePerspective({
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const [ccmMetaResult] = useFetchCcmMetaDataQuery()
  const { data: ccmData, fetching: fetchingCCMMetaData } = ccmMetaResult

  const createNewPerspective: (values: QlceView | Record<string, string>, isClone: boolean) => void = async (
    values = {},
    isClone
  ) => {
    const valuesToBeSent = pick(values, ['name', 'viewTimeRange', 'viewVisualization'])
    let formData: Record<string, any> = {
      ...valuesToBeSent,
      viewVersion: 'v1'
    }

    formData['name'] = isClone ? `${formData['name']}-clone` : `Perspective-${generateId(6).toUpperCase()}`
    formData = { ...CREATE_CALL_OBJECT, ...formData }

    try {
      const response = await createView(formData as CEView)
      const { resource } = response

      const uuid = resource?.uuid

      if (uuid) {
        history.push(
          routes.toCECreatePerspective({
            accountId: accountId,
            perspectiveId: uuid
          })
        )
      }
    } catch (e) {
      const errMessage = e.data.message
      showError(errMessage)
    }
  }

  const deletePerpsective: (perspectiveId: string) => void = async perspectiveId => {
    try {
      await deleteView(void 0, {
        queryParams: {
          perspectiveId: perspectiveId,
          accountIdentifier: accountId
        }
      })
      executeQuery({
        requestPolicy: 'cache-and-network'
      })
    } catch (e) {
      const errMessage = e.data.message
      showError(errMessage)
    }
  }

  const navigateToPerspectiveDetailsPage: (perspectiveId: string, viewState: ViewState, name: string) => void = (
    perspectiveId,
    viewState,
    name
  ) => {
    if (viewState !== ViewState.Draft) {
      history.push(
        routes.toPerspectiveDetails({
          accountId: accountId,
          perspectiveId: perspectiveId,
          perspectiveName: name
        })
      )
    } else {
      history.push(
        routes.toCECreatePerspective({
          accountId,
          perspectiveId
        })
      )
    }
  }

  const pespectiveList = data?.perspectives?.customerViews || []

  useMemo(() => {
    pespectiveList.sort((a, b) => {
      const isElementADefault = a?.viewType === ViewType.Default
      const isElementBDefault = b?.viewType === ViewType.Default
      if (isElementADefault && !isElementBDefault) {
        return -1
      }
      if (!isElementADefault && isElementBDefault) {
        return 1
      }
      return 0
    })
  }, [pespectiveList])

  const filteredPerspectiveData = pespectiveList.filter(per => {
    if (!per?.name) {
      return false
    }
    if (per.name.toLowerCase().indexOf(searchParam.toLowerCase()) < 0) {
      return false
    }
    return true
  }) as QlceView[]

  if (fetchingCCMMetaData) {
    return <PageSpinner />
  }

  if (ccmData && !Utils.accountHasConnectors(ccmData.ccmMetaData as CcmMetaData)) {
    return <NoDataPerspectivePage />
  }

  return (
    <>
      <Page.Header
        title={
          <Text
            color="grey800"
            style={{ fontSize: 20, fontWeight: 'bold' }}
            tooltipProps={{ dataTooltipId: 'ccmPerspectives' }}
          >
            Perspectives
          </Text>
        }
      />
      <Layout.Horizontal spacing="large" className={css.header}>
        <Button
          intent="primary"
          text="New Perspective"
          icon="plus"
          onClick={async () => {
            await createNewPerspective({}, false)
          }}
        />
        <FlexExpander />

        <ExpandingSearchInput
          placeholder={getString('ce.perspectives.searchPerspectives')}
          onChange={text => {
            setSearchParam(text.trim())
          }}
          className={css.search}
        />
        <Layout.Horizontal>
          <Button
            minimal
            icon="grid-view"
            intent={view === Views.GRID ? 'primary' : undefined}
            onClick={() => {
              setView(Views.GRID)
            }}
          />
          <Button
            minimal
            icon="list"
            intent={view === Views.LIST ? 'primary' : undefined}
            onClick={() => {
              setView(Views.LIST)
            }}
          />
        </Layout.Horizontal>
      </Layout.Horizontal>
      <Page.Body>
        {(fetching || createViewLoading) && <Page.Spinner />}
        <Container padding="xxxlarge">
          {pespectiveList ? (
            view === Views.GRID ? (
              <PerspectiveGridView
                pespectiveData={filteredPerspectiveData}
                navigateToPerspectiveDetailsPage={navigateToPerspectiveDetailsPage}
                deletePerpsective={deletePerpsective}
                clonePerspective={createNewPerspective}
              />
            ) : (
              <PerspectiveListView
                pespectiveData={filteredPerspectiveData}
                navigateToPerspectiveDetailsPage={navigateToPerspectiveDetailsPage}
                deletePerpsective={deletePerpsective}
                clonePerspective={createNewPerspective}
              />
            )
          ) : null}
        </Container>
      </Page.Body>
    </>
  )
}

export default PerspectiveListPage
