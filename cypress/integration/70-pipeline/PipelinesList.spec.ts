import { pipelinesListCallResponse } from '../../support/70-pipeline/constants'


describe('Pipelines list view', () => {

    const gitSyncEnabledCall =
        '/ng/api/git-sync/git-sync-enabled?accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
    const pipelinesListCall =
        '/pipeline/api/pipelines/list?routingId=accountId&accountIdentifier=accountId&projectIdentifier=project1&module=cd&orgIdentifier=default&searchTerm=&page=0&sort=lastUpdatedAt%2CDESC&size=20'

    const gitSyncMetaCall =
        '/ng/api/git-sync?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1'
    const gitSyncBranchCall =
        '/ng/api/git-sync-branch/listBranchesWithStatus?routingId=accountId&accountIdentifier=accountId&orgIdentifier=default&projectIdentifier=project1&yamlGitConfigIdentifier=&page=0&size=20&searchTerm='


    describe('GIT SYNC DISABLED', () => {
        beforeEach(() => {
            cy.on('uncaught:exception', () => {
                // returning false here prevents Cypress from
                // failing the test
                return false
            })
            cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: false })
            cy.intercept('POST', pipelinesListCall, pipelinesListCallResponse)
            cy.login('test', 'test')
            cy.visitPipelinesList()
        })

        it('check pipeline list view info', () => {

            cy.contains('p', 'Total: 3').should('be.visible')

            cy.contains('p', 'Parallel Pipelines').should('be.visible')
            cy.contains('p', 'Id: Parallel_Pipelines').should('be.visible')

            cy.contains('p', 'Stages').should('be.visible')
            cy.contains('p', 'Stage1').should('be.visible')
            cy.contains('p', '+6').should('be.visible')


            cy.contains('p', 'Services').should('be.visible')
            cy.contains('p', 'Normal Service').should('be.visible')

            cy.contains('p', 'ParallStage').should('be.visible')
            cy.contains('p', 'Id: ParallStage').should('be.visible')

            cy.contains('p', 'Stages').should('be.visible')
            cy.contains('p', 'Stage 5').should('be.visible')
            cy.contains('p', '+5').should('be.visible')

            cy.contains('p', 'Build Repo').should('be.visible')
            cy.contains('p', 'CCD').should('be.visible')




            cy.contains('p', 'Services').should('be.visible')
            cy.contains('p', 'Newdds').should('be.visible')
            cy.contains('p', '+5').should('be.visible')


            cy.get('[data-icon="more"]').should('be.visible')
            cy.get('[data-icon="more"]').first().click()

            cy.contains('div', 'Run').should('be.visible')
            cy.contains('div', 'Launch Studio').should('be.visible')
            cy.contains('div', 'View Executions').should('be.visible')
            cy.contains('div', 'Delete').should('be.visible')


            cy.get('[data-icon="list"]').click()

            cy.contains('p', 'PIPELINE').should('be.visible')
            cy.contains('div', 'ACTIVITY').should('be.visible')
            cy.contains('p', 'LAST RUN').should('be.visible')
            cy.contains('p', 'RUN').should('be.visible')
        })
    })

    describe('GIT SYNC ENABLED', () => {
        beforeEach(() => {
            cy.on('uncaught:exception', () => {
                // returning false here prevents Cypress from
                // failing the test
                return false
            })
            cy.intercept('GET', gitSyncEnabledCall, { connectivityMode: null, gitSyncEnabled: true })
            cy.intercept('POST', pipelinesListCall, pipelinesListCallResponse)

            cy.intercept('GET', gitSyncMetaCall, { fixture: 'ng/api/git-sync' })
            cy.intercept('GET', gitSyncBranchCall, { fixture: 'ng/api/git-sync-branches' })
            cy.login('test', 'test')
            cy.visitPipelinesList()
        })

        it('check pipeline list view info', () => {

            cy.contains('p', 'INVALID').should('be.visible')
            cy.get('[data-icon="main-tags"]').should('be.visible')

            cy.contains('p', 'Git Repo').should('be.visible')
            cy.contains('p', 'Branch').should('be.visible')

            cy.get('[data-icon="repository"]').should('be.visible')
            cy.contains('p', 'Git Sync Cypress').should('be.visible')

            cy.get('[data-icon="git-new-branch"]').should('be.visible')
            cy.contains('p', 'main').should('be.visible')
        })
    })
})