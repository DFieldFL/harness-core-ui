import React, { useMemo } from 'react'
import { Button, Card, Container, useModalHook, Text } from '@wings-software/uicore'
import { Divider, Dialog } from '@blueprintjs/core'
import { MonacoDiffEditor } from 'react-monaco-editor'
import type { ChangeEventDTO } from 'services/cv'
import { useStrings } from 'framework/strings'
import ChangeEventServiceHealth from '@cv/pages/monitored-service/components/ServiceHealth/components/ChangesAndServiceDependency/components/ChangesTable/components/ChangeCard/components/ChangeEventServiceHealth/ChangeEventServiceHealth'
import ChangeDetails from '../../ChangeDetails/ChangeDetails'
import type { ChangeTitleData, ChangeDetailsDataInterface, ChangeInfoData } from '../../../ChangeEventCard.types'
import { createChangeTitleData, createChangeDetailsData, createChangeInfoData } from '../../../ChangeEventCard.utils'
import ChangeTitle from '../../ChangeTitle/ChangeTitle'
import ChangeInformation from '../../ChangeInformation/ChangeInformation'
import K8sChangeEventYAML from './components/K8sChangeEventYAML/K8sChangeEventYAML'
import { K8sChangeEventDrawerProps } from './K8sChangeEventCard.constants'
import changeEventCardCss from '../../../ChangeEventCard.module.scss'
import css from './K8sChangeEventCard.module.scss'

export default function K8sChangeEventCard({ data }: { data: ChangeEventDTO }): JSX.Element {
  const changeTitleData: ChangeTitleData = useMemo(() => createChangeTitleData(data), [data])
  const changeDetailsData: ChangeDetailsDataInterface = useMemo(() => createChangeDetailsData(data), [data])
  const changeInfoData: ChangeInfoData = useMemo(() => createChangeInfoData(data.metadata), [data.metadata])
  const { getString } = useStrings()
  const [showModal, hideModal] = useModalHook(() => (
    <Dialog {...K8sChangeEventDrawerProps} enforceFocus={false} onClose={hideModal}>
      <Container className={css.comparison}>
        <Text className={css.title}>{getString('previous')}</Text>
        <Text className={css.title}>{getString('common.current')}</Text>
      </Container>
      <MonacoDiffEditor
        width="100%"
        height="100%"
        language="yaml"
        original={data.metadata?.oldYaml}
        value={data.metadata?.newYaml}
      />
    </Dialog>
  ))

  return (
    <Card className={changeEventCardCss.main}>
      <ChangeTitle changeTitleData={changeTitleData} />
      <Divider className={changeEventCardCss.divider} />
      <ChangeDetails ChangeDetailsData={changeDetailsData} />
      <Divider className={changeEventCardCss.divider} />
      <Container>
        <Button
          icon="eye-open"
          text={getString('cv.showYAMLChange')}
          onClick={() => showModal()}
          className={css.displayDiffButton}
        />
        <ChangeInformation infoData={changeInfoData} />
        {data.metadata?.newYaml && <K8sChangeEventYAML yaml={data.metadata.newYaml} />}
      </Container>
      <Divider className={changeEventCardCss.divider} />
      {data.eventTime && (
        <ChangeEventServiceHealth
          serviceIdentifier={data.serviceIdentifier}
          envIdentifier={data.envIdentifier}
          startTime={data.eventTime}
          eventType={data.type}
        />
      )}
    </Card>
  )
}
