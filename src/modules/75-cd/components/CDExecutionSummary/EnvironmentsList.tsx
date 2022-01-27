/*
 * Copyright 2022 Harness Inc. All rights reserved.
 * Use of this source code is governed by the PolyForm Shield 1.0.0 license
 * that can be found in the licenses directory at the root of this repository, also available at
 * https://polyformproject.org/wp-content/uploads/2020/06/PolyForm-Shield-1.0.0.txt.
 */

import React from 'react'
import { Popover, Position } from '@blueprintjs/core'
import { Icon, Layout, Text, FontVariation } from '@wings-software/uicore'
import cx from 'classnames'
import { String } from 'framework/strings'
import css from './CDExecutionSummary.module.scss'

interface EnvironmentsListProps {
  environments: string[]
  className?: string
  limit?: number
}

export function EnvironmentsList({ environments, limit = 2, className }: EnvironmentsListProps): React.ReactElement {
  return (
    <div className={cx(css.main, className)}>
      {environments.length > 0 ? (
        <>
          <div className={css.environments}>
            <Icon name="environments" className={css.envIcon} size={14} />
            <Text>{environments.slice(0, limit).join(', ')}</Text>
          </div>
          {environments.length > limit ? (
            <>
              ,&nbsp;
              <Popover
                wrapperTagName="div"
                targetTagName="div"
                interactionKind="hover"
                position={Position.RIGHT}
                className={css.serviceWrapper}
              >
                <String
                  tagName="div"
                  className={cx(css.serviceName, css.count)}
                  stringID={'common.plusNumberNoSpace'}
                  vars={{ number: Math.abs(environments.length - limit) }}
                />
                <Layout.Vertical padding="small">
                  {environments.slice(limit).map((environment, index) => (
                    <Text font={{ variation: FontVariation.FORM_LABEL }} key={index}>
                      {environment}
                    </Text>
                  ))}
                </Layout.Vertical>
              </Popover>
            </>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
