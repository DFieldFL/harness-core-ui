import React from 'react'
import {
  Formik,
  FormikForm as Form,
  FormInput,
  Button,
  Text,
  Layout,
  StepProps,
  SelectOption,
  Container,
  Color,
  ModalErrorHandler,
  ModalErrorHandlerBinding,
  ButtonVariation,
  IconName
} from '@wings-software/uicore'
import * as Yup from 'yup'
import { DescriptionTags } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import type { Project } from 'services/cd-ng'
import ProjectCard from '@projects-orgs/components/ProjectCard/ProjectCard'
import { DEFAULT_COLOR } from '@common/constants/Utils'
import { useStrings } from 'framework/strings'
import ProjectsEmptyState from '@projects-orgs/pages/projects/projects-empty-state.png'
import { NameSchema, IdentifierSchema } from '@common/utils/Validation'
import css from './Steps.module.scss'

interface ProjectModalData {
  data?: Project
  disableSelect: boolean
  disableSubmit: boolean
  enableEdit: boolean
  title: string
  saveTitle: string
  saveIcon?: IconName
  initialOrgIdentifier: string
  initialModules?: Project['modules']
  onComplete: (project: Project) => Promise<void>
  organizationItems: SelectOption[]
  setModalErrorHandler: (modalErrorHandler: ModalErrorHandlerBinding) => void
  displayProjectCardPreview?: boolean
}

interface AboutPageData extends Project {
  preview?: boolean
}

const ProjectForm: React.FC<StepProps<Project> & ProjectModalData> = props => {
  const {
    data: projectData,
    title,
    saveTitle,
    saveIcon,
    enableEdit,
    onComplete,
    disableSelect,
    disableSubmit,
    organizationItems,
    initialOrgIdentifier,
    initialModules,
    setModalErrorHandler,
    displayProjectCardPreview = true
  } = props
  const { getString } = useStrings()

  return (
    <Formik
      initialValues={{
        color: DEFAULT_COLOR,
        identifier: '',
        name: '',
        orgIdentifier: initialOrgIdentifier,
        modules: initialModules,
        description: '',
        tags: {},
        ...projectData
      }}
      formName="projectsForm"
      enableReinitialize={true}
      validationSchema={Yup.object().shape({
        name: NameSchema(),
        identifier: IdentifierSchema(),
        orgIdentifier: Yup.string().required(getString('validation.orgValidation'))
      })}
      onSubmit={(values: AboutPageData) => {
        onComplete(values)
      }}
    >
      {formikProps => {
        return (
          <Form>
            <Layout.Horizontal>
              <Layout.Vertical width={displayProjectCardPreview ? '50%' : '100%'} padding="xxlarge">
                <Container style={{ minHeight: '450px' }}>
                  <Layout.Horizontal padding={{ bottom: 'large' }}>
                    <Text font="medium" color={Color.BLACK}>
                      {title}
                    </Text>
                  </Layout.Horizontal>
                  <ModalErrorHandler bind={setModalErrorHandler} />
                  <FormInput.InputWithIdentifier isIdentifierEditable={enableEdit} />
                  <Layout.Horizontal spacing="small" margin={{ bottom: 'xsmall' }}>
                    <FormInput.ColorPicker label={getString('color')} name="color" height={38} />
                    <FormInput.Select
                      label={getString('orgLabel')}
                      name="orgIdentifier"
                      items={organizationItems}
                      disabled={disableSelect}
                    />
                  </Layout.Horizontal>
                  <DescriptionTags formikProps={formikProps} />
                </Container>
                <Layout.Horizontal>
                  <Button
                    variation={ButtonVariation.PRIMARY}
                    text={saveTitle}
                    type="submit"
                    disabled={disableSubmit}
                    rightIcon={saveIcon}
                  />
                </Layout.Horizontal>
              </Layout.Vertical>
              {displayProjectCardPreview && (
                <Container width="50%" flex={{ align: 'center-center' }} className={css.preview}>
                  {Object.keys(formikProps.touched).length ? (
                    <ProjectCard data={{ projectResponse: { project: formikProps.values } }} isPreview={true} />
                  ) : (
                    <Layout.Vertical width="100%" padding="huge" flex={{ align: 'center-center' }}>
                      <img src={ProjectsEmptyState} className={css.img} />
                      <Layout.Vertical flex={{ alignItems: 'flex-start' }} spacing="medium">
                        <Text color={Color.GREY_800} font={{ weight: 'semi-bold' }}>
                          {getString('projectsOrgs.whyCreateProject')}
                        </Text>
                        <Text color={Color.GREY_800} font="small">
                          {getString('projectsOrgs.createProjectMessage')}
                        </Text>
                      </Layout.Vertical>
                    </Layout.Vertical>
                  )}
                </Container>
              )}
            </Layout.Horizontal>
          </Form>
        )
      }}
    </Formik>
  )
}

export default ProjectForm
