/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import {
  FormInput,
  Layout,
  Button,
  ButtonVariation,
  Container,
  Formik,
  ModalErrorHandlerBinding,
  FormikForm as Form,
  useToaster,
  ModalErrorHandler,
  PageSpinner
} from '@wings-software/uicore'
import { useParams } from 'react-router-dom'
import { useGetOrganizationAggregateDTOList, useCopyUserGroup, useGetProjectAggregateDTOList } from 'services/cd-ng'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { generateScopeList } from '@rbac/utils/utils'
import type { ProjectSelectOption } from '@audit-trail/components/FilterDrawer/FilterDrawer'
import { getOrgDropdownList, getProjectDropdownList } from '@audit-trail/utils/RequestUtil'
import css from './CopyGroupForm.module.scss'

export interface CopyGroupFormType {
  organization: string | undefined
  projects: ProjectSelectOption[]
  copyToProjects: boolean
}

interface CopyGroupFormProps {
  closeModal: () => void
  identifier: string
}

const CopyGroupForm: React.FC<CopyGroupFormProps> = ({ closeModal, identifier }) => {
  const [projectsQuery, setProjectsQuery] = useState('')
  const { accountId } = useParams<ProjectPathProps>()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const { getString } = useStrings()

  const { data, loading: loadingOrgs } = useGetOrganizationAggregateDTOList({
    queryParams: {
      pageIndex: 0,
      accountIdentifier: accountId
    }
  })

  const { data: projectData, refetch: refetchProjectList } = useGetProjectAggregateDTOList({
    queryParams: {
      accountIdentifier: accountId,
      searchTerm: projectsQuery
    },
    lazy: true,
    queryParamStringifyOptions: {
      arrayFormat: 'repeat'
    },
    debounce: 300
  })

  const { mutate: copyUserGroup, loading } = useCopyUserGroup({
    queryParams: { accountIdentifier: accountId, groupIdentifier: identifier }
  })
  const { showSuccess } = useToaster()

  const orgList = data?.data?.content ? getOrgDropdownList(data?.data?.content || []) : []
  const projects = projectData?.data?.content
    ? getProjectDropdownList(projectData.data.content.map(project => project.projectResponse))
    : []

  const onSave = async (values: CopyGroupFormType): Promise<void> => {
    modalErrorHandler?.hide()
    const { organization: selectedOrg, projects: selectedProjects } = values
    const scopeList = selectedOrg ? generateScopeList(selectedOrg, selectedProjects, accountId) : []
    try {
      const response = await copyUserGroup(scopeList)
      if (response) {
        showSuccess(getString('rbac.copyGroup.success'))
      }
      closeModal()
    } catch (e) {
      modalErrorHandler?.showDanger(e.data?.message || e.message)
    }
  }

  return (
    <>
      {loadingOrgs ? <PageSpinner /> : undefined}
      <Formik<CopyGroupFormType>
        initialValues={{
          organization: undefined,
          projects: [],
          copyToProjects: false
        }}
        formName="copyGroupForm"
        onSubmit={values => {
          onSave(values)
        }}
      >
        {formik => {
          const selectedOrg = formik.values.organization

          return (
            <Form>
              <ModalErrorHandler bind={setModalErrorHandler} />
              <Container className={css.copyGroupForm}>
                <FormInput.Select
                  name="organization"
                  label={getString('orgLabel')}
                  items={orgList}
                  tooltipProps={{ dataTooltipId: 'copyGroupOrganization' }}
                  onChange={org => {
                    if (formik.values.copyToProjects) {
                      refetchProjectList({
                        queryParams: {
                          accountIdentifier: accountId,
                          orgIdentifier: org.value as string,
                          pageIndex: 0
                        }
                      })
                      formik.setFieldValue('projects', [])
                    }
                  }}
                />
                <Container margin={{ top: 'xlarge' }}>
                  <FormInput.CheckBox
                    name="copyToProjects"
                    label={getString('rbac.copyGroup.copyToProjects')}
                    tooltipProps={{ dataTooltipId: 'copyToProjects' }}
                    onChange={e => {
                      if (e.currentTarget.checked && formik.values.organization) {
                        refetchProjectList({
                          queryParams: {
                            accountIdentifier: accountId,
                            orgIdentifier: selectedOrg as string,
                            pageIndex: 0
                          }
                        })
                      } else {
                        formik.setFieldValue('projects', [])
                      }
                    }}
                  />
                </Container>
                <FormInput.MultiSelect
                  label={getString('projectsText')}
                  name="projects"
                  items={projects}
                  disabled={!(formik.values.copyToProjects && selectedOrg)}
                  multiSelectProps={{
                    allowCreatingNewItems: false,
                    onQueryChange: (query: string) => {
                      setProjectsQuery(query)
                    }
                  }}
                />
              </Container>
              <Layout.Horizontal spacing="small">
                <Button
                  disabled={!selectedOrg || loading}
                  type="submit"
                  variation={ButtonVariation.PRIMARY}
                  text={getString('save')}
                />
                <Button variation={ButtonVariation.TERTIARY} onClick={closeModal} text={getString('cancel')} />
              </Layout.Horizontal>
            </Form>
          )
        }}
      </Formik>
    </>
  )
}

export default CopyGroupForm
