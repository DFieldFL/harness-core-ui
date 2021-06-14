import React, { useState } from 'react'
import {
  Button,
  Formik,
  FormikForm,
  Heading,
  Layout,
  ModalErrorHandler,
  StepProps,
  CardSelect,
  Icon,
  IconName,
  Text,
  Container
} from '@wings-software/uicore'
import type { ConnectorInfoDTO, ConnectorConfigDTO } from 'services/cd-ng'
import css from '../../CreateCeAzureConnector.module.scss'

interface CloudFeatures {
  VISIBILITY: boolean
  OPTIMIZATION: boolean
}

interface ICard {
  icon: IconName
  desc: string
  value: string
  title: string
}

const FeatureCards: ICard[] = [
  {
    icon: 'ce-visibility',
    desc:
      'Cost insights, anomaly detection, service insights, creating budgets perspectives and alerts, utilised/wasted resources in clusters.',
    value: 'VISIBILITY',
    title: 'Visibility'
  },
  {
    icon: 'nav-settings',
    desc:
      'Detection of orphaned resources, recommendations to save costs, scaling/tearing down, turning off in non-work hours, reserving instances.',
    value: 'OPTIMIZATION',
    title: 'Optimization'
  }
]

const ChooseRequirements: React.FC<StepProps<ConnectorInfoDTO> & StepProps<ConnectorConfigDTO>> = props => {
  const { previousStep, prevStepData, nextStep } = props
  const [cardsSelected, setCardsSelected] = useState<ICard[]>([])

  const handleSubmit = () => {
    const featuresEnabled = cardsSelected.map(c => c.value)
    nextStep?.({ ...(prevStepData as ConnectorInfoDTO), featuresEnabled })
  }

  const handleCardSelection = (item: ICard) => {
    const selectedAr = [...cardsSelected]
    const index = selectedAr.indexOf(item)
    if (index > -1) {
      selectedAr.splice(index, 1)
    } else {
      selectedAr.push(item)
    }
    setCardsSelected(selectedAr)
  }

  return (
    <Layout.Vertical className={css.stepContainer}>
      <Heading level={2} className={css.header}>
        Create Cross Account Role - <span>Choose Permissions</span>
      </Heading>
      <Text className={css.infobox}>
        Harness uses Multitenant app to sync billing export data from source storage account to Harness. Create a
        service principal for this app in your Azure account and assign read permissions on that particular storage
        account.
      </Text>
      <Container>
        <Heading level={3} className={css.mtbxxlarge}>
          Select the Cloud Cost Management features you would like to use on the Azure account. Each requires specific
          permissions to the cross account role <i>(optional)</i>
        </Heading>
        <Formik<CloudFeatures>
          initialValues={{
            VISIBILITY: false,
            OPTIMIZATION: false
          }}
          onSubmit={handleSubmit}
        >
          {() => (
            <FormikForm>
              <ModalErrorHandler
                bind={() => {
                  return
                }}
              />
              <CardSelect
                data={FeatureCards}
                selected={cardsSelected}
                multi={true}
                className={css.grid}
                onChange={handleCardSelection}
                cornerSelected={true}
                renderItem={item => <Card item={item} />}
              ></CardSelect>
              <Layout.Horizontal spacing="medium" className={css.continueAndPreviousBtns}>
                <Button text="Previous" icon="chevron-left" onClick={() => previousStep?.(prevStepData)} />
                <Button type="submit" intent="primary" rightIcon="chevron-right" disabled={false}>
                  Continue
                </Button>
              </Layout.Horizontal>
            </FormikForm>
          )}
        </Formik>
      </Container>
    </Layout.Vertical>
  )
}

const Card = ({ item }: { item: ICard }) => {
  const { icon, title, desc } = item
  return (
    <Layout.Vertical spacing="medium">
      <Layout.Horizontal spacing="small">
        <Icon name={icon} size={32} />
        <Container>
          <Text color="grey900" style={{ fontSize: 9, fontWeight: 600 }}>
            COST
          </Text>
          <Text color="grey900" style={{ fontSize: 16, fontWeight: 500 }}>
            {title}
          </Text>
        </Container>
      </Layout.Horizontal>
      <Text style={{ fontSize: 12, lineHeight: '20px' }}>{desc}</Text>
    </Layout.Vertical>
  )
}

export default ChooseRequirements
