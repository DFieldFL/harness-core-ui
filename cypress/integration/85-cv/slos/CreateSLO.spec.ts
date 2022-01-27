/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import {
  getSLOMetrics,
  getUserJourneysCall,
  listMonitoredServices,
  listMonitoredServicesCallResponse,
  listSLOMetricsCallResponse,
  listSLOsCall,
  listSLOsCallResponse,
  listUserJourneysCallResponse,
  updatedListSLOsCallResponse,
  getServiceLevelObjective,
  getServiceLevelObjectivesRiskCount,
  saveSLO
} from '../../../support/85-cv/slos/constants'

describe('Create SLO', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => {
      // returning false here prevents Cypress from
      // failing the test
      return false
    })
    cy.login('test', 'test')

    cy.visitChangeIntelligence()
  })

  it('should be able to create SLO by filling all the details.', () => {
    cy.intercept('GET', listSLOsCall, listSLOsCallResponse)
    cy.intercept('GET', getUserJourneysCall, listUserJourneysCallResponse)
    cy.intercept('GET', listMonitoredServices, listMonitoredServicesCallResponse)
    cy.intercept('GET', getSLOMetrics, listSLOMetricsCallResponse)

    // Verifying NO SLOs state.
    cy.contains('p', 'SLOs').click()
    cy.contains('p', 'No SLOs Present.').should('be.visible')

    cy.contains('span', 'New SLO').click()

    // Filling details Under Name tab for SLO creation
    cy.fillName('SLO-1')
    cy.get('input[placeholder="Select or create user journey"]').click()
    cy.contains('p', 'new-one').click({ force: true })

    cy.wait(2000)
    cy.contains('span', 'Continue').click({ force: true })

    // selecting monitored service
    cy.get('input[placeholder="- Select Monitored Service -"]').click()
    cy.contains('p', 'cvng_prod').click({ force: true })

    // selecting health source
    cy.get('input[placeholder="- Select Health Source -"]').click()
    cy.contains('p', 'appd_cvng_prod').click({ force: true })

    // selecting event type
    cy.get('input[name="eventType"]').click()
    cy.contains('p', 'Bad').click({ force: true })

    // selecting Metric for Good requests
    cy.get('input[name="goodRequestMetric"]').click()
    cy.contains('p', 'number_of_slow_calls').click({ force: true })

    cy.wait(1000)

    // selecting Metric for Good requests
    cy.get('input[name="validRequestMetric"]').click()
    cy.contains('p', 'https_errors_per_min').click({ force: true })

    // Filling objective value
    cy.get('input[name="objectiveValue"]').type('2')

    // selecting condition for SLI value
    cy.get('input[name="objectiveComparator"]').click({ force: true })
    cy.contains('p', '<').click({ force: true })

    cy.wait(2000)
    cy.contains('span', 'Continue').click({ force: true })

    // selecting condition for SLI value
    cy.get('input[name="periodLength"]').click()
    cy.contains('p', '7').click({ force: true })

    cy.intercept('POST', saveSLO, { statusCode: 200 }).as('saveSLO')
    cy.intercept('GET', listSLOsCall, updatedListSLOsCallResponse).as('updatedListSLOsCallResponse')

    cy.contains('span', 'Save').click({ force: true })
    cy.wait('@saveSLO')

    cy.contains('span', 'SLO created successfully').should('be.visible')

    cy.wait('@updatedListSLOsCallResponse')

    cy.contains('p', 'cvng_prod').should('be.visible')
    cy.contains('p', 'Latency').should('be.visible')
    cy.contains('p', 'appd_cvng_prod').should('be.visible')
    cy.contains('p', 'Rolling').should('be.visible')
    cy.contains('p', '7 days').should('be.visible')
  })

  it.skip('should render all the edit steps and update the SLO', () => {
    cy.intercept('GET', listSLOsCall, updatedListSLOsCallResponse)
    cy.intercept('GET', getUserJourneysCall, listUserJourneysCallResponse)
    cy.intercept('GET', getServiceLevelObjectivesRiskCount, { fixture: 'cv/slo/getSLORiskCount' })
    cy.intercept('GET', listMonitoredServices, listMonitoredServicesCallResponse)
    cy.intercept('GET', getSLOMetrics, listSLOMetricsCallResponse)
    cy.intercept('GET', getServiceLevelObjective, { fixture: 'cv/slo/getServiceLevelObjective' })

    cy.contains('p', 'SLOs').click()
    cy.get('[data-icon="Options"]').click()
    cy.get('[icon="edit"]').click()

    cy.contains('Edit SLO: SLO-1').should('be.visible')

    cy.get('input[name="name"]').should('have.value', 'SLO-1')
    cy.get('input[name="User Journey"]').should('have.value', 'new-one')

    cy.contains('span', 'Continue').click()
    cy.contains('h2', 'Configure SLI queries').should('be.visible')

    cy.get('input[name="monitoredServiceRef"]').should('have.value', 'cvng_prod')
    cy.get('input[name="healthSourceRef"]').should('have.value', 'appd_cvng_prod')
    cy.get('input[name="SLIType"][value="Latency"]').should('be.checked')
    cy.get('input[name="SLIMetricType"][value="Ratio"]').should('be.checked')
    cy.get('input[name="eventType"]').should('have.value', 'Good')
    cy.get('input[name="goodRequestMetric"]').should('have.value', 'number_of_slow_calls')
    cy.get('input[name="validRequestMetric"]').should('have.value', 'https_errors_per_min')
    cy.get('input[name="objectiveValue"]').should('have.value', '20')
    cy.get('input[name="objectiveComparator"]').should('have.value', '<=')
    cy.get('input[name="objectiveComparator"]').should('have.value', '<=')
    cy.get('input[name="SLIMissingDataType"]').should('have.value', 'Good')

    cy.contains('span', 'Continue').click()
    cy.contains('h2', 'Set the SLO time window and target').should('be.visible')

    cy.get('input[name="periodType"]').should('have.value', 'Rolling')
    cy.get('input[name="periodLength"]').should('have.value', '30')
    cy.get('input[name="SLOTargetPercentage"]').should('have.value', '90')

    cy.fillField('SLOTargetPercentage', '95')

    cy.contains('span', 'Save').click()

    cy.contains('h2', 'Review changes').should('be.visible')

    cy.contains('span', 'OK').click()

    cy.intercept('GET', listSLOsCall, { fixture: 'cv/slo/getSLODashboardWidgetsAfterEdit' })

    cy.contains('span', 'SLO updated successfully').should('be.visible')
    cy.contains('p', 'SLO recalculation in progress').should('be.visible')
  })

  it.skip('should validate all form field errors and default values', () => {
    cy.intercept('GET', getUserJourneysCall, listUserJourneysCallResponse)
    cy.intercept('GET', listMonitoredServices, listMonitoredServicesCallResponse)
    cy.intercept('GET', getSLOMetrics, listSLOMetricsCallResponse)

    cy.contains('p', 'SLOs').click()
    cy.contains('span', 'New SLO').click()

    cy.contains('h2', 'Create SLO').should('be.visible')

    cy.contains('span', 'Continue').click()

    cy.contains('span', 'SLO name is required').should('be.visible')
    cy.fillName('SLO-1')
    cy.contains('span', 'SLO name is required').should('not.exist')

    cy.contains('span', 'User journey is required').should('be.visible')
    cy.get('input[name="User Journey"]').click()
    cy.contains('p', 'new-one').click({ force: true })
    cy.contains('span', 'User journey is required').should('not.exist')

    cy.contains('span', 'Continue').click()
    cy.contains('span', 'Continue').click()

    cy.contains('h2', 'Configure SLI queries').scrollIntoView()

    cy.contains('span', 'Monitored Service is required').should('be.visible')
    cy.get('input[name="healthSourceRef"]').should('be.disabled')
    cy.get('input[name="goodRequestMetric"]').should('be.disabled')
    cy.get('input[name="validRequestMetric"]').should('be.disabled')
    cy.get('input[name="monitoredServiceRef"]').click()
    cy.contains('p', 'cvng_prod').click({ force: true })
    cy.contains('span', 'Monitored Service is required').should('not.exist')
    cy.get('input[name="healthSourceRef"]').should('be.enabled')

    cy.contains('span', 'Health Source is required').should('be.visible')
    cy.get('input[name="goodRequestMetric"]').should('be.disabled')
    cy.get('input[name="validRequestMetric"]').should('be.disabled')
    cy.get('input[name="healthSourceRef"]').click()
    cy.contains('p', 'appd_cvng_prod').click({ force: true })
    cy.contains('span', 'Health Source is required').should('not.exist')
    cy.get('input[name="goodRequestMetric"]').should('be.enabled')
    cy.get('input[name="validRequestMetric"]').should('be.enabled')

    cy.get('input[name="SLIType"][value="Latency"]').should('be.checked')

    cy.contains('h2', 'Pick metrics powering the SLI').scrollIntoView()

    cy.get('input[name="SLIMetricType"][value="Ratio"]').should('be.checked')

    cy.contains('Threshold based').click()

    cy.get('input[name="SLIMetricType"][value="Threshold"]').should('be.checked')
    cy.contains('Event type').should('not.exist')
    cy.contains('Metric for good requests').should('not.exist')

    cy.contains('p', 'Please fill the required fields to see the SLI data').should('be.visible')
    cy.get('input[name="validRequestMetric"]').click()
    cy.contains('p', 'number_of_slow_calls').click({ force: true })
    cy.findAllByText('Metric is required').should('have.length', 0)

    cy.contains('p', 'Please fill the required fields to see the SLI data').should('be.visible')
    cy.findAllByText('Required').should('have.length', 2)
    cy.fillField('objectiveValue', '-200')
    cy.findAllByText('Required').should('have.length', 1)

    cy.contains('p', 'Please fill the required fields to see the SLI data').should('be.visible')
    cy.contains('span', 'Min value 0').should('be.visible')
    cy.fillField('objectiveValue', '200')
    cy.contains('span', 'Min value 0').should('not.exist')

    cy.contains('p', 'Please fill the required fields to see the SLI data').should('be.visible')
    cy.get('input[name="objectiveComparator"]').click({ force: true })
    cy.contains('p', 'than objective value').should('be.visible')
    cy.contains('p', '<=').click({ force: true })
    cy.contains('p', 'to objective value').should('be.visible')
    cy.findAllByText('Required').should('have.length', 0)

    cy.get('input[name="SLIMissingDataType"]').should('have.value', 'Good')

    cy.contains('p', 'Please fill the required fields to see the SLI data').should('not.exist')
    cy.get('[data-icon="steps-spinner"]').should('be.visible')

    cy.contains('span', 'Continue').click()

    cy.contains('h2', 'Set the SLO time window and target').should('be.visible')

    cy.contains('span', 'Back').click()

    cy.contains('Ratio based').click()
    cy.get('input[name="SLIMetricType"][value="Ratio"]').should('be.checked')

    cy.contains('p', 'Please fill the required fields to see the SLI data').should('be.visible')
    cy.findAllByText('Required').should('have.length', 1)
    cy.get('input[name="eventType"]').click()
    cy.contains('p', 'Good').click({ force: true })

    cy.contains('p', 'Please fill the required fields to see the SLI data').should('be.visible')
    cy.findAllByText('Metric is required').should('have.length', 1)
    cy.get('input[name="goodRequestMetric"]').click()
    cy.contains('p', 'number_of_slow_calls').click({ force: true })
    cy.findAllByText('Metric is required').should('have.length', 0)

    cy.contains('p', 'Please fill the required fields to see the SLI data').should('be.visible')
    cy.contains('span', 'Metric for good and valid requests should be different').should('be.visible')
    cy.get('input[name="validRequestMetric"]').click()
    cy.contains('p', 'https_errors_per_min').click({ force: true })
    cy.contains('span', 'Metric for good and valid requests should be different').should('not.exist')

    cy.contains('p', 'Please fill the required fields to see the SLI data').should('be.visible')
    cy.contains('span', 'Max value 100').should('be.visible')
    cy.fillField('objectiveValue', '-20')
    cy.contains('span', 'Max value 100').should('not.exist')

    cy.contains('p', 'Please fill the required fields to see the SLI data').should('be.visible')
    cy.contains('span', 'Min value 0').should('be.visible')
    cy.fillField('objectiveValue', '20')
    cy.contains('span', 'Min value 0').should('not.exist')

    cy.contains('p', 'Please fill the required fields to see the SLI data').should('not.exist')
    cy.get('[data-icon="steps-spinner"]').should('be.visible')

    cy.contains('span', 'Continue').click()
    cy.contains('span', 'Save').click()

    cy.get('input[name="periodType"]').should('have.value', 'Rolling')
    cy.get('input[name="SLOTargetPercentage"]').should('have.value', '99')

    cy.contains('span', 'Period Length is required').should('be.visible')
    cy.get('input[name="periodLength"]').click()
    cy.contains('p', '7').click({ force: true })
    cy.contains('span', 'Period Length is required').should('not.exist')
    cy.contains('h1', '101').should('be.visible')

    cy.get('input[name="periodType"]').click()
    cy.contains('p', 'Calendar').click({ force: true })
    cy.contains('span', 'Period Length is required').should('be.visible')
    cy.get('input[name="periodLengthType"]').click()
    cy.contains('p', 'Weekly').click({ force: true })
    cy.contains('span', 'Period Length is required').should('not.exist')
    cy.contains('h1', '101').should('be.visible')
    cy.contains('span', 'Windows End is required').should('be.visible')
    cy.get('input[name="dayOfWeek"]').click()
    cy.contains('p', 'Monday').click({ force: true })
    cy.contains('span', 'Windows End is required').should('not.exist')
    cy.get('input[name="periodLengthType"]').click()
    cy.contains('p', 'Monthly').click({ force: true })
    cy.contains('h1', '432').should('be.visible')
    cy.contains('span', 'Windows End is required').should('be.visible')
    cy.get('input[name="dayOfMonth"]').click()
    cy.contains('p', '7').click({ force: true })
    cy.contains('span', 'Windows End is required').should('not.exist')
    cy.get('input[name="periodLengthType"]').click()
    cy.contains('p', 'Quarterly').click({ force: true })
    cy.contains('h1', '1296').should('be.visible')
    cy.contains('span', 'Window Ends').should('not.exist')

    cy.get('input[name="SLOTargetPercentage"]').clear()
    cy.contains('Required').should('be.visible')
    cy.fillField('SLOTargetPercentage', '90')
    cy.contains('Required').should('not.exist')
    cy.contains('h1', '12960').should('be.visible')

    cy.contains('span', 'Save').click()
    cy.intercept('GET', listSLOsCall, updatedListSLOsCallResponse)
    cy.intercept('GET', getServiceLevelObjectivesRiskCount, { fixture: 'cv/slo/getSLORiskCount' })

    cy.contains('span', 'SLO created successfully').should('be.visible')
  })
})
