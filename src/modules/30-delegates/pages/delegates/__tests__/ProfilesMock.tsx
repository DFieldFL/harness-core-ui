import moment from 'moment'
export default {
  metadata: '',
  resource: {
    response: [
      {
        identifier: 'ident_1',
        accountId: 'TEST_ACCOUNTID',
        uuid: 'profile1',
        name: 'Primary',
        description: 'The primary profile for the account',
        primary: true,
        approvalRequired: true,
        startupScript: 'test this',
        createdBy: {
          uuid: 'person1',
          name: 'Admin',
          email: 'adm@harn.io'
        },
        lastUpdatedBy: {
          uuid: 'person1',
          name: 'Admin',
          email: 'adm@harn.io'
        },
        lastUpdatedAt: moment(),
        scopingRules: []
      },
      {
        identifier: 'ident_2',
        accountId: 'TEST_ACCOUNTID',
        uuid: 'profile2',
        name: 'profile 2',
        description: 'The profile for the account',
        primary: false,
        approvalRequired: true,
        startupScript: 'test this',
        createdBy: {
          uuid: 'person1',
          name: 'Admin',
          email: 'adm@harn.io'
        },
        lastUpdatedBy: {
          uuid: 'person1',
          name: 'Admin',
          email: 'adm@harn.io'
        },
        lastUpdatedAt: moment(),
        scopingRules: []
      }
    ]
  }
}
