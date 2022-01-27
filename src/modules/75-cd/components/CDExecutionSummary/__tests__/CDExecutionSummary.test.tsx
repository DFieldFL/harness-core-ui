/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { CDExecutionSummary } from '../CDExecutionSummary'

import props from './props.json'

describe('<CDExecutionSummary /> tests', () => {
  test('snapshot test', () => {
    const { container } = render(<CDExecutionSummary {...(props as any)} />)
    expect(container).toMatchSnapshot()
  })
})
