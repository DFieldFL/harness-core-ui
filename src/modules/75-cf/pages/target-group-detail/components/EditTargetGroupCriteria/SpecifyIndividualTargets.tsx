import React, { FC } from 'react'
import { FontVariation, Heading } from '@wings-software/uicore'
import { useStrings } from 'framework/strings'
import type { Segment } from 'services/cf'
import TargetSelect from './TargetSelect'

import sectionCss from './Section.module.scss'

export interface SpecifyIndividualTargetsProps {
  targetGroup: Segment
}

const SpecifyIndividualTargets: FC<SpecifyIndividualTargetsProps> = ({ targetGroup }) => {
  const { getString } = useStrings()

  return (
    <section className={sectionCss.section}>
      <Heading level={3} font={{ variation: FontVariation.FORM_SUB_SECTION }}>
        {getString('cf.segmentDetail.specifyIndividualTargets')}
      </Heading>

      <TargetSelect
        environment={targetGroup.environment as string}
        fieldName="included"
        label={`${getString('cf.segmentDetail.includeTheFollowing')}:`}
      />

      <TargetSelect
        environment={targetGroup.environment as string}
        fieldName="excluded"
        label={`${getString('cf.segmentDetail.excludeTheFollowing')}:`}
      />
    </section>
  )
}

export default SpecifyIndividualTargets
