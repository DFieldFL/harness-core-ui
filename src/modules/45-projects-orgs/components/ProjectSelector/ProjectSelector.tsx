/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useEffect, useState } from 'react'
import { Position, PopoverInteractionKind, Classes } from '@blueprintjs/core'
import { useParams, useHistory } from 'react-router-dom'
import cx from 'classnames'
import {
  Text,
  Layout,
  Color,
  Container,
  Popover,
  Pagination,
  Button,
  ButtonVariation,
  ExpandingSearchInput,
  NoDataCard
} from '@wings-software/uicore'
import routes from '@common/RouteDefinitions'
import { Project, useGetProjectAggregateDTOList } from 'services/cd-ng'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import { useStrings } from 'framework/strings'
import type { AccountPathProps, ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import ProjectCard from '@projects-orgs/components/ProjectCard/ProjectCard'
import { PageSpinner } from '@common/components'
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

  const { data, loading } = useGetProjectAggregateDTOList({
    queryParams: {
      accountIdentifier: accountId,
      searchTerm,
      pageIndex: page,
      pageSize: 50
    },
    debounce: 300
  })

  return (
    <Popover
      interactionKind={PopoverInteractionKind.CLICK}
      position={Position.RIGHT}
      modifiers={{ offset: { offset: -50 } }}
      minimal
      fill={true}
      popoverClassName={css.popover}
    >
      {selectedProject ? (
        <Button
          minimal
          withoutBoxShadow={true}
          icon="double-chevron-right"
          tooltipProps={{
            isDark: true,
            usePortal: true,
            fill: true
          }}
          tooltip={
            <Text padding="small" color={Color.WHITE}>
              {getString('selectProject')}
            </Text>
          }
          data-testid="project-select-dropdown"
          className={css.popoverTarget}
        />
      ) : (
        <Button
          minimal
          text={
            <Text color={Color.GREY_400} font={{ size: 'normal' }} padding="xsmall">
              {getString('selectProject')}
            </Text>
          }
          rightIcon="chevron-right"
          data-testid="project-select-button"
          className={cx(css.popoverTarget, css.selectButton)}
        />
      )}

      <Container width={600} padding="xlarge" className={css.selectContainer}>
        <Layout.Horizontal flex padding={{ bottom: 'large' }}>
          <Text font={{ size: 'medium', weight: 'bold' }} color={Color.BLACK}>
            {getString('selectProject')}
          </Text>
          <Button
            variation={ButtonVariation.LINK}
            text={getString('projectsOrgs.viewAllProjects')}
            onClick={() => history.push(routes.toProjects({ accountId }))}
          />
        </Layout.Horizontal>
        <Layout.Vertical>
          <ExpandingSearchInput
            defaultValue={searchTerm}
            placeholder={getString('projectsOrgs.searchProjectPlaceHolder')}
            alwaysExpanded
            onChange={text => {
              setSearchTerm(text.trim())
              setPage(0)
            }}
          />
        </Layout.Vertical>
        {loading && <PageSpinner />}
        {data?.data?.content?.length ? (
          <Layout.Vertical className={css.projectContainerWrapper}>
            <div className={css.projectContainer}>
              {data.data.content.map(projectAggregate => (
                <ProjectCard
                  key={projectAggregate.projectResponse.project.identifier}
                  data={projectAggregate}
                  minimal={true}
                  selected={projectAggregate.projectResponse.project.identifier === selectedProject?.identifier}
                  className={cx(css.projectCard, Classes.POPOVER_DISMISS)}
                  onClick={() => {
                    onSelect(projectAggregate.projectResponse.project)
                  }}
                />
              ))}
            </div>
            <Pagination
              className={css.pagination}
              itemCount={data?.data?.totalItems || 0}
              pageSize={data?.data?.pageSize || 10}
              pageCount={data?.data?.totalPages || 0}
              pageIndex={data?.data?.pageIndex || 0}
              gotoPage={pageNumber => setPage(pageNumber)}
              hidePageNumbers
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
      <Layout.Vertical padding={{ left: 'large', right: 'large', top: 'large', bottom: 'small' }}>
        <Text margin={{ bottom: 'xsmall' }} font={{ size: 'small' }} color={Color.GREY_500}>
          {getString('projectLabel')}
        </Text>
        <div className={cx(css.projectSelector, { [css.selectProjectDisplay]: !selectedProject })}>
          {selectedProject && (
            <Button
              minimal
              tooltipProps={{
                isDark: true,
                fill: true
              }}
              tooltip={
                <Layout.Vertical padding="medium" spacing="small">
                  <Text color={Color.GREY_300}>{getString('projectsOrgs.manageAProject')}</Text>
                  <Text color={Color.WHITE}>{selectedProject.name}</Text>
                </Layout.Vertical>
              }
              onClick={() => {
                history.push(routes.toProjectDetails({ accountId, orgIdentifier, projectIdentifier }))
              }}
              className={cx(css.popoverTarget, css.selectedProject)}
            >
              <Text color={Color.WHITE} padding="xsmall" className={css.projectText}>
                {selectedProject.name}
              </Text>
            </Button>
          )}
          <ProjectSelect onSelect={onSelect} />
        </div>
      </Layout.Vertical>

      {selectedProject ? null : (
        <div style={{ backgroundImage: `url(${pointerImage})` }} className={css.pickProjectHelp}>
          <Text color={Color.GREY_200} padding="small">
            {getString('pickProject')}
          </Text>
        </div>
      )}
    </>
  )
}
