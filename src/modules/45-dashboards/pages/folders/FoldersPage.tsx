/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React, { useState } from 'react'
import cx from 'classnames'
import {
  Color,
  Layout,
  Text,
  Container,
  Card,
  Button,
  Heading,
  Icon,
  useModalHook,
  CardBody,
  FontVariation,
  FormInput,
  Formik,
  FormikForm as Form,
  Pagination,
  SelectOption,
  ExpandingSearchInput,
  TableV2
} from '@wings-software/uicore'

import { Select } from '@blueprintjs/select'

import { Classes, Dialog, Menu, MenuItem } from '@blueprintjs/core'
import * as Yup from 'yup'
import { NavLink, useParams, useHistory } from 'react-router-dom'
import { useGet, useMutate } from 'restful-react'
import type { CellProps, Renderer, Column } from 'react-table'
import RbacButton from '@rbac/components/Button/Button'
import { Page } from '@common/exports'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import routes from '@common/RouteDefinitions'

import type { AccountPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { GetStarted } from '../home/GetStarted'
import useDeleteFolder from './useDeleteFolder'

import dashboardIcon from './dashboard.svg'

import css from '../home/HomePage.module.scss'

type CustomColumn<T extends Record<string, any>> = Column<T>

const CustomSelect = Select.ofType<SelectOption>()

enum Views {
  CREATE,
  EDIT
}

interface FolderInterface {
  id: string
  name: string
  title: string
  type: string
  child_count: number
  created_at: string
  data_source: string[]
}

enum LayoutViews {
  LIST,
  GRID
}

const defaultSortBy: SelectOption = {
  label: 'Select Option',
  value: ''
}

const NewFolderForm = (props: any): JSX.Element => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const [errorMessage, setErrorMessage] = React.useState('')
  const history = useHistory()
  const { mutate: createFolder, loading } = useMutate({
    verb: 'POST',
    path: 'gateway/dashboard/folder',
    queryParams: { accountId: accountId }
  })

  const submitForm = async (formData: { name: string }) => {
    const response = await createFolder(formData)
    return response
  }

  return (
    <Layout.Horizontal style={{ height: '100%', justifyContent: 'space-between' }}>
      <Layout.Horizontal padding="xxlarge" style={{ flexDirection: 'column', alignItems: 'baseline' }}>
        <Heading level={3} font={{ variation: FontVariation.H3 }} padding={{ bottom: 'large' }}>
          {getString('dashboards.createFolder.stepOne')}
        </Heading>
        <Formik
          initialValues={{ name: '' }}
          formName={'createFolderForm'}
          validationSchema={Yup.object().shape({
            name: Yup.string().trim().required(getString('dashboards.createFolder.folderNameValidation'))
          })}
          onSubmit={(formData: { name: string }) => {
            setErrorMessage('')
            const response = submitForm(formData)
            response
              .then(data => {
                if (data?.resource) {
                  history.push({
                    pathname: routes.toCustomDashboardHome({
                      folderId: data?.resource,
                      accountId: accountId
                    })
                  })
                  props?.hideModal?.()
                }
              })
              .catch(() => {
                setErrorMessage(getString('dashboards.createFolder.folderSubmitFail'))
              })
          }}
        >
          {() => (
            <Form className={css.formContainer}>
              <Layout.Vertical spacing="xsmall">
                <FormInput.Text
                  name="name"
                  label={getString('name')}
                  placeholder={getString('dashboards.createFolder.folderPlaceholder')}
                />

                <Layout.Vertical style={{ marginTop: '180px' }} padding={{ top: 'small' }}>
                  <Button
                    type="submit"
                    intent="primary"
                    style={{ width: '150px' }}
                    text={getString('continue')}
                    disabled={loading}
                    className={css.button}
                  />
                  {errorMessage && (
                    <section style={{ color: 'var(--red-700)', marginTop: 'var(--spacing-small)' }}>
                      {errorMessage}
                    </section>
                  )}
                </Layout.Vertical>
              </Layout.Vertical>
            </Form>
          )}
        </Formik>
      </Layout.Horizontal>
    </Layout.Horizontal>
  )
}
const folderType: { [key: string]: string } = {
  SHARED: 'SHARED',
  ACCOUNT: 'ACCOUNT'
}

const RenderDashboardName: Renderer<CellProps<FolderInterface>> = ({ row }) => {
  const data = row.original
  return (
    <Text color={Color.BLACK} lineClamp={1}>
      {data.name}
    </Text>
  )
}

const RenderDashboardCount: Renderer<CellProps<FolderInterface>> = ({ row }) => {
  const data = row.original
  return (
    <Layout.Horizontal spacing="small">
      <img src={dashboardIcon} height={20} />
      <Text color={Color.PRIMARY_7} font={{ size: 'medium', weight: 'semi-bold' }}>
        {data?.child_count || 0}
      </Text>
    </Layout.Horizontal>
  )
}

const columns: CustomColumn<FolderInterface>[] = [
  {
    Header: 'Name',
    id: 'name',
    accessor: row => row.name,
    width: '80%',
    Cell: RenderDashboardName
  },

  {
    Header: 'Dashboard Count',
    id: 'child_count',
    accessor: row => row.child_count,
    width: '20%',
    Cell: RenderDashboardCount
  }
]

const FoldersPage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId } = useParams<AccountPathProps>()
  const history = useHistory()

  const [filteredFoldersList, setFilteredList] = React.useState<FolderInterface[]>([])

  const [view, setView] = useState(Views.CREATE)
  const [deleteContext, setDeleteContext] = React.useState<FolderInterface>()
  const [page, setPage] = useState(0)
  const [filteredTags, setFilteredTags] = React.useState<string[]>([])

  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [layoutView, setLayoutView] = useState(LayoutViews.GRID)
  const [sortby, setSortingFilter] = useState<SelectOption>(defaultSortBy)
  const [isOpen, setDrawerOpen] = useState(false)

  const strRefFolders = 'dashboards.homePage.folders'

  React.useEffect(() => {
    const script = document.createElement('script')

    script.src = 'https://fast.wistia.com/assets/external/E-v1.js'
    script.async = true

    document.body.appendChild(script)
  }, [])

  React.useEffect(() => {
    if (searchTerm || sortby?.value || filteredTags?.length > 0) setPage(0)
  }, [searchTerm, sortby?.value, filteredTags])

  const {
    data: foldersList,
    loading,
    error,
    refetch: reloadFolders
  } = useGet({
    // Inferred from RestfulProvider in index.js
    path: 'gateway/dashboard/v1/folders',
    queryParams: {
      accountId: accountId,
      searchTerm,
      page: page + 1,
      pageSize: 20,
      sortBy: sortby?.value
    }
  })

  const sortingOptions: SelectOption[] = [
    {
      label: 'Name (A-Z)',
      value: 'name'
    },
    {
      label: 'Name (Z-A)',
      value: 'name desc'
    },
    {
      label: 'Recently Created',
      value: 'created_at desc'
    }
  ]

  const onDeleted = (): void => {
    reloadFolders?.()
  }

  React.useEffect(() => {
    if (foldersList) {
      setFilteredList(foldersList?.resource?.list)
    }
  }, [foldersList])

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          setView(Views.CREATE)
          hideModal()
        }}
        className={cx(css.dashboardFolderDialog, Classes.DIALOG, {
          [css.create]: view === Views.CREATE
        })}
      >
        {view === Views.CREATE ? (
          <NewFolderForm
            name={getString('dashboards.createFolder.stepOne')}
            formData={{}}
            hideModal={hideModal}
            handleViewChange={{}}
          />
        ) : null}

        {view === Views.EDIT ? <section>se</section> : null}

        <Button
          className={css.crossIcon}
          icon="cross"
          iconProps={{ size: 18 }}
          minimal
          onClick={() => {
            setView(Views.CREATE)
            hideModal()
          }}
        />
      </Dialog>
    ),
    [view]
  )

  const { openDialog } = useDeleteFolder(deleteContext, onDeleted)

  return (
    <Container className={css.pageContainer}>
      <Page.Header
        title={getString(strRefFolders)}
        breadcrumbs={
          <Breadcrumbs
            links={[
              {
                url: routes.toCustomDashboardHome({ accountId }),
                label: 'Home'
              },
              {
                url: routes.toCustomDashboardHome({ accountId }),
                label: getString('common.dashboards')
              }
            ]}
          />
        }
        toolbar={
          <Text color={Color.PRIMARY_6} style={{ cursor: 'pointer' }} onClick={() => setDrawerOpen(true)}>
            {' '}
            <Icon name="question" /> {getString('getStarted')}
          </Text>
        }
        content={
          <Layout.Horizontal spacing="medium">
            <NavLink
              className={css.tags}
              activeClassName={css.activeTag}
              to={routes.toCustomDashboardHome({ accountId })}
            >
              {getString('common.dashboards')}
            </NavLink>
            <NavLink activeClassName={css.activeTag} className={css.tags} to={routes.toCustomFolderHome({ accountId })}>
              {getString(strRefFolders)}
            </NavLink>
          </Layout.Horizontal>
        }
      />
      <Page.Body
        retryOnError={() => {
          return
        }}
        loading={loading}
        error={(error?.data as Error)?.message}
      >
        <GetStarted isOpen={isOpen} setDrawerOpen={val => setDrawerOpen(val)} />
        <Layout.Vertical background={Color.GREY_0} padding="large">
          <Layout.Horizontal
            flex={true}
            style={{
              borderBottom: '1px solid var(--grey-100)',
              justifyContent: 'space-between',
              paddingLeft: 0,
              paddingRight: 0
            }}
          >
            <Layout.Horizontal
              spacing="medium"
              style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
            >
              <section style={{ display: 'flex' }}>
                <RbacButton
                  intent="primary"
                  text={getString(strRefFolders)}
                  onClick={() => showModal()}
                  icon="plus"
                  style={{ minWidth: '110px', marginRight: 'var(--spacing-11)' }}
                  permission={{
                    permission: PermissionIdentifier.EDIT_ACCOUNT,
                    resource: {
                      resourceType: ResourceType.ACCOUNT
                    }
                  }}
                />
              </section>
              <Layout.Horizontal>
                <CustomSelect
                  items={sortingOptions}
                  filterable={false}
                  itemRenderer={(item, { handleClick }) => (
                    <div key={item.value.toString()}>
                      <Menu.Item text={item.label} onClick={handleClick} />
                    </div>
                  )}
                  onItemSelect={item => {
                    setSortingFilter(item)
                  }}
                  popoverProps={{ minimal: true, popoverClassName: '' }}
                >
                  <Button
                    inline
                    round
                    rightIcon="chevron-down"
                    className={css.customSelect}
                    text={
                      <Layout.Horizontal spacing="xsmall">
                        <Text color={Color.BLACK}>{'Sort By'}</Text>
                        <Text>{sortby?.label}</Text>
                      </Layout.Horizontal>
                    }
                  />
                </CustomSelect>
                <Layout.Horizontal>
                  <Button
                    minimal
                    icon="grid-view"
                    intent={layoutView === LayoutViews.GRID ? 'primary' : 'none'}
                    onClick={() => {
                      setLayoutView(LayoutViews.GRID)
                    }}
                  />
                  <Button
                    minimal
                    icon="list"
                    intent={layoutView === LayoutViews.LIST ? 'primary' : 'none'}
                    onClick={() => {
                      setLayoutView(LayoutViews.LIST)
                    }}
                  />
                </Layout.Horizontal>
              </Layout.Horizontal>
            </Layout.Horizontal>
          </Layout.Horizontal>
        </Layout.Vertical>

        <Layout.Vertical padding="large" style={{ height: 'calc(100vh - 226px)', paddingTop: 0, overflow: 'scroll' }}>
          <Layout.Horizontal style={{ padding: 'var(--spacing-6) var(--spacing-9) ' }}>
            <ExpandingSearchInput
              placeholder={getString('dashboards.homePage.searchPlaceholder')}
              onChange={(text: string) => {
                setSearchTerm(text)
              }}
              className={css.search}
            />
          </Layout.Horizontal>
          <Layout.Horizontal style={{ marginLeft: 'var(--spacing-xxxlarge)', alignItems: 'baseline' }}>
            <section className={css.filteredTags}>
              {filteredTags.map((tag: string, index: number) => {
                return (
                  <section className={css.customTag} key={tag + index}>
                    {tag}{' '}
                    <Icon
                      name="cross"
                      style={{ cursor: 'pointer' }}
                      onClick={() => {
                        const filterTags = filteredTags.filter(v => v !== tag)
                        setFilteredTags(filterTags)
                      }}
                    />
                  </section>
                )
              })}
            </section>
            {filteredTags?.length > 0 && (
              <Text
                color={Color.PRIMARY_7}
                style={{ cursor: 'pointer' }}
                font={{ weight: 'semi-bold' }}
                onClick={() => setFilteredTags([])}
              >
                Clear All
              </Text>
            )}
          </Layout.Horizontal>

          {filteredFoldersList && filteredFoldersList.length > 0 && layoutView === LayoutViews.GRID && (
            <Layout.Vertical padding="large">
              <Container className={css.folderMasonry}>
                <Layout.Masonry
                  center
                  gutter={25}
                  items={filteredFoldersList}
                  renderItem={(folder: FolderInterface) => (
                    <Card className={cx(css.dashboardCard)}>
                      <Container>
                        {folder?.type !== folderType.SHARED && (
                          <CardBody.Menu
                            menuContent={
                              <Menu>
                                <MenuItem
                                  text="Delete"
                                  onClick={() => {
                                    setDeleteContext(folder)
                                    openDialog()
                                  }}
                                />
                              </Menu>
                            }
                            menuPopoverProps={{
                              className: Classes.DARK
                            }}
                          />
                        )}

                        <Layout.Vertical
                          spacing="large"
                          onClick={() => {
                            history.push({
                              pathname: routes.toCustomDashboardHome({
                                folderId: folder?.id ? folder?.id : 'shared',
                                accountId: accountId
                              })
                            })
                          }}
                        >
                          <Text color={Color.BLACK_100} font={{ size: 'medium', weight: 'semi-bold' }}>
                            {folder?.name}
                          </Text>
                          {/* {TagsRenderer(folder)} */}
                          <Layout.Horizontal spacing="medium">
                            <Container
                              flex
                              style={{
                                borderRadius: '5px',
                                flexDirection: 'row',
                                justifyContent: 'start',
                                alignItems: 'center'
                              }}
                            >
                              <Layout.Vertical padding="none">
                                <Layout.Horizontal spacing="small">
                                  <img src={dashboardIcon} height={20} />
                                  <Text color={Color.PRIMARY_7} font={{ size: 'medium', weight: 'semi-bold' }}>
                                    {folder?.child_count || 0}
                                  </Text>
                                </Layout.Horizontal>
                              </Layout.Vertical>
                            </Container>
                          </Layout.Horizontal>
                        </Layout.Vertical>
                      </Container>
                    </Card>
                  )}
                  keyOf={folder => folder?.id}
                />
              </Container>
            </Layout.Vertical>
          )}

          {filteredFoldersList && filteredFoldersList.length > 0 && layoutView === LayoutViews.LIST && (
            <Container className={css.folderMasonry}>
              <TableV2<FolderInterface>
                className={css.table}
                columns={columns}
                data={filteredFoldersList || []}
                onRowClick={data => {
                  history.push({
                    pathname: routes.toCustomDashboardHome({
                      folderId: data?.id ? data?.id : 'shared',
                      accountId: accountId
                    })
                  })
                }}
              />
            </Container>
          )}

          {filteredFoldersList && filteredFoldersList.length === 0 && !loading && (
            <Container style={{ height: 'calc(100vh - 226px)' }} flex={{ align: 'center-center' }}>
              <Layout.Vertical spacing="medium" width={470} style={{ alignItems: 'center', marginTop: '-48px' }}>
                <Icon name="folder-open" color={Color.GREY_300} size={35} />
                <Heading level={2} font={{ align: 'center' }} color={Color.GREY_500}>
                  {getString('dashboards.homePage.noFolderAvailable')}
                </Heading>
              </Layout.Vertical>
            </Container>
          )}
        </Layout.Vertical>

        {!loading && (
          <Layout.Vertical padding={{ right: 'medium', left: 'medium' }}>
            <Pagination
              gotoPage={(pageNumber: number) => setPage(pageNumber)}
              itemCount={100}
              pageCount={100}
              pageIndex={page}
              pageSize={10}
            />
          </Layout.Vertical>
        )}
      </Page.Body>
    </Container>
  )
}

export default FoldersPage
