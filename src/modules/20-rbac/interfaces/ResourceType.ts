export type ResourceGroup = Record<string, string>
export type ResourceGroupSelection = Record<string, boolean>
export enum ResourceType {
  ACCOUNT = 'ACCOUNT',
  ORGANIZATION = 'ORGANIZATION',
  PROJECT = 'PROJECT',
  SECRET = 'SECRET',
  CONNECTOR = 'CONNECTOR',
  PIPELINE = 'PIPELINE',
  SERVICE = 'SERVICE',
  ENVIRONMENT = 'ENVIRONMENT',
  USER = 'USER',
  USERGROUP = 'USERGROUP',
  ROLE = 'ROLE',
  RESOURCEGROUP = 'RESOURCEGROUP',
  AUTHSETTING = 'AUTHSETTING'
}

export enum ResourceCategory {
  SHARED_RESOURCES = 'SHARED_RESOURCES',
  ADMINSTRATIVE_FUNCTIONS = 'ADMINSTRATIVE_FUNCTIONS'
}
