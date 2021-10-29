import React, { useCallback, useMemo, useState } from 'react'
import { useStrings } from 'framework/strings'
import { SetupSourceTabs } from '@cv/components/CVSetupSourcesView/SetupSourceTabs/SetupSourceTabs'
import DefineHealthSource from './component/defineHealthSource/DefineHealthSource'
import CustomiseHealthSource from './component/customiseHealthSource/CustomiseHealthSource'
import { createHealthSourceDrawerFormData } from './HealthSourceDrawerContent.utils'
import type { HealthSourceDrawerInterface } from './HealthSourceDrawerContent.types'
import { GCOProduct } from '../connectors/GCOLogsMonitoringSource/GoogleCloudOperationsMonitoringSourceUtils'
import { SelectGCODashboards } from '../connectors/GCOMetricsHealthSource/components/SelectGCODashboards/SelectGCODashboards'
import { getSelectedFeature } from './component/defineHealthSource/DefineHealthSource.utils'

function HealthSourceDrawerContent({
  serviceRef,
  environmentRef,
  monitoredServiceRef,
  onSuccess,
  isEdit,
  rowData,
  tableData,
  shouldRenderAtVerifyStep,
  changeSources
}: HealthSourceDrawerInterface): JSX.Element {
  const { getString } = useStrings()

  const sourceData = useMemo(
    () =>
      createHealthSourceDrawerFormData({
        isEdit,
        monitoredServiceRef,
        serviceRef,
        environmentRef,
        tableData,
        rowData,
        changeSources
      }),
    [rowData, tableData, monitoredServiceRef, serviceRef, environmentRef, isEdit, changeSources]
  )

  const [selectedProduct, setSelectedProduct] = useState<string | undefined>(getSelectedFeature(sourceData)?.value)
  const [tabTitles, ...tabs] = useMemo(() => {
    if (selectedProduct === GCOProduct.CLOUD_METRICS) {
      return [
        [
          getString('cv.healthSource.defineHealthSource'),
          getString('cv.healthSource.connectors.gco.selectDashboardTab'),
          getString('cv.healthSource.customizeHealthSource')
        ],
        <DefineHealthSource
          key="defineHealthSource"
          onSubmit={values => {
            setSelectedProduct(values.product?.value)
          }}
        />,
        <SelectGCODashboards key="selectGCODashboards" />,
        <CustomiseHealthSource
          key="customiseHealthSource"
          onSuccess={onSuccess}
          shouldRenderAtVerifyStep={shouldRenderAtVerifyStep}
        />
      ]
    }
    return [
      [getString('cv.healthSource.defineHealthSource'), getString('cv.healthSource.customizeHealthSource')],
      <DefineHealthSource key="defineHealthSource" onSubmit={values => setSelectedProduct(values.product?.value)} />,
      <CustomiseHealthSource
        key="customiseHealthSource"
        onSuccess={onSuccess}
        shouldRenderAtVerifyStep={shouldRenderAtVerifyStep}
      />
    ]
  }, [selectedProduct])

  const determineMaxTabBySourceType = useCallback(() => {
    switch (selectedProduct) {
      case GCOProduct.CLOUD_METRICS:
        return 2
      default:
        return 1
    }
  }, [selectedProduct])

  return (
    <>
      <SetupSourceTabs
        data={sourceData}
        determineMaxTab={isEdit ? determineMaxTabBySourceType : undefined}
        tabTitles={tabTitles}
      >
        {tabs}
      </SetupSourceTabs>
    </>
  )
}

export default HealthSourceDrawerContent
