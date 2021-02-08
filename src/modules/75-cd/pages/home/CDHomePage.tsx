import React from 'react'
import { HomePageTemplate } from '@common/components/HomePageTemplate/HomePageTemplate'
import { useStrings } from 'framework/exports'
import bgImageURL from './images/homeIllustration.svg'

export const CDHomePage: React.FC = () => {
  const { getString } = useStrings()

  return (
    <HomePageTemplate
      title={getString('cd.continuousIntegration')}
      bgImageUrl={bgImageURL}
      subTitle={getString('cd.dashboard.subHeading')}
      documentText={getString('cd.dashboard.learnMore')}
      pointerStyle={{
        top: 10
      }}
    />
  )
}

export default CDHomePage
