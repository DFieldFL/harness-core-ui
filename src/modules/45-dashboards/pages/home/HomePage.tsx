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
  CardBody,
  Heading,
  Icon,
  useModalHook,
  FontVariation,
  FormInput,
  Formik,
  FormikForm as Form,
  ExpandingSearchInput,
  Pagination,
  SelectOption,
  TableV2
} from '@wings-software/uicore'

import { Select } from '@blueprintjs/select'

import { Classes, Menu, MenuItem, Dialog } from '@blueprintjs/core'
import * as Yup from 'yup'
import { NavLink, useParams, useHistory } from 'react-router-dom'
import { useGet, useMutate } from 'restful-react'
import type { CellProps, Renderer, Column } from 'react-table'

import { Page } from '@common/exports'
import RbacButton from '@rbac/components/Button/Button'
import { PermissionIdentifier } from '@rbac/interfaces/PermissionIdentifier'
import { ResourceType } from '@rbac/interfaces/ResourceType'
import { Breadcrumbs } from '@common/components/Breadcrumbs/Breadcrumbs'
import ModuleTagsFilter from '@dashboards/components/ModuleTagsFilter/ModuleTagsFilter'

import routes from '@common/RouteDefinitions'

import { useStrings } from 'framework/strings'

import { GetStarted } from './GetStarted'

import moduleTagCss from '@dashboards/common/ModuleTags.module.scss'
import css from './HomePage.module.scss'

enum Views {
  CREATE,
  EDIT
}

enum LayoutViews {
  LIST,
  GRID
}

const dashboardType: { [key: string]: string } = {
  SHARED: 'SHARED',
  ACCOUNT: 'ACCOUNT'
}

interface DashboardInterface {
  id: string
  type: string
  description: string
  title: string
  view_count: number
  favorite_count: number
  created_at: string
  data_source: string[]
  last_accessed_at: string
  resourceIdentifier: string
}

interface Permission {
  resource: {
    resourceType: ResourceType
    resourceIdentifier?: string
  }
  permission: PermissionIdentifier
}

const DEFAULT_FILTER: { [key: string]: boolean } = {
  HARNESS: false,
  CE: false,
  CD: false,
  CI: false,
  CF: false
}

type CustomColumn<T extends Record<string, any>> = Column<T>

const CustomSelect = Select.ofType<SelectOption>()

const NewDashboardForm = (props: any): JSX.Element => {
  const { getString } = useStrings()
  const { accountId, folderId } = useParams<{ accountId: string; folderId: string }>()

  const [errorMessage, setErrorMessage] = React.useState('')
  const history = useHistory()
  const folderListItems = [
    {
      value: 'shared',
      label: 'Organization Shared Folder'
    }
  ]

  const { data: foldersList } = useGet({
    // Inferred from RestfulProvider in index.js
    path: 'gateway/dashboard/folder',
    queryParams: { accountId: accountId, page: 1, pageSize: 1000 }
  })

  const { mutate: createDashboard, loading } = useMutate({
    verb: 'POST',
    path: folderId ? 'gateway/dashboard/v2/create' : 'gateway/dashboard/create',
    queryParams: { accountId: accountId }
  })

  if (foldersList && foldersList?.resource) {
    foldersList?.resource?.map((folder: { id: string; name: string }) => {
      const _f = {
        value: folder?.id,
        label: folder?.name
      }
      folderListItems.push(_f)
    })
  }

  const submitForm = async (formData: { name: string; description: string; folderId: string }) => {
    const description = Object.keys(formData?.description).toString()
    const cloneFormData = formData
    cloneFormData['description'] = description
    const response = await createDashboard(cloneFormData)
    return response
  }

  return (
    <Layout.Horizontal>
      <Layout.Vertical padding="xxlarge" width="50%">
        <Heading level={3} font={{ variation: FontVariation.H3 }} padding={{ bottom: 'large' }}>
          {getString('dashboards.createModal.stepOne')}
        </Heading>
        <Formik
          formName={'createDashboardForm'}
          initialValues={{ name: '', description: '', folderId: folderId }}
          validationSchema={Yup.object().shape({
            name: Yup.string().trim().required(getString('dashboards.createModal.nameValidation'))
          })}
          onSubmit={(formData: { name: string; description: string; folderId: string }) => {
            setErrorMessage('')
            const response = submitForm(formData)
            response
              .then(data => {
                if (data?.resource) {
                  history.push({
                    pathname: routes.toViewCustomDashboard({
                      viewId: data?.resource,
                      accountId: accountId,
                      folderId
                    })
                  })
                  props?.hideModal?.()
                }
              })
              .catch(() => {
                setErrorMessage(getString('dashboards.createModal.submitFail'))
              })
          }}
        >
          {() => (
            <Form>
              <Layout.Horizontal style={{ justifyContent: 'space-between' }}>
                <Layout.Vertical style={{ width: '100%' }}>
                  <FormInput.Select
                    name="folderId"
                    placeholder={'Choose the folder'}
                    label={'Folder'}
                    items={folderListItems}
                  />
                  <FormInput.Text
                    name="name"
                    label={getString('name')}
                    placeholder={getString('dashboards.createModal.namePlaceholder')}
                  />
                  {/* <FormInput.Text
                  name="description"
                  label={getString('description')}
                  placeholder={getString('dashboards.createModal.descriptionPlaceholder')}
                />
                 */}
                  <FormInput.KVTagInput name="description" label={getString('tagsLabel')} />
                  <Layout.Vertical padding={{ top: 'medium' }}>
                    <Button
                      type="submit"
                      intent="primary"
                      style={{ width: '150px' }}
                      text={getString('continue')}
                      disabled={loading}
                      className={css.button}
                    />
                    {errorMessage && (
                      <section style={{ color: 'var(--red-700)', marginTop: 'var(--spacing-small) !important' }}>
                        {errorMessage}
                      </section>
                    )}
                  </Layout.Vertical>
                </Layout.Vertical>
              </Layout.Horizontal>
            </Form>
          )}
        </Formik>
      </Layout.Vertical>
      <Container width="50%" flex={{ align: 'center-center' }} className={css.videoContainer}>
        <iframe
          src="//fast.wistia.net/embed/iframe/38m8yricif"
          scrolling="no"
          frameBorder={0}
          allowFullScreen={true}
          className="wistia_embed"
          name="wistia_embed"
          width="350"
          height="200"
        ></iframe>
      </Container>
    </Layout.Horizontal>
  )
}

const TagsRenderer = (data: DashboardInterface) => {
  const { getString } = useStrings()
  return (
    <Container className={css.predefinedTags}>
      {data.type === dashboardType.SHARED && (
        <section className={moduleTagCss.harnessTag}>{getString('dashboards.modules.harness')}</section>
      )}
      {data.data_source.map((tag: string) => {
        if (tag === 'CE') {
          return <section className={moduleTagCss.ceTag}>{getString('common.purpose.ce.cloudCost')}</section>
        }
        if (tag === 'CI') {
          return <section className={moduleTagCss.ciTag}>{getString('buildsText')}</section>
        }
        if (tag === 'CD') {
          return <section className={moduleTagCss.cdTag}>{getString('deploymentsText')}</section>
        }
        if (tag === 'CF') {
          return <section className={moduleTagCss.cfTag}>{getString('common.purpose.cf.continuous')}</section>
        }
        return <></>
      })}
      {data?.description &&
        data.type === dashboardType.ACCOUNT &&
        data?.description.split(',').map((tag: string, index: number) => {
          return (
            <section className={css.customTag} key={tag + index}>
              {tag}
            </section>
          )
        })}
    </Container>
  )
}

const RenderDashboardName: Renderer<CellProps<DashboardInterface>> = ({ row }) => {
  const data = row.original
  const { accountId, folderId } = useParams<{ accountId: string; folderId: string }>()
  const history = useHistory()
  return (
    <Text
      color={Color.BLACK}
      lineClamp={1}
      onClick={() => {
        history.push({
          pathname: routes.toViewCustomDashboard({
            viewId: row.id,
            accountId: accountId,
            folderId: folderId === 'shared' ? 'shared' : data.resourceIdentifier
          })
        })
      }}
    >
      {data.title}
    </Text>
  )
}

const RenderMenu: Renderer<CellProps<DashboardInterface>> = ({ row }) => {
  const data = row.original
  const history = useHistory()
  const { accountId } = useParams<{ accountId: string; folderId: string }>()
  const { mutate: cloneDashboard } = useMutate({
    // Inferred from RestfulProvider in index.js
    verb: 'POST',
    path: 'gateway/dashboard/clone',
    queryParams: {
      accountId: accountId
    }
  })
  const clone = async (dashboardId: string) => {
    const clonedDashboard = await cloneDashboard({ dashboardId })
    if (clonedDashboard) {
      history.push({
        pathname: routes.toViewCustomDashboard({
          viewId: clonedDashboard?.id,
          accountId: accountId,
          folderId: clonedDashboard?.folder_id
        })
      })
    }
  }
  return (
    <CardBody.Menu
      menuContent={
        <Menu>
          <MenuItem text="clone" onClick={() => clone(data.id)} />
        </Menu>
      }
      menuPopoverProps={{
        className: Classes.DARK
      }}
    />
  )
}

const RenderDashboardTags: Renderer<CellProps<DashboardInterface>> = ({ row }) => {
  const data = row.original
  return TagsRenderer(data)
}

const HomePage: React.FC = () => {
  const { getString } = useStrings()
  const { accountId, folderId } = useParams<{ accountId: string; folderId: string }>()
  const history = useHistory()
  // const [_dashboardList, _setDashboardList] = React.useState<DashboardInterface[]>([])
  const [filteredDashboardList, setFilteredList] = React.useState<DashboardInterface[]>([])
  const [view, setView] = useState(Views.CREATE)

  const [filteredTags, setFilteredTags] = React.useState<string[]>([])
  const [selectedFilter, setCheckboxFilter] = React.useState(DEFAULT_FILTER)
  const [searchTerm, setSearchTerm] = useState<string | undefined>()
  const [page, setPage] = useState(0)
  const [layoutView, setLayoutView] = useState(LayoutViews.GRID)
  const [isOpen, setDrawerOpen] = useState(false)
  const defaultSortBy: SelectOption = {
    label: 'Select Option',
    value: ''
  }

  const sortingOptions: SelectOption[] = [
    {
      label: 'Name',
      value: 'title'
    },
    {
      label: 'Recently Viewed',
      value: 'last_viewed_at desc'
    },
    {
      label: 'Recently Created',
      value: 'created_at desc'
    },
    {
      label: 'Most Viewed',
      value: 'view_count desc'
    },
    {
      label: 'Most Liked',
      value: 'favorite_count desc'
    }
  ]

  const [sortby, setSortingFilter] = useState<SelectOption>(defaultSortBy)

  const columns: CustomColumn<DashboardInterface>[] = [
    {
      Header: 'Name',
      id: 'name',
      accessor: row => row.title,
      width: '30%',
      Cell: RenderDashboardName
    },
    {
      Header: 'Tags',
      id: 'tags',
      accessor: row => row.description,
      width: '30%',
      Cell: RenderDashboardTags
    },
    {
      Header: 'View Count',
      id: 'view_count',
      accessor: row => row.view_count,
      width: '15%'
    },
    {
      Header: 'Favorite Count',
      id: 'favorite_count',
      accessor: row => row.favorite_count,
      width: '10%'
    },
    {
      Header: '',
      id: 'menu',
      accessor: row => row.id,
      width: '10%',
      Cell: RenderMenu
    }
  ]

  const serialize = (obj: { [key: string]: boolean }) => {
    const str = []
    for (const p in obj)
      if (Object.prototype.hasOwnProperty.call(obj, p)) {
        str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]))
      }
    return str.join('&')
  }

  const folderIdOrBlank = () => {
    return folderId === 'shared' ? '' : folderId
  }

  React.useEffect(() => {
    const script = document.createElement('script')

    script.src = 'https://fast.wistia.com/assets/external/E-v1.js'
    script.async = true

    document.body.appendChild(script)
  }, [])

  const {
    data: dashboardList,
    loading,
    error
  } = useGet({
    // Inferred from RestfulProvider in index.js
    path: 'gateway/dashboard/v1/search',
    queryParams: {
      accountId: accountId,
      folderId: folderIdOrBlank(),
      searchTerm,
      page: page + 1,
      pageSize: 20,
      tags: serialize(selectedFilter),
      sortBy: sortby?.value,
      customTag: filteredTags.join('%')
    }
  })

  const { data: tagsList, loading: fetchingTags } = useGet({
    // Inferred from RestfulProvider in index.js
    path: 'gateway/dashboard/v1/tags',
    queryParams: {
      accountId: accountId,
      folderId: folderIdOrBlank()
    }
  })

  const { mutate: cloneDashboard, loading: cloning } = useMutate({
    // Inferred from RestfulProvider in index.js
    verb: 'POST',
    path: 'gateway/dashboard/clone',
    queryParams: {
      accountId: accountId
    }
  })

  const clone = async (dashboardId: string) => {
    const clonedDashboard = await cloneDashboard({ dashboardId })
    if (clonedDashboard) {
      history.push({
        pathname: routes.toViewCustomDashboard({
          viewId: clonedDashboard?.id,
          accountId: accountId,
          folderId: clonedDashboard?.folder_id
        })
      })
    }
  }

  const { data: folderDetail } = useGet({
    // Inferred from RestfulProvider in index.js
    path: 'gateway/dashboard/folderDetail',
    queryParams: { accountId: accountId, folderId: folderIdOrBlank() }
  })

  React.useEffect(() => {
    if (searchTerm || selectedFilter || sortby?.value || filteredTags?.length > 0) setPage(0)
  }, [searchTerm, selectedFilter, sortby?.value, filteredTags])

  const setPredefinedFilter = (filterType: string, isChecked: boolean) => {
    const updatedValue: any = {}
    updatedValue[filterType] = isChecked
    setCheckboxFilter({ ...selectedFilter, ...updatedValue })
  }

  React.useEffect(() => {
    if (dashboardList) {
      setFilteredList(dashboardList?.resource?.list)
    }
  }, [dashboardList])

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog
        isOpen={true}
        enforceFocus={false}
        onClose={() => {
          setView(Views.CREATE)
          hideModal()
        }}
        className={cx(css.dashboardDialog, Classes.DIALOG, {
          [css.create]: view === Views.CREATE
        })}
      >
        {view === Views.CREATE ? (
          <NewDashboardForm
            formData={{}}
            handleViewChange={{}}
            hideModal={hideModal}
            name={getString('dashboards.createModal.stepOne')}
          />
        ) : null}

        {view === Views.EDIT ? <section>se</section> : null}

        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            setView(Views.CREATE)
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [view]
  )

  const title = folderId === 'shared' ? 'Shared' : folderDetail?.resource || '' + ' Folder'

  const permissionObj: Permission = {
    permission: PermissionIdentifier.EDIT_DASHBOARD,
    resource: {
      resourceType: ResourceType.DASHBOARDS
    }
  }

  if (folderId !== 'shared') {
    permissionObj['resource']['resourceIdentifier'] = folderId
  }

  const links: { url: string; label: string }[] = [
    {
      url: routes.toCustomDashboardHome({ accountId }),
      label: 'Home'
    },
    {
      url:
        folderId === 'shared' ? routes.toCustomDashboardHome({ accountId }) : routes.toCustomFolderHome({ accountId }),
      label: folderId === 'shared' ? getString('common.dashboards') : getString('dashboards.homePage.folders')
    }
  ]

  if (folderId) {
    links.push({
      url: routes.toCustomDashboardHome({ accountId }),
      label: title
    })
  }

  return (
    <Container className={css.pageContainer}>
      <Page.Header
        title={folderId !== 'shared' ? title : getString('common.dashboards')}
        breadcrumbs={<Breadcrumbs links={links} />}
        content={
          <Layout.Horizontal spacing="medium">
            <NavLink
              className={css.tags}
              activeClassName={css.activeTag}
              to={routes.toCustomDashboardHome({ accountId, folderId })}
            >
              {getString('common.dashboards')}
            </NavLink>
            <NavLink className={css.tags} activeClassName={css.activeTag} to={routes.toCustomFolderHome({ accountId })}>
              {getString('dashboards.homePage.folders')}
            </NavLink>
          </Layout.Horizontal>
        }
        toolbar={
          <Text color={Color.PRIMARY_6} style={{ cursor: 'pointer' }} onClick={() => setDrawerOpen(true)}>
            {' '}
            <Icon name="question" /> {getString('getStarted')}
          </Text>
        }
      />
      <Page.Body
        loading={loading || cloning}
        retryOnError={() => {
          return
        }}
        error={(error?.data as Error)?.message}
      >
        <GetStarted isOpen={isOpen} setDrawerOpen={val => setDrawerOpen(val)} />
        <Layout.Vertical padding="large" background={Color.GREY_0}>
          <Layout.Horizontal
            style={{
              borderBottom: '1px solid var(--grey-100)',
              justifyContent: 'space-between',
              paddingLeft: 0,
              paddingRight: 0
            }}
            flex={true}
          >
            <Layout.Horizontal
              spacing="medium"
              style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}
            >
              <section style={{ display: 'flex' }}>
                {folderId === 'shared' && (
                  <Button
                    intent="primary"
                    text={getString('dashboardLabel')}
                    onClick={() => showModal()}
                    icon="plus"
                    style={{ minWidth: '110px', marginRight: 'var(--spacing-11)' }}
                  />
                )}
                {folderId !== 'shared' && (
                  <RbacButton
                    intent="primary"
                    text={getString('dashboardLabel')}
                    onClick={() => showModal()}
                    icon="plus"
                    style={{ minWidth: '110px', marginRight: 'var(--spacing-11)' }}
                    permission={permissionObj}
                  />
                )}

                <Layout.Horizontal className={css.predefinedTags + ' ' + css.mainNavTag}>
                  <ModuleTagsFilter selectedFilter={selectedFilter} setPredefinedFilter={setPredefinedFilter} />
                </Layout.Horizontal>
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
        <Layout.Vertical className={css.filterPanel} padding="medium" spacing="medium">
          <Container>
            <Text font={{ weight: 'semi-bold' }} color={Color.GREY_800}>
              FILTER BY TAGS
            </Text>
          </Container>
          <Container>
            <Layout.Vertical spacing="small">
              <Container className={css.predefinedTags}>
                {fetchingTags && <span>{getString('loading')} </span>}
                {!fetchingTags &&
                  tagsList?.resource?.tags?.length > 0 &&
                  tagsList?.resource?.tags?.split(',').map((tag: string, index: number) => {
                    if (tag) {
                      return (
                        <section
                          className={css.customTag}
                          key={tag + index}
                          onClick={() => {
                            if (filteredTags.indexOf(tag) === -1) {
                              setFilteredTags([...filteredTags, tag])
                            }
                          }}
                        >
                          {tag}
                        </section>
                      )
                    }
                  })}

                {tagsList?.resource?.tags?.length === 0 && <span>{getString('dashboards.homePage.noTags')}</span>}
              </Container>
            </Layout.Vertical>
          </Container>
        </Layout.Vertical>

        <Layout.Vertical
          padding="large"
          style={{ width: 'calc(100% - 280px)', height: 'calc(100vh - 226px)', paddingTop: 0, overflow: 'scroll' }}
        >
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
          {filteredDashboardList && filteredDashboardList.length > 0 && layoutView === LayoutViews.GRID && (
            <Container className={css.masonry}>
              <Layout.Masonry
                gutter={25}
                items={filteredDashboardList}
                renderItem={(dashboard: DashboardInterface) => (
                  <Card className={cx(css.dashboardCard)}>
                    <Container>
                      {(dashboard?.type === dashboardType.SHARED || dashboard?.type === dashboardType.ACCOUNT) && (
                        <CardBody.Menu
                          menuContent={
                            <Menu>
                              <MenuItem text="clone" onClick={() => clone(dashboard.id)} />
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
                            pathname: routes.toViewCustomDashboard({
                              viewId: dashboard.id,
                              accountId: accountId,
                              folderId: folderId === 'shared' ? 'shared' : dashboard?.resourceIdentifier
                            })
                          })
                        }}
                      >
                        <Text color={Color.BLACK_100} font={{ size: 'normal', weight: 'semi-bold' }}>
                          {dashboard?.title}
                        </Text>
                        {TagsRenderer(dashboard)}

                        <Layout.Horizontal spacing="medium">
                          {dashboard?.type !== dashboardType.SHARED && (
                            <>
                              <Layout.Horizontal style={{ marginRight: 'var(--spacing-8)' }}>
                                <Icon name="eye-open" size={18} style={{ marginRight: 'var(--spacing-4)' }} />
                                <Text color={Color.BLACK_100} font={{ size: 'normal', weight: 'semi-bold' }}>
                                  {dashboard?.view_count}
                                </Text>
                              </Layout.Horizontal>

                              <Layout.Horizontal>
                                <Icon name="star-empty" size={18} style={{ marginRight: 'var(--spacing-4)' }} />
                                <Text color={Color.BLACK_100} font={{ size: 'normal', weight: 'semi-bold' }}>
                                  {dashboard?.favorite_count}
                                </Text>
                              </Layout.Horizontal>
                            </>
                          )}
                        </Layout.Horizontal>
                      </Layout.Vertical>
                    </Container>
                  </Card>
                )}
                keyOf={dashboard => dashboard?.id}
              />
            </Container>
          )}

          {filteredDashboardList && filteredDashboardList.length > 0 && layoutView === LayoutViews.LIST && (
            <Container className={css.masonry}>
              <TableV2<DashboardInterface> className={css.table} columns={columns} data={filteredDashboardList || []} />
            </Container>
          )}

          {filteredDashboardList && filteredDashboardList.length === 0 && !loading && (
            <Container style={{ height: 'calc(100vh - 226px)' }} flex={{ align: 'center-center' }}>
              <Layout.Vertical spacing="medium" width={470} style={{ alignItems: 'center', marginTop: '-48px' }}>
                <Icon name="dashboard" color={Color.GREY_300} size={35} />
                <Heading level={2} font={{ align: 'center' }} color={Color.GREY_500}>
                  {getString('dashboards.homePage.noDashboardsAvailable')}
                </Heading>
              </Layout.Vertical>
            </Container>
          )}
        </Layout.Vertical>

        {!loading && (
          <Layout.Vertical padding={{ left: 'medium', right: 'medium' }}>
            <Pagination
              itemCount={100}
              pageSize={10}
              pageCount={100}
              pageIndex={page}
              gotoPage={(pageNumber: number) => setPage(pageNumber)}
            />
          </Layout.Vertical>
        )}
      </Page.Body>
    </Container>
  )
}

export default HomePage
