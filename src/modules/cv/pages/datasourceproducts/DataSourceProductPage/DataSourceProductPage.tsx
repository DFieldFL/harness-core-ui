import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { Container, Button, Text, OverlaySpinner } from '@wings-software/uikit'
import CVProductCard, { TypeCard } from 'modules/cv/components/CVProductCard/CVProductCard'
import { Link, useRouteMatch, useLocation } from 'react-router-dom'
import css from './DataSourceProductPage.module.scss'
import i18n from './DataSourceProductPage.i18n'
import { routeCVDataSourcesEntityPage, routeCVOnBoardingSetup } from 'modules/cv/routes'
import { Page } from 'modules/common/exports'
import { CVNextGenCVConfigService } from 'modules/cv/services'
import { accountId, connectorId } from 'modules/cv/constants'

const XHR_DATA_SOURCE_PRODUCTS_GROUP = 'XHR_DATA_SOURCE_PRODUCTS_GROUP'
const ProductOptions: { [datasourceType: string]: Array<{ item: TypeCard }> } = {
  'app-dynamics': [
    {
      item: {
        title: 'Application Monitoring',
        icon: 'service-appdynamics'
      }
    }
  ],
  splunk: [
    {
      item: {
        title: 'Splunk Enterprise',
        icon: 'service-splunk',
        iconSize: 25
      }
    }
  ]
}

export default function AppDynamicsProductPage(): JSX.Element {
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const { params } = useRouteMatch<{ dataSourceType: string }>()
  const { state: locationContext = {} } = useLocation<{ isEdit?: boolean; dataSourceId?: string }>()
  const [isLoading, setLoading] = useState(locationContext?.isEdit ? true : false)
  const { productOptions, productDescription } = useMemo<{
    productOptions: Array<{ item: TypeCard }>
    productDescription: string
  }>(() => {
    switch (params?.dataSourceType) {
      case 'app-dynamics':
        return {
          productOptions: ProductOptions['app-dynamics'],
          productDescription: i18n['app-dynamics'].productDescription
        }
      case 'splunk':
        return {
          productOptions: ProductOptions['splunk'],
          productDescription: i18n['splunk'].productDescription
        }
      default:
        return {
          productOptions: [],
          productDescription: ''
        }
    }
  }, [params?.dataSourceType])

  useEffect(() => {
    if (!locationContext.isEdit) {
      return
    }
    CVNextGenCVConfigService.fetchProducts({
      group: XHR_DATA_SOURCE_PRODUCTS_GROUP,
      accountId,
      dataSourceConnectorId: locationContext.dataSourceId ? locationContext.dataSourceId : connectorId
    }).then(({ error, response }) => {
      if (error) {
        setLoading(false)
        // TODO handle error state
      } else if (response?.resource) {
        setSelectedProducts(response.resource)
        setLoading(false)
      }
    })
  }, [locationContext.dataSourceId, locationContext.isEdit])

  const linkToParams = useMemo(
    () => ({
      pathname: locationContext.isEdit
        ? routeCVOnBoardingSetup.url({ dataSourceType: params.dataSourceType })
        : routeCVDataSourcesEntityPage.url({ dataSourceType: params.dataSourceType }),
      state: { products: selectedProducts, ...locationContext }
    }),
    [selectedProducts, params.dataSourceType, locationContext]
  )

  const onProductCardClickHandler = useCallback(
    (item?: TypeCard) => {
      if (!item?.title) {
        return
      }
      if (!selectedProducts.includes(item.title)) {
        setSelectedProducts([...selectedProducts, item.title])
      } else {
        setSelectedProducts(selectedProducts.filter(product => product !== item.title))
      }
    },
    [selectedProducts]
  )
  return (
    <OverlaySpinner show={isLoading}>
      <Container className={css.main}>
        <Page.Header title={i18n.pageTitle}></Page.Header>
        <Page.Body>
          <Container className={css.contentContainer}>
            <Container className={css.sourcesGrid}>
              {productOptions.map(option => (
                <CVProductCard
                  item={option.item}
                  key={option.item.title}
                  onClick={onProductCardClickHandler}
                  selected={selectedProducts.includes(option.item.title)}
                />
              ))}
            </Container>
            <Text className={css.productDescriptions}>{productDescription}</Text>
            <Container className={css.buttonContainer}>
              <Button className={css.backButton}>Back</Button>
              <Link to={linkToParams}>
                <Button disabled={!selectedProducts?.length} intent="primary">
                  Next
                </Button>
              </Link>
            </Container>
          </Container>
        </Page.Body>
      </Container>
    </OverlaySpinner>
  )
}
