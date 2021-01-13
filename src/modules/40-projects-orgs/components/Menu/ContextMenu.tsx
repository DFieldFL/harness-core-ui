import React from 'react'
import { useHistory } from 'react-router-dom'
import { Menu } from '@blueprintjs/core'
import { Layout, Color, Text, Icon } from '@wings-software/uicore'
import type { Project } from 'services/cd-ng'
import routes from '@common/RouteDefinitions'
import { ModuleName, useStrings } from 'framework/exports'

interface ContextMenuProps {
  project: Project
  reloadProjects?: () => Promise<unknown>
  editProject?: (project: Project) => void
  collaborators?: (project: Project) => void
  setMenuOpen?: (value: React.SetStateAction<boolean>) => void
  openDialog?: () => void
}

const ContextMenu: React.FC<ContextMenuProps> = props => {
  const history = useHistory()
  const { getString } = useStrings()
  const { project, editProject, collaborators, setMenuOpen, openDialog } = props
  const handleDelete = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    openDialog?.()
  }

  const handleEdit = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    editProject?.(project)
  }

  const handleCollaborate = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    collaborators?.(project)
  }

  const handleCD = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    history.push(
      routes.toCDProjectOverview({
        orgIdentifier: project?.orgIdentifier as string,
        projectIdentifier: project?.identifier as string,
        accountId: project?.accountIdentifier as string
      })
    )
  }

  const handleCV = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    history.push(
      routes.toCVProjectOverview({
        projectIdentifier: project.identifier,
        orgIdentifier: project.orgIdentifier as string,
        accountId: project.accountIdentifier as string
      })
    )
  }

  const handleCF = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    history.push(
      routes.toCFFeatureFlags({
        projectIdentifier: project.identifier,
        orgIdentifier: project.orgIdentifier as string,
        accountId: project.accountIdentifier as string
      })
    )
  }
  const handleCI = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    history.push(
      routes.toCIProjectOverview({
        projectIdentifier: project.identifier,
        orgIdentifier: project.orgIdentifier as string,
        accountId: project.accountIdentifier as string
      })
    )
  }
  const handleCE = (event: React.MouseEvent<HTMLElement, MouseEvent>): void => {
    event.stopPropagation()
    setMenuOpen?.(false)
    history.push(
      routes.toCEHome({
        accountId: project.accountIdentifier as string
      })
    )
  }

  return (
    <Menu style={{ minWidth: 'unset' }}>
      {project.modules?.includes(ModuleName.CD) ? (
        <Menu.Item
          text={
            <Layout.Horizontal spacing="xsmall">
              <Icon name="cd-main" />
              <Text color={Color.WHITE}>{getString('projectContextMenuRenderer.gotoCD')}</Text>
            </Layout.Horizontal>
          }
          onClick={handleCD}
        />
      ) : null}
      {project.modules?.includes(ModuleName.CV) ? (
        <Menu.Item
          text={
            <Layout.Horizontal spacing="xsmall">
              <Icon name="cv-main" />
              <Text color={Color.WHITE}>{getString('projectContextMenuRenderer.gotoCV')}</Text>
            </Layout.Horizontal>
          }
          onClick={handleCV}
        />
      ) : null}
      {project.modules?.includes(ModuleName.CI) ? (
        <Menu.Item
          text={
            <Layout.Horizontal spacing="xsmall">
              <Icon name="ci-main" />
              <Text color={Color.WHITE}>{getString('projectContextMenuRenderer.gotoCI')}</Text>
            </Layout.Horizontal>
          }
          onClick={handleCI}
        />
      ) : null}
      {project.modules?.includes(ModuleName.CF) ? (
        <Menu.Item
          text={
            <Layout.Horizontal spacing="xsmall">
              <Icon name="cf-main" />
              <Text color={Color.WHITE}>{getString('projectContextMenuRenderer.gotoCF')}</Text>
            </Layout.Horizontal>
          }
          onClick={handleCF}
        />
      ) : null}
      {project.modules?.includes(ModuleName.CE) ? (
        <Menu.Item
          text={
            <Layout.Horizontal spacing="xsmall">
              <Icon name="ce-main" />
              <Text color={Color.WHITE}>{getString('projectContextMenuRenderer.gotoCE')}</Text>
            </Layout.Horizontal>
          }
          onClick={handleCE}
        />
      ) : null}
      <Menu.Item icon="edit" text={getString('edit')} onClick={handleEdit} />
      <Menu.Item icon="new-person" text={getString('projectContextMenuRenderer.invite')} onClick={handleCollaborate} />

      <>
        <Menu.Divider />
        <Menu.Item icon="trash" text={getString('delete')} onClick={handleDelete} />
      </>
    </Menu>
  )
}

export default ContextMenu
