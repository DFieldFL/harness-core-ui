import React from 'react'
import { useParams, Link } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import { Container, Text, Color, FontVariation, Layout } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { MonitoredServiceListItemDTO } from 'services/cv'
import routes from '@common/RouteDefinitions'
import { Table } from '@common/components'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import FilterCard from '@cv/components/FilterCard/FilterCard'
import ContextMenuActions from '@cv/components/ContextMenuActions/ContextMenuActions'
import {
  calculateChangePercentage,
  RenderHealthTrend,
  RenderHealthScore,
  ServiceDeleteContext,
  getMonitoredServiceFilterOptions
} from '../../CVMonitoredService.utils'
import ToggleMonitoring from '../../../components/toggleMonitoring/ToggleMonitoring'
import type { MonitoredServiceListViewProps } from '../../CVMonitoredService.types'
import MonitoredServiceCategory from '../../../components/Configurations/components/Dependency/component/components/MonitoredServiceCategory/MonitoredServiceCategory'
import css from '../../CVMonitoredService.module.scss'

const CategoryProps: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => (
  <MonitoredServiceCategory type={row.original.type} abbrText verticalAlign />
)

const RenderServiceName: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const monitoredService = row.original

  return (
    <Layout.Vertical>
      <Link
        to={routes.toCVAddMonitoringServicesEdit({
          accountId,
          orgIdentifier,
          projectIdentifier,
          identifier: monitoredService.identifier,
          module: 'cv'
        })}
      >
        <Text color={Color.PRIMARY_7} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
          {monitoredService.serviceName}
        </Text>
      </Link>
      <Link
        to={routes.toCVAddMonitoringServicesEdit({
          accountId,
          projectIdentifier,
          orgIdentifier,
          identifier: monitoredService.identifier,
          module: 'cv'
        })}
      >
        <Text color={Color.PRIMARY_7} font={{ align: 'left', size: 'xsmall' }}>
          {monitoredService.environmentName}
        </Text>
      </Link>
    </Layout.Vertical>
  )
}

const RenderServiceChanges: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  const { getString } = useStrings()
  const monitoredService = row.original

  if (!monitoredService.changeSummary?.categoryCountMap) {
    return <></>
  }

  const { Deployment, Infrastructure, Alert } = monitoredService.changeSummary.categoryCountMap
  const { color, percentage } = calculateChangePercentage(monitoredService.changeSummary)
  const styles = {
    font: { variation: FontVariation.H6 },
    color: Color.BLACK
  }

  return (
    <Layout.Horizontal spacing="medium" flex={{ alignItems: 'center', justifyContent: 'flex-start' }}>
      <Text
        tooltip={getString('deploymentText')}
        icon="nav-project"
        iconProps={{ size: 16, color: Color.GREY_700 }}
        {...styles}
      >
        {Deployment.count ?? 0}
      </Text>
      <Text
        tooltip={getString('infrastructureText')}
        icon="infrastructure"
        iconProps={{ size: 26, color: Color.GREY_700 }}
        {...styles}
      >
        {Infrastructure.count ?? 0}
      </Text>
      <Text
        tooltip={getString('cv.changeSource.tooltip.incidents')}
        icon="warning-outline"
        iconProps={{ size: 16 }}
        {...styles}
      >
        {Alert.count ?? 0}
      </Text>
      <Text
        icon="symbol-triangle-up"
        color={color}
        font={{ variation: FontVariation.TINY_SEMI }}
        iconProps={{ size: 10, color: color }}
      >
        {`${percentage}%`}
      </Text>
    </Layout.Horizontal>
  )
}

const MonitoredServiceListView: React.FC<MonitoredServiceListViewProps> = ({
  monitoredServiceListData,
  refetchMonitoredServiceList,
  selectedFilter,
  setSelectedFilter,
  onEditService,
  onDeleteService,
  setHealthMonitoringFlag,
  healthMonitoringFlagLoading,
  setPage
}) => {
  const { getString } = useStrings()

  const { content, pageSize = 0, pageIndex = 0, totalPages = 0, totalItems = 0 } = monitoredServiceListData || {}

  const RenderStatusToggle: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
    const monitoredService = row.original

    return (
      <Layout.Horizontal flex={{ alignItems: 'center' }}>
        <ToggleMonitoring
          refetch={refetchMonitoredServiceList}
          identifier={monitoredService.identifier as string}
          enabled={!!monitoredService.healthMonitoringEnabled}
          setHealthMonitoringFlag={setHealthMonitoringFlag}
          loading={healthMonitoringFlagLoading}
        />
        <ContextMenuActions
          titleText={getString('common.delete', { name: monitoredService.serviceName })}
          contentText={<ServiceDeleteContext serviceName={monitoredService.serviceName} />}
          confirmButtonText={getString('yes')}
          deleteLabel={getString('cv.monitoredServices.deleteService')}
          onDelete={() => {
            onDeleteService(monitoredService.identifier)
          }}
          editLabel={getString('cv.monitoredServices.editService')}
          onEdit={() => {
            onEditService(monitoredService.identifier)
          }}
        />
      </Layout.Horizontal>
    )
  }

  return content ? (
    <Container padding={{ top: 'medium', left: 'xlarge', right: 'xlarge' }} height="inherit">
      <FilterCard
        data={getMonitoredServiceFilterOptions(getString, monitoredServiceListData)}
        cardClassName={css.filterCard}
        selected={selectedFilter ?? getMonitoredServiceFilterOptions(getString, monitoredServiceListData)[0]}
        onChange={setSelectedFilter}
      />
      <Text font={{ variation: FontVariation.H6 }} color={Color.GREY_800} padding={{ top: 'large', bottom: 'large' }}>
        {getString('cv.monitoredServices.showingAllServices', { serviceCount: content?.length })}
      </Text>
      <Table
        sortable={true}
        columns={[
          {
            Header: ' ',
            width: '2.5%',
            Cell: CategoryProps
          },
          {
            Header: getString('name'),
            width: '17.5%',
            Cell: RenderServiceName
          },
          {
            Header: getString('cv.monitoredServices.table.changes'),
            width: '25%',
            Cell: RenderServiceChanges
          },
          {
            Header: getString('cv.monitoredServices.table.lastestHealthTrend'),
            width: '25%',
            Cell: RenderHealthTrend
          },
          {
            Header: getString('cv.monitoredServices.table.serviceHealthScore'),
            width: '20%',
            Cell: RenderHealthScore
          },
          {
            Header: getString('enabledLabel'),
            width: '10%',
            Cell: RenderStatusToggle
          }
        ]}
        data={content}
        pagination={{
          pageSize,
          pageIndex,
          pageCount: totalPages,
          itemCount: totalItems,
          gotoPage: setPage
        }}
      />
    </Container>
  ) : null
}

export default MonitoredServiceListView
