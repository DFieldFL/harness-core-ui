/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'

import { render, queryByAttribute, fireEvent, act, screen } from '@testing-library/react'

import { MultiTypeInputType } from '@wings-software/uicore'
import { TestWrapper } from '@common/utils/testUtils'
import { TFVarStore } from '../Editview/TFVarStore'

const props = {
  name: 'Terraform Var store',
  initialValues: {
    varFile: {
      type: 'Remote'
    }
  },
  isEditMode: false,
  allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
}
describe('Terraform Var Store tests', () => {
  test('initial render', async () => {
    const { container } = render(
      <TestWrapper>
        <TFVarStore {...props} />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })

  test('select one of the types', async () => {
    const { container } = render(
      <TestWrapper>
        <TFVarStore {...props} />
      </TestWrapper>
    )

    const storeCard = queryByAttribute('data-testid', container, 'varStore-Git')
    act(() => {
      fireEvent.click(storeCard!)
    })

    expect(container).toMatchSnapshot()
  })

  test('on edit mode for tf var store ', async () => {
    const defaultProps = {
      name: 'Terraform Var store',
      initialValues: {
        varFile: {
          type: 'Remote',
          spec: {
            store: {
              type: 'Git'
            }
          }
        }
      },
      isEditMode: true,
      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
    }
    const { container } = render(
      <TestWrapper>
        <TFVarStore {...defaultProps} />
      </TestWrapper>
    )

    const storeCard = queryByAttribute('data-testid', container, 'varStore-Git')
    act(() => {
      fireEvent.click(storeCard!)
    })

    expect(container).toMatchSnapshot()
  })

  test('on edit mode for tf var store ', async () => {
    const defaultProps = {
      name: 'Terraform Var store',
      initialValues: {
        varFile: {
          type: 'Remote',
          spec: {
            store: {
              type: 'Git'
            }
          }
        }
      },
      isEditMode: true,
      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
    }
    const { container } = render(
      <TestWrapper>
        <TFVarStore {...defaultProps} />
      </TestWrapper>
    )

    const storeCard = queryByAttribute('data-testid', container, 'varStore-Git')
    act(() => {
      fireEvent.click(storeCard!)
    })

    expect(container).toMatchSnapshot()
  })

  test('new connector view works correctly', async () => {
    const defaultProps = {
      name: 'Terraform Var store',
      initialValues: {
        varFile: {
          type: 'Remote',
          spec: {
            store: {
              type: 'Git'
            }
          }
        }
      },
      isEditMode: true,
      isReadOnly: false,
      allowableTypes: [MultiTypeInputType.FIXED, MultiTypeInputType.EXPRESSION, MultiTypeInputType.RUNTIME]
    }
    render(
      <TestWrapper>
        <TFVarStore {...defaultProps} />
      </TestWrapper>
    )

    const newConnectorLabel = await screen.findByText('newLabel pipeline.manifestType.gitConnectorLabel connector')
    expect(newConnectorLabel).toBeInTheDocument()
    fireEvent.click(newConnectorLabel)

    const nextStepButton = await screen.findByText('continue')
    expect(nextStepButton).toBeDefined()
    fireEvent.click(nextStepButton)

    expect(screen).toMatchSnapshot()
  })
})
