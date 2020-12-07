import React, { useState } from 'react'
import {
  Formik,
  FormikForm as Form,
  FormInput,
  Button,
  Text,
  Layout,
  StepProps,
  Container,
  Color,
  SelectOption,
  TextInput,
  MultiSelectOption,
  Icon,
  ModalErrorHandlerBinding,
  ModalErrorHandler,
  Avatar
} from '@wings-software/uikit'
import { Select } from '@blueprintjs/select'
import cx from 'classnames'
import * as Yup from 'yup'
import { Menu } from '@blueprintjs/core'
import { useParams } from 'react-router-dom'
import {
  Project,
  useGetUsers,
  useGetRoles,
  useGetInvites,
  CreateInviteListDTO,
  useSendInvite,
  InviteDTO,
  useDeleteInvite,
  useUpdateInvite,
  ResponsePageUserSearchDTO,
  ResponseOptionalListRoleDTO,
  ResponsePageInviteDTO,
  Organization
} from 'services/cd-ng'
import i18n from '@projects-orgs/pages/projects/ProjectsPage.i18n'
import type { UseGetMockData } from '@common/utils/testUtils'
import { useStrings } from 'framework/exports'
import { InviteType } from '../Constants'

import css from './Steps.module.scss'

interface CollaboratorModalData {
  projectIdentifier?: string
  orgIdentifier?: string
  showManage?: boolean
  userMockData?: UseGetMockData<ResponsePageUserSearchDTO>
  rolesMockData?: UseGetMockData<ResponseOptionalListRoleDTO>
  invitesMockData?: UseGetMockData<ResponsePageInviteDTO>
}
interface CollaboratorsData {
  collaborators: MultiSelectOption[]
}

interface InviteListProps {
  user: InviteDTO
  roles: SelectOption[]
  reload: () => void
  modalErrorHandler: ModalErrorHandlerBinding | undefined
}

const CustomSelect = Select.ofType<SelectOption>()

const defaultRole: SelectOption = {
  label: i18n.newProjectWizard.Collaborators.label,
  value: i18n.newProjectWizard.Collaborators.value
}

const InviteListRenderer: React.FC<InviteListProps> = props => {
  const { user, reload, roles, modalErrorHandler } = props
  const { accountId } = useParams()
  const [approved, setApproved] = useState<boolean>(false)
  const { mutate: deleteInvite } = useDeleteInvite({ queryParams: { accountIdentifier: accountId } })
  const [role, setRole] = useState<SelectOption>(defaultRole)
  const { mutate: updateInvite } = useUpdateInvite({ inviteId: '', queryParams: { accountIdentifier: accountId } })

  const handleUpdate = async (type: InviteType): Promise<void> => {
    const dataToSubmit: InviteDTO = {
      name: user.name,
      email: user.email,
      role: user.role,
      inviteType: type,
      approved: type === InviteType.USER_INITIATED ? true : false
    }
    try {
      const updated = await updateInvite(dataToSubmit, { pathParams: { inviteId: user.id || '' } })
      if (updated) reload()
      modalErrorHandler?.showSuccess(i18n.newProjectWizard.Collaborators.inviteSuccess)
    } catch (err) {
      modalErrorHandler?.show(err.data)
    }
  }

  const handleDelete = async (): Promise<void> => {
    try {
      const deleted = await deleteInvite(user.id || '')
      if (deleted) reload()
      modalErrorHandler?.showSuccess(i18n.newProjectWizard.Collaborators.deleteSuccess)
    } catch (err) {
      modalErrorHandler?.show(err.data)
    }
  }
  return (
    <Container className={css.invites} padding={{ left: 'xsmall', top: 'medium', bottom: 'medium' }}>
      {user?.inviteType == InviteType.ADMIN_INITIATED ? (
        <Layout.Horizontal>
          <Layout.Horizontal spacing="medium" className={cx(css.align, css.pendingUser)} width="60%">
            <Icon name="main-user" size={30} />
            <Layout.Vertical padding={{ left: 'small' }}>
              <Layout.Horizontal spacing="small">
                <Text font={{ weight: 'bold' }} color={Color.BLACK} className={css.name} lineClamp={1}>
                  {user.name}
                </Text>
                <Text
                  font={{ size: 'xsmall', weight: 'bold' }}
                  className={cx(css.colorBar, css.pending)}
                  color={Color.BLUE_500}
                >
                  {i18n.newProjectWizard.Collaborators.pendingInvitation}
                </Text>
              </Layout.Horizontal>
              <Text className={css.email} lineClamp={1}>
                {user.email}
              </Text>
              <Layout.Horizontal>
                <Text font={{ size: 'xsmall', weight: 'bold' }} color={Color.BLACK}>
                  {i18n.newProjectWizard.Collaborators.roleAssigned}
                </Text>
                <Text
                  font="xsmall"
                  color={Color.BLUE_600}
                  padding={{ left: 'xsmall' }}
                  className={css.role}
                  lineClamp={1}
                >
                  {user.role.name}
                </Text>
              </Layout.Horizontal>
            </Layout.Vertical>
          </Layout.Horizontal>
          <Layout.Horizontal width="40%" padding={{ right: 'medium' }} className={cx(css.align, css.toEnd)}>
            <Button
              inline
              minimal
              icon="refresh"
              onClick={() => {
                handleUpdate(InviteType.ADMIN_INITIATED)
              }}
            />
            <Button inline minimal icon="remove" iconProps={{ size: 20 }} onClick={handleDelete} />
          </Layout.Horizontal>
        </Layout.Horizontal>
      ) : (
        <Layout.Horizontal>
          <Layout.Horizontal spacing="medium" className={css.align} width="60%">
            <Icon name="main-user" size={30} />
            <Layout.Vertical padding={{ left: 'small' }}>
              <Layout.Horizontal spacing="small">
                <Text font={{ weight: 'bold' }} color={Color.BLACK} className={css.name} lineClamp={1}>
                  {user.name}
                </Text>
                <Text
                  font={{ size: 'xsmall', weight: 'bold' }}
                  className={cx(css.colorBar, css.request)}
                  color={Color.YELLOW_500}
                >
                  {i18n.newProjectWizard.Collaborators.requestAccess}
                </Text>
              </Layout.Horizontal>
              <Text className={css.email} lineClamp={1}>
                {user.email}
              </Text>
              <Text font={{ size: 'xsmall', weight: 'bold' }} color={Color.BLACK}>
                {i18n.newProjectWizard.Collaborators.noRole}
              </Text>
            </Layout.Vertical>
          </Layout.Horizontal>
          <Layout.Horizontal width="40%" padding={{ right: 'medium' }} className={cx(css.align, css.toEnd)}>
            {!approved ? (
              <Button
                inline
                minimal
                icon="command-approval"
                onClick={() => {
                  setApproved(true)
                }}
              />
            ) : (
              <Layout.Horizontal>
                <CustomSelect
                  items={roles}
                  filterable={false}
                  itemRenderer={(item, { handleClick }) => (
                    <div>
                      <Menu.Item
                        text={item.label}
                        onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => handleClick(e)}
                      />
                    </div>
                  )}
                  onItemSelect={item => {
                    setRole(item)
                  }}
                  popoverProps={{ minimal: true }}
                >
                  <Button inline minimal rightIcon="chevron-down" text={role.label} />
                </CustomSelect>
                <Button
                  inline
                  minimal
                  icon="command-approval"
                  disabled={role === defaultRole}
                  onClick={() => {
                    handleUpdate(InviteType.USER_INITIATED)
                  }}
                />
              </Layout.Horizontal>
            )}
            <Button inline minimal icon="remove" onClick={handleDelete} />
          </Layout.Horizontal>
        </Layout.Horizontal>
      )}
    </Container>
  )
}

const Collaborators: React.FC<CollaboratorModalData> = props => {
  const { rolesMockData, userMockData, invitesMockData, projectIdentifier, orgIdentifier, showManage = true } = props
  const [role, setRole] = useState<SelectOption>(defaultRole)
  const [search, setSearch] = useState<string>()
  const { accountId } = useParams()
  const [modalErrorHandler, setModalErrorHandler] = useState<ModalErrorHandlerBinding>()
  const initialValues: CollaboratorsData = { collaborators: [] }
  const { getString } = useStrings()
  const { data: userData } = useGetUsers({
    queryParams: { accountIdentifier: accountId, searchString: search === '' ? undefined : search },
    mock: userMockData,
    debounce: 300
  })

  const { data: inviteData, loading: inviteLoading, refetch: reloadInvites } = useGetInvites({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier || '',
      projectIdentifier: projectIdentifier || ''
    },
    mock: invitesMockData
  })

  const { mutate: sendInvite, loading } = useSendInvite({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier || '',
      projectIdentifier: projectIdentifier || ''
    }
  })

  const { data: roleData } = useGetRoles({
    queryParams: {
      accountIdentifier: accountId,
      orgIdentifier: orgIdentifier || '',
      projectIdentifier: projectIdentifier || ''
    },
    mock: rolesMockData
  })

  const users: SelectOption[] =
    userData?.data?.content?.map(user => {
      return {
        label: user.name || '',
        value: user.email || ''
      }
    }) || []

  const roles: SelectOption[] =
    roleData?.data?.map(roleOption => {
      return {
        label: roleOption.name || '',
        value: roleOption.name || ''
      }
    }) || []

  const getIndex = (value: string): number => {
    return Number(value.charAt(value.indexOf('[') + 1))
  }

  const SendInvitation = async (values: MultiSelectOption[]): Promise<void> => {
    const usersToSubmit = values?.map(collaborator => {
      return collaborator.value
    })

    const dataToSubmit: CreateInviteListDTO = {
      users: usersToSubmit as string[],
      role: {
        name: role.label
      },
      inviteType: InviteType.ADMIN_INITIATED
    }

    try {
      await sendInvite(dataToSubmit)
      reloadInvites()
    } catch (e) {
      modalErrorHandler?.show(e.data)
    }
  }

  return (
    <Formik<CollaboratorsData>
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        collaborators: Yup.array().of(
          Yup.object().shape({
            value: Yup.string().email().required('Required')
          })
        )
      })}
      onSubmit={(values, { resetForm }) => {
        modalErrorHandler?.hide()
        SendInvitation(values.collaborators)
        setRole(defaultRole)
        resetForm({ collaborators: [] })
      }}
      enableReinitialize={true}
    >
      {formik => {
        return (
          <Form>
            <ModalErrorHandler bind={setModalErrorHandler} />

            <Container className={css.collaboratorForm}>
              <Text font="medium" color={Color.BLACK} padding={{ bottom: 'xxlarge' }}>
                {i18n.newProjectWizard.Collaborators.name.toUpperCase()}
              </Text>
              <Text padding={{ bottom: 'small' }}>{i18n.newProjectWizard.Collaborators.urlMessage}</Text>
              <Layout.Horizontal>
                <TextInput
                  placeholder={i18n.newProjectWizard.Collaborators.url}
                  disabled
                  rightElement={(<Button icon="duplicate" inline minimal className={css.clone} />) as any}
                  className={css.url}
                />
              </Layout.Horizontal>
              <Layout.Horizontal padding={{ top: 'medium' }} spacing="xlarge" className={cx(css.align, css.input)}>
                <Layout.Horizontal width="50%">
                  <Text>{i18n.newProjectWizard.Collaborators.inviteCollab}</Text>
                </Layout.Horizontal>
                <Layout.Horizontal width="50%" spacing="xsmall" flex={{ align: 'center-center' }} className={css.toEnd}>
                  <Text>{getString('collaborators.roleLabel')}</Text>
                  <CustomSelect
                    items={roles}
                    filterable={false}
                    itemRenderer={(item, { handleClick }) => (
                      <div>
                        <Menu.Item
                          text={item.label}
                          key={item.label}
                          onClick={(e: React.MouseEvent<HTMLElement, MouseEvent>) => handleClick(e)}
                        />
                      </div>
                    )}
                    onItemSelect={item => {
                      setRole(item)
                    }}
                    popoverProps={{ minimal: true, popoverClassName: css.customselect }}
                  >
                    <Button inline minimal rightIcon="chevron-down" text={role.label} className={css.toEnd} />
                  </CustomSelect>
                </Layout.Horizontal>
              </Layout.Horizontal>
              <Layout.Horizontal spacing="small">
                <FormInput.MultiSelect
                  name={i18n.newProjectWizard.Collaborators.collaborator}
                  items={users}
                  multiSelectProps={{
                    allowCreatingNewItems: true,
                    onQueryChange: (query: string) => {
                      setSearch(query)
                    },
                    // eslint-disable-next-line react/display-name
                    tagRenderer: item => (
                      <Layout.Horizontal key={item.label.toString()} spacing="small">
                        <Avatar email={item.value.toString()} size="xsmall" />
                        <Text>{item.label}</Text>
                      </Layout.Horizontal>
                    ),
                    // eslint-disable-next-line react/display-name
                    itemRender: (item, { handleClick }) => (
                      <div>
                        <Menu.Item
                          text={
                            <Layout.Horizontal spacing="small">
                              <Avatar email={item.value.toString()} size="normal" />
                              <Text>{item.label}</Text>
                            </Layout.Horizontal>
                          }
                          onClick={handleClick}
                        />
                      </div>
                    )
                  }}
                  className={css.input}
                />
                <Button
                  text={i18n.newProjectWizard.Collaborators.add}
                  intent="primary"
                  inline
                  disabled={role.value == 'none' ? true : false}
                  type="submit"
                  loading={loading}
                />
              </Layout.Horizontal>
              {formik.errors.collaborators
                ? formik.errors.collaborators.map(val => (
                    <Text intent="danger" key={val?.value}>
                      {formik.values.collaborators[getIndex(val?.value || '')]?.label +
                        i18n.newProjectWizard.Collaborators.notValid}
                    </Text>
                  ))
                : null}
              {inviteData?.data?.content?.length ? (
                <Layout.Vertical padding={{ top: 'medium', bottom: 'xxxlarge' }}>
                  <Text padding={{ bottom: 'small' }}>
                    {i18n.newProjectWizard.Collaborators.pendingUsers(inviteData?.data?.content?.length.toString())}
                  </Text>
                  <Container className={css.pendingList}>
                    {inviteData?.data?.content.slice(0, 15).map(user => (
                      <InviteListRenderer
                        key={user.name}
                        user={user}
                        reload={reloadInvites}
                        roles={roles}
                        modalErrorHandler={modalErrorHandler}
                      />
                    ))}
                  </Container>
                </Layout.Vertical>
              ) : inviteLoading ? (
                <Layout.Vertical padding={{ top: 'xxxlarge', bottom: 'xxxlarge' }}>
                  <Icon name="steps-spinner" size={32} color={Color.GREY_600} flex={{ align: 'center-center' }} />
                </Layout.Vertical>
              ) : null}
            </Container>

            {showManage ? (
              <Layout.Horizontal>
                <Button inline minimal>
                  {projectIdentifier
                    ? i18n.newProjectWizard.Collaborators.manage
                    : i18n.newProjectWizard.Collaborators.manageOrg}
                </Button>
              </Layout.Horizontal>
            ) : null}
          </Form>
        )
      }}
    </Formik>
  )
}

export const ProjectCollaboratorsStep: React.FC<StepProps<Project> & CollaboratorModalData> = ({
  prevStepData,
  previousStep,
  nextStep,
  ...rest
}) => {
  return (
    <Layout.Vertical padding="xxxlarge">
      <Collaborators
        projectIdentifier={prevStepData?.identifier}
        orgIdentifier={prevStepData?.orgIdentifier}
        showManage={false}
        {...rest}
      />
      <Layout.Horizontal spacing="small">
        <Button className={css.button} onClick={() => previousStep?.(prevStepData)} text={i18n.newProjectWizard.back} />
        <Button
          className={css.button}
          text={i18n.newProjectWizard.finish}
          onClick={() => {
            if (prevStepData) {
              nextStep?.({ ...prevStepData })
            }
          }}
        />
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export const OrgCollaboratorsStep: React.FC<StepProps<Organization> & CollaboratorModalData> = ({
  prevStepData,
  previousStep,
  nextStep,
  ...rest
}) => {
  return (
    <Layout.Vertical padding="xxxlarge">
      <Collaborators orgIdentifier={prevStepData?.identifier} showManage={false} {...rest} />
      {prevStepData ? (
        <Layout.Horizontal spacing="small">
          <Button
            className={css.button}
            onClick={() => previousStep?.(prevStepData)}
            text={i18n.newProjectWizard.back}
          />
          <Button
            className={css.button}
            text={i18n.newProjectWizard.finish}
            onClick={() => {
              if (prevStepData) {
                nextStep?.({ ...prevStepData })
              }
            }}
          />
        </Layout.Horizontal>
      ) : (
        <Layout.Horizontal>
          <Button inline minimal>
            {i18n.newProjectWizard.Collaborators.manage}
          </Button>
        </Layout.Horizontal>
      )}
    </Layout.Vertical>
  )
}

export default Collaborators
