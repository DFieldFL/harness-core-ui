/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState, useMemo, useReducer } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import {
  useToaster,
  ButtonVariation,
  CardSelect,
  CardSelectType,
  Card,
  NoDataCard,
  Pagination,
  Layout,
  FlexExpander,
  Container
} from '@wings-software/uicore'
import slosEmptyState from '@cv/assets/slosEmptyState.svg'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import {
  useDeleteSLOData,
  useGetAllJourneys,
  useGetAllMonitoredServicesWithTimeSeriesHealthSources,
  useGetSLODashboardWidgets,
  useGetServiceLevelObjectivesRiskCount,
  RiskCount,
  useResetErrorBudget,
  SLOErrorBudgetResetDTO
} from 'services/cv'
import RbacButton from '@rbac/components/Button/Button'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import SLOCardSelect from './components/SLOCardSelect/SLOCardSelect'
import type { CVSLOsListingPageProps, SLORiskFilter } from './CVSLOsListingPage.types'
import {
  getErrorObject,
  getIsSLODashboardAPIsLoading,
  getSLORiskTypeFilter,
  getIsWidgetDataEmpty,
  getIsDataEmpty,
  getIsSetPreviousPage,
  sloFilterReducer,
  SLODashboardFilterActions,
  getInitialFilterStateLazy,
  getSLODashboardWidgetsParams,
  getServiceLevelObjectivesRiskCountParams,
  getUserJourneyParams,
  getMonitoredServicesInitialState,
  getInitialFilterState,
  getClassNameForMonitoredServicePage
} from './CVSLOListingPage.utils'
import SLODashbordFilters from './components/SLODashbordFilters/SLODashbordFilters'
import SLOCardHeader from './SLOCard/SLOCardHeader'
import SLOCardContent from './SLOCard/SLOCardContent'
import css from './CVSLOsListingPage.module.scss'

const CVSLOsListingPage: React.FC<CVSLOsListingPageProps> = ({ monitoredService }) => {
  const history = useHistory()
  const { getString } = useStrings()
  const { showError, showSuccess } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const [filterState, dispatch] = useReducer(sloFilterReducer, getInitialFilterState(getString), passedInitialState =>
    getInitialFilterStateLazy(passedInitialState, monitoredService)
  )

  useEffect(() => {
    if (monitoredService?.identifier) {
      dispatch(SLODashboardFilterActions.updateMonitoredServices(getMonitoredServicesInitialState(monitoredService)))
    }
  }, [monitoredService])
  const [pageNumber, setPageNumber] = useState(0)

  useEffect(() => {
    setPageNumber(0)
  }, [projectIdentifier])

  const pathParams = useMemo(() => {
    return {
      accountId,
      orgIdentifier,
      projectIdentifier
    }
  }, [accountId, orgIdentifier, projectIdentifier])

  const {
    data: dashboardWidgetsResponse,
    loading: dashboardWidgetsLoading,
    refetch: refetchDashboardWidgets,
    error: dashboardWidgetsError
  } = useGetSLODashboardWidgets(getSLODashboardWidgetsParams(pathParams, getString, filterState, pageNumber))

  const {
    data: riskCountResponse,
    loading: riskCountLoading,
    refetch: refetchRiskCount,
    error: dashboardRiskCountError
  } = useGetServiceLevelObjectivesRiskCount(
    getServiceLevelObjectivesRiskCountParams(pathParams, getString, filterState)
  )

  const {
    data: monitoredServicesData,
    loading: monitoredServicesLoading,
    error: monitoredServicesDataError,
    refetch: refetchMonitoredServicesData
  } = useGetAllMonitoredServicesWithTimeSeriesHealthSources({
    queryParams: pathParams
  })

  const {
    content,
    totalItems = 0,
    totalPages = 0,
    pageIndex = 0,
    pageItemCount = 0,
    pageSize = 10
  } = dashboardWidgetsResponse?.data ?? {}

  const {
    data: userJourneysData,
    loading: userJourneysLoading,
    error: userJourneysError,
    refetch: refetchUserJourneys
  } = useGetAllJourneys(getUserJourneyParams(pathParams))

  const { mutate: deleteSLO, loading: deleteSLOLoading } = useDeleteSLOData({
    queryParams: pathParams
  })

  const onDelete = async (identifier: string, name: string): Promise<void> => {
    try {
      await deleteSLO(identifier)
      if (getIsSetPreviousPage(pageIndex, pageItemCount)) {
        setPageNumber(prevPageNumber => prevPageNumber - 1)
      } else {
        await refetchDashboardWidgets()
      }
      await refetchRiskCount()
      showSuccess(getString('cv.slos.sloDeleted', { name }))
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const { mutate: resetErrorBudget, loading: resetErrorBudgetLoading } = useResetErrorBudget({
    identifier: '',
    queryParams: pathParams
  })

  const onResetErrorBudget = async (identifier: string, formData: SLOErrorBudgetResetDTO): Promise<void> => {
    try {
      await resetErrorBudget(formData, { pathParams: { identifier } })
      await Promise.all([refetchDashboardWidgets(), refetchRiskCount()])

      showSuccess(getString('cv.errorBudgetIsSuccessfullyReset'))
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const getAddSLOButton = (): JSX.Element => (
    <RbacButton
      icon="plus"
      text={getString('cv.slos.createSLO')}
      variation={ButtonVariation.PRIMARY}
      onClick={() => {
        history.push(routes.toCVCreateSLOs({ accountId, orgIdentifier, projectIdentifier }))
      }}
      className={getClassNameForMonitoredServicePage(css.createSloInMonitoredService, monitoredService?.identifier)}
      permission={{
        permission: PermissionIdentifier.EDIT_SLO_SERVICE,
        resource: {
          resourceType: ResourceType.SLO,
          resourceIdentifier: projectIdentifier
        }
      }}
    />
  )

  const onFilter = (currentRiskFilter: SLORiskFilter): void => {
    setPageNumber(0)
    const { updateSloRiskType } = SLODashboardFilterActions
    if (filterState.sloRiskFilter?.identifier === currentRiskFilter.identifier) {
      dispatch(updateSloRiskType({ sloRiskFilter: null }))
    } else {
      dispatch(updateSloRiskType({ sloRiskFilter: currentRiskFilter }))
    }
  }

  const filterItemsData = useMemo(
    () => ({ userJourney: userJourneysData, monitoredServices: monitoredServicesData }),
    [userJourneysData, monitoredServicesData]
  )

  return (
    <>
      {!monitoredService?.identifier && !!content?.length && (
        <>
          <Page.Header breadcrumbs={<NGBreadcrumbs />} title={getString('cv.slos.title')} />
          <Page.Header title={getAddSLOButton()} />
        </>
      )}

      <Page.Body
        loading={getIsSLODashboardAPIsLoading(
          userJourneysLoading,
          dashboardWidgetsLoading,
          deleteSLOLoading,
          monitoredServicesLoading,
          riskCountLoading,
          resetErrorBudgetLoading
        )}
        error={getErrorMessage(
          getErrorObject(dashboardWidgetsError, userJourneysError, dashboardRiskCountError, monitoredServicesDataError)
        )}
        retryOnError={() => {
          if (dashboardWidgetsError) {
            refetchDashboardWidgets()
          }
          if (userJourneysError) {
            refetchUserJourneys()
          }
          if (monitoredServicesDataError) {
            refetchMonitoredServicesData()
          }

          if (dashboardRiskCountError) {
            refetchRiskCount()
          }
        }}
        noData={{
          when: () => getIsDataEmpty(content?.length, riskCountResponse?.data?.riskCounts?.length),
          message: getString('cv.slos.noData'),
          icon: 'join-table'
        }}
        className={css.pageBody}
      >
        <Layout.Vertical height="100%" padding={{ top: 'medium', left: 'xlarge', right: 'xlarge', bottom: 'xlarge' }}>
          {!!content?.length && (
            <>
              <Layout.Horizontal className={css.sloFiltersRow1}>
                {monitoredService?.identifier && getAddSLOButton()}
                <Container
                  className={getClassNameForMonitoredServicePage(css.sloDropdownFilters, monitoredService?.identifier)}
                >
                  <SLODashbordFilters
                    filterState={filterState}
                    dispatch={dispatch}
                    filterItemsData={filterItemsData}
                    hideMonitoresServicesFilter={Boolean(monitoredService)}
                  />
                </Container>
              </Layout.Horizontal>

              <CardSelect<SLORiskFilter>
                type={CardSelectType.CardView}
                data={getSLORiskTypeFilter(
                  getString,
                  riskCountResponse?.data?.riskCounts as RiskCount[] | undefined,
                  riskCountResponse?.data?.totalCount
                )}
                cardClassName={css.sloRiskFilterCard}
                renderItem={({ ...props }) => <SLOCardSelect key={props.identifier} {...props} />}
                selected={filterState.sloRiskFilter as SLORiskFilter}
                onChange={onFilter}
              />
              <hr />
              <div className={css.sloCardContainer} data-testid="slo-card-container">
                {content.map(serviceLevelObjective => (
                  <Card key={serviceLevelObjective.sloIdentifier} className={css.sloCard}>
                    <SLOCardHeader
                      onDelete={onDelete}
                      onResetErrorBudget={onResetErrorBudget}
                      serviceLevelObjective={serviceLevelObjective}
                      monitoredServiceIdentifier={monitoredService?.identifier}
                    />
                    <SLOCardContent serviceLevelObjective={serviceLevelObjective} />
                  </Card>
                ))}
              </div>
              <FlexExpander />
              <Pagination
                itemCount={totalItems}
                pageCount={totalPages}
                pageIndex={pageIndex}
                pageSize={pageSize}
                gotoPage={setPageNumber}
              />
            </>
          )}

          {getIsWidgetDataEmpty(content?.length, dashboardWidgetsLoading) && (
            <NoDataCard
              image={slosEmptyState}
              messageTitle={getString('cv.slos.noData')}
              message={
                'A service level objective (SLO) is the sum of a collection of performance metrics (Service Level Indicator or SLI) such as uptime, response time, and error rate that are used to measure the services performance. At least one SLO is required to monitor a service.'
              }
              button={getAddSLOButton()}
            />
          )}
        </Layout.Vertical>
      </Page.Body>
    </>
  )
}

export default CVSLOsListingPage
