import React, { useState } from 'react'
import { useModalHook, Button, Container, Text, Color } from '@wings-software/uicore'
import { Dialog, IDialogProps } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import { removeErrorCode } from '@connectors/pages/connectors/utils/ConnectorUtils'
import type { ConnectorValidationResult } from 'services/cd-ng'
import css from './useTestConnectionErrorModal.module.scss'

export interface UseTestConnectionErrorModalProps {
  onClose?: () => void
}

export interface UseTestConnectionErrorModalReturn {
  openErrorModal: (error: ConnectorValidationResult) => void
  hideErrorModal: () => void
}
const modalProps: IDialogProps = {
  isOpen: true,
  style: {
    width: 750,
    minHeight: 350,
    borderLeft: 0,
    paddingBottom: 0,
    position: 'relative',
    overflow: 'hidden'
  }
}

const useTestConnectionErrorModal = (props: UseTestConnectionErrorModalProps): UseTestConnectionErrorModalReturn => {
  const [error, setError] = useState<ConnectorValidationResult>()

  const { getString } = useStrings()

  const [showModal, hideModal] = useModalHook(
    () => (
      <Dialog {...modalProps}>
        <Container height={'100%'} padding="xxlarge">
          <Text font={{ size: 'medium' }} color={Color.BLACK}>
            {getString('errorDetails')}
          </Text>
          <Container padding={{ top: 'large' }}>
            <Text
              icon={'error'}
              iconProps={{ color: Color.RED_500 }}
              color={Color.GREY_900}
              lineClamp={1}
              font={{ size: 'small', weight: 'semi-bold' }}
              margin={{ top: 'small', bottom: 'small' }}
            >
              {error?.errorSummary}
            </Text>
            <div className={css.errorMsg}>
              <pre>{JSON.stringify({ errors: removeErrorCode(error?.errors) }, null, ' ')}</pre>
            </div>
          </Container>
        </Container>
        <Button
          minimal
          icon="cross"
          iconProps={{ size: 18 }}
          onClick={() => {
            props.onClose?.()
            hideModal()
          }}
          className={css.crossIcon}
        />
      </Dialog>
    ),
    [error]
  )

  return {
    openErrorModal: (_error: ConnectorValidationResult) => {
      setError(_error)
      showModal()
    },
    hideErrorModal: hideModal
  }
}

export default useTestConnectionErrorModal
