/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import { createContext, createRef, Dispatch, MutableRefObject, SetStateAction, useContext } from 'react'
import { noop } from 'lodash-es'
import type { DateRange } from '@blueprintjs/datetime'
import type { Module } from '@common/interfaces/RouteInterfaces'

export enum Views {
  LIST,
  INSIGHT
}

export type ParamsType = {
  orgIdentifier: string
  projectIdentifier: string
  accountId: string
  module: Module
}

export interface ServiceStore {
  view: Views
  setView: Dispatch<SetStateAction<Views>>
  fetchDeploymentList: MutableRefObject<(() => void) | unknown>
}

export const ServiceStoreContext = createContext({
  view: Views.INSIGHT,
  setView: noop,
  fetchDeploymentList: createRef()
})

export const useServiceStore = (): ServiceStore => useContext(ServiceStoreContext)

export const DeploymentsTimeRangeContext = createContext<{
  timeRange: { range: DateRange; label: string } | null
  setTimeRange: (timeRange: { range: DateRange; label: string }) => void
}>({
  timeRange: null,
  setTimeRange: noop
})

export interface NumberFormatterOptions {
  truncate?: boolean
}

export const numberFormatter: (value?: number, options?: NumberFormatterOptions) => string = (
  value?: number,
  options = { truncate: true }
) => {
  // istanbul ignore if
  if (value === undefined) {
    return ''
  }
  const truncateOptions = [
    { value: 1000000, suffix: 'm' },
    { value: 1000, suffix: 'k' }
  ]
  if (options.truncate) {
    for (const truncateOption of truncateOptions) {
      if (value >= truncateOption.value) {
        const truncatedValue = value / truncateOption.value
        // istanbul ignore if
        if (truncatedValue % 1 !== 0) {
          return `${truncatedValue.toFixed(1)}${truncateOption.suffix}`
        }
        return `${truncatedValue}${truncateOption.suffix}`
      }
    }
  }
  return `${getFixed(value)}`
}

export const getFixed = (value: number, places = 1): number => {
  if (value % 1 === 0) {
    return value
  }
  return parseFloat(value.toFixed(places))
}

export const INVALID_CHANGE_RATE = -10000
