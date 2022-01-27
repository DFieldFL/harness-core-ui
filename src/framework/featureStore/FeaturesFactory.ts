/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import type { BannerType } from '@common/layouts/Constants'
import type { FeatureIdentifier } from './FeatureIdentifier'
import type { CheckFeaturesReturn } from './featureStoreUtil'

import type { Module } from '../types/ModuleName'
export interface FeatureProps {
  features: FeatureIdentifier[]
  renderMessage(props: CheckFeaturesReturn): {
    message: React.ReactNode
    bannerType: BannerType
  }
}

export type FeatureRegistry = Partial<Record<Module, FeatureProps>>

class FeatureFactory {
  private featureRegistry: FeatureRegistry = {}

  registerFeaturesByModule(module: Module, props: FeatureProps): void {
    this.featureRegistry[module] = props
  }

  getFeaturesByModule(module: Module): FeatureProps | undefined {
    return this.featureRegistry[module]
  }

  getAllFeatures(): FeatureRegistry {
    return this.featureRegistry
  }

  unregisterFeaturesByModule(module: Module): void {
    delete this.featureRegistry[module]
  }

  unregisterAllFeatures(): void {
    this.featureRegistry = {}
  }
}

const featureFactory = new FeatureFactory()

export default featureFactory
