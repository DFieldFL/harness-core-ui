import {
  getUserJourneysCall,
  listMonitoredServices,
  listMonitoredServicesCallResponse,
  listSLOsCall,
  listUserJourneysCallResponse,
  updatedListSLOsCallResponse,
  getServiceLevelObjectivesRiskCount,
  getMonitoredService,
  listSLOsCallResponse,
  deleteSLOData
} from '../../../support/85-cv/slos/constants'

describe('CVSLOsListingPage', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', () => false)
    cy.login('test', 'test')
    cy.visitChangeIntelligence()
  })

  it('it should ensure SLO card features are working fine', () => {
    cy.intercept('GET', getUserJourneysCall, listUserJourneysCallResponse)
    cy.intercept('GET', listMonitoredServices, listMonitoredServicesCallResponse)
    cy.intercept('GET', getServiceLevelObjectivesRiskCount, { fixture: 'cv/slo/getSLORiskCount' })
    cy.intercept('GET', listSLOsCall, updatedListSLOsCallResponse)
    cy.intercept('GET', getMonitoredService, { fixture: 'cv/slo/getMonitoredService' })

    cy.contains('p', 'SLOs').click()

    cy.contains('p', 'cvng_prod').should('be.visible')
    cy.contains('p', 'Latency').should('be.visible')
    cy.contains('p', 'appd_cvng_prod').should('be.visible')
    cy.contains('p', 'Rolling').should('be.visible')
    cy.contains('p', '7 days').should('be.visible')
    cy.contains('h2', '138.44%').should('be.visible')
    cy.contains('h2', '6').should('be.visible')

    cy.contains('h2', '99.00%').should('be.visible')
    cy.contains('h2', '100.00%').should('be.visible')
    cy.contains('span', '99%').should('be.visible')

    cy.contains('div', 'Error Budget').click()

    cy.contains('span', '100.00%').should('be.visible')
    cy.contains('text', '104').should('be.visible')
    cy.contains('p', '104').should('be.visible')

    cy.contains('p', 'prod').click()

    cy.contains('div', 'Service Health').should('be.visible')
    cy.contains('p', 'SLOs').click()
    cy.contains('h2', 'SLO-1').should('be.visible')

    cy.get('[data-icon="Options"]').click()
    cy.get('[icon="trash"]').click()

    cy.contains('p', 'Delete SLO-1?').should('be.visible')
    cy.contains('p', 'Are you sure you want to delete SLO: SLO-1?').should('be.visible')

    cy.intercept('DELETE', deleteSLOData, { statusCode: 200 }).as('deleteSLOData')
    cy.intercept('GET', listSLOsCall, listSLOsCallResponse)
    cy.intercept('GET', getServiceLevelObjectivesRiskCount, { fixture: 'cv/slo/getSLORiskCountAfterDelete' })

    cy.contains('span', 'Delete').click({ force: true })
    cy.wait('@deleteSLOData')

    cy.contains('span', 'SLO-1 successfully deleted').should('be.visible')
  })
})
