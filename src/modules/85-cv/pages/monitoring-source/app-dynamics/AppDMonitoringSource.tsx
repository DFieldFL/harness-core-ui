import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import CVOnboardingTabs from '@cv/components/CVOnboardingTabs/CVOnboardingTabs'
import useCVTabsHook from '@cv/hooks/CVTabsHook/useCVTabsHook'
import { useStrings } from 'framework/exports'
import type { BaseSetupTabsObject } from '@cv/pages/admin/setup/SetupUtils'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { Page } from '@common/exports'
import { useGetDSConfig, RestResponseDSConfig } from 'services/cv'
import { SelectProduct } from '../SelectProduct/SelectProduct'
import SelectApplications from './SelectApplications/SelectApplications'
import MapApplications from './MapApplications/MapApplications'
import ReviewTiersAndApps from './ReviewTiersAndApps/ReviewTiersAndApps'
import type { InternalState } from './AppDOnboardingUtils'

interface AppDMonitoringSourceDataType extends BaseSetupTabsObject {
  [key: string]: any // Add Types
}

function transformDSResponse(dsConfig: any) {
  if (dsConfig) {
    return {
      identifier: dsConfig.identifier,
      name: dsConfig.monitoringSourceName,
      connectorRef: { label: dsConfig.connectorIdentifier, value: dsConfig.connectorIdentifier },
      product: dsConfig.productName,
      applications: dsConfig.appConfigs.reduce((acc: InternalState, appConfig: any) => {
        acc[appConfig.applicationName] = {
          name: appConfig.applicationName,
          environment: appConfig.envIdentifier,
          tiers: appConfig.serviceMappings.reduce(
            (a: any, mapping: any) => ({
              ...a,
              [mapping.tierName]: {
                name: mapping.tierName,
                service: mapping.serviceIdentifier
              }
            }),
            {}
          ),
          metricPacks: appConfig.metricPacks
        }
        return acc
      }, {})
    }
  }
  return {}
}

const AppDMonitoringSource = () => {
  const { currentData, setCurrentData, onNext, onPrevious, currentTab, maxEnabledTab } = useCVTabsHook<
    AppDMonitoringSourceDataType
  >({ totalTabs: 4 })
  const { getString } = useStrings()
  const { accountId, projectIdentifier, orgIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()
  const { refetch: fetchDSConfig, loading, error } = useGetDSConfig({
    identifier,
    lazy: true,
    resolve: (response: RestResponseDSConfig) => {
      setCurrentData({
        ...currentData,
        ...transformDSResponse(response.resource)
      })
      return response
    }
  })

  useEffect(() => {
    if (identifier) {
      fetchDSConfig({
        queryParams: {
          accountId,
          projectIdentifier,
          orgIdentifier
        }
      })
    }
  }, [identifier])

  return (
    <Page.Body loading={loading} key={loading.toString()} error={error?.message} retryOnError={() => fetchDSConfig()}>
      <CVOnboardingTabs
        iconName="service-appdynamics"
        defaultEntityName={currentData?.name || 'Default Name'}
        setName={val => {
          setCurrentData({ ...currentData, name: val })
        }}
        onNext={onNext}
        onPrevious={onPrevious}
        currentTab={currentTab}
        maxEnabledTab={maxEnabledTab}
        tabProps={[
          {
            id: 1,
            title: getString('selectProduct'),
            component: (
              <SelectProduct
                stepData={currentData}
                type="AppDynamics"
                onCompleteStep={stepData => {
                  if (currentData?.connectorRef?.value !== stepData?.connectorRef?.value) {
                    stepData = { ...stepData, applications: null }
                  }
                  setCurrentData({ ...currentData, ...stepData })
                  onNext({ data: { ...currentData, ...stepData } })
                }}
              />
            )
          },
          {
            id: 2,
            title: getString('selectApplication'),
            component: (
              <SelectApplications
                stepData={{
                  connectorIdentifier: currentData?.connectorRef?.value,
                  applications: currentData?.applications
                }}
                onCompleteStep={stepData => {
                  setCurrentData({ ...currentData, ...stepData })
                  onNext({ data: { ...currentData, ...stepData } })
                }}
                onPrevious={onPrevious}
              />
            )
          },
          {
            id: 3,
            title: getString('mapApplications'),
            component: (
              <MapApplications
                stepData={{
                  sourceName: currentData?.name,
                  connectorIdentifier: currentData?.connectorRef?.value,
                  productName: currentData?.product,
                  applications: currentData?.applications,
                  metricPacks: currentData?.metricPacks
                }}
                onCompleteStep={stepData => {
                  setCurrentData({ ...currentData, ...stepData })
                  onNext({ data: { ...currentData, ...stepData } })
                }}
                onPrevious={onPrevious}
              />
            )
          },
          {
            id: 4,
            title: getString('review'),
            component: (
              <ReviewTiersAndApps
                stepData={currentData}
                onCompleteStep={stepData => {
                  setCurrentData({ ...currentData, ...stepData })
                  onNext({ data: { ...currentData, ...stepData } })
                }}
                onPrevious={onPrevious}
              />
            )
          }
        ]}
      />
    </Page.Body>
  )
}

export default AppDMonitoringSource
