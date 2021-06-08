/* Generated by restful-react */

import React from 'react'
import { Get, GetProps, useGet, UseGetProps } from 'restful-react'

import { getConfig } from '../config'
export const SPEC_VERSION = '1.0.0'
export interface GithubMember {
  id?: number
  name?: string
  login?: string
  avatar_url?: string
  contributions?: number
}

export interface GithubOrg {
  id?: number
  name?: string
  login?: string
  public_repos?: number
  total_private_repos?: number
  two_factor_requirement_enabled?: boolean
  plan?: GithubPlan
}

export interface GithubPlan {
  seats?: number
  filled_seats?: number
  name?: string
}

export interface GithubRecommendations {
  message?: string
  level?: number
  savings?: number
}

export interface GithubDetailsResponse {
  org?: GithubOrg
  members?: GithubMember[]
  inactive_members?: GithubMember[]
  rarely_active_members?: GithubMember[]
  recommendations?: GithubRecommendations[]
}

export interface PagerDutySavings {
  current_spend?: number
  potential_spend?: number
  potential_savings?: number
  savings_percent?: number
}

export interface PagerDutyRecommendations {
  message?: string
  level?: number
  savings?: number
}

export interface PagerDutySavingsResponse {
  total_users?: number
  active_users?: number
  monthly_savings?: PagerDutySavings
  yearly_savings?: PagerDutySavings
  recommendations?: PagerDutyRecommendations[]
}

export interface AtlassianDetailsResponse {
  contract_value?: number
  idle_users?: string[]
  potential_savings?: number
  total_users?: number
  recommendations?: GithubRecommendations[]
  rarely_active_users?: {
    email?: string
  }[]
}

export interface PagerDutyUser {
  id?: string
  type?: string
  summary?: string
  self?: string
  name?: string
  email?: string
  time_zone?: string
  role?: string
  avatar_url?: string
  description?: string
}

export type PagerDutyUsersResponse = PagerDutyUser[]

export interface AllStat {
  name?: string
  category?: string
  annual_spend?: number
  annual_savings?: number
  total_users?: number
  inactive_users?: number
  icon?: string
}

export type AllStatsResponse = AllStat[]

export type GithubDetailsProps = Omit<GetProps<GithubDetailsResponse, void, void, void>, 'path'>

/**
 * Gets githubDetails
 *
 * githubDetails
 */
export const GithubDetails = (props: GithubDetailsProps) => (
  <Get<GithubDetailsResponse, void, void, void> path={`/github/details`} base={getConfig('asaasin/api')} {...props} />
)

export type UseGithubDetailsProps = Omit<UseGetProps<GithubDetailsResponse, void, void, void>, 'path'>

/**
 * Gets githubDetails
 *
 * githubDetails
 */
export const useGithubDetails = (props: UseGithubDetailsProps) =>
  useGet<GithubDetailsResponse, void, void, void>(`/github/details`, { base: getConfig('asaasin/api'), ...props })

export type PagerdutySavingsProps = Omit<GetProps<PagerDutySavingsResponse, void, void, void>, 'path'>

/**
 * Get pagerduty savings
 *
 * pagerdutySavings
 */
export const PagerdutySavings = (props: PagerdutySavingsProps) => (
  <Get<PagerDutySavingsResponse, void, void, void>
    path={`/pagerduty/savings`}
    base={getConfig('asaasin/api')}
    {...props}
  />
)

export type UsePagerdutySavingsProps = Omit<UseGetProps<PagerDutySavingsResponse, void, void, void>, 'path'>

/**
 * Get pagerduty savings
 *
 * pagerdutySavings
 */
export const usePagerdutySavings = (props: UsePagerdutySavingsProps) =>
  useGet<PagerDutySavingsResponse, void, void, void>(`/pagerduty/savings`, { base: getConfig('asaasin/api'), ...props })

export type AtlassianDetailsProps = Omit<GetProps<AtlassianDetailsResponse, void, void, void>, 'path'>

/**
 * Get atlassianDetails
 *
 * atlassianDetails
 */
export const AtlassianDetails = (props: AtlassianDetailsProps) => (
  <Get<AtlassianDetailsResponse, void, void, void> path={`/atlassian/all`} base={getConfig('asaasin/api')} {...props} />
)

export type UseAtlassianDetailsProps = Omit<UseGetProps<AtlassianDetailsResponse, void, void, void>, 'path'>

/**
 * Get atlassianDetails
 *
 * atlassianDetails
 */
export const useAtlassianDetails = (props: UseAtlassianDetailsProps) =>
  useGet<AtlassianDetailsResponse, void, void, void>(`/atlassian/all`, { base: getConfig('asaasin/api'), ...props })

export type PagerdutyInactiveUsersProps = Omit<GetProps<PagerDutyUsersResponse, void, void, void>, 'path'>

/**
 * Get pagerduty inactive users
 *
 * pagerdutyInactiveUsers
 */
export const PagerdutyInactiveUsers = (props: PagerdutyInactiveUsersProps) => (
  <Get<PagerDutyUsersResponse, void, void, void>
    path={`/pagerduty/users/inactive`}
    base={getConfig('asaasin/api')}
    {...props}
  />
)

export type UsePagerdutyInactiveUsersProps = Omit<UseGetProps<PagerDutyUsersResponse, void, void, void>, 'path'>

/**
 * Get pagerduty inactive users
 *
 * pagerdutyInactiveUsers
 */
export const usePagerdutyInactiveUsers = (props: UsePagerdutyInactiveUsersProps) =>
  useGet<PagerDutyUsersResponse, void, void, void>(`/pagerduty/users/inactive`, {
    base: getConfig('asaasin/api'),
    ...props
  })

export type AllStatusOfApplicationsProps = Omit<GetProps<AllStatsResponse, void, void, void>, 'path'>

/**
 * Get overall status of applications
 *
 * allStatsOfApplications
 */
export const AllStatusOfApplications = (props: AllStatusOfApplicationsProps) => (
  <Get<AllStatsResponse, void, void, void> path={`/stats`} base={getConfig('asaasin/api')} {...props} />
)

export type UseAllStatusOfApplicationsProps = Omit<UseGetProps<AllStatsResponse, void, void, void>, 'path'>

/**
 * Get overall status of applications
 *
 * allStatsOfApplications
 */
export const useAllStatusOfApplications = (props: UseAllStatusOfApplicationsProps) =>
  useGet<AllStatsResponse, void, void, void>(`/stats`, { base: getConfig('asaasin/api'), ...props })
