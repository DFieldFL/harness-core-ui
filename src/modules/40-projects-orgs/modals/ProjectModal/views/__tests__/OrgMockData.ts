export const orgMockData = {
  data: {
    status: 'SUCCESS',
    data: {
      pageCount: 1,
      itemCount: 2,
      pageSize: 50,
      content: [
        {
          accountIdentifier: 'testAcc',
          identifier: 'testOrg',
          name: 'Org Name',
          description: 'Description',
          tags: { tag1: '', tag2: 'tag3' }
        },
        {
          accountIdentifier: 'testAcc',
          identifier: 'default',
          name: 'default',
          description: 'default',
          tags: { tag1: '', tag2: 'tag3' }
        }
      ],
      pageIndex: 0,
      empty: false
    },
    metaData: undefined,
    correlationId: 'f932d48d-e486-4481-9348-c8ded750d2c3'
  },
  loading: false
}
