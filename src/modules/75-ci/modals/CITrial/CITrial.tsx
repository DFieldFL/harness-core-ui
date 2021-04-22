import React, { useState } from 'react'
import { Text, Layout, Icon, Container, Color } from '@wings-software/uicore'
import { useStrings } from 'framework/exports'
import type { NgPipeline } from 'services/cd-ng'
import { SelectOrCreatePipelineForm } from '@pipeline/components/SelectOrCreatePipelineForm/SelectOrCreatePipelineForm'
import { CreatePipelineForm } from '@pipeline/components/CreatePipelineForm/CreatePipelineForm'
import ciImage from '../images/illustration.png'

type handleSelectSubmit = (value: string) => void
type handleCreateSubmit = (value: NgPipeline) => void
interface CITrialModalData {
  onSubmit: handleSelectSubmit | handleCreateSubmit
  closeModal?: () => void
  isSelect: boolean
}

const CITrial: React.FC<CITrialModalData> = ({ isSelect, onSubmit, closeModal }) => {
  const { getString } = useStrings()

  const [select, setSelect] = useState(isSelect)

  return (
    <Layout.Vertical padding={{ top: 'large', left: 'xxxlarge' }}>
      <Layout.Horizontal padding={{ top: 'large' }} spacing="small">
        <Icon name="ci-main" size={20} />
        <Text style={{ color: Color.BLACK, fontSize: 'medium' }}>{getString('ci.continuous')}</Text>
        <Text
          style={{
            backgroundColor: 'var(--orange-500)',
            color: Color.WHITE,
            textAlign: 'center',
            width: 120,
            borderRadius: 3,
            marginLeft: 30,
            marginTop: 6,
            display: 'inline-block'
          }}
        >
          {getString('common.trialInProgress')}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal padding={{ top: 'large' }}>
        <Container width="57%" padding={{ right: 'xxxlarge' }}>
          <Text style={{ fontSize: 'normal', width: 380, display: 'inline-block', marginLeft: 30, lineHeight: 2 }}>
            {select
              ? getString('pipeline.selectOrCreateForm.description')
              : getString('ci.ciTrialHomePage.startTrial.description')}
          </Text>
          <img src={ciImage} style={{ marginLeft: -40, marginTop: -30 }} width={800} height={400} />
        </Container>
        <Container width="30%" padding={{ left: 'xxxlarge' }} border={{ left: true }} height={400}>
          {select ? (
            <SelectOrCreatePipelineForm
              handleSubmit={onSubmit as handleSelectSubmit}
              openCreatPipeLineModal={() => {
                setSelect(false)
              }}
              closeModal={closeModal}
            />
          ) : (
            <CreatePipelineForm handleSubmit={onSubmit as handleCreateSubmit} closeModal={closeModal} />
          )}
        </Container>
      </Layout.Horizontal>
    </Layout.Vertical>
  )
}

export default CITrial
