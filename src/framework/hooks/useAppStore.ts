import { useState, useCallback } from 'react'
import constate from 'constate'
import type { Organization } from 'services/cd-ng'
import type { AppStore } from '../types/AppStore'

const initialStoreData: AppStore = {
  projects: [],
  organisationsMap: new Map<string, Organization>()
}

function useAppStore(): { store: AppStore; updateStore: (newState: Partial<AppStore>) => void } {
  const [store, setStore] = useState(initialStoreData)
  const updateStore = useCallback(
    (newState: Partial<AppStore>) => setStore(currentState => ({ ...currentState, ...newState })),
    []
  )

  return { store, updateStore }
}

const [AppStoreProvider, useAppStoreReader, useAppStoreWriter] = constate(
  useAppStore,
  value => value.store,
  value => value.updateStore
)

export { AppStoreProvider, useAppStoreReader, useAppStoreWriter }
