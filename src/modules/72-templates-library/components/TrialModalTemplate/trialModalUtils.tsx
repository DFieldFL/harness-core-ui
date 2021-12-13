import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import routes from '@common/RouteDefinitions'
import { useStrings } from 'framework/strings'

import { CreateOrSelectAProjectTemplate } from '@projects-orgs/components/CreateOrSelectAProjectTemplate/CreateOrSelectAProjectTemplate'
import { CreatePipelineForm } from '@pipeline/components/CreatePipelineForm/CreatePipelineForm'
import { SelectOrCreatePipelineForm } from '@pipeline/components/SelectOrCreatePipelineForm/SelectOrCreatePipelineForm'
import { useAppStore } from 'framework/AppStore/AppStoreContext'

import type { Project, PipelineInfoConfig } from 'services/cd-ng'
import type { ModuleLicenseType } from '@common/constants/SubscriptionTypes'
import type { Module } from '@common/interfaces/RouteInterfaces'
import type { StringsMap } from 'stringTypes'

export enum TrialType {
  CREATE_OR_SELECT_PIPELINE,
  CREATE_OR_SELECT_PROJECT,
  SET_UP_PIPELINE
}

export interface TrialModalProps {
  selectedProject?: Project
  openProjectModal: (project?: Project) => void
  pushToPipelineStudio: (pipelinId: string, projectData?: Project, search?: string) => void
}
export type onCreatePipeline = (values: PipelineInfoConfig) => void
export type onSelectPipeline = (value: string) => void
export type CreateOrSelectProjectProps = {
  onCreateProject: () => void
}
export type PipelineProps = {
  onSuccess: onCreatePipeline | onSelectPipeline
  onCloseModal?: () => void
}
export interface UseTrialModalProps {
  actionProps: PipelineProps | CreateOrSelectProjectProps
  trialType: TrialType
}

export interface UseTrialModalReturns {
  openTrialModal: () => void
  closeTrialModal: () => void
}

export interface FormPropsReturn {
  child: React.ReactElement
  description: string
  rightWidth: string
}

export interface OpenModalProps {
  modal?: ModuleLicenseType
  gettingProjects: boolean
  gettingPipelines: boolean
  selectedProject?: Project
  pipelinesExist: boolean
  projectsExist: boolean
  openProjectModal: (project?: Project) => void
  openTrialModal: () => void
  pushToPipelineStudio: (pipelinId: string, projectData?: Project, search?: string) => void
}

export function openModal(props: OpenModalProps): void {
  const {
    modal,
    gettingProjects,
    gettingPipelines,
    selectedProject,
    pipelinesExist,
    projectsExist,
    openProjectModal,
    openTrialModal,
    pushToPipelineStudio
  } = props
  if (modal && !gettingProjects && !gettingPipelines) {
    // selectedProject exists and no pipelines, forward to create pipeline
    if (selectedProject && !pipelinesExist) {
      pushToPipelineStudio('-1', selectedProject, `?modal=${modal}`)
    } else if (!selectedProject && !projectsExist) {
      // selectedProject doesnot exist and projects donot exist, open project modal
      openProjectModal()
    } else {
      // otherwise, just open trial modal
      openTrialModal()
    }
  }
}

export const getTrialModalProps = (props: TrialModalProps): UseTrialModalProps => {
  const { selectedProject, openProjectModal, pushToPipelineStudio } = props
  return selectedProject
    ? {
        actionProps: {
          onSuccess: (pipelineId: string) => pushToPipelineStudio(pipelineId, selectedProject)
        },
        trialType: TrialType.CREATE_OR_SELECT_PIPELINE
      }
    : {
        actionProps: {
          onCreateProject: openProjectModal
        },
        trialType: TrialType.CREATE_OR_SELECT_PROJECT
      }
}

interface FormByModulePropsReturn {
  description: string
  moduleDescription: string
  rightWidth: string
}

function getFormPropsByModule(module: string): FormByModulePropsReturn {
  switch (module) {
    case 'cd': {
      return {
        description: 'cd.cdTrialHomePage.startTrial.description',
        moduleDescription: 'cd.continuous',
        rightWidth: '40%'
      }
    }
    case 'ci': {
      return {
        description: 'ci.ciTrialHomePage.startTrial.description',
        moduleDescription: 'ci.continuous',
        rightWidth: '45%'
      }
    }
  }

  return { description: '', moduleDescription: '', rightWidth: '30%' }
}

export function useGetFormPropsByTrialType({
  trialType,
  actionProps,
  module
}: UseTrialModalProps & { module: Module }): FormPropsReturn {
  const { getString } = useStrings()
  const history = useHistory()
  const { accountId } = useParams<{ accountId: string }>()
  const { selectedProject } = useAppStore()
  let child = <></>

  const pipelineProps = actionProps as PipelineProps
  const projectProps = actionProps as CreateOrSelectProjectProps

  const { description, moduleDescription, rightWidth } = getFormPropsByModule(module)
  let formDescription = getString(description as keyof StringsMap)

  switch (trialType) {
    case TrialType.SET_UP_PIPELINE: {
      child = (
        <CreatePipelineForm
          handleSubmit={pipelineProps.onSuccess as onCreatePipeline}
          closeModal={pipelineProps.onCloseModal}
        />
      )
      break
    }
    case TrialType.CREATE_OR_SELECT_PIPELINE: {
      child = (
        <SelectOrCreatePipelineForm
          handleSubmit={pipelineProps.onSuccess as onSelectPipeline}
          openCreatPipeLineModal={() => {
            history.push(
              routes.toPipelineStudio({
                orgIdentifier: selectedProject?.orgIdentifier || '',
                projectIdentifier: selectedProject?.identifier || '',
                pipelineIdentifier: '-1',
                accountId,
                module
              })
            )
          }}
          closeModal={pipelineProps.onCloseModal}
        />
      )
      formDescription = getString('pipeline.selectOrCreateForm.description')
      break
    }
    case TrialType.CREATE_OR_SELECT_PROJECT: {
      child = (
        <CreateOrSelectAProjectTemplate
          onCreateProject={() => {
            pipelineProps.onCloseModal?.()
            projectProps.onCreateProject()
          }}
          closeModal={pipelineProps.onCloseModal}
          moduleDescription={moduleDescription}
        />
      )
    }
  }

  return { child, description: formDescription, rightWidth }
}
