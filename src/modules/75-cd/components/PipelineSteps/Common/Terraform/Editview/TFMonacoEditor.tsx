import React from 'react'
import { Dialog, Classes } from '@blueprintjs/core'
import { FormikProps, connect } from 'formik'
import { Button } from '@wings-software/uicore'

import { MonacoTextField } from '@common/components/MonacoTextField/MonacoTextField'
import css from './TFMonaco.module.scss'

export interface TFMonacoProps {
  formik: FormikProps<unknown>
  expressions?: string[]
  name: string
  title?: string
}

export function TFBackendConfigMonaco(props: TFMonacoProps): React.ReactElement {
  const [isFullScreen, setFullScreen] = React.useState(false)
  const { expressions = [] } = props
  const monaco = (
    <div className={css.monacoWrapper}>
      {isFullScreen ? null : (
        <Button
          className={css.expandBtn}
          icon="fullscreen"
          small
          onClick={() => setFullScreen(true)}
          iconProps={{ size: 10 }}
          type="button"
        />
      )}

      <MonacoTextField name={props.name} expressions={expressions} height={300} />
    </div>
  )
  return (
    <React.Fragment>
      {isFullScreen ? <div className={css.monacoWrapper} /> : monaco}
      <Dialog
        lazy
        isOpen={isFullScreen}
        isCloseButtonShown
        canOutsideClickClose={false}
        onClose={() => setFullScreen(false)}
        title={props.title}
        className={css.monacoDialog}
      >
        <div className={Classes.DIALOG_BODY}>{monaco}</div>
      </Dialog>
    </React.Fragment>
  )
}

export const TFMonaco = connect<TFMonacoProps>(TFBackendConfigMonaco)
