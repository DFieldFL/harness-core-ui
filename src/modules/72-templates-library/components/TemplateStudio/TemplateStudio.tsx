/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { matchPath, useParams, useHistory } from 'react-router-dom'
import { parse } from 'yaml'
import { defaultTo, isEmpty, merge } from 'lodash-es'
import {
  Container,
  Layout,
  VisualYamlSelectedView as SelectedView,
  useConfirmationDialog,
  useToaster
} from '@wings-software/uicore'
import type { FormikProps } from 'formik'
import { useStrings } from 'framework/strings'
import { NavigationCheck, Page } from '@common/exports'
import { RightDrawer } from '@templates-library/components/TemplateStudio/RightDrawer/RightDrawer'
import { useDocumentTitle } from '@common/hooks/useDocumentTitle'
import { TemplateStudioSubHeader } from '@templates-library/components/TemplateStudio/TemplateStudioSubHeader/TemplateStudioSubHeader'
import { PageSpinner } from '@common/components'
import templateFactory from '@templates-library/components/Templates/TemplatesFactory'
import { TemplateStudioHeader } from '@templates-library/components/TemplateStudio/TemplateStudioHeader/TemplateStudioHeader'
import type { GitQueryParams, ModulePathParams, TemplateStudioPathProps } from '@common/interfaces/RouteInterfaces'
import type { TemplateType } from '@templates-library/utils/templatesUtils'
import { DrawerTypes } from '@pipeline/components/PipelineStudio/PipelineContext/PipelineActions'
import GenericErrorHandler from '@common/pages/GenericErrorHandler/GenericErrorHandler'
import TemplateYamlView from '@templates-library/components/TemplateStudio/TemplateYamlView/TemplateYamlView'
import { accountPathProps, orgPathProps, pipelineModuleParams, projectPathProps } from '@common/utils/routeUtils'
import routes from '@common/RouteDefinitions'
import type { GetErrorResponse } from '@templates-library/components/TemplateStudio/SaveTemplatePopover/SaveTemplatePopover'
import { DefaultNewTemplateId } from 'framework/Templates/templates'
import type { GitFilterScope } from '@common/components/GitFilters/GitFilters'
import { useQueryParams } from '@common/hooks'
import { useAppStore } from 'framework/AppStore/AppStoreContext'
import NoEntityFound from '@pipeline/pages/utils/NoEntityFound/NoEntityFound'
import { TemplateVariablesContextProvider } from '@templates-library/components/TemplateVariablesContext/TemplateVariablesContext'
import { TemplateContext } from './TemplateContext/TemplateContext'
import css from './TemplateStudio.module.scss'

export type TemplateFormikRef<T = unknown> = {
  resetForm: FormikProps<T>['resetForm']
  submitForm: FormikProps<T>['submitForm']
  getErrors: () => FormikProps<T>['errors']
}

export type TemplateFormRef<T = unknown> =
  | ((instance: TemplateFormikRef<T> | null) => void)
  | React.MutableRefObject<TemplateFormikRef<T> | null>
  | null

export function TemplateStudio(): React.ReactElement {
  const { state, view, updateTemplateView, updateTemplate, deleteTemplateCache, isReadonly, fetchTemplate, setView } =
    React.useContext(TemplateContext)
  const { accountId, projectIdentifier, orgIdentifier, templateIdentifier, module, templateType } = useParams<
    TemplateStudioPathProps & ModulePathParams
  >()
  const { repoIdentifier, branch } = useQueryParams<GitQueryParams>()
  const {
    template,
    templateView,
    isLoading,
    isUpdated,
    yamlHandler,
    isBETemplateUpdated,
    isInitialized,
    gitDetails,
    entityValidityDetails
  } = state
  const { isYamlEditable } = templateView
  const { getString } = useStrings()
  const [blockNavigation, setBlockNavigation] = React.useState(false)
  const [selectedBranch, setSelectedBranch] = React.useState(defaultTo(branch, ''))
  const [isYamlError, setYamlError] = React.useState(false)
  const [discardBEUpdateDialog, setDiscardBEUpdate] = React.useState(false)
  const { showError } = useToaster()
  const history = useHistory()
  const templateFormikRef = React.useRef<TemplateFormikRef | null>(null)
  const { isGitSyncEnabled } = useAppStore()

  useDocumentTitle([parse(template?.name || getString('common.templates'))])

  const { openDialog: openConfirmBEUpdateError } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: getString('templatesLibrary.templateUpdatedError'),
    titleText: getString('common.template.updateTemplate.templateUpdated'),
    confirmButtonText: getString('update'),
    onCloseDialog: isConfirmed => {
      if (isConfirmed) {
        fetchTemplate({ forceFetch: true, forceUpdate: true })
      } else {
        setDiscardBEUpdate(true)
      }
    }
  })

  const { openDialog: openUnsavedChangesDialog } = useConfirmationDialog({
    cancelButtonText: getString('cancel'),
    contentText: isYamlError ? getString('navigationYamlError') : getString('navigationCheckText'),
    titleText: isYamlError ? getString('navigationYamlErrorTitle') : getString('navigationCheckTitle'),
    confirmButtonText: getString('confirm'),
    onCloseDialog: async isConfirmed => {
      if (isConfirmed) {
        deleteTemplateCache(gitDetails).then(() => {
          history.push(
            routes.toTemplateStudio({
              projectIdentifier,
              orgIdentifier,
              templateIdentifier: defaultTo(template?.identifier, '-1'),
              accountId,
              module,
              branch: selectedBranch,
              repoIdentifier: repoIdentifier,
              versionLabel: template?.versionLabel
            })
          )
          location.reload()
        })
      } else {
        setSelectedBranch(defaultTo(branch, ''))
      }
      setBlockNavigation(false)
    }
  })

  const showInvalidYamlError = React.useCallback(
    (error: string) => {
      setYamlError(true)
      showError(error)
    },
    [setYamlError, showError]
  )

  const isValidYaml = function (): boolean {
    // istanbul ignore else
    if (yamlHandler) {
      try {
        const parsedYaml = parse(yamlHandler.getLatestYaml())
        // istanbul ignore else
        if (!parsedYaml || yamlHandler.getYAMLValidationErrorMap()?.size > 0) {
          showInvalidYamlError(getString('invalidYamlText'))
          return false
        }
        updateTemplate(parsedYaml.template)
      } catch (e) {
        showInvalidYamlError(defaultTo(e.message, getString('invalidYamlText')))
        return false
      }
    }
    // istanbul ignore next - This is required just to match the return type and nothing more
    return true
  }

  const onViewChange = (newView: SelectedView): boolean => {
    if (newView === view) {
      return false
    }
    // istanbul ignore else
    if (newView === SelectedView.VISUAL && yamlHandler && isYamlEditable && !isValidYaml()) {
      return false
    }
    setView(newView)
    updateTemplateView({
      isDrawerOpened: false,
      isYamlEditable: false,
      drawerData: { type: DrawerTypes.AddStep }
    })
    return true
  }

  const getErrors = async (): Promise<GetErrorResponse> => {
    await templateFormikRef.current?.submitForm()
    const errors = templateFormikRef.current?.getErrors()
    return { status: 'SUCCESS', errors }
  }

  React.useEffect(() => {
    // istanbul ignore else
    if (isBETemplateUpdated && !discardBEUpdateDialog) {
      openConfirmBEUpdateError()
    }
    // istanbul ignore else
    if (blockNavigation) {
      openUnsavedChangesDialog()
    }
  }, [isBETemplateUpdated, discardBEUpdateDialog, openConfirmBEUpdateError, blockNavigation, openUnsavedChangesDialog])

  const onGitBranchChange = React.useMemo(
    () => (selectedFilter: GitFilterScope) => {
      setSelectedBranch(selectedFilter.branch as string)
      if (isUpdated && branch !== selectedFilter.branch) {
        setBlockNavigation(true)
      } else if (branch !== selectedFilter.branch) {
        deleteTemplateCache({
          repoIdentifier: defaultTo(selectedFilter.repo, ''),
          branch: defaultTo(selectedFilter.branch, '')
        }).then(() => {
          history.push(
            routes.toTemplateStudio({
              projectIdentifier,
              orgIdentifier,
              templateIdentifier: defaultTo(templateIdentifier, '-1'),
              accountId,
              module,
              templateType: template.type,
              versionLabel: template.versionLabel,
              branch: selectedFilter.branch,
              repoIdentifier: selectedFilter.repo
            })
          )
        })
      }
    },
    [
      branch,
      isUpdated,
      templateIdentifier,
      projectIdentifier,
      orgIdentifier,
      accountId,
      module,
      deleteTemplateCache,
      history,
      template
    ]
  )

  React.useEffect(() => {
    if (templateIdentifier === DefaultNewTemplateId) {
      setView(SelectedView.VISUAL)
    } else if (entityValidityDetails.valid === false || view === SelectedView.YAML) {
      setView(SelectedView.YAML)
    } else {
      setView(SelectedView.VISUAL)
    }
  }, [templateIdentifier, entityValidityDetails.valid])

  const getPathParams = React.useCallback(() => {
    const pathParams = {
      templateIdentifier: ':templateIdentifier',
      templateType: ':templateType' as TemplateType
    }
    return projectIdentifier
      ? merge(pathParams, { ...projectPathProps, ...pipelineModuleParams })
      : orgIdentifier
      ? merge(pathParams, { ...orgPathProps })
      : merge(pathParams, { ...accountPathProps })
  }, [projectIdentifier, orgIdentifier])

  return (
    <TemplateVariablesContextProvider template={template}>
      <NavigationCheck
        when={template?.identifier !== ''}
        shouldBlockNavigation={nextLocation => {
          const matchDefault = matchPath(nextLocation.pathname, {
            path: routes.toTemplateStudio(getPathParams()),
            exact: true
          })
          return (
            !matchDefault?.isExact &&
            isUpdated &&
            !isReadonly &&
            !(templateIdentifier === DefaultNewTemplateId && isEmpty(template?.name))
          )
        }}
        textProps={{
          contentText: isYamlError ? getString('navigationYamlError') : getString('navigationCheckText'),
          titleText: isYamlError ? getString('navigationYamlErrorTitle') : getString('navigationCheckTitle')
        }}
        navigate={newPath => {
          const isTemplate = matchPath(newPath, {
            path: routes.toTemplateStudio(getPathParams()),
            exact: true
          })
          !isTemplate?.isExact && deleteTemplateCache()
          history.push(newPath)
        }}
      />
      <Page.Header size={'small'} title={<TemplateStudioHeader templateType={templateType as TemplateType} />} />
      <Page.Body>
        {isLoading && <PageSpinner />}
        <Layout.Vertical height={'100%'}>
          {!isLoading && isEmpty(template) && !isGitSyncEnabled && <GenericErrorHandler />}
          {!isLoading && isEmpty(template) && isGitSyncEnabled && (
            <NoEntityFound identifier={templateIdentifier} entityType="template" />
          )}
          {isInitialized && !isEmpty(template) && (
            <>
              <TemplateStudioSubHeader
                onViewChange={onViewChange}
                getErrors={getErrors}
                onGitBranchChange={onGitBranchChange}
              />
              <Container className={css.canvasContainer}>
                {view === SelectedView.VISUAL ? (
                  /* istanbul ignore next */
                  templateFactory.getTemplate(templateType)?.renderTemplateCanvas({ formikRef: templateFormikRef })
                ) : (
                  <TemplateYamlView />
                )}
              </Container>
            </>
          )}
          <RightDrawer />
        </Layout.Vertical>
      </Page.Body>
    </TemplateVariablesContextProvider>
  )
}
