import React from 'react'
import { MemoryRouter } from 'react-router'
import { render, queryByText, fireEvent } from '@testing-library/react'
import { clickSubmit, InputTypes, setFieldValue } from '@common/utils/JestFormHelper'
import ConnectorDetailsStep from '../ConnectorDetailsStep'
import i18n from '../ConnectorDetailsStep.i18n'

describe('Connector details step', () => {
  test('render for create kubernetes connector step one', async () => {
    const desciptiion = 'dummy description'
    const { container, getByText } = render(
      <MemoryRouter>
        <ConnectorDetailsStep name="sample-name" type="K8sCluster" />
      </MemoryRouter>
    )
    expect(queryByText(container, i18n.connectorName)).not.toBeNull()
    fireEvent.click(getByText(i18n.addDescription))
    setFieldValue({
      type: InputTypes.TEXTAREA,
      container: container,
      fieldId: 'description',
      value: desciptiion
    })
    // test for retaining values on toggling form feilds
    fireEvent.click(getByText(i18n.remove)) //hiding description
    expect(container).toMatchSnapshot() // matching snapshot with description and tags hidden
    fireEvent.click(getByText(i18n.addDescription)) //showing description
    fireEvent.click(getByText(i18n.addTags)) //showing tags
    expect(queryByText(container, desciptiion)).not.toBeNull()
    expect(container).toMatchSnapshot()
    clickSubmit(container)
  })

  test('render for GIT connector', () => {
    const { container } = render(
      <MemoryRouter>
        <ConnectorDetailsStep name="sample-name" type="Git" />
      </MemoryRouter>
    )
    expect(queryByText(container, i18n.connectorName)).not.toBeNull()
    expect(container).toMatchSnapshot()
  })
})
