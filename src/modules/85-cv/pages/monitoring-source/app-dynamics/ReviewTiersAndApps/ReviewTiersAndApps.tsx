import React, { useState, useEffect } from 'react'
import { Container, Text, Color, Layout } from '@wings-software/uicore'
import { useParams, useHistory } from 'react-router-dom'
import type { CellProps } from 'react-table'
import { isEmpty } from 'lodash-es'
import { Spinner } from '@blueprintjs/core'
import xhr from '@wings-software/xhr-async'
import qs from 'qs'
import Table from '@common/components/Table/Table'
import { useStrings } from 'framework/exports'
import { SubmitAndPreviousButtons } from '@cv/pages/onboarding/SubmitAndPreviousButtons/SubmitAndPreviousButtons'
import { useSaveDSConfig } from 'services/cv'
import { PageSpinner } from '@common/components/Page/PageSpinner'
import type { ProjectPathProps, AccountPathProps } from '@common/interfaces/RouteInterfaces'
import routes from '@common/RouteDefinitions'
import { ONBOARDING_ENTITIES } from '@cv/pages/admin/setup/SetupUtils'
import { getConfig } from 'services/config'
import { ApplicationRecord, InternalState, ValidationStatus } from '../AppDOnboardingUtils'

interface ReviewTiersAndAppsProps {
  [key: string]: any
  onCompleteStep: (data: object) => void
  onPrevious?: () => void
}

interface TableData {
  name?: string
  tiers?: number
  totalTiers?: number
  environment?: string
  status?: any
  validationStatus?: ValidationStatus
}

/** We need to be able to send multiple requests simultaneously.
 * Therefore, this is currently implemented as explicit API call.
 */
async function fetchTiersNumber(
  accountId: string,
  projectIdentifier: string,
  orgIdentifier: string,
  appName: string,
  connectorIdentifier: string
) {
  const url = `${getConfig('cv/api')}/appdynamics/tiers?${qs.stringify({
    accountId,
    projectIdentifier,
    orgIdentifier,
    appName,
    connectorIdentifier,
    offset: 0,
    pageSize: 1
  })}`
  const { response }: any = await xhr.get(url)
  if (response?.resource) {
    return response?.resource?.totalItems
  }
}

export default function ReviewTiersAndApps({ stepData, onPrevious, onCompleteStep }: ReviewTiersAndAppsProps) {
  const { getString } = useStrings()
  const [tableData, setTableData] = useState<TableData[]>([])
  const history = useHistory()
  const { accountId, projectIdentifier, orgIdentifier } = useParams<ProjectPathProps & AccountPathProps>()
  const { mutate: saveDSConfigs, loading } = useSaveDSConfig({})

  const updateTiersNumber = async (appName: string) => {
    const tiersNumber = await fetchTiersNumber(
      accountId,
      projectIdentifier,
      orgIdentifier,
      appName,
      stepData?.connectorRef?.value
    )
    if (Number.isInteger(tiersNumber)) {
      setTableData(old =>
        old.map(entry => {
          if (entry.name === appName) {
            return {
              ...entry,
              totalTiers: tiersNumber
            }
          } else return entry
        })
      )
    }
  }

  useEffect(() => {
    if (stepData.applications) {
      const apps = Object.values(stepData.applications) as ApplicationRecord[]
      const update = apps.map(app => {
        const ret: TableData = {}
        const tiers = Object.values(app?.tiers ?? {})
        ret.name = app.name
        ret.tiers = tiers.length
        ret.totalTiers = app.totalTiers
        ret.environment = app.environment!
        if (!Number.isInteger(app.totalTiers)) {
          updateTiersNumber(app.name)
        }
        ret.status = ''
        if (tiers.some(tier => tier.validationStatus === ValidationStatus.ERROR)) {
          ret.validationStatus = ValidationStatus.ERROR
        } else if (
          tiers.length &&
          tiers.every(
            tier =>
              tier.validationStatus === ValidationStatus.NO_DATA || tier.validationStatus === ValidationStatus.SUCCESS
          )
        ) {
          ret.validationStatus = ValidationStatus.SUCCESS
        }
        return ret
      })
      setTableData(update)
    }
  }, [])

  const onNext = async () => {
    const { identifier, name, description, tags, connectorRef, applications, product } = stepData

    // TODO - replace type with DSConfig once backend is fixed
    const payload: any = {
      connectorIdentifier: connectorRef?.value,
      type: 'APP_DYNAMICS',
      accountId,
      projectIdentifier,
      orgIdentifier,
      productName: product,
      identifier,
      monitoringSourceName: name,
      description,
      tags: Object.keys(tags || {}),
      appConfigs: Object.values(applications as InternalState)
        .filter(app => !isEmpty(app?.tiers))
        .map(app => ({
          metricPacks: app?.metricPacks,
          envIdentifier: app?.environment,
          applicationName: app?.name,
          serviceMappings: Object.values(app!.tiers!).map(tier => ({
            tierName: tier.name,
            serviceIdentifier: tier.service
          }))
        }))
    }

    await saveDSConfigs(payload, { queryParams: { accountId } })

    onCompleteStep({ ...stepData, type: 'AppDynamics', sourceType: ONBOARDING_ENTITIES.MONITORING_SOURCE })

    // TODO - this is HACK, it should not be wrapped in timeout but currently it fails
    // due to IDB issues
    setTimeout(() => {
      history.push(
        `${routes.toCVAdminSetup({
          accountId,
          projectIdentifier,
          orgIdentifier
        })}?step=2`
      )
    }, 100)
  }

  return (
    <Container>
      {loading ? <PageSpinner /> : null}
      <Table<TableData>
        columns={[
          {
            id: '1',
            Header: getString('cv.monitoringSources.appD.appDApplications'),
            accessor: 'name',
            width: '25%',
            disableSortBy: true,
            Cell: function NameCell({ value }: any) {
              return <Text icon="service-appdynamics">{value}</Text>
            }
          },
          {
            id: '2',
            Header: 'Tiers',
            accessor: 'totalTiers',
            width: '10%',
            disableSortBy: true,
            Cell: TiersCell
          },
          {
            id: '3',
            Header: getString('cv.monitoringSources.appD.mapToHarnessEnvironment'),
            accessor: 'environment',
            width: '20%',
            disableSortBy: true,
            Cell: function EnvironmentCell({ value }: CellProps<TableData>) {
              return <Text icon="harness">{value}</Text>
            }
          },
          {
            id: '4',
            Header: getString('cv.monitoringSources.appD.harnessServices'),
            width: '15%',
            disableSortBy: true,
            Cell: ServicesCell
          },
          {
            id: '5',
            Header: getString('cv.monitoringSources.appD.status'),
            accessor: 'status',
            width: '15%',
            disableSortBy: true
          },
          {
            id: '6',
            Header: getString('cv.monitoringSources.appD.validation'),
            accessor: 'validationStatus',
            width: '15%',
            disableSortBy: true,
            Cell: ValidationCell
          }
        ]}
        data={tableData}
      />
      <SubmitAndPreviousButtons onPreviousClick={onPrevious} onNextClick={onNext} />
    </Container>
  )
}

function TiersCell({ value }: CellProps<TableData>) {
  if (!Number.isInteger(value)) {
    return (
      <Container width={12}>
        <Spinner size={10} />
      </Container>
    )
  }
  return <Text>{value}</Text>
}

function ServicesCell({ row }: CellProps<TableData>) {
  const { getString } = useStrings()
  const { tiers, totalTiers } = row.original
  if (!Number.isInteger(totalTiers)) {
    return null
  }
  const value = totalTiers! > 0 ? Math.floor((tiers! * 100) / totalTiers!) : 0
  const color = value < 20 ? Color.RED_500 : value < 51 ? Color.ORANGE_500 : Color.GREEN_500
  return (
    <Layout.Horizontal>
      <Container color={color} margin={{ right: 'xsmall' }}>{`${value}%`}</Container>
      <Text>{getString('cv.monitoringSources.appD.tiersMappedToServices')}</Text>
    </Layout.Horizontal>
  )
}

function ValidationCell({ value }: CellProps<TableData>) {
  const { getString } = useStrings()
  if (value === ValidationStatus.ERROR) {
    return (
      <Text icon="warning-sign" iconProps={{ color: Color.RED_500 }}>
        {value} {getString('cv.monitoringSources.appD.errorsFound')}
      </Text>
    )
  } else if (value === ValidationStatus.SUCCESS) {
    return <Text icon="tick" iconProps={{ color: Color.GREEN_500 }} />
  }
  return null
}
