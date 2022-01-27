/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render } from '@testing-library/react'

import { MultiTypeInputType } from '@harness/uicore'
import { TestWrapper } from '@common/utils/testUtils'

import TfVarFile from '../InputSteps/TfPlanVarFiles'
import { TerraformStoreTypes } from '../../Common/Terraform/TerraformInterfaces'

describe('<TfVarFile /> tests', () => {
  test('snapshot test for tf var files', () => {
    const { container } = render(
      <TestWrapper>
        <TfVarFile
          initialValues={{
            identifier: 'id_0',
            name: 'filename',
            type: 'xls'
          }}
          allowableTypes={[MultiTypeInputType.EXPRESSION]}
          inputSetData={{
            template: {
              name: 'template',
              identifier: 't_id',
              type: 'template',
              spec: {
                configuration: {
                  varFiles: [
                    {
                      varFile: {
                        type: TerraformStoreTypes.Inline,
                        identifier: 'file_id_1',
                        spec: {
                          type: 'inline_type_spec'
                        }
                      }
                    },
                    {
                      varFile: {
                        type: TerraformStoreTypes.Remote,
                        identifier: 'file_id_2',
                        spec: {
                          type: 'remote_type_spec'
                        }
                      }
                    },

                    {
                      varFile: {
                        type: 'Random',
                        identifier: 'file_id_3',
                        spec: {
                          type: 'random_type_spec'
                        }
                      }
                    }
                  ],
                  command: 'Apply',
                  configFiles: {
                    store: {
                      spec: {},
                      type: 'Git'
                    }
                  },
                  secretManagerRef: 'ref'
                }
              }
            }
          }}
        />
      </TestWrapper>
    )
    expect(container).toMatchSnapshot()
  })
})
