import React, { useState, useEffect, useRef } from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Formik, Page, useToaster, Tabs, Container, Layout, Button, ButtonVariation } from '@wings-software/uicore'
import { NGBreadcrumbs } from '@common/components/NGBreadcrumbs/NGBreadcrumbs'
import routes from '@common/RouteDefinitions'
import type { ProjectPathProps } from '@common/interfaces/RouteInterfaces'
import { useStrings } from 'framework/strings'
import { useGetServiceLevelObjective, useSaveSLOData, useUpdateSLOData } from 'services/cv'
import { getErrorMessage } from '@cv/utils/CommonUtils'
import SLOName from './components/CreateSLOForm/components/SLOName/SLOName'
import SLI from './components/CreateSLOForm/components/SLI/SLI'
import SLOTargetAndBudgetPolicy from './components/CreateSLOForm/components/SLOTargetAndBudgetPolicy/SLOTargetAndBudgetPolicy'
import { getSLOInitialFormData, createSLORequestPayload, isFormDataValid } from './CVCreateSLO.utils'
import { TabsOrder, getSLOFormValidationSchema } from './CVCreateSLO.constants'
import { SLOForm, CreateSLOTabs, NavButtonsProps } from './CVCreateSLO.types'
import css from './CVCreateSLO.module.scss'

const CVCreateSLO: React.FC = () => {
  const history = useHistory()
  const { getString } = useStrings()
  const { showSuccess, showError } = useToaster()
  const { accountId, orgIdentifier, projectIdentifier, identifier } = useParams<
    ProjectPathProps & { identifier: string }
  >()

  const [selectedTabId, setSelectedTabId] = useState<CreateSLOTabs>(CreateSLOTabs.NAME)

  const projectIdentifierRef = useRef<string>()

  useEffect(() => {
    if (projectIdentifierRef.current && projectIdentifierRef.current !== projectIdentifier) {
      history.push(routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }))
      return
    }

    projectIdentifierRef.current = projectIdentifier
  }, [projectIdentifier, accountId, orgIdentifier, history])

  const { mutate: createSLO, loading: createSLOLoading } = useSaveSLOData({
    queryParams: { accountId }
  })

  const { mutate: updateSLO, loading: updateSLOLoading } = useUpdateSLOData({
    identifier,
    queryParams: { accountId, orgIdentifier, projectIdentifier }
  })

  const {
    data: SLODataResponse,
    error: SLODataError,
    refetch: refetchSLOData,
    loading: SLODataLoading
  } = useGetServiceLevelObjective({
    identifier,
    queryParams: {
      accountId,
      orgIdentifier,
      projectIdentifier
    },
    lazy: true
  })

  useEffect(() => {
    if (identifier) {
      refetchSLOData()
    }
  }, [identifier, refetchSLOData])

  const handleSLOSubmit = async (values: SLOForm): Promise<void> => {
    const sloCreateRequestPayload = createSLORequestPayload(values, orgIdentifier, projectIdentifier)

    try {
      if (identifier) {
        await updateSLO(sloCreateRequestPayload)
        showSuccess(getString('cv.slos.sloUpdated'))
      } else {
        await createSLO(sloCreateRequestPayload)
        showSuccess(getString('cv.slos.sloCreated'))
      }

      history.push(routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }))
    } catch (e) {
      showError(getErrorMessage(e))
    }
  }

  const NavButtons: React.FC<NavButtonsProps> = ({ formikProps, loading }) => (
    <Layout.Horizontal spacing="small" padding={{ top: 'xxlarge' }}>
      <Button
        icon="chevron-left"
        text={getString('back')}
        variation={ButtonVariation.SECONDARY}
        disabled={loading}
        onClick={() => setSelectedTabId(TabsOrder[Math.max(0, TabsOrder.indexOf(selectedTabId) - 1)])}
      />
      <Button
        rightIcon="chevron-right"
        text={selectedTabId === CreateSLOTabs.SLO_TARGET_BUDGET_POLICY ? getString('save') : getString('continue')}
        variation={ButtonVariation.PRIMARY}
        loading={loading}
        onClick={() => {
          if (selectedTabId === CreateSLOTabs.SLO_TARGET_BUDGET_POLICY) {
            formikProps.submitForm()
          } else if (isFormDataValid(formikProps, selectedTabId)) {
            setSelectedTabId(TabsOrder[Math.min(TabsOrder.length, TabsOrder.indexOf(selectedTabId) + 1)])
          }
        }}
      />
    </Layout.Horizontal>
  )

  return (
    <>
      <Page.Header
        breadcrumbs={
          <NGBreadcrumbs
            links={[
              {
                url: routes.toCVSLOs({ accountId, orgIdentifier, projectIdentifier, module: 'cv' }),
                label: getString('cv.slos.title')
              }
            ]}
          />
        }
        title={identifier ? getString('cv.slos.editSLO') : getString('cv.slos.createSLO')}
      />
      <Formik<SLOForm>
        initialValues={getSLOInitialFormData(SLODataResponse?.resource?.serviceLevelObjective)}
        formName="SLO_form"
        onSubmit={values => {
          handleSLOSubmit(values)
        }}
        validationSchema={getSLOFormValidationSchema(getString)}
        enableReinitialize
      >
        {formik => (
          <Container className={css.createSloTabsContainer}>
            <Tabs
              id="createSLOTabs"
              selectedTabId={selectedTabId}
              onChange={nextTab => {
                if (isFormDataValid(formik, selectedTabId)) {
                  setSelectedTabId(nextTab as CreateSLOTabs)
                }
              }}
              tabList={[
                {
                  id: CreateSLOTabs.NAME,
                  title: getString('name'),
                  panel: (
                    <Page.Body
                      loading={SLODataLoading}
                      error={getErrorMessage(SLODataError)}
                      retryOnError={() => refetchSLOData()}
                      className={css.pageBody}
                    >
                      <SLOName formikProps={formik} identifier={identifier}>
                        <NavButtons formikProps={formik} />
                      </SLOName>
                    </Page.Body>
                  )
                },
                {
                  id: CreateSLOTabs.SLI,
                  title: getString('cv.slos.sli'),
                  panel: (
                    <Page.Body
                      loading={SLODataLoading}
                      error={getErrorMessage(SLODataError)}
                      retryOnError={() => refetchSLOData()}
                      className={css.pageBody}
                    >
                      <SLI formikProps={formik}>
                        <NavButtons formikProps={formik} />
                      </SLI>
                    </Page.Body>
                  )
                },
                {
                  id: CreateSLOTabs.SLO_TARGET_BUDGET_POLICY,
                  title: getString('cv.slos.sloTargetAndBudgetPolicy'),
                  panel: (
                    <Page.Body
                      loading={SLODataLoading}
                      error={getErrorMessage(SLODataError)}
                      retryOnError={() => refetchSLOData()}
                      className={css.pageBody}
                    >
                      <SLOTargetAndBudgetPolicy formikProps={formik}>
                        <NavButtons formikProps={formik} loading={createSLOLoading || updateSLOLoading} />
                      </SLOTargetAndBudgetPolicy>
                    </Page.Body>
                  )
                }
              ]}
            />
          </Container>
        )}
      </Formik>
    </>
  )
}

export default CVCreateSLO
