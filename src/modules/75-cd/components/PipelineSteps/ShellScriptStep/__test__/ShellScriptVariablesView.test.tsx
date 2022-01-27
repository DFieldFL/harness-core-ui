/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import type { VariableResponseMapValue } from 'services/pipeline-ng'

import { ShellScriptVariablesView } from '../ShellScriptVariablesView'

import shellScriptVariablesViewProps from './shellScriptVariablesViewProps.json'
import type { ShellScriptData } from '../shellScriptTypes'

describe('<ShellScriptVariablesView /> tests', () => {
  test('snapshot test for ShellScriptVariablesView', () => {
    const { container } = render(
      <ShellScriptVariablesView
        metadataMap={
          Object.entries(shellScriptVariablesViewProps.metadataMap) as unknown as Record<
            string,
            VariableResponseMapValue
          >
        }
        variablesData={shellScriptVariablesViewProps.variablesData as ShellScriptData}
        originalData={shellScriptVariablesViewProps.originalData as ShellScriptData}
      />
    )
    expect(container).toMatchSnapshot()
  })
})
