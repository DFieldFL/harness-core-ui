/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { ModalErrorHandlerBinding, SelectOption } from '@harness/uicore'
import type { FormikProps } from 'formik'
import { isEmpty } from 'lodash-es'
import type { UseStringsReturn } from 'framework/strings/String'
import {
  createGitFullSyncConfigPromise,
  Failure,
  getListOfBranchesWithStatusPromise,
  GetListOfBranchesWithStatusQueryParams,
  GitBranchDTO,
  GitFullSyncConfigDTO,
  GitFullSyncConfigRequestDTO,
  GitSyncConfig,
  GitSyncFolderConfigDTO,
  ResponseGitBranchListDTO,
  ResponseGitFullSyncConfigDTO,
  triggerFullSyncPromise,
  updateGitFullSyncConfigPromise,
  UpdateGitFullSyncConfigQueryParams
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
  setDefaultFormData: React.Dispatch<React.SetStateAction<GitFullSyncConfigRequestDTO>>
  setRootFolderSelectOptions: React.Dispatch<React.SetStateAction<SelectOption[]>>
  setRepoSelectOptions: React.Dispatch<React.SetStateAction<SelectOption[]>>
  fetchBranches: (repoIdentifier: string) => void
}

export interface FetchBranchCallbacks {
  setDisableCreatePR: React.Dispatch<React.SetStateAction<boolean>>
  setDisableBranchSelection: React.Dispatch<React.SetStateAction<boolean>>
  setBranches: React.Dispatch<React.SetStateAction<SelectOption[] | undefined>>
  getString: UseStringsReturn['getString']
}

export interface SubmitCallbacks {
  showSuccess: (msg: string) => void
  onSuccess?: () => void
  getString: UseStringsReturn['getString']
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

export const branchFetchHandler = (
  queryParams: GetListOfBranchesWithStatusQueryParams,
  isNewBranch: boolean,
  handlers: FetchBranchCallbacks,
  modalErrorHandler: ModalErrorHandlerBinding | undefined,
  query?: string
): void => {
  const { setDisableCreatePR, setDisableBranchSelection, setBranches, getString } = handlers
  modalErrorHandler?.hide()

  getListOfBranchesWithStatusPromise({
    queryParams
  })
    .then((response: ResponseGitBranchListDTO) => {
      const branchesInResponse = response?.data?.branches?.content
      /* Show error in case no branches exist on a git repo at all */
      /* A valid git repo should have atleast one branch in it(a.k.a default branch) */
      if (!query && isEmpty(branchesInResponse)) {
        setDisableCreatePR(true)
        setDisableBranchSelection(true)
        modalErrorHandler?.showDanger(getString('common.git.noBranchesFound'))
        return
      }
      const branchOptions = branchesInResponse?.map((branch: GitBranchDTO) => {
        return { label: branch?.branchName, value: branch?.branchName }
      }) as SelectOption[]

      if (!isNewBranch && isEmpty(branchOptions)) {
        setDisableCreatePR(true)
        setDisableBranchSelection(true)
      } else {
        setBranches(branchOptions)
        setDisableCreatePR(false)
        setDisableBranchSelection(false)
      }
    })
    .catch(e => {
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    })
}

export const saveAndTriggerFullSync = async (
  queryParams: UpdateGitFullSyncConfigQueryParams,
  fullSyncData: GitFullSyncConfigRequestDTO,
  isNewBranch: boolean,
  config: ResponseGitFullSyncConfigDTO | null,
  handlers: SubmitCallbacks,
  modalErrorHandler?: ModalErrorHandlerBinding
): Promise<void> => {
  const { showSuccess, onSuccess, getString } = handlers
  modalErrorHandler?.hide()

  try {
    const reqObj = {
      queryParams,
      body: { ...fullSyncData, newBranch: isNewBranch }
    }
    const fullSyncConfigData = config?.data
      ? await updateGitFullSyncConfigPromise(reqObj)
      : await createGitFullSyncConfigPromise(reqObj)
    if (fullSyncConfigData.status !== 'SUCCESS') {
      throw fullSyncConfigData
    } else {
      config?.data ? showSuccess('Full Sync Config is saved') : showSuccess('Full Sync Config is updated')
    }
    const triggerFullSync = await triggerFullSyncPromise({ queryParams, body: {} as unknown as void })
    if (triggerFullSync.status !== 'SUCCESS') {
      throw triggerFullSync
    }
    showSuccess(getString('gitsync.syncSucessToaster'))
    onSuccess?.()
  } catch (err) {
    modalErrorHandler?.showDanger(err.message)
  }
}
