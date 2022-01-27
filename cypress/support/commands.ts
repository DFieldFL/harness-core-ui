/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
import '@testing-library/cypress/add-commands'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    /* eslint-disable @typescript-eslint/no-unused-vars  */
    interface Chainable<Subject> {
      login(username: string, pass: string): void
      visitCreatePipeline(): void
      visitChangeIntelligence(): void
      fillName(name: string): void
      clickSubmit(): void
      fillField(fieldName: string, value: string): void
    }
  }
}

Cypress.Commands.add('clickSubmit', () => {
  cy.get('[type="submit"]').click()
})

Cypress.Commands.add('fillField', (fieldName: string, value: string) => {
  cy.get(`[name="${fieldName}"]`).clear().type(value)
})

Cypress.Commands.add('login', (emailValue: string, password: string) => {
  cy.visit('#/login')
  cy.get('[data-id="email-0"] input').clear().type(emailValue)
  cy.get('[data-id="password-1"] input').clear().type(password)
  cy.clickSubmit()
})

Cypress.Commands.add('visitCreatePipeline', () => {
  cy.contains('p', 'Projects').click()
  cy.contains('p', 'Project 1').click()
  cy.contains('p', 'Delivery').click()
  cy.contains('p', 'Pipelines').click()
  cy.contains('span', 'Create a Pipeline').click()
})

Cypress.Commands.add('fillName', (value: string) => {
  cy.fillField('name', value)
})

// Change Intelligence commands
Cypress.Commands.add('visitChangeIntelligence', () => {
  cy.contains('span', 'Change Intelligence').click()
  cy.contains('p', 'Select a Project').click()
  cy.contains('p', 'Project 1').click()
})
