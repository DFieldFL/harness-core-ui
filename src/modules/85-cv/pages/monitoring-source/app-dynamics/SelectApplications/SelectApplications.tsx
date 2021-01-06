import React, { useState, useMemo } from 'react'
import { Container, Color, Text, Icon, SelectOption } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import cloneDeep from 'lodash-es/cloneDeep'
import type { CellProps } from 'react-table'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/exports'
import { useGetAppDynamicsApplications, AppDynamicsApplication } from 'services/cv'
import {
  useGetEnvironmentListForProject,
  ResponsePageEnvironmentResponseDTO,
  GetEnvironmentListForProjectQueryParams
} from 'services/cd-ng'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import { TableColumnWithFilter } from '@cv/components/TableColumnWithFilter/TableColumnWithFilter'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { EnvironmentSelect } from './EnvironmentSelect'
import { InternalState, useValidationErrors } from '../AppDOnboardingUtils'
import { InfoPanel, InfoPanelItem } from '../InfoPanel/InfoPanel'
import styles from './SelectApplications.module.scss'

interface SelectApplicationsProps {
  stepData?: { [key: string]: any }
  onCompleteStep: (data: object) => void
  onPrevious?: () => void
}

interface EnvironmentCellProps {
  value?: string
  disabled?: boolean
  onSelect(value: string): void
  options: SelectOption[]
  onUpdateOptions(options: SelectOption[]): void
}

const PAGE_SIZE = 5

export default function SelectApplications({ stepData, onCompleteStep, onPrevious }: SelectApplicationsProps) {
  const { getString } = useStrings()
  const [state, setState] = useState<InternalState>(cloneDeep(stepData?.applications || {}))
  const [environmentOptions, setEnvironmentOptions] = useState<Array<SelectOption>>([])
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()
  const [pageIndex, setPageIndex] = useState(0)
  const [textFilter, setTextFilter] = useState('')
  const { setError, renderError } = useValidationErrors()

  const { data, loading } = useGetAppDynamicsApplications({
    queryParams: {
      accountId,
      connectorIdentifier: stepData?.connectorIdentifier,
      orgIdentifier: orgIdentifier as string,
      projectIdentifier: projectIdentifier as string,
      offset: pageIndex,
      pageSize: PAGE_SIZE,
      filter: textFilter
    }
  })

  useGetEnvironmentListForProject({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier,
      projectIdentifier
    } as GetEnvironmentListForProjectQueryParams,
    resolve: (res: ResponsePageEnvironmentResponseDTO) => {
      if (res?.data?.content?.length) {
        setEnvironmentOptions(
          res?.data?.content?.map(env => ({
            label: env.name as string,
            value: env.identifier as string
          }))
        )
      }
      return res
    }
  })

  const onNext = () => {
    const apps = Object.values(state).filter(app => !!app)
    if (!apps.length) {
      setError('selectApp', getString('cv.monitoringSources.appD.validations.selectApp'))
      return
    }
    for (const app of apps) {
      if (!app?.environment) {
        setError('selectApp', getString('cv.monitoringSources.appD.validations.selectApp'))
        return
      }
    }
    onCompleteStep({ applications: state })
  }

  return (
    <Container className={styles.main}>
      <Container className={styles.sideSpace} />
      <Container className={styles.mainPanel}>
        {loading && <PageSpinner />}
        <Table<AppDynamicsApplication>
          className={styles.table}
          columns={[
            {
              id: '1',
              Header: '',
              disableSortBy: true,
              width: '40px',
              Cell: function SelectAppCell({ row }: CellProps<AppDynamicsApplication>) {
                const appName = row.original.name!
                const isSelected = !!state[appName]
                return (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={e => {
                      const update = {
                        ...state,
                        [appName]: {
                          name: appName
                        }
                      }
                      if (!e.target.checked) {
                        delete update[appName]
                      }
                      setState(update)
                    }}
                  />
                )
              }
            },
            {
              id: '2',
              Header: (
                <Text font={{ size: 'small', weight: 'bold' }} color={Color.BLACK}>
                  {getString('cv.monitoringSources.appD.appDApplications')}
                </Text>
              ),
              disableSortBy: true,
              width: '45%',
              accessor: 'name',
              Cell: function AppName({ value }: CellProps<AppDynamicsApplication>) {
                return <Text icon="service-appdynamics">{value}</Text>
              }
            },
            {
              id: '3',
              Header: (
                <TableColumnWithFilter
                  className={styles.columnHeaderWithFilter}
                  onFilter={val => {
                    setPageIndex(0)
                    setTextFilter(val)
                  }}
                  columnName={getString('cv.monitoringSources.appD.harnessEnv')}
                />
              ),
              disableSortBy: true,
              width: '45%',
              Cell: function EnvironmentCellWrapper({ row }: CellProps<AppDynamicsApplication>) {
                const appName = row.original.name!
                const app = state[appName]
                return (
                  <EnvironmentCell
                    disabled={!app}
                    value={app?.environment}
                    onSelect={(environment: string) => {
                      setState({
                        ...state,
                        [appName]: {
                          ...app!,
                          environment
                        }
                      })
                    }}
                    options={environmentOptions}
                    onUpdateOptions={setEnvironmentOptions}
                  />
                )
              }
            }
          ]}
          data={data?.resource?.content ?? []}
          pagination={{
            itemCount: data?.resource?.totalItems || 0,
            pageSize: data?.resource?.pageSize || PAGE_SIZE,
            pageCount: data?.resource?.totalPages || 0,
            pageIndex: data?.resource?.pageIndex || 0,
            gotoPage: (page: number) => setPageIndex(page)
          }}
        />
        {!loading && !data?.resource?.content?.length && (
          <Container height={250}>
            <NoDataCard message={getString('cv.monitoringSources.appD.noAppsMsg')} icon="warning-sign" />
          </Container>
        )}
        {renderError('selectApp')}
        <SubmitAndPreviousButtons onPreviousClick={onPrevious} onNextClick={onNext} />
      </Container>
      <InfoPanel>
        <InfoPanelItem
          label={getString('cv.monitoringSources.appD.infoPanel.mapDashboards')}
          text={getString('cv.monitoringSources.appD.infoPanel.mapDashboardsMsg')}
        />
      </InfoPanel>
    </Container>
  )
}

function EnvironmentCell({ value, disabled, onSelect, options = [], onUpdateOptions }: EnvironmentCellProps) {
  const item = useMemo(() => options?.find((opt: SelectOption) => opt.value === value), [options, value])
  return (
    <Container className={styles.selectEnvironmentCell}>
      <Icon name="harness" margin={{ right: 'small' }} />
      <EnvironmentSelect
        item={item}
        disabled={disabled}
        options={options}
        onSelect={opt => {
          onSelect(opt.value as string)
        }}
        onNewCreated={env => {
          onUpdateOptions?.([{ label: env.name!, value: env.name! }, ...options])
          onSelect(env.name as string)
        }}
      />
    </Container>
  )
}
