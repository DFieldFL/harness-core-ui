import React, { useEffect, useState } from 'react'
import { Button, Color, Container, Icon, Layout, Popover, Text, AvatarGroup } from '@wings-software/uicore'
import { Link, useHistory, useParams } from 'react-router-dom'
import { Classes, Position } from '@blueprintjs/core'
import { Page } from '@common/exports'
import routes from '@common/RouteDefinitions'
import { Project, useGetProjectAggregateDTO } from 'services/cd-ng'
import { ModuleName, useAppStore, useStrings } from 'framework/exports'
import ModuleListCard from '@projects-orgs/components/ModuleListCard/ModuleListCard'
import ModuleEnableCard from '@projects-orgs/components/ModuleEnableCard/ModuleEnableCard'
import { getEnableModules } from '@projects-orgs/utils/utils'
import { useProjectModal } from '@projects-orgs/modals/ProjectModal/useProjectModal'
import { useCollaboratorModal } from '@projects-orgs/modals/ProjectModal/useCollaboratorModal'
import ContextMenu from '@projects-orgs/components/Menu/ContextMenu'
import TagsRenderer from '@common/components/TagsRenderer/TagsRenderer'
import { PageSpinner } from '@common/components'
import { PageError } from '@common/components/Page/PageError'
import i18n from './ProjectDetails.i18n'
import useDeleteProjectDialog from '../../DeleteProject'
import css from './ProjectDetails.module.scss'

const ProjectDetails: React.FC = () => {
  const { accountId, projectIdentifier, orgIdentifier } = useParams()
  const { getString } = useStrings()
  const [menuOpen, setMenuOpen] = useState(false)
  const { updateAppStore } = useAppStore()
  const { data, loading, error, refetch } = useGetProjectAggregateDTO({
    identifier: projectIdentifier,
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier
    }
  })

  const projectData = data?.data?.projectResponse.project
  const refetchProject = (): void => {
    refetch()
  }

  const { openProjectModal } = useProjectModal({
    onSuccess: refetchProject
  })

  const showEditProject = (project: Project): void => {
    openProjectModal(project)
  }

  const { openCollaboratorModal } = useCollaboratorModal()

  const showCollaborators = (project: Project): void => {
    openCollaboratorModal({ projectIdentifier: project.identifier, orgIdentifier: project.orgIdentifier || 'default' })
  }

  const history = useHistory()
  const onDeleted = (): void => {
    history.push(routes.toProjects({ accountId }))
  }
  const openDialog = useDeleteProjectDialog(projectData || { identifier: '', name: '' }, onDeleted)

  useEffect(() => {
    updateAppStore({ selectedProject: projectData })
  }, [projectData])

  if (loading) return <PageSpinner />
  if (error) return <PageError message={error.message} onClick={() => refetch()} />
  if (!projectData) return <></>
  return (
    <>
      <Page.Header
        size="xlarge"
        title={
          <Layout.Vertical spacing="small" padding="medium" className={css.title}>
            <Layout.Horizontal>
              <Link to={routes.toProjects({ accountId })}>
                <Text font="small" color={Color.BLUE_600}>
                  {i18n.manage}
                </Text>
              </Link>
            </Layout.Horizontal>
            <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK} lineClamp={1}>
              {projectData.name}
            </Text>
            <Text font="small" lineClamp={2}>
              {projectData.description}
            </Text>
            <Layout.Horizontal padding={{ top: 'small' }}>
              <TagsRenderer tags={projectData.tags || {}}></TagsRenderer>
            </Layout.Horizontal>
          </Layout.Vertical>
        }
        toolbar={
          <Layout.Horizontal padding="xxlarge">
            <Layout.Vertical padding={{ right: 'large' }} spacing="xsmall">
              <AvatarGroup
                className={css.projectDetailsAvatarGroup}
                avatars={data?.data?.admins?.length ? data?.data?.admins : [{}]}
                onAdd={event => {
                  event.stopPropagation()
                  showCollaborators(projectData as Project)
                }}
              />
              <Text font="xsmall" padding={{ left: 'xsmall' }}>
                {`${getString('adminLabel')} ${data?.data?.admins?.length ? `(${data?.data?.admins?.length})` : ``}`}
              </Text>
            </Layout.Vertical>
            <Layout.Vertical padding={{ right: 'large' }} spacing="xsmall">
              <AvatarGroup
                className={css.projectDetailsAvatarGroup}
                avatars={data?.data?.collaborators?.length ? data?.data?.collaborators : [{}]}
                onAdd={event => {
                  event.stopPropagation()
                  showCollaborators(projectData as Project)
                }}
              />
              <Text font="xsmall" padding={{ left: 'xsmall' }}>{`${getString('collaboratorsLabel')} ${
                data?.data?.collaborators?.length ? `(${data?.data?.collaborators?.length})` : ``
              }`}</Text>
            </Layout.Vertical>
            <Popover
              isOpen={menuOpen}
              onInteraction={nextOpenState => {
                setMenuOpen(nextOpenState)
              }}
              className={Classes.DARK}
              position={Position.BOTTOM_RIGHT}
            >
              <Button
                minimal
                icon="Options"
                iconProps={{ size: 24 }}
                onClick={e => {
                  e.stopPropagation()
                  setMenuOpen(true)
                }}
              />
              <ContextMenu
                project={projectData as Project}
                reloadProjects={refetch}
                editProject={showEditProject}
                collaborators={showCollaborators}
                setMenuOpen={setMenuOpen}
                openDialog={openDialog}
              />
            </Popover>
          </Layout.Horizontal>
        }
        className={css.header}
      />
      <Page.Body filled className={css.pageHeight}>
        <Layout.Horizontal>
          <div>
            <Container padding="xxlarge" className={css.enabledModules}>
              <Layout.Vertical padding="small" spacing="large">
                <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
                  {i18n.modulesEnabled}
                </Text>
                {projectData.modules?.length ? (
                  projectData.modules.map(module => (
                    <ModuleListCard
                      module={module as ModuleName}
                      key={module}
                      projectIdentifier={projectData.identifier}
                      orgIdentifier={projectData.orgIdentifier || ''}
                      accountId={projectData.accountIdentifier || ''}
                    />
                  ))
                ) : (
                  <Layout.Vertical padding="huge" flex={{ align: 'center-center' }} spacing="huge">
                    <Icon name="nav-project" size={70} />
                    <Text font="medium">{i18n.noModules}</Text>
                  </Layout.Vertical>
                )}
              </Layout.Vertical>
            </Container>
            <Container padding="xxlarge">
              {projectData.modules?.length === 5 ? null : (
                <>
                  <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.BLACK}>
                    {i18n.enableModules}
                  </Text>
                  <Layout.Horizontal spacing="small" padding={{ top: 'large' }}>
                    {getEnableModules(projectData.modules || []).map(module => (
                      <ModuleEnableCard
                        key={module}
                        data={projectData as Project}
                        module={module as ModuleName}
                        refetchProject={refetchProject}
                      />
                    ))}
                  </Layout.Horizontal>
                </>
              )}
            </Container>
          </div>
          {/* TODO: ENABLE THIS WHEN WE HAVE INFO */}
          {/* <Layout.Vertical padding="huge" spacing="large">
            <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
              {i18n.recentActivities}
            </Text>
            <Card className={css.activityCard}>
              <ActivityStack
                items={[]}
                tooltip={item => (
                  <Layout.Vertical padding="medium">
                    <Text>{item.activity}</Text>
                    <Text>{item.updatedBy}</Text>
                  </Layout.Vertical>
                )}
              />
            </Card>
          </Layout.Vertical>*/}
        </Layout.Horizontal>
      </Page.Body>
    </>
  )
}

export default ProjectDetails
