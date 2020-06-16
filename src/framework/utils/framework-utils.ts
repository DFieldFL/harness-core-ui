import type { Route, RouteURLArgs } from 'framework/exports'
import { loggerFor } from 'framework/logging/logging'
import { ModuleName } from 'framework/types/ModuleName'
import SessionToken from './SessionToken'

const logger = loggerFor(ModuleName.FRAMEWORK)

export function buildLoginUrlFrom401Response(message?: string): string {
  const { href } = window.location
  const prefix = message ? `/#/login?message=${encodeURIComponent(message)}&returnUrl=` : '/#/login?returnUrl='

  return href.includes(prefix) ? href : prefix + encodeURIComponent(href)
}

/**
 * Utility function to create a link to a route. This is an alias of
 * `Route.url()` with an extra nullable validation for params fields.
 * @param route Route entry object.
 * @param params Route entry's url() parameters.
 */
export function linkTo(route: Route, params?: RouteURLArgs): string {
  const accountId = SessionToken.accountId()

  if (params) {
    const nullableFields = Object.keys(params).filter(key => params[key] === null || params[key] === undefined)
    if (nullableFields?.length) {
      const { module, pageId, path, title } = route

      logger.warn(`Calling linkTo() with problematic null/undefined arguments (${nullableFields.join(', ')}).`, {
        module,
        pageId,
        path,
        title
      })
    }
  }

  // Authenticated route paths are always prefixed with `/account/:accountId`
  return `${route.authenticated === false ? '' : `/account/${accountId}`}` + route.url(params)
}
