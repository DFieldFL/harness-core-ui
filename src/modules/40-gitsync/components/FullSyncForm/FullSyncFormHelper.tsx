/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { SelectOption } from '@harness/uicore'
import type { FormikProps } from 'formik'
import type {
  Failure,
  GitFullSyncConfigDTO,
  GitFullSyncConfigRequestDTO,
  GitSyncConfig,
  GitSyncFolderConfigDTO,
  ResponseGitFullSyncConfigDTO
} from 'services/cd-ng'

export interface FullSyncFormProps {
  orgIdentifier: string
  projectIdentifier: string
  isNewUser: boolean
  classname?: string
}

export interface ModalConfigureProps {
  onClose?: () => void
  onSuccess?: () => void
}

export interface FullSyncCallbacks extends ModalConfigureProps {
  showError: (error?: string) => void
  setDefaultFormData: (data: GitFullSyncConfigRequestDTO) => void
  setRootFolderSelectOptions: React.Dispatch<React.SetStateAction<SelectOption[]>>
  setRepoSelectOptions: React.Dispatch<React.SetStateAction<SelectOption[]>>
  fetchBranches: (repoIdentifier: string) => void
}

export const getRootFolderSelectOptions = (folders: GitSyncFolderConfigDTO[] | undefined): SelectOption[] => {
  return folders?.length
    ? folders.map((folder: GitSyncFolderConfigDTO) => {
        return {
          label: folder.rootFolder || '',
          value: folder.rootFolder || ''
        }
      })
    : []
}

export const defaultInitialFormData: GitFullSyncConfigRequestDTO = {
  baseBranch: '',
  branch: '',
  createPullRequest: false,
  newBranch: false,
  prTitle: '',
  repoIdentifier: '',
  rootFolder: '',
  targetBranch: ''
}

export const initiliazeConfigForm = (
  config: GitFullSyncConfigDTO | undefined,
  gitSyncRepos: GitSyncConfig[],
  formikRef: React.MutableRefObject<FormikProps<GitFullSyncConfigRequestDTO> | undefined>,
  handlers: FullSyncCallbacks
): void => {
  const { setDefaultFormData, setRootFolderSelectOptions, setRepoSelectOptions, fetchBranches } = handlers
  //Setting up default form feilds
  const repoIdentifier = config?.repoIdentifier || gitSyncRepos[0].identifier || ''
  const selectedRepo = gitSyncRepos.find((repo: GitSyncConfig) => repo.identifier === repoIdentifier)
  const baseBranch = selectedRepo?.branch

  const defaultRootFolder = selectedRepo?.gitSyncFolderConfigDTOs?.find(
    (folder: GitSyncFolderConfigDTO) => folder.isDefault
  )
  const rootFolder = config?.rootFolder || defaultRootFolder?.rootFolder || ''
  const branch = config?.branch || ''
  formikRef?.current?.setFieldValue('repoIdentifier', repoIdentifier)
  formikRef?.current?.setFieldValue('branch', branch)
  formikRef?.current?.setFieldValue('rootFolder', rootFolder)
  setDefaultFormData({
    ...defaultInitialFormData,
    repoIdentifier,
    baseBranch,
    branch,
    rootFolder
  })

  fetchBranches(repoIdentifier)

  //Setting up default form repo and rootFolder dropdown options
  setRootFolderSelectOptions(getRootFolderSelectOptions(selectedRepo?.gitSyncFolderConfigDTOs))
  setRepoSelectOptions(
    gitSyncRepos?.map((gitRepo: GitSyncConfig) => {
      return {
        label: gitRepo.name || '',
        value: gitRepo.identifier || ''
      }
    })
  )
}

export const handleConfigResponse = (
  configResponse: ResponseGitFullSyncConfigDTO | null,
  configError: Failure,
  gitSyncRepos: GitSyncConfig[],
  formikRef: React.MutableRefObject<FormikProps<GitFullSyncConfigRequestDTO> | undefined>,
  handlers: FullSyncCallbacks
): void => {
  const { showError, onClose } = handlers
  if ('SUCCESS' === configResponse?.status || 'RESOURCE_NOT_FOUND' === configError?.code) {
    initiliazeConfigForm(configResponse?.data, gitSyncRepos, formikRef, handlers)
  } else {
    //Closing edit config modal with error toaster if fetch config API has failed
    showError(configError?.message)
    onClose?.()
  }
}
