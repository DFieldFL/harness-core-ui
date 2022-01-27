/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useHistory } from 'react-router-dom'
import moment from 'moment'
import ReactTimeago from 'react-timeago'
import { Intent } from '@blueprintjs/core'
import {
  Button,
  Color,
  Container,
  ExpandingSearchInput,
  FlexExpander,
  Layout,
  Pagination,
  TableV2,
  Text
} from '@wings-software/uicore'
import type { Cell, Column } from 'react-table'
import { ListingPageTemplate } from '@cf/components/ListingPageTemplate/ListingPageTemplate'
import {
  CF_DEFAULT_PAGE_SIZE,
  getErrorMessage,
  rewriteCurrentLocationWithActiveEnvironment,
  SEGMENT_PRIMARY_COLOR,
  showToaster,
  TARGET_PRIMARY_COLOR
} from '@cf/utils/CFUtils'
import { useConfirmAction } from '@common/hooks'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'
import { useToaster } from '@common/exports'
import { Segment, Target, useDeleteTarget, useGetAllTargets } from 'services/cf'
import {
  makeStackedCircleShortName,
  StackedCircleContainer
} from '@cf/components/StackedCircleContainer/StackedCircleContainer'
import { useEnvironmentSelectV2 } from '@cf/hooks/useEnvironmentSelectV2'
import { NoEnvironment } from '@cf/components/NoEnvironment/NoEnvironment'
import TargetManagementHeader from '@cf/components/TargetManagementHeader/TargetManagementHeader'
import useActiveEnvironment from '@cf/hooks/useActiveEnvironment'
import RbacOptionsMenuButton from '@rbac/components/RbacOptionsMenuButton/RbacOptionsMenuButton'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import usePlanEnforcement from '@cf/hooks/usePlanEnforcement'
import UsageLimitBanner from '@cf/components/UsageLimitBanner/UsageLimitBanner'
import { FeatureIdentifier } from 'framework/featureStore/FeatureIdentifier'
import { NoTargetsView } from './NoTargetsView'
import { NewTargets } from './NewTarget'

export const TargetsPage: React.FC = () => {
  const { activeEnvironment, withActiveEnvironment } = useActiveEnvironment()
  const {
    EnvironmentSelect,
    loading: loadingEnvironments,
    error: errEnvironments,
    refetch: refetchEnvs,
    environments
  } = useEnvironmentSelectV2({
    selectedEnvironmentIdentifier: activeEnvironment,
    onChange: (_value, _environment, _userEvent) => {
      rewriteCurrentLocationWithActiveEnvironment(_environment)
    }
  })
  const { projectIdentifier, orgIdentifier, accountId } = useParams<Record<string, string>>()
  const { getString } = useStrings()
  const [pageNumber, setPageNumber] = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const queryParams = useMemo(
    () => ({
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      project: projectIdentifier,
      environment: activeEnvironment,
      pageNumber,
      pageSize: CF_DEFAULT_PAGE_SIZE,
      targetName: searchTerm
    }),
    [accountId, orgIdentifier, projectIdentifier, activeEnvironment, pageNumber, searchTerm] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const {
    data: targetsData,
    loading: loadingTargets,
    error: errTargets,
    refetch: refetchTargets
  } = useGetAllTargets({
    queryParams,
    lazy: !activeEnvironment
  })
  const history = useHistory()
  const onSearchInputChanged = useCallback(
    targetName => {
      setSearchTerm(targetName)
      refetchTargets({ queryParams: { ...queryParams, targetName } })
    },
    [setSearchTerm, refetchTargets, queryParams]
  )
  const loading = loadingEnvironments || loadingTargets
  const error = errEnvironments || errTargets
  const noTargetExists = targetsData?.targets?.length === 0
  const noEnvironmentExists = !loadingEnvironments && environments?.length === 0
  const title = getString('cf.shared.targets')

  const { isPlanEnforcementEnabled } = usePlanEnforcement()
  const planEnforcementProps = isPlanEnforcementEnabled
    ? {
        featuresProps: {
          featuresRequest: {
            featureNames: [FeatureIdentifier.MAUS]
          }
        }
      }
    : undefined

  const toolbar = (
    <Layout.Horizontal spacing="medium">
      <NewTargets
        accountId={accountId}
        orgIdentifier={orgIdentifier}
        projectIdentifier={projectIdentifier}
        onCreated={() => {
          setPageNumber(0)
          refetchTargets({ queryParams: { ...queryParams, pageNumber: 0 } })
          showToaster(getString('cf.messages.targetCreated'))
        }}
      />
      <Text font={{ size: 'small' }} color={Color.GREY_400} style={{ alignSelf: 'center' }}>
        {getString('cf.targets.pageDescription')}
      </Text>
      <FlexExpander />
      <ExpandingSearchInput
        alwaysExpanded
        name="findFlag"
        placeholder={getString('search')}
        onChange={onSearchInputChanged}
      />
    </Layout.Horizontal>
  )

  const gotoTargetDetailPage = useCallback(
    (identifier: string): void => {
      history.push(
        withActiveEnvironment(
          routes.toCFTargetDetails({
            accountId,
            orgIdentifier,
            projectIdentifier,
            targetIdentifier: identifier as string
          })
        )
      )
    },
    [history, accountId, orgIdentifier, projectIdentifier, withActiveEnvironment]
  )
  const { showError, clear } = useToaster()
  const deleteTargetParams = useMemo(
    () => ({
      account: accountId,
      accountIdentifier: accountId,
      org: orgIdentifier,
      project: projectIdentifier,
      environment: activeEnvironment
    }),
    [accountId, orgIdentifier, projectIdentifier, activeEnvironment] // eslint-disable-line react-hooks/exhaustive-deps
  )
  const { mutate: deleteTarget } = useDeleteTarget({
    queryParams: deleteTargetParams
  })

  const columns: Column<Target>[] = useMemo(
    () => [
      {
        Header: getString('cf.shared.target').toUpperCase(),
        id: 'name',
        accessor: 'name',
        width: '30%',
        Cell: function NameCell(cell: Cell<Target>) {
          return (
            <Layout.Horizontal spacing="xsmall" style={{ alignItems: 'center' }}>
              <StackedCircleContainer
                items={[{ name: cell.row.original.name, identifier: cell.row.original.identifier }]}
                keyOfItem={item => item.identifier}
                renderItem={item => <Text>{makeStackedCircleShortName(item.name)}</Text>}
                backgroundColor={() => TARGET_PRIMARY_COLOR}
                margin={{ right: 'small' }}
              />
              <Text color={Color.GREY_900}>{cell.row.original.name}</Text>
            </Layout.Horizontal>
          )
        }
      },
      {
        Header: getString('identifier').toUpperCase(),
        id: 'identifier',
        accessor: 'identifier',
        width: '25%',
        Cell: function IdCell(cell: Cell<Target>) {
          return <Text>{cell.row.original.identifier}</Text>
        }
      },
      {
        Header: getString('cf.shared.segments').toUpperCase(),
        id: 'targetSegment',
        accessor: 'attributes',
        width: '25%',
        Cell: function AttrCell(cell: Cell<Target & { segments: Segment[] }>) {
          return (
            <>
              {cell.row.original.segments?.length ? (
                <StackedCircleContainer
                  items={cell.row.original.segments}
                  keyOfItem={item => item.identifier}
                  renderItem={item => (
                    <Button noStyling tooltip={item.name}>
                      {makeStackedCircleShortName(item.name)}
                    </Button>
                  )}
                  renderOtherItem={otherItems => (
                    <Button
                      tooltip={
                        <Container padding="large">
                          {otherItems.map(item => (
                            <Text key={item.identifier}>{item.name}</Text>
                          ))}
                        </Container>
                      }
                      noStyling
                    >
                      +{otherItems.length}
                    </Button>
                  )}
                  backgroundColor={item => (item === true ? 'var(--blue-450)' : SEGMENT_PRIMARY_COLOR)}
                />
              ) : (
                <Text>{getString('cf.targets.noneDefined')}</Text>
              )}
            </>
          )
        }
      },
      {
        Header: getString('cf.targets.createdDate').toUpperCase(),
        id: 'createdAt',
        accessor: 'createdAt',
        width: '20%',
        Cell: function CreateAtCell(cell: Cell<Target>) {
          const deleteTargetConfirm = useConfirmAction({
            title: getString('cf.targets.deleteTarget'),
            message: (
              <Text>
                <span
                  dangerouslySetInnerHTML={{
                    __html: getString('cf.targets.deleteTargetMessage', { name: cell.row.original.name })
                  }}
                />
              </Text>
            ),
            intent: Intent.DANGER,
            action: async () => {
              clear()

              try {
                deleteTarget(cell.row.original.identifier as string)
                  .then(() => {
                    refetchTargets()
                    showToaster(getString('cf.messages.targetDeleted'))
                  })
                  .catch(_error => {
                    showError(getErrorMessage(_error), 0, 'cf.delete.target.error')
                  })
              } catch (err) {
                showError(getErrorMessage(err), 0, 'cf.delete.target.error')
              }
            }
          })

          return (
            <Layout.Horizontal flex={{ distribution: 'space-between', align: 'center-center' }}>
              <Text>
                <ReactTimeago date={moment(cell.row.original.createdAt).toDate()} />
              </Text>
              <Container
                style={{ textAlign: 'right' }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                }}
              >
                <RbacOptionsMenuButton
                  data-testid="rbac-options-menu-btn"
                  items={[
                    {
                      icon: 'edit',
                      text: getString('edit'),
                      onClick: () => {
                        gotoTargetDetailPage(cell.row.original.identifier as string)
                      },
                      permission: {
                        resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
                        permission: PermissionIdentifier.EDIT_FF_TARGETGROUP
                      },
                      ...planEnforcementProps
                    },
                    {
                      icon: 'trash',
                      text: getString('delete'),
                      onClick: deleteTargetConfirm,
                      permission: {
                        resource: { resourceType: ResourceType.ENVIRONMENT, resourceIdentifier: activeEnvironment },
                        permission: PermissionIdentifier.DELETE_FF_TARGETGROUP
                      },
                      ...planEnforcementProps
                    }
                  ]}
                />
              </Container>
            </Layout.Horizontal>
          )
        }
      }
    ],
    [getString, clear, deleteTarget, gotoTargetDetailPage, refetchTargets, showError, planEnforcementProps]
  )

  useEffect(() => {
    return () => {
      clear()
    }
  }, [clear])

  const content = noEnvironmentExists ? (
    <Container flex={{ align: 'center-center' }} height="100%">
      <NoEnvironment
        onCreated={response => {
          const { location } = window
          location.replace(`${location.href}?activeEnvironment=${response?.data?.identifier}`)
          refetchEnvs()
        }}
      />
    </Container>
  ) : noTargetExists ? (
    <NoTargetsView
      onNewTargetsCreated={() => {
        setPageNumber(0)
        refetchTargets({ queryParams: { ...queryParams, pageNumber: 0 } })
        showToaster(getString('cf.messages.targetCreated'))
      }}
      hasEnvironment={!!environments?.length}
    />
  ) : (
    <>
      {isPlanEnforcementEnabled && <UsageLimitBanner />}
      <Container padding={{ top: 'medium', right: 'xxlarge', left: 'xxlarge' }}>
        <TableV2<Target>
          columns={columns}
          data={targetsData?.targets || []}
          onRowClick={target => {
            gotoTargetDetailPage(target.identifier as string)
          }}
        />
      </Container>
    </>
  )

  const displayToolbar = !noEnvironmentExists && (!noTargetExists || searchTerm)

  return (
    <ListingPageTemplate
      pageTitle={title}
      header={
        <TargetManagementHeader environmentSelect={<EnvironmentSelect />} hasEnvironments={!!environments?.length} />
      }
      headerStyle={{ display: 'flex' }}
      toolbar={displayToolbar && toolbar}
      content={((!error || noEnvironmentExists) && content) || null}
      pagination={
        !noEnvironmentExists &&
        !!targetsData?.targets?.length && (
          <Pagination
            itemCount={targetsData?.itemCount || 0}
            pageSize={targetsData?.pageSize || 0}
            pageCount={targetsData?.pageCount || 0}
            pageIndex={pageNumber}
            gotoPage={index => {
              setPageNumber(index)
              refetchTargets({ queryParams: { ...queryParams, pageNumber: index } })
            }}
          />
        )
      }
      loading={loading}
      error={noEnvironmentExists ? undefined : error}
      retryOnError={() => {
        refetchEnvs()
        refetchTargets()
      }}
    />
  )
}
