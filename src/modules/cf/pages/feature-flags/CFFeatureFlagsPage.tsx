import React, { useState, useMemo, useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Color,
  Layout,
  Container,
  Icon,
  Text,
  ExpandingSearchInput,
  Button,
  FlexExpander,
  Select,
  SelectOption,
  Heading
} from '@wings-software/uicore'
import ReactTimeago from 'react-timeago'
import { Drawer, Menu, Position } from '@blueprintjs/core'
import { get } from 'lodash-es'
import type { CellProps, Renderer, Column, Cell } from 'react-table'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useToaster, useConfirmationDialog } from '@common/exports'
import { useLocalStorage } from '@common/hooks'
import Table from '@common/components/Table/Table'
import type { GetEnvironmentListForProjectQueryParams } from 'services/cd-ng'
import { useGetAllFeatures, Feature, useDeleteFeatureFlag } from 'services/cf'
import { Page } from '@common/exports'
import { PageError } from '@common/components/Page/PageError'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { FlagTypeVariations } from '../../components/CreateFlagDialog/FlagDialogUtils'
import FlagDrawerFilter from '../../components/FlagFilterDrawer/FlagFilterDrawer'
import FlagDialog from '../../components/CreateFlagDialog/FlagDialog'
import { useEnvironments } from '../../hooks/environment'
import i18n from './CFFeatureFlagsPage.i18n'
import css from './CFFeatureFlagsPage.module.scss'

type CustomColumn<T extends object> = Column<T>
const PAGE_SIZE = 15

const RenderColumnFlag: Renderer<CellProps<Feature>> = ({ row }) => {
  const data = row.original

  return (
    <Layout.Horizontal>
      <Layout.Vertical flex className={css.generalInfo}>
        <Text
          color={Color.BLACK}
          font={{ weight: 'bold', size: 'medium' }}
          margin={{ right: 'xsmall' }}
          className={css.name}
          tooltip={<Text padding="large">{data.name}</Text>}
        >
          {data.name}
        </Text>
        <Text>{data.description}</Text>
        <Text color={Color.GREY_450} font={{ size: 'small' }}>
          {data.identifier}
        </Text>
      </Layout.Vertical>
      <Text
        width="100px"
        flex
        icon="main-tags"
        style={{ justifyContent: 'center' }}
        tooltip={
          data?.tags?.length ? (
            <>
              <Text>{i18n.tags.toUpperCase()}</Text>
              {data.tags.map((elem, i) => (
                <Text key={`${elem.value}-${i}`}>{elem.value}</Text>
              ))}
            </>
          ) : undefined
        }
        tooltipProps={{
          portalClassName: css.tagsPopover,
          position: Position.RIGHT
        }}
      >
        {data?.tags?.length || 0}
      </Text>
    </Layout.Horizontal>
  )
}

const RenderColumnDetails: Renderer<CellProps<Feature>> = ({ row }) => {
  const data = row.original

  return (
    <Layout.Vertical>
      <Layout.Horizontal>
        <Text tooltipProps={{ isDark: true }}>
          {data.kind === FlagTypeVariations.booleanFlag
            ? i18n.boolean
            : `${i18n.multivariate} (${data.variations.length} ${i18n.variations})`}
        </Text>
      </Layout.Horizontal>
      <Text>{data.variations[0].name}</Text>
      <Text>{data.variations[0].description}</Text>
    </Layout.Vertical>
  )
}

const RenderColumnStatus: Renderer<CellProps<Feature>> = ({ row }) => (
  <Text>{row.original.envProperties?.state?.toLocaleUpperCase()}</Text>
)

const RenderColumnLastUpdated: Renderer<CellProps<Feature>> = ({ row }) => {
  return row.original?.modifiedAt ? (
    <Layout.Horizontal spacing="small">
      <Icon name="activity" />
      <ReactTimeago date={row.original?.modifiedAt} />
    </Layout.Horizontal>
  ) : null
}

const RenderColumnActive: Renderer<CellProps<Feature>> = ({ row }) => (
  <Text>{row.original.archived ? i18n.no : i18n.yes}</Text>
)

interface ColumnMenuProps {
  cell: Cell<Feature>
  environment?: string
}

const RenderColumnEdit: React.FC<ColumnMenuProps> = ({ cell: { row, column }, environment }) => {
  const data = row.original
  const { showError } = useToaster()

  const { projectIdentifier, orgIdentifier, accountId } = useParams<any>()

  const history = useHistory()

  const { mutate: deleteFeatureFlag } = useDeleteFeatureFlag({
    queryParams: {
      project: projectIdentifier as string,
      account: accountId,
      org: orgIdentifier
    }
  })

  const { openDialog: openDeleteFlagDialog } = useConfirmationDialog({
    contentText: i18n.deleteDialog.textSubject(data.name),
    titleText: i18n.deleteDialog.textHeader,
    confirmButtonText: i18n.delete,
    cancelButtonText: i18n.cancel,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          // FIXME: Check with BE about delete status
          // const deleted = await deleteFeatureFlag(data.identifier)
          // if (deleted.status === 'SUCCESS') {
          //   showSuccess('Successfully deleted...')
          // }
          await deleteFeatureFlag(data.identifier)
          ;(column as any).refetch?.()
        } catch (e) {
          showError(e)
        }
      }
    }
  })

  const onDetailPage = (): void => {
    history.push(
      routes.toCFFeatureFlagsDetail({
        orgIdentifier: orgIdentifier as string,
        projectIdentifier: projectIdentifier as string,
        environmentIdentifier: environment as string,
        featureFlagIdentifier: data.identifier,
        accountId
      })
    )
  }

  return (
    <Container
      style={{ textAlign: 'right' }}
      onClick={(e: React.MouseEvent) => {
        e.stopPropagation()
      }}
    >
      <Button
        minimal
        icon="Options"
        iconProps={{ size: 24 }}
        tooltipProps={{ isDark: true, interactionKind: 'click' }}
        tooltip={
          <Menu style={{ minWidth: 'unset' }}>
            <Menu.Item
              icon="edit"
              text={i18n.edit}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                onDetailPage()
              }}
            />
            <Menu.Item
              icon="trash"
              text={i18n.delete}
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                openDeleteFlagDialog()
              }}
            />
          </Menu>
        }
      />
    </Container>
  )
}

const defaultEnv = { label: '', value: '' }

const CFFeatureFlagsPage: React.FC = () => {
  const [isSaveFiltersOn, setIsSaveFiltersOn] = useState(false)
  const [isDrawerOpened, setIsDrawerOpened] = useState(false)
  const [environment, setEnvironment] = useLocalStorage('cf_selected_env', defaultEnv)
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const history = useHistory()

  const { data: environments, loading: envsLoading, error: envsError, refetch: refetchEnvironments } = useEnvironments({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier
  } as GetEnvironmentListForProjectQueryParams)
  const [pageNumber, setPageNumber] = useState(0)
  const queryParams = useMemo(() => {
    return {
      project: projectIdentifier as string,
      environment: environment?.value as string,
      account: accountId,
      org: orgIdentifier,
      pageSize: PAGE_SIZE,
      pageNumber
    }
  }, [projectIdentifier, environment?.value, accountId, orgIdentifier, pageNumber])
  const { data: flagList, loading: flagsLoading, error: flagsError, refetch } = useGetAllFeatures({
    lazy: true,
    queryParams
  })

  useEffect(() => {
    if (environment) {
      refetch()
    }
  }, [environment])

  useEffect(() => {
    if (!envsLoading && environments?.length > 0 && environment?.label) {
      if (environments.find(v => v.value === environment.value)) {
        setEnvironment({ label: environment['label'], value: environment['value'] })
      } else {
        setEnvironment({ label: environments[0]['label'], value: environments[0]['value'] as string })
      }
    }
  }, [environments.length, envsLoading])

  const error = flagsError || envsError
  const loading = flagsLoading || envsLoading

  const columns: CustomColumn<Feature>[] = useMemo(
    () => [
      {
        Header: i18n.featureFlag.toUpperCase(),
        accessor: row => row.name,
        width: '50%',
        Cell: RenderColumnFlag
      },
      {
        Header: i18n.details.toUpperCase(),
        accessor: row => row.kind,
        width: '15%',
        Cell: RenderColumnDetails
      },
      {
        Header: i18n.status.toUpperCase(),
        accessor: 'archived',
        width: '10%',
        Cell: RenderColumnStatus
      },
      {
        Header: i18n.lastUpdated.toUpperCase(),
        // TODO: Check for the accessor field
        accessor: 'prerequisites',
        width: '15%',
        Cell: RenderColumnLastUpdated,
        disableSortBy: true
      },
      {
        Header: i18n.active.toUpperCase(),
        accessor: row => row.owner,
        width: '5%',
        Cell: RenderColumnActive,
        disableSortBy: true
      },
      {
        Header: '',
        id: 'version',
        // TODO: Check for the accessor field
        accessor: (row: Feature) => row.envProperties?.version || undefined,
        width: '5%',
        Cell: function WrapperRenderColumnEdit(cell: Cell<Feature>) {
          return <RenderColumnEdit cell={cell} environment={environment?.value as string} />
        },
        disableSortBy: true,
        refetch
      }
    ],
    [refetch]
  )

  const onDrawerOpened = (): void => {
    setIsDrawerOpened(true)
  }

  const onDrawerClose = (): void => {
    setIsDrawerOpened(false)
  }

  const onEnvChange = (item: SelectOption) => {
    setEnvironment({ label: item?.label, value: item.value as string })
  }
  const hasFeatureFlags = flagList?.features && flagList?.features?.length > 0
  const emptyFeatureFlags = flagList?.features && flagList?.features?.length === 0

  return (
    <>
      <Page.Header
        title={
          <Heading level={2} style={{ fontWeight: 600 }}>
            {i18n.featureFlag}
          </Heading>
        }
        size="medium"
      />

      <Container className={css.ffListContainer}>
        <Layout.Horizontal className={css.ffPageBtnsHeader}>
          <FlagDialog disabled={loading} environment={environment?.value as string} />

          <FlexExpander />

          <ExpandingSearchInput name="findFlag" placeholder={i18n.searchInputFlag} className={css.ffPageBtnsSearch} />

          <Select
            items={environments}
            className={css.ffPageBtnsSelect}
            inputProps={{ placeholder: i18n.selectEnv }}
            onChange={onEnvChange}
            value={environment?.value ? environment : environments[0]}
          />

          {/* TODO: Filters length/count should be displayed next to the button, check with BE */}
          <Button
            disabled={loading}
            icon="settings"
            iconProps={{ size: 20, color: Color.BLUE_500 }}
            minimal
            intent="primary"
            onClick={onDrawerOpened}
          />
        </Layout.Horizontal>

        <Drawer
          isOpen={isDrawerOpened}
          title={isSaveFiltersOn ? i18n.saveFilters : i18n.drawerFilter}
          icon="settings"
          onClose={onDrawerClose}
          className={css.drawerContainer}
        >
          <FlagDrawerFilter isSaveFiltersOn={isSaveFiltersOn} setIsSaveFiltersOn={setIsSaveFiltersOn} />
        </Drawer>

        {hasFeatureFlags && (
          <Layout.Vertical className={css.ffTableContainer}>
            {/* TODO: Pagination needs to be communicated with BE */}
            <Table<Feature>
              columns={columns}
              data={flagList?.features || []}
              onRowClick={feature => {
                history.push(
                  routes.toCFFeatureFlagsDetail({
                    orgIdentifier: orgIdentifier as string,
                    projectIdentifier: projectIdentifier as string,
                    environmentIdentifier: environment?.value || (environments[0]?.value as string),
                    featureFlagIdentifier: feature.identifier,
                    accountId
                  })
                )
              }}
              pagination={{
                itemCount: flagList?.itemCount || 0,
                pageSize: flagList?.pageSize || 0,
                pageCount: flagList?.pageCount || 0,
                pageIndex: pageNumber,
                gotoPage: index => {
                  setPageNumber(index)
                  refetch({ queryParams: { ...queryParams, pageNumber: index } })
                }
              }}
            />
          </Layout.Vertical>
        )}

        {emptyFeatureFlags && (
          <Layout.Vertical className={css.heightOverride}>
            <Container>
              <Icon name="flag" size={150} color={Color.GREY_300} className={css.ffContainerImg} />
            </Container>
            <Text color="grey400" style={{ fontSize: '20px', padding: '40px 0' }}>
              {i18n.noFeatureFlags}
            </Text>
            <FlagDialog environment={environment?.value as string} />
          </Layout.Vertical>
        )}

        {error && (
          <PageError
            message={get(error, 'data.message', error?.message)}
            onClick={() => {
              setPageNumber(0)
              refetchEnvironments()
            }}
          />
        )}

        {loading && (
          <Container
            style={{
              position: 'fixed',
              top: '144px',
              left: '270px',
              width: 'calc(100% - 270px)',
              height: 'calc(100% - 144px)'
            }}
          >
            <ContainerSpinner />
          </Container>
        )}
      </Container>
    </>
  )
}

export default CFFeatureFlagsPage
