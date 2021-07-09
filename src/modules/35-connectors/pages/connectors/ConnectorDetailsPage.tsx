import React, { useEffect, useMemo } from 'react'
import { Layout, Container, Icon, Text, Color, SelectOption, Select } from '@wings-software/uicore'
import { Menu, Tag } from '@blueprintjs/core'
import cx from 'classnames'
import { useParams } from 'react-router-dom'
import { Page } from '@common/exports'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import {
  useGetConnector,
  ConnectorResponse,
  useGetOrganizationAggregateDTO,
  EntityGitDetails,
  useGetListOfBranchesWithStatus,
  GitBranchDTO
} from 'services/cd-ng'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import { useStrings } from 'framework/strings'
import ActivityHistory from '@connectors/components/activityHistory/ActivityHistory/ActivityHistory'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import type { ProjectPathProps, ConnectorPathProps, PipelineType } from '@common/interfaces/RouteInterfaces'
import { PageError } from '@common/components/Page/PageError'
import { useQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import EntitySetupUsage from '@common/pages/entityUsage/EntityUsage'
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
  const { connectorId, accountId, orgIdentifier, projectIdentifier, module } =
    useParams<PipelineType<ProjectPathProps & ConnectorPathProps>>()
  const { repoIdentifier, branch } = useQueryParams<EntityGitDetails>()

  const { data: orgData } = useGetOrganizationAggregateDTO({
    identifier: orgIdentifier,
    queryParams: {
      accountIdentifier: accountId
    }
  })

  const defaultQueryParam = {
    accountIdentifier: accountId,
    orgIdentifier: orgIdentifier as string,
    projectIdentifier: projectIdentifier as string
  }

  const {
    loading,
    data: connectorData,
    refetch,
    error
  } = useGetConnector({
    identifier: connectorId as string,
    queryParams: repoIdentifier && branch ? { ...defaultQueryParam, repoIdentifier, branch } : defaultQueryParam,
    mock: props.mockData
  })

  const connectorName = data?.connector?.name
  const gitDetails = data?.gitDetails

  useEffect(() => {
    if (!loading && connectorData?.data) {
      setData(connectorData.data)
      setSelectedBranch(connectorData?.data?.gitDetails?.branch as string)
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
    const repoId = connectorData?.data?.gitDetails?.repoIdentifier || data?.gitDetails?.repoIdentifier
    if (repoId) {
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
  }, [loading, searchTerm])

  useEffect(() => {
    if (!loadingBranchList) {
      setBranchSelectOptions(
        branchList?.data?.branches?.content?.map((item: GitBranchDTO) => {
          return {
            label: item.branchName ?? '',
            value: item.branchName ?? ''
          }
        }) || []
      )
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingBranchList])

  useDocumentTitle([connectorName || connectorData?.data?.connector?.name || '', getString('connectorsLabel')])

  const categories: Categories = {
    connection: getString('overview'),
    refrencedBy: getString('refrencedBy'),
    activityHistory: getString('activityHistoryLabel')
  }

  const RenderBreadCrumb: React.FC = () => {
    let links = [
      {
        url: routes.toConnectors({ accountId, orgIdentifier, projectIdentifier, module }),
        label: getString('resources')
      },
      {
        label: getString('connectorsLabel'),
        url: ''
      }
    ]
    if (projectIdentifier) {
      return <Breadcrumbs links={links} />
    }
    if (orgIdentifier) {
      links = [
        {
          url: routes.toOrganizationDetails({ accountId, orgIdentifier }),
          label: orgData?.data ? orgData?.data?.organizationResponse.organization.name : ''
        },
        ...links
      ]
    }
    return <Breadcrumbs links={links} />
  }

  const handleBranchClick = (selected: string): void => {
    if (selected !== selectedBranch) {
      //Avoid any state change or API call if current branh is selected again
      setSelectedBranch(selected)
      refetch({
        queryParams:
          repoIdentifier && selected ? { ...defaultQueryParam, repoIdentifier, branch: selected } : defaultQueryParam
      })
    }
  }

  const RenderGitDetails = useMemo(() => {
    return (
      <Layout.Horizontal border={{ left: true, color: Color.GREY_300 }} spacing="medium">
        <Layout.Horizontal spacing="small">
          <Icon name="repository" margin={{ left: 'large' }}></Icon>
          <Text lineClamp={1} className={css.filePath}>{`${gitDetails?.rootFolder}${gitDetails?.filePath}`}</Text>
        </Layout.Horizontal>

        <Layout.Horizontal spacing="small">
          <Icon name="git-new-branch" margin={{ left: 'large' }}></Icon>
          <Select
            name="branch"
            className={css.gitBranch}
            value={{ label: selectedBranch, value: selectedBranch }}
            items={branchSelectOptions}
            onQueryChange={(query: string) => {
              setSearchTerm(query)
            }}
            itemRenderer={(item: SelectOption): React.ReactElement => {
              return (
                <Menu.Item
                  key={item.value as string}
                  active={item.value === selectedBranch}
                  onClick={() => handleBranchClick(item.value as string)}
                  text={item.value}
                />
              )
            }}
          />
          {loadingBranchList ? <Icon margin={{ top: 'xsmall' }} name="spinner" /> : null}
        </Layout.Horizontal>
      </Layout.Horizontal>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [branchSelectOptions, selectedBranch, loadingBranchList])

  const renderTitle = useMemo(
    () => (
      <Layout.Vertical padding={{ left: 'xsmall' }}>
        {RenderBreadCrumb(props)}
        <Layout.Horizontal spacing="small">
          <Icon
            margin={{ left: 'xsmall', right: 'xsmall' }}
            name={getIconByType(connectorData?.data?.connector?.type || data?.connector?.type)}
            size={35}
          ></Icon>
          <Container>
            <Text color={Color.GREY_800} font={{ size: 'medium', weight: 'bold' }}>
              {connectorData?.data?.connector?.name || connectorName}
            </Text>
            <Layout.Horizontal spacing="small">
              <Text color={Color.GREY_400}>
                {connectorData?.data?.connector?.identifier || data?.connector?.identifier}
              </Text>
              {activeCategory === 0 && gitDetails?.objectId ? RenderGitDetails : null}
            </Layout.Horizontal>
          </Container>
        </Layout.Horizontal>
      </Layout.Vertical>
    ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orgData, connectorData, branchSelectOptions, activeCategory, selectedBranch, loadingBranchList]
  )

  const getPageBody = (): React.ReactElement => {
    if (loading) {
      return <PageSpinner />
    }
    if (error) {
      return (
        <PageError
          message={(error.data as Error)?.message || error.message}
          onClick={() =>
            refetch({
              queryParams: selectedBranch
                ? {
                    ...defaultQueryParam,
                    repoIdentifier: connectorData?.data?.gitDetails?.repoIdentifier,
                    branch: selectedBranch
                  }
                : defaultQueryParam
            })
          }
        />
      )
    }
    if (activeCategory === 0) {
      return data?.connector?.type ? (
        <ConnectorView
          type={data.connector.type}
          response={data || ({} as ConnectorResponse)}
          refetchConnector={refetch}
        />
      ) : (
        <NoDataCard message={getString('connectors.connectorNotFound')} icon="question" />
      )
    }
    if (activeCategory === 1 && data?.connector?.identifier) {
      return <EntitySetupUsage entityType={'Connectors'} entityIdentifier={data?.connector?.identifier} />
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
        title={renderTitle}
        toolbar={
          <Container>
            <Layout.Horizontal spacing="medium">
              {Object.keys(categories).map((item, index) => {
                return (
                  <Tag
                    className={cx(css.tags, { [css.active]: activeCategory === index })}
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
