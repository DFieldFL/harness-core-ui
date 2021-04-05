import React from 'react'
import { IconName, Text, Icon, Layout } from '@wings-software/uicore'
import type { CellProps, Renderer, Column } from 'react-table'
import type { GitSyncEntityListDTO, GitSyncEntityDTO } from 'services/cd-ng'

export enum Products {
  CD = 'CD',
  CI = 'CI',
  CORE = 'CORE'
}

export interface Entity {
  [key: string]: GitSyncEntityDTO['entityType']
}

export const Entities: Entity = {
  APPROVAL_STAGE: 'ApprovalStage',
  CONNECTORS: 'Connectors',
  CV_CONFIG: 'CvConfig',
  CV_JOB: 'CvVerificationJob',
  CV_K8_ACTIVITY_SOURCE: 'CvKubernetesActivitySource',
  DELEGATES: 'Delegates',
  DELEGATE_CONFIGURATIONS: 'DelegateConfigurations',
  DEPLOYMENT_STAGE: 'DeploymentStage',
  DEPLOYMENT_STEPS: 'DeploymentSteps',
  ENVIRONMENT: 'Environment',
  INPUT_SETS: 'InputSets',
  INTEGRATION_STAGE: 'IntegrationStage',
  INTEGRATION_STEPS: 'IntegrationSteps',
  PIPELINES: 'Pipelines',
  PIPELINES_STEPS: 'PipelineSteps',
  PROJECTS: 'Projects',
  SECRETS: 'Secrets',
  SERVICE: 'Service'
}

export const getEntityIconName = (entityType: string | undefined): IconName => {
  switch (entityType) {
    case Entities.PROJECTS:
      return 'nav-project-selected'
    case Entities.PIPELINES:
      return 'pipeline-ng'
    case Entities.CONNECTORS:
      return 'resources-icon'
    case Entities.SECRETS:
      return 'secret-manager'
    default:
      return 'placeholder'
  }
}

export const RenderEntity: Renderer<CellProps<GitSyncEntityDTO>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal>
      <Icon inline name={getEntityIconName(data.entityType)}></Icon>
      <Text padding={{ left: 'small' }} inline font={{ weight: 'bold' }} lineClamp={1}>
        {data.entityName}
      </Text>
    </Layout.Horizontal>
  )
}

export const RenderYamlPath: Renderer<CellProps<GitSyncEntityDTO>> = ({ row }) => {
  const data = row.original

  return (
    <>
      <Text inline lineClamp={1}>
        {data.entityGitPath}
      </Text>
    </>
  )
}

export const getEntityHeaderText = (data: GitSyncEntityListDTO): string => {
  return `${data.entityType?.toUpperCase()} ( ${data.count} )`
}

export const getTableColumns = (): Column<GitSyncEntityDTO>[] => {
  return [
    {
      Header: 'NAME',
      accessor: 'entityName',
      width: '25%',
      Cell: RenderEntity,
      disableSortBy: false
    },
    {
      Header: 'PATH',
      accessor: 'entityGitPath',
      width: '75%',
      Cell: RenderYamlPath,
      disableSortBy: false
    }
  ]
}
