/*
 * Copyright 2021 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { render, waitFor, fireEvent, queryByText } from '@testing-library/react'
import { renderHook } from '@testing-library/react-hooks'
import { FormInput } from '@wings-software/uicore'
import { Link } from 'react-router-dom'
import { TestWrapper } from '@common/utils/testUtils'
import { useStrings } from 'framework/strings'
import routes from '@common/RouteDefinitions'

import { getDefaultProps } from './mockConstants'
import Wizard from '../Wizard'

const wrapper = ({ children }: React.PropsWithChildren<unknown>): React.ReactElement => (
  <TestWrapper>{children}</TestWrapper>
)
const { result } = renderHook(() => useStrings(), { wrapper })
jest.mock('@common/components/YAMLBuilder/YamlBuilder')

describe('Wizard tests', () => {
  describe('Renders/snapshots', () => {
    test('Initial Render - 3 panels', async () => {
      const defaultWizardProps = getDefaultProps()
      render(
        <TestWrapper>
          <Wizard {...defaultWizardProps}>
            <div>
              <h2>Form 1</h2>
              <FormInput.Text name="name" label="Name" />
            </div>
            <div>
              <h2>Form 2</h2>
            </div>
            <div>
              <h2>Form 3</h2>
            </div>
          </Wizard>
        </TestWrapper>
      )
      // eslint-disable-next-line no-document-body-snapshot
      expect(document.body).toMatchSnapshot()
    })
  })

  describe('Interactivity', () => {
    test('Footer: Continue button goes to Panel 2', async () => {
      const defaultWizardProps = getDefaultProps()
      const { container } = render(
        <TestWrapper>
          <Wizard {...defaultWizardProps}>
            <div>Form 1</div>
            <div>Form 2</div>
            <div>Form 3</div>
          </Wizard>
        </TestWrapper>
      )
      const continueButton = queryByText(container, result.current.getString('continue'))
      if (!continueButton) {
        throw Error('No continue button')
      }
      fireEvent.click(continueButton)
      expect(queryByText(container, 'Form 2')).not.toBeNull()
      expect(queryByText(container, 'Form 1')).toBeNull()
      // touched panel with required fields shows warning on Continue button
      expect(document.body.querySelector('[icon="warning-sign"]')).not.toBeNull()
    })
    test('Footer: Back button goes to Panel 1', async () => {
      const defaultWizardProps = getDefaultProps()
      const { container } = render(
        <TestWrapper>
          <Wizard {...defaultWizardProps} defaultTabId={defaultWizardProps.wizardMap.panels[1].id}>
            <div>Form 1</div>
            <div>Form 2</div>
            <div>Form 3</div>
          </Wizard>
        </TestWrapper>
      )
      expect(queryByText(container, 'Form 2')).not.toBeNull()
      expect(queryByText(container, 'Form 1')).toBeNull()
      const backButton = queryByText(container, result.current.getString('back'))
      if (!backButton) {
        throw Error('No back button')
      }
      fireEvent.click(backButton)
      expect(queryByText(container, 'Form 1')).not.toBeNull()
      expect(queryByText(container, result.current.getString('continue'))).not.toBeNull()
      expect(queryByText(container, 'Form 2')).toBeNull()
    })
    test('Footer: back button goes to Panel 1', async () => {
      const defaultWizardProps = getDefaultProps()
      const { container } = render(
        <TestWrapper>
          <Wizard {...defaultWizardProps} defaultTabId={defaultWizardProps.wizardMap.panels[1].id}>
            <div>Form 1</div>
            <div>Form 2</div>
            <div>Form 3</div>
          </Wizard>
        </TestWrapper>
      )
      expect(queryByText(container, 'Form 2')).not.toBeNull()
      expect(queryByText(container, 'Form 1')).toBeNull()
      const backButton = queryByText(container, result.current.getString('back'))
      if (!backButton) {
        throw Error('No back button')
      }
      fireEvent.click(backButton)
      expect(queryByText(container, 'Form 1')).not.toBeNull()
      expect(queryByText(container, result.current.getString('continue'))).not.toBeNull()
      expect(queryByText(container, 'Form 2')).toBeNull()
    })

    test('Tab Change: Show warning for each touched panel until pass validation', async () => {
      const defaultWizardProps = getDefaultProps()
      const { container } = render(
        <TestWrapper>
          <Wizard {...defaultWizardProps}>
            <div>
              <h2>Form 1</h2>
              <FormInput.Text name="name" label="Name" />
            </div>
            <div>
              <h2>Form 2</h2>
            </div>
            <div>
              <h2>Form 3</h2>
            </div>
          </Wizard>
        </TestWrapper>
      )
      const tab1 = document.body.querySelector('[class*="bp3-tab-list"] [data-tab-id="Panel 1"]')
      const tab2 = document.body.querySelector('[class*="bp3-tab-list"] [data-tab-id="Panel 2"]')
      if (!tab1) {
        throw Error('No tab1 button')
      }
      if (!tab2) {
        throw Error('No tab2 button')
      }
      fireEvent.click(tab2)
      expect(queryByText(container, 'Form 2')).not.toBeNull()
      expect(queryByText(container, 'Form 1')).toBeNull()
      // touched panel with required fields shows warning on Tab change
      expect(document.body.querySelector('[icon="warning-sign"]')).not.toBeNull()
      fireEvent.click(tab1)
      const nameField = container.querySelector('[name="name"]')
      if (!nameField) {
        throw Error('cannot find name field')
      }
      fireEvent.change(nameField, { target: { value: 'test' } })
      //   warning sign goes away onChange
      // eslint-disable-next-line no-document-body-snapshot
      expect(document.body).toMatchSnapshot('look for warning')
    })

    test('Tab Change: Show warning after leaving touched panel with invalid value starting tab2', async () => {
      const defaultWizardProps = getDefaultProps()
      const { container } = render(
        <TestWrapper>
          <Wizard {...defaultWizardProps} defaultTabId={defaultWizardProps.wizardMap.panels[1].id}>
            <div>
              <h2>Form 1</h2>
              <FormInput.Text name="name" label="Name" />
            </div>
            <div>
              <h2>Form 2</h2>
              <FormInput.Text name="numberOnly" label="Number Only" />
            </div>
            <div>
              <h2>Form 3</h2>
            </div>
          </Wizard>
        </TestWrapper>
      )
      const tab2 = document.body.querySelector('[class*="bp3-tab-list"] [data-tab-id="Panel 2"]')
      const tab3 = document.body.querySelector('[class*="bp3-tab-list"] [data-tab-id="Panel 3"]')
      if (!tab3) {
        throw Error('No tab3 button')
      }
      if (!tab2) {
        throw Error('No tab2 button')
      }
      const numberOnly = container.querySelector('[name="numberOnly"]')
      if (!numberOnly) {
        throw Error('cannot find numberOnly field')
      }
      fireEvent.change(numberOnly, { target: { value: 'invalidNumber' } })
      //   todo: only show once field has been touched
      //   currently when leaving tab
      expect(document.body.querySelector('[icon="warning-sign"]')).toBeNull()

      fireEvent.click(tab3)
      await waitFor(() => queryByText(container, result.current.getString('submit')))
      const submitButton = container.querySelector('button[type="submit"]')
      if (!submitButton) {
        throw Error('no submit button')
      }
      fireEvent.click(submitButton)
      expect(queryByText(document.body, result.current.getString('addressErrorFields'))).not.toBeNull()
      expect(document.body.querySelectorAll('[icon="warning-sign"]')?.length).toEqual(2)
      fireEvent.click(tab2)
      await waitFor(() => expect(document.querySelector('[name="numberOnly"]')).toBeTruthy())
      const numberOnly2 = container.querySelector('[name="numberOnly"]')
      if (!numberOnly2) {
        throw Error('cannot find numberOnly field')
      }

      fireEvent.change(numberOnly2, { target: { value: '2000' } })

      const numOfWarningSigns = document.body.querySelectorAll('[icon="warning-sign"]')?.length
      await waitFor(() => expect(numOfWarningSigns).toEqual(2)) // 1 error strip, 1 wizard tab
    })

    test('Show error toaster message', async () => {
      const testError = 'test error'
      const defaultWizardProps = getDefaultProps()
      render(
        <TestWrapper>
          <Wizard {...defaultWizardProps} errorToasterMessage={testError}>
            <div>
              <h2>Form 1</h2>
              <FormInput.Text name="name" label="Name" />
            </div>
            <div>
              <h2>Form 2</h2>
            </div>
            <div>
              <h2>Form 3</h2>
            </div>
          </Wizard>
        </TestWrapper>
      )

      expect(queryByText(document.body, testError)).not.toBeNull()
    })

    test('Show error navigation confirm before leaving form', async () => {
      const defaultWizardProps = getDefaultProps()
      const { container } = render(
        <TestWrapper>
          <Wizard {...defaultWizardProps}>
            <div>
              <h2>Form 1</h2>
              <FormInput.Text name="name" label="Name" />
            </div>
            <div>
              <h2>Form 2</h2>
            </div>
            <div>
              <h2>Form 3</h2>
            </div>
          </Wizard>
          <Link
            className="redirect"
            to={routes.toTriggersPage({
              projectIdentifier: 'projectIdentifier',
              orgIdentifier: 'orgIdentifier',
              pipelineIdentifier: 'pipelineIdentifier',
              accountId: 'accountId',
              module: 'cd'
            })}
          >
            Redirect
          </Link>
        </TestWrapper>
      )
      const nameField = container.querySelector('[name="name"]')
      if (!nameField) {
        throw Error('cannot find name field')
      }
      fireEvent.change(nameField, { target: { value: 'test' } })
      const redirectButton = container.querySelector('[class*="redirect"]')
      if (!redirectButton) {
        throw Error('redirect button')
      }
      fireEvent.click(redirectButton)

      await waitFor(() => expect(document.body.querySelector('[class*="dialog"]')).not.toBeNull())
      expect(document.body.querySelector('[data-icon="warning-icon"]')).not.toBeNull()
    })
  })
})
