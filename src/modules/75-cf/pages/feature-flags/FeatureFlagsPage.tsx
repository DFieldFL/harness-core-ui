import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom'
import {
  Layout,
  Container,
  Icon,
  Text,
  // ExpandingSearchInput,
  Button,
  FlexExpander,
  Heading,
  Utils,
  Pagination,
  Color
} from '@wings-software/uicore'
import ReactTimeago from 'react-timeago'
import { noop } from 'lodash-es'
import { /*Drawer,*/ Position, Switch, Classes } from '@blueprintjs/core'
import type { CellProps, Renderer, Column, Cell } from 'react-table'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import { useConfirmAction, useQueryParams } from '@common/hooks'
import Table from '@common/components/Table/Table'
import {
  useGetAllFeatures,
  Feature,
  useDeleteFeatureFlag,
  Features,
  FeatureState,
  DeleteFeatureFlagQueryParams
} from 'services/cf'
import { useStrings } from 'framework/strings'
import { OptionsMenuButton } from '@common/components'
import { useToggleFeatureFlag } from '@cf/hooks/useToggleFeatureFlag'
import { VariationTypeIcon } from '@cf/components/VariationTypeIcon/VariationTypeIcon'
import { VariationWithIcon } from '@cf/components/VariationWithIcon/VariationWithIcon'
import { ListingPageTemplate, ListingPageTitle } from '@cf/components/ListingPageTemplate/ListingPageTemplate'
import { NoData } from '@cf/components/NoData/NoData'
import { useEnvironmentSelectV2 } from '@cf/hooks/useEnvironmentSelectV2'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { CFEnvironmentSelect } from '@cf/components/CFEnvironmentSelect/CFEnvironmentSelect'
import {
  isFeatureFlagOn,
  CF_DEFAULT_PAGE_SIZE,
  featureFlagHasCustomRules,
  FeatureFlagActivationStatus,
  getErrorMessage,
  useFeatureFlagTypeToStringMapping,
  showToaster,
  rewriteCurrentLocationWithActiveEnvironment
} from '../../utils/CFUtils'
import { FlagTypeVariations } from '../../components/CreateFlagDialog/FlagDialogUtils'
// import FlagDrawerFilter from '../../components/FlagFilterDrawer/FlagFilterDrawer'
import FlagDialog from '../../components/CreateFlagDialog/FlagDialog'
import imageURL from './flag.svg'
import { FeatureFlagStatus, FlagStatus } from './FlagStatus'
import { FlagResult } from './FlagResult'
import css from './FeatureFlagsPage.module.scss'

interface RenderColumnFlagProps {
  cell: Cell<Feature>
  update: (status: boolean) => void
}

const RenderColumnFlag: React.FC<RenderColumnFlagProps> = ({ cell: { row, column }, update }) => {
  const data = row.original
  // const [environment] = useLocalStorage(CF_LOCAL_STORAGE_ENV_KEY, DEFAULT_ENV)
  const [status, setStatus] = useState(isFeatureFlagOn(data))
  const { getString } = useStrings()
  const { projectIdentifier, orgIdentifier, accountId: accountIdentifier } = useParams<Record<string, string>>()
  const toggleFeatureFlag = useToggleFeatureFlag({
    accountIdentifier,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier: data.envProperties?.environment as string,
    flagIdentifier: data.identifier
  })
  const { showError } = useToaster()
  const [flagNameTextSize, setFlagNameTextSize] = useState(300)
  const ref = useRef<HTMLDivElement>(null)

  const switchTooltip = (
    <Container width={'350px'} padding="xxxlarge">
      <Heading level={2} style={{ fontWeight: 600, fontSize: '24px', lineHeight: '32px', color: '#22222A' }}>
        {getString(status ? 'cf.featureFlags.turnOffHeading' : 'cf.featureFlags.turnOnHeading')}
      </Heading>
      <Text margin={{ top: 'medium', bottom: 'small' }} style={{ lineHeight: '22px', color: '#383946' }}>
        <span
          // This is used to retain simple HTML markup in i18n string like <strong>
          // to make sure formating is aligned with translations
          dangerouslySetInnerHTML={{
            __html: getString(status ? 'cf.featureFlags.turnOffMessage' : 'cf.featureFlags.turnOnMessage', {
              name: data.name,
              env:
                ((column as unknown) as { activeEnvironment?: EnvironmentResponseDTO })?.activeEnvironment?.name || ''
            })
          }}
        />
      </Text>
      <Text margin={{ top: 'xsmall', bottom: 'xlarge' }} style={{ lineHeight: '22px', color: '#383946' }}>
        {(!featureFlagHasCustomRules(data) && (
          <span
            // This is used to retain simple HTML markup in i18n string like <strong>
            // to make sure formating is aligned with translations
            dangerouslySetInnerHTML={{
              __html: getString('cf.featureFlags.defaultWillBeServed', {
                defaultVariation: status ? data.defaultOffVariation : data.defaultOnVariation
              })
            }}
          />
        )) ||
          getString('cf.featureFlags.customRuleMessage')}
      </Text>
      <Container flex>
        <Layout.Horizontal spacing="small">
          <Button
            intent="primary"
            text={getString('confirm')}
            className={Classes.POPOVER_DISMISS}
            onClick={() => {
              const toggleFn = status ? toggleFeatureFlag.off() : toggleFeatureFlag.on()

              toggleFn
                .then(() => {
                  setStatus(!status)
                  update(!status)
                })
                .catch(error => {
                  showError(getErrorMessage(error), 0)
                })
            }}
          />
          <Button text={getString('cancel')} className={Classes.POPOVER_DISMISS} />
        </Layout.Horizontal>
        <span />
      </Container>
    </Container>
  )

  const onResize = (): void => {
    if (ref.current) {
      setFlagNameTextSize((ref.current.closest('div[role="cell"]') as HTMLDivElement)?.offsetWidth - 174)
    }
  }

  useEffect(() => {
    onResize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  return (
    <Container flex>
      <Container onMouseDown={Utils.stopEvent} onClick={Utils.stopEvent}>
        <Button
          noStyling
          tooltip={data.archived ? undefined : switchTooltip}
          tooltipProps={{ interactionKind: 'click', hasBackdrop: true, position: Position.TOP_LEFT }}
          className={css.toggleFlagButton}
          disabled={data.archived}
        >
          <Switch
            style={{ alignSelf: 'baseline', marginLeft: '-10px' }}
            alignIndicator="right"
            className={Classes.LARGE}
            checked={status}
            onChange={noop}
            disabled={data.archived}
          />
        </Button>
      </Container>
      <Layout.Horizontal spacing="small" style={{ flexGrow: 1, paddingLeft: 'var(--spacing-medium)' }}>
        <Layout.Vertical flex className={css.generalInfo} ref={ref}>
          <Text
            style={{
              color: '#22222A',
              fontWeight: 500,
              fontSize: '13px',
              lineHeight: '16px'
            }}
            margin={{ right: 'xsmall' }}
            width={flagNameTextSize}
            lineClamp={2}
          >
            {data.name}
            {data.archived && (
              <Text inline color={Color.GREY_400} padding={{ left: 'xsmall' }} font={{ size: 'small' }}>
                ({getString('cf.shared.archived')})
              </Text>
            )}
          </Text>
          {data.description && (
            <Text
              style={{
                color: '#22222A',
                fontSize: '12px',
                lineHeight: '24px'
              }}
            >
              {data.description}
            </Text>
          )}
        </Layout.Vertical>
        <Text
          width="100px"
          flex
          icon="main-tags"
          style={{ justifyContent: 'center' }}
          tooltip={
            data?.tags?.length ? (
              <>
                <Text>{getString('tagsLabel').toUpperCase()}</Text>
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
    </Container>
  )
}

const RenderColumnDetails: Renderer<CellProps<Feature>> = ({ row }) => {
  const data = row.original
  const { getString } = useStrings()
  const isOn = isFeatureFlagOn(data)
  const hasCustomRules = featureFlagHasCustomRules(data)
  const index = data.variations.findIndex(
    d => d.identifier === (isOn ? data.defaultOnVariation : data.defaultOffVariation)
  )
  const isFlagTypeBoolean = data.kind === FlagTypeVariations.booleanFlag
  const typeToString = useFeatureFlagTypeToStringMapping()

  return (
    <Layout.Vertical>
      <Layout.Horizontal>
        <Text>
          <VariationTypeIcon multivariate={data.kind !== FlagTypeVariations.booleanFlag} />
          {getString(isFlagTypeBoolean ? 'cf.boolean' : 'cf.multivariate')}
          {!isFlagTypeBoolean && (
            <Text inline color={Color.GREY_400} padding={{ left: 'xsmall' }}>
              ({typeToString[data.kind] || ''})
            </Text>
          )}
        </Text>
      </Layout.Horizontal>
      {!hasCustomRules && (
        <Container style={{ display: 'flex', alignItems: 'center' }}>
          <VariationWithIcon
            variation={data.variations[index]}
            index={index}
            textStyle={{
              fontSize: '12px',
              lineHeight: '24px',
              color: '#9293AB',
              paddingLeft: 'var(--spacing-xsmall)'
            }}
            textElement={getString(isOn ? 'cf.featureFlags.defaultServedOn' : 'cf.featureFlags.defaultServedOff', {
              defaultVariation: data.variations[index].name || data.variations[index].value
            })}
          />
        </Container>
      )}
    </Layout.Vertical>
  )
}

const RenderColumnLastUpdated: Renderer<CellProps<Feature>> = ({ row }) => {
  return row.original?.modifiedAt ? (
    <Layout.Horizontal spacing="small">
      <Icon name="activity" />
      <ReactTimeago date={row.original?.modifiedAt} />
    </Layout.Horizontal>
  ) : null
}

interface ColumnMenuProps {
  cell: Cell<Feature>
  environment?: string
}

const RenderColumnEdit: React.FC<ColumnMenuProps> = ({ cell: { row, column }, environment }) => {
  const data = row.original
  const { showError, clear } = useToaster()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const history = useHistory()
  const { getString } = useStrings()
  const { mutate } = useDeleteFeatureFlag({
    queryParams: {
      project: projectIdentifier as string,
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier
    } as DeleteFeatureFlagQueryParams
  })
  const refetch = ((column as unknown) as { refetch: () => void }).refetch
  const deleteFlag = useConfirmAction({
    title: getString('cf.featureFlags.deleteFlag'),
    confirmText: getString('delete'),
    message: (
      <Text>
        <span
          dangerouslySetInnerHTML={{ __html: getString('cf.featureFlags.deleteFlagMessage', { name: data.name }) }}
        />
      </Text>
    ),
    action: async () => {
      try {
        clear()
        await mutate(data.identifier)
          .then(() => {
            showToaster(getString('cf.messages.flagDeleted'))
            refetch?.()
          })
          .catch(error => {
            showError(getErrorMessage(error))
          })
      } catch (error) {
        showError(getErrorMessage(error))
      }
    }
  })

  const gotoDetailPage = (): void => {
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
    <Container style={{ textAlign: 'right' }} onClick={Utils.stopEvent}>
      <OptionsMenuButton
        items={[
          {
            icon: 'edit',
            text: getString('edit'),
            onClick: gotoDetailPage
          },
          {
            icon: 'trash',
            text: getString('delete'),
            onClick: deleteFlag
          }
        ]}
      />
    </Container>
  )
}

const FeatureFlagsPage: React.FC = () => {
  // const [isSaveFiltersOn, setIsSaveFiltersOn] = useState(false)
  // const [isDrawerOpened, setIsDrawerOpened] = useState(false)
  const [activeEnvironment, setActiveEnvironment] = useState<EnvironmentResponseDTO>()
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const urlQuery: Record<string, string> = useQueryParams()
  const history = useHistory()
  const [pageNumber, setPageNumber] = useState(0)
  const queryParams = useMemo(
    () => ({
      project: projectIdentifier as string,
      environment: activeEnvironment?.identifier as string,
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      pageNumber
    }),
    [projectIdentifier, activeEnvironment?.identifier, accountId, orgIdentifier, pageNumber] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const { data, loading: flagsLoading, error: flagsError, refetch } = useGetAllFeatures({
    lazy: true,
    queryParams
  })
  const {
    EnvironmentSelect,
    loading: envsLoading,
    error: envsError,
    refetch: refetchEnvironments,
    environments
  } = useEnvironmentSelectV2({
    selectedEnvironmentIdentifier: urlQuery.activeEnvironment || activeEnvironment?.identifier,
    onChange: (_value, _environment, _userEvent) => {
      setActiveEnvironment(_environment)
      rewriteCurrentLocationWithActiveEnvironment(_environment)
      refetch({ queryParams: { ...queryParams, environment: _environment.identifier as string } })
    },
    onEmpty: () => {
      refetch({ queryParams: { ...queryParams, environment: (undefined as unknown) as string } })
    }
  })
  const [features, setFeatures] = useState<Features | null>()
  const { getString } = useStrings()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setFeatures(data)
  }, [data])

  useEffect(() => {
    setLoading(flagsLoading || envsLoading)
  }, [flagsLoading, envsLoading])

  const error = flagsError || envsError

  const columns: Column<Feature>[] = useMemo(
    () => [
      {
        Header: getString('featureFlagsText').toUpperCase(),
        accessor: row => row.name,
        width: '35%',
        activeEnvironment,
        Cell: function WrapperRenderColumnFlag(cell: Cell<Feature>) {
          return (
            <RenderColumnFlag
              cell={cell}
              update={status => {
                // Update last updated column to reflect latest change without having to refetch the whole list
                // The setTimeout makes sure there's enough time for animation in the switch component before re-rendering
                // takes place and destroy it
                setTimeout(() => {
                  const feature = features?.features?.find(f => f.identifier === cell.row.original.identifier)
                  if (feature) {
                    if (feature.envProperties) {
                      feature.envProperties.state = (status
                        ? FeatureFlagActivationStatus.ON
                        : FeatureFlagActivationStatus.OFF) as FeatureState
                    }
                    feature.modifiedAt = Date.now()
                    setFeatures({ ...features } as Features)
                  }
                }, 1000)
              }}
            />
          )
        }
      },
      {
        Header: getString('details').toUpperCase(),
        accessor: row => row.kind,
        width: '20%',
        Cell: RenderColumnDetails
      },
      {
        Header: getString('status').toUpperCase(),
        accessor: 'status',
        width: '19%',
        Cell: function StatusCell(cell: Cell<Feature>) {
          return (
            <FlagStatus
              status={cell.row.original.status?.status as FeatureFlagStatus}
              lastAccess={(cell.row.original.status?.lastAccess as unknown) as number}
            />
          )
        }
      },
      {
        Header: getString('cf.featureFlags.results').toUpperCase(),
        accessor: row => row.results,
        width: '11%',
        Cell: function ResultCell(cell: Cell<Feature>) {
          return <FlagResult feature={cell.row.original} />
        }
      },
      {
        Header: getString('lastUpdated').toUpperCase(),
        accessor: row => row.modifiedAt,
        width: '10%',
        Cell: RenderColumnLastUpdated
      },
      {
        Header: '',
        id: 'version',
        width: '5%',
        Cell: function WrapperRenderColumnEdit(cell: Cell<Feature>) {
          return <RenderColumnEdit cell={cell} environment={cell.row.original.envProperties?.environment as string} />
        },
        disableSortBy: true,
        refetch
      }
    ],
    [refetch, features, getString, activeEnvironment]
  )

  // const onDrawerOpened = (): void => {
  //   setIsDrawerOpened(true)
  // }

  // const onDrawerClose = (): void => {
  //   setIsDrawerOpened(false)
  // }

  const hasFeatureFlags = features?.features && features?.features?.length > 0
  const emptyFeatureFlags = !loading && features?.features?.length === 0
  const title = getString('featureFlagsText')
  const header = (
    <Layout.Horizontal flex={{ align: 'center-center' }} style={{ flexGrow: 1 }} padding={{ right: 'xlarge' }}>
      <ListingPageTitle style={{ borderBottom: 'none' }}>{title}</ListingPageTitle>
      <FlexExpander />
      {!!environments?.length && <CFEnvironmentSelect component={<EnvironmentSelect />} />}
    </Layout.Horizontal>
  )

  return (
    <ListingPageTemplate
      pageTitle={title}
      header={header}
      headerStyle={{ display: 'flex' }}
      toolbar={
        <Layout.Horizontal>
          <FlagDialog disabled={loading} environment={activeEnvironment?.identifier as string} />
          <FlexExpander />

          {/** TODO: Disable search as backend does not support it yet */}
          {/* <ExpandingSearchInput name="findFlag" placeholder={i18n.searchInputFlag} className={css.ffPageBtnsSearch} /> */}

          {/** TODO: Disable filter as backend does not fully support it yet */}
          {/* <Button
            disabled={loading}
            icon="settings"
            iconProps={{ size: 20, color: Color.BLUE_500 }}
            minimal
            intent="primary"
            onClick={onDrawerOpened}
          /> */}
        </Layout.Horizontal>
      }
      content={
        <>
          {hasFeatureFlags && (
            <Container padding={{ top: 'medium', right: 'xxlarge', left: 'xxlarge' }}>
              <Container className={css.list}>
                <Table<Feature>
                  columns={columns}
                  data={features?.features || []}
                  onRowClick={feature => {
                    history.push(
                      routes.toCFFeatureFlagsDetail({
                        orgIdentifier: orgIdentifier as string,
                        projectIdentifier: projectIdentifier as string,
                        environmentIdentifier: feature.envProperties?.environment || '',
                        featureFlagIdentifier: feature.identifier,
                        accountId
                      }) +
                        `${activeEnvironment?.identifier ? `?activeEnvironment=${activeEnvironment?.identifier}` : ''}`
                    )
                  }}
                />
              </Container>
            </Container>
          )}

          {!loading && emptyFeatureFlags && (
            <Container width="100%" height="100%" flex={{ align: 'center-center' }}>
              <NoData imageURL={imageURL} message={getString('cf.noFlag')}>
                <FlagDialog environment={activeEnvironment?.identifier as string} />
              </NoData>
            </Container>
          )}
        </>
      }
      pagination={
        !!features?.features?.length && (
          <Pagination
            itemCount={features?.itemCount || 0}
            pageSize={features?.pageSize || 0}
            pageCount={features?.pageCount || 0}
            pageIndex={pageNumber}
            gotoPage={index => {
              setPageNumber(index)
              refetch({ queryParams: { ...queryParams, pageNumber: index } })
            }}
          />
        )
      }
      loading={loading}
      error={error}
      retryOnError={() => {
        setPageNumber(0)
        refetchEnvironments()
      }}
    />
  )
}

export default FeatureFlagsPage
