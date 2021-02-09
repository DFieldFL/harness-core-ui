import React from 'react'
import { openDB, IDBPDatabase, deleteDB } from 'idb'
import { isEqual, cloneDeep, pick } from 'lodash-es'
import { parse, stringify } from 'yaml'
import type { IconName } from '@wings-software/uicore'
import type {
  NgPipeline,
  PipelineInfoConfig,
  ResponseNGPipelineResponse,
  StageElementConfig,
  StageElementWrapper,
  StageElementWrapperConfig
} from 'services/cd-ng'
import { ModuleName, loggerFor } from 'framework/exports'
import SessionToken from 'framework/utils/SessionToken'
import type { YamlBuilderHandlerBinding } from '@common/interfaces/YAMLBuilderProps'
import {
  createPipelinePromise,
  getPipelinePromise,
  GetPipelineQueryParams,
  putPipelinePromise,
  PutPipelineQueryParams,
  Failure
} from 'services/pipeline-ng'
import { useLocalStorage } from '@common/hooks'
import {
  PipelineReducerState,
  ActionReturnType,
  PipelineContextActions,
  DefaultNewPipelineId,
  DefaultPipeline,
  initialState,
  PipelineReducer,
  PipelineViewData
} from './PipelineActions'
import type { AbstractStepFactory } from '../../AbstractSteps/AbstractStepFactory'
import type { PipelineStagesProps } from '../../PipelineStages/PipelineStages'
import { PipelineStudioView } from '../PipelineUtils'

const logger = loggerFor(ModuleName.CD)

export const getPipelineByIdentifier = (
  params: GetPipelineQueryParams,
  identifier: string
): Promise<NgPipeline | undefined> => {
  return getPipelinePromise({
    pipelineIdentifier: identifier,
    queryParams: {
      accountIdentifier: params.accountIdentifier,
      orgIdentifier: params.orgIdentifier,
      projectIdentifier: params.projectIdentifier
    },
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    }
  }).then(response => {
    let obj = {} as ResponseNGPipelineResponse
    if (typeof response === 'string') {
      obj = parse(response as string).data.yamlPipeline
    } else if (response.data?.yamlPipeline) {
      obj = response
    }
    if (obj.status === 'SUCCESS' && obj.data?.yamlPipeline) {
      return parse(obj.data.yamlPipeline).pipeline as NgPipeline
    }
  })
}

export const savePipeline = (
  params: PutPipelineQueryParams,
  pipeline: NgPipeline,
  isEdit = false
): Promise<Failure | undefined> => {
  return isEdit
    ? putPipelinePromise({
        pipelineIdentifier: pipeline.identifier,
        queryParams: {
          accountIdentifier: params.accountIdentifier,
          projectIdentifier: params.projectIdentifier,
          orgIdentifier: params.orgIdentifier
        },
        body: stringify({
          pipeline: { ...pipeline, ...pick(params, 'projectIdentifier', 'orgIdentifier') }
        }) as any,
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      }).then(response => {
        if (typeof response === 'string') {
          return JSON.parse(response as string) as Failure
        } else {
          return response
        }
      })
    : createPipelinePromise({
        body: stringify({
          pipeline: { ...pipeline, ...pick(params, 'projectIdentifier', 'orgIdentifier') }
        }) as any,
        queryParams: {
          accountIdentifier: params.accountIdentifier,
          projectIdentifier: params.projectIdentifier,
          orgIdentifier: params.orgIdentifier
        },
        requestOptions: { headers: { 'Content-Type': 'application/yaml' } }
      }).then(async (response: unknown) => {
        if (typeof response === 'string') {
          return JSON.parse((response as unknown) as string) as Failure
        } else {
          return (response as unknown) as Failure
        }
      })
}

const DBInitializationFailed = 'DB Creation retry exceeded.'

let IdbPipeline: IDBPDatabase | undefined
const IdbPipelineStoreName = 'pipeline-cache'
export const PipelineDBName = 'pipeline-db'
const KeyPath = 'identifier'

export interface StagesMap {
  [key: string]: {
    name: string
    type: string
    icon: IconName
    iconColor: string
    isApproval: boolean
    openExecutionStrategy: boolean
  }
}
export interface PipelineContextInterface {
  state: PipelineReducerState
  stagesMap: StagesMap
  stepsFactory: AbstractStepFactory
  view: string
  setView: (view: PipelineStudioView) => void
  renderPipelineStage: (args: Omit<PipelineStagesProps, 'children'>) => React.ReactElement<PipelineStagesProps>
  fetchPipeline: (forceFetch?: boolean, forceUpdate?: boolean) => Promise<void>
  setYamlHandler: (yamlHandler: YamlBuilderHandlerBinding) => void
  updatePipeline: (pipeline: NgPipeline) => Promise<void>
  updatePipelineView: (data: PipelineViewData) => void
  deletePipelineCache: () => Promise<void>
  getStageFromPipeline: (
    stageId: string,
    pipeline?: PipelineInfoConfig
  ) => { stage: StageElementWrapper | undefined; parent: StageElementWrapper | undefined }
  runPipeline: (identifier: string) => void
  pipelineSaved: (pipeline: NgPipeline) => void
  updateStage: (stage: StageElementConfig) => void
}

interface PipelinePayload {
  identifier: string
  pipeline: NgPipeline | undefined
  originalPipeline?: NgPipeline
  isUpdated: boolean
}

const getId = (
  accountIdentifier: string,
  orgIdentifier: string,
  projectIdentifier: string,
  pipelineIdentifier: string
): string => `${accountIdentifier}_${orgIdentifier}_${projectIdentifier}_${pipelineIdentifier}`

const _fetchPipeline = async (
  dispatch: React.Dispatch<ActionReturnType>,
  queryParams: GetPipelineQueryParams,
  identifier: string,
  forceFetch = false,
  forceUpdate = false
): Promise<void> => {
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    identifier
  )
  if (IdbPipeline) {
    dispatch(PipelineContextActions.fetching())
    const data: PipelinePayload = await IdbPipeline.get(IdbPipelineStoreName, id)
    if ((!data || forceFetch) && identifier !== DefaultNewPipelineId) {
      const pipeline = await getPipelineByIdentifier(queryParams, identifier)
      const payload: PipelinePayload = {
        [KeyPath]: id,
        pipeline,
        originalPipeline: cloneDeep(pipeline),
        isUpdated: false
      }
      if (data && !forceUpdate) {
        dispatch(
          PipelineContextActions.success({
            error: '',
            pipeline: data.pipeline,
            originalPipeline: cloneDeep(pipeline),
            isBEPipelineUpdated: !isEqual(pipeline, data.originalPipeline),
            isUpdated: !isEqual(pipeline, data.pipeline)
          })
        )
        dispatch(PipelineContextActions.initialized())
      } else {
        await IdbPipeline.put(IdbPipelineStoreName, payload)
        dispatch(
          PipelineContextActions.success({
            error: '',
            pipeline,
            originalPipeline: cloneDeep(pipeline),
            isBEPipelineUpdated: false,
            isUpdated: false
          })
        )
        dispatch(PipelineContextActions.initialized())
      }
    } else {
      dispatch(
        PipelineContextActions.success({
          error: '',
          pipeline: data?.pipeline || { ...DefaultPipeline },
          originalPipeline: cloneDeep(data?.pipeline) || cloneDeep(DefaultPipeline),
          isUpdated: true,
          isBEPipelineUpdated: false
        })
      )
      dispatch(PipelineContextActions.initialized())
    }
  } else {
    dispatch(PipelineContextActions.success({ error: 'DB is not initialized' }))
  }
}

const _updatePipeline = async (
  dispatch: React.Dispatch<ActionReturnType>,
  queryParams: GetPipelineQueryParams,
  identifier: string,
  originalPipeline: NgPipeline,
  pipeline: NgPipeline
): Promise<void> => {
  const id = getId(
    queryParams.accountIdentifier,
    queryParams.orgIdentifier || '',
    queryParams.projectIdentifier || '',
    identifier
  )
  if (IdbPipeline) {
    const isUpdated = !isEqual(originalPipeline, pipeline)
    const payload: PipelinePayload = {
      [KeyPath]: id,
      pipeline,
      originalPipeline,
      isUpdated
    }
    await IdbPipeline.put(IdbPipelineStoreName, payload)
    dispatch(PipelineContextActions.success({ error: '', pipeline, isUpdated }))
  }
}

const cleanUpDBRefs = (): void => {
  if (IdbPipeline) {
    IdbPipeline.close()
    IdbPipeline = undefined
  }
}

const _initializeDb = async (dispatch: React.Dispatch<ActionReturnType>, version: number, trial = 0): Promise<void> => {
  if (!IdbPipeline) {
    try {
      dispatch(PipelineContextActions.updating())
      IdbPipeline = await openDB(PipelineDBName, version, {
        upgrade(db) {
          try {
            db.deleteObjectStore(IdbPipelineStoreName)
          } catch (_) {
            logger.error('There was no DB found')
            dispatch(PipelineContextActions.error({ error: 'There was no DB found' }))
          }
          const objectStore = db.createObjectStore(IdbPipelineStoreName, { keyPath: KeyPath, autoIncrement: false })
          objectStore.createIndex(KeyPath, KeyPath, { unique: true })
        },
        async blocked() {
          cleanUpDBRefs()
        },
        async blocking() {
          cleanUpDBRefs()
        }
      })
      dispatch(PipelineContextActions.dbInitialized())
    } catch (e) {
      logger.info('DB downgraded, deleting and re creating the DB')

      await deleteDB(PipelineDBName)
      IdbPipeline = undefined

      ++trial

      if (trial < 5) {
        _initializeDb(dispatch, version, trial)
      } else {
        logger.error(DBInitializationFailed)
        dispatch(PipelineContextActions.error({ error: DBInitializationFailed }))
      }
    }
  } else {
    dispatch(PipelineContextActions.dbInitialized())
  }
}

const _deletePipelineCache = async (queryParams: GetPipelineQueryParams, identifier: string): Promise<void> => {
  if (IdbPipeline) {
    const id = getId(
      queryParams.accountIdentifier,
      queryParams.orgIdentifier || '',
      queryParams.projectIdentifier || '',
      identifier
    )
    await IdbPipeline.delete(IdbPipelineStoreName, id)
    const defaultId = getId(
      queryParams.accountIdentifier,
      queryParams.orgIdentifier || '',
      queryParams.projectIdentifier || '',
      DefaultNewPipelineId
    )
    await IdbPipeline.delete(IdbPipelineStoreName, defaultId)
  }
}

export const PipelineContext = React.createContext<PipelineContextInterface>({
  state: initialState,
  stepsFactory: {} as AbstractStepFactory,
  stagesMap: {},
  view: PipelineStudioView.ui,
  setView: () => void 0,
  runPipeline: () => undefined,
  // eslint-disable-next-line react/display-name
  renderPipelineStage: () => <div />,
  fetchPipeline: () => new Promise<void>(() => undefined),
  updatePipelineView: () => undefined,
  updateStage: () => void 0,
  getStageFromPipeline: () => ({ stage: undefined, parent: undefined }),
  setYamlHandler: () => undefined,
  updatePipeline: () => new Promise<void>(() => undefined),
  pipelineSaved: () => undefined,
  deletePipelineCache: () => new Promise<void>(() => undefined)
})

export const PipelineProvider: React.FC<{
  queryParams: GetPipelineQueryParams
  pipelineIdentifier: string
  stepsFactory: AbstractStepFactory
  stagesMap: StagesMap
  runPipeline: (identifier: string) => void
  renderPipelineStage: PipelineContextInterface['renderPipelineStage']
}> = ({ queryParams, pipelineIdentifier, children, renderPipelineStage, stepsFactory, stagesMap, runPipeline }) => {
  const [state, dispatch] = React.useReducer(PipelineReducer, initialState)
  const [view, setView] = useLocalStorage<PipelineStudioView>('pipeline_studio_view', PipelineStudioView.ui)
  state.pipelineIdentifier = pipelineIdentifier
  const fetchPipeline = _fetchPipeline.bind(null, dispatch, queryParams, pipelineIdentifier)
  const updatePipeline = _updatePipeline.bind(null, dispatch, queryParams, pipelineIdentifier, state.originalPipeline)
  const deletePipelineCache = _deletePipelineCache.bind(null, queryParams, pipelineIdentifier)
  const pipelineSaved = React.useCallback(
    async (pipeline: NgPipeline) => {
      await deletePipelineCache()
      dispatch(PipelineContextActions.pipelineSavedAction({ pipeline, originalPipeline: cloneDeep(pipeline) }))
    },
    [deletePipelineCache]
  )
  const setYamlHandler = React.useCallback((yamlHandler: YamlBuilderHandlerBinding) => {
    dispatch(PipelineContextActions.setYamlHandler({ yamlHandler }))
  }, [])

  const updatePipelineView = React.useCallback((data: PipelineViewData) => {
    dispatch(PipelineContextActions.updatePipelineView({ pipelineView: data }))
  }, [])
  const getStageFromPipeline = React.useCallback(
    (stageId: string, pipeline?: PipelineInfoConfig) => {
      let stage: StageElementWrapper | undefined = undefined
      let parent: StageElementWrapper | undefined = undefined
      const localPipeline = pipeline || state.pipeline
      if (localPipeline?.stages) {
        localPipeline.stages.some(item => {
          if (item.stage && item.stage.identifier === stageId) {
            stage = item
            return true
          } else if (item.parallel) {
            stage = getStageFromPipeline(stageId, ({ stages: item.parallel } as unknown) as PipelineInfoConfig).stage
            if (stage) {
              parent = item
              return true
            }
          }
        })
      }
      return { stage, parent }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.pipeline, state.pipeline?.stages]
  )

  const updateStage = React.useCallback(
    (newStage: StageElementConfig) => {
      function _updateStages(stages: StageElementWrapperConfig[]): StageElementWrapperConfig[] {
        return stages.map(node => {
          if (node.stage?.identifier === newStage.identifier) {
            return { stage: newStage }
          } else if (node.parallel) {
            return {
              parallel: _updateStages((node.parallel as unknown) as StageElementWrapperConfig[])
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
          }

          return node
        })
      }

      updatePipeline({
        ...state.pipeline,
        stages: _updateStages(state.pipeline.stages || [])
      })
    },
    [state.pipeline, updatePipeline]
  )

  React.useEffect(() => {
    if (state.isDBInitialized) {
      fetchPipeline(true)
    }
  }, [state.isDBInitialized])

  React.useEffect(() => {
    const time = SessionToken.getLastTokenSetTime()
    _initializeDb(dispatch, time || +new Date())
  }, [])

  return (
    <PipelineContext.Provider
      value={{
        state,
        view,
        setView,
        runPipeline,
        stepsFactory,
        stagesMap,
        getStageFromPipeline,
        renderPipelineStage,
        fetchPipeline,
        updatePipeline,
        updateStage,
        updatePipelineView,
        pipelineSaved,
        deletePipelineCache,
        setYamlHandler
      }}
    >
      {children}
    </PipelineContext.Provider>
  )
}

export function usePipelineContext(): PipelineContextInterface {
  return React.useContext(PipelineContext)
}
