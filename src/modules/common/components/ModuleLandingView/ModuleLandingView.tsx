import React, { useMemo } from 'react'
import { Container, Layout, Text, Heading, Icon, Button, Color, IconName, Spacing } from '@wings-software/uikit'
import { useAppStoreReader, ModuleName } from 'framework/exports'
import type { ProjectDTO, NGPageResponseProjectDTO } from 'services/cd-ng'
import { useProjectModal } from 'modules/common/modals/ProjectModal/useProjectModal'
import { Page } from '../../components/Page/Page'
import ProjectGridView from '../../pages/ProjectsPage/views/ProjectGridView/ProjectGridView'
import i18n from './ModuleLandingView.i18n'

export interface ModuleLandingViewProps {
  module: ModuleName.CD | ModuleName.CV | ModuleName.CE | ModuleName.CI | ModuleName.CF
  heading: string
  subHeading: string
  icon: IconName
  iconSize?: number
  iconPadding?: Spacing
  description: string
  onProjectCreated: (project: ProjectDTO) => void
}

export const ModuleLandingView: React.FC<ModuleLandingViewProps> = ({
  module,
  onProjectCreated,
  icon,
  iconSize,
  iconPadding,
  heading,
  subHeading,
  description
}) => {
  const { projects } = useAppStoreReader()
  const { openProjectModal } = useProjectModal({
    onSuccess: (project?: ProjectDTO): void => {
      if (project) {
        onProjectCreated(project)
      }
    }
  })
  const showEditProject = (project: ProjectDTO): void => {
    openProjectModal(project)
  }
  // listingProjects contains a collection of projects that don't include `module`
  const listingProjects = useMemo(() => projects.filter(p => !p.modules?.includes(module)), [projects, module])

  return (
    <Page.Body filled>
      <Container style={{ marginBottom: 10 }}>
        <Layout.Vertical flex style={{ alignItems: 'center', marginTop: 60 }}>
          <Heading font={{ weight: 'bold', size: 'large' }} color="black">
            {heading}
          </Heading>
          <Text color={Color.GREY_400} padding="small" style={{ paddingTop: 20 }}>
            {subHeading}
          </Text>
          <Icon name={icon} size={iconSize || 200} padding={iconPadding} />
          <Button
            intent="primary"
            text={i18n.newProject}
            onClick={() => openProjectModal(({ modules: [module] } as unknown) as ProjectDTO)}
          />
          <Text color={Color.GREY_400} padding="large">
            {i18n.startYourTrial}
          </Text>
        </Layout.Vertical>
      </Container>
      <Container style={{ borderTop: '1px solid var(--grey-300)', maxWidth: 900, margin: '0 auto' }}>
        <Text padding="xlarge" font={{ align: 'center' }} color={Color.BLACK} style={{ paddingBottom: 0 }}>
          {description}
        </Text>
        <ProjectGridView
          data={{ content: listingProjects } as NGPageResponseProjectDTO}
          showEditProject={showEditProject}
        />
      </Container>
    </Page.Body>
  )
}
