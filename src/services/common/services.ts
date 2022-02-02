/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import gql from 'graphql-tag'
import * as Urql from 'urql'
export type Maybe<T> = T | null
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] }
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> }
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> }
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
export const CallOutFragmentDoc = gql`
  fragment CallOut on ComponentPricingPageCallOut {
    title
    desc
  }
`
export const PlansFragmentDoc = gql`
  fragment Plans on ComponentPricingPagePlansZone {
    id
    title
    desc
    img {
      url
      width
      height
    }
    price
    yearlyPrice
    unit
    link
    featureListZone {
      id
      title
      link
    }
    buttonText
    primaryButton
    comingSoon
    priceTips
    priceTerm
    priceTermTips
    yearlyPriceTips
    yearlyPriceTerm
    yearlyPriceTermTips
    support
    featureTitle
    unitTips
  }
`
export const FeatureCaptionFragmentDoc = gql`
  fragment FeatureCaption on ComponentPricingPageFeatureCaption {
    id
    title
    btnText
    btnLink
    primaryButton
  }
`
export const FeatureGroupFragmentDoc = gql`
  fragment FeatureGroup on ComponentPricingPageFeatureGroup {
    id
    title
    detailedFeature {
      id
      title
      link
      communityValue
      communityText
      freeValue
      freeText
      teamValue
      teamText
      enterpriseValue
      enterpriseText
    }
  }
`
export const FaqFragmentDoc = gql`
  fragment Faq on ComponentPricingPageFaq {
    id
    faqTitle
    faqAnswer
    anchor
  }
`
export const FetchPlansDocument = gql`
  query fetchPlans {
    pricing {
      id
      published_at
      created_at
      updated_at
      hero {
        title
        desc
        subTitle
      }
      ciPlans {
        ...Plans
      }
      ciSaasPlans {
        ...Plans
      }
      cdPlans {
        ...Plans
      }
      ccPlans {
        ...Plans
      }
      ffPlans {
        ...Plans
      }
      chIntelPlans {
        ...Plans
      }
      ciFeatureCaption {
        ...FeatureCaption
      }
      ciFeatureGroup {
        ...FeatureGroup
      }
      cdFeatureCaption {
        ...FeatureCaption
      }
      cdFeatureGroup {
        ...FeatureGroup
      }
      ccFeatureCaption {
        ...FeatureCaption
      }
      ccFeatureGroup {
        ...FeatureGroup
      }
      ffFeatureCaption {
        ...FeatureCaption
      }
      ffFeatureGroup {
        ...FeatureGroup
      }
      ciSaasFeatureCaption {
        ...FeatureCaption
      }
      ciSaasFeatureGroup {
        ...FeatureGroup
      }
      chIntelFeatureCaption {
        ...FeatureCaption
      }
      chIntelFeatureGroup {
        ...FeatureGroup
      }
      cdFaq {
        ...Faq
      }
      ciFaq {
        ...Faq
      }
      ccFaq {
        ...Faq
      }
      ffFaq {
        ...Faq
      }
      caseStudies {
        id
        quote
        client
        link
        clientPic {
          width
          height
          url
        }
      }
      openSource {
        ...CallOut
      }
    }
  }
  ${PlansFragmentDoc}
  ${FeatureCaptionFragmentDoc}
  ${FeatureGroupFragmentDoc}
  ${FaqFragmentDoc}
  ${CallOutFragmentDoc}
`

export function useFetchPlansQuery(options: Omit<Urql.UseQueryArgs<FetchPlansQueryVariables>, 'query'> = {}) {
  return Urql.useQuery<FetchPlansQuery>({ query: FetchPlansDocument, ...options })
}
export type CallOutFragment = { __typename?: 'ComponentPricingPageCallOut'; title: Maybe<string>; desc: Maybe<string> }

export type PlansFragment = {
  __typename?: 'ComponentPricingPagePlansZone'
  id: string
  title: Maybe<string>
  desc: Maybe<string>
  price: Maybe<string>
  yearlyPrice: Maybe<string>
  unit: Maybe<string>
  link: Maybe<string>
  buttonText: Maybe<string>
  primaryButton: Maybe<boolean>
  comingSoon: Maybe<boolean>
  priceTips: Maybe<string>
  priceTerm: Maybe<string>
  priceTermTips: Maybe<string>
  yearlyPriceTips: Maybe<string>
  yearlyPriceTerm: Maybe<string>
  yearlyPriceTermTips: Maybe<string>
  support: Maybe<string>
  featureTitle: Maybe<string>
  unitTips: Maybe<string>
  img: Maybe<{ __typename?: 'UploadFile'; url: string; width: Maybe<number>; height: Maybe<number> }>
  featureListZone: Maybe<
    Array<Maybe<{ __typename?: 'ComponentPageFeatureLIstZone'; id: string; title: Maybe<string>; link: Maybe<string> }>>
  >
}

export type FeatureCaptionFragment = {
  __typename?: 'ComponentPricingPageFeatureCaption'
  id: string
  title: Maybe<string>
  btnText: Maybe<string>
  btnLink: Maybe<string>
  primaryButton: Maybe<boolean>
}

export type FeatureGroupFragment = {
  __typename?: 'ComponentPricingPageFeatureGroup'
  id: string
  title: Maybe<string>
  detailedFeature: Maybe<
    Array<
      Maybe<{
        __typename?: 'ComponentPricingPageDetailedFeature'
        id: string
        title: Maybe<string>
        link: Maybe<string>
        communityValue: Maybe<Enum_Componentpricingpagedetailedfeature_Communityvalue>
        communityText: Maybe<string>
        freeValue: Maybe<Enum_Componentpricingpagedetailedfeature_Freevalue>
        freeText: Maybe<string>
        teamValue: Maybe<Enum_Componentpricingpagedetailedfeature_Teamvalue>
        teamText: Maybe<string>
        enterpriseValue: Maybe<Enum_Componentpricingpagedetailedfeature_Enterprisevalue>
        enterpriseText: Maybe<string>
      }>
    >
  >
}

export type FaqFragment = {
  __typename?: 'ComponentPricingPageFaq'
  id: string
  faqTitle: Maybe<string>
  faqAnswer: Maybe<string>
  anchor: Maybe<string>
}

export type FetchPlansQueryVariables = Exact<{ [key: string]: never }>

export type FetchPlansQuery = {
  __typename?: 'Query'
  pricing: Maybe<{
    __typename?: 'Pricing'
    id: string
    published_at: Maybe<any>
    created_at: any
    updated_at: any
    hero: Maybe<{
      __typename?: 'ComponentPageMiniTitleZone'
      title: Maybe<string>
      desc: Maybe<string>
      subTitle: Maybe<string>
    }>
    ciPlans: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPagePlansZone' } & PlansFragment>>>
    ciSaasPlans: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPagePlansZone' } & PlansFragment>>>
    cdPlans: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPagePlansZone' } & PlansFragment>>>
    ccPlans: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPagePlansZone' } & PlansFragment>>>
    ffPlans: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPagePlansZone' } & PlansFragment>>>
    chIntelPlans: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPagePlansZone' } & PlansFragment>>>
    ciFeatureCaption: Maybe<
      Array<Maybe<{ __typename?: 'ComponentPricingPageFeatureCaption' } & FeatureCaptionFragment>>
    >
    ciFeatureGroup: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPageFeatureGroup' } & FeatureGroupFragment>>>
    cdFeatureCaption: Maybe<
      Array<Maybe<{ __typename?: 'ComponentPricingPageFeatureCaption' } & FeatureCaptionFragment>>
    >
    cdFeatureGroup: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPageFeatureGroup' } & FeatureGroupFragment>>>
    ccFeatureCaption: Maybe<
      Array<Maybe<{ __typename?: 'ComponentPricingPageFeatureCaption' } & FeatureCaptionFragment>>
    >
    ccFeatureGroup: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPageFeatureGroup' } & FeatureGroupFragment>>>
    ffFeatureCaption: Maybe<
      Array<Maybe<{ __typename?: 'ComponentPricingPageFeatureCaption' } & FeatureCaptionFragment>>
    >
    ffFeatureGroup: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPageFeatureGroup' } & FeatureGroupFragment>>>
    ciSaasFeatureCaption: Maybe<
      Array<Maybe<{ __typename?: 'ComponentPricingPageFeatureCaption' } & FeatureCaptionFragment>>
    >
    ciSaasFeatureGroup: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPageFeatureGroup' } & FeatureGroupFragment>>>
    chIntelFeatureCaption: Maybe<
      Array<Maybe<{ __typename?: 'ComponentPricingPageFeatureCaption' } & FeatureCaptionFragment>>
    >
    chIntelFeatureGroup: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPageFeatureGroup' } & FeatureGroupFragment>>>
    cdFaq: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPageFaq' } & FaqFragment>>>
    ciFaq: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPageFaq' } & FaqFragment>>>
    ccFaq: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPageFaq' } & FaqFragment>>>
    ffFaq: Maybe<Array<Maybe<{ __typename?: 'ComponentPricingPageFaq' } & FaqFragment>>>
    caseStudies: Maybe<
      Array<
        Maybe<{
          __typename?: 'ComponentPageCaseStudyZone'
          id: string
          quote: Maybe<string>
          client: Maybe<string>
          link: Maybe<string>
          clientPic: Maybe<{ __typename?: 'UploadFile'; width: Maybe<number>; height: Maybe<number>; url: string }>
        }>
      >
    >
    openSource: Maybe<{ __typename?: 'ComponentPricingPageCallOut' } & CallOutFragment>
  }>
}

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string
  String: string
  Boolean: boolean
  Int: number
  Float: number
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any
  /** A time string with format: HH:mm:ss.SSS */
  Time: any
  /** A date string, such as 2007-12-03, compliant with the `full-date` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  Date: any
  /** The `Long` scalar type represents 52-bit integers */
  Long: any
  /** The `Upload` scalar type represents a file upload. */
  Upload: any
}

export type FileInfoInput = {
  name: Maybe<Scalars['String']>
  alternativeText: Maybe<Scalars['String']>
  caption: Maybe<Scalars['String']>
}

export type UsersPermissionsMe = {
  __typename?: 'UsersPermissionsMe'
  id: Scalars['ID']
  username: Scalars['String']
  email: Scalars['String']
  confirmed: Maybe<Scalars['Boolean']>
  blocked: Maybe<Scalars['Boolean']>
  role: Maybe<UsersPermissionsMeRole>
}

export type UsersPermissionsMeRole = {
  __typename?: 'UsersPermissionsMeRole'
  id: Scalars['ID']
  name: Scalars['String']
  description: Maybe<Scalars['String']>
  type: Maybe<Scalars['String']>
}

export type UsersPermissionsRegisterInput = {
  username: Scalars['String']
  email: Scalars['String']
  password: Scalars['String']
}

export type UsersPermissionsLoginInput = {
  identifier: Scalars['String']
  password: Scalars['String']
  provider: Maybe<Scalars['String']>
}

export type UsersPermissionsLoginPayload = {
  __typename?: 'UsersPermissionsLoginPayload'
  jwt: Maybe<Scalars['String']>
  user: UsersPermissionsMe
}

export type UserPermissionsPasswordPayload = {
  __typename?: 'UserPermissionsPasswordPayload'
  ok: Scalars['Boolean']
}

export type AboutUs = {
  __typename?: 'AboutUs'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  hero: Maybe<ComponentPageTitleZone>
  awards: Maybe<Array<Maybe<ComponentPageModules>>>
  executiveTeam: Maybe<Array<Maybe<ComponentPageExecutiveZone>>>
  joinTeam: Maybe<ComponentPageTeamZone>
  coreValues: Maybe<Array<Maybe<ComponentPageModules>>>
  investors: Maybe<ComponentPageSimpleZone>
  offices: Maybe<Array<Maybe<ComponentCompanyPageAdressZone>>>
  harnessOffices: Maybe<ComponentCompanyPageOfficesZone>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type AboutUsInput = {
  hero: Maybe<ComponentPageTitleZoneInput>
  awards: Maybe<Array<Maybe<ComponentPageModuleInput>>>
  executiveTeam: Maybe<Array<Maybe<ComponentPageExecutiveZoneInput>>>
  joinTeam: Maybe<ComponentPageTeamZoneInput>
  coreValues: Maybe<Array<Maybe<ComponentPageModuleInput>>>
  investors: Maybe<ComponentPageSimpleZoneInput>
  offices: Maybe<Array<Maybe<ComponentCompanyPageAdressZoneInput>>>
  harnessOffices: Maybe<ComponentCompanyPageOfficesZoneInput>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditAboutUsInput = {
  hero: Maybe<EditComponentPageTitleZoneInput>
  awards: Maybe<Array<Maybe<EditComponentPageModuleInput>>>
  executiveTeam: Maybe<Array<Maybe<EditComponentPageExecutiveZoneInput>>>
  joinTeam: Maybe<EditComponentPageTeamZoneInput>
  coreValues: Maybe<Array<Maybe<EditComponentPageModuleInput>>>
  investors: Maybe<EditComponentPageSimpleZoneInput>
  offices: Maybe<Array<Maybe<EditComponentCompanyPageAdressZoneInput>>>
  harnessOffices: Maybe<EditComponentCompanyPageOfficesZoneInput>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdateAboutUsInput = {
  data: Maybe<EditAboutUsInput>
}

export type UpdateAboutUsPayload = {
  __typename?: 'updateAboutUsPayload'
  aboutUs: Maybe<AboutUs>
}

export type DeleteAboutUsPayload = {
  __typename?: 'deleteAboutUsPayload'
  aboutUs: Maybe<AboutUs>
}

export type BackgroundColor = {
  __typename?: 'BackgroundColor'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  colorName: Maybe<Scalars['String']>
  colorCode: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type BackgroundColorConnection = {
  __typename?: 'BackgroundColorConnection'
  values: Maybe<Array<Maybe<BackgroundColor>>>
  groupBy: Maybe<BackgroundColorGroupBy>
  aggregate: Maybe<BackgroundColorAggregator>
}

export type BackgroundColorAggregator = {
  __typename?: 'BackgroundColorAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type BackgroundColorGroupBy = {
  __typename?: 'BackgroundColorGroupBy'
  id: Maybe<Array<Maybe<BackgroundColorConnectionId>>>
  created_at: Maybe<Array<Maybe<BackgroundColorConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<BackgroundColorConnectionUpdated_At>>>
  colorName: Maybe<Array<Maybe<BackgroundColorConnectionColorName>>>
  colorCode: Maybe<Array<Maybe<BackgroundColorConnectionColorCode>>>
  published_at: Maybe<Array<Maybe<BackgroundColorConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<BackgroundColorConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<BackgroundColorConnectionUpdated_By>>>
}

export type BackgroundColorConnectionId = {
  __typename?: 'BackgroundColorConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<BackgroundColorConnection>
}

export type BackgroundColorConnectionCreated_At = {
  __typename?: 'BackgroundColorConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<BackgroundColorConnection>
}

export type BackgroundColorConnectionUpdated_At = {
  __typename?: 'BackgroundColorConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<BackgroundColorConnection>
}

export type BackgroundColorConnectionColorName = {
  __typename?: 'BackgroundColorConnectionColorName'
  key: Maybe<Scalars['String']>
  connection: Maybe<BackgroundColorConnection>
}

export type BackgroundColorConnectionColorCode = {
  __typename?: 'BackgroundColorConnectionColorCode'
  key: Maybe<Scalars['String']>
  connection: Maybe<BackgroundColorConnection>
}

export type BackgroundColorConnectionPublished_At = {
  __typename?: 'BackgroundColorConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<BackgroundColorConnection>
}

export type BackgroundColorConnectionCreated_By = {
  __typename?: 'BackgroundColorConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<BackgroundColorConnection>
}

export type BackgroundColorConnectionUpdated_By = {
  __typename?: 'BackgroundColorConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<BackgroundColorConnection>
}

export type BackgroundColorInput = {
  colorName: Maybe<Scalars['String']>
  colorCode: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditBackgroundColorInput = {
  colorName: Maybe<Scalars['String']>
  colorCode: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateBackgroundColorInput = {
  data: Maybe<BackgroundColorInput>
}

export type CreateBackgroundColorPayload = {
  __typename?: 'createBackgroundColorPayload'
  backgroundColor: Maybe<BackgroundColor>
}

export type UpdateBackgroundColorInput = {
  where: Maybe<InputId>
  data: Maybe<EditBackgroundColorInput>
}

export type UpdateBackgroundColorPayload = {
  __typename?: 'updateBackgroundColorPayload'
  backgroundColor: Maybe<BackgroundColor>
}

export type DeleteBackgroundColorInput = {
  where: Maybe<InputId>
}

export type DeleteBackgroundColorPayload = {
  __typename?: 'deleteBackgroundColorPayload'
  backgroundColor: Maybe<BackgroundColor>
}

export type Careers = {
  __typename?: 'Careers'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  joinTeam: Maybe<ComponentPageTeamZone>
  events: Maybe<Array<Maybe<ComponentPageTextImageZone>>>
  benefits: Maybe<Array<Maybe<ComponentPageModules>>>
  harnessIs: Maybe<Array<Maybe<ComponentPageModules>>>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type CareerInput = {
  joinTeam: Maybe<ComponentPageTeamZoneInput>
  events: Maybe<Array<Maybe<ComponentPageTextImageZoneInput>>>
  benefits: Maybe<Array<Maybe<ComponentPageModuleInput>>>
  harnessIs: Maybe<Array<Maybe<ComponentPageModuleInput>>>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZoneInput>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditCareerInput = {
  joinTeam: Maybe<EditComponentPageTeamZoneInput>
  events: Maybe<Array<Maybe<EditComponentPageTextImageZoneInput>>>
  benefits: Maybe<Array<Maybe<EditComponentPageModuleInput>>>
  harnessIs: Maybe<Array<Maybe<EditComponentPageModuleInput>>>
  caseStudies: Maybe<Array<Maybe<EditComponentPageCaseStudyZoneInput>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdateCareerInput = {
  data: Maybe<EditCareerInput>
}

export type UpdateCareerPayload = {
  __typename?: 'updateCareerPayload'
  career: Maybe<Careers>
}

export type DeleteCareerPayload = {
  __typename?: 'deleteCareerPayload'
  career: Maybe<Careers>
}

export type CaseStudy = {
  __typename?: 'CaseStudy'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  title: Maybe<Scalars['String']>
  description: Maybe<Scalars['String']>
  videoLink: Maybe<Scalars['String']>
  companyLogo: Maybe<UploadFile>
  industry: Maybe<Industry>
  background_color: Maybe<BackgroundColor>
  company_size: Maybe<CompanySize>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
  harness_modules: Maybe<Array<Maybe<HarnessModule>>>
  integrations: Maybe<Array<Maybe<Integration>>>
  outcomes: Maybe<Array<Maybe<Outcome>>>
}

export type CaseStudyHarness_ModulesArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type CaseStudyIntegrationsArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type CaseStudyOutcomesArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type CaseStudyConnection = {
  __typename?: 'CaseStudyConnection'
  values: Maybe<Array<Maybe<CaseStudy>>>
  groupBy: Maybe<CaseStudyGroupBy>
  aggregate: Maybe<CaseStudyAggregator>
}

export type CaseStudyAggregator = {
  __typename?: 'CaseStudyAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type CaseStudyGroupBy = {
  __typename?: 'CaseStudyGroupBy'
  id: Maybe<Array<Maybe<CaseStudyConnectionId>>>
  created_at: Maybe<Array<Maybe<CaseStudyConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<CaseStudyConnectionUpdated_At>>>
  title: Maybe<Array<Maybe<CaseStudyConnectionTitle>>>
  description: Maybe<Array<Maybe<CaseStudyConnectionDescription>>>
  videoLink: Maybe<Array<Maybe<CaseStudyConnectionVideoLink>>>
  companyLogo: Maybe<Array<Maybe<CaseStudyConnectionCompanyLogo>>>
  industry: Maybe<Array<Maybe<CaseStudyConnectionIndustry>>>
  background_color: Maybe<Array<Maybe<CaseStudyConnectionBackground_Color>>>
  company_size: Maybe<Array<Maybe<CaseStudyConnectionCompany_Size>>>
  published_at: Maybe<Array<Maybe<CaseStudyConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<CaseStudyConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<CaseStudyConnectionUpdated_By>>>
}

export type CaseStudyConnectionId = {
  __typename?: 'CaseStudyConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CaseStudyConnection>
}

export type CaseStudyConnectionCreated_At = {
  __typename?: 'CaseStudyConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<CaseStudyConnection>
}

export type CaseStudyConnectionUpdated_At = {
  __typename?: 'CaseStudyConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<CaseStudyConnection>
}

export type CaseStudyConnectionTitle = {
  __typename?: 'CaseStudyConnectionTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<CaseStudyConnection>
}

export type CaseStudyConnectionDescription = {
  __typename?: 'CaseStudyConnectionDescription'
  key: Maybe<Scalars['String']>
  connection: Maybe<CaseStudyConnection>
}

export type CaseStudyConnectionVideoLink = {
  __typename?: 'CaseStudyConnectionVideoLink'
  key: Maybe<Scalars['String']>
  connection: Maybe<CaseStudyConnection>
}

export type CaseStudyConnectionCompanyLogo = {
  __typename?: 'CaseStudyConnectionCompanyLogo'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CaseStudyConnection>
}

export type CaseStudyConnectionIndustry = {
  __typename?: 'CaseStudyConnectionIndustry'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CaseStudyConnection>
}

export type CaseStudyConnectionBackground_Color = {
  __typename?: 'CaseStudyConnectionBackground_color'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CaseStudyConnection>
}

export type CaseStudyConnectionCompany_Size = {
  __typename?: 'CaseStudyConnectionCompany_size'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CaseStudyConnection>
}

export type CaseStudyConnectionPublished_At = {
  __typename?: 'CaseStudyConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<CaseStudyConnection>
}

export type CaseStudyConnectionCreated_By = {
  __typename?: 'CaseStudyConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CaseStudyConnection>
}

export type CaseStudyConnectionUpdated_By = {
  __typename?: 'CaseStudyConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CaseStudyConnection>
}

export type CaseStudyInput = {
  title: Maybe<Scalars['String']>
  description: Maybe<Scalars['String']>
  videoLink: Maybe<Scalars['String']>
  companyLogo: Maybe<Scalars['ID']>
  harness_modules: Maybe<Array<Maybe<Scalars['ID']>>>
  industry: Maybe<Scalars['ID']>
  integrations: Maybe<Array<Maybe<Scalars['ID']>>>
  outcomes: Maybe<Array<Maybe<Scalars['ID']>>>
  background_color: Maybe<Scalars['ID']>
  company_size: Maybe<Scalars['ID']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditCaseStudyInput = {
  title: Maybe<Scalars['String']>
  description: Maybe<Scalars['String']>
  videoLink: Maybe<Scalars['String']>
  companyLogo: Maybe<Scalars['ID']>
  harness_modules: Maybe<Array<Maybe<Scalars['ID']>>>
  industry: Maybe<Scalars['ID']>
  integrations: Maybe<Array<Maybe<Scalars['ID']>>>
  outcomes: Maybe<Array<Maybe<Scalars['ID']>>>
  background_color: Maybe<Scalars['ID']>
  company_size: Maybe<Scalars['ID']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateCaseStudyInput = {
  data: Maybe<CaseStudyInput>
}

export type CreateCaseStudyPayload = {
  __typename?: 'createCaseStudyPayload'
  caseStudy: Maybe<CaseStudy>
}

export type UpdateCaseStudyInput = {
  where: Maybe<InputId>
  data: Maybe<EditCaseStudyInput>
}

export type UpdateCaseStudyPayload = {
  __typename?: 'updateCaseStudyPayload'
  caseStudy: Maybe<CaseStudy>
}

export type DeleteCaseStudyInput = {
  where: Maybe<InputId>
}

export type DeleteCaseStudyPayload = {
  __typename?: 'deleteCaseStudyPayload'
  caseStudy: Maybe<CaseStudy>
}

export type CompanySize = {
  __typename?: 'CompanySize'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type CompanySizeConnection = {
  __typename?: 'CompanySizeConnection'
  values: Maybe<Array<Maybe<CompanySize>>>
  groupBy: Maybe<CompanySizeGroupBy>
  aggregate: Maybe<CompanySizeAggregator>
}

export type CompanySizeAggregator = {
  __typename?: 'CompanySizeAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type CompanySizeGroupBy = {
  __typename?: 'CompanySizeGroupBy'
  id: Maybe<Array<Maybe<CompanySizeConnectionId>>>
  created_at: Maybe<Array<Maybe<CompanySizeConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<CompanySizeConnectionUpdated_At>>>
  item: Maybe<Array<Maybe<CompanySizeConnectionItem>>>
  published_at: Maybe<Array<Maybe<CompanySizeConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<CompanySizeConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<CompanySizeConnectionUpdated_By>>>
}

export type CompanySizeConnectionId = {
  __typename?: 'CompanySizeConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CompanySizeConnection>
}

export type CompanySizeConnectionCreated_At = {
  __typename?: 'CompanySizeConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<CompanySizeConnection>
}

export type CompanySizeConnectionUpdated_At = {
  __typename?: 'CompanySizeConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<CompanySizeConnection>
}

export type CompanySizeConnectionItem = {
  __typename?: 'CompanySizeConnectionItem'
  key: Maybe<Scalars['String']>
  connection: Maybe<CompanySizeConnection>
}

export type CompanySizeConnectionPublished_At = {
  __typename?: 'CompanySizeConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<CompanySizeConnection>
}

export type CompanySizeConnectionCreated_By = {
  __typename?: 'CompanySizeConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CompanySizeConnection>
}

export type CompanySizeConnectionUpdated_By = {
  __typename?: 'CompanySizeConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CompanySizeConnection>
}

export type CompanySizeInput = {
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditCompanySizeInput = {
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateCompanySizeInput = {
  data: Maybe<CompanySizeInput>
}

export type CreateCompanySizePayload = {
  __typename?: 'createCompanySizePayload'
  companySize: Maybe<CompanySize>
}

export type UpdateCompanySizeInput = {
  where: Maybe<InputId>
  data: Maybe<EditCompanySizeInput>
}

export type UpdateCompanySizePayload = {
  __typename?: 'updateCompanySizePayload'
  companySize: Maybe<CompanySize>
}

export type DeleteCompanySizeInput = {
  where: Maybe<InputId>
}

export type DeleteCompanySizePayload = {
  __typename?: 'deleteCompanySizePayload'
  companySize: Maybe<CompanySize>
}

export enum Enum_Competitorcomparison_Harnessmodule {
  ContinuousIntegration = 'Continuous_Integration',
  ContinuousDelivery = 'Continuous_Delivery',
  FeatureFlagsManagement = 'Feature_Flags_Management',
  CloudCostManagement = 'Cloud_Cost_Management'
}

export type CompetitorComparison = {
  __typename?: 'CompetitorComparison'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  harnessModule: Maybe<Enum_Competitorcomparison_Harnessmodule>
  competitor: Maybe<Scalars['String']>
  harnessSummary: Maybe<ComponentCompetitorComparisonPageProductSummaryZone>
  harnessLogo: Maybe<UploadFile>
  competitorLogo: Maybe<UploadFile>
  featureComparison: Maybe<ComponentCompetitorComparisonPageFeatureComparison>
  slug: Scalars['String']
  detailedFeatureComparison: Maybe<ComponentCompetitorComparisonPageDetailedFeatureComparison>
  caseStudy: Maybe<ComponentCompetitorComparisonPageComparisonCaseStudy>
  screenshot: Maybe<ComponentPageScreenshotZone>
  recommended: Maybe<ComponentPageScreenshotZone>
  competitorSummary: Maybe<ComponentCompetitorComparisonPageProductSummaryZone>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type CompetitorComparisonConnection = {
  __typename?: 'CompetitorComparisonConnection'
  values: Maybe<Array<Maybe<CompetitorComparison>>>
  groupBy: Maybe<CompetitorComparisonGroupBy>
  aggregate: Maybe<CompetitorComparisonAggregator>
}

export type CompetitorComparisonAggregator = {
  __typename?: 'CompetitorComparisonAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type CompetitorComparisonGroupBy = {
  __typename?: 'CompetitorComparisonGroupBy'
  id: Maybe<Array<Maybe<CompetitorComparisonConnectionId>>>
  created_at: Maybe<Array<Maybe<CompetitorComparisonConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<CompetitorComparisonConnectionUpdated_At>>>
  harnessModule: Maybe<Array<Maybe<CompetitorComparisonConnectionHarnessModule>>>
  competitor: Maybe<Array<Maybe<CompetitorComparisonConnectionCompetitor>>>
  harnessSummary: Maybe<Array<Maybe<CompetitorComparisonConnectionHarnessSummary>>>
  harnessLogo: Maybe<Array<Maybe<CompetitorComparisonConnectionHarnessLogo>>>
  competitorLogo: Maybe<Array<Maybe<CompetitorComparisonConnectionCompetitorLogo>>>
  featureComparison: Maybe<Array<Maybe<CompetitorComparisonConnectionFeatureComparison>>>
  slug: Maybe<Array<Maybe<CompetitorComparisonConnectionSlug>>>
  detailedFeatureComparison: Maybe<Array<Maybe<CompetitorComparisonConnectionDetailedFeatureComparison>>>
  caseStudy: Maybe<Array<Maybe<CompetitorComparisonConnectionCaseStudy>>>
  screenshot: Maybe<Array<Maybe<CompetitorComparisonConnectionScreenshot>>>
  recommended: Maybe<Array<Maybe<CompetitorComparisonConnectionRecommended>>>
  competitorSummary: Maybe<Array<Maybe<CompetitorComparisonConnectionCompetitorSummary>>>
  published_at: Maybe<Array<Maybe<CompetitorComparisonConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<CompetitorComparisonConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<CompetitorComparisonConnectionUpdated_By>>>
}

export type CompetitorComparisonConnectionId = {
  __typename?: 'CompetitorComparisonConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionCreated_At = {
  __typename?: 'CompetitorComparisonConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionUpdated_At = {
  __typename?: 'CompetitorComparisonConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionHarnessModule = {
  __typename?: 'CompetitorComparisonConnectionHarnessModule'
  key: Maybe<Scalars['String']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionCompetitor = {
  __typename?: 'CompetitorComparisonConnectionCompetitor'
  key: Maybe<Scalars['String']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionHarnessSummary = {
  __typename?: 'CompetitorComparisonConnectionHarnessSummary'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionHarnessLogo = {
  __typename?: 'CompetitorComparisonConnectionHarnessLogo'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionCompetitorLogo = {
  __typename?: 'CompetitorComparisonConnectionCompetitorLogo'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionFeatureComparison = {
  __typename?: 'CompetitorComparisonConnectionFeatureComparison'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionSlug = {
  __typename?: 'CompetitorComparisonConnectionSlug'
  key: Maybe<Scalars['String']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionDetailedFeatureComparison = {
  __typename?: 'CompetitorComparisonConnectionDetailedFeatureComparison'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionCaseStudy = {
  __typename?: 'CompetitorComparisonConnectionCaseStudy'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionScreenshot = {
  __typename?: 'CompetitorComparisonConnectionScreenshot'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionRecommended = {
  __typename?: 'CompetitorComparisonConnectionRecommended'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionCompetitorSummary = {
  __typename?: 'CompetitorComparisonConnectionCompetitorSummary'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionPublished_At = {
  __typename?: 'CompetitorComparisonConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionCreated_By = {
  __typename?: 'CompetitorComparisonConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonConnectionUpdated_By = {
  __typename?: 'CompetitorComparisonConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<CompetitorComparisonConnection>
}

export type CompetitorComparisonInput = {
  harnessModule: Maybe<Enum_Competitorcomparison_Harnessmodule>
  competitor: Maybe<Scalars['String']>
  harnessSummary: Maybe<ComponentCompetitorComparisonPageProductSummaryZoneInput>
  harnessLogo: Maybe<Scalars['ID']>
  competitorLogo: Maybe<Scalars['ID']>
  featureComparison: Maybe<ComponentCompetitorComparisonPageFeatureComparisonInput>
  slug: Scalars['String']
  detailedFeatureComparison: Maybe<ComponentCompetitorComparisonPageDetailedFeatureComparisonInput>
  caseStudy: Maybe<ComponentCompetitorComparisonPageComparisonCaseStudyInput>
  screenshot: Maybe<ComponentPageScreenshotZoneInput>
  recommended: Maybe<ComponentPageScreenshotZoneInput>
  competitorSummary: Maybe<ComponentCompetitorComparisonPageProductSummaryZoneInput>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditCompetitorComparisonInput = {
  harnessModule: Maybe<Enum_Competitorcomparison_Harnessmodule>
  competitor: Maybe<Scalars['String']>
  harnessSummary: Maybe<EditComponentCompetitorComparisonPageProductSummaryZoneInput>
  harnessLogo: Maybe<Scalars['ID']>
  competitorLogo: Maybe<Scalars['ID']>
  featureComparison: Maybe<EditComponentCompetitorComparisonPageFeatureComparisonInput>
  slug: Maybe<Scalars['String']>
  detailedFeatureComparison: Maybe<EditComponentCompetitorComparisonPageDetailedFeatureComparisonInput>
  caseStudy: Maybe<EditComponentCompetitorComparisonPageComparisonCaseStudyInput>
  screenshot: Maybe<EditComponentPageScreenshotZoneInput>
  recommended: Maybe<EditComponentPageScreenshotZoneInput>
  competitorSummary: Maybe<EditComponentCompetitorComparisonPageProductSummaryZoneInput>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateCompetitorComparisonInput = {
  data: Maybe<CompetitorComparisonInput>
}

export type CreateCompetitorComparisonPayload = {
  __typename?: 'createCompetitorComparisonPayload'
  competitorComparison: Maybe<CompetitorComparison>
}

export type UpdateCompetitorComparisonInput = {
  where: Maybe<InputId>
  data: Maybe<EditCompetitorComparisonInput>
}

export type UpdateCompetitorComparisonPayload = {
  __typename?: 'updateCompetitorComparisonPayload'
  competitorComparison: Maybe<CompetitorComparison>
}

export type DeleteCompetitorComparisonInput = {
  where: Maybe<InputId>
}

export type DeleteCompetitorComparisonPayload = {
  __typename?: 'deleteCompetitorComparisonPayload'
  competitorComparison: Maybe<CompetitorComparison>
}

export type ContactSale = {
  __typename?: 'ContactSale'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  firstName: Maybe<Scalars['String']>
  lastName: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
  company: Maybe<Scalars['String']>
  phone: Maybe<Scalars['String']>
  email: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type ContactSaleConnection = {
  __typename?: 'ContactSaleConnection'
  values: Maybe<Array<Maybe<ContactSale>>>
  groupBy: Maybe<ContactSaleGroupBy>
  aggregate: Maybe<ContactSaleAggregator>
}

export type ContactSaleAggregator = {
  __typename?: 'ContactSaleAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type ContactSaleGroupBy = {
  __typename?: 'ContactSaleGroupBy'
  id: Maybe<Array<Maybe<ContactSaleConnectionId>>>
  created_at: Maybe<Array<Maybe<ContactSaleConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<ContactSaleConnectionUpdated_At>>>
  firstName: Maybe<Array<Maybe<ContactSaleConnectionFirstName>>>
  lastName: Maybe<Array<Maybe<ContactSaleConnectionLastName>>>
  title: Maybe<Array<Maybe<ContactSaleConnectionTitle>>>
  company: Maybe<Array<Maybe<ContactSaleConnectionCompany>>>
  phone: Maybe<Array<Maybe<ContactSaleConnectionPhone>>>
  email: Maybe<Array<Maybe<ContactSaleConnectionEmail>>>
  published_at: Maybe<Array<Maybe<ContactSaleConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<ContactSaleConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<ContactSaleConnectionUpdated_By>>>
}

export type ContactSaleConnectionId = {
  __typename?: 'ContactSaleConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<ContactSaleConnection>
}

export type ContactSaleConnectionCreated_At = {
  __typename?: 'ContactSaleConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<ContactSaleConnection>
}

export type ContactSaleConnectionUpdated_At = {
  __typename?: 'ContactSaleConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<ContactSaleConnection>
}

export type ContactSaleConnectionFirstName = {
  __typename?: 'ContactSaleConnectionFirstName'
  key: Maybe<Scalars['String']>
  connection: Maybe<ContactSaleConnection>
}

export type ContactSaleConnectionLastName = {
  __typename?: 'ContactSaleConnectionLastName'
  key: Maybe<Scalars['String']>
  connection: Maybe<ContactSaleConnection>
}

export type ContactSaleConnectionTitle = {
  __typename?: 'ContactSaleConnectionTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<ContactSaleConnection>
}

export type ContactSaleConnectionCompany = {
  __typename?: 'ContactSaleConnectionCompany'
  key: Maybe<Scalars['String']>
  connection: Maybe<ContactSaleConnection>
}

export type ContactSaleConnectionPhone = {
  __typename?: 'ContactSaleConnectionPhone'
  key: Maybe<Scalars['String']>
  connection: Maybe<ContactSaleConnection>
}

export type ContactSaleConnectionEmail = {
  __typename?: 'ContactSaleConnectionEmail'
  key: Maybe<Scalars['String']>
  connection: Maybe<ContactSaleConnection>
}

export type ContactSaleConnectionPublished_At = {
  __typename?: 'ContactSaleConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<ContactSaleConnection>
}

export type ContactSaleConnectionCreated_By = {
  __typename?: 'ContactSaleConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<ContactSaleConnection>
}

export type ContactSaleConnectionUpdated_By = {
  __typename?: 'ContactSaleConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<ContactSaleConnection>
}

export type ContactSaleInput = {
  firstName: Maybe<Scalars['String']>
  lastName: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
  company: Maybe<Scalars['String']>
  phone: Maybe<Scalars['String']>
  email: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditContactSaleInput = {
  firstName: Maybe<Scalars['String']>
  lastName: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
  company: Maybe<Scalars['String']>
  phone: Maybe<Scalars['String']>
  email: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateContactSaleInput = {
  data: Maybe<ContactSaleInput>
}

export type CreateContactSalePayload = {
  __typename?: 'createContactSalePayload'
  contactSale: Maybe<ContactSale>
}

export type UpdateContactSaleInput = {
  where: Maybe<InputId>
  data: Maybe<EditContactSaleInput>
}

export type UpdateContactSalePayload = {
  __typename?: 'updateContactSalePayload'
  contactSale: Maybe<ContactSale>
}

export type DeleteContactSaleInput = {
  where: Maybe<InputId>
}

export type DeleteContactSalePayload = {
  __typename?: 'deleteContactSalePayload'
  contactSale: Maybe<ContactSale>
}

export type ContactUs = {
  __typename?: 'ContactUs'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  firstName: Maybe<Scalars['String']>
  lastName: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
  company: Maybe<Scalars['String']>
  phone: Maybe<Scalars['String']>
  email: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type ContactUsConnection = {
  __typename?: 'ContactUsConnection'
  values: Maybe<Array<Maybe<ContactUs>>>
  groupBy: Maybe<ContactUsGroupBy>
  aggregate: Maybe<ContactUsAggregator>
}

export type ContactUsAggregator = {
  __typename?: 'ContactUsAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type ContactUsGroupBy = {
  __typename?: 'ContactUsGroupBy'
  id: Maybe<Array<Maybe<ContactUsConnectionId>>>
  created_at: Maybe<Array<Maybe<ContactUsConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<ContactUsConnectionUpdated_At>>>
  firstName: Maybe<Array<Maybe<ContactUsConnectionFirstName>>>
  lastName: Maybe<Array<Maybe<ContactUsConnectionLastName>>>
  title: Maybe<Array<Maybe<ContactUsConnectionTitle>>>
  company: Maybe<Array<Maybe<ContactUsConnectionCompany>>>
  phone: Maybe<Array<Maybe<ContactUsConnectionPhone>>>
  email: Maybe<Array<Maybe<ContactUsConnectionEmail>>>
  published_at: Maybe<Array<Maybe<ContactUsConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<ContactUsConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<ContactUsConnectionUpdated_By>>>
}

export type ContactUsConnectionId = {
  __typename?: 'ContactUsConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<ContactUsConnection>
}

export type ContactUsConnectionCreated_At = {
  __typename?: 'ContactUsConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<ContactUsConnection>
}

export type ContactUsConnectionUpdated_At = {
  __typename?: 'ContactUsConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<ContactUsConnection>
}

export type ContactUsConnectionFirstName = {
  __typename?: 'ContactUsConnectionFirstName'
  key: Maybe<Scalars['String']>
  connection: Maybe<ContactUsConnection>
}

export type ContactUsConnectionLastName = {
  __typename?: 'ContactUsConnectionLastName'
  key: Maybe<Scalars['String']>
  connection: Maybe<ContactUsConnection>
}

export type ContactUsConnectionTitle = {
  __typename?: 'ContactUsConnectionTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<ContactUsConnection>
}

export type ContactUsConnectionCompany = {
  __typename?: 'ContactUsConnectionCompany'
  key: Maybe<Scalars['String']>
  connection: Maybe<ContactUsConnection>
}

export type ContactUsConnectionPhone = {
  __typename?: 'ContactUsConnectionPhone'
  key: Maybe<Scalars['String']>
  connection: Maybe<ContactUsConnection>
}

export type ContactUsConnectionEmail = {
  __typename?: 'ContactUsConnectionEmail'
  key: Maybe<Scalars['String']>
  connection: Maybe<ContactUsConnection>
}

export type ContactUsConnectionPublished_At = {
  __typename?: 'ContactUsConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<ContactUsConnection>
}

export type ContactUsConnectionCreated_By = {
  __typename?: 'ContactUsConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<ContactUsConnection>
}

export type ContactUsConnectionUpdated_By = {
  __typename?: 'ContactUsConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<ContactUsConnection>
}

export type ContactUsInput = {
  firstName: Maybe<Scalars['String']>
  lastName: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
  company: Maybe<Scalars['String']>
  phone: Maybe<Scalars['String']>
  email: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditContactUsInput = {
  firstName: Maybe<Scalars['String']>
  lastName: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
  company: Maybe<Scalars['String']>
  phone: Maybe<Scalars['String']>
  email: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateContactUsInput = {
  data: Maybe<ContactUsInput>
}

export type CreateContactUsPayload = {
  __typename?: 'createContactUsPayload'
  contactUs: Maybe<ContactUs>
}

export type UpdateContactUsInput = {
  where: Maybe<InputId>
  data: Maybe<EditContactUsInput>
}

export type UpdateContactUsPayload = {
  __typename?: 'updateContactUsPayload'
  contactUs: Maybe<ContactUs>
}

export type DeleteContactUsInput = {
  where: Maybe<InputId>
}

export type DeleteContactUsPayload = {
  __typename?: 'deleteContactUsPayload'
  contactUs: Maybe<ContactUs>
}

export type Customer = {
  __typename?: 'Customer'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  title: Maybe<ComponentPageTitleZone>
  caseStudy: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  feature: Maybe<Array<Maybe<ComponentPageHarnessModule>>>
  logoRow1: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  logoRow2: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type CustomerInput = {
  title: Maybe<ComponentPageTitleZoneInput>
  caseStudy: Maybe<Array<Maybe<ComponentPageCaseStudyZoneInput>>>
  feature: Maybe<Array<Maybe<ComponentPageHarnessModuleInput>>>
  logoRow1: Maybe<Array<Maybe<ComponentPageCustomerLogoZoneInput>>>
  logoRow2: Maybe<Array<Maybe<ComponentPageCustomerLogoZoneInput>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditCustomerInput = {
  title: Maybe<EditComponentPageTitleZoneInput>
  caseStudy: Maybe<Array<Maybe<EditComponentPageCaseStudyZoneInput>>>
  feature: Maybe<Array<Maybe<EditComponentPageHarnessModuleInput>>>
  logoRow1: Maybe<Array<Maybe<EditComponentPageCustomerLogoZoneInput>>>
  logoRow2: Maybe<Array<Maybe<EditComponentPageCustomerLogoZoneInput>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdateCustomerInput = {
  data: Maybe<EditCustomerInput>
}

export type UpdateCustomerPayload = {
  __typename?: 'updateCustomerPayload'
  customer: Maybe<Customer>
}

export type DeleteCustomerPayload = {
  __typename?: 'deleteCustomerPayload'
  customer: Maybe<Customer>
}

export type DevOpsTools = {
  __typename?: 'DevOpsTools'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  hero: Maybe<ComponentPageTitleImgZone>
  introTitle: Maybe<Scalars['String']>
  introDesc: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type DevOpsToolInput = {
  hero: Maybe<ComponentPageTitleImgZoneInput>
  introTitle: Maybe<Scalars['String']>
  introDesc: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditDevOpsToolInput = {
  hero: Maybe<EditComponentPageTitleImgZoneInput>
  introTitle: Maybe<Scalars['String']>
  introDesc: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdateDevOpsToolInput = {
  data: Maybe<EditDevOpsToolInput>
}

export type UpdateDevOpsToolPayload = {
  __typename?: 'updateDevOpsToolPayload'
  devOpsTool: Maybe<DevOpsTools>
}

export type DeleteDevOpsToolPayload = {
  __typename?: 'deleteDevOpsToolPayload'
  devOpsTool: Maybe<DevOpsTools>
}

export type EBook = {
  __typename?: 'EBook'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  title: Scalars['String']
  slug: Scalars['String']
  preview_image: Maybe<UploadFile>
  content: Maybe<Scalars['String']>
  published: Maybe<Scalars['DateTime']>
  detail_image: Maybe<UploadFile>
  mkto_form_id: Maybe<Scalars['Int']>
  pdf: Maybe<UploadFile>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type EBookConnection = {
  __typename?: 'EBookConnection'
  values: Maybe<Array<Maybe<EBook>>>
  groupBy: Maybe<EBookGroupBy>
  aggregate: Maybe<EBookAggregator>
}

export type EBookAggregator = {
  __typename?: 'EBookAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
  sum: Maybe<EBookAggregatorSum>
  avg: Maybe<EBookAggregatorAvg>
  min: Maybe<EBookAggregatorMin>
  max: Maybe<EBookAggregatorMax>
}

export type EBookAggregatorSum = {
  __typename?: 'EBookAggregatorSum'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type EBookAggregatorAvg = {
  __typename?: 'EBookAggregatorAvg'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type EBookAggregatorMin = {
  __typename?: 'EBookAggregatorMin'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type EBookAggregatorMax = {
  __typename?: 'EBookAggregatorMax'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type EBookGroupBy = {
  __typename?: 'EBookGroupBy'
  id: Maybe<Array<Maybe<EBookConnectionId>>>
  created_at: Maybe<Array<Maybe<EBookConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<EBookConnectionUpdated_At>>>
  title: Maybe<Array<Maybe<EBookConnectionTitle>>>
  slug: Maybe<Array<Maybe<EBookConnectionSlug>>>
  preview_image: Maybe<Array<Maybe<EBookConnectionPreview_Image>>>
  content: Maybe<Array<Maybe<EBookConnectionContent>>>
  published: Maybe<Array<Maybe<EBookConnectionPublished>>>
  detail_image: Maybe<Array<Maybe<EBookConnectionDetail_Image>>>
  mkto_form_id: Maybe<Array<Maybe<EBookConnectionMkto_Form_Id>>>
  pdf: Maybe<Array<Maybe<EBookConnectionPdf>>>
  published_at: Maybe<Array<Maybe<EBookConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<EBookConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<EBookConnectionUpdated_By>>>
}

export type EBookConnectionId = {
  __typename?: 'EBookConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<EBookConnection>
}

export type EBookConnectionCreated_At = {
  __typename?: 'EBookConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<EBookConnection>
}

export type EBookConnectionUpdated_At = {
  __typename?: 'EBookConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<EBookConnection>
}

export type EBookConnectionTitle = {
  __typename?: 'EBookConnectionTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<EBookConnection>
}

export type EBookConnectionSlug = {
  __typename?: 'EBookConnectionSlug'
  key: Maybe<Scalars['String']>
  connection: Maybe<EBookConnection>
}

export type EBookConnectionPreview_Image = {
  __typename?: 'EBookConnectionPreview_image'
  key: Maybe<Scalars['ID']>
  connection: Maybe<EBookConnection>
}

export type EBookConnectionContent = {
  __typename?: 'EBookConnectionContent'
  key: Maybe<Scalars['String']>
  connection: Maybe<EBookConnection>
}

export type EBookConnectionPublished = {
  __typename?: 'EBookConnectionPublished'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<EBookConnection>
}

export type EBookConnectionDetail_Image = {
  __typename?: 'EBookConnectionDetail_image'
  key: Maybe<Scalars['ID']>
  connection: Maybe<EBookConnection>
}

export type EBookConnectionMkto_Form_Id = {
  __typename?: 'EBookConnectionMkto_form_id'
  key: Maybe<Scalars['Int']>
  connection: Maybe<EBookConnection>
}

export type EBookConnectionPdf = {
  __typename?: 'EBookConnectionPdf'
  key: Maybe<Scalars['ID']>
  connection: Maybe<EBookConnection>
}

export type EBookConnectionPublished_At = {
  __typename?: 'EBookConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<EBookConnection>
}

export type EBookConnectionCreated_By = {
  __typename?: 'EBookConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<EBookConnection>
}

export type EBookConnectionUpdated_By = {
  __typename?: 'EBookConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<EBookConnection>
}

export type EBookInput = {
  title: Scalars['String']
  slug: Scalars['String']
  preview_image: Maybe<Scalars['ID']>
  content: Maybe<Scalars['String']>
  published: Maybe<Scalars['DateTime']>
  detail_image: Maybe<Scalars['ID']>
  mkto_form_id: Maybe<Scalars['Int']>
  pdf: Maybe<Scalars['ID']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditEBookInput = {
  title: Maybe<Scalars['String']>
  slug: Maybe<Scalars['String']>
  preview_image: Maybe<Scalars['ID']>
  content: Maybe<Scalars['String']>
  published: Maybe<Scalars['DateTime']>
  detail_image: Maybe<Scalars['ID']>
  mkto_form_id: Maybe<Scalars['Int']>
  pdf: Maybe<Scalars['ID']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateEBookInput = {
  data: Maybe<EBookInput>
}

export type CreateEBookPayload = {
  __typename?: 'createEBookPayload'
  eBook: Maybe<EBook>
}

export type UpdateEBookInput = {
  where: Maybe<InputId>
  data: Maybe<EditEBookInput>
}

export type UpdateEBookPayload = {
  __typename?: 'updateEBookPayload'
  eBook: Maybe<EBook>
}

export type DeleteEBookInput = {
  where: Maybe<InputId>
}

export type DeleteEBookPayload = {
  __typename?: 'deleteEBookPayload'
  eBook: Maybe<EBook>
}

export type Event = {
  __typename?: 'Event'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  title: Scalars['String']
  slug: Scalars['String']
  topBannerText: Maybe<Scalars['String']>
  topBannerImg: Maybe<UploadFile>
  profilesHeading: Maybe<Scalars['String']>
  detailsLeftColumn: Maybe<Scalars['String']>
  detailsRightColumn: Maybe<Scalars['String']>
  registration: Maybe<Scalars['Boolean']>
  mkto_form_id: Maybe<Scalars['String']>
  mktoFormTitle: Maybe<Scalars['String']>
  registerImage: Maybe<UploadFile>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
  panelists: Maybe<Array<Maybe<Panelist>>>
}

export type EventPanelistsArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type EventConnection = {
  __typename?: 'EventConnection'
  values: Maybe<Array<Maybe<Event>>>
  groupBy: Maybe<EventGroupBy>
  aggregate: Maybe<EventAggregator>
}

export type EventAggregator = {
  __typename?: 'EventAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type EventGroupBy = {
  __typename?: 'EventGroupBy'
  id: Maybe<Array<Maybe<EventConnectionId>>>
  created_at: Maybe<Array<Maybe<EventConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<EventConnectionUpdated_At>>>
  title: Maybe<Array<Maybe<EventConnectionTitle>>>
  slug: Maybe<Array<Maybe<EventConnectionSlug>>>
  topBannerText: Maybe<Array<Maybe<EventConnectionTopBannerText>>>
  topBannerImg: Maybe<Array<Maybe<EventConnectionTopBannerImg>>>
  profilesHeading: Maybe<Array<Maybe<EventConnectionProfilesHeading>>>
  detailsLeftColumn: Maybe<Array<Maybe<EventConnectionDetailsLeftColumn>>>
  detailsRightColumn: Maybe<Array<Maybe<EventConnectionDetailsRightColumn>>>
  registration: Maybe<Array<Maybe<EventConnectionRegistration>>>
  mkto_form_id: Maybe<Array<Maybe<EventConnectionMkto_Form_Id>>>
  mktoFormTitle: Maybe<Array<Maybe<EventConnectionMktoFormTitle>>>
  registerImage: Maybe<Array<Maybe<EventConnectionRegisterImage>>>
  published_at: Maybe<Array<Maybe<EventConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<EventConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<EventConnectionUpdated_By>>>
}

export type EventConnectionId = {
  __typename?: 'EventConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<EventConnection>
}

export type EventConnectionCreated_At = {
  __typename?: 'EventConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<EventConnection>
}

export type EventConnectionUpdated_At = {
  __typename?: 'EventConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<EventConnection>
}

export type EventConnectionTitle = {
  __typename?: 'EventConnectionTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<EventConnection>
}

export type EventConnectionSlug = {
  __typename?: 'EventConnectionSlug'
  key: Maybe<Scalars['String']>
  connection: Maybe<EventConnection>
}

export type EventConnectionTopBannerText = {
  __typename?: 'EventConnectionTopBannerText'
  key: Maybe<Scalars['String']>
  connection: Maybe<EventConnection>
}

export type EventConnectionTopBannerImg = {
  __typename?: 'EventConnectionTopBannerImg'
  key: Maybe<Scalars['ID']>
  connection: Maybe<EventConnection>
}

export type EventConnectionProfilesHeading = {
  __typename?: 'EventConnectionProfilesHeading'
  key: Maybe<Scalars['String']>
  connection: Maybe<EventConnection>
}

export type EventConnectionDetailsLeftColumn = {
  __typename?: 'EventConnectionDetailsLeftColumn'
  key: Maybe<Scalars['String']>
  connection: Maybe<EventConnection>
}

export type EventConnectionDetailsRightColumn = {
  __typename?: 'EventConnectionDetailsRightColumn'
  key: Maybe<Scalars['String']>
  connection: Maybe<EventConnection>
}

export type EventConnectionRegistration = {
  __typename?: 'EventConnectionRegistration'
  key: Maybe<Scalars['Boolean']>
  connection: Maybe<EventConnection>
}

export type EventConnectionMkto_Form_Id = {
  __typename?: 'EventConnectionMkto_form_id'
  key: Maybe<Scalars['String']>
  connection: Maybe<EventConnection>
}

export type EventConnectionMktoFormTitle = {
  __typename?: 'EventConnectionMktoFormTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<EventConnection>
}

export type EventConnectionRegisterImage = {
  __typename?: 'EventConnectionRegisterImage'
  key: Maybe<Scalars['ID']>
  connection: Maybe<EventConnection>
}

export type EventConnectionPublished_At = {
  __typename?: 'EventConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<EventConnection>
}

export type EventConnectionCreated_By = {
  __typename?: 'EventConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<EventConnection>
}

export type EventConnectionUpdated_By = {
  __typename?: 'EventConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<EventConnection>
}

export type EventInput = {
  title: Scalars['String']
  slug: Scalars['String']
  topBannerText: Maybe<Scalars['String']>
  topBannerImg: Maybe<Scalars['ID']>
  profilesHeading: Maybe<Scalars['String']>
  panelists: Maybe<Array<Maybe<Scalars['ID']>>>
  detailsLeftColumn: Maybe<Scalars['String']>
  detailsRightColumn: Maybe<Scalars['String']>
  registration: Maybe<Scalars['Boolean']>
  mkto_form_id: Maybe<Scalars['String']>
  mktoFormTitle: Maybe<Scalars['String']>
  registerImage: Maybe<Scalars['ID']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditEventInput = {
  title: Maybe<Scalars['String']>
  slug: Maybe<Scalars['String']>
  topBannerText: Maybe<Scalars['String']>
  topBannerImg: Maybe<Scalars['ID']>
  profilesHeading: Maybe<Scalars['String']>
  panelists: Maybe<Array<Maybe<Scalars['ID']>>>
  detailsLeftColumn: Maybe<Scalars['String']>
  detailsRightColumn: Maybe<Scalars['String']>
  registration: Maybe<Scalars['Boolean']>
  mkto_form_id: Maybe<Scalars['String']>
  mktoFormTitle: Maybe<Scalars['String']>
  registerImage: Maybe<Scalars['ID']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateEventInput = {
  data: Maybe<EventInput>
}

export type CreateEventPayload = {
  __typename?: 'createEventPayload'
  event: Maybe<Event>
}

export type UpdateEventInput = {
  where: Maybe<InputId>
  data: Maybe<EditEventInput>
}

export type UpdateEventPayload = {
  __typename?: 'updateEventPayload'
  event: Maybe<Event>
}

export type DeleteEventInput = {
  where: Maybe<InputId>
}

export type DeleteEventPayload = {
  __typename?: 'deleteEventPayload'
  event: Maybe<Event>
}

export enum Enum_Harnessmodule_Modulestyle {
  Deployment = 'deployment',
  Builds = 'builds',
  Cloudcost = 'cloudcost',
  Featureflag = 'featureflag',
  Changeintel = 'changeintel'
}

export type HarnessModule = {
  __typename?: 'HarnessModule'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  moduleName: Maybe<Scalars['String']>
  moduleDesc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  moduleStyle: Maybe<Enum_Harnessmodule_Modulestyle>
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
  moduleLogo: Maybe<Array<Maybe<UploadFile>>>
}

export type HarnessModuleModuleLogoArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type HarnessModuleConnection = {
  __typename?: 'HarnessModuleConnection'
  values: Maybe<Array<Maybe<HarnessModule>>>
  groupBy: Maybe<HarnessModuleGroupBy>
  aggregate: Maybe<HarnessModuleAggregator>
}

export type HarnessModuleAggregator = {
  __typename?: 'HarnessModuleAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type HarnessModuleGroupBy = {
  __typename?: 'HarnessModuleGroupBy'
  id: Maybe<Array<Maybe<HarnessModuleConnectionId>>>
  created_at: Maybe<Array<Maybe<HarnessModuleConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<HarnessModuleConnectionUpdated_At>>>
  moduleName: Maybe<Array<Maybe<HarnessModuleConnectionModuleName>>>
  moduleDesc: Maybe<Array<Maybe<HarnessModuleConnectionModuleDesc>>>
  link: Maybe<Array<Maybe<HarnessModuleConnectionLink>>>
  moduleStyle: Maybe<Array<Maybe<HarnessModuleConnectionModuleStyle>>>
  item: Maybe<Array<Maybe<HarnessModuleConnectionItem>>>
  published_at: Maybe<Array<Maybe<HarnessModuleConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<HarnessModuleConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<HarnessModuleConnectionUpdated_By>>>
}

export type HarnessModuleConnectionId = {
  __typename?: 'HarnessModuleConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<HarnessModuleConnection>
}

export type HarnessModuleConnectionCreated_At = {
  __typename?: 'HarnessModuleConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<HarnessModuleConnection>
}

export type HarnessModuleConnectionUpdated_At = {
  __typename?: 'HarnessModuleConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<HarnessModuleConnection>
}

export type HarnessModuleConnectionModuleName = {
  __typename?: 'HarnessModuleConnectionModuleName'
  key: Maybe<Scalars['String']>
  connection: Maybe<HarnessModuleConnection>
}

export type HarnessModuleConnectionModuleDesc = {
  __typename?: 'HarnessModuleConnectionModuleDesc'
  key: Maybe<Scalars['String']>
  connection: Maybe<HarnessModuleConnection>
}

export type HarnessModuleConnectionLink = {
  __typename?: 'HarnessModuleConnectionLink'
  key: Maybe<Scalars['String']>
  connection: Maybe<HarnessModuleConnection>
}

export type HarnessModuleConnectionModuleStyle = {
  __typename?: 'HarnessModuleConnectionModuleStyle'
  key: Maybe<Scalars['String']>
  connection: Maybe<HarnessModuleConnection>
}

export type HarnessModuleConnectionItem = {
  __typename?: 'HarnessModuleConnectionItem'
  key: Maybe<Scalars['String']>
  connection: Maybe<HarnessModuleConnection>
}

export type HarnessModuleConnectionPublished_At = {
  __typename?: 'HarnessModuleConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<HarnessModuleConnection>
}

export type HarnessModuleConnectionCreated_By = {
  __typename?: 'HarnessModuleConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<HarnessModuleConnection>
}

export type HarnessModuleConnectionUpdated_By = {
  __typename?: 'HarnessModuleConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<HarnessModuleConnection>
}

export type HarnessModuleInput = {
  moduleName: Maybe<Scalars['String']>
  moduleLogo: Maybe<Array<Maybe<Scalars['ID']>>>
  moduleDesc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  moduleStyle: Maybe<Enum_Harnessmodule_Modulestyle>
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditHarnessModuleInput = {
  moduleName: Maybe<Scalars['String']>
  moduleLogo: Maybe<Array<Maybe<Scalars['ID']>>>
  moduleDesc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  moduleStyle: Maybe<Enum_Harnessmodule_Modulestyle>
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateHarnessModuleInput = {
  data: Maybe<HarnessModuleInput>
}

export type CreateHarnessModulePayload = {
  __typename?: 'createHarnessModulePayload'
  harnessModule: Maybe<HarnessModule>
}

export type UpdateHarnessModuleInput = {
  where: Maybe<InputId>
  data: Maybe<EditHarnessModuleInput>
}

export type UpdateHarnessModulePayload = {
  __typename?: 'updateHarnessModulePayload'
  harnessModule: Maybe<HarnessModule>
}

export type DeleteHarnessModuleInput = {
  where: Maybe<InputId>
}

export type DeleteHarnessModulePayload = {
  __typename?: 'deleteHarnessModulePayload'
  harnessModule: Maybe<HarnessModule>
}

export type HarnessSubscription = {
  __typename?: 'HarnessSubscription'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  mainBody: Maybe<ComponentPageRichTextZone>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type HarnessSubscriptionInput = {
  mainBody: Maybe<ComponentPageRichTextZoneInput>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditHarnessSubscriptionInput = {
  mainBody: Maybe<EditComponentPageRichTextZoneInput>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdateHarnessSubscriptionInput = {
  data: Maybe<EditHarnessSubscriptionInput>
}

export type UpdateHarnessSubscriptionPayload = {
  __typename?: 'updateHarnessSubscriptionPayload'
  harnessSubscription: Maybe<HarnessSubscription>
}

export type DeleteHarnessSubscriptionPayload = {
  __typename?: 'deleteHarnessSubscriptionPayload'
  harnessSubscription: Maybe<HarnessSubscription>
}

export type Home = {
  __typename?: 'Home'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  title: Maybe<ComponentPageTitleZone>
  feature: Maybe<Array<Maybe<ComponentPageTextZone>>>
  explore: Maybe<Array<Maybe<ComponentPageOptionZone>>>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type HomeInput = {
  title: Maybe<ComponentPageTitleZoneInput>
  feature: Maybe<Array<Maybe<ComponentPageTextZoneInput>>>
  explore: Maybe<Array<Maybe<ComponentPageOptionZoneInput>>>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZoneInput>>>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZoneInput>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditHomeInput = {
  title: Maybe<EditComponentPageTitleZoneInput>
  feature: Maybe<Array<Maybe<EditComponentPageTextZoneInput>>>
  explore: Maybe<Array<Maybe<EditComponentPageOptionZoneInput>>>
  customerLogos: Maybe<Array<Maybe<EditComponentPageCustomerLogoZoneInput>>>
  caseStudies: Maybe<Array<Maybe<EditComponentPageCaseStudyZoneInput>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdateHomeInput = {
  data: Maybe<EditHomeInput>
}

export type UpdateHomePayload = {
  __typename?: 'updateHomePayload'
  home: Maybe<Home>
}

export type DeleteHomePayload = {
  __typename?: 'deleteHomePayload'
  home: Maybe<Home>
}

export type Industry = {
  __typename?: 'Industry'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type IndustryConnection = {
  __typename?: 'IndustryConnection'
  values: Maybe<Array<Maybe<Industry>>>
  groupBy: Maybe<IndustryGroupBy>
  aggregate: Maybe<IndustryAggregator>
}

export type IndustryAggregator = {
  __typename?: 'IndustryAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type IndustryGroupBy = {
  __typename?: 'IndustryGroupBy'
  id: Maybe<Array<Maybe<IndustryConnectionId>>>
  created_at: Maybe<Array<Maybe<IndustryConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<IndustryConnectionUpdated_At>>>
  item: Maybe<Array<Maybe<IndustryConnectionItem>>>
  published_at: Maybe<Array<Maybe<IndustryConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<IndustryConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<IndustryConnectionUpdated_By>>>
}

export type IndustryConnectionId = {
  __typename?: 'IndustryConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<IndustryConnection>
}

export type IndustryConnectionCreated_At = {
  __typename?: 'IndustryConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<IndustryConnection>
}

export type IndustryConnectionUpdated_At = {
  __typename?: 'IndustryConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<IndustryConnection>
}

export type IndustryConnectionItem = {
  __typename?: 'IndustryConnectionItem'
  key: Maybe<Scalars['String']>
  connection: Maybe<IndustryConnection>
}

export type IndustryConnectionPublished_At = {
  __typename?: 'IndustryConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<IndustryConnection>
}

export type IndustryConnectionCreated_By = {
  __typename?: 'IndustryConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<IndustryConnection>
}

export type IndustryConnectionUpdated_By = {
  __typename?: 'IndustryConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<IndustryConnection>
}

export type IndustryInput = {
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditIndustryInput = {
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateIndustryInput = {
  data: Maybe<IndustryInput>
}

export type CreateIndustryPayload = {
  __typename?: 'createIndustryPayload'
  industry: Maybe<Industry>
}

export type UpdateIndustryInput = {
  where: Maybe<InputId>
  data: Maybe<EditIndustryInput>
}

export type UpdateIndustryPayload = {
  __typename?: 'updateIndustryPayload'
  industry: Maybe<Industry>
}

export type DeleteIndustryInput = {
  where: Maybe<InputId>
}

export type DeleteIndustryPayload = {
  __typename?: 'deleteIndustryPayload'
  industry: Maybe<Industry>
}

export type Integration = {
  __typename?: 'Integration'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type IntegrationConnection = {
  __typename?: 'IntegrationConnection'
  values: Maybe<Array<Maybe<Integration>>>
  groupBy: Maybe<IntegrationGroupBy>
  aggregate: Maybe<IntegrationAggregator>
}

export type IntegrationAggregator = {
  __typename?: 'IntegrationAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type IntegrationGroupBy = {
  __typename?: 'IntegrationGroupBy'
  id: Maybe<Array<Maybe<IntegrationConnectionId>>>
  created_at: Maybe<Array<Maybe<IntegrationConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<IntegrationConnectionUpdated_At>>>
  item: Maybe<Array<Maybe<IntegrationConnectionItem>>>
  published_at: Maybe<Array<Maybe<IntegrationConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<IntegrationConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<IntegrationConnectionUpdated_By>>>
}

export type IntegrationConnectionId = {
  __typename?: 'IntegrationConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<IntegrationConnection>
}

export type IntegrationConnectionCreated_At = {
  __typename?: 'IntegrationConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<IntegrationConnection>
}

export type IntegrationConnectionUpdated_At = {
  __typename?: 'IntegrationConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<IntegrationConnection>
}

export type IntegrationConnectionItem = {
  __typename?: 'IntegrationConnectionItem'
  key: Maybe<Scalars['String']>
  connection: Maybe<IntegrationConnection>
}

export type IntegrationConnectionPublished_At = {
  __typename?: 'IntegrationConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<IntegrationConnection>
}

export type IntegrationConnectionCreated_By = {
  __typename?: 'IntegrationConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<IntegrationConnection>
}

export type IntegrationConnectionUpdated_By = {
  __typename?: 'IntegrationConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<IntegrationConnection>
}

export type IntegrationInput = {
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditIntegrationInput = {
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateIntegrationInput = {
  data: Maybe<IntegrationInput>
}

export type CreateIntegrationPayload = {
  __typename?: 'createIntegrationPayload'
  integration: Maybe<Integration>
}

export type UpdateIntegrationInput = {
  where: Maybe<InputId>
  data: Maybe<EditIntegrationInput>
}

export type UpdateIntegrationPayload = {
  __typename?: 'updateIntegrationPayload'
  integration: Maybe<Integration>
}

export type DeleteIntegrationInput = {
  where: Maybe<InputId>
}

export type DeleteIntegrationPayload = {
  __typename?: 'deleteIntegrationPayload'
  integration: Maybe<Integration>
}

export type MarketingSite = {
  __typename?: 'MarketingSite'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  heroTitle: Maybe<Scalars['String']>
  heroSubTitle: Maybe<Scalars['String']>
  name: Maybe<Scalars['String']>
  piplineTitle: Maybe<Scalars['String']>
  pipelineDesc: Maybe<Scalars['String']>
  developerTitle: Maybe<Scalars['String']>
  developerDesc: Maybe<Scalars['String']>
  aiTitle: Maybe<Scalars['String']>
  aiDesc: Maybe<Scalars['String']>
  governaceTitle: Maybe<Scalars['String']>
  governaceDesc: Maybe<Scalars['String']>
  cdTitle: Maybe<Scalars['String']>
  cdSubTitle: Maybe<Scalars['String']>
  cdDesc: Maybe<Scalars['String']>
  ciTitle: Maybe<Scalars['String']>
  ciSubTitle: Maybe<Scalars['String']>
  ciDesc: Maybe<Scalars['String']>
  cloudCostTitle: Maybe<Scalars['String']>
  cloudCostSubTitle: Maybe<Scalars['String']>
  cloudCostDesc: Maybe<Scalars['String']>
  featureFlagsTitle: Maybe<Scalars['String']>
  featureFlagsSubTitle: Maybe<Scalars['String']>
  featureFlagsDesc: Maybe<Scalars['String']>
  chIntelTitle: Maybe<Scalars['String']>
  chIntelSubTitle: Maybe<Scalars['String']>
  chIntelDesc: Maybe<Scalars['String']>
  caseStudy1: Maybe<Scalars['String']>
  caseStudy1Client: Maybe<Scalars['String']>
  caseStudy2: Maybe<Scalars['String']>
  caseStudy2Client: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type MarketingSiteConnection = {
  __typename?: 'MarketingSiteConnection'
  values: Maybe<Array<Maybe<MarketingSite>>>
  groupBy: Maybe<MarketingSiteGroupBy>
  aggregate: Maybe<MarketingSiteAggregator>
}

export type MarketingSiteAggregator = {
  __typename?: 'MarketingSiteAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type MarketingSiteGroupBy = {
  __typename?: 'MarketingSiteGroupBy'
  id: Maybe<Array<Maybe<MarketingSiteConnectionId>>>
  created_at: Maybe<Array<Maybe<MarketingSiteConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<MarketingSiteConnectionUpdated_At>>>
  heroTitle: Maybe<Array<Maybe<MarketingSiteConnectionHeroTitle>>>
  heroSubTitle: Maybe<Array<Maybe<MarketingSiteConnectionHeroSubTitle>>>
  name: Maybe<Array<Maybe<MarketingSiteConnectionName>>>
  piplineTitle: Maybe<Array<Maybe<MarketingSiteConnectionPiplineTitle>>>
  pipelineDesc: Maybe<Array<Maybe<MarketingSiteConnectionPipelineDesc>>>
  developerTitle: Maybe<Array<Maybe<MarketingSiteConnectionDeveloperTitle>>>
  developerDesc: Maybe<Array<Maybe<MarketingSiteConnectionDeveloperDesc>>>
  aiTitle: Maybe<Array<Maybe<MarketingSiteConnectionAiTitle>>>
  aiDesc: Maybe<Array<Maybe<MarketingSiteConnectionAiDesc>>>
  governaceTitle: Maybe<Array<Maybe<MarketingSiteConnectionGovernaceTitle>>>
  governaceDesc: Maybe<Array<Maybe<MarketingSiteConnectionGovernaceDesc>>>
  cdTitle: Maybe<Array<Maybe<MarketingSiteConnectionCdTitle>>>
  cdSubTitle: Maybe<Array<Maybe<MarketingSiteConnectionCdSubTitle>>>
  cdDesc: Maybe<Array<Maybe<MarketingSiteConnectionCdDesc>>>
  ciTitle: Maybe<Array<Maybe<MarketingSiteConnectionCiTitle>>>
  ciSubTitle: Maybe<Array<Maybe<MarketingSiteConnectionCiSubTitle>>>
  ciDesc: Maybe<Array<Maybe<MarketingSiteConnectionCiDesc>>>
  cloudCostTitle: Maybe<Array<Maybe<MarketingSiteConnectionCloudCostTitle>>>
  cloudCostSubTitle: Maybe<Array<Maybe<MarketingSiteConnectionCloudCostSubTitle>>>
  cloudCostDesc: Maybe<Array<Maybe<MarketingSiteConnectionCloudCostDesc>>>
  featureFlagsTitle: Maybe<Array<Maybe<MarketingSiteConnectionFeatureFlagsTitle>>>
  featureFlagsSubTitle: Maybe<Array<Maybe<MarketingSiteConnectionFeatureFlagsSubTitle>>>
  featureFlagsDesc: Maybe<Array<Maybe<MarketingSiteConnectionFeatureFlagsDesc>>>
  chIntelTitle: Maybe<Array<Maybe<MarketingSiteConnectionChIntelTitle>>>
  chIntelSubTitle: Maybe<Array<Maybe<MarketingSiteConnectionChIntelSubTitle>>>
  chIntelDesc: Maybe<Array<Maybe<MarketingSiteConnectionChIntelDesc>>>
  caseStudy1: Maybe<Array<Maybe<MarketingSiteConnectionCaseStudy1>>>
  caseStudy1Client: Maybe<Array<Maybe<MarketingSiteConnectionCaseStudy1Client>>>
  caseStudy2: Maybe<Array<Maybe<MarketingSiteConnectionCaseStudy2>>>
  caseStudy2Client: Maybe<Array<Maybe<MarketingSiteConnectionCaseStudy2Client>>>
  published_at: Maybe<Array<Maybe<MarketingSiteConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<MarketingSiteConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<MarketingSiteConnectionUpdated_By>>>
}

export type MarketingSiteConnectionId = {
  __typename?: 'MarketingSiteConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionCreated_At = {
  __typename?: 'MarketingSiteConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionUpdated_At = {
  __typename?: 'MarketingSiteConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionHeroTitle = {
  __typename?: 'MarketingSiteConnectionHeroTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionHeroSubTitle = {
  __typename?: 'MarketingSiteConnectionHeroSubTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionName = {
  __typename?: 'MarketingSiteConnectionName'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionPiplineTitle = {
  __typename?: 'MarketingSiteConnectionPiplineTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionPipelineDesc = {
  __typename?: 'MarketingSiteConnectionPipelineDesc'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionDeveloperTitle = {
  __typename?: 'MarketingSiteConnectionDeveloperTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionDeveloperDesc = {
  __typename?: 'MarketingSiteConnectionDeveloperDesc'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionAiTitle = {
  __typename?: 'MarketingSiteConnectionAiTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionAiDesc = {
  __typename?: 'MarketingSiteConnectionAiDesc'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionGovernaceTitle = {
  __typename?: 'MarketingSiteConnectionGovernaceTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionGovernaceDesc = {
  __typename?: 'MarketingSiteConnectionGovernaceDesc'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionCdTitle = {
  __typename?: 'MarketingSiteConnectionCdTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionCdSubTitle = {
  __typename?: 'MarketingSiteConnectionCdSubTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionCdDesc = {
  __typename?: 'MarketingSiteConnectionCdDesc'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionCiTitle = {
  __typename?: 'MarketingSiteConnectionCiTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionCiSubTitle = {
  __typename?: 'MarketingSiteConnectionCiSubTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionCiDesc = {
  __typename?: 'MarketingSiteConnectionCiDesc'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionCloudCostTitle = {
  __typename?: 'MarketingSiteConnectionCloudCostTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionCloudCostSubTitle = {
  __typename?: 'MarketingSiteConnectionCloudCostSubTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionCloudCostDesc = {
  __typename?: 'MarketingSiteConnectionCloudCostDesc'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionFeatureFlagsTitle = {
  __typename?: 'MarketingSiteConnectionFeatureFlagsTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionFeatureFlagsSubTitle = {
  __typename?: 'MarketingSiteConnectionFeatureFlagsSubTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionFeatureFlagsDesc = {
  __typename?: 'MarketingSiteConnectionFeatureFlagsDesc'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionChIntelTitle = {
  __typename?: 'MarketingSiteConnectionChIntelTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionChIntelSubTitle = {
  __typename?: 'MarketingSiteConnectionChIntelSubTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionChIntelDesc = {
  __typename?: 'MarketingSiteConnectionChIntelDesc'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionCaseStudy1 = {
  __typename?: 'MarketingSiteConnectionCaseStudy1'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionCaseStudy1Client = {
  __typename?: 'MarketingSiteConnectionCaseStudy1Client'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionCaseStudy2 = {
  __typename?: 'MarketingSiteConnectionCaseStudy2'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionCaseStudy2Client = {
  __typename?: 'MarketingSiteConnectionCaseStudy2Client'
  key: Maybe<Scalars['String']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionPublished_At = {
  __typename?: 'MarketingSiteConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionCreated_By = {
  __typename?: 'MarketingSiteConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteConnectionUpdated_By = {
  __typename?: 'MarketingSiteConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<MarketingSiteConnection>
}

export type MarketingSiteInput = {
  heroTitle: Maybe<Scalars['String']>
  heroSubTitle: Maybe<Scalars['String']>
  name: Maybe<Scalars['String']>
  piplineTitle: Maybe<Scalars['String']>
  pipelineDesc: Maybe<Scalars['String']>
  developerTitle: Maybe<Scalars['String']>
  developerDesc: Maybe<Scalars['String']>
  aiTitle: Maybe<Scalars['String']>
  aiDesc: Maybe<Scalars['String']>
  governaceTitle: Maybe<Scalars['String']>
  governaceDesc: Maybe<Scalars['String']>
  cdTitle: Maybe<Scalars['String']>
  cdSubTitle: Maybe<Scalars['String']>
  cdDesc: Maybe<Scalars['String']>
  ciTitle: Maybe<Scalars['String']>
  ciSubTitle: Maybe<Scalars['String']>
  ciDesc: Maybe<Scalars['String']>
  cloudCostTitle: Maybe<Scalars['String']>
  cloudCostSubTitle: Maybe<Scalars['String']>
  cloudCostDesc: Maybe<Scalars['String']>
  featureFlagsTitle: Maybe<Scalars['String']>
  featureFlagsSubTitle: Maybe<Scalars['String']>
  featureFlagsDesc: Maybe<Scalars['String']>
  chIntelTitle: Maybe<Scalars['String']>
  chIntelSubTitle: Maybe<Scalars['String']>
  chIntelDesc: Maybe<Scalars['String']>
  caseStudy1: Maybe<Scalars['String']>
  caseStudy1Client: Maybe<Scalars['String']>
  caseStudy2: Maybe<Scalars['String']>
  caseStudy2Client: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditMarketingSiteInput = {
  heroTitle: Maybe<Scalars['String']>
  heroSubTitle: Maybe<Scalars['String']>
  name: Maybe<Scalars['String']>
  piplineTitle: Maybe<Scalars['String']>
  pipelineDesc: Maybe<Scalars['String']>
  developerTitle: Maybe<Scalars['String']>
  developerDesc: Maybe<Scalars['String']>
  aiTitle: Maybe<Scalars['String']>
  aiDesc: Maybe<Scalars['String']>
  governaceTitle: Maybe<Scalars['String']>
  governaceDesc: Maybe<Scalars['String']>
  cdTitle: Maybe<Scalars['String']>
  cdSubTitle: Maybe<Scalars['String']>
  cdDesc: Maybe<Scalars['String']>
  ciTitle: Maybe<Scalars['String']>
  ciSubTitle: Maybe<Scalars['String']>
  ciDesc: Maybe<Scalars['String']>
  cloudCostTitle: Maybe<Scalars['String']>
  cloudCostSubTitle: Maybe<Scalars['String']>
  cloudCostDesc: Maybe<Scalars['String']>
  featureFlagsTitle: Maybe<Scalars['String']>
  featureFlagsSubTitle: Maybe<Scalars['String']>
  featureFlagsDesc: Maybe<Scalars['String']>
  chIntelTitle: Maybe<Scalars['String']>
  chIntelSubTitle: Maybe<Scalars['String']>
  chIntelDesc: Maybe<Scalars['String']>
  caseStudy1: Maybe<Scalars['String']>
  caseStudy1Client: Maybe<Scalars['String']>
  caseStudy2: Maybe<Scalars['String']>
  caseStudy2Client: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateMarketingSiteInput = {
  data: Maybe<MarketingSiteInput>
}

export type CreateMarketingSitePayload = {
  __typename?: 'createMarketingSitePayload'
  marketingSite: Maybe<MarketingSite>
}

export type UpdateMarketingSiteInput = {
  where: Maybe<InputId>
  data: Maybe<EditMarketingSiteInput>
}

export type UpdateMarketingSitePayload = {
  __typename?: 'updateMarketingSitePayload'
  marketingSite: Maybe<MarketingSite>
}

export type DeleteMarketingSiteInput = {
  where: Maybe<InputId>
}

export type DeleteMarketingSitePayload = {
  __typename?: 'deleteMarketingSitePayload'
  marketingSite: Maybe<MarketingSite>
}

export type Outcome = {
  __typename?: 'Outcome'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type OutcomeConnection = {
  __typename?: 'OutcomeConnection'
  values: Maybe<Array<Maybe<Outcome>>>
  groupBy: Maybe<OutcomeGroupBy>
  aggregate: Maybe<OutcomeAggregator>
}

export type OutcomeAggregator = {
  __typename?: 'OutcomeAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type OutcomeGroupBy = {
  __typename?: 'OutcomeGroupBy'
  id: Maybe<Array<Maybe<OutcomeConnectionId>>>
  created_at: Maybe<Array<Maybe<OutcomeConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<OutcomeConnectionUpdated_At>>>
  item: Maybe<Array<Maybe<OutcomeConnectionItem>>>
  published_at: Maybe<Array<Maybe<OutcomeConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<OutcomeConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<OutcomeConnectionUpdated_By>>>
}

export type OutcomeConnectionId = {
  __typename?: 'OutcomeConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<OutcomeConnection>
}

export type OutcomeConnectionCreated_At = {
  __typename?: 'OutcomeConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<OutcomeConnection>
}

export type OutcomeConnectionUpdated_At = {
  __typename?: 'OutcomeConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<OutcomeConnection>
}

export type OutcomeConnectionItem = {
  __typename?: 'OutcomeConnectionItem'
  key: Maybe<Scalars['String']>
  connection: Maybe<OutcomeConnection>
}

export type OutcomeConnectionPublished_At = {
  __typename?: 'OutcomeConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<OutcomeConnection>
}

export type OutcomeConnectionCreated_By = {
  __typename?: 'OutcomeConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<OutcomeConnection>
}

export type OutcomeConnectionUpdated_By = {
  __typename?: 'OutcomeConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<OutcomeConnection>
}

export type OutcomeInput = {
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditOutcomeInput = {
  item: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateOutcomeInput = {
  data: Maybe<OutcomeInput>
}

export type CreateOutcomePayload = {
  __typename?: 'createOutcomePayload'
  outcome: Maybe<Outcome>
}

export type UpdateOutcomeInput = {
  where: Maybe<InputId>
  data: Maybe<EditOutcomeInput>
}

export type UpdateOutcomePayload = {
  __typename?: 'updateOutcomePayload'
  outcome: Maybe<Outcome>
}

export type DeleteOutcomeInput = {
  where: Maybe<InputId>
}

export type DeleteOutcomePayload = {
  __typename?: 'deleteOutcomePayload'
  outcome: Maybe<Outcome>
}

export type Panelist = {
  __typename?: 'Panelist'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  firstName: Maybe<Scalars['String']>
  lastName: Maybe<Scalars['String']>
  profile_image: Maybe<UploadFile>
  jobTitle: Maybe<Scalars['String']>
  company: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type PanelistConnection = {
  __typename?: 'PanelistConnection'
  values: Maybe<Array<Maybe<Panelist>>>
  groupBy: Maybe<PanelistGroupBy>
  aggregate: Maybe<PanelistAggregator>
}

export type PanelistAggregator = {
  __typename?: 'PanelistAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type PanelistGroupBy = {
  __typename?: 'PanelistGroupBy'
  id: Maybe<Array<Maybe<PanelistConnectionId>>>
  created_at: Maybe<Array<Maybe<PanelistConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<PanelistConnectionUpdated_At>>>
  firstName: Maybe<Array<Maybe<PanelistConnectionFirstName>>>
  lastName: Maybe<Array<Maybe<PanelistConnectionLastName>>>
  profile_image: Maybe<Array<Maybe<PanelistConnectionProfile_Image>>>
  jobTitle: Maybe<Array<Maybe<PanelistConnectionJobTitle>>>
  company: Maybe<Array<Maybe<PanelistConnectionCompany>>>
  published_at: Maybe<Array<Maybe<PanelistConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<PanelistConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<PanelistConnectionUpdated_By>>>
}

export type PanelistConnectionId = {
  __typename?: 'PanelistConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<PanelistConnection>
}

export type PanelistConnectionCreated_At = {
  __typename?: 'PanelistConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<PanelistConnection>
}

export type PanelistConnectionUpdated_At = {
  __typename?: 'PanelistConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<PanelistConnection>
}

export type PanelistConnectionFirstName = {
  __typename?: 'PanelistConnectionFirstName'
  key: Maybe<Scalars['String']>
  connection: Maybe<PanelistConnection>
}

export type PanelistConnectionLastName = {
  __typename?: 'PanelistConnectionLastName'
  key: Maybe<Scalars['String']>
  connection: Maybe<PanelistConnection>
}

export type PanelistConnectionProfile_Image = {
  __typename?: 'PanelistConnectionProfile_image'
  key: Maybe<Scalars['ID']>
  connection: Maybe<PanelistConnection>
}

export type PanelistConnectionJobTitle = {
  __typename?: 'PanelistConnectionJobTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<PanelistConnection>
}

export type PanelistConnectionCompany = {
  __typename?: 'PanelistConnectionCompany'
  key: Maybe<Scalars['String']>
  connection: Maybe<PanelistConnection>
}

export type PanelistConnectionPublished_At = {
  __typename?: 'PanelistConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<PanelistConnection>
}

export type PanelistConnectionCreated_By = {
  __typename?: 'PanelistConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<PanelistConnection>
}

export type PanelistConnectionUpdated_By = {
  __typename?: 'PanelistConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<PanelistConnection>
}

export type PanelistInput = {
  firstName: Maybe<Scalars['String']>
  lastName: Maybe<Scalars['String']>
  profile_image: Maybe<Scalars['ID']>
  jobTitle: Maybe<Scalars['String']>
  company: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditPanelistInput = {
  firstName: Maybe<Scalars['String']>
  lastName: Maybe<Scalars['String']>
  profile_image: Maybe<Scalars['ID']>
  jobTitle: Maybe<Scalars['String']>
  company: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreatePanelistInput = {
  data: Maybe<PanelistInput>
}

export type CreatePanelistPayload = {
  __typename?: 'createPanelistPayload'
  panelist: Maybe<Panelist>
}

export type UpdatePanelistInput = {
  where: Maybe<InputId>
  data: Maybe<EditPanelistInput>
}

export type UpdatePanelistPayload = {
  __typename?: 'updatePanelistPayload'
  panelist: Maybe<Panelist>
}

export type DeletePanelistInput = {
  where: Maybe<InputId>
}

export type DeletePanelistPayload = {
  __typename?: 'deletePanelistPayload'
  panelist: Maybe<Panelist>
}

export type Partners = {
  __typename?: 'Partners'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  hero: Maybe<ComponentPageSimpleTitleZone>
  features: Maybe<Array<Maybe<ComponentPageMultiImgListZone>>>
  harnessPlatform: Maybe<ComponentPageSimpleTitleZone>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type PartnerInput = {
  hero: Maybe<ComponentPageSimpleTitleZoneInput>
  features: Maybe<Array<Maybe<ComponentPageMultiImgListZoneInput>>>
  harnessPlatform: Maybe<ComponentPageSimpleTitleZoneInput>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditPartnerInput = {
  hero: Maybe<EditComponentPageSimpleTitleZoneInput>
  features: Maybe<Array<Maybe<EditComponentPageMultiImgListZoneInput>>>
  harnessPlatform: Maybe<EditComponentPageSimpleTitleZoneInput>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdatePartnerInput = {
  data: Maybe<EditPartnerInput>
}

export type UpdatePartnerPayload = {
  __typename?: 'updatePartnerPayload'
  partner: Maybe<Partners>
}

export type DeletePartnerPayload = {
  __typename?: 'deletePartnerPayload'
  partner: Maybe<Partners>
}

export type PressAndNews = {
  __typename?: 'PressAndNews'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  hero: Maybe<ComponentPageSimpleTitleZone>
  news: Maybe<Array<Maybe<ComponentPageNewsZone>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type PressAndNewInput = {
  hero: Maybe<ComponentPageSimpleTitleZoneInput>
  news: Maybe<Array<Maybe<ComponentPageNewsZoneInput>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditPressAndNewInput = {
  hero: Maybe<EditComponentPageSimpleTitleZoneInput>
  news: Maybe<Array<Maybe<EditComponentPageNewsZoneInput>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdatePressAndNewInput = {
  data: Maybe<EditPressAndNewInput>
}

export type UpdatePressAndNewPayload = {
  __typename?: 'updatePressAndNewPayload'
  pressAndNew: Maybe<PressAndNews>
}

export type DeletePressAndNewPayload = {
  __typename?: 'deletePressAndNewPayload'
  pressAndNew: Maybe<PressAndNews>
}

export type Pricing = {
  __typename?: 'Pricing'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  hero: Maybe<ComponentPageMiniTitleZone>
  ciPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZone>>>
  cdPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZone>>>
  ffPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZone>>>
  ccPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZone>>>
  chIntelPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZone>>>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  ciSaasPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZone>>>
  ciFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroup>>>
  ciFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaption>>>
  cdFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaption>>>
  cdFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroup>>>
  ccFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaption>>>
  ccFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroup>>>
  ffFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaption>>>
  ffFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroup>>>
  ciSaasFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaption>>>
  ciSaasFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroup>>>
  chIntelFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaption>>>
  chIntelFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroup>>>
  cdFaq: Maybe<Array<Maybe<ComponentPricingPageFaq>>>
  ciFaq: Maybe<Array<Maybe<ComponentPricingPageFaq>>>
  ffFaq: Maybe<Array<Maybe<ComponentPricingPageFaq>>>
  ccFaq: Maybe<Array<Maybe<ComponentPricingPageFaq>>>
  openSource: Maybe<ComponentPricingPageCallOut>
  tooltips: Maybe<Array<Maybe<ComponentPricingPageTooltipsZone>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type PricingInput = {
  hero: Maybe<ComponentPageMiniTitleZoneInput>
  ciPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZoneInput>>>
  cdPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZoneInput>>>
  ffPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZoneInput>>>
  ccPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZoneInput>>>
  chIntelPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZoneInput>>>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZoneInput>>>
  ciSaasPlans: Maybe<Array<Maybe<ComponentPricingPagePlansZoneInput>>>
  ciFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroupInput>>>
  ciFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaptionInput>>>
  cdFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaptionInput>>>
  cdFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroupInput>>>
  ccFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaptionInput>>>
  ccFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroupInput>>>
  ffFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaptionInput>>>
  ffFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroupInput>>>
  ciSaasFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaptionInput>>>
  ciSaasFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroupInput>>>
  chIntelFeatureCaption: Maybe<Array<Maybe<ComponentPricingPageFeatureCaptionInput>>>
  chIntelFeatureGroup: Maybe<Array<Maybe<ComponentPricingPageFeatureGroupInput>>>
  cdFaq: Maybe<Array<Maybe<ComponentPricingPageFaqInput>>>
  ciFaq: Maybe<Array<Maybe<ComponentPricingPageFaqInput>>>
  ffFaq: Maybe<Array<Maybe<ComponentPricingPageFaqInput>>>
  ccFaq: Maybe<Array<Maybe<ComponentPricingPageFaqInput>>>
  openSource: Maybe<ComponentPricingPageCallOutInput>
  tooltips: Maybe<Array<Maybe<ComponentPricingPageTooltipsZoneInput>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditPricingInput = {
  hero: Maybe<EditComponentPageMiniTitleZoneInput>
  ciPlans: Maybe<Array<Maybe<EditComponentPricingPagePlansZoneInput>>>
  cdPlans: Maybe<Array<Maybe<EditComponentPricingPagePlansZoneInput>>>
  ffPlans: Maybe<Array<Maybe<EditComponentPricingPagePlansZoneInput>>>
  ccPlans: Maybe<Array<Maybe<EditComponentPricingPagePlansZoneInput>>>
  chIntelPlans: Maybe<Array<Maybe<EditComponentPricingPagePlansZoneInput>>>
  caseStudies: Maybe<Array<Maybe<EditComponentPageCaseStudyZoneInput>>>
  ciSaasPlans: Maybe<Array<Maybe<EditComponentPricingPagePlansZoneInput>>>
  ciFeatureGroup: Maybe<Array<Maybe<EditComponentPricingPageFeatureGroupInput>>>
  ciFeatureCaption: Maybe<Array<Maybe<EditComponentPricingPageFeatureCaptionInput>>>
  cdFeatureCaption: Maybe<Array<Maybe<EditComponentPricingPageFeatureCaptionInput>>>
  cdFeatureGroup: Maybe<Array<Maybe<EditComponentPricingPageFeatureGroupInput>>>
  ccFeatureCaption: Maybe<Array<Maybe<EditComponentPricingPageFeatureCaptionInput>>>
  ccFeatureGroup: Maybe<Array<Maybe<EditComponentPricingPageFeatureGroupInput>>>
  ffFeatureCaption: Maybe<Array<Maybe<EditComponentPricingPageFeatureCaptionInput>>>
  ffFeatureGroup: Maybe<Array<Maybe<EditComponentPricingPageFeatureGroupInput>>>
  ciSaasFeatureCaption: Maybe<Array<Maybe<EditComponentPricingPageFeatureCaptionInput>>>
  ciSaasFeatureGroup: Maybe<Array<Maybe<EditComponentPricingPageFeatureGroupInput>>>
  chIntelFeatureCaption: Maybe<Array<Maybe<EditComponentPricingPageFeatureCaptionInput>>>
  chIntelFeatureGroup: Maybe<Array<Maybe<EditComponentPricingPageFeatureGroupInput>>>
  cdFaq: Maybe<Array<Maybe<EditComponentPricingPageFaqInput>>>
  ciFaq: Maybe<Array<Maybe<EditComponentPricingPageFaqInput>>>
  ffFaq: Maybe<Array<Maybe<EditComponentPricingPageFaqInput>>>
  ccFaq: Maybe<Array<Maybe<EditComponentPricingPageFaqInput>>>
  openSource: Maybe<EditComponentPricingPageCallOutInput>
  tooltips: Maybe<Array<Maybe<EditComponentPricingPageTooltipsZoneInput>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdatePricingInput = {
  data: Maybe<EditPricingInput>
}

export type UpdatePricingPayload = {
  __typename?: 'updatePricingPayload'
  pricing: Maybe<Pricing>
}

export type DeletePricingPayload = {
  __typename?: 'deletePricingPayload'
  pricing: Maybe<Pricing>
}

export type Privacy = {
  __typename?: 'Privacy'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  title: Maybe<Scalars['String']>
  date: Maybe<Scalars['String']>
  content: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type PrivacyInput = {
  title: Maybe<Scalars['String']>
  date: Maybe<Scalars['String']>
  content: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditPrivacyInput = {
  title: Maybe<Scalars['String']>
  date: Maybe<Scalars['String']>
  content: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdatePrivacyInput = {
  data: Maybe<EditPrivacyInput>
}

export type UpdatePrivacyPayload = {
  __typename?: 'updatePrivacyPayload'
  privacy: Maybe<Privacy>
}

export type DeletePrivacyPayload = {
  __typename?: 'deletePrivacyPayload'
  privacy: Maybe<Privacy>
}

export type ProductCd = {
  __typename?: 'ProductCd'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  hero: Maybe<ComponentPageProductTitleZone>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  featureScreenshots: Maybe<Array<Maybe<ComponentPageOptionZone>>>
  features: Maybe<Array<Maybe<ComponentPageModules>>>
  integrations: Maybe<ComponentProductPageIntegrationsZone>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  harnessPlatform: Maybe<ComponentPageProductIntroLogoZone>
  featuresTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type ProductCdInput = {
  hero: Maybe<ComponentPageProductTitleZoneInput>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: Maybe<Array<Maybe<ComponentPageOptionZoneInput>>>
  features: Maybe<Array<Maybe<ComponentPageModuleInput>>>
  integrations: Maybe<ComponentProductPageIntegrationsZoneInput>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZoneInput>>>
  harnessPlatform: Maybe<ComponentPageProductIntroLogoZoneInput>
  featuresTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditProductCdInput = {
  hero: Maybe<EditComponentPageProductTitleZoneInput>
  customerLogos: Maybe<Array<Maybe<EditComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: Maybe<Array<Maybe<EditComponentPageOptionZoneInput>>>
  features: Maybe<Array<Maybe<EditComponentPageModuleInput>>>
  integrations: Maybe<EditComponentProductPageIntegrationsZoneInput>
  caseStudies: Maybe<Array<Maybe<EditComponentPageCaseStudyZoneInput>>>
  harnessPlatform: Maybe<EditComponentPageProductIntroLogoZoneInput>
  featuresTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdateProductCdInput = {
  data: Maybe<EditProductCdInput>
}

export type UpdateProductCdPayload = {
  __typename?: 'updateProductCdPayload'
  productCd: Maybe<ProductCd>
}

export type DeleteProductCdPayload = {
  __typename?: 'deleteProductCdPayload'
  productCd: Maybe<ProductCd>
}

export type ProductChangeIntelligence = {
  __typename?: 'ProductChangeIntelligence'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  hero: Maybe<ComponentPageProductTitleZone>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  featureScreenshots: Maybe<Array<Maybe<ComponentPageOptionZone>>>
  features: Maybe<Array<Maybe<ComponentPageModules>>>
  integrations: Maybe<ComponentProductPageIntegrationsZone>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  featuresTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type ProductChangeIntelligenceInput = {
  hero: Maybe<ComponentPageProductTitleZoneInput>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: Maybe<Array<Maybe<ComponentPageOptionZoneInput>>>
  features: Maybe<Array<Maybe<ComponentPageModuleInput>>>
  integrations: Maybe<ComponentProductPageIntegrationsZoneInput>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZoneInput>>>
  featuresTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditProductChangeIntelligenceInput = {
  hero: Maybe<EditComponentPageProductTitleZoneInput>
  customerLogos: Maybe<Array<Maybe<EditComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: Maybe<Array<Maybe<EditComponentPageOptionZoneInput>>>
  features: Maybe<Array<Maybe<EditComponentPageModuleInput>>>
  integrations: Maybe<EditComponentProductPageIntegrationsZoneInput>
  caseStudies: Maybe<Array<Maybe<EditComponentPageCaseStudyZoneInput>>>
  featuresTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdateProductChangeIntelligenceInput = {
  data: Maybe<EditProductChangeIntelligenceInput>
}

export type UpdateProductChangeIntelligencePayload = {
  __typename?: 'updateProductChangeIntelligencePayload'
  productChangeIntelligence: Maybe<ProductChangeIntelligence>
}

export type DeleteProductChangeIntelligencePayload = {
  __typename?: 'deleteProductChangeIntelligencePayload'
  productChangeIntelligence: Maybe<ProductChangeIntelligence>
}

export type ProductCi = {
  __typename?: 'ProductCi'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  hero: Maybe<ComponentPageProductTitleZone>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  featureScreenshots: Maybe<Array<Maybe<ComponentPageOptionZone>>>
  features: Maybe<Array<Maybe<ComponentPageModules>>>
  integrations: Maybe<ComponentProductPageIntegrationsZone>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  harnessPlatform: Maybe<ComponentPageProductIntroLogoZone>
  featuresTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type ProductCiInput = {
  hero: Maybe<ComponentPageProductTitleZoneInput>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: Maybe<Array<Maybe<ComponentPageOptionZoneInput>>>
  features: Maybe<Array<Maybe<ComponentPageModuleInput>>>
  integrations: Maybe<ComponentProductPageIntegrationsZoneInput>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZoneInput>>>
  harnessPlatform: Maybe<ComponentPageProductIntroLogoZoneInput>
  featuresTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditProductCiInput = {
  hero: Maybe<EditComponentPageProductTitleZoneInput>
  customerLogos: Maybe<Array<Maybe<EditComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: Maybe<Array<Maybe<EditComponentPageOptionZoneInput>>>
  features: Maybe<Array<Maybe<EditComponentPageModuleInput>>>
  integrations: Maybe<EditComponentProductPageIntegrationsZoneInput>
  caseStudies: Maybe<Array<Maybe<EditComponentPageCaseStudyZoneInput>>>
  harnessPlatform: Maybe<EditComponentPageProductIntroLogoZoneInput>
  featuresTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdateProductCiInput = {
  data: Maybe<EditProductCiInput>
}

export type UpdateProductCiPayload = {
  __typename?: 'updateProductCiPayload'
  productCi: Maybe<ProductCi>
}

export type DeleteProductCiPayload = {
  __typename?: 'deleteProductCiPayload'
  productCi: Maybe<ProductCi>
}

export type ProductCloudCost = {
  __typename?: 'ProductCloudCost'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  hero: Maybe<ComponentPageProductTitleZone>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  featureScreenshots: Maybe<Array<Maybe<ComponentPageOptionZone>>>
  costTransparency: Maybe<Array<Maybe<ComponentPageModules>>>
  integrations: Maybe<ComponentProductPageIntegrationsZone>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  optimization: Maybe<Array<Maybe<ComponentPageModules>>>
  governance: Maybe<Array<Maybe<ComponentPageModules>>>
  harnessPlatform: Maybe<ComponentPageProductIntroLogoZone>
  featuresTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type ProductCloudCostInput = {
  hero: Maybe<ComponentPageProductTitleZoneInput>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: Maybe<Array<Maybe<ComponentPageOptionZoneInput>>>
  costTransparency: Maybe<Array<Maybe<ComponentPageModuleInput>>>
  integrations: Maybe<ComponentProductPageIntegrationsZoneInput>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZoneInput>>>
  optimization: Maybe<Array<Maybe<ComponentPageModuleInput>>>
  governance: Maybe<Array<Maybe<ComponentPageModuleInput>>>
  harnessPlatform: Maybe<ComponentPageProductIntroLogoZoneInput>
  featuresTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditProductCloudCostInput = {
  hero: Maybe<EditComponentPageProductTitleZoneInput>
  customerLogos: Maybe<Array<Maybe<EditComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: Maybe<Array<Maybe<EditComponentPageOptionZoneInput>>>
  costTransparency: Maybe<Array<Maybe<EditComponentPageModuleInput>>>
  integrations: Maybe<EditComponentProductPageIntegrationsZoneInput>
  caseStudies: Maybe<Array<Maybe<EditComponentPageCaseStudyZoneInput>>>
  optimization: Maybe<Array<Maybe<EditComponentPageModuleInput>>>
  governance: Maybe<Array<Maybe<EditComponentPageModuleInput>>>
  harnessPlatform: Maybe<EditComponentPageProductIntroLogoZoneInput>
  featuresTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdateProductCloudCostInput = {
  data: Maybe<EditProductCloudCostInput>
}

export type UpdateProductCloudCostPayload = {
  __typename?: 'updateProductCloudCostPayload'
  productCloudCost: Maybe<ProductCloudCost>
}

export type DeleteProductCloudCostPayload = {
  __typename?: 'deleteProductCloudCostPayload'
  productCloudCost: Maybe<ProductCloudCost>
}

export type ProductFeatureFlags = {
  __typename?: 'ProductFeatureFlags'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  hero: Maybe<ComponentPageProductTitleZone>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
  featureScreenshots: Maybe<Array<Maybe<ComponentPageOptionZone>>>
  features: Maybe<Array<Maybe<ComponentPageModules>>>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  harnessPlatform: Maybe<ComponentPageProductIntroLogoZone>
  sectionOptions: Maybe<ComponentPageSectionOptions>
  featuresTitle: Maybe<Scalars['String']>
  integrations: Maybe<ComponentProductPageIntegrationZone>
  featuresTitle2: Maybe<Scalars['String']>
  features2: Maybe<Array<Maybe<ComponentPageModules>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type ProductFeatureFlagInput = {
  hero: Maybe<ComponentPageProductTitleZoneInput>
  customerLogos: Maybe<Array<Maybe<ComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: Maybe<Array<Maybe<ComponentPageOptionZoneInput>>>
  features: Maybe<Array<Maybe<ComponentPageModuleInput>>>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZoneInput>>>
  harnessPlatform: Maybe<ComponentPageProductIntroLogoZoneInput>
  sectionOptions: Maybe<ComponentPageSectionOptionInput>
  featuresTitle: Maybe<Scalars['String']>
  integrations: Maybe<ComponentProductPageIntegrationZoneInput>
  featuresTitle2: Maybe<Scalars['String']>
  features2: Maybe<Array<Maybe<ComponentPageModuleInput>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditProductFeatureFlagInput = {
  hero: Maybe<EditComponentPageProductTitleZoneInput>
  customerLogos: Maybe<Array<Maybe<EditComponentPageCustomerLogoZoneInput>>>
  featureScreenshots: Maybe<Array<Maybe<EditComponentPageOptionZoneInput>>>
  features: Maybe<Array<Maybe<EditComponentPageModuleInput>>>
  caseStudies: Maybe<Array<Maybe<EditComponentPageCaseStudyZoneInput>>>
  harnessPlatform: Maybe<EditComponentPageProductIntroLogoZoneInput>
  sectionOptions: Maybe<EditComponentPageSectionOptionInput>
  featuresTitle: Maybe<Scalars['String']>
  integrations: Maybe<EditComponentProductPageIntegrationZoneInput>
  featuresTitle2: Maybe<Scalars['String']>
  features2: Maybe<Array<Maybe<EditComponentPageModuleInput>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdateProductFeatureFlagInput = {
  data: Maybe<EditProductFeatureFlagInput>
}

export type UpdateProductFeatureFlagPayload = {
  __typename?: 'updateProductFeatureFlagPayload'
  productFeatureFlag: Maybe<ProductFeatureFlags>
}

export type DeleteProductFeatureFlagPayload = {
  __typename?: 'deleteProductFeatureFlagPayload'
  productFeatureFlag: Maybe<ProductFeatureFlags>
}

export type ProductPlatform = {
  __typename?: 'ProductPlatform'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  hero: Maybe<ComponentPageProductTitleZone>
  modules: Maybe<Array<Maybe<ComponentPageModules>>>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
  features: Maybe<Array<Maybe<ComponentPageModules>>>
  platformModules: Maybe<ComponentPageTitleZone>
  supportedPlatforms: Maybe<ComponentProductPageIntegrationsZone>
  hostingOptions: Maybe<ComponentPageOptionZone>
  integrations: Maybe<ComponentProductPageIntegrationsZone>
  harnessPlatform: Maybe<ComponentPageProductIntroLogoZone>
  workflow: Maybe<ComponentPageWorkflow>
  sectionOptions: Maybe<ComponentPageSectionOptions>
  sectionSecurity: Maybe<ComponentPageSectionSecurity>
  featuresTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type ProductPlatformInput = {
  hero: Maybe<ComponentPageProductTitleZoneInput>
  modules: Maybe<Array<Maybe<ComponentPageModuleInput>>>
  caseStudies: Maybe<Array<Maybe<ComponentPageCaseStudyZoneInput>>>
  features: Maybe<Array<Maybe<ComponentPageModuleInput>>>
  platformModules: Maybe<ComponentPageTitleZoneInput>
  supportedPlatforms: Maybe<ComponentProductPageIntegrationsZoneInput>
  hostingOptions: Maybe<ComponentPageOptionZoneInput>
  integrations: Maybe<ComponentProductPageIntegrationsZoneInput>
  harnessPlatform: Maybe<ComponentPageProductIntroLogoZoneInput>
  workflow: Maybe<ComponentPageWorkflowInput>
  sectionOptions: Maybe<ComponentPageSectionOptionInput>
  sectionSecurity: Maybe<ComponentPageSectionSecurityInput>
  featuresTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditProductPlatformInput = {
  hero: Maybe<EditComponentPageProductTitleZoneInput>
  modules: Maybe<Array<Maybe<EditComponentPageModuleInput>>>
  caseStudies: Maybe<Array<Maybe<EditComponentPageCaseStudyZoneInput>>>
  features: Maybe<Array<Maybe<EditComponentPageModuleInput>>>
  platformModules: Maybe<EditComponentPageTitleZoneInput>
  supportedPlatforms: Maybe<EditComponentProductPageIntegrationsZoneInput>
  hostingOptions: Maybe<EditComponentPageOptionZoneInput>
  integrations: Maybe<EditComponentProductPageIntegrationsZoneInput>
  harnessPlatform: Maybe<EditComponentPageProductIntroLogoZoneInput>
  workflow: Maybe<EditComponentPageWorkflowInput>
  sectionOptions: Maybe<EditComponentPageSectionOptionInput>
  sectionSecurity: Maybe<EditComponentPageSectionSecurityInput>
  featuresTitle: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdateProductPlatformInput = {
  data: Maybe<EditProductPlatformInput>
}

export type UpdateProductPlatformPayload = {
  __typename?: 'updateProductPlatformPayload'
  productPlatform: Maybe<ProductPlatform>
}

export type DeleteProductPlatformPayload = {
  __typename?: 'deleteProductPlatformPayload'
  productPlatform: Maybe<ProductPlatform>
}

export type Video = {
  __typename?: 'Video'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  title: Scalars['String']
  slug: Scalars['String']
  videoType: Maybe<Scalars['String']>
  preview_image: Maybe<UploadFile>
  content: Maybe<Scalars['String']>
  mkto_form_id: Maybe<Scalars['Int']>
  published: Maybe<Scalars['DateTime']>
  duration: Maybe<Scalars['String']>
  registration: Maybe<Scalars['Boolean']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
  panelists: Maybe<Array<Maybe<Panelist>>>
}

export type VideoPanelistsArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type VideoConnection = {
  __typename?: 'VideoConnection'
  values: Maybe<Array<Maybe<Video>>>
  groupBy: Maybe<VideoGroupBy>
  aggregate: Maybe<VideoAggregator>
}

export type VideoAggregator = {
  __typename?: 'VideoAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
  sum: Maybe<VideoAggregatorSum>
  avg: Maybe<VideoAggregatorAvg>
  min: Maybe<VideoAggregatorMin>
  max: Maybe<VideoAggregatorMax>
}

export type VideoAggregatorSum = {
  __typename?: 'VideoAggregatorSum'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type VideoAggregatorAvg = {
  __typename?: 'VideoAggregatorAvg'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type VideoAggregatorMin = {
  __typename?: 'VideoAggregatorMin'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type VideoAggregatorMax = {
  __typename?: 'VideoAggregatorMax'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type VideoGroupBy = {
  __typename?: 'VideoGroupBy'
  id: Maybe<Array<Maybe<VideoConnectionId>>>
  created_at: Maybe<Array<Maybe<VideoConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<VideoConnectionUpdated_At>>>
  title: Maybe<Array<Maybe<VideoConnectionTitle>>>
  slug: Maybe<Array<Maybe<VideoConnectionSlug>>>
  videoType: Maybe<Array<Maybe<VideoConnectionVideoType>>>
  preview_image: Maybe<Array<Maybe<VideoConnectionPreview_Image>>>
  content: Maybe<Array<Maybe<VideoConnectionContent>>>
  mkto_form_id: Maybe<Array<Maybe<VideoConnectionMkto_Form_Id>>>
  published: Maybe<Array<Maybe<VideoConnectionPublished>>>
  duration: Maybe<Array<Maybe<VideoConnectionDuration>>>
  registration: Maybe<Array<Maybe<VideoConnectionRegistration>>>
  published_at: Maybe<Array<Maybe<VideoConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<VideoConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<VideoConnectionUpdated_By>>>
}

export type VideoConnectionId = {
  __typename?: 'VideoConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<VideoConnection>
}

export type VideoConnectionCreated_At = {
  __typename?: 'VideoConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<VideoConnection>
}

export type VideoConnectionUpdated_At = {
  __typename?: 'VideoConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<VideoConnection>
}

export type VideoConnectionTitle = {
  __typename?: 'VideoConnectionTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<VideoConnection>
}

export type VideoConnectionSlug = {
  __typename?: 'VideoConnectionSlug'
  key: Maybe<Scalars['String']>
  connection: Maybe<VideoConnection>
}

export type VideoConnectionVideoType = {
  __typename?: 'VideoConnectionVideoType'
  key: Maybe<Scalars['String']>
  connection: Maybe<VideoConnection>
}

export type VideoConnectionPreview_Image = {
  __typename?: 'VideoConnectionPreview_image'
  key: Maybe<Scalars['ID']>
  connection: Maybe<VideoConnection>
}

export type VideoConnectionContent = {
  __typename?: 'VideoConnectionContent'
  key: Maybe<Scalars['String']>
  connection: Maybe<VideoConnection>
}

export type VideoConnectionMkto_Form_Id = {
  __typename?: 'VideoConnectionMkto_form_id'
  key: Maybe<Scalars['Int']>
  connection: Maybe<VideoConnection>
}

export type VideoConnectionPublished = {
  __typename?: 'VideoConnectionPublished'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<VideoConnection>
}

export type VideoConnectionDuration = {
  __typename?: 'VideoConnectionDuration'
  key: Maybe<Scalars['String']>
  connection: Maybe<VideoConnection>
}

export type VideoConnectionRegistration = {
  __typename?: 'VideoConnectionRegistration'
  key: Maybe<Scalars['Boolean']>
  connection: Maybe<VideoConnection>
}

export type VideoConnectionPublished_At = {
  __typename?: 'VideoConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<VideoConnection>
}

export type VideoConnectionCreated_By = {
  __typename?: 'VideoConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<VideoConnection>
}

export type VideoConnectionUpdated_By = {
  __typename?: 'VideoConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<VideoConnection>
}

export type VideoInput = {
  title: Scalars['String']
  slug: Scalars['String']
  videoType: Maybe<Scalars['String']>
  preview_image: Maybe<Scalars['ID']>
  content: Maybe<Scalars['String']>
  mkto_form_id: Maybe<Scalars['Int']>
  panelists: Maybe<Array<Maybe<Scalars['ID']>>>
  published: Maybe<Scalars['DateTime']>
  duration: Maybe<Scalars['String']>
  registration: Maybe<Scalars['Boolean']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditVideoInput = {
  title: Maybe<Scalars['String']>
  slug: Maybe<Scalars['String']>
  videoType: Maybe<Scalars['String']>
  preview_image: Maybe<Scalars['ID']>
  content: Maybe<Scalars['String']>
  mkto_form_id: Maybe<Scalars['Int']>
  panelists: Maybe<Array<Maybe<Scalars['ID']>>>
  published: Maybe<Scalars['DateTime']>
  duration: Maybe<Scalars['String']>
  registration: Maybe<Scalars['Boolean']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateVideoInput = {
  data: Maybe<VideoInput>
}

export type CreateVideoPayload = {
  __typename?: 'createVideoPayload'
  video: Maybe<Video>
}

export type UpdateVideoInput = {
  where: Maybe<InputId>
  data: Maybe<EditVideoInput>
}

export type UpdateVideoPayload = {
  __typename?: 'updateVideoPayload'
  video: Maybe<Video>
}

export type DeleteVideoInput = {
  where: Maybe<InputId>
}

export type DeleteVideoPayload = {
  __typename?: 'deleteVideoPayload'
  video: Maybe<Video>
}

export type Webinars = {
  __typename?: 'Webinars'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  title: Maybe<Scalars['String']>
  slug: Scalars['String']
  eventType: Maybe<Scalars['String']>
  eventDateTime: Maybe<Scalars['String']>
  content: Maybe<Scalars['String']>
  preview_image: Maybe<UploadFile>
  mkto_form_id: Maybe<Scalars['Int']>
  published: Maybe<Scalars['DateTime']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
  panelists: Maybe<Array<Maybe<Panelist>>>
}

export type WebinarsPanelistsArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type WebinarsConnection = {
  __typename?: 'WebinarsConnection'
  values: Maybe<Array<Maybe<Webinars>>>
  groupBy: Maybe<WebinarsGroupBy>
  aggregate: Maybe<WebinarsAggregator>
}

export type WebinarsAggregator = {
  __typename?: 'WebinarsAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
  sum: Maybe<WebinarsAggregatorSum>
  avg: Maybe<WebinarsAggregatorAvg>
  min: Maybe<WebinarsAggregatorMin>
  max: Maybe<WebinarsAggregatorMax>
}

export type WebinarsAggregatorSum = {
  __typename?: 'WebinarsAggregatorSum'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type WebinarsAggregatorAvg = {
  __typename?: 'WebinarsAggregatorAvg'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type WebinarsAggregatorMin = {
  __typename?: 'WebinarsAggregatorMin'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type WebinarsAggregatorMax = {
  __typename?: 'WebinarsAggregatorMax'
  mkto_form_id: Maybe<Scalars['Float']>
}

export type WebinarsGroupBy = {
  __typename?: 'WebinarsGroupBy'
  id: Maybe<Array<Maybe<WebinarsConnectionId>>>
  created_at: Maybe<Array<Maybe<WebinarsConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<WebinarsConnectionUpdated_At>>>
  title: Maybe<Array<Maybe<WebinarsConnectionTitle>>>
  slug: Maybe<Array<Maybe<WebinarsConnectionSlug>>>
  eventType: Maybe<Array<Maybe<WebinarsConnectionEventType>>>
  eventDateTime: Maybe<Array<Maybe<WebinarsConnectionEventDateTime>>>
  content: Maybe<Array<Maybe<WebinarsConnectionContent>>>
  preview_image: Maybe<Array<Maybe<WebinarsConnectionPreview_Image>>>
  mkto_form_id: Maybe<Array<Maybe<WebinarsConnectionMkto_Form_Id>>>
  published: Maybe<Array<Maybe<WebinarsConnectionPublished>>>
  published_at: Maybe<Array<Maybe<WebinarsConnectionPublished_At>>>
  created_by: Maybe<Array<Maybe<WebinarsConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<WebinarsConnectionUpdated_By>>>
}

export type WebinarsConnectionId = {
  __typename?: 'WebinarsConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<WebinarsConnection>
}

export type WebinarsConnectionCreated_At = {
  __typename?: 'WebinarsConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<WebinarsConnection>
}

export type WebinarsConnectionUpdated_At = {
  __typename?: 'WebinarsConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<WebinarsConnection>
}

export type WebinarsConnectionTitle = {
  __typename?: 'WebinarsConnectionTitle'
  key: Maybe<Scalars['String']>
  connection: Maybe<WebinarsConnection>
}

export type WebinarsConnectionSlug = {
  __typename?: 'WebinarsConnectionSlug'
  key: Maybe<Scalars['String']>
  connection: Maybe<WebinarsConnection>
}

export type WebinarsConnectionEventType = {
  __typename?: 'WebinarsConnectionEventType'
  key: Maybe<Scalars['String']>
  connection: Maybe<WebinarsConnection>
}

export type WebinarsConnectionEventDateTime = {
  __typename?: 'WebinarsConnectionEventDateTime'
  key: Maybe<Scalars['String']>
  connection: Maybe<WebinarsConnection>
}

export type WebinarsConnectionContent = {
  __typename?: 'WebinarsConnectionContent'
  key: Maybe<Scalars['String']>
  connection: Maybe<WebinarsConnection>
}

export type WebinarsConnectionPreview_Image = {
  __typename?: 'WebinarsConnectionPreview_image'
  key: Maybe<Scalars['ID']>
  connection: Maybe<WebinarsConnection>
}

export type WebinarsConnectionMkto_Form_Id = {
  __typename?: 'WebinarsConnectionMkto_form_id'
  key: Maybe<Scalars['Int']>
  connection: Maybe<WebinarsConnection>
}

export type WebinarsConnectionPublished = {
  __typename?: 'WebinarsConnectionPublished'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<WebinarsConnection>
}

export type WebinarsConnectionPublished_At = {
  __typename?: 'WebinarsConnectionPublished_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<WebinarsConnection>
}

export type WebinarsConnectionCreated_By = {
  __typename?: 'WebinarsConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<WebinarsConnection>
}

export type WebinarsConnectionUpdated_By = {
  __typename?: 'WebinarsConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<WebinarsConnection>
}

export type WebinarInput = {
  title: Maybe<Scalars['String']>
  slug: Scalars['String']
  eventType: Maybe<Scalars['String']>
  eventDateTime: Maybe<Scalars['String']>
  content: Maybe<Scalars['String']>
  preview_image: Maybe<Scalars['ID']>
  mkto_form_id: Maybe<Scalars['Int']>
  published: Maybe<Scalars['DateTime']>
  panelists: Maybe<Array<Maybe<Scalars['ID']>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditWebinarInput = {
  title: Maybe<Scalars['String']>
  slug: Maybe<Scalars['String']>
  eventType: Maybe<Scalars['String']>
  eventDateTime: Maybe<Scalars['String']>
  content: Maybe<Scalars['String']>
  preview_image: Maybe<Scalars['ID']>
  mkto_form_id: Maybe<Scalars['Int']>
  published: Maybe<Scalars['DateTime']>
  panelists: Maybe<Array<Maybe<Scalars['ID']>>>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateWebinarInput = {
  data: Maybe<WebinarInput>
}

export type CreateWebinarPayload = {
  __typename?: 'createWebinarPayload'
  webinar: Maybe<Webinars>
}

export type UpdateWebinarInput = {
  where: Maybe<InputId>
  data: Maybe<EditWebinarInput>
}

export type UpdateWebinarPayload = {
  __typename?: 'updateWebinarPayload'
  webinar: Maybe<Webinars>
}

export type DeleteWebinarInput = {
  where: Maybe<InputId>
}

export type DeleteWebinarPayload = {
  __typename?: 'deleteWebinarPayload'
  webinar: Maybe<Webinars>
}

export type WebsiteTermsOfUse = {
  __typename?: 'WebsiteTermsOfUse'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  title: Maybe<Scalars['String']>
  content: Maybe<Scalars['String']>
  date: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type WebsiteTermsOfUseInput = {
  title: Maybe<Scalars['String']>
  content: Maybe<Scalars['String']>
  date: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditWebsiteTermsOfUseInput = {
  title: Maybe<Scalars['String']>
  content: Maybe<Scalars['String']>
  date: Maybe<Scalars['String']>
  published_at: Maybe<Scalars['DateTime']>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type UpdateWebsiteTermsOfUseInput = {
  data: Maybe<EditWebsiteTermsOfUseInput>
}

export type UpdateWebsiteTermsOfUsePayload = {
  __typename?: 'updateWebsiteTermsOfUsePayload'
  websiteTermsOfUse: Maybe<WebsiteTermsOfUse>
}

export type DeleteWebsiteTermsOfUsePayload = {
  __typename?: 'deleteWebsiteTermsOfUsePayload'
  websiteTermsOfUse: Maybe<WebsiteTermsOfUse>
}

export type UploadFile = {
  __typename?: 'UploadFile'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  name: Scalars['String']
  alternativeText: Maybe<Scalars['String']>
  caption: Maybe<Scalars['String']>
  width: Maybe<Scalars['Int']>
  height: Maybe<Scalars['Int']>
  formats: Maybe<Scalars['JSON']>
  hash: Scalars['String']
  ext: Maybe<Scalars['String']>
  mime: Scalars['String']
  size: Scalars['Float']
  url: Scalars['String']
  previewUrl: Maybe<Scalars['String']>
  provider: Scalars['String']
  provider_metadata: Maybe<Scalars['JSON']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
  related: Maybe<Array<Maybe<Morph>>>
}

export type UploadFileRelatedArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type UploadFileConnection = {
  __typename?: 'UploadFileConnection'
  values: Maybe<Array<Maybe<UploadFile>>>
  groupBy: Maybe<UploadFileGroupBy>
  aggregate: Maybe<UploadFileAggregator>
}

export type UploadFileAggregator = {
  __typename?: 'UploadFileAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
  sum: Maybe<UploadFileAggregatorSum>
  avg: Maybe<UploadFileAggregatorAvg>
  min: Maybe<UploadFileAggregatorMin>
  max: Maybe<UploadFileAggregatorMax>
}

export type UploadFileAggregatorSum = {
  __typename?: 'UploadFileAggregatorSum'
  width: Maybe<Scalars['Float']>
  height: Maybe<Scalars['Float']>
  size: Maybe<Scalars['Float']>
}

export type UploadFileAggregatorAvg = {
  __typename?: 'UploadFileAggregatorAvg'
  width: Maybe<Scalars['Float']>
  height: Maybe<Scalars['Float']>
  size: Maybe<Scalars['Float']>
}

export type UploadFileAggregatorMin = {
  __typename?: 'UploadFileAggregatorMin'
  width: Maybe<Scalars['Float']>
  height: Maybe<Scalars['Float']>
  size: Maybe<Scalars['Float']>
}

export type UploadFileAggregatorMax = {
  __typename?: 'UploadFileAggregatorMax'
  width: Maybe<Scalars['Float']>
  height: Maybe<Scalars['Float']>
  size: Maybe<Scalars['Float']>
}

export type UploadFileGroupBy = {
  __typename?: 'UploadFileGroupBy'
  id: Maybe<Array<Maybe<UploadFileConnectionId>>>
  created_at: Maybe<Array<Maybe<UploadFileConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<UploadFileConnectionUpdated_At>>>
  name: Maybe<Array<Maybe<UploadFileConnectionName>>>
  alternativeText: Maybe<Array<Maybe<UploadFileConnectionAlternativeText>>>
  caption: Maybe<Array<Maybe<UploadFileConnectionCaption>>>
  width: Maybe<Array<Maybe<UploadFileConnectionWidth>>>
  height: Maybe<Array<Maybe<UploadFileConnectionHeight>>>
  formats: Maybe<Array<Maybe<UploadFileConnectionFormats>>>
  hash: Maybe<Array<Maybe<UploadFileConnectionHash>>>
  ext: Maybe<Array<Maybe<UploadFileConnectionExt>>>
  mime: Maybe<Array<Maybe<UploadFileConnectionMime>>>
  size: Maybe<Array<Maybe<UploadFileConnectionSize>>>
  url: Maybe<Array<Maybe<UploadFileConnectionUrl>>>
  previewUrl: Maybe<Array<Maybe<UploadFileConnectionPreviewUrl>>>
  provider: Maybe<Array<Maybe<UploadFileConnectionProvider>>>
  provider_metadata: Maybe<Array<Maybe<UploadFileConnectionProvider_Metadata>>>
  created_by: Maybe<Array<Maybe<UploadFileConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<UploadFileConnectionUpdated_By>>>
}

export type UploadFileConnectionId = {
  __typename?: 'UploadFileConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionCreated_At = {
  __typename?: 'UploadFileConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionUpdated_At = {
  __typename?: 'UploadFileConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionName = {
  __typename?: 'UploadFileConnectionName'
  key: Maybe<Scalars['String']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionAlternativeText = {
  __typename?: 'UploadFileConnectionAlternativeText'
  key: Maybe<Scalars['String']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionCaption = {
  __typename?: 'UploadFileConnectionCaption'
  key: Maybe<Scalars['String']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionWidth = {
  __typename?: 'UploadFileConnectionWidth'
  key: Maybe<Scalars['Int']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionHeight = {
  __typename?: 'UploadFileConnectionHeight'
  key: Maybe<Scalars['Int']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionFormats = {
  __typename?: 'UploadFileConnectionFormats'
  key: Maybe<Scalars['JSON']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionHash = {
  __typename?: 'UploadFileConnectionHash'
  key: Maybe<Scalars['String']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionExt = {
  __typename?: 'UploadFileConnectionExt'
  key: Maybe<Scalars['String']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionMime = {
  __typename?: 'UploadFileConnectionMime'
  key: Maybe<Scalars['String']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionSize = {
  __typename?: 'UploadFileConnectionSize'
  key: Maybe<Scalars['Float']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionUrl = {
  __typename?: 'UploadFileConnectionUrl'
  key: Maybe<Scalars['String']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionPreviewUrl = {
  __typename?: 'UploadFileConnectionPreviewUrl'
  key: Maybe<Scalars['String']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionProvider = {
  __typename?: 'UploadFileConnectionProvider'
  key: Maybe<Scalars['String']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionProvider_Metadata = {
  __typename?: 'UploadFileConnectionProvider_metadata'
  key: Maybe<Scalars['JSON']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionCreated_By = {
  __typename?: 'UploadFileConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<UploadFileConnection>
}

export type UploadFileConnectionUpdated_By = {
  __typename?: 'UploadFileConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<UploadFileConnection>
}

export type FileInput = {
  name: Scalars['String']
  alternativeText: Maybe<Scalars['String']>
  caption: Maybe<Scalars['String']>
  width: Maybe<Scalars['Int']>
  height: Maybe<Scalars['Int']>
  formats: Maybe<Scalars['JSON']>
  hash: Scalars['String']
  ext: Maybe<Scalars['String']>
  mime: Scalars['String']
  size: Scalars['Float']
  url: Scalars['String']
  previewUrl: Maybe<Scalars['String']>
  provider: Scalars['String']
  provider_metadata: Maybe<Scalars['JSON']>
  related: Maybe<Array<Maybe<Scalars['ID']>>>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditFileInput = {
  name: Maybe<Scalars['String']>
  alternativeText: Maybe<Scalars['String']>
  caption: Maybe<Scalars['String']>
  width: Maybe<Scalars['Int']>
  height: Maybe<Scalars['Int']>
  formats: Maybe<Scalars['JSON']>
  hash: Maybe<Scalars['String']>
  ext: Maybe<Scalars['String']>
  mime: Maybe<Scalars['String']>
  size: Maybe<Scalars['Float']>
  url: Maybe<Scalars['String']>
  previewUrl: Maybe<Scalars['String']>
  provider: Maybe<Scalars['String']>
  provider_metadata: Maybe<Scalars['JSON']>
  related: Maybe<Array<Maybe<Scalars['ID']>>>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type DeleteFileInput = {
  where: Maybe<InputId>
}

export type DeleteFilePayload = {
  __typename?: 'deleteFilePayload'
  file: Maybe<UploadFile>
}

export type UsersPermissionsPermission = {
  __typename?: 'UsersPermissionsPermission'
  id: Scalars['ID']
  type: Scalars['String']
  controller: Scalars['String']
  action: Scalars['String']
  enabled: Scalars['Boolean']
  policy: Maybe<Scalars['String']>
  role: Maybe<UsersPermissionsRole>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type UsersPermissionsRole = {
  __typename?: 'UsersPermissionsRole'
  id: Scalars['ID']
  name: Scalars['String']
  description: Maybe<Scalars['String']>
  type: Maybe<Scalars['String']>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
  permissions: Maybe<Array<Maybe<UsersPermissionsPermission>>>
  users: Maybe<Array<Maybe<UsersPermissionsUser>>>
}

export type UsersPermissionsRolePermissionsArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type UsersPermissionsRoleUsersArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type UsersPermissionsRoleConnection = {
  __typename?: 'UsersPermissionsRoleConnection'
  values: Maybe<Array<Maybe<UsersPermissionsRole>>>
  groupBy: Maybe<UsersPermissionsRoleGroupBy>
  aggregate: Maybe<UsersPermissionsRoleAggregator>
}

export type UsersPermissionsRoleAggregator = {
  __typename?: 'UsersPermissionsRoleAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type UsersPermissionsRoleGroupBy = {
  __typename?: 'UsersPermissionsRoleGroupBy'
  id: Maybe<Array<Maybe<UsersPermissionsRoleConnectionId>>>
  name: Maybe<Array<Maybe<UsersPermissionsRoleConnectionName>>>
  description: Maybe<Array<Maybe<UsersPermissionsRoleConnectionDescription>>>
  type: Maybe<Array<Maybe<UsersPermissionsRoleConnectionType>>>
  created_by: Maybe<Array<Maybe<UsersPermissionsRoleConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<UsersPermissionsRoleConnectionUpdated_By>>>
}

export type UsersPermissionsRoleConnectionId = {
  __typename?: 'UsersPermissionsRoleConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<UsersPermissionsRoleConnection>
}

export type UsersPermissionsRoleConnectionName = {
  __typename?: 'UsersPermissionsRoleConnectionName'
  key: Maybe<Scalars['String']>
  connection: Maybe<UsersPermissionsRoleConnection>
}

export type UsersPermissionsRoleConnectionDescription = {
  __typename?: 'UsersPermissionsRoleConnectionDescription'
  key: Maybe<Scalars['String']>
  connection: Maybe<UsersPermissionsRoleConnection>
}

export type UsersPermissionsRoleConnectionType = {
  __typename?: 'UsersPermissionsRoleConnectionType'
  key: Maybe<Scalars['String']>
  connection: Maybe<UsersPermissionsRoleConnection>
}

export type UsersPermissionsRoleConnectionCreated_By = {
  __typename?: 'UsersPermissionsRoleConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<UsersPermissionsRoleConnection>
}

export type UsersPermissionsRoleConnectionUpdated_By = {
  __typename?: 'UsersPermissionsRoleConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<UsersPermissionsRoleConnection>
}

export type RoleInput = {
  name: Scalars['String']
  description: Maybe<Scalars['String']>
  type: Maybe<Scalars['String']>
  permissions: Maybe<Array<Maybe<Scalars['ID']>>>
  users: Maybe<Array<Maybe<Scalars['ID']>>>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditRoleInput = {
  name: Maybe<Scalars['String']>
  description: Maybe<Scalars['String']>
  type: Maybe<Scalars['String']>
  permissions: Maybe<Array<Maybe<Scalars['ID']>>>
  users: Maybe<Array<Maybe<Scalars['ID']>>>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateRoleInput = {
  data: Maybe<RoleInput>
}

export type CreateRolePayload = {
  __typename?: 'createRolePayload'
  role: Maybe<UsersPermissionsRole>
}

export type UpdateRoleInput = {
  where: Maybe<InputId>
  data: Maybe<EditRoleInput>
}

export type UpdateRolePayload = {
  __typename?: 'updateRolePayload'
  role: Maybe<UsersPermissionsRole>
}

export type DeleteRoleInput = {
  where: Maybe<InputId>
}

export type DeleteRolePayload = {
  __typename?: 'deleteRolePayload'
  role: Maybe<UsersPermissionsRole>
}

export enum Enum_Userspermissionsuser_Occupation {
  Designer = 'designer',
  Engineer = 'engineer',
  Cio = 'CIO'
}

export enum Enum_Userspermissionsuser_Interest {
  Ci = 'CI',
  Cd = 'CD',
  Cv = 'CV',
  Ce = 'CE',
  Cf = 'CF'
}

export type UsersPermissionsUser = {
  __typename?: 'UsersPermissionsUser'
  id: Scalars['ID']
  created_at: Scalars['DateTime']
  updated_at: Scalars['DateTime']
  username: Scalars['String']
  email: Scalars['String']
  provider: Maybe<Scalars['String']>
  password: Maybe<Scalars['String']>
  resetPasswordToken: Maybe<Scalars['String']>
  confirmationToken: Maybe<Scalars['String']>
  confirmed: Maybe<Scalars['Boolean']>
  blocked: Maybe<Scalars['Boolean']>
  role: Maybe<UsersPermissionsRole>
  company: Maybe<Scalars['String']>
  occupation: Maybe<Enum_Userspermissionsuser_Occupation>
  interest: Maybe<Enum_Userspermissionsuser_Interest>
  created_by: Maybe<AdminUser>
  updated_by: Maybe<AdminUser>
}

export type UsersPermissionsUserConnection = {
  __typename?: 'UsersPermissionsUserConnection'
  values: Maybe<Array<Maybe<UsersPermissionsUser>>>
  groupBy: Maybe<UsersPermissionsUserGroupBy>
  aggregate: Maybe<UsersPermissionsUserAggregator>
}

export type UsersPermissionsUserAggregator = {
  __typename?: 'UsersPermissionsUserAggregator'
  count: Maybe<Scalars['Int']>
  totalCount: Maybe<Scalars['Int']>
}

export type UsersPermissionsUserGroupBy = {
  __typename?: 'UsersPermissionsUserGroupBy'
  id: Maybe<Array<Maybe<UsersPermissionsUserConnectionId>>>
  created_at: Maybe<Array<Maybe<UsersPermissionsUserConnectionCreated_At>>>
  updated_at: Maybe<Array<Maybe<UsersPermissionsUserConnectionUpdated_At>>>
  username: Maybe<Array<Maybe<UsersPermissionsUserConnectionUsername>>>
  email: Maybe<Array<Maybe<UsersPermissionsUserConnectionEmail>>>
  provider: Maybe<Array<Maybe<UsersPermissionsUserConnectionProvider>>>
  password: Maybe<Array<Maybe<UsersPermissionsUserConnectionPassword>>>
  resetPasswordToken: Maybe<Array<Maybe<UsersPermissionsUserConnectionResetPasswordToken>>>
  confirmationToken: Maybe<Array<Maybe<UsersPermissionsUserConnectionConfirmationToken>>>
  confirmed: Maybe<Array<Maybe<UsersPermissionsUserConnectionConfirmed>>>
  blocked: Maybe<Array<Maybe<UsersPermissionsUserConnectionBlocked>>>
  role: Maybe<Array<Maybe<UsersPermissionsUserConnectionRole>>>
  company: Maybe<Array<Maybe<UsersPermissionsUserConnectionCompany>>>
  occupation: Maybe<Array<Maybe<UsersPermissionsUserConnectionOccupation>>>
  interest: Maybe<Array<Maybe<UsersPermissionsUserConnectionInterest>>>
  created_by: Maybe<Array<Maybe<UsersPermissionsUserConnectionCreated_By>>>
  updated_by: Maybe<Array<Maybe<UsersPermissionsUserConnectionUpdated_By>>>
}

export type UsersPermissionsUserConnectionId = {
  __typename?: 'UsersPermissionsUserConnectionId'
  key: Maybe<Scalars['ID']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionCreated_At = {
  __typename?: 'UsersPermissionsUserConnectionCreated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionUpdated_At = {
  __typename?: 'UsersPermissionsUserConnectionUpdated_at'
  key: Maybe<Scalars['DateTime']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionUsername = {
  __typename?: 'UsersPermissionsUserConnectionUsername'
  key: Maybe<Scalars['String']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionEmail = {
  __typename?: 'UsersPermissionsUserConnectionEmail'
  key: Maybe<Scalars['String']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionProvider = {
  __typename?: 'UsersPermissionsUserConnectionProvider'
  key: Maybe<Scalars['String']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionPassword = {
  __typename?: 'UsersPermissionsUserConnectionPassword'
  key: Maybe<Scalars['String']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionResetPasswordToken = {
  __typename?: 'UsersPermissionsUserConnectionResetPasswordToken'
  key: Maybe<Scalars['String']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionConfirmationToken = {
  __typename?: 'UsersPermissionsUserConnectionConfirmationToken'
  key: Maybe<Scalars['String']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionConfirmed = {
  __typename?: 'UsersPermissionsUserConnectionConfirmed'
  key: Maybe<Scalars['Boolean']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionBlocked = {
  __typename?: 'UsersPermissionsUserConnectionBlocked'
  key: Maybe<Scalars['Boolean']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionRole = {
  __typename?: 'UsersPermissionsUserConnectionRole'
  key: Maybe<Scalars['ID']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionCompany = {
  __typename?: 'UsersPermissionsUserConnectionCompany'
  key: Maybe<Scalars['String']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionOccupation = {
  __typename?: 'UsersPermissionsUserConnectionOccupation'
  key: Maybe<Scalars['String']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionInterest = {
  __typename?: 'UsersPermissionsUserConnectionInterest'
  key: Maybe<Scalars['String']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionCreated_By = {
  __typename?: 'UsersPermissionsUserConnectionCreated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UsersPermissionsUserConnectionUpdated_By = {
  __typename?: 'UsersPermissionsUserConnectionUpdated_by'
  key: Maybe<Scalars['ID']>
  connection: Maybe<UsersPermissionsUserConnection>
}

export type UserInput = {
  username: Scalars['String']
  email: Scalars['String']
  provider: Maybe<Scalars['String']>
  password: Maybe<Scalars['String']>
  resetPasswordToken: Maybe<Scalars['String']>
  confirmationToken: Maybe<Scalars['String']>
  confirmed: Maybe<Scalars['Boolean']>
  blocked: Maybe<Scalars['Boolean']>
  role: Maybe<Scalars['ID']>
  company: Maybe<Scalars['String']>
  occupation: Maybe<Enum_Userspermissionsuser_Occupation>
  interest: Maybe<Enum_Userspermissionsuser_Interest>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type EditUserInput = {
  username: Maybe<Scalars['String']>
  email: Maybe<Scalars['String']>
  provider: Maybe<Scalars['String']>
  password: Maybe<Scalars['String']>
  resetPasswordToken: Maybe<Scalars['String']>
  confirmationToken: Maybe<Scalars['String']>
  confirmed: Maybe<Scalars['Boolean']>
  blocked: Maybe<Scalars['Boolean']>
  role: Maybe<Scalars['ID']>
  company: Maybe<Scalars['String']>
  occupation: Maybe<Enum_Userspermissionsuser_Occupation>
  interest: Maybe<Enum_Userspermissionsuser_Interest>
  created_by: Maybe<Scalars['ID']>
  updated_by: Maybe<Scalars['ID']>
}

export type CreateUserInput = {
  data: Maybe<UserInput>
}

export type CreateUserPayload = {
  __typename?: 'createUserPayload'
  user: Maybe<UsersPermissionsUser>
}

export type UpdateUserInput = {
  where: Maybe<InputId>
  data: Maybe<EditUserInput>
}

export type UpdateUserPayload = {
  __typename?: 'updateUserPayload'
  user: Maybe<UsersPermissionsUser>
}

export type DeleteUserInput = {
  where: Maybe<InputId>
}

export type DeleteUserPayload = {
  __typename?: 'deleteUserPayload'
  user: Maybe<UsersPermissionsUser>
}

export type ComponentCompanyPageAdressZone = {
  __typename?: 'ComponentCompanyPageAdressZone'
  id: Scalars['ID']
  name: Maybe<Scalars['String']>
  address: Maybe<Scalars['String']>
}

export type ComponentCompanyPageAdressZoneInput = {
  name: Maybe<Scalars['String']>
  address: Maybe<Scalars['String']>
}

export type EditComponentCompanyPageAdressZoneInput = {
  id: Maybe<Scalars['ID']>
  name: Maybe<Scalars['String']>
  address: Maybe<Scalars['String']>
}

export type ComponentCompanyPageOfficesZone = {
  __typename?: 'ComponentCompanyPageOfficesZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  addresses: Maybe<Array<Maybe<ComponentCompanyPageAdressZone>>>
}

export type ComponentCompanyPageOfficesZoneInput = {
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  addresses: Maybe<Array<Maybe<ComponentCompanyPageAdressZoneInput>>>
}

export type EditComponentCompanyPageOfficesZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  addresses: Maybe<Array<Maybe<EditComponentCompanyPageAdressZoneInput>>>
}

export type ComponentCompetitorComparisonPageComparisonCaseStudy = {
  __typename?: 'ComponentCompetitorComparisonPageComparisonCaseStudy'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  caseStudy: Maybe<Array<Maybe<ComponentPageCaseStudyZone>>>
}

export type ComponentCompetitorComparisonPageComparisonCaseStudyInput = {
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  caseStudy: Maybe<Array<Maybe<ComponentPageCaseStudyZoneInput>>>
}

export type EditComponentCompetitorComparisonPageComparisonCaseStudyInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  caseStudy: Maybe<Array<Maybe<EditComponentPageCaseStudyZoneInput>>>
}

export type ComponentCompetitorComparisonPageDetailedFeatureComparison = {
  __typename?: 'ComponentCompetitorComparisonPageDetailedFeatureComparison'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  detailedFeature: Maybe<Array<Maybe<ComponentCompetitorComparisonPageProductDetailedFeature>>>
  note: Maybe<Scalars['String']>
}

export type ComponentCompetitorComparisonPageDetailedFeatureComparisonInput = {
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  detailedFeature: Maybe<Array<Maybe<ComponentCompetitorComparisonPageProductDetailedFeatureInput>>>
  note: Maybe<Scalars['String']>
}

export type EditComponentCompetitorComparisonPageDetailedFeatureComparisonInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  detailedFeature: Maybe<Array<Maybe<EditComponentCompetitorComparisonPageProductDetailedFeatureInput>>>
  note: Maybe<Scalars['String']>
}

export type ComponentCompetitorComparisonPageFeatureComparison = {
  __typename?: 'ComponentCompetitorComparisonPageFeatureComparison'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  productFeature: Maybe<Array<Maybe<ComponentCompetitorComparisonPageProductFeature>>>
}

export type ComponentCompetitorComparisonPageFeatureComparisonInput = {
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  productFeature: Maybe<Array<Maybe<ComponentCompetitorComparisonPageProductFeatureInput>>>
}

export type EditComponentCompetitorComparisonPageFeatureComparisonInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  productFeature: Maybe<Array<Maybe<EditComponentCompetitorComparisonPageProductFeatureInput>>>
}

export type ComponentCompetitorComparisonPageProductDetailedFeature = {
  __typename?: 'ComponentCompetitorComparisonPageProductDetailedFeature'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
}

export type ComponentCompetitorComparisonPageProductDetailedFeatureInput = {
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
}

export type EditComponentCompetitorComparisonPageProductDetailedFeatureInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
}

export enum Enum_Componentcompetitorcomparisonpageproductfeature_Value {
  Na = 'NA',
  Yes = 'Yes',
  No = 'No',
  Maybe = 'Maybe'
}

export enum Enum_Componentcompetitorcomparisonpageproductfeature_Competitorvalue {
  Na = 'NA',
  Yes = 'Yes',
  No = 'No',
  Maybe = 'Maybe'
}

export type ComponentCompetitorComparisonPageProductFeature = {
  __typename?: 'ComponentCompetitorComparisonPageProductFeature'
  id: Scalars['ID']
  label: Maybe<Scalars['String']>
  value: Maybe<Enum_Componentcompetitorcomparisonpageproductfeature_Value>
  text: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  competitorValue: Maybe<Enum_Componentcompetitorcomparisonpageproductfeature_Competitorvalue>
  competitorText: Maybe<Scalars['String']>
}

export type ComponentCompetitorComparisonPageProductFeatureInput = {
  label: Maybe<Scalars['String']>
  value: Maybe<Enum_Componentcompetitorcomparisonpageproductfeature_Value>
  text: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  competitorValue: Maybe<Enum_Componentcompetitorcomparisonpageproductfeature_Competitorvalue>
  competitorText: Maybe<Scalars['String']>
}

export type EditComponentCompetitorComparisonPageProductFeatureInput = {
  id: Maybe<Scalars['ID']>
  label: Maybe<Scalars['String']>
  value: Maybe<Enum_Componentcompetitorcomparisonpageproductfeature_Value>
  text: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  competitorValue: Maybe<Enum_Componentcompetitorcomparisonpageproductfeature_Competitorvalue>
  competitorText: Maybe<Scalars['String']>
}

export type ComponentCompetitorComparisonPageProductSummaryZone = {
  __typename?: 'ComponentCompetitorComparisonPageProductSummaryZone'
  id: Scalars['ID']
  name: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  companySize: Maybe<Scalars['String']>
  founded: Maybe<Scalars['String']>
  funding: Maybe<Scalars['String']>
  categorized: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  logo: Maybe<UploadFile>
}

export type ComponentCompetitorComparisonPageProductSummaryZoneInput = {
  name: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  companySize: Maybe<Scalars['String']>
  founded: Maybe<Scalars['String']>
  funding: Maybe<Scalars['String']>
  categorized: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  logo: Maybe<Scalars['ID']>
}

export type EditComponentCompetitorComparisonPageProductSummaryZoneInput = {
  id: Maybe<Scalars['ID']>
  name: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  companySize: Maybe<Scalars['String']>
  founded: Maybe<Scalars['String']>
  funding: Maybe<Scalars['String']>
  categorized: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  logo: Maybe<Scalars['ID']>
}

export enum Enum_Componentpagecaselistzone_Modulecolor {
  Deployment = 'deployment',
  Builds = 'builds',
  Cloudcost = 'cloudcost',
  Featureflag = 'featureflag',
  Changeintel = 'changeintel',
  Filters = 'filters'
}

export type ComponentPageCaseListZone = {
  __typename?: 'ComponentPageCaseListZone'
  id: Scalars['ID']
  caseTitle: Maybe<Scalars['String']>
  caseDescription: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  videoLink: Maybe<Scalars['String']>
  moduleColor: Maybe<Enum_Componentpagecaselistzone_Modulecolor>
}

export type ComponentPageCaseListZoneInput = {
  caseTitle: Maybe<Scalars['String']>
  caseDescription: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  videoLink: Maybe<Scalars['String']>
  moduleColor: Maybe<Enum_Componentpagecaselistzone_Modulecolor>
}

export type EditComponentPageCaseListZoneInput = {
  id: Maybe<Scalars['ID']>
  caseTitle: Maybe<Scalars['String']>
  caseDescription: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  videoLink: Maybe<Scalars['String']>
  moduleColor: Maybe<Enum_Componentpagecaselistzone_Modulecolor>
}

export type ComponentPageCaseStudyZone = {
  __typename?: 'ComponentPageCaseStudyZone'
  id: Scalars['ID']
  quote: Maybe<Scalars['String']>
  client: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  clientPic: Maybe<UploadFile>
  background_color: Maybe<BackgroundColor>
  btnText: Maybe<Scalars['String']>
  harness_modules: Maybe<Array<Maybe<HarnessModule>>>
}

export type ComponentPageCaseStudyZoneHarness_ModulesArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type ComponentPageCaseStudyZoneInput = {
  quote: Maybe<Scalars['String']>
  client: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  clientPic: Maybe<Scalars['ID']>
  harness_modules: Maybe<Array<Maybe<Scalars['ID']>>>
  background_color: Maybe<Scalars['ID']>
  btnText: Maybe<Scalars['String']>
}

export type EditComponentPageCaseStudyZoneInput = {
  id: Maybe<Scalars['ID']>
  quote: Maybe<Scalars['String']>
  client: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  clientPic: Maybe<Scalars['ID']>
  harness_modules: Maybe<Array<Maybe<Scalars['ID']>>>
  background_color: Maybe<Scalars['ID']>
  btnText: Maybe<Scalars['String']>
}

export type ComponentPageCustomerLogoZone = {
  __typename?: 'ComponentPageCustomerLogoZone'
  id: Scalars['ID']
  customerName: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  logo: Maybe<UploadFile>
}

export type ComponentPageCustomerLogoZoneInput = {
  customerName: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  logo: Maybe<Scalars['ID']>
}

export type EditComponentPageCustomerLogoZoneInput = {
  id: Maybe<Scalars['ID']>
  customerName: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  logo: Maybe<Scalars['ID']>
}

export type ComponentPageExecutiveZone = {
  __typename?: 'ComponentPageExecutiveZone'
  id: Scalars['ID']
  name: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
  img: Maybe<UploadFile>
  bio: Maybe<Scalars['String']>
}

export type ComponentPageExecutiveZoneInput = {
  name: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
  img: Maybe<Scalars['ID']>
  bio: Maybe<Scalars['String']>
}

export type EditComponentPageExecutiveZoneInput = {
  id: Maybe<Scalars['ID']>
  name: Maybe<Scalars['String']>
  title: Maybe<Scalars['String']>
  img: Maybe<Scalars['ID']>
  bio: Maybe<Scalars['String']>
}

export type ComponentPageFeatureLIstZone = {
  __typename?: 'ComponentPageFeatureLIstZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
}

export type ComponentPageFeatureLIstZoneInput = {
  title: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
}

export type EditComponentPageFeatureLIstZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
}

export type ComponentPageHarnessModule = {
  __typename?: 'ComponentPageHarnessModule'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  harness_modules: Maybe<Array<Maybe<HarnessModule>>>
}

export type ComponentPageHarnessModuleHarness_ModulesArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type ComponentPageHarnessModuleInput = {
  harness_modules: Maybe<Array<Maybe<Scalars['ID']>>>
  title: Maybe<Scalars['String']>
}

export type EditComponentPageHarnessModuleInput = {
  id: Maybe<Scalars['ID']>
  harness_modules: Maybe<Array<Maybe<Scalars['ID']>>>
  title: Maybe<Scalars['String']>
}

export type ComponentPageImagePlus = {
  __typename?: 'ComponentPageImagePlus'
  id: Scalars['ID']
  name: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  comingSoon: Maybe<Scalars['Boolean']>
  img: Maybe<UploadFile>
}

export type ComponentPageImagePlusInput = {
  name: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  comingSoon: Maybe<Scalars['Boolean']>
  img: Maybe<Scalars['ID']>
}

export type EditComponentPageImagePlusInput = {
  id: Maybe<Scalars['ID']>
  name: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  comingSoon: Maybe<Scalars['Boolean']>
  img: Maybe<Scalars['ID']>
}

export type ComponentPageImageZone = {
  __typename?: 'ComponentPageImageZone'
  id: Scalars['ID']
  name: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  img: Maybe<UploadFile>
}

export type ComponentPageImageZoneInput = {
  name: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  img: Maybe<Scalars['ID']>
}

export type EditComponentPageImageZoneInput = {
  id: Maybe<Scalars['ID']>
  name: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  img: Maybe<Scalars['ID']>
}

export type ComponentPageMiniTitleZone = {
  __typename?: 'ComponentPageMiniTitleZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
}

export type ComponentPageMiniTitleZoneInput = {
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
}

export type EditComponentPageMiniTitleZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
}

export type ComponentPageModules = {
  __typename?: 'ComponentPageModules'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  img: Maybe<UploadFile>
}

export type ComponentPageModuleInput = {
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  img: Maybe<Scalars['ID']>
}

export type EditComponentPageModuleInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  img: Maybe<Scalars['ID']>
}

export type ComponentPageMultiImgListZone = {
  __typename?: 'ComponentPageMultiImgListZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  list: Maybe<Array<Maybe<ComponentPageFeatureLIstZone>>>
  img: Maybe<Array<Maybe<ComponentPageImageZone>>>
}

export type ComponentPageMultiImgListZoneInput = {
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  list: Maybe<Array<Maybe<ComponentPageFeatureLIstZoneInput>>>
  img: Maybe<Array<Maybe<ComponentPageImageZoneInput>>>
}

export type EditComponentPageMultiImgListZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  list: Maybe<Array<Maybe<EditComponentPageFeatureLIstZoneInput>>>
  img: Maybe<Array<Maybe<EditComponentPageImageZoneInput>>>
}

export type ComponentPageMultiImgZone = {
  __typename?: 'ComponentPageMultiImgZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  img: Maybe<Array<Maybe<UploadFile>>>
}

export type ComponentPageMultiImgZoneImgArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type ComponentPageMultiImgZoneInput = {
  title: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  img: Maybe<Array<Maybe<Scalars['ID']>>>
  subTitle: Maybe<Scalars['String']>
}

export type EditComponentPageMultiImgZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  img: Maybe<Array<Maybe<Scalars['ID']>>>
  subTitle: Maybe<Scalars['String']>
}

export type ComponentPageNewsZone = {
  __typename?: 'ComponentPageNewsZone'
  id: Scalars['ID']
  year: Maybe<Scalars['Int']>
  title: Maybe<Scalars['String']>
  media: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  logo: Maybe<UploadFile>
  img: Maybe<UploadFile>
  featured: Maybe<Scalars['Boolean']>
}

export type ComponentPageNewsZoneInput = {
  year: Maybe<Scalars['Int']>
  title: Maybe<Scalars['String']>
  media: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  logo: Maybe<Scalars['ID']>
  img: Maybe<Scalars['ID']>
  featured: Maybe<Scalars['Boolean']>
}

export type EditComponentPageNewsZoneInput = {
  id: Maybe<Scalars['ID']>
  year: Maybe<Scalars['Int']>
  title: Maybe<Scalars['String']>
  media: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  logo: Maybe<Scalars['ID']>
  img: Maybe<Scalars['ID']>
  featured: Maybe<Scalars['Boolean']>
}

export type ComponentPageOptionZone = {
  __typename?: 'ComponentPageOptionZone'
  id: Scalars['ID']
  optionSubTitle: Maybe<Scalars['String']>
  optionTitle: Maybe<Scalars['String']>
  optionDescription: Maybe<Scalars['String']>
  screenshot: Maybe<UploadFile>
}

export type ComponentPageOptionZoneInput = {
  optionSubTitle: Maybe<Scalars['String']>
  optionTitle: Maybe<Scalars['String']>
  optionDescription: Maybe<Scalars['String']>
  screenshot: Maybe<Scalars['ID']>
}

export type EditComponentPageOptionZoneInput = {
  id: Maybe<Scalars['ID']>
  optionSubTitle: Maybe<Scalars['String']>
  optionTitle: Maybe<Scalars['String']>
  optionDescription: Maybe<Scalars['String']>
  screenshot: Maybe<Scalars['ID']>
}

export type ComponentPageProductIntroLogoZone = {
  __typename?: 'ComponentPageProductIntroLogoZone'
  id: Scalars['ID']
  prodLogo: Maybe<UploadFile>
  prodIntroTitle: Maybe<Scalars['String']>
  ProdIntroDesc: Maybe<Scalars['String']>
  prodIntroScreenshot: Maybe<UploadFile>
}

export type ComponentPageProductIntroLogoZoneInput = {
  prodLogo: Maybe<Scalars['ID']>
  prodIntroTitle: Maybe<Scalars['String']>
  ProdIntroDesc: Maybe<Scalars['String']>
  prodIntroScreenshot: Maybe<Scalars['ID']>
}

export type EditComponentPageProductIntroLogoZoneInput = {
  id: Maybe<Scalars['ID']>
  prodLogo: Maybe<Scalars['ID']>
  prodIntroTitle: Maybe<Scalars['String']>
  ProdIntroDesc: Maybe<Scalars['String']>
  prodIntroScreenshot: Maybe<Scalars['ID']>
}

export type ComponentPageProductTitleZone = {
  __typename?: 'ComponentPageProductTitleZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  img: Maybe<UploadFile>
  backgroundImg: Maybe<UploadFile>
  link: Maybe<Scalars['String']>
  video: Maybe<Scalars['String']>
}

export type ComponentPageProductTitleZoneInput = {
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  img: Maybe<Scalars['ID']>
  backgroundImg: Maybe<Scalars['ID']>
  link: Maybe<Scalars['String']>
  video: Maybe<Scalars['String']>
}

export type EditComponentPageProductTitleZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  img: Maybe<Scalars['ID']>
  backgroundImg: Maybe<Scalars['ID']>
  link: Maybe<Scalars['String']>
  video: Maybe<Scalars['String']>
}

export type ComponentPageQuoteZone = {
  __typename?: 'ComponentPageQuoteZone'
  id: Scalars['ID']
  quoteText: Maybe<Scalars['String']>
  quoteName: Maybe<Scalars['String']>
}

export type ComponentPageQuoteZoneInput = {
  quoteText: Maybe<Scalars['String']>
  quoteName: Maybe<Scalars['String']>
}

export type EditComponentPageQuoteZoneInput = {
  id: Maybe<Scalars['ID']>
  quoteText: Maybe<Scalars['String']>
  quoteName: Maybe<Scalars['String']>
}

export type ComponentPageRichTextZone = {
  __typename?: 'ComponentPageRichTextZone'
  id: Scalars['ID']
  pageTitle: Maybe<Scalars['String']>
  bodyText: Maybe<Scalars['String']>
  dateText: Maybe<Scalars['String']>
}

export type ComponentPageRichTextZoneInput = {
  pageTitle: Maybe<Scalars['String']>
  bodyText: Maybe<Scalars['String']>
  dateText: Maybe<Scalars['String']>
}

export type EditComponentPageRichTextZoneInput = {
  id: Maybe<Scalars['ID']>
  pageTitle: Maybe<Scalars['String']>
  bodyText: Maybe<Scalars['String']>
  dateText: Maybe<Scalars['String']>
}

export type ComponentPageScreenshotZone = {
  __typename?: 'ComponentPageScreenshotZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  img: Maybe<Array<Maybe<ComponentPageImageZone>>>
  desc: Maybe<Scalars['String']>
}

export type ComponentPageScreenshotZoneInput = {
  title: Maybe<Scalars['String']>
  img: Maybe<Array<Maybe<ComponentPageImageZoneInput>>>
  desc: Maybe<Scalars['String']>
}

export type EditComponentPageScreenshotZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  img: Maybe<Array<Maybe<EditComponentPageImageZoneInput>>>
  desc: Maybe<Scalars['String']>
}

export type ComponentPageSectionOptions = {
  __typename?: 'ComponentPageSectionOptions'
  id: Scalars['ID']
  optionTitle: Maybe<Scalars['String']>
  optionDesc: Maybe<Scalars['String']>
  optionImg: Maybe<UploadFile>
  richTextDesc: Maybe<Scalars['String']>
}

export type ComponentPageSectionOptionInput = {
  optionTitle: Maybe<Scalars['String']>
  optionDesc: Maybe<Scalars['String']>
  optionImg: Maybe<Scalars['ID']>
  richTextDesc: Maybe<Scalars['String']>
}

export type EditComponentPageSectionOptionInput = {
  id: Maybe<Scalars['ID']>
  optionTitle: Maybe<Scalars['String']>
  optionDesc: Maybe<Scalars['String']>
  optionImg: Maybe<Scalars['ID']>
  richTextDesc: Maybe<Scalars['String']>
}

export type ComponentPageSectionSecurity = {
  __typename?: 'ComponentPageSectionSecurity'
  id: Scalars['ID']
  securityTitle: Maybe<Scalars['String']>
  securityDesc: Maybe<Scalars['String']>
  securityImg: Maybe<UploadFile>
}

export type ComponentPageSectionSecurityInput = {
  securityTitle: Maybe<Scalars['String']>
  securityDesc: Maybe<Scalars['String']>
  securityImg: Maybe<Scalars['ID']>
}

export type EditComponentPageSectionSecurityInput = {
  id: Maybe<Scalars['ID']>
  securityTitle: Maybe<Scalars['String']>
  securityDesc: Maybe<Scalars['String']>
  securityImg: Maybe<Scalars['ID']>
}

export type ComponentPageSimpleTitleZone = {
  __typename?: 'ComponentPageSimpleTitleZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
}

export type ComponentPageSimpleTitleZoneInput = {
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
}

export type EditComponentPageSimpleTitleZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
}

export type ComponentPageSimpleZone = {
  __typename?: 'ComponentPageSimpleZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  investorList: Maybe<Array<Maybe<ComponentPageCustomerLogoZone>>>
}

export type ComponentPageSimpleZoneInput = {
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  investorList: Maybe<Array<Maybe<ComponentPageCustomerLogoZoneInput>>>
}

export type EditComponentPageSimpleZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  investorList: Maybe<Array<Maybe<EditComponentPageCustomerLogoZoneInput>>>
}

export type ComponentPageTeamZone = {
  __typename?: 'ComponentPageTeamZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  teamPics: Maybe<Array<Maybe<ComponentPageImageZone>>>
}

export type ComponentPageTeamZoneInput = {
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  teamPics: Maybe<Array<Maybe<ComponentPageImageZoneInput>>>
}

export type EditComponentPageTeamZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  teamPics: Maybe<Array<Maybe<EditComponentPageImageZoneInput>>>
}

export type ComponentPageTextImageZone = {
  __typename?: 'ComponentPageTextImageZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  img: Maybe<UploadFile>
}

export type ComponentPageTextImageZoneInput = {
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  img: Maybe<Scalars['ID']>
}

export type EditComponentPageTextImageZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  img: Maybe<Scalars['ID']>
}

export type ComponentPageTextZone = {
  __typename?: 'ComponentPageTextZone'
  id: Scalars['ID']
  featureTitle: Maybe<Scalars['String']>
  FeatureIntro: Maybe<Scalars['String']>
  imageName: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
}

export type ComponentPageTextZoneInput = {
  featureTitle: Maybe<Scalars['String']>
  FeatureIntro: Maybe<Scalars['String']>
  imageName: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
}

export type EditComponentPageTextZoneInput = {
  id: Maybe<Scalars['ID']>
  featureTitle: Maybe<Scalars['String']>
  FeatureIntro: Maybe<Scalars['String']>
  imageName: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
}

export type ComponentPageTitleImgZone = {
  __typename?: 'ComponentPageTitleImgZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  img: Maybe<UploadFile>
}

export type ComponentPageTitleImgZoneInput = {
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  img: Maybe<Scalars['ID']>
}

export type EditComponentPageTitleImgZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  img: Maybe<Scalars['ID']>
}

export type ComponentPageTitleZone = {
  __typename?: 'ComponentPageTitleZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  description: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desktopHeroAnimation: Maybe<UploadFile>
  mobileHeroAnimation: Maybe<UploadFile>
  img: Maybe<UploadFile>
}

export type ComponentPageTitleZoneInput = {
  title: Maybe<Scalars['String']>
  description: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desktopHeroAnimation: Maybe<Scalars['ID']>
  mobileHeroAnimation: Maybe<Scalars['ID']>
  img: Maybe<Scalars['ID']>
}

export type EditComponentPageTitleZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  description: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  desktopHeroAnimation: Maybe<Scalars['ID']>
  mobileHeroAnimation: Maybe<Scalars['ID']>
  img: Maybe<Scalars['ID']>
}

export type ComponentPageWorkflowCard = {
  __typename?: 'ComponentPageWorkflowCard'
  id: Scalars['ID']
  cardTitle: Maybe<Scalars['String']>
  cardDesc: Maybe<Scalars['String']>
  cardImg: Maybe<UploadFile>
}

export type ComponentPageWorkflowCardInput = {
  cardTitle: Maybe<Scalars['String']>
  cardDesc: Maybe<Scalars['String']>
  cardImg: Maybe<Scalars['ID']>
}

export type EditComponentPageWorkflowCardInput = {
  id: Maybe<Scalars['ID']>
  cardTitle: Maybe<Scalars['String']>
  cardDesc: Maybe<Scalars['String']>
  cardImg: Maybe<Scalars['ID']>
}

export type ComponentPageWorkflow = {
  __typename?: 'ComponentPageWorkflow'
  id: Scalars['ID']
  workflowTitle: Maybe<Scalars['String']>
  workflowDesc: Maybe<Scalars['String']>
  workflowImg: Maybe<UploadFile>
  workflowCard: Maybe<Array<Maybe<ComponentPageWorkflowCard>>>
}

export type ComponentPageWorkflowInput = {
  workflowTitle: Maybe<Scalars['String']>
  workflowDesc: Maybe<Scalars['String']>
  workflowImg: Maybe<Scalars['ID']>
  workflowCard: Maybe<Array<Maybe<ComponentPageWorkflowCardInput>>>
}

export type EditComponentPageWorkflowInput = {
  id: Maybe<Scalars['ID']>
  workflowTitle: Maybe<Scalars['String']>
  workflowDesc: Maybe<Scalars['String']>
  workflowImg: Maybe<Scalars['ID']>
  workflowCard: Maybe<Array<Maybe<EditComponentPageWorkflowCardInput>>>
}

export type ComponentPricingPageCallOut = {
  __typename?: 'ComponentPricingPageCallOut'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
}

export type ComponentPricingPageCallOutInput = {
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
}

export type EditComponentPricingPageCallOutInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
}

export enum Enum_Componentpricingpagedetailedfeature_Communityvalue {
  Yes = 'Yes',
  No = 'No'
}

export enum Enum_Componentpricingpagedetailedfeature_Freevalue {
  Yes = 'Yes',
  No = 'No'
}

export enum Enum_Componentpricingpagedetailedfeature_Teamvalue {
  Yes = 'Yes',
  No = 'No'
}

export enum Enum_Componentpricingpagedetailedfeature_Enterprisevalue {
  Yes = 'Yes',
  No = 'No'
}

export type ComponentPricingPageDetailedFeature = {
  __typename?: 'ComponentPricingPageDetailedFeature'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  communityValue: Maybe<Enum_Componentpricingpagedetailedfeature_Communityvalue>
  communityText: Maybe<Scalars['String']>
  freeValue: Maybe<Enum_Componentpricingpagedetailedfeature_Freevalue>
  freeText: Maybe<Scalars['String']>
  teamValue: Maybe<Enum_Componentpricingpagedetailedfeature_Teamvalue>
  teamText: Maybe<Scalars['String']>
  enterpriseValue: Maybe<Enum_Componentpricingpagedetailedfeature_Enterprisevalue>
  enterpriseText: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
}

export type ComponentPricingPageDetailedFeatureInput = {
  title: Maybe<Scalars['String']>
  communityValue: Maybe<Enum_Componentpricingpagedetailedfeature_Communityvalue>
  communityText: Maybe<Scalars['String']>
  freeValue: Maybe<Enum_Componentpricingpagedetailedfeature_Freevalue>
  freeText: Maybe<Scalars['String']>
  teamValue: Maybe<Enum_Componentpricingpagedetailedfeature_Teamvalue>
  teamText: Maybe<Scalars['String']>
  enterpriseValue: Maybe<Enum_Componentpricingpagedetailedfeature_Enterprisevalue>
  enterpriseText: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
}

export type EditComponentPricingPageDetailedFeatureInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  communityValue: Maybe<Enum_Componentpricingpagedetailedfeature_Communityvalue>
  communityText: Maybe<Scalars['String']>
  freeValue: Maybe<Enum_Componentpricingpagedetailedfeature_Freevalue>
  freeText: Maybe<Scalars['String']>
  teamValue: Maybe<Enum_Componentpricingpagedetailedfeature_Teamvalue>
  teamText: Maybe<Scalars['String']>
  enterpriseValue: Maybe<Enum_Componentpricingpagedetailedfeature_Enterprisevalue>
  enterpriseText: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
}

export type ComponentPricingPageFaq = {
  __typename?: 'ComponentPricingPageFaq'
  id: Scalars['ID']
  faqTitle: Maybe<Scalars['String']>
  faqAnswer: Maybe<Scalars['String']>
  anchor: Maybe<Scalars['String']>
}

export type ComponentPricingPageFaqInput = {
  faqTitle: Maybe<Scalars['String']>
  faqAnswer: Maybe<Scalars['String']>
  anchor: Maybe<Scalars['String']>
}

export type EditComponentPricingPageFaqInput = {
  id: Maybe<Scalars['ID']>
  faqTitle: Maybe<Scalars['String']>
  faqAnswer: Maybe<Scalars['String']>
  anchor: Maybe<Scalars['String']>
}

export type ComponentPricingPageFeatureCaption = {
  __typename?: 'ComponentPricingPageFeatureCaption'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  btnText: Maybe<Scalars['String']>
  btnLink: Maybe<Scalars['String']>
  primaryButton: Maybe<Scalars['Boolean']>
}

export type ComponentPricingPageFeatureCaptionInput = {
  title: Maybe<Scalars['String']>
  btnText: Maybe<Scalars['String']>
  btnLink: Maybe<Scalars['String']>
  primaryButton: Maybe<Scalars['Boolean']>
}

export type EditComponentPricingPageFeatureCaptionInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  btnText: Maybe<Scalars['String']>
  btnLink: Maybe<Scalars['String']>
  primaryButton: Maybe<Scalars['Boolean']>
}

export type ComponentPricingPageFeatureGroup = {
  __typename?: 'ComponentPricingPageFeatureGroup'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  detailedFeature: Maybe<Array<Maybe<ComponentPricingPageDetailedFeature>>>
}

export type ComponentPricingPageFeatureGroupInput = {
  title: Maybe<Scalars['String']>
  detailedFeature: Maybe<Array<Maybe<ComponentPricingPageDetailedFeatureInput>>>
}

export type EditComponentPricingPageFeatureGroupInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  detailedFeature: Maybe<Array<Maybe<EditComponentPricingPageDetailedFeatureInput>>>
}

export type ComponentPricingPageMorePlansZone = {
  __typename?: 'ComponentPricingPageMorePlansZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  servicesSupported: Maybe<Scalars['String']>
  users: Maybe<Scalars['String']>
  deploymentVerification: Maybe<Scalars['Boolean']>
  managementAtScale: Maybe<Scalars['String']>
  security: Maybe<Scalars['String']>
  support: Maybe<Scalars['String']>
  deplymentUnits: Maybe<Scalars['String']>
  deplymentPerDay: Maybe<Scalars['String']>
  buttonText: Maybe<Scalars['String']>
  primaryButton: Maybe<Scalars['Boolean']>
  enterpriseGovernance: Maybe<Scalars['String']>
}

export type ComponentPricingPageMorePlansZoneInput = {
  title: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  servicesSupported: Maybe<Scalars['String']>
  users: Maybe<Scalars['String']>
  deploymentVerification: Maybe<Scalars['Boolean']>
  managementAtScale: Maybe<Scalars['String']>
  security: Maybe<Scalars['String']>
  support: Maybe<Scalars['String']>
  deplymentUnits: Maybe<Scalars['String']>
  deplymentPerDay: Maybe<Scalars['String']>
  buttonText: Maybe<Scalars['String']>
  primaryButton: Maybe<Scalars['Boolean']>
  enterpriseGovernance: Maybe<Scalars['String']>
}

export type EditComponentPricingPageMorePlansZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  servicesSupported: Maybe<Scalars['String']>
  users: Maybe<Scalars['String']>
  deploymentVerification: Maybe<Scalars['Boolean']>
  managementAtScale: Maybe<Scalars['String']>
  security: Maybe<Scalars['String']>
  support: Maybe<Scalars['String']>
  deplymentUnits: Maybe<Scalars['String']>
  deplymentPerDay: Maybe<Scalars['String']>
  buttonText: Maybe<Scalars['String']>
  primaryButton: Maybe<Scalars['Boolean']>
  enterpriseGovernance: Maybe<Scalars['String']>
}

export type ComponentPricingPagePlansZone = {
  __typename?: 'ComponentPricingPagePlansZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  img: Maybe<UploadFile>
  price: Maybe<Scalars['String']>
  unit: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  featureListZone: Maybe<Array<Maybe<ComponentPageFeatureLIstZone>>>
  buttonText: Maybe<Scalars['String']>
  primaryButton: Maybe<Scalars['Boolean']>
  yearlyPrice: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  comingSoon: Maybe<Scalars['Boolean']>
  priceTips: Maybe<Scalars['String']>
  support: Maybe<Scalars['String']>
  featureTitle: Maybe<Scalars['String']>
  unitTips: Maybe<Scalars['String']>
  priceTerm: Maybe<Scalars['String']>
  priceTermTips: Maybe<Scalars['String']>
  yearlyPriceTips: Maybe<Scalars['String']>
  yearlyPriceTerm: Maybe<Scalars['String']>
  yearlyPriceTermTips: Maybe<Scalars['String']>
}

export type ComponentPricingPagePlansZoneInput = {
  title: Maybe<Scalars['String']>
  img: Maybe<Scalars['ID']>
  price: Maybe<Scalars['String']>
  unit: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  featureListZone: Maybe<Array<Maybe<ComponentPageFeatureLIstZoneInput>>>
  buttonText: Maybe<Scalars['String']>
  primaryButton: Maybe<Scalars['Boolean']>
  yearlyPrice: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  comingSoon: Maybe<Scalars['Boolean']>
  priceTips: Maybe<Scalars['String']>
  support: Maybe<Scalars['String']>
  featureTitle: Maybe<Scalars['String']>
  unitTips: Maybe<Scalars['String']>
  priceTerm: Maybe<Scalars['String']>
  priceTermTips: Maybe<Scalars['String']>
  yearlyPriceTips: Maybe<Scalars['String']>
  yearlyPriceTerm: Maybe<Scalars['String']>
  yearlyPriceTermTips: Maybe<Scalars['String']>
}

export type EditComponentPricingPagePlansZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  img: Maybe<Scalars['ID']>
  price: Maybe<Scalars['String']>
  unit: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  featureListZone: Maybe<Array<Maybe<EditComponentPageFeatureLIstZoneInput>>>
  buttonText: Maybe<Scalars['String']>
  primaryButton: Maybe<Scalars['Boolean']>
  yearlyPrice: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  comingSoon: Maybe<Scalars['Boolean']>
  priceTips: Maybe<Scalars['String']>
  support: Maybe<Scalars['String']>
  featureTitle: Maybe<Scalars['String']>
  unitTips: Maybe<Scalars['String']>
  priceTerm: Maybe<Scalars['String']>
  priceTermTips: Maybe<Scalars['String']>
  yearlyPriceTips: Maybe<Scalars['String']>
  yearlyPriceTerm: Maybe<Scalars['String']>
  yearlyPriceTermTips: Maybe<Scalars['String']>
}

export type ComponentPricingPageTooltipsZone = {
  __typename?: 'ComponentPricingPageTooltipsZone'
  id: Scalars['ID']
  keyword: Maybe<Scalars['String']>
  tooltip: Maybe<Scalars['String']>
}

export type ComponentPricingPageTooltipsZoneInput = {
  keyword: Maybe<Scalars['String']>
  tooltip: Maybe<Scalars['String']>
}

export type EditComponentPricingPageTooltipsZoneInput = {
  id: Maybe<Scalars['ID']>
  keyword: Maybe<Scalars['String']>
  tooltip: Maybe<Scalars['String']>
}

export type ComponentProductPageIntegrationZone = {
  __typename?: 'ComponentProductPageIntegrationZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  clientSide: Maybe<Array<Maybe<ComponentPageImagePlus>>>
  serverSide: Maybe<Array<Maybe<ComponentPageImagePlus>>>
}

export type ComponentProductPageIntegrationZoneInput = {
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  clientSide: Maybe<Array<Maybe<ComponentPageImagePlusInput>>>
  serverSide: Maybe<Array<Maybe<ComponentPageImagePlusInput>>>
}

export type EditComponentProductPageIntegrationZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  clientSide: Maybe<Array<Maybe<EditComponentPageImagePlusInput>>>
  serverSide: Maybe<Array<Maybe<EditComponentPageImagePlusInput>>>
}

export type ComponentProductPageIntegrationsZone = {
  __typename?: 'ComponentProductPageIntegrationsZone'
  id: Scalars['ID']
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  img: Maybe<Array<Maybe<ComponentPageImagePlus>>>
}

export type ComponentProductPageIntegrationsZoneInput = {
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  img: Maybe<Array<Maybe<ComponentPageImagePlusInput>>>
}

export type EditComponentProductPageIntegrationsZoneInput = {
  id: Maybe<Scalars['ID']>
  title: Maybe<Scalars['String']>
  subTitle: Maybe<Scalars['String']>
  link: Maybe<Scalars['String']>
  secondaryLink: Maybe<Scalars['String']>
  desc: Maybe<Scalars['String']>
  img: Maybe<Array<Maybe<EditComponentPageImagePlusInput>>>
}

export type Morph =
  | UsersPermissionsMe
  | UsersPermissionsMeRole
  | UsersPermissionsLoginPayload
  | UserPermissionsPasswordPayload
  | AboutUs
  | UpdateAboutUsPayload
  | DeleteAboutUsPayload
  | BackgroundColor
  | BackgroundColorConnection
  | BackgroundColorAggregator
  | BackgroundColorGroupBy
  | BackgroundColorConnectionId
  | BackgroundColorConnectionCreated_At
  | BackgroundColorConnectionUpdated_At
  | BackgroundColorConnectionColorName
  | BackgroundColorConnectionColorCode
  | BackgroundColorConnectionPublished_At
  | BackgroundColorConnectionCreated_By
  | BackgroundColorConnectionUpdated_By
  | CreateBackgroundColorPayload
  | UpdateBackgroundColorPayload
  | DeleteBackgroundColorPayload
  | Careers
  | UpdateCareerPayload
  | DeleteCareerPayload
  | CaseStudy
  | CaseStudyConnection
  | CaseStudyAggregator
  | CaseStudyGroupBy
  | CaseStudyConnectionId
  | CaseStudyConnectionCreated_At
  | CaseStudyConnectionUpdated_At
  | CaseStudyConnectionTitle
  | CaseStudyConnectionDescription
  | CaseStudyConnectionVideoLink
  | CaseStudyConnectionCompanyLogo
  | CaseStudyConnectionIndustry
  | CaseStudyConnectionBackground_Color
  | CaseStudyConnectionCompany_Size
  | CaseStudyConnectionPublished_At
  | CaseStudyConnectionCreated_By
  | CaseStudyConnectionUpdated_By
  | CreateCaseStudyPayload
  | UpdateCaseStudyPayload
  | DeleteCaseStudyPayload
  | CompanySize
  | CompanySizeConnection
  | CompanySizeAggregator
  | CompanySizeGroupBy
  | CompanySizeConnectionId
  | CompanySizeConnectionCreated_At
  | CompanySizeConnectionUpdated_At
  | CompanySizeConnectionItem
  | CompanySizeConnectionPublished_At
  | CompanySizeConnectionCreated_By
  | CompanySizeConnectionUpdated_By
  | CreateCompanySizePayload
  | UpdateCompanySizePayload
  | DeleteCompanySizePayload
  | CompetitorComparison
  | CompetitorComparisonConnection
  | CompetitorComparisonAggregator
  | CompetitorComparisonGroupBy
  | CompetitorComparisonConnectionId
  | CompetitorComparisonConnectionCreated_At
  | CompetitorComparisonConnectionUpdated_At
  | CompetitorComparisonConnectionHarnessModule
  | CompetitorComparisonConnectionCompetitor
  | CompetitorComparisonConnectionHarnessSummary
  | CompetitorComparisonConnectionHarnessLogo
  | CompetitorComparisonConnectionCompetitorLogo
  | CompetitorComparisonConnectionFeatureComparison
  | CompetitorComparisonConnectionSlug
  | CompetitorComparisonConnectionDetailedFeatureComparison
  | CompetitorComparisonConnectionCaseStudy
  | CompetitorComparisonConnectionScreenshot
  | CompetitorComparisonConnectionRecommended
  | CompetitorComparisonConnectionCompetitorSummary
  | CompetitorComparisonConnectionPublished_At
  | CompetitorComparisonConnectionCreated_By
  | CompetitorComparisonConnectionUpdated_By
  | CreateCompetitorComparisonPayload
  | UpdateCompetitorComparisonPayload
  | DeleteCompetitorComparisonPayload
  | ContactSale
  | ContactSaleConnection
  | ContactSaleAggregator
  | ContactSaleGroupBy
  | ContactSaleConnectionId
  | ContactSaleConnectionCreated_At
  | ContactSaleConnectionUpdated_At
  | ContactSaleConnectionFirstName
  | ContactSaleConnectionLastName
  | ContactSaleConnectionTitle
  | ContactSaleConnectionCompany
  | ContactSaleConnectionPhone
  | ContactSaleConnectionEmail
  | ContactSaleConnectionPublished_At
  | ContactSaleConnectionCreated_By
  | ContactSaleConnectionUpdated_By
  | CreateContactSalePayload
  | UpdateContactSalePayload
  | DeleteContactSalePayload
  | ContactUs
  | ContactUsConnection
  | ContactUsAggregator
  | ContactUsGroupBy
  | ContactUsConnectionId
  | ContactUsConnectionCreated_At
  | ContactUsConnectionUpdated_At
  | ContactUsConnectionFirstName
  | ContactUsConnectionLastName
  | ContactUsConnectionTitle
  | ContactUsConnectionCompany
  | ContactUsConnectionPhone
  | ContactUsConnectionEmail
  | ContactUsConnectionPublished_At
  | ContactUsConnectionCreated_By
  | ContactUsConnectionUpdated_By
  | CreateContactUsPayload
  | UpdateContactUsPayload
  | DeleteContactUsPayload
  | Customer
  | UpdateCustomerPayload
  | DeleteCustomerPayload
  | DevOpsTools
  | UpdateDevOpsToolPayload
  | DeleteDevOpsToolPayload
  | EBook
  | EBookConnection
  | EBookAggregator
  | EBookAggregatorSum
  | EBookAggregatorAvg
  | EBookAggregatorMin
  | EBookAggregatorMax
  | EBookGroupBy
  | EBookConnectionId
  | EBookConnectionCreated_At
  | EBookConnectionUpdated_At
  | EBookConnectionTitle
  | EBookConnectionSlug
  | EBookConnectionPreview_Image
  | EBookConnectionContent
  | EBookConnectionPublished
  | EBookConnectionDetail_Image
  | EBookConnectionMkto_Form_Id
  | EBookConnectionPdf
  | EBookConnectionPublished_At
  | EBookConnectionCreated_By
  | EBookConnectionUpdated_By
  | CreateEBookPayload
  | UpdateEBookPayload
  | DeleteEBookPayload
  | Event
  | EventConnection
  | EventAggregator
  | EventGroupBy
  | EventConnectionId
  | EventConnectionCreated_At
  | EventConnectionUpdated_At
  | EventConnectionTitle
  | EventConnectionSlug
  | EventConnectionTopBannerText
  | EventConnectionTopBannerImg
  | EventConnectionProfilesHeading
  | EventConnectionDetailsLeftColumn
  | EventConnectionDetailsRightColumn
  | EventConnectionRegistration
  | EventConnectionMkto_Form_Id
  | EventConnectionMktoFormTitle
  | EventConnectionRegisterImage
  | EventConnectionPublished_At
  | EventConnectionCreated_By
  | EventConnectionUpdated_By
  | CreateEventPayload
  | UpdateEventPayload
  | DeleteEventPayload
  | HarnessModule
  | HarnessModuleConnection
  | HarnessModuleAggregator
  | HarnessModuleGroupBy
  | HarnessModuleConnectionId
  | HarnessModuleConnectionCreated_At
  | HarnessModuleConnectionUpdated_At
  | HarnessModuleConnectionModuleName
  | HarnessModuleConnectionModuleDesc
  | HarnessModuleConnectionLink
  | HarnessModuleConnectionModuleStyle
  | HarnessModuleConnectionItem
  | HarnessModuleConnectionPublished_At
  | HarnessModuleConnectionCreated_By
  | HarnessModuleConnectionUpdated_By
  | CreateHarnessModulePayload
  | UpdateHarnessModulePayload
  | DeleteHarnessModulePayload
  | HarnessSubscription
  | UpdateHarnessSubscriptionPayload
  | DeleteHarnessSubscriptionPayload
  | Home
  | UpdateHomePayload
  | DeleteHomePayload
  | Industry
  | IndustryConnection
  | IndustryAggregator
  | IndustryGroupBy
  | IndustryConnectionId
  | IndustryConnectionCreated_At
  | IndustryConnectionUpdated_At
  | IndustryConnectionItem
  | IndustryConnectionPublished_At
  | IndustryConnectionCreated_By
  | IndustryConnectionUpdated_By
  | CreateIndustryPayload
  | UpdateIndustryPayload
  | DeleteIndustryPayload
  | Integration
  | IntegrationConnection
  | IntegrationAggregator
  | IntegrationGroupBy
  | IntegrationConnectionId
  | IntegrationConnectionCreated_At
  | IntegrationConnectionUpdated_At
  | IntegrationConnectionItem
  | IntegrationConnectionPublished_At
  | IntegrationConnectionCreated_By
  | IntegrationConnectionUpdated_By
  | CreateIntegrationPayload
  | UpdateIntegrationPayload
  | DeleteIntegrationPayload
  | MarketingSite
  | MarketingSiteConnection
  | MarketingSiteAggregator
  | MarketingSiteGroupBy
  | MarketingSiteConnectionId
  | MarketingSiteConnectionCreated_At
  | MarketingSiteConnectionUpdated_At
  | MarketingSiteConnectionHeroTitle
  | MarketingSiteConnectionHeroSubTitle
  | MarketingSiteConnectionName
  | MarketingSiteConnectionPiplineTitle
  | MarketingSiteConnectionPipelineDesc
  | MarketingSiteConnectionDeveloperTitle
  | MarketingSiteConnectionDeveloperDesc
  | MarketingSiteConnectionAiTitle
  | MarketingSiteConnectionAiDesc
  | MarketingSiteConnectionGovernaceTitle
  | MarketingSiteConnectionGovernaceDesc
  | MarketingSiteConnectionCdTitle
  | MarketingSiteConnectionCdSubTitle
  | MarketingSiteConnectionCdDesc
  | MarketingSiteConnectionCiTitle
  | MarketingSiteConnectionCiSubTitle
  | MarketingSiteConnectionCiDesc
  | MarketingSiteConnectionCloudCostTitle
  | MarketingSiteConnectionCloudCostSubTitle
  | MarketingSiteConnectionCloudCostDesc
  | MarketingSiteConnectionFeatureFlagsTitle
  | MarketingSiteConnectionFeatureFlagsSubTitle
  | MarketingSiteConnectionFeatureFlagsDesc
  | MarketingSiteConnectionChIntelTitle
  | MarketingSiteConnectionChIntelSubTitle
  | MarketingSiteConnectionChIntelDesc
  | MarketingSiteConnectionCaseStudy1
  | MarketingSiteConnectionCaseStudy1Client
  | MarketingSiteConnectionCaseStudy2
  | MarketingSiteConnectionCaseStudy2Client
  | MarketingSiteConnectionPublished_At
  | MarketingSiteConnectionCreated_By
  | MarketingSiteConnectionUpdated_By
  | CreateMarketingSitePayload
  | UpdateMarketingSitePayload
  | DeleteMarketingSitePayload
  | Outcome
  | OutcomeConnection
  | OutcomeAggregator
  | OutcomeGroupBy
  | OutcomeConnectionId
  | OutcomeConnectionCreated_At
  | OutcomeConnectionUpdated_At
  | OutcomeConnectionItem
  | OutcomeConnectionPublished_At
  | OutcomeConnectionCreated_By
  | OutcomeConnectionUpdated_By
  | CreateOutcomePayload
  | UpdateOutcomePayload
  | DeleteOutcomePayload
  | Panelist
  | PanelistConnection
  | PanelistAggregator
  | PanelistGroupBy
  | PanelistConnectionId
  | PanelistConnectionCreated_At
  | PanelistConnectionUpdated_At
  | PanelistConnectionFirstName
  | PanelistConnectionLastName
  | PanelistConnectionProfile_Image
  | PanelistConnectionJobTitle
  | PanelistConnectionCompany
  | PanelistConnectionPublished_At
  | PanelistConnectionCreated_By
  | PanelistConnectionUpdated_By
  | CreatePanelistPayload
  | UpdatePanelistPayload
  | DeletePanelistPayload
  | Partners
  | UpdatePartnerPayload
  | DeletePartnerPayload
  | PressAndNews
  | UpdatePressAndNewPayload
  | DeletePressAndNewPayload
  | Pricing
  | UpdatePricingPayload
  | DeletePricingPayload
  | Privacy
  | UpdatePrivacyPayload
  | DeletePrivacyPayload
  | ProductCd
  | UpdateProductCdPayload
  | DeleteProductCdPayload
  | ProductChangeIntelligence
  | UpdateProductChangeIntelligencePayload
  | DeleteProductChangeIntelligencePayload
  | ProductCi
  | UpdateProductCiPayload
  | DeleteProductCiPayload
  | ProductCloudCost
  | UpdateProductCloudCostPayload
  | DeleteProductCloudCostPayload
  | ProductFeatureFlags
  | UpdateProductFeatureFlagPayload
  | DeleteProductFeatureFlagPayload
  | ProductPlatform
  | UpdateProductPlatformPayload
  | DeleteProductPlatformPayload
  | Video
  | VideoConnection
  | VideoAggregator
  | VideoAggregatorSum
  | VideoAggregatorAvg
  | VideoAggregatorMin
  | VideoAggregatorMax
  | VideoGroupBy
  | VideoConnectionId
  | VideoConnectionCreated_At
  | VideoConnectionUpdated_At
  | VideoConnectionTitle
  | VideoConnectionSlug
  | VideoConnectionVideoType
  | VideoConnectionPreview_Image
  | VideoConnectionContent
  | VideoConnectionMkto_Form_Id
  | VideoConnectionPublished
  | VideoConnectionDuration
  | VideoConnectionRegistration
  | VideoConnectionPublished_At
  | VideoConnectionCreated_By
  | VideoConnectionUpdated_By
  | CreateVideoPayload
  | UpdateVideoPayload
  | DeleteVideoPayload
  | Webinars
  | WebinarsConnection
  | WebinarsAggregator
  | WebinarsAggregatorSum
  | WebinarsAggregatorAvg
  | WebinarsAggregatorMin
  | WebinarsAggregatorMax
  | WebinarsGroupBy
  | WebinarsConnectionId
  | WebinarsConnectionCreated_At
  | WebinarsConnectionUpdated_At
  | WebinarsConnectionTitle
  | WebinarsConnectionSlug
  | WebinarsConnectionEventType
  | WebinarsConnectionEventDateTime
  | WebinarsConnectionContent
  | WebinarsConnectionPreview_Image
  | WebinarsConnectionMkto_Form_Id
  | WebinarsConnectionPublished
  | WebinarsConnectionPublished_At
  | WebinarsConnectionCreated_By
  | WebinarsConnectionUpdated_By
  | CreateWebinarPayload
  | UpdateWebinarPayload
  | DeleteWebinarPayload
  | WebsiteTermsOfUse
  | UpdateWebsiteTermsOfUsePayload
  | DeleteWebsiteTermsOfUsePayload
  | UploadFile
  | UploadFileConnection
  | UploadFileAggregator
  | UploadFileAggregatorSum
  | UploadFileAggregatorAvg
  | UploadFileAggregatorMin
  | UploadFileAggregatorMax
  | UploadFileGroupBy
  | UploadFileConnectionId
  | UploadFileConnectionCreated_At
  | UploadFileConnectionUpdated_At
  | UploadFileConnectionName
  | UploadFileConnectionAlternativeText
  | UploadFileConnectionCaption
  | UploadFileConnectionWidth
  | UploadFileConnectionHeight
  | UploadFileConnectionFormats
  | UploadFileConnectionHash
  | UploadFileConnectionExt
  | UploadFileConnectionMime
  | UploadFileConnectionSize
  | UploadFileConnectionUrl
  | UploadFileConnectionPreviewUrl
  | UploadFileConnectionProvider
  | UploadFileConnectionProvider_Metadata
  | UploadFileConnectionCreated_By
  | UploadFileConnectionUpdated_By
  | DeleteFilePayload
  | UsersPermissionsPermission
  | UsersPermissionsRole
  | UsersPermissionsRoleConnection
  | UsersPermissionsRoleAggregator
  | UsersPermissionsRoleGroupBy
  | UsersPermissionsRoleConnectionId
  | UsersPermissionsRoleConnectionName
  | UsersPermissionsRoleConnectionDescription
  | UsersPermissionsRoleConnectionType
  | UsersPermissionsRoleConnectionCreated_By
  | UsersPermissionsRoleConnectionUpdated_By
  | CreateRolePayload
  | UpdateRolePayload
  | DeleteRolePayload
  | UsersPermissionsUser
  | UsersPermissionsUserConnection
  | UsersPermissionsUserAggregator
  | UsersPermissionsUserGroupBy
  | UsersPermissionsUserConnectionId
  | UsersPermissionsUserConnectionCreated_At
  | UsersPermissionsUserConnectionUpdated_At
  | UsersPermissionsUserConnectionUsername
  | UsersPermissionsUserConnectionEmail
  | UsersPermissionsUserConnectionProvider
  | UsersPermissionsUserConnectionPassword
  | UsersPermissionsUserConnectionResetPasswordToken
  | UsersPermissionsUserConnectionConfirmationToken
  | UsersPermissionsUserConnectionConfirmed
  | UsersPermissionsUserConnectionBlocked
  | UsersPermissionsUserConnectionRole
  | UsersPermissionsUserConnectionCompany
  | UsersPermissionsUserConnectionOccupation
  | UsersPermissionsUserConnectionInterest
  | UsersPermissionsUserConnectionCreated_By
  | UsersPermissionsUserConnectionUpdated_By
  | CreateUserPayload
  | UpdateUserPayload
  | DeleteUserPayload
  | ComponentCompanyPageAdressZone
  | ComponentCompanyPageOfficesZone
  | ComponentCompetitorComparisonPageComparisonCaseStudy
  | ComponentCompetitorComparisonPageDetailedFeatureComparison
  | ComponentCompetitorComparisonPageFeatureComparison
  | ComponentCompetitorComparisonPageProductDetailedFeature
  | ComponentCompetitorComparisonPageProductFeature
  | ComponentCompetitorComparisonPageProductSummaryZone
  | ComponentPageCaseListZone
  | ComponentPageCaseStudyZone
  | ComponentPageCustomerLogoZone
  | ComponentPageExecutiveZone
  | ComponentPageFeatureLIstZone
  | ComponentPageHarnessModule
  | ComponentPageImagePlus
  | ComponentPageImageZone
  | ComponentPageMiniTitleZone
  | ComponentPageModules
  | ComponentPageMultiImgListZone
  | ComponentPageMultiImgZone
  | ComponentPageNewsZone
  | ComponentPageOptionZone
  | ComponentPageProductIntroLogoZone
  | ComponentPageProductTitleZone
  | ComponentPageQuoteZone
  | ComponentPageRichTextZone
  | ComponentPageScreenshotZone
  | ComponentPageSectionOptions
  | ComponentPageSectionSecurity
  | ComponentPageSimpleTitleZone
  | ComponentPageSimpleZone
  | ComponentPageTeamZone
  | ComponentPageTextImageZone
  | ComponentPageTextZone
  | ComponentPageTitleImgZone
  | ComponentPageTitleZone
  | ComponentPageWorkflowCard
  | ComponentPageWorkflow
  | ComponentPricingPageCallOut
  | ComponentPricingPageDetailedFeature
  | ComponentPricingPageFaq
  | ComponentPricingPageFeatureCaption
  | ComponentPricingPageFeatureGroup
  | ComponentPricingPageMorePlansZone
  | ComponentPricingPagePlansZone
  | ComponentPricingPageTooltipsZone
  | ComponentProductPageIntegrationZone
  | ComponentProductPageIntegrationsZone

export type InputId = {
  id: Scalars['ID']
}

export enum PublicationState {
  Live = 'LIVE',
  Preview = 'PREVIEW'
}

export type AdminUser = {
  __typename?: 'AdminUser'
  id: Scalars['ID']
  username: Maybe<Scalars['String']>
  firstname: Scalars['String']
  lastname: Scalars['String']
}

export type Query = {
  __typename?: 'Query'
  aboutUs: Maybe<AboutUs>
  backgroundColor: Maybe<BackgroundColor>
  backgroundColors: Maybe<Array<Maybe<BackgroundColor>>>
  backgroundColorsConnection: Maybe<BackgroundColorConnection>
  career: Maybe<Careers>
  caseStudy: Maybe<CaseStudy>
  caseStudies: Maybe<Array<Maybe<CaseStudy>>>
  caseStudiesConnection: Maybe<CaseStudyConnection>
  companySize: Maybe<CompanySize>
  companySizes: Maybe<Array<Maybe<CompanySize>>>
  companySizesConnection: Maybe<CompanySizeConnection>
  competitorComparison: Maybe<CompetitorComparison>
  competitorComparisons: Maybe<Array<Maybe<CompetitorComparison>>>
  competitorComparisonsConnection: Maybe<CompetitorComparisonConnection>
  contactSale: Maybe<ContactSale>
  contactSales: Maybe<Array<Maybe<ContactSale>>>
  contactSalesConnection: Maybe<ContactSaleConnection>
  contactUs: Maybe<ContactUs>
  contactuses: Maybe<Array<Maybe<ContactUs>>>
  contactusesConnection: Maybe<ContactUsConnection>
  customer: Maybe<Customer>
  devOpsTool: Maybe<DevOpsTools>
  eBook: Maybe<EBook>
  eBooks: Maybe<Array<Maybe<EBook>>>
  eBooksConnection: Maybe<EBookConnection>
  event: Maybe<Event>
  events: Maybe<Array<Maybe<Event>>>
  eventsConnection: Maybe<EventConnection>
  harnessModule: Maybe<HarnessModule>
  harnessModules: Maybe<Array<Maybe<HarnessModule>>>
  harnessModulesConnection: Maybe<HarnessModuleConnection>
  harnessSubscription: Maybe<HarnessSubscription>
  home: Maybe<Home>
  industry: Maybe<Industry>
  industries: Maybe<Array<Maybe<Industry>>>
  industriesConnection: Maybe<IndustryConnection>
  integration: Maybe<Integration>
  integrations: Maybe<Array<Maybe<Integration>>>
  integrationsConnection: Maybe<IntegrationConnection>
  marketingSite: Maybe<MarketingSite>
  marketingSites: Maybe<Array<Maybe<MarketingSite>>>
  marketingSitesConnection: Maybe<MarketingSiteConnection>
  outcome: Maybe<Outcome>
  outcomes: Maybe<Array<Maybe<Outcome>>>
  outcomesConnection: Maybe<OutcomeConnection>
  panelist: Maybe<Panelist>
  panelists: Maybe<Array<Maybe<Panelist>>>
  panelistsConnection: Maybe<PanelistConnection>
  partner: Maybe<Partners>
  pressAndNew: Maybe<PressAndNews>
  pricing: Maybe<Pricing>
  privacy: Maybe<Privacy>
  productCd: Maybe<ProductCd>
  productChangeIntelligence: Maybe<ProductChangeIntelligence>
  productCi: Maybe<ProductCi>
  productCloudCost: Maybe<ProductCloudCost>
  productFeatureFlag: Maybe<ProductFeatureFlags>
  productPlatform: Maybe<ProductPlatform>
  video: Maybe<Video>
  videos: Maybe<Array<Maybe<Video>>>
  videosConnection: Maybe<VideoConnection>
  webinar: Maybe<Webinars>
  webinars: Maybe<Array<Maybe<Webinars>>>
  webinarsConnection: Maybe<WebinarsConnection>
  websiteTermsOfUse: Maybe<WebsiteTermsOfUse>
  files: Maybe<Array<Maybe<UploadFile>>>
  filesConnection: Maybe<UploadFileConnection>
  role: Maybe<UsersPermissionsRole>
  /** Retrieve all the existing roles. You can't apply filters on this query. */
  roles: Maybe<Array<Maybe<UsersPermissionsRole>>>
  rolesConnection: Maybe<UsersPermissionsRoleConnection>
  user: Maybe<UsersPermissionsUser>
  users: Maybe<Array<Maybe<UsersPermissionsUser>>>
  usersConnection: Maybe<UsersPermissionsUserConnection>
  me: Maybe<UsersPermissionsMe>
}

export type QueryAboutUsArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryBackgroundColorArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryBackgroundColorsArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryBackgroundColorsConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryCareerArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryCaseStudyArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryCaseStudiesArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryCaseStudiesConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryCompanySizeArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryCompanySizesArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryCompanySizesConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryCompetitorComparisonArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryCompetitorComparisonsArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryCompetitorComparisonsConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryContactSaleArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryContactSalesArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryContactSalesConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryContactUsArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryContactusesArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryContactusesConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryCustomerArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryDevOpsToolArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryEBookArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryEBooksArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryEBooksConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryEventArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryEventsArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryEventsConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryHarnessModuleArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryHarnessModulesArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryHarnessModulesConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryHarnessSubscriptionArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryHomeArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryIndustryArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryIndustriesArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryIndustriesConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryIntegrationArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryIntegrationsArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryIntegrationsConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryMarketingSiteArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryMarketingSitesArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryMarketingSitesConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryOutcomeArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryOutcomesArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryOutcomesConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryPanelistArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryPanelistsArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryPanelistsConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryPartnerArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryPressAndNewArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryPricingArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryPrivacyArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryProductCdArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryProductChangeIntelligenceArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryProductCiArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryProductCloudCostArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryProductFeatureFlagArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryProductPlatformArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryVideoArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryVideosArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryVideosConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryWebinarArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryWebinarsArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryWebinarsConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryWebsiteTermsOfUseArgs = {
  publicationState: Maybe<PublicationState>
}

export type QueryFilesArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryFilesConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryRoleArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryRolesArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryRolesConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type QueryUserArgs = {
  id: Scalars['ID']
  publicationState: Maybe<PublicationState>
}

export type QueryUsersArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
  publicationState: Maybe<PublicationState>
}

export type QueryUsersConnectionArgs = {
  sort: Maybe<Scalars['String']>
  limit: Maybe<Scalars['Int']>
  start: Maybe<Scalars['Int']>
  where: Maybe<Scalars['JSON']>
}

export type Mutation = {
  __typename?: 'Mutation'
  updateAboutUs: Maybe<UpdateAboutUsPayload>
  deleteAboutUs: Maybe<DeleteAboutUsPayload>
  createBackgroundColor: Maybe<CreateBackgroundColorPayload>
  updateBackgroundColor: Maybe<UpdateBackgroundColorPayload>
  deleteBackgroundColor: Maybe<DeleteBackgroundColorPayload>
  updateCareer: Maybe<UpdateCareerPayload>
  deleteCareer: Maybe<DeleteCareerPayload>
  createCaseStudy: Maybe<CreateCaseStudyPayload>
  updateCaseStudy: Maybe<UpdateCaseStudyPayload>
  deleteCaseStudy: Maybe<DeleteCaseStudyPayload>
  createCompanySize: Maybe<CreateCompanySizePayload>
  updateCompanySize: Maybe<UpdateCompanySizePayload>
  deleteCompanySize: Maybe<DeleteCompanySizePayload>
  createCompetitorComparison: Maybe<CreateCompetitorComparisonPayload>
  updateCompetitorComparison: Maybe<UpdateCompetitorComparisonPayload>
  deleteCompetitorComparison: Maybe<DeleteCompetitorComparisonPayload>
  createContactSale: Maybe<CreateContactSalePayload>
  updateContactSale: Maybe<UpdateContactSalePayload>
  deleteContactSale: Maybe<DeleteContactSalePayload>
  createContactUs: Maybe<CreateContactUsPayload>
  updateContactUs: Maybe<UpdateContactUsPayload>
  deleteContactUs: Maybe<DeleteContactUsPayload>
  updateCustomer: Maybe<UpdateCustomerPayload>
  deleteCustomer: Maybe<DeleteCustomerPayload>
  updateDevOpsTool: Maybe<UpdateDevOpsToolPayload>
  deleteDevOpsTool: Maybe<DeleteDevOpsToolPayload>
  createEBook: Maybe<CreateEBookPayload>
  updateEBook: Maybe<UpdateEBookPayload>
  deleteEBook: Maybe<DeleteEBookPayload>
  createEvent: Maybe<CreateEventPayload>
  updateEvent: Maybe<UpdateEventPayload>
  deleteEvent: Maybe<DeleteEventPayload>
  createHarnessModule: Maybe<CreateHarnessModulePayload>
  updateHarnessModule: Maybe<UpdateHarnessModulePayload>
  deleteHarnessModule: Maybe<DeleteHarnessModulePayload>
  updateHarnessSubscription: Maybe<UpdateHarnessSubscriptionPayload>
  deleteHarnessSubscription: Maybe<DeleteHarnessSubscriptionPayload>
  updateHome: Maybe<UpdateHomePayload>
  deleteHome: Maybe<DeleteHomePayload>
  createIndustry: Maybe<CreateIndustryPayload>
  updateIndustry: Maybe<UpdateIndustryPayload>
  deleteIndustry: Maybe<DeleteIndustryPayload>
  createIntegration: Maybe<CreateIntegrationPayload>
  updateIntegration: Maybe<UpdateIntegrationPayload>
  deleteIntegration: Maybe<DeleteIntegrationPayload>
  createMarketingSite: Maybe<CreateMarketingSitePayload>
  updateMarketingSite: Maybe<UpdateMarketingSitePayload>
  deleteMarketingSite: Maybe<DeleteMarketingSitePayload>
  createOutcome: Maybe<CreateOutcomePayload>
  updateOutcome: Maybe<UpdateOutcomePayload>
  deleteOutcome: Maybe<DeleteOutcomePayload>
  createPanelist: Maybe<CreatePanelistPayload>
  updatePanelist: Maybe<UpdatePanelistPayload>
  deletePanelist: Maybe<DeletePanelistPayload>
  updatePartner: Maybe<UpdatePartnerPayload>
  deletePartner: Maybe<DeletePartnerPayload>
  updatePressAndNew: Maybe<UpdatePressAndNewPayload>
  deletePressAndNew: Maybe<DeletePressAndNewPayload>
  updatePricing: Maybe<UpdatePricingPayload>
  deletePricing: Maybe<DeletePricingPayload>
  updatePrivacy: Maybe<UpdatePrivacyPayload>
  deletePrivacy: Maybe<DeletePrivacyPayload>
  updateProductCd: Maybe<UpdateProductCdPayload>
  deleteProductCd: Maybe<DeleteProductCdPayload>
  updateProductChangeIntelligence: Maybe<UpdateProductChangeIntelligencePayload>
  deleteProductChangeIntelligence: Maybe<DeleteProductChangeIntelligencePayload>
  updateProductCi: Maybe<UpdateProductCiPayload>
  deleteProductCi: Maybe<DeleteProductCiPayload>
  updateProductCloudCost: Maybe<UpdateProductCloudCostPayload>
  deleteProductCloudCost: Maybe<DeleteProductCloudCostPayload>
  updateProductFeatureFlag: Maybe<UpdateProductFeatureFlagPayload>
  deleteProductFeatureFlag: Maybe<DeleteProductFeatureFlagPayload>
  updateProductPlatform: Maybe<UpdateProductPlatformPayload>
  deleteProductPlatform: Maybe<DeleteProductPlatformPayload>
  createVideo: Maybe<CreateVideoPayload>
  updateVideo: Maybe<UpdateVideoPayload>
  deleteVideo: Maybe<DeleteVideoPayload>
  createWebinar: Maybe<CreateWebinarPayload>
  updateWebinar: Maybe<UpdateWebinarPayload>
  deleteWebinar: Maybe<DeleteWebinarPayload>
  updateWebsiteTermsOfUse: Maybe<UpdateWebsiteTermsOfUsePayload>
  deleteWebsiteTermsOfUse: Maybe<DeleteWebsiteTermsOfUsePayload>
  /** Delete one file */
  deleteFile: Maybe<DeleteFilePayload>
  /** Create a new role */
  createRole: Maybe<CreateRolePayload>
  /** Update an existing role */
  updateRole: Maybe<UpdateRolePayload>
  /** Delete an existing role */
  deleteRole: Maybe<DeleteRolePayload>
  /** Create a new user */
  createUser: Maybe<CreateUserPayload>
  /** Update an existing user */
  updateUser: Maybe<UpdateUserPayload>
  /** Delete an existing user */
  deleteUser: Maybe<DeleteUserPayload>
  upload: UploadFile
  multipleUpload: Array<Maybe<UploadFile>>
  updateFileInfo: UploadFile
  login: UsersPermissionsLoginPayload
  register: UsersPermissionsLoginPayload
  forgotPassword: Maybe<UserPermissionsPasswordPayload>
  resetPassword: Maybe<UsersPermissionsLoginPayload>
  emailConfirmation: Maybe<UsersPermissionsLoginPayload>
}

export type MutationUpdateAboutUsArgs = {
  input: Maybe<UpdateAboutUsInput>
}

export type MutationCreateBackgroundColorArgs = {
  input: Maybe<CreateBackgroundColorInput>
}

export type MutationUpdateBackgroundColorArgs = {
  input: Maybe<UpdateBackgroundColorInput>
}

export type MutationDeleteBackgroundColorArgs = {
  input: Maybe<DeleteBackgroundColorInput>
}

export type MutationUpdateCareerArgs = {
  input: Maybe<UpdateCareerInput>
}

export type MutationCreateCaseStudyArgs = {
  input: Maybe<CreateCaseStudyInput>
}

export type MutationUpdateCaseStudyArgs = {
  input: Maybe<UpdateCaseStudyInput>
}

export type MutationDeleteCaseStudyArgs = {
  input: Maybe<DeleteCaseStudyInput>
}

export type MutationCreateCompanySizeArgs = {
  input: Maybe<CreateCompanySizeInput>
}

export type MutationUpdateCompanySizeArgs = {
  input: Maybe<UpdateCompanySizeInput>
}

export type MutationDeleteCompanySizeArgs = {
  input: Maybe<DeleteCompanySizeInput>
}

export type MutationCreateCompetitorComparisonArgs = {
  input: Maybe<CreateCompetitorComparisonInput>
}

export type MutationUpdateCompetitorComparisonArgs = {
  input: Maybe<UpdateCompetitorComparisonInput>
}

export type MutationDeleteCompetitorComparisonArgs = {
  input: Maybe<DeleteCompetitorComparisonInput>
}

export type MutationCreateContactSaleArgs = {
  input: Maybe<CreateContactSaleInput>
}

export type MutationUpdateContactSaleArgs = {
  input: Maybe<UpdateContactSaleInput>
}

export type MutationDeleteContactSaleArgs = {
  input: Maybe<DeleteContactSaleInput>
}

export type MutationCreateContactUsArgs = {
  input: Maybe<CreateContactUsInput>
}

export type MutationUpdateContactUsArgs = {
  input: Maybe<UpdateContactUsInput>
}

export type MutationDeleteContactUsArgs = {
  input: Maybe<DeleteContactUsInput>
}

export type MutationUpdateCustomerArgs = {
  input: Maybe<UpdateCustomerInput>
}

export type MutationUpdateDevOpsToolArgs = {
  input: Maybe<UpdateDevOpsToolInput>
}

export type MutationCreateEBookArgs = {
  input: Maybe<CreateEBookInput>
}

export type MutationUpdateEBookArgs = {
  input: Maybe<UpdateEBookInput>
}

export type MutationDeleteEBookArgs = {
  input: Maybe<DeleteEBookInput>
}

export type MutationCreateEventArgs = {
  input: Maybe<CreateEventInput>
}

export type MutationUpdateEventArgs = {
  input: Maybe<UpdateEventInput>
}

export type MutationDeleteEventArgs = {
  input: Maybe<DeleteEventInput>
}

export type MutationCreateHarnessModuleArgs = {
  input: Maybe<CreateHarnessModuleInput>
}

export type MutationUpdateHarnessModuleArgs = {
  input: Maybe<UpdateHarnessModuleInput>
}

export type MutationDeleteHarnessModuleArgs = {
  input: Maybe<DeleteHarnessModuleInput>
}

export type MutationUpdateHarnessSubscriptionArgs = {
  input: Maybe<UpdateHarnessSubscriptionInput>
}

export type MutationUpdateHomeArgs = {
  input: Maybe<UpdateHomeInput>
}

export type MutationCreateIndustryArgs = {
  input: Maybe<CreateIndustryInput>
}

export type MutationUpdateIndustryArgs = {
  input: Maybe<UpdateIndustryInput>
}

export type MutationDeleteIndustryArgs = {
  input: Maybe<DeleteIndustryInput>
}

export type MutationCreateIntegrationArgs = {
  input: Maybe<CreateIntegrationInput>
}

export type MutationUpdateIntegrationArgs = {
  input: Maybe<UpdateIntegrationInput>
}

export type MutationDeleteIntegrationArgs = {
  input: Maybe<DeleteIntegrationInput>
}

export type MutationCreateMarketingSiteArgs = {
  input: Maybe<CreateMarketingSiteInput>
}

export type MutationUpdateMarketingSiteArgs = {
  input: Maybe<UpdateMarketingSiteInput>
}

export type MutationDeleteMarketingSiteArgs = {
  input: Maybe<DeleteMarketingSiteInput>
}

export type MutationCreateOutcomeArgs = {
  input: Maybe<CreateOutcomeInput>
}

export type MutationUpdateOutcomeArgs = {
  input: Maybe<UpdateOutcomeInput>
}

export type MutationDeleteOutcomeArgs = {
  input: Maybe<DeleteOutcomeInput>
}

export type MutationCreatePanelistArgs = {
  input: Maybe<CreatePanelistInput>
}

export type MutationUpdatePanelistArgs = {
  input: Maybe<UpdatePanelistInput>
}

export type MutationDeletePanelistArgs = {
  input: Maybe<DeletePanelistInput>
}

export type MutationUpdatePartnerArgs = {
  input: Maybe<UpdatePartnerInput>
}

export type MutationUpdatePressAndNewArgs = {
  input: Maybe<UpdatePressAndNewInput>
}

export type MutationUpdatePricingArgs = {
  input: Maybe<UpdatePricingInput>
}

export type MutationUpdatePrivacyArgs = {
  input: Maybe<UpdatePrivacyInput>
}

export type MutationUpdateProductCdArgs = {
  input: Maybe<UpdateProductCdInput>
}

export type MutationUpdateProductChangeIntelligenceArgs = {
  input: Maybe<UpdateProductChangeIntelligenceInput>
}

export type MutationUpdateProductCiArgs = {
  input: Maybe<UpdateProductCiInput>
}

export type MutationUpdateProductCloudCostArgs = {
  input: Maybe<UpdateProductCloudCostInput>
}

export type MutationUpdateProductFeatureFlagArgs = {
  input: Maybe<UpdateProductFeatureFlagInput>
}

export type MutationUpdateProductPlatformArgs = {
  input: Maybe<UpdateProductPlatformInput>
}

export type MutationCreateVideoArgs = {
  input: Maybe<CreateVideoInput>
}

export type MutationUpdateVideoArgs = {
  input: Maybe<UpdateVideoInput>
}

export type MutationDeleteVideoArgs = {
  input: Maybe<DeleteVideoInput>
}

export type MutationCreateWebinarArgs = {
  input: Maybe<CreateWebinarInput>
}

export type MutationUpdateWebinarArgs = {
  input: Maybe<UpdateWebinarInput>
}

export type MutationDeleteWebinarArgs = {
  input: Maybe<DeleteWebinarInput>
}

export type MutationUpdateWebsiteTermsOfUseArgs = {
  input: Maybe<UpdateWebsiteTermsOfUseInput>
}

export type MutationDeleteFileArgs = {
  input: Maybe<DeleteFileInput>
}

export type MutationCreateRoleArgs = {
  input: Maybe<CreateRoleInput>
}

export type MutationUpdateRoleArgs = {
  input: Maybe<UpdateRoleInput>
}

export type MutationDeleteRoleArgs = {
  input: Maybe<DeleteRoleInput>
}

export type MutationCreateUserArgs = {
  input: Maybe<CreateUserInput>
}

export type MutationUpdateUserArgs = {
  input: Maybe<UpdateUserInput>
}

export type MutationDeleteUserArgs = {
  input: Maybe<DeleteUserInput>
}

export type MutationUploadArgs = {
  refId: Maybe<Scalars['ID']>
  ref: Maybe<Scalars['String']>
  field: Maybe<Scalars['String']>
  source: Maybe<Scalars['String']>
  file: Scalars['Upload']
}

export type MutationMultipleUploadArgs = {
  refId: Maybe<Scalars['ID']>
  ref: Maybe<Scalars['String']>
  field: Maybe<Scalars['String']>
  source: Maybe<Scalars['String']>
  files: Array<Maybe<Scalars['Upload']>>
}

export type MutationUpdateFileInfoArgs = {
  id: Scalars['ID']
  info: FileInfoInput
}

export type MutationLoginArgs = {
  input: UsersPermissionsLoginInput
}

export type MutationRegisterArgs = {
  input: UsersPermissionsRegisterInput
}

export type MutationForgotPasswordArgs = {
  email: Scalars['String']
}

export type MutationResetPasswordArgs = {
  password: Scalars['String']
  passwordConfirmation: Scalars['String']
  code: Scalars['String']
}

export type MutationEmailConfirmationArgs = {
  confirmation: Scalars['String']
}
