import React, { useEffect } from 'react'
import { Layout, Container, Icon, Text, Color, SelectOption, Select } from '@wings-software/uicore'
import { Tag } from '@blueprintjs/core'
import cx from 'classnames'
import { Link, useParams, useLocation } from 'react-router-dom'
import { Page } from '@common/exports'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import {
  useGetConnector,
  ConnectorResponse,
  useUpdateConnector,
  useGetOrganizationAggregateDTO,
  EntityGitDetails,
  useGetListOfBranchesWithStatus,
  GitBranchDTO
} from 'services/cd-ng'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { useStrings } from 'framework/strings'
import ActivityHistory from '@connectors/components/activityHistory/ActivityHistory/ActivityHistory'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ProjectPathProps, ConnectorPathProps } from '@common/interfaces/RouteInterfaces'
import { PageError } from '@common/components/Page/PageError'
import { useQueryParams } from '@common/hooks'
import ReferencedBy from './ReferencedBy/ReferencedBy'
import ConnectorView from './ConnectorView'
import { getIconByType } from './utils/ConnectorUtils'
import css from './ConnectorDetailsPage.module.scss'

interface Categories {
  [key: string]: string
}

const ConnectorDetailsPage: React.FC<{ mockData?: any }> = props => {
  const { getString } = useStrings()
  const [data, setData] = React.useState<ConnectorResponse>({})
  const [activeCategory, setActiveCategory] = React.useState(0)
  const [selectedBranch, setSelectedBranch] = React.useState<string>('')
  const [branchSelectOptions, setBranchSelectOptions] = React.useState<SelectOption[]>([])
  const [searchTerm, setSearchTerm] = React.useState<string>('')
  const { connectorId, accountId, orgIdentifier, projectIdentifier } = useParams<
    ProjectPathProps & ConnectorPathProps
  >()
  const { repoIdentifier, branch } = useQueryParams<EntityGitDetails>()
  const { pathname } = useLocation()

  const defaultQueryParam = {
    accountIdentifier: accountId,
    orgIdentifier: orgIdentifier as string,
    projectIdentifier: projectIdentifier as string
  }

  const { loading, data: connectorData, refetch, error } = useGetConnector({
    identifier: connectorId as string,
    queryParams: repoIdentifier && branch ? { ...defaultQueryParam, repoIdentifier, branch } : defaultQueryParam,
    mock: props.mockData
  })

  const connectorName = data?.connector?.name
  const gitDetails = data?.gitDetails

  useEffect(() => {
    if (!loading && connectorData?.data) {
      setData(connectorData.data)
    }
  }, [connectorData, loading])

  const {
    data: branchList,
    loading: loadingBranchList,
    refetch: getListOfBranchesWithStatus
  } = useGetListOfBranchesWithStatus({
    lazy: true,
    debounce: 500
  })

  useEffect(() => {
    const repoId = connectorData?.data?.gitDetails?.repoIdentifier
    // connector fetch API is called after every branch change and Test connection
    // Avoid fetching branchList on each connector response, once branchList is fetched, fetch only on searchTerm change
    if (searchTerm || (repoId && !branchSelectOptions.length)) {
      setSelectedBranch(connectorData?.data?.gitDetails?.branch as string)
      getListOfBranchesWithStatus({
        queryParams: {
          accountIdentifier: accountId,
          orgIdentifier,
          projectIdentifier,
          yamlGitConfigIdentifier: repoId,
          page: 0,
          size: 10,
          searchTerm
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, loading])

  useEffect(() => {
    if (!loadingBranchList && branchList?.data?.branches?.content?.length) {
      const syncedBranchOption: SelectOption[] = []

      branchList.data.branches.content.forEach((item: GitBranchDTO) => {
        syncedBranchOption.push({
          label: item.branchName ?? '',
          value: item.branchName ?? ''
        })
      })

      setBranchSelectOptions(syncedBranchOption)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingBranchList])

  useDocumentTitle([connectorName || '', getString('connectorsLabel')])

  const categories: Categories = {
    connection: getString('connection'),
    refrencedBy: getString('refrencedBy'),
    activityHistory: getString('activityHistoryLabel')
  }

  const { mutate: updateConnector } = useUpdateConnector({ queryParams: { accountIdentifier: accountId } })

  const RenderBreadCrumb: React.FC = () => {
    if (projectIdentifier) {
      return renderCommonBreadCrumb(props)
    } else {
      return orgIdentifier ? RenderBreadCrumbForOrg(props) : renderCommonBreadCrumb(props)
    }
  }

  const RenderBreadCrumbForOrg: React.FC = () => {
    const { data: orgData } = useGetOrganizationAggregateDTO({
      identifier: orgIdentifier,
      queryParams: {
        accountIdentifier: accountId
      }
    })

    return (
      <Layout.Horizontal spacing="xsmall">
        <Link className={css.breadCrumb} to={`${pathname.substring(0, pathname.lastIndexOf('/resources'))}`}>
          {orgData?.data && orgData?.data?.organizationResponse.organization.name}
        </Link>
        <span>/</span>
        {renderCommonBreadCrumb(props)}
      </Layout.Horizontal>
    )
  }

  const renderCommonBreadCrumb: React.FC = () => {
    return (
      <Layout.Horizontal spacing="xsmall">
        <Link className={css.breadCrumb} to={`${pathname.substring(0, pathname.lastIndexOf('/'))}`}>
          {getString('resources')}
        </Link>
        <span>/</span>
        <Link className={css.breadCrumb} to={`${pathname.substring(0, pathname.lastIndexOf('/'))}`}>
          {getString('connectorsLabel')}
        </Link>
      </Layout.Horizontal>
    )
  }

  const RenderGitDetails: React.FC = () => {
    if (gitDetails?.objectId) {
      return (
        <Layout.Horizontal border={{ left: true, color: Color.GREY_300 }} spacing="medium">
          <Layout.Horizontal spacing="small">
            <Icon name="repository" margin={{ left: 'large' }}></Icon>
            <Text>{`${gitDetails?.rootFolder}${gitDetails?.filePath}`}</Text>
          </Layout.Horizontal>

          <Layout.Horizontal spacing="small">
            <Icon name="git-new-branch" margin={{ left: 'large' }}></Icon>
            <Select
              name="branch"
              className={css.gitBranch}
              value={branchSelectOptions.find(branchOption => branchOption.value === selectedBranch)}
              items={branchSelectOptions}
              onQueryChange={(query: string) => setSearchTerm(query)}
              disabled={loading || loadingBranchList}
              onChange={item => {
                const selected = item.value as string
                if (selected !== selectedBranch) {
                  //Avoid any state change or API call if current branh is selected again
                  setSelectedBranch(selected)
                  refetch({
                    queryParams:
                      repoIdentifier && selected
                        ? { ...defaultQueryParam, repoIdentifier, branch: selected }
                        : defaultQueryParam
                  })
                }
              }}
            />
            {loading || loadingBranchList ? <Icon margin={{ top: 'xsmall' }} name="spinner" /> : null}
          </Layout.Horizontal>
        </Layout.Horizontal>
      )
    } else {
      return <></>
    }
  }

  const renderTitle: React.FC = () => {
    return (
      <Layout.Vertical padding={{ left: 'xsmall' }}>
        {RenderBreadCrumb(props)}
        <Layout.Horizontal spacing="small">
          <Icon
            margin={{ left: 'xsmall', right: 'xsmall' }}
            name={getIconByType(data?.connector?.type)}
            size={35}
          ></Icon>
          <Container>
            <Text color={Color.GREY_800} font={{ size: 'medium', weight: 'bold' }}>
              {connectorName}
            </Text>
            <Layout.Horizontal spacing="small">
              <Text color={Color.GREY_400}>{data?.connector?.identifier}</Text>
              <RenderGitDetails />
            </Layout.Horizontal>
          </Container>
        </Layout.Horizontal>
      </Layout.Vertical>
    )
  }

  const getPageBody = (): React.ReactElement => {
    if (loading) {
      return <PageSpinner />
    }
    if (error) {
      return (
        <PageError
          message={(error.data as Error)?.message || error.message}
          onClick={/* istanbul ignore next */ () => refetch()}
        />
      )
    }
    if (activeCategory === 0) {
      return data?.connector?.type ? (
        <ConnectorView
          type={data.connector.type}
          updateConnector={updateConnector}
          response={data || ({} as ConnectorResponse)}
          refetchConnector={refetch}
        />
      ) : (
        <NoDataCard message={getString('connectors.connectorNotFound')} icon="question" />
      )
    }
    if (activeCategory === 1 && data) {
      return (
        <ReferencedBy
          accountId={accountId}
          projectIdentifier={projectIdentifier}
          orgIdentifier={orgIdentifier}
          entityType={'Connectors'}
          entityIdentifier={data?.connector?.identifier}
        />
      )
    }
    if (activeCategory === 2 && data) {
      return <ActivityHistory referredEntityType="Connectors" entityIdentifier={data?.connector?.identifier || ''} />
    }
    return <></>
  }

  return (
    <>
      <Page.Header
        size="large"
        className={css.header}
        title={renderTitle(props)}
        toolbar={
          <Container>
            <Layout.Horizontal spacing="medium">
              {Object.keys(categories).map((item, index) => {
                return (
                  <Tag
                    className={cx(css.tags, { [css.activeTag]: activeCategory === index })}
                    onClick={() => setActiveCategory(index)}
                    key={item + index}
                  >
                    {categories[item]}
                  </Tag>
                )
              })}
            </Layout.Horizontal>
          </Container>
        }
      />
      <Page.Body>{getPageBody()}</Page.Body>
    </>
  )
}

export default ConnectorDetailsPage
