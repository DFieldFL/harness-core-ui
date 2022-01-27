/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

export const EXPRESSION_STRING = '<+expression>' // TODO: this needs to be exported from uicore for best use.

export enum CardVariant {
  Default = 'Default',
  Minimal = 'Minimal',
  MinimalWithActions = 'MinimalWithActions'
}

export const ConnectorRefWidth = {
  DeploymentFormView: 320,
  InputSetView: 310,
  DefaultView: 385
}
