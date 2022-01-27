/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { useParams, Link, useHistory } from 'react-router-dom'
import {
  Container,
  Layout,
  Text,
  Color,
  FontVariation,
  ButtonVariation,
  useConfirmationDialog,
  Views
} from '@wings-software/uicore'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { useStrings } from 'framework/strings'
import { useQueryParams } from '@common/hooks'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { usePermission } from '@rbac/hooks/usePermission'
import RbacButton from '@rbac/components/Button/Button'
import ToggleOnOff from '@cv/pages/monitored-service/CVMonitoredService/components/ToggleOnOff/ToggleOnOff'
import { getCVMonitoringServicesSearchParam } from '@cv/utils/CommonUtils'
import { MonitoredServiceEnum } from '@cv/pages/monitored-service/MonitoredServicePage.constants'
import IconGrid from '@cv/pages/monitored-service/CVMonitoredService/components/IconGrid/IconGrid'
import {
  ServiceDeleteContext,
  ServiceHealthTrend,
  RiskTagWithLabel
} from '@cv/pages/monitored-service/CVMonitoredService/CVMonitoredService.utils'
import type {
  SummaryCardContentProps,
  ServiceActionsProps
} from '../MonitoredServiceGraphView/ServiceDependencyGraph.types'
import { GraphServiceChanges } from './GraphSummaryCard.utils'
import SLOsIconGrid from '../SLOsIconGrid/SLOsIconGrid'
import css from '../MonitoredServiceGraphView/ServiceDependencyGraph.module.scss'

const ServiceActions: React.FC<ServiceActionsProps> = ({
  monitoredService,
  onToggleService,
  onDeleteService,
  onEditService
}) => {
  const { getString } = useStrings()
  const { projectIdentifier } = useParams<ProjectPathProps>()

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

  const { openDialog: confirmServiceDelete } = useConfirmationDialog({
    titleText: getString('common.delete', { name: monitoredService.serviceName }),
    contentText: <ServiceDeleteContext serviceName={monitoredService.serviceName} />,
    confirmButtonText: getString('yes'),
    cancelButtonText: getString('cancel'),
    onCloseDialog: function (shouldDelete: boolean) {
      if (shouldDelete) {
        onDeleteService(monitoredService.identifier as string)
      }
    }
  })

  return (
    <Container flex>
      <RbacButton
        icon="Edit"
        iconProps={{ color: Color.GREY_0, size: 14 }}
        variation={ButtonVariation.ICON}
        onClick={onEditService}
        permission={{
          permission: PermissionIdentifier.EDIT_MONITORED_SERVICE,
          resource: {
            resourceType: ResourceType.MONITOREDSERVICE,
            resourceIdentifier: projectIdentifier
          }
        }}
      />
      <RbacButton
        icon="trash"
        iconProps={{ color: Color.GREY_0, size: 14 }}
        variation={ButtonVariation.ICON}
        margin={{ right: 'small' }}
        onClick={confirmServiceDelete}
        permission={{
          permission: PermissionIdentifier.DELETE_MONITORED_SERVICE,
          resource: {
            resourceType: ResourceType.MONITOREDSERVICE,
            resourceIdentifier: projectIdentifier
          }
        }}
      />
      <ToggleOnOff
        disabled={!canToggle}
        checked={!!monitoredService.healthMonitoringEnabled}
        onChange={checked => {
          onToggleService(monitoredService.identifier as string, checked)
        }}
      />
    </Container>
  )
}

const SummaryCardContent: React.FC<SummaryCardContentProps> = ({ isPageView, monitoredService, ...rest }) => {
  const history = useHistory()
  const { getString } = useStrings()
  const { view } = useQueryParams<{ view?: Views.GRID }>()

  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()

  const pathname = routes.toCVAddMonitoringServicesEdit({
    accountId,
    orgIdentifier,
    projectIdentifier,
    identifier: monitoredService.identifier,
    module: 'cv'
  })

  const getSearchParams = (tab: MonitoredServiceEnum): string => {
    return getCVMonitoringServicesSearchParam({ view: isPageView ? Views.GRID : view, tab })
  }

  const onEditService = (): void => {
    history.replace({
      pathname,
      search: getSearchParams(MonitoredServiceEnum.Configurations)
    })
  }

  return (
    <>
      <Container flex>
        <Container>
          <Link to={pathname + getSearchParams(MonitoredServiceEnum.ServiceHealth)}>
            <Text color={Color.PRIMARY_7} font={{ variation: FontVariation.H6 }} className={css.serviceName}>
              {monitoredService.serviceName}
            </Text>
          </Link>
          <Text color={Color.GREY_0} font={{ variation: FontVariation.SMALL }}>
            {monitoredService.environmentName}
          </Text>
        </Container>
        <ServiceActions monitoredService={monitoredService} {...rest} onEditService={onEditService} />
      </Container>

      <Container
        border={{ top: true, bottom: true, color: Color.GREY_400 }}
        padding={{ top: 'medium', bottom: 'medium' }}
        margin={{ top: 'medium', bottom: 'medium' }}
      >
        <Text
          color={Color.GREY_0}
          font={{ variation: FontVariation.TINY_SEMI }}
          padding={{ bottom: 'medium' }}
          className={css.serviceChanges}
        >
          {getString('cv.Dependency.serviceChanges')}
        </Text>
        <GraphServiceChanges changeSummary={monitoredService.changeSummary} />
      </Container>

      <Layout.Vertical spacing="large">
        <Text color={Color.GREY_0} font={{ variation: FontVariation.TINY_SEMI }} className={css.serviceHealth}>
          {getString('cv.monitoredServices.monitoredServiceTabs.serviceHealth')}
        </Text>
        <Container padding={{ top: 'small', bottom: 'large' }}>
          <ServiceHealthTrend healthScores={monitoredService.historicalTrend?.healthScores} />
        </Container>

        {monitoredService.healthMonitoringEnabled && (
          <RiskTagWithLabel
            isDarkBackground
            color={Color.GREY_0}
            labelVariation={FontVariation.SMALL}
            riskData={monitoredService.currentHealthScore}
          />
        )}

        <Text color={Color.GREY_0} font={{ variation: FontVariation.TINY_SEMI }} padding={{ bottom: 'small' }}>
          {getString('cv.dependenciesHealthWithCount', { count: monitoredService.dependentHealthScore?.length ?? 0 })}
        </Text>
        <IconGrid
          isDarkBackground
          iconProps={{ name: 'polygon', size: 14 }}
          items={monitoredService.dependentHealthScore}
        />
        <Text color={Color.GREY_0} font={{ variation: FontVariation.TINY_SEMI }} padding={{ bottom: 'small' }}>
          {`${getString('cv.slos.title')} (${monitoredService?.sloHealthIndicators?.length ?? 0})`}
        </Text>
        <SLOsIconGrid
          isDarkBackground
          iconProps={{ name: 'symbol-square', size: 14 }}
          items={monitoredService?.sloHealthIndicators}
        />
      </Layout.Vertical>
    </>
  )
}

export default SummaryCardContent
