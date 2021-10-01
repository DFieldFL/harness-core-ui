import React from 'react'
import merge from 'lodash-es/merge'
import { deleteDB, IDBPDatabase, openDB } from 'idb'
import { cloneDeep, isEqual } from 'lodash-es'
import type { Color } from '@wings-software/uicore'
import { parse } from 'yaml'
import SessionToken from 'framework/utils/SessionToken'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import type { GetPipelineQueryParams } from 'services/pipeline-ng'
import { SelectedView } from '@common/components/VisualYamlToggle/VisualYamlToggle'
import { useLocalStorage } from '@common/hooks'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import { TemplateListType } from '@templates-library/pages/TemplatesPage/TemplatesPageUtils'
import {
  getTemplateListPromise,
  GetTemplateListQueryParams,
  NGTemplateInfoConfig,
  TemplateSummaryResponse
} from 'services/template-ng'
import { ActionReturnType, TemplateContextActions } from './TemplateActions'
import {
  DefaultNewTemplateId,
  DefaultNewVersionLabel,
  DefaultTemplate,
  initialState,
  TemplateReducer,
  TemplateReducerState,
  TemplateViewData
} from './TemplateReducer'

const logger = loggerFor(ModuleName.CD)

const DBInitializationFailed = 'DB Creation retry exceeded.'

let IdbTemplate: IDBPDatabase | undefined
const IdbTemplateStoreName = 'template-cache'
export const TemplateDBName = 'template-db'
const KeyPath = 'identifier'

interface TemplatePayload {
  identifier: string
  template?: NGTemplateInfoConfig
  originalTemplate?: NGTemplateInfoConfig
  isUpdated: boolean
  versions?: string[]
  stableVersion?: boolean
}

const getId = (
  accountIdentifier: string,
  orgIdentifier: string,
  projectIdentifier: string,
  templateIdentifier: string,
  versionLabel: string
): string =>
  `${accountIdentifier}_${orgIdentifier}_${projectIdentifier}_${templateIdentifier}_${encodeURIComponent(versionLabel)}`

export interface FetchTemplateBoundProps {
  dispatch: React.Dispatch<ActionReturnType>
  queryParams: GetPipelineQueryParams
  templateIdentifier: string
  versionLabel?: string
}

export interface FetchTemplateUnboundProps {
  forceFetch?: boolean
  forceUpdate?: boolean
  signal?: AbortSignal
}

const getTemplatesByIdentifier = (
  queryParams: GetTemplateListQueryParams,
  identifier: string,
  signal?: AbortSignal
): Promise<TemplateSummaryResponse[]> => {
  return getTemplateListPromise(
    {
      queryParams,
      body: {
        filterType: 'Template',
        templateIdentifiers: [identifier]
      }
    },
    signal
  )
    .then(response => {
      if (response.status === 'SUCCESS' && response.data?.content) {
        return response.data?.content
      }
      throw new Error()
    })
    .catch(error => {
      throw new Error(error)
    })
}

const _fetchTemplate = async (props: FetchTemplateBoundProps, params: FetchTemplateUnboundProps): Promise<void> => {
  const { dispatch, queryParams, templateIdentifier, versionLabel = '' } = props
  const { forceFetch = false, forceUpdate = false, signal } = params
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    templateIdentifier,
    versionLabel
  )
  if (IdbTemplate) {
    dispatch(TemplateContextActions.fetching())
    const data: TemplatePayload = await IdbTemplate.get(IdbTemplateStoreName, id)
    if ((!data || forceFetch) && templateIdentifier !== DefaultNewTemplateId) {
      const templatesList: TemplateSummaryResponse[] = await getTemplatesByIdentifier(
        { ...queryParams, templateListType: TemplateListType.All },
        templateIdentifier,
        signal
      )
      const versions: string[] = templatesList.map(item => item.versionLabel || '')
      const defaultVersion = templatesList.find(item => item.stableTemplate)?.versionLabel || ''
      const selectedVersion = versions.includes(versionLabel) ? versionLabel : defaultVersion
      const stableVersion = !!templatesList.find(item => item.versionLabel === selectedVersion)?.stableTemplate
      const template: NGTemplateInfoConfig =
        parse(templatesList.find(item => item.versionLabel === selectedVersion)?.yaml || '')?.template || {}
      if (data && !forceUpdate) {
        dispatch(
          TemplateContextActions.success({
            error: '',
            template: data.template,
            originalTemplate: cloneDeep(template),
            isBETemplateUpdated: !isEqual(template, data.originalTemplate),
            isUpdated: !isEqual(template, data.template),
            versions: versions,
            stableVersion: stableVersion
          })
        )
        dispatch(TemplateContextActions.initialized())
      } else if (IdbTemplate) {
        const payload: TemplatePayload = {
          [KeyPath]: id,
          template,
          originalTemplate: cloneDeep(template),
          isUpdated: false,
          versions: versions,
          stableVersion: stableVersion
        }
        await IdbTemplate.put(IdbTemplateStoreName, payload)
        dispatch(
          TemplateContextActions.success({
            error: '',
            template,
            originalTemplate: cloneDeep(template),
            isBETemplateUpdated: false,
            isUpdated: false,
            versions: versions,
            stableVersion: stableVersion
          })
        )
        dispatch(TemplateContextActions.initialized())
      }
    } else {
      dispatch(
        TemplateContextActions.success({
          error: '',
          template: data?.template || {
            ...DefaultTemplate,
            projectIdentifier: queryParams.projectIdentifier,
            orgIdentifier: queryParams.orgIdentifier
          },
          originalTemplate:
            cloneDeep(data?.template) ||
            cloneDeep({
              ...DefaultTemplate,
              projectIdentifier: queryParams.projectIdentifier,
              orgIdentifier: queryParams.orgIdentifier
            }),
          isUpdated: true,
          isBETemplateUpdated: false,
          versions: [DefaultNewVersionLabel],
          stableVersion: true
        })
      )
      dispatch(TemplateContextActions.initialized())
    }
  } else {
    dispatch(TemplateContextActions.success({ error: 'DB is not initialized' }))
  }
}

interface UpdateTemplateArgs {
  dispatch: React.Dispatch<ActionReturnType>
  queryParams: GetPipelineQueryParams
  identifier: string
  versionLabel?: string
  originalTemplate: NGTemplateInfoConfig
  versions: string[]
  stableVersion: boolean
}

const _updateTemplate = async (
  args: UpdateTemplateArgs,
  templateArg: NGTemplateInfoConfig | ((p: NGTemplateInfoConfig) => NGTemplateInfoConfig)
): Promise<void> => {
  const { dispatch, queryParams, identifier, versionLabel = '', originalTemplate, versions, stableVersion } = args
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    identifier,
    versionLabel
  )
  if (IdbTemplate) {
    let template = templateArg

    if (typeof templateArg === 'function') {
      const dbTemplate = await IdbTemplate.get(IdbTemplateStoreName, id)
      if (dbTemplate?.template) {
        template = templateArg(dbTemplate.template)
      } else {
        template = {} as NGTemplateInfoConfig
      }
    }
    const isUpdated = !isEqual(originalTemplate, template)
    const payload: TemplatePayload = {
      [KeyPath]: id,
      template: template as NGTemplateInfoConfig,
      originalTemplate,
      versions,
      stableVersion,
      isUpdated
    }
    if (IdbTemplate) {
      await IdbTemplate.put(IdbTemplateStoreName, payload)
      dispatch(TemplateContextActions.success({ error: '', template: template as NGTemplateInfoConfig, isUpdated }))
    }
  }
}

const cleanUpDBRefs = (): void => {
  if (IdbTemplate) {
    IdbTemplate.close()
    IdbTemplate = undefined
  }
}

const _initializeDb = async (dispatch: React.Dispatch<ActionReturnType>, version: number, trial = 0): Promise<void> => {
  if (!IdbTemplate) {
    try {
      dispatch(TemplateContextActions.updating())
      IdbTemplate = await openDB(TemplateDBName, version, {
        upgrade(db) {
          try {
            db.deleteObjectStore(IdbTemplateStoreName)
          } catch (_) {
            // logger.error('There was no DB found')
            dispatch(TemplateContextActions.error({ error: 'There was no DB found' }))
          }
          const objectStore = db.createObjectStore(IdbTemplateStoreName, { keyPath: KeyPath, autoIncrement: false })
          objectStore.createIndex(KeyPath, KeyPath, { unique: true })
        },
        async blocked() {
          cleanUpDBRefs()
        },
        async blocking() {
          cleanUpDBRefs()
        }
      })
      dispatch(TemplateContextActions.dbInitialized())
    } catch (e) {
      logger.info('DB downgraded, deleting and re creating the DB')

      await deleteDB(TemplateDBName)
      IdbTemplate = undefined

      ++trial

      if (trial < 5) {
        await _initializeDb(dispatch, version, trial)
      } else {
        logger.error(DBInitializationFailed)
        dispatch(TemplateContextActions.error({ error: DBInitializationFailed }))
      }
    }
  } else {
    dispatch(TemplateContextActions.dbInitialized())
  }
}

export interface TemplateAttributes {
  type: string
  primaryColor: Color
  secondaryColor: Color
}
export interface TemplatesMap {
  [key: string]: TemplateAttributes
}

export interface TemplateContextInterface {
  state: TemplateReducerState
  view: string
  isReadonly: boolean
  setView: (view: SelectedView) => void
  fetchTemplate: (args: FetchTemplateUnboundProps) => Promise<void>
  setYamlHandler: (yamlHandler: YamlBuilderHandlerBinding) => void
  updateTemplate: (template: NGTemplateInfoConfig) => Promise<void>
  updateTemplateView: (data: TemplateViewData) => void
  deleteTemplateCache: () => Promise<void>
  setLoading: () => void
}

const _deleteTemplateCache = async (
  queryParams: GetPipelineQueryParams,
  identifier: string,
  versionLabel?: string
): Promise<void> => {
  if (IdbTemplate) {
    const id = getId(
      queryParams.accountIdentifier,
      queryParams.orgIdentifier || '',
      queryParams.projectIdentifier || '',
      identifier,
      versionLabel || ''
    )
    await IdbTemplate.delete(IdbTemplateStoreName, id)
  }

  // due to async operation, IdbPipeline may be undefined
  if (IdbTemplate) {
    const defaultId = getId(
      queryParams.accountIdentifier,
      queryParams.orgIdentifier || '',
      queryParams.projectIdentifier || '',
      DefaultNewTemplateId,
      DefaultNewVersionLabel
    )
    await IdbTemplate.delete(IdbTemplateStoreName, defaultId)
  }
}

export const TemplateContext = React.createContext<TemplateContextInterface>({
  state: initialState,
  isReadonly: false,
  view: SelectedView.VISUAL,
  setView: () => void 0,
  fetchTemplate: () => new Promise<void>(() => undefined),
  updateTemplateView: () => undefined,
  setYamlHandler: () => undefined,
  updateTemplate: () => new Promise<void>(() => undefined),
  deleteTemplateCache: () => new Promise<void>(() => undefined),
  setLoading: () => void 0
})

export const TemplateProvider: React.FC<{
  queryParams: GetPipelineQueryParams
  templateIdentifier: string
  versionLabel?: string
}> = ({ queryParams, templateIdentifier, versionLabel, children }) => {
  const abortControllerRef = React.useRef<AbortController | null>(null)
  const isMounted = React.useRef(false)
  const [state, dispatch] = React.useReducer(
    TemplateReducer,
    merge(
      {
        template: {
          projectIdentifier: queryParams.projectIdentifier,
          orgIdentifier: queryParams.orgIdentifier
        },
        originalTemplate: {
          projectIdentifier: queryParams.projectIdentifier,
          orgIdentifier: queryParams.orgIdentifier
        }
      },
      initialState
    )
  )
  const [view, setView] = useLocalStorage<SelectedView>('pipeline_studio_view', SelectedView.VISUAL)
  state.templateIdentifier = templateIdentifier
  const fetchTemplate = _fetchTemplate.bind(null, {
    dispatch,
    queryParams,
    templateIdentifier,
    versionLabel
  })

  const updateTemplate = _updateTemplate.bind(null, {
    dispatch,
    queryParams,
    identifier: templateIdentifier,
    versionLabel: versionLabel,
    originalTemplate: state.originalTemplate,
    versions: state.versions,
    stableVersion: state.stableVersion
  })

  const setLoading = () => {
    dispatch(TemplateContextActions.loading())
  }

  const isReadonly = false
  const deleteTemplateCache = _deleteTemplateCache.bind(null, queryParams, templateIdentifier, versionLabel)
  const setYamlHandler = React.useCallback((yamlHandler: YamlBuilderHandlerBinding) => {
    dispatch(TemplateContextActions.setYamlHandler({ yamlHandler }))
  }, [])
  const updateTemplateView = React.useCallback((data: TemplateViewData) => {
    dispatch(TemplateContextActions.updateTemplateView({ templateView: data }))
  }, [])

  React.useEffect(() => {
    fetchTemplate({ forceFetch: true, forceUpdate: true })
  }, [templateIdentifier, versionLabel])

  React.useEffect(() => {
    if (state.isDBInitialized) {
      abortControllerRef.current = new AbortController()

      fetchTemplate({ forceFetch: true, signal: abortControllerRef.current?.signal })
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isDBInitialized])

  React.useEffect(() => {
    isMounted.current = true
    const time = SessionToken.getLastTokenSetTime()
    _initializeDb(dispatch, time || +new Date())

    return () => {
      isMounted.current = false
      cleanUpDBRefs()
    }
  }, [])

  return (
    <TemplateContext.Provider
      value={{
        state,
        view,
        setView,
        isReadonly,
        fetchTemplate,
        updateTemplate,
        updateTemplateView,
        deleteTemplateCache,
        setYamlHandler,
        setLoading
      }}
    >
      {children}
    </TemplateContext.Provider>
  )
}
