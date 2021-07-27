import React, { useEffect, useState } from 'react'
import { Button, Position, PopoverInteractionKind } from '@blueprintjs/core'
import { useParams, useHistory } from 'react-router-dom'

import { Text, Layout, Color, Container, Popover, TextInput, Pagination } from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { Project, useGetProjectAggregateDTOList } from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ProjectCard from '@projects-orgs/components/ProjectCard/ProjectCard'
import { PageSpinner } from '@common/components'
import { NoDataCard } from '@common/components/Page/NoDataCard'
import pointerImage from './pointer.svg'
import css from './ProjectSelector.module.scss'

export interface ProjectSelectorProps {
  onSelect: (project: Project) => void
  moduleFilter?: Required<Project>['modules'][0]
}

const ProjectSelect: React.FC<ProjectSelectorProps> = ({ onSelect }) => {
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()
  const { selectedProject } = useAppStore()
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState<string>()
  const { getString } = useStrings()
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const { data, loading } = useGetProjectAggregateDTOList({
    queryParams: {
      accountIdentifier: accountId,
      searchTerm,
      pageIndex: page,
      pageSize: 10
    },
    debounce: 300
  })

  return (
    <Popover
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.RIGHT}
      modifiers={{ offset: { offset: -50 } }}
      minimal
      isOpen={isOpen}
      popoverClassName={css.popover}
    >
      <Button
        minimal
        icon={selectedProject ? 'double-chevron-right' : 'chevron-right'}
        data-testid={'project-select-dropdown'}
        className={css.selectButton}
        onClick={() => setIsOpen(true)}
      />
      <Container width={600} padding="xlarge" className={css.selectContainer}>
        <Layout.Horizontal flex padding={{ bottom: 'large' }}>
          <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
            {getString('selectProject')}
          </Text>
          <Button
            intent="primary"
            minimal
            text={getString('projectsOrgs.viewAllProjects')}
            onClick={() => history.push(routes.toProjects({ accountId }))}
          />
        </Layout.Horizontal>

        <TextInput
          leftIcon="search"
          placeholder={getString('projectsOrgs.searchProjectPlaceHolder')}
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value.trim())
            setPage(0)
          }}
        />
        {loading && <PageSpinner />}
        {data?.data?.content?.length ? (
          <Layout.Vertical className={css.projectContainerWrapper}>
            <div className={css.projectContainer}>
              {data.data.content.map(projectAggregate => (
                <ProjectCard
                  key={projectAggregate.projectResponse.project.identifier}
                  data={projectAggregate}
                  minimal={true}
                  className={css.projectCard}
                  onClick={() => {
                    onSelect(projectAggregate.projectResponse.project)
                    setIsOpen(false)
                  }}
                />
              ))}
            </div>
            <Pagination
              itemCount={data?.data?.totalItems || 0}
              pageSize={data?.data?.pageSize || 10}
              pageCount={data?.data?.totalPages || 0}
              pageIndex={data?.data?.pageIndex || 0}
              gotoPage={pageNumber => setPage(pageNumber)}
            />
          </Layout.Vertical>
        ) : (
          <NoDataCard icon="nav-project" message={getString('noProjects')} />
        )}
      </Container>
    </Popover>
  )
}
export const ProjectSelector: React.FC<ProjectSelectorProps> = ({ onSelect, moduleFilter }) => {
  const { accountId, orgIdentifier, projectIdentifier } = useParams<ProjectPathProps>()
  const { selectedProject, updateAppStore } = useAppStore()
  const { getString } = useStrings()
  const history = useHistory()

  useEffect(() => {
    // deselect current project if user switches module
    // and the new module isn't added on selected project
    if (moduleFilter && !selectedProject?.modules?.includes(moduleFilter)) {
      updateAppStore({ selectedProject: undefined })
    }
  }, [moduleFilter])

  return (
    <>
      <Layout.Vertical padding="large">
        <Text margin={{ bottom: 'xsmall' }} font={{ size: 'small' }} color={Color.GREY_500}>
          {getString('projectLabel')}
        </Text>
        <Layout.Horizontal flex className={css.projectSelector}>
          <Button
            minimal
            onClick={() => {
              selectedProject && history.push(routes.toProjectDetails({ accountId, orgIdentifier, projectIdentifier }))
            }}
            className={css.selectButton}
          >
            <Text
              lineClamp={1}
              color={selectedProject ? Color.WHITE : Color.GREY_400}
              font={{ size: 'normal' }}
              padding="xsmall"
              className={css.projectText}
            >
              {selectedProject ? selectedProject.name : getString('selectProject')}
            </Text>
          </Button>
          <ProjectSelect onSelect={onSelect} />
        </Layout.Horizontal>
      </Layout.Vertical>

      {selectedProject ? null : (
        <div style={{ backgroundImage: `url(${pointerImage})` }} className={css.pickProjectHelp}>
          {getString('pickProject')}
        </div>
      )}
    </>
  )
}
