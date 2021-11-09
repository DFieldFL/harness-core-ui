import React, { useCallback, useEffect, useState } from 'react'
import type { FormikContext, FormikProps } from 'formik'
import type { HealthSource } from 'services/cv'
import { useDrawer } from '@cv/hooks/useDrawerHook/useDrawerHook'
import HealthSourceTable from '@cv/pages/health-source/HealthSourceTable/HealthSourceTable'
import { createHealthsourceList } from '@cv/pages/health-source/HealthSourceTable/HealthSourceTable.utils'
import HealthSourceDrawerHeader from '@cv/pages/health-source/HealthSourceDrawer/component/HealthSourceDrawerHeader/HealthSourceDrawerHeader'
import HealthSourceDrawerContent from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent'
import type {
  RowData,
  UpdatedHealthSource
} from '@cv/pages/health-source/HealthSourceDrawer/HealthSourceDrawerContent.types'

import type { MonitoredServiceForm } from '../../Service.types'
import { createOpenHealthSourceTableProps } from './HealthSourceTableContainer.utils'

export default function HealthSourceTableContainer({
  serviceFormFormik
}: {
  serviceFormFormik: FormikContext<MonitoredServiceForm>
}): JSX.Element {
  const {
    showDrawer: showHealthSourceDrawer,
    hideDrawer: hideHealthSourceDrawer,
    setDrawerHeaderProps
  } = useDrawer({
    createHeader: props => <HealthSourceDrawerHeader {...props} />,
    createDrawerContent: props => <HealthSourceDrawerContent {...props} />
  })

  const [editModeData, setEditModeData] = useState<HealthSource | null>()

  useEffect(() => {
    if (editModeData) {
      openHealthSourceDrawer({
        formik: serviceFormFormik,
        isEditMode: true,
        rowData: editModeData,
        tableData:
          createHealthsourceList(serviceFormFormik?.values?.sources?.healthSources as RowData[], editModeData) || []
      })
    }
  }, [editModeData])

  const updateHealthSource = useCallback(
    (data: any, formik: FormikContext<MonitoredServiceForm>): void => {
      formik.setFieldValue('sources', {
        ...formik.values?.sources,
        healthSources: data
      })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [serviceFormFormik]
  )

  const onSuccessHealthSourceTableWrapper = (
    data: UpdatedHealthSource,
    formik: FormikContext<MonitoredServiceForm>
  ): void => {
    const healthsourceList = createHealthsourceList(formik?.values?.sources?.healthSources as RowData[], data)
    updateHealthSource(healthsourceList, formik)
    hideHealthSourceDrawer()
  }

  const openHealthSourceDrawer = useCallback(
    async ({
      formik,
      isEditMode,
      rowData,
      tableData
    }: {
      formik: FormikProps<MonitoredServiceForm>
      isEditMode: boolean
      rowData: RowData | null
      tableData: HealthSource[]
    }) => {
      if (formik?.values.environmentRef && formik?.values.serviceRef && formik?.values.name) {
        const showHealthSourceDrawerProps = createOpenHealthSourceTableProps({
          formik,
          tableData,
          isEdit: isEditMode,
          rowData
        })
        setDrawerHeaderProps?.({ isEdit: isEditMode, onClick: () => hideHealthSourceDrawer() })
        showHealthSourceDrawer({
          hideDrawer: hideHealthSourceDrawer,
          ...showHealthSourceDrawerProps,
          onSuccess: (updatedHealthSource: UpdatedHealthSource) =>
            onSuccessHealthSourceTableWrapper(updatedHealthSource, formik)
        })
      } else {
        formik.submitForm()
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [serviceFormFormik]
  )

  return (
    <HealthSourceTable
      onEdit={values => setEditModeData(values)}
      onAddNewHealthSource={() =>
        openHealthSourceDrawer({
          formik: serviceFormFormik,
          isEditMode: false,
          rowData: null,
          tableData: serviceFormFormik?.values?.sources?.healthSources || []
        })
      }
      value={serviceFormFormik?.values?.sources?.healthSources || []}
      onSuccess={value => updateHealthSource(value, serviceFormFormik)}
    />
  )
}
