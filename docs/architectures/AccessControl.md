# Access Control

There are two distinct parts of the access-control framework: Configuration and Consumption.

**Configuration**: The part where you configure users, user-groups, roles, permissions and resource-groups.

**Consumption**: The part where you query/check if the current user can perform a certain action on a resource.

## Configuration

The Configuration framework built using the _registration_ pattern. Since each resource type (eg. Secret, Project, Pipeline, Connector etc.) will have their own permissions, UI and service calls, the framework is unaware of these details.

Developers from different teams will need to register their resources with the RBAC Factory.

- This registration of resource is required to support adding your resources to resource groups.
- This registration is done at a [module](https://github.com/wings-software/nextgenui/blob/master/src/modules/README.md) level.
- These resources are grouped into a category and those categories are registered at [rbac](https://github.com/wings-software/nextgenui/blob/master/src/modules/20-rbac/RouteDestinations.tsx).

Example of a resource registration:

```typescript
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'


RbacFactory.registerResourceTypeHandler(ResourceType.ORGANIZATION, {
  icon: 'nav-org',
  label: 'Organizations',
  permissionLabels: {
    [PermissionIdentifier.UPDATE_ORG]: 'Create / Edit'
  }
  category: ResourceCategory.ADMINSTRATIVE_FUNCTIONS,
  addResourceModalBody: props => <AddOrganizationResourceModalBody {...props} />
})
```

Example of a resource category registration:

```typescript
RbacFactory.registerResourceCategory(ResourceCategory.ADMINSTRATIVE_FUNCTIONS, {
  icon: 'settings',
  label: <String stringID="adminFunctions" />
})
```

The `RbacFactory` maintains a map of `ResourceType` enum to `ResourceHandler` interface implementations along with a map from `ResourceCategory` to `ResourceCategoryHandler`. A ResourceCategory is used for grouping of resources that belong to the same category for eg. secrets, connectors are part of Project Resources. A resource can either be put into a category or it could be standalone, in the later case we treat it as it's own category and no other explicit registration is required to make it a category. The map returned from Rbac Factory is used by the access-control UI to render the corresponding features. For eg. the icon and label are used to render the resources list in the Resource Group Details page.

Similarly, for all resource types, we need the capability to select individual resources for a resource group. This is done by delegating the UI via the `addResourceModalBody` prop. This allows teams to render their own UI within the modal, while the overall access-control interface still remains consistent.

`ResourceHandler` and `ResourceCategoryHandler` interfaces are implemented as follows (as of March 2021):

```typescript
export interface ResourceHandler {
  icon: IconName
  label: string | React.ReactElement
  permissionLabels?: {
    [key in PermissionIdentifier]?: string | React.ReactElement
  }
  addResourceModalBody?: (props: RbacResourceModalProps) => React.ReactElement
  category?: ResourceCategory
}
```

```typescript
export interface ResourceCategoryHandler {
  icon: IconName
  label: string | React.ReactElement
  resourceTypes?: Set<ResourceType>
}
```

> **Note** If you are adding a new permission itself, you need to register it in the `PermissionIdentifier` enum in `src/modules/20-rbac/interfaces/PermissionIdentifier.ts`. This enum maintains the list of all valid permissions in the system to keep access-control type-safe.

## Consumption

Also known as the _Decision Framework_.

Querying for permissions from the backend involves multiple steps, but it has been abstracted out as a simple hook. The usage is as follows:

```typescript
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import usePermission from '@rbac/hooks/usePermission'

const SampleComponent = () => {
  const [canEdit, canDelete] = usePermission(
    {
      // Scope variables for account, org and project
      resourceScope: {
        accountIdentifier,
        orgIdentifier,
        projectIdentifier
      }
      // Identify the resource you want to check permission for
      resource: {
        resourceType,
        resourceIdentifier
      }
      // The permissions you want to check
      permissions: [PermissionIdentifier.CREATE_PROJECT, PermissionIdentifier.DELETE_PROJECT],
      // connfiguration options
      options: {
        skipCache: true
      }
    },
    // dependencies array, similar to useEffect's second parameter
    // any value or reference change in this will re-trigger the check
    []
  )

  return (
    <>
      <Button disabled={canEdit} text="Edit" />
      <Button disabled={canDelete} text="Delete" />
    </>
  )
}
```

If your usecase is just to add the access control check on a button, you can use the provided RbacButton component. This component will
internally use the `usePermission` hook and add the required tooltips for a better disabled experience.

```typescript
import RbacButton from '@rbac/components/Button/Button'

function SampleComponent() {
  return (
    <>
      <RbacButton
        text={'Edit Project'}
        onClick={openModal}
        permission={{
          permission: PermissionIdentifier.UPDATE_PROJECT,
          resource: {
            resourceType: ResourceType.PROJECT,
            resourceIdentifier: project.identifier
          },
          resourceScope: {
            accountIdentifier
          }
        }}
      />
    </>
  )
}
```

### Salient Features:

- Permissions returned are boolean in nature
- Permissions are returned in the same order as requested in the `permissions` array
- Fetched permissions are stored in `PermissionsContext`, which is available in `AppContext`. However, **direct access via context should be avoided**. The internal data structure does not support a O(1) look-ups.
- The hook implements cache-first approach. Fetched permissions are cached and any requests are first checked in the cache. We make a network call only if it's a cache miss. You can switch to a network-first approach by passing `skipCache` as true in options.
- Multiple requests across components are automatically collected together to avoid network thrashing.
