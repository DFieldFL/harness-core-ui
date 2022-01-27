/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  Button,
  Color,
  Container,
  ExpandingSearchInput,
  FlexExpander,
  Heading,
  Layout,
  Pagination,
  Text,
  Utils,
  HarnessDocTooltip,
  TableV2
} from '@wings-software/uicore'
import { noop } from 'lodash-es'
import { Classes, Position, Switch } from '@blueprintjs/core'
import type { Cell, CellProps, Column, Renderer } from 'react-table'
import type { MutateMethod } from 'restful-react'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import {
  DeleteFeatureFlagQueryParams,
  Feature,
  Features,
  FeatureState,
  GitSyncErrorResponse,
  useDeleteFeatureFlag,
  useGetAllFeatures
} from 'services/cf'
import { useStrings } from 'framework/strings'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import RBACTooltip from '@rbac/components/RBACTooltip/RBACTooltip'
import { usePermission } from '@rbac/hooks/usePermission'
import { UseToggleFeatureFlag, useToggleFeatureFlag } from '@cf/hooks/useToggleFeatureFlag'
import { VariationTypeIcon } from '@cf/components/VariationTypeIcon/VariationTypeIcon'
import { VariationWithIcon } from '@cf/components/VariationWithIcon/VariationWithIcon'
import { ListingPageTemplate, ListingPageTitle } from '@cf/components/ListingPageTemplate/ListingPageTemplate'
import { NoData } from '@cf/components/NoData/NoData'
import { useEnvironmentSelectV2 } from '@cf/hooks/useEnvironmentSelectV2'
import type { EnvironmentResponseDTO } from 'services/cd-ng'
import { CFEnvironmentSelect } from '@cf/components/CFEnvironmentSelect/CFEnvironmentSelect'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import {
  CF_DEFAULT_PAGE_SIZE,
  FeatureFlagActivationStatus,
  featureFlagHasCustomRules,
  getErrorMessage,
  isFeatureFlagOn,
  rewriteCurrentLocationWithActiveEnvironment,
  useFeatureFlagTypeToStringMapping
} from '@cf/utils/CFUtils'
import { FlagTypeVariations } from '@cf/components/CreateFlagDialog/FlagDialogUtils'
import FlagDialog from '@cf/components/CreateFlagDialog/FlagDialog'

import SaveFlagToGitModal from '@cf/components/SaveFlagToGitModal/SaveFlagToGitModal'
import { AUTO_COMMIT_MESSAGES } from '@cf/constants/GitSyncConstants'
import GitSyncActions from '@cf/components/GitSyncActions/GitSyncActions'
import { GitDetails, GitSyncFormValues, GIT_SYNC_ERROR_CODE, useGitSync, UseGitSync } from '@cf/hooks/useGitSync'
import UsageLimitBanner from '@cf/components/UsageLimitBanner/UsageLimitBanner'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import FlagOptionsMenuButton from '@cf/components/FlagOptionsMenuButton/FlagOptionsMenuButton'
import imageURL from './Feature_Flags_Teepee.svg'
import { FeatureFlagStatus, FlagStatus } from './FlagStatus'
import { FlagResult } from './FlagResult'
import css from './FeatureFlagsPage.module.scss'

interface RenderColumnFlagProps {
  gitSync: UseGitSync
  cell: Cell<Feature>
  toggleFeatureFlag: UseToggleFeatureFlag
  update: (status: boolean) => void
}

const RenderColumnFlag: React.FC<RenderColumnFlagProps> = ({
  gitSync,
  toggleFeatureFlag,
  cell: { row, column },
  update
}) => {
  const data = row.original

  const [status, setStatus] = useState(isFeatureFlagOn(data))
  const { getString } = useStrings()
  const { showError } = useToaster()
  const [flagNameTextSize, setFlagNameTextSize] = useState(300)
  const ref = useRef<HTMLDivElement>(null)
  const { activeEnvironment } = useActiveEnvironment()

  const [isSaveToggleModalOpen, setIsSaveToggleModalOpen] = useState(false)

  const { gitSyncInitialValues } = gitSync.getGitSyncFormMeta(AUTO_COMMIT_MESSAGES.TOGGLED_FLAG)

  const [canToggle] = usePermission(
    {
      resource: {
        resourceType: ResourceType.ENVIRONMENT,
        resourceIdentifier: activeEnvironment
      },
      permissions: [PermissionIdentifier.TOGGLE_FF_FEATUREFLAG]
    },
    [activeEnvironment]
  )

  const handleFlagToggle = async (gitSyncFormValues?: GitSyncFormValues): Promise<void> => {
    let gitDetails: GitDetails | undefined

    if (gitSync.isAutoCommitEnabled) {
      gitDetails = gitSyncInitialValues.gitDetails
    } else if (gitSyncFormValues) {
      gitDetails = gitSyncFormValues.gitDetails
    }

    try {
      if (status) {
        await toggleFeatureFlag.off(data.identifier, gitDetails)
      } else {
        await toggleFeatureFlag.on(data.identifier, gitDetails)
      }

      if (gitSyncFormValues?.autoCommit) {
        gitSync.handleAutoCommit(gitSyncFormValues.autoCommit)
      }

      setStatus(!status)
      update(!status)
    } catch (error: any) {
      if (error.status === GIT_SYNC_ERROR_CODE) {
        gitSync.handleError(error.data as GitSyncErrorResponse)
      } else {
        showError(getErrorMessage(error), 0, 'cf.toggle.ff.status.error')
      }
    }
  }

  const switchTooltip = (
    <Container width={'350px'} padding="xxxlarge">
      <Heading level={2} style={{ fontWeight: 600, fontSize: '24px', lineHeight: '32px', color: '#22222A' }}>
        {getString(status ? 'cf.featureFlags.turnOffHeading' : 'cf.featureFlags.turnOnHeading')}
      </Heading>
      <Text margin={{ top: 'medium', bottom: 'small' }} style={{ lineHeight: '22px', color: '#383946' }}>
        <span
          // This is used to retain simple HTML markup in i18n string like <strong>
          // to make sure formatting is aligned with translations
          dangerouslySetInnerHTML={{
            __html: getString(status ? 'cf.featureFlags.turnOffMessage' : 'cf.featureFlags.turnOnMessage', {
              name: data.name,
              env: (column as unknown as { activeEnvironment?: EnvironmentResponseDTO })?.activeEnvironment?.name || ''
            })
          }}
        />
      </Text>
      <Text margin={{ top: 'xsmall', bottom: 'xlarge' }} style={{ lineHeight: '22px', color: '#383946' }}>
        {(!featureFlagHasCustomRules(data) && (
          <span
            // This is used to retain simple HTML markup in i18n string like <strong>
            // to make sure formatting is aligned with translations
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
            disabled={toggleFeatureFlag.loading}
            onClick={event => {
              event.preventDefault()
              if (gitSync.isGitSyncEnabled && !gitSync.isAutoCommitEnabled) {
                setIsSaveToggleModalOpen(true)
              } else {
                handleFlagToggle()
              }
            }}
          />
          <Button text={getString('cancel')} className={Classes.POPOVER_DISMISS} disabled={toggleFeatureFlag.loading} />
        </Layout.Horizontal>
        <span />
      </Container>
    </Container>
  )

  const onResize = (): void => {
    if (ref.current) {
      setFlagNameTextSize((ref.current.closest('div[role="cell"]') as HTMLDivElement)?.offsetWidth - 100)
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
          tooltip={
            data.archived ? undefined : canToggle ? (
              switchTooltip
            ) : (
              <RBACTooltip
                permission={PermissionIdentifier.TOGGLE_FF_FEATUREFLAG}
                resourceType={ResourceType.ENVIRONMENT}
              />
            )
          }
          tooltipProps={{ interactionKind: 'click', hasBackdrop: true, position: Position.TOP_LEFT }}
          className={css.toggleFlagButton}
          disabled={data.archived || !canToggle}
        >
          <Switch
            style={{ alignSelf: 'baseline', marginLeft: '-10px' }}
            alignIndicator="right"
            className={Classes.LARGE}
            checked={status}
            onChange={noop}
            disabled={data.archived || !canToggle}
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
              width={flagNameTextSize}
              lineClamp={1}
            >
              {data.description}
            </Text>
          )}
        </Layout.Vertical>
      </Layout.Horizontal>
      <Container onClick={event => event.stopPropagation()}>
        {isSaveToggleModalOpen && (
          <SaveFlagToGitModal
            flagName={data.name}
            flagIdentifier={data.identifier}
            onSubmit={handleFlagToggle}
            onClose={() => {
              setIsSaveToggleModalOpen(false)
            }}
          />
        )}
      </Container>
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

interface ColumnMenuProps {
  cell: Cell<Feature>
  environment?: string
  gitSync: UseGitSync
  deleteFlag: MutateMethod<void, string, DeleteFeatureFlagQueryParams, void>
}

const RenderColumnEdit: React.FC<ColumnMenuProps> = ({ gitSync, deleteFlag, cell: { row, column }, environment }) => {
  const data = row.original
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const queryParams = {
    project: projectIdentifier as string,
    account: accountId,
    accountIdentifier: accountId,
    org: orgIdentifier
  } as DeleteFeatureFlagQueryParams

  const refetch = (column as unknown as { refetch: () => void }).refetch

  return (
    <Container style={{ textAlign: 'right' }} onClick={Utils.stopEvent}>
      <FlagOptionsMenuButton
        environment={environment}
        flagData={data}
        queryParams={queryParams}
        deleteFlag={deleteFlag}
        gitSync={gitSync}
        refetchFlags={refetch}
      />
    </Container>
  )
}

const FeatureFlagsPage: React.FC = () => {
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const history = useHistory()
  const { activeEnvironment, withActiveEnvironment } = useActiveEnvironment()
  const [pageNumber, setPageNumber] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const queryParams = useMemo(
    () => ({
      project: projectIdentifier as string,
      environment: activeEnvironment,
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      pageNumber,
      metrics: true,
      name: searchTerm
    }),
    [projectIdentifier, activeEnvironment, accountId, orgIdentifier, pageNumber, searchTerm] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const {
    data,
    loading: flagsLoading,
    error: flagsError,
    refetch
  } = useGetAllFeatures({
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
    selectedEnvironmentIdentifier: activeEnvironment,
    onChange: (_value, _environment, _userEvent) => {
      rewriteCurrentLocationWithActiveEnvironment(_environment)
      refetch({ queryParams: { ...queryParams, environment: _environment.identifier as string } })
    },
    onEmpty: () => {
      refetch({ queryParams: { ...queryParams, environment: undefined as unknown as string } })
    }
  })

  const toggleFeatureFlag = useToggleFeatureFlag({
    accountIdentifier: accountId,
    orgIdentifier,
    projectIdentifier,
    environmentIdentifier: activeEnvironment
  })

  const deleteFlag = useDeleteFeatureFlag({ queryParams })

  const [features, setFeatures] = useState<Features | null>()
  const { getString } = useStrings()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setFeatures(data)
  }, [data])

  useEffect(() => {
    setLoading(flagsLoading || envsLoading)
  }, [flagsLoading, envsLoading])

  const gitSyncing = useMemo<boolean>(
    () => toggleFeatureFlag.loading || deleteFlag.loading,
    [toggleFeatureFlag.loading, deleteFlag.loading]
  )

  const gitSync = useGitSync()

  const { isPlanEnforcementEnabled } = usePlanEnforcement()

  const error = flagsError || envsError || deleteFlag.error || toggleFeatureFlag.error

  const columns: Column<Feature>[] = useMemo(
    () => [
      {
        Header: getString('featureFlagsText').toUpperCase(),
        accessor: row => row.name,
        width: '40%',
        activeEnvironment,
        Cell: function WrapperRenderColumnFlag(cell: Cell<Feature>) {
          return (
            <RenderColumnFlag
              gitSync={gitSync}
              toggleFeatureFlag={toggleFeatureFlag}
              cell={cell}
              update={status => {
                // Update last updated column to reflect latest change without having to refetch the whole list
                // The setTimeout makes sure there's enough time for animation in the switch component before re-rendering
                // takes place and destroy it

                // CB - It appears this isn't used, and needs to be refactored/taken out.
                //      However taking it out prevents the row from rerendering for some reason
                setTimeout(() => {
                  const feature = features?.features?.find(f => f.identifier === cell.row.original.identifier)
                  if (feature) {
                    if (feature.envProperties) {
                      feature.envProperties.state = (
                        status ? FeatureFlagActivationStatus.ON : FeatureFlagActivationStatus.OFF
                      ) as FeatureState
                    }
                    feature.modifiedAt = Date.now()
                    setFeatures({ ...features } as Features)
                  }
                }, 0)
              }}
            />
          )
        }
      },
      {
        Header: getString('details').toUpperCase(),
        accessor: row => row.kind,
        width: '22%',
        Cell: RenderColumnDetails
      },
      {
        Header: getString('status').toUpperCase(),
        accessor: 'status',
        width: '21%',
        Cell: function StatusCell(cell: Cell<Feature>) {
          return (
            <FlagStatus
              status={cell.row.original.status?.status as FeatureFlagStatus}
              lastAccess={cell.row.original.status?.lastAccess as unknown as number}
            />
          )
        }
      },
      {
        Header: getString('cf.featureFlags.results').toUpperCase(),
        accessor: row => row.results,
        width: '12%',
        Cell: function ResultCell(cell: Cell<Feature>) {
          return <FlagResult feature={cell.row.original} />
        }
      },
      {
        Header: '',
        id: 'version',
        width: '5%',
        Cell: function WrapperRenderColumnEdit(cell: Cell<Feature>) {
          return (
            <RenderColumnEdit
              gitSync={gitSync}
              deleteFlag={deleteFlag.mutate}
              cell={cell}
              environment={cell.row.original.envProperties?.environment as string}
            />
          )
        },
        disableSortBy: true,
        refetch
      }
    ],
    [refetch, features, getString, activeEnvironment, gitSync]
  )
  const onSearchInputChanged = useCallback(
    name => {
      setSearchTerm(name)
      refetch({ queryParams: { ...queryParams, name } })
    },
    [setSearchTerm, refetch, queryParams]
  )

  const hasFeatureFlags = features?.features && features?.features?.length > 0
  const emptyFeatureFlags = !loading && features?.features?.length === 0
  const title = getString('featureFlagsText')
  const header = (
    <Layout.Horizontal flex={{ align: 'center-center' }} style={{ flexGrow: 1 }} padding={{ right: 'xlarge' }}>
      <ListingPageTitle style={{ borderBottom: 'none' }}>
        <span data-tooltip-id="ff_ffListing_heading">
          {title}
          <HarnessDocTooltip tooltipId="ff_ffListing_heading" useStandAlone />
        </span>
      </ListingPageTitle>
      <FlexExpander />
      {!!environments?.length && <CFEnvironmentSelect component={<EnvironmentSelect />} />}
    </Layout.Horizontal>
  )

  const displayToolbar = hasFeatureFlags || searchTerm

  return (
    <ListingPageTemplate
      pageTitle={title}
      header={header}
      headerStyle={{ display: 'flex' }}
      toolbar={
        displayToolbar && (
          <Layout.Horizontal flex={{ alignItems: 'center' }}>
            <Container margin={{ right: 'small' }}>
              <FlagDialog environment={activeEnvironment} />
            </Container>
            {gitSync?.isGitSyncActionsEnabled && (
              <GitSyncActions
                isLoading={gitSync.gitSyncLoading || gitSyncing}
                branch={gitSync.gitRepoDetails?.branch || ''}
                repository={gitSync.gitRepoDetails?.repoIdentifier || ''}
                isAutoCommitEnabled={gitSync.isAutoCommitEnabled}
                isGitSyncPaused={gitSync.isGitSyncPaused}
                handleToggleAutoCommit={gitSync.handleAutoCommit}
                handleGitPause={gitSync.handleGitPause}
              />
            )}
            <FlexExpander />
            <ExpandingSearchInput
              alwaysExpanded
              name="findFlag"
              placeholder={getString('search')}
              onChange={onSearchInputChanged}
            />
          </Layout.Horizontal>
        )
      }
      content={
        <>
          {isPlanEnforcementEnabled && <UsageLimitBanner />}
          {hasFeatureFlags && (
            <Container padding={{ top: 'medium', right: 'xlarge', left: 'xlarge' }}>
              <Container className={css.list}>
                <TableV2<Feature>
                  columns={columns}
                  data={features?.features || []}
                  onRowClick={feature => {
                    history.push(
                      withActiveEnvironment(
                        routes.toCFFeatureFlagsDetail({
                          orgIdentifier: orgIdentifier as string,
                          projectIdentifier: projectIdentifier as string,
                          featureFlagIdentifier: feature.identifier,
                          accountId
                        })
                      )
                    )
                  }}
                />
              </Container>
            </Container>
          )}

          {!loading && emptyFeatureFlags && (
            <Container width="100%" height="100%" flex={{ align: 'center-center' }}>
              <NoData imageURL={imageURL} message={getString(searchTerm ? 'cf.noResultMatch' : 'cf.noFlag')}>
                <FlagDialog environment={activeEnvironment} />
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
