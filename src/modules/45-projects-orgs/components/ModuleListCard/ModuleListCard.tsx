import React from 'react'
import { Card, Color, Container, Icon, Layout, Text } from '@wings-software/uicore'
import { useHistory } from 'react-router-dom'
import { getModuleIcon } from '@common/utils/utils'
import { getModulePurpose, getModuleTitle } from '@projects-orgs/utils/utils'
import { useStrings } from 'framework/strings'

import { ModuleName } from 'framework/types/ModuleName'
import routes from '@common/RouteDefinitions'
import css from './ModuleListCard.module.scss'

interface ModuleListCardProps {
  module: ModuleName
  orgIdentifier: string
  projectIdentifier: string
  accountId: string
}

const ModuleListCard: React.FC<ModuleListCardProps> = ({ module, accountId, orgIdentifier, projectIdentifier }) => {
  const { getString } = useStrings()
  const history = useHistory()

  const getModuleLink = (): string => {
    switch (module) {
      case ModuleName.CD:
        return routes.toProjectOverview({
          projectIdentifier,
          orgIdentifier,
          accountId,
          module: 'cd'
        })
      case ModuleName.CI:
        return routes.toProjectOverview({
          projectIdentifier,
          orgIdentifier,
          accountId,
          module: 'ci'
        })
      case ModuleName.CV:
        return routes.toCVProjectOverview({
          projectIdentifier,
          orgIdentifier,
          accountId
        })
      case ModuleName.CF:
        return routes.toCFFeatureFlags({
          projectIdentifier,
          orgIdentifier,
          accountId
        })
      case ModuleName.CE:
        return routes.toCEOverview({ accountId })
    }
    return ''
  }

  return (
    <>
      <Card className={css.card} interactive onClick={() => history.push(getModuleLink())}>
        <Layout.Horizontal>
          <Container width="100%" flex border={{ right: true, color: Color.WHITE }}>
            <Layout.Horizontal flex spacing="large">
              <Icon name={getModuleIcon(module)} size={70}></Icon>
              <div>
                <Layout.Vertical padding={{ bottom: 'medium' }}>
                  <Text font={{ size: 'small' }}>{getString(getModuleTitle(module))}</Text>
                  <Text font={{ size: 'medium' }} color={Color.BLACK}>
                    {getModulePurpose(module)}
                  </Text>
                </Layout.Vertical>
              </div>
            </Layout.Horizontal>
          </Container>
        </Layout.Horizontal>
      </Card>
    </>
  )
}

export default ModuleListCard
