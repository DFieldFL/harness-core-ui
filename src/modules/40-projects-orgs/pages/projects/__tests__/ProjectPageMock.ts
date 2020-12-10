import type { Project, ResponseProjectAggregateDTO } from 'services/cd-ng'

export const projectPageMock = {
  data: {
    status: 'SUCCESS',
    data: {
      pageCount: 1,
      itemCount: 6,
      pageSize: 50,
      content: [
        {
          projectResponse: {
            project: {
              accountIdentifier: 'testAcc',
              orgIdentifier: 'testOrg',
              identifier: 'test',
              name: 'test',
              color: '#e6b800',
              modules: ['CD'],
              description: 'test',
              tags: { tag1: '', tag2: 'tag3' }
            },
            createdAt: null,
            lastModifiedAt: 1606799067248
          }
        },

        {
          projectResponse: {
            project: {
              accountIdentifier: 'testAcc',
              orgIdentifier: 'Cisco_Meraki',
              identifier: 'Online_Banking',
              name: 'Online Banking',
              color: '#1c1c28',
              modules: ['CD', 'CV'],
              description: 'UI for the Payment',
              tags: { tag1: '', tag2: 'tag3' }
            },
            createdAt: null,
            lastModifiedAt: 1606799067248
          }
        },
        {
          projectResponse: {
            project: {
              accountIdentifier: 'testAcc',
              orgIdentifier: 'Cisco_Meraki',
              identifier: 'Portal',
              name: 'Portal',
              color: '#ff8800',
              modules: ['CV'],
              description: 'Online users',
              tags: { tag1: '', tag2: 'tag3' }
            },
            createdAt: null,
            lastModifiedAt: 1606799067248
          }
        },
        {
          projectResponse: {
            project: {
              accountIdentifier: 'testAcc',
              orgIdentifier: 'Cisco_Prime',
              identifier: 'Project_1',
              name: 'Project 1',
              color: '#e6b800',
              modules: [],
              description: '',
              tags: {}
            },
            createdAt: null,
            lastModifiedAt: 1606799067248
          }
        },
        {
          projectResponse: {
            project: {
              accountIdentifier: 'testAcc',
              orgIdentifier: 'Cisco_Prime',
              identifier: 'Project_Demo',
              name: 'Project Demo',
              color: '#004fc4',
              modules: [],
              description: 'Demo project',
              tags: { tag1: '', tag2: 'tag3' }
            },
            createdAt: null,
            lastModifiedAt: 1606799067248
          }
        },
        {
          projectResponse: {
            project: {
              accountIdentifier: 'testAcc',
              orgIdentifier: 'Harness',
              identifier: 'Drone_Data_Supplier',
              name: 'Drone Data Supplier',
              color: '#e67a00',
              modules: ['CD', 'CV', 'CI', 'CE', 'CF'],
              description: 'Drone',
              tags: { tag1: '', tag2: 'tag3' }
            },
            createdAt: null,
            lastModifiedAt: 1606799067248
          }
        },
        {
          projectResponse: {
            project: {
              accountIdentifier: 'testAcc',
              orgIdentifier: 'Harness',
              identifier: 'Swagger',
              name: 'Swagger',
              color: '#e6b800',
              modules: ['CI'],
              description: 'Swagger 2.0',
              tags: { tag1: '', tag2: 'tag3' }
            },
            createdAt: null,
            lastModifiedAt: 1606799067248
          }
        }
      ],
      pageIndex: 0,
      empty: false
    },
    metaData: undefined,
    correlationId: '370210dc-a345-42fa-b3cf-69bd64eb5073'
  },
  loading: false
}

export const projectMockData = {
  data: {
    status: 'SUCCESS',
    data: {
      project: {
        accountIdentifier: 'testAcc',
        orgIdentifier: 'testOrg',
        identifier: 'test',
        name: 'test',
        color: '#e6b800',
        modules: [],
        description: 'test',
        tags: { tag1: '', tag2: 'tag3' }
      }
    },
    metaData: undefined,
    correlationId: '88124a30-e021-4890-8466-c2345e1d42d6'
  },
  loading: false
}

export const projectMockDataWithModules = {
  data: {
    status: 'SUCCESS',
    data: {
      project: {
        accountIdentifier: 'testAcc',
        orgIdentifier: 'testOrg',
        identifier: 'test',
        name: 'test',
        color: '#e6b800',
        modules: ['CD', 'CV', 'CI', 'CE', 'CF'],
        description: 'test',
        tags: { tag1: '', tag2: 'tag3' }
      }
    },
    metaData: undefined,
    correlationId: '88124a30-e021-4890-8466-c2345e1d42d6'
  },
  loading: false
}

export const OrgMockData = {
  data: {
    status: 'SUCCESS',
    data: {
      organization: {
        accountIdentifier: 'testAcc',
        identifier: 'testOrg',
        name: 'Org Name',
        description: 'Description',
        tags: { tag1: '', tag2: 'tag3' }
      }
    },
    metaData: undefined,
    correlationId: '9f77f74d-c4ab-44a2-bfea-b4545c6a4a39'
  }
}

export const createMockData = {
  mutate: async () => {
    return {
      status: 'SUCCESS',
      data: {
        project: {
          accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
          orgIdentifier: 'testOrg',
          identifier: 'dummy_name',
          name: 'dummy name',
          color: '#0063F7',
          modules: [],
          description: '',
          tags: {}
        }
      },
      metaData: undefined,
      correlationId: '375d39b4-3552-42a2-a4e3-e6b9b7e51d44'
    }
  },
  loading: false
}

export const projectWithModules: Project = {
  accountIdentifier: 'testAcc',
  orgIdentifier: 'testOrg',
  identifier: 'test',
  name: 'test',
  color: '#e6b800',
  modules: ['CD', 'CV', 'CI', 'CE', 'CF'],
  description: 'test',
  tags: { tag1: '', tag2: 'tag3' }
}

export const responseProjectAggregateDTO: ResponseProjectAggregateDTO = {
  status: 'SUCCESS',
  data: {
    projectResponse: {
      project: {
        accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'testOrg',
        identifier: 'dummy_name',
        name: 'dummy name',
        color: '#0063F7',
        modules: ['CD', 'CV', 'CI', 'CE', 'CF'],
        description: '',
        tags: { tag1: '', tag2: 'tag3', tag4: 'tag3', tag5: 'tag3', tag6: 'tag3' }
      }
    },
    organization: {
      accountIdentifier: 'testAcc',
      identifier: 'testOrg',
      name: 'Org Name',
      description: 'Description',
      tags: { tag1: '', tag2: 'tag3', tag4: 'tag3', tag5: 'tag3', tag6: 'tag3' }
    },
    admins: [{ name: 'example1', email: 'example1@email.com', uuid: '19bYA-ooQZOTZQxf2N-VPA' }],
    collaborators: [
      { name: 'example2', email: 'example2@email.com', uuid: 'BnTbQTIJS4SkadzYv0BcbA' },
      { name: 'example3', email: 'example3@email.com', uuid: 'nhLgdGgxS_iqa0KP5edC-w' },
      { name: 'example4', email: 'example4@email.com', uuid: 'ZqXNvYmURnO46PX7HwgEtQ' },
      { name: 'example5', email: 'example5@email.com', uuid: '0osgWsTZRsSZ8RWfjLRkEg' },
      { name: 'example6', email: 'example6@email.com', uuid: 'lv0euRhKRCyiXWzS7pOg6g' }
    ]
  },
  metaData: undefined,
  correlationId: '375d39b4-3552-42a2-a4e3-e6b9b7e51d44'
}

export const responseProjectAggregateDTOWithNoModules: ResponseProjectAggregateDTO = {
  status: 'SUCCESS',
  data: {
    projectResponse: {
      project: {
        accountIdentifier: 'kmpySmUISimoRrJL6NL73w',
        orgIdentifier: 'testOrg',
        identifier: 'dummy_name',
        name: 'dummy name',
        color: '#0063F7',
        modules: [],
        description: '',
        tags: {}
      }
    },
    organization: {
      accountIdentifier: 'testAcc',
      identifier: 'testOrg',
      name: 'Org Name',
      description: 'Description',
      tags: { tag1: '', tag2: 'tag3', tag4: 'tag3', tag5: 'tag3', tag6: 'tag3' }
    },
    admins: [{ name: 'example1', email: 'example1@email.com', uuid: '19bYA-ooQZOTZQxf2N-VPA' }],
    collaborators: [
      { name: 'example2', email: 'example2@email.com', uuid: 'BnTbQTIJS4SkadzYv0BcbA' },
      { name: 'example3', email: 'example3@email.com', uuid: 'nhLgdGgxS_iqa0KP5edC-w' },
      { name: 'example4', email: 'example4@email.com', uuid: 'ZqXNvYmURnO46PX7HwgEtQ' },
      { name: 'example5', email: 'example5@email.com', uuid: '0osgWsTZRsSZ8RWfjLRkEg' },
      { name: 'example6', email: 'example6@email.com', uuid: 'lv0euRhKRCyiXWzS7pOg6g' }
    ]
  },
  metaData: undefined,
  correlationId: '375d39b4-3552-42a2-a4e3-e6b9b7e51d44'
}
