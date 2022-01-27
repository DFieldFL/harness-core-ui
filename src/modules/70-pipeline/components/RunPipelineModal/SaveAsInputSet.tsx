/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { Dispatch, SetStateAction } from 'react'
import * as Yup from 'yup'
import type { FormikErrors } from 'formik'
import type { MutateMethod } from 'restful-react'
import { omit } from 'lodash-es'
import { Button, ButtonVariation, Formik, Layout, Popover } from '@wings-software/uicore'
import { Classes } from '@blueprintjs/core'
import type { PipelineInfoConfig } from 'services/cd-ng'
import type {
  CreateInputSetForPipelineQueryParams,
  EntityGitDetails,
  ResponseInputSetResponse
} from 'services/pipeline-ng'
import { NameIdDescriptionTags } from '@common/components'
import { useToaster } from '@common/exports'
import { IdentifierSchema, NameSchema } from '@common/utils/Validation'
import GitContextForm, { GitContextProps } from '@common/components/GitContextForm/GitContextForm'
import type { SaveToGitFormInterface } from '@common/components/SaveToGitForm/SaveToGitForm'
import { useSaveToGitDialog, UseSaveSuccessResponse } from '@common/modals/SaveToGitDialog/useSaveToGitDialog'
import { clearNullUndefined } from '@pipeline/pages/triggers/utils/TriggersWizardPageUtils'
import { getFormattedErrors } from '@pipeline/utils/runPipelineUtils'
import { useStrings } from 'framework/strings'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { GitSyncStoreProvider } from 'framework/GitRepoStore/GitSyncStoreContext'
import { yamlStringify } from '@common/utils/YamlHelperMethods'
import type { InputSetDTO } from '../InputSetForm/InputSetForm'
import type { Values } from '../PipelineStudio/StepCommands/StepCommandTypes'

interface SaveAsInputSetProps {
  pipeline?: PipelineInfoConfig
  currentPipeline?: { pipeline?: PipelineInfoConfig }
  template: string | undefined
  values: Values
  accountId: string
  projectIdentifier: string
  orgIdentifier: string
  canEdit: boolean
  createInputSetLoading: boolean
  createInputSet: MutateMethod<ResponseInputSetResponse, string, CreateInputSetForPipelineQueryParams, void>
  repoIdentifier?: string
  branch?: string
  isGitSyncEnabled?: boolean
  setFormErrors: Dispatch<SetStateAction<FormikErrors<InputSetDTO>>>
  getInputSetsList: () => void
}

const SaveAsInputSet = ({
  pipeline,
  currentPipeline,
  template,
  orgIdentifier,
  projectIdentifier,
  accountId,
  values,
  canEdit,
  createInputSet,
  createInputSetLoading,
  repoIdentifier,
  branch,
  isGitSyncEnabled = false,
  setFormErrors,
  getInputSetsList
}: SaveAsInputSetProps): JSX.Element | null => {
  const { getString } = useStrings()

  const { showError, showSuccess } = useToaster()
  const [savedInputSetObj, setSavedInputSetObj] = React.useState<InputSetDTO>({})
  const [initialGitDetails, setInitialGitDetails] = React.useState<EntityGitDetails>({ repoIdentifier, branch })

  const createUpdateInputSet = async (
    inputSetObj: InputSetDTO,
    gitDetails?: SaveToGitFormInterface,
    payload?: Omit<InputSetDTO, 'repo' | 'branch'>
  ): Promise<UseSaveSuccessResponse> => {
    try {
      const response = await createInputSet(
        yamlStringify({
          inputSet: { ...clearNullUndefined(payload || inputSetObj), orgIdentifier, projectIdentifier }
        }) as any,
        {
          queryParams: {
            accountIdentifier: accountId,
            orgIdentifier,
            projectIdentifier,
            pipelineIdentifier: pipeline?.identifier as string,
            pipelineRepoID: repoIdentifier,
            pipelineBranch: branch,
            ...(gitDetails ?? {}),
            ...(gitDetails && gitDetails.isNewBranch ? { baseBranch: initialGitDetails.branch } : {})
          }
        }
      )
      if (response.data?.errorResponse) {
        const errors = getFormattedErrors(response.data.inputSetErrorWrapper?.uuidToErrorResponseMap)
        if (Object.keys(errors).length) {
          setFormErrors(errors)
        } else {
          showError(getString('inputSets.inputSetSavedError'), undefined, 'pipeline.save.inputset.error')
        }
      } else {
        showSuccess(getString('inputSets.inputSetSaved'))
      }
      return {
        status: response?.status // nextCallback can be added if required
      }
    } catch (e) {
      showError(e?.data?.message)
      // throw error here so that it's uncaught in handleSubmit and we don'tr end up reloading the modal
      throw e
    }
  }

  const createUpdateInputSetWithGitDetails = (gitDetails: SaveToGitFormInterface): Promise<UseSaveSuccessResponse> => {
    return createUpdateInputSet(savedInputSetObj, gitDetails).then(resp => {
      getInputSetsList()
      return resp
    })
  }

  const { openSaveToGitDialog } = useSaveToGitDialog({
    onSuccess: (
      data: SaveToGitFormInterface,
      _payload?: Omit<InputSetDTO, 'repo' | 'branch'>
    ): Promise<UseSaveSuccessResponse> => Promise.resolve(createUpdateInputSetWithGitDetails(data))
  })

  const handleSubmit = React.useCallback(
    async (inputSetObj: InputSetDTO, gitDetails?: EntityGitDetails) => {
      setSavedInputSetObj(omit(inputSetObj, 'repo', 'branch'))
      setInitialGitDetails(gitDetails as EntityGitDetails)

      if (inputSetObj) {
        if (isGitSyncEnabled) {
          openSaveToGitDialog({
            isEditing: false,
            resource: {
              type: 'InputSets',
              name: inputSetObj.name as string,
              identifier: inputSetObj.identifier as string,
              gitDetails: gitDetails
            },
            payload: omit(inputSetObj, 'repo', 'branch')
          })
        } else {
          createUpdateInputSet(omit(inputSetObj, 'repo', 'branch')).then(() => {
            getInputSetsList()
          })
        }
      }
    },
    [createInputSet, showSuccess, showError, isGitSyncEnabled, pipeline]
  )
  if (pipeline && currentPipeline && template) {
    return (
      <Popover
        disabled={!canEdit}
        content={
          <div>
            <Formik<InputSetDTO & GitContextProps>
              formName="runPipelineForm"
              onSubmit={input => {
                handleSubmit(input, { repoIdentifier: input.repo, branch: input.branch })
              }}
              validationSchema={Yup.object().shape({
                name: NameSchema({ requiredErrorMsg: getString('common.validation.nameIsRequired') }),
                identifier: IdentifierSchema()
              })}
              initialValues={
                {
                  pipeline: values,
                  name: '',
                  identifier: '',
                  repo: repoIdentifier || '',
                  branch: branch || ''
                } as InputSetDTO & GitContextProps
              }
            >
              {createInputSetFormikProps => {
                const { submitForm: submitFormIs } = createInputSetFormikProps
                return (
                  <Layout.Vertical padding="large" width={400}>
                    <NameIdDescriptionTags
                      identifierProps={{
                        inputLabel: getString('name'),
                        isIdentifierEditable: true,
                        inputGroupProps: {
                          disabled: !canEdit
                        }
                      }}
                      descriptionProps={{ disabled: !canEdit }}
                      tagsProps={{
                        disabled: !canEdit
                      }}
                      formikProps={createInputSetFormikProps}
                    />
                    {isGitSyncEnabled && (
                      <GitSyncStoreProvider>
                        <GitContextForm
                          formikProps={createInputSetFormikProps}
                          gitDetails={{ repoIdentifier, branch, getDefaultFromOtherRepo: false }}
                        />
                      </GitSyncStoreProvider>
                    )}
                    <Layout.Horizontal spacing="medium">
                      <Button
                        variation={ButtonVariation.PRIMARY}
                        text={createInputSetLoading ? getString('loading') : getString('save')}
                        type="submit"
                        disabled={createInputSetLoading}
                        onClick={event => {
                          event.stopPropagation()
                          submitFormIs()
                        }}
                      />
                      <Button
                        variation={ButtonVariation.SECONDARY}
                        className={Classes.POPOVER_DISMISS}
                        text={getString('cancel')}
                      />
                    </Layout.Horizontal>
                  </Layout.Vertical>
                )
              }}
            </Formik>
          </div>
        }
      >
        <RbacButton
          variation={ButtonVariation.SECONDARY}
          text={getString('inputSets.saveAsInputSet')}
          permission={{
            permission: PermissionIdentifier.EDIT_PIPELINE,
            resource: {
              resourceType: ResourceType.PIPELINE
            }
          }}
        />
      </Popover>
    )
  }
  return null
}

export default SaveAsInputSet
