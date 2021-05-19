import React from 'react'
import { Layout } from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useFeatureFlags } from '@common/hooks/useFeatureFlag'
import type { PipelineType, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { SidebarLink } from '../SideNav/SideNav'
import NavExpandable from '../NavExpandable/NavExpandable'

const ProjectSetupMenu: React.FC = () => {
  const { getString } = useStrings()
  const params = useParams<PipelineType<ProjectPathProps>>()
  const { NG_RBAC_ENABLED } = useFeatureFlags()

  return (
    <NavExpandable title={getString('common.projectSetup')} route={routes.toSetup(params)}>
      <Layout.Vertical spacing="small">
        <SidebarLink label={getString('connectorsLabel')} to={routes.toConnectors(params)} />
        <SidebarLink label={getString('common.secrets')} to={routes.toSecrets(params)} />
        {NG_RBAC_ENABLED ? (
          <SidebarLink to={routes.toAccessControl(params)} label={getString('accessControl')} />
        ) : null}
      </Layout.Vertical>
    </NavExpandable>
  )
}

export default ProjectSetupMenu
