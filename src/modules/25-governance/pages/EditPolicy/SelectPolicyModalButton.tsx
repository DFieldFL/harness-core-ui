/* eslint-disable react/display-name,react-hooks/rules-of-hooks */
import React, { useMemo } from 'react'
import type { CellProps, Column } from 'react-table'
import { get } from 'lodash-es'
import {
  Button,
  useModalHook,
  ButtonProps,
  ButtonVariation,
  Text,
  FontVariation,
  Container,
  PageError
} from '@wings-software/uicore'
import { Dialog } from '@blueprintjs/core'
import { useStrings } from 'framework/strings'
import Table from '@common/components/Table/Table'
import { useGetexamples, Example } from 'services/pm'
import { ContainerSpinner } from '@common/components/ContainerSpinner/ContainerSpinner'
import { getErrorMessage } from '@governance/utils/GovernanceUtils'

export interface SelectPolicyModalButtonProps {
  modalTitle: string
  onApply: (example: Example) => void
}

export const SelectPolicyModalButton: React.FC<SelectPolicyModalButtonProps & ButtonProps> = ({
  modalTitle,
  onApply,
  ...props
}) => {
  const [openModal, hideModal] = useModalHook(() => {
    const { data: examples, loading, error, refetch } = useGetexamples({})
    const { getString } = useStrings()

    const columns: Column<Example>[] = useMemo(
      () => [
        {
          Header: getString('common.policy.table.name'),
          accessor: item => get(item, 'name') || item.type,
          width: '70%',
          Cell: ({ row }: CellProps<Example>) => (
            <Text
              icon="governance"
              iconProps={{ padding: { right: 'small' } }}
              font={{ variation: FontVariation.BODY2 }}
            >
              {get(row, 'name') || row.original.type}
            </Text>
          )
        },
        {
          Header: getString('typeLabel'),
          accessor: item => item.type,
          width: '30%',
          Cell: ({ row }: CellProps<Example>) => (
            <Text font={{ variation: FontVariation.BODY2 }}>{row.original.type}</Text>
          )
        }
      ],
      [getString]
    )

    return (
      <Dialog
        isOpen
        enforceFocus={false}
        onClose={() => {
          hideModal()
        }}
        title={modalTitle}
        style={{ padding: 'none', width: 900 }}
      >
        <Container padding="medium" style={{ height: 500, overflow: 'auto' }}>
          {loading && <ContainerSpinner />}
          {error && <PageError message={getErrorMessage(error)} onClick={() => refetch()} />}
          {!error && !loading && examples && (
            <Table<Example>
              columns={columns}
              data={examples || []}
              onRowClick={example => {
                onApply(example)
                hideModal()
              }}
            />
          )}
        </Container>
      </Dialog>
    )
  }, [modalTitle, onApply])

  return <Button icon="folder-shared" variation={ButtonVariation.ICON} onClick={openModal} {...props} />
}
