import React from 'react'

import { render, queryByAttribute, fireEvent, act } from '@testing-library/react'

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
})
