import React from 'react'
import { Text, Color, Container, Layout, Icon, SparkChart } from '@wings-software/uikit'
import { useHistory } from 'react-router-dom'
import { useStrings } from 'framework/exports'
import routes from '@common/RouteDefinitions'
import type { Project } from 'services/cd-ng'
import css from '../ModuleRenderer.module.scss'

interface CERendererProps {
  data: Project
  isPreview?: boolean
}
const CERenderer: React.FC<CERendererProps> = ({ data, isPreview }) => {
  const history = useHistory()
  const { getString } = useStrings()
  return (
    <Container
      border={{ top: true, color: Color.GREY_250 }}
      padding={{ top: 'medium', bottom: 'medium' }}
      className={css.moduleContainer}
      onClick={() => {
        !isPreview &&
          history.push(
            routes.toCEHome({
              accountId: data.accountIdentifier || /* istanbul ignore next */ ''
            })
          )
      }}
    >
      <Layout.Horizontal>
        <Container width="30%" border={{ right: true, color: Color.GREY_250 }} flex={{ align: 'center-center' }}>
          <Icon name="ce-main" size={35} />
        </Container>
        <Container width="70%" flex={{ align: 'center-center' }}>
          <Layout.Vertical flex={{ align: 'center-center' }}>
            <Layout.Horizontal flex={{ align: 'center-center' }} className={css.activityChart} spacing="xxlarge">
              <SparkChart data={[2, 3, 4, 5, 4, 3, 2]} />
              <Text color={Color.GREY_400} font={{ size: 'medium' }}>
                {'23'}
              </Text>
            </Layout.Horizontal>
            <Text color={Color.GREY_400} font={{ size: 'xsmall' }}>
              {getString('projectCard.ceRendererText').toUpperCase()}
            </Text>
          </Layout.Vertical>
        </Container>
      </Layout.Horizontal>
    </Container>
  )
}

export default CERenderer
