export default {
  placeholder: {
    name: 'Organization Name',
    description: 'Description'
  },
  numberOfProjects: '-',
  projects: 'projects',
  orgMembers: 'Org Members',
  edit: 'Edit',
  clone: 'Clone',
  delete: 'Delete',
  confirmDelete: (name: string) => `Are you sure you want to delete the Organization '${name}'?`,
  confirmDeleteTitle: 'Delete Organization',
  cancelButton: 'Cancel',
  successMessage: (name: string) => `Organization ${name} is deleted`
}
