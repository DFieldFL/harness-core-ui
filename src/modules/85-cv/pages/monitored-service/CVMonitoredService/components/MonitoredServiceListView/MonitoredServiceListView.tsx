import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import type { CellProps, Renderer } from 'react-table'
import {
  Container,
  Text,
  Color,
  FontVariation,
  Layout,
  TableV2,
  NoDataCard,
  Heading,
  ButtonVariation
} from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import { PermissionIdentifier, ResourceType } from 'microfrontends'
import type { MonitoredServiceListItemDTO } from 'services/cv'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { usePermission } from '@rbac/hooks/usePermission'
import RbacButton from '@rbac/components/Button/Button'
import ToggleOnOff from '@cv/pages/monitored-service/CVMonitoredService/components/ToggleOnOff/ToggleOnOff'
import noServiceAvailableImage from '@cv/assets/noServiceAvailable.png'
import FilterCard from '@cv/components/FilterCard/FilterCard'
import ContextMenuActions from '@cv/components/ContextMenuActions/ContextMenuActions'
import IconGrid from '../IconGrid/IconGrid'
import {
  calculateChangePercentage,
  RenderHealthTrend,
  RenderHealthScore,
  ServiceDeleteContext,
  getMonitoredServiceFilterOptions
} from '../../CVMonitoredService.utils'
import type { MonitoredServiceListViewProps } from '../../CVMonitoredService.types'
import MonitoredServiceCategory from '../../../components/Configurations/components/Dependency/component/components/MonitoredServiceCategory/MonitoredServiceCategory'
import { getListTitle } from './MonitoredServiceListView.utils'
import css from '../../CVMonitoredService.module.scss'

const CategoryProps: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => (
  <MonitoredServiceCategory type={row.original.type} abbrText verticalAlign />
)

const RenderServiceName: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const monitoredService = row.original

  const history = useHistory()

  return (
    <Layout.Vertical>
      <RbacButton
        variation={ButtonVariation.LINK}
        className={css.linkButton}
        permission={{
          permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
          resource: {
            resourceType: ResourceType.MONITOREDSERVICE,
            resourceIdentifier: projectIdentifier
          }
        }}
        onClick={() =>
          history.push({
            pathname: routes.toCVAddMonitoringServicesEdit({
              accountId,
              orgIdentifier,
              projectIdentifier,
              identifier: monitoredService.identifier,
              module: 'cv'
            })
          })
        }
      >
        <Text color={Color.PRIMARY_7} font={{ align: 'left', size: 'normal', weight: 'semi-bold' }}>
          {monitoredService.serviceName}
        </Text>
      </RbacButton>
      <RbacButton
        variation={ButtonVariation.LINK}
        className={css.linkButton}
        permission={{
          permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
          resource: {
            resourceType: ResourceType.MONITOREDSERVICE,
            resourceIdentifier: projectIdentifier
          }
        }}
        onClick={() =>
          history.push({
            pathname: routes.toCVAddMonitoringServicesEdit({
              accountId,
              projectIdentifier,
              orgIdentifier,
              identifier: monitoredService.identifier,
              module: 'cv'
            })
          })
        }
      >
        <Text color={Color.PRIMARY_7} font={{ align: 'left', size: 'xsmall' }}>
          {monitoredService.environmentName}
        </Text>
      </RbacButton>
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
        iconProps={{ size: 20, color: Color.GREY_700 }}
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

const RenderDependenciesHealth: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
  const monitoredService = row.original

  if (monitoredService.dependentHealthScore?.length) {
    return (
      <IconGrid
        iconProps={{ name: 'polygon', size: 14, padding: { right: 'xsmall' } }}
        items={monitoredService.dependentHealthScore}
        width={100}
      />
    )
  }

  return null
}

const MonitoredServiceListView: React.FC<MonitoredServiceListViewProps> = ({
  serviceCountData,
  monitoredServiceListData,
  selectedFilter,
  onFilter,
  onEditService,
  onDeleteService,
  onToggleService,
  healthMonitoringFlagLoading,
  refetchServiceCountData,
  setPage
}) => {
  const { getString } = useStrings()

  const { projectIdentifier } = useParams<ProjectPathProps>()

  const { content, pageSize = 0, pageIndex = 0, totalPages = 0, totalItems = 0 } = monitoredServiceListData || {}

  const RenderStatusToggle: Renderer<CellProps<MonitoredServiceListItemDTO>> = ({ row }) => {
    const monitoredService = row.original

    const [canToggle] = usePermission(
      {
        resource: {
          resourceType: ResourceType.MONITOREDSERVICE,
          resourceIdentifier: projectIdentifier
        },
        permissions: [PermissionIdentifier.TOGGLE_MONITORED_SERVICE]
      },
      [projectIdentifier]
    )

    return (
      <Layout.Horizontal flex={{ alignItems: 'center' }}>
        <ToggleOnOff
          disabled={!canToggle}
          checked={Boolean(monitoredService.healthMonitoringEnabled)}
          loading={healthMonitoringFlagLoading}
          onChange={checked => {
            onToggleService(monitoredService.identifier as string, checked)
          }}
        />
        <ContextMenuActions
          titleText={getString('common.delete', { name: monitoredService.serviceName })}
          contentText={<ServiceDeleteContext serviceName={monitoredService.serviceName} />}
          confirmButtonText={getString('yes')}
          deleteLabel={getString('cv.monitoredServices.deleteService')}
          onDelete={() => {
            onDeleteService(monitoredService.identifier as string)
          }}
          editLabel={getString('cv.monitoredServices.editService')}
          onEdit={() => {
            onEditService(monitoredService.identifier as string)
          }}
          RbacPermissions={{
            edit: {
              permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
              resource: {
                resourceType: ResourceType.MONITOREDSERVICE,
                resourceIdentifier: projectIdentifier
              }
            },
            delete: {
              permission: PermissionIdentifier.DELETE_MONITORED_SERVICE,
              resource: {
                resourceType: ResourceType.MONITOREDSERVICE,
                resourceIdentifier: projectIdentifier
              }
            }
          }}
        />
      </Layout.Horizontal>
    )
  }

  const filterOptions = getMonitoredServiceFilterOptions(getString, serviceCountData)

  return (
    <Container padding={{ top: 'medium', left: 'xlarge', right: 'xlarge' }} height="inherit">
      <FilterCard
        data={filterOptions}
        cardClassName={css.filterCard}
        selected={filterOptions.find(card => card.type === selectedFilter)}
        onChange={item => onFilter(item.type)}
      />
      {content?.length ? (
        <>
          <Heading
            level={2}
            font={{ variation: FontVariation.H6 }}
            color={Color.GREY_800}
            padding={{ top: 'large', bottom: 'large' }}
          >
            {getListTitle(getString, selectedFilter, totalItems)}
          </Heading>
          <TableV2
            sortable={true}
            columns={[
              {
                Header: ' ',
                width: '2.5%',
                Cell: CategoryProps
              },
              {
                Header: getString('name'),
                width: '14.5%',
                Cell: RenderServiceName
              },
              {
                Header: getString('cv.monitoredServices.table.changes'),
                width: '18%',
                Cell: RenderServiceChanges
              },
              {
                Header: getString('cv.monitoredServices.table.lastestHealthTrend'),
                width: '20%',
                Cell: RenderHealthTrend
              },
              {
                Header: getString('cv.monitoredServices.table.serviceHealthScore'),
                width: '18%',
                Cell: RenderHealthScore
              },
              {
                Header: getString('cv.monitoredServices.dependenciesHealth'),
                width: '18%',
                Cell: RenderDependenciesHealth
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
              gotoPage: nextPage => {
                setPage(nextPage)
                refetchServiceCountData()
              }
            }}
          />
        </>
      ) : (
        <NoDataCard
          image={noServiceAvailableImage}
          message={getString('cv.monitoredServices.youHaveNoMonitoredServices')}
          imageClassName={css.noServiceAvailableImage}
          containerClassName={css.noDataContainer}
        />
      )}
    </Container>
  )
}

export default MonitoredServiceListView
