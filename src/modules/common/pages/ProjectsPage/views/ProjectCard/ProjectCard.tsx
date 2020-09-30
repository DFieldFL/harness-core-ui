import React from 'react'
import cx from 'classnames'
import { Card, Text, Tag, Layout, Icon, CardBody, Container, Color } from '@wings-software/uikit'
import { Classes } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import { ModuleName, useAppStoreWriter } from 'framework/exports'
import { Project, useDeleteProject } from 'services/cd-ng'
import { useAppStoreReader } from 'framework/exports'
import DefaultRenderer from 'modules/common/pages/ProjectsPage/views/ModuleRenderer/DefaultRenderer'
import CVRenderer from 'modules/common/pages/ProjectsPage/views/ModuleRenderer/cv/CVRenderer'
import CDRenderer from 'modules/common/pages/ProjectsPage/views/ModuleRenderer/cd/CDRenderer'
import { useToaster } from 'modules/common/components/Toaster/useToaster'
import { useConfirmationDialog } from 'modules/common/modals/ConfirmDialog/useConfirmationDialog'
import i18n from './ProjectCard.i18n'
import ContextMenu from '../Menu/ContextMenu'
import css from './ProjectCard.module.scss'

export interface ProjectCardProps {
  data: Project
  isPreview?: boolean
  className?: string
  reloadProjects?: () => Promise<unknown>
  editProject?: (project: Project) => void
  collaborators?: (project: Project) => void
  onClick?: ((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void) | undefined
}

const ProjectCard: React.FC<ProjectCardProps> = props => {
  const { data, isPreview, reloadProjects, editProject, collaborators, onClick } = props
  const { organisationsMap } = useAppStoreReader()
  const { accountId } = useParams()
  const { mutate: deleteProject } = useDeleteProject({
    queryParams: { accountIdentifier: accountId, orgIdentifier: data.orgIdentifier || '' }
  })
  const { showSuccess, showError } = useToaster()

  const { projects } = useAppStoreReader()
  const updateAppStore = useAppStoreWriter()
  const onDeleted = (): void => {
    const index = projects.findIndex(p => p.identifier === data.identifier)
    projects.splice(index, 1)
    updateAppStore({ projects: ([] as Project[]).concat(projects) })
  }

  const { openDialog } = useConfirmationDialog({
    contentText: i18n.confirmDelete(data.name || ''),
    titleText: i18n.confirmDeleteTitle,
    confirmButtonText: i18n.delete,
    cancelButtonText: i18n.cancel,
    onCloseDialog: async (isConfirmed: boolean) => {
      if (isConfirmed) {
        try {
          const deleted = await deleteProject(data.identifier || '', {
            headers: { 'content-type': 'application/json' }
          })
          if (deleted) showSuccess(i18n.successMessage(data.name || ''))
          onDeleted?.()
          reloadProjects?.()
        } catch (err) {
          showError(err)
        }
      }
    }
  })
  return (
    <Card className={cx(css.projectCard, props.className)} onClick={onClick ? onClick : undefined}>
      <Container padding={{ left: 'xlarge', right: 'xlarge', bottom: 'large' }} className={css.overflow}>
        {!isPreview ? (
          <CardBody.Menu
            menuContent={
              <ContextMenu
                project={data}
                reloadProjects={reloadProjects}
                editProject={editProject}
                collaborators={collaborators}
                openDialog={openDialog}
              />
            }
            menuPopoverProps={{
              className: Classes.DARK
            }}
          />
        ) : null}
        <div className={css.colorBar} style={{ backgroundColor: data?.color || 'var(--blue-500)' }}></div>
        {data?.name ? (
          <Text font="medium" color={Color.BLACK}>
            {data.name}
          </Text>
        ) : isPreview ? (
          <Text font="medium" color={Color.BLACK}>
            {i18n.projectName}
          </Text>
        ) : null}
        <Text font={{ size: 'small', weight: 'bold' }}>{organisationsMap.get(data.orgIdentifier || '')?.name}</Text>
        {data?.description ? (
          <Text font="small" lineClamp={3} padding={{ top: 'medium' }}>
            {data.description}
          </Text>
        ) : null}
        {data?.tags?.length ? (
          <Layout.Horizontal padding={{ top: 'small' }} className={css.wrap}>
            {data.tags.map((tag: string) => (
              <Tag className={css.cardTags} key={tag}>
                {tag}
              </Tag>
            ))}
          </Layout.Horizontal>
        ) : null}
        <Layout.Horizontal padding={{ top: 'medium' }}>
          <Layout.Vertical padding={{ right: 'large' }} spacing="xsmall">
            <Icon name="main-user-groups" size={20} />
            <Text font="xsmall">{i18n.admin.toUpperCase()}</Text>
          </Layout.Vertical>
          <Layout.Vertical spacing="xsmall">
            <Icon name="main-user-groups" size={20} />
            <Text font="xsmall">{i18n.collaborators.toUpperCase()}</Text>
          </Layout.Vertical>
        </Layout.Horizontal>
      </Container>

      {data?.modules?.length ? null : <DefaultRenderer data={data} isPreview={isPreview} />}
      {data.modules?.includes(ModuleName.CD) ? <CDRenderer /> : null}
      {data.modules?.includes(ModuleName.CV) ? <CVRenderer /> : null}
    </Card>
  )
}

export default ProjectCard
