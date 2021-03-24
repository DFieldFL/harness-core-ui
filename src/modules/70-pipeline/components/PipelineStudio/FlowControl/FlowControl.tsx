import React from 'react'
import cx from 'classnames'
import { v4 as nameSpace, v5 as uuid } from 'uuid'
import produce from 'immer'
import * as Yup from 'yup'
import { stringify } from 'yaml'
import { Icon, Accordion, Tag, Text, Formik } from '@wings-software/uicore'
import { set, debounce, cloneDeep } from 'lodash-es'
import { FieldArray } from 'formik'
import type { PipelineInfoConfig } from 'services/cd-ng'
import { String, useStrings } from 'framework/exports'
import { useGetBarriersSetupInfoList, StageDetail } from 'services/pipeline-ng'
import { useMutateAsGet } from '@common/hooks'
import { NameId } from '@common/components/NameIdDescriptionTags/NameIdDescriptionTags'
import { PipelineContext } from '../PipelineContext/PipelineContext'
import css from './FlowControl.module.scss'

const getErrors = (barriers: Barrier[], errorText: string): Barrier[] => {
  const errors: any[] = []
  const barrierValueMap: { [key: string]: { indexes: number[] } } = {}
  for (let index = 0; index < barriers.length; index++) {
    if (barrierValueMap[barriers[index].identifier]) {
      barrierValueMap[barriers[index].identifier].indexes.push(index)
    } else {
      barrierValueMap[barriers[index].identifier] = { indexes: [] }
    }
  }

  Object.values(barrierValueMap).map(({ indexes }: { indexes: number[] }) => {
    indexes.map((errIndex: number) => set(errors, `[${errIndex}].name`, errorText))
  })

  return errors
}

interface Barrier {
  identifier: string
  name: string
  id?: string
  mode?: 'ADD' | 'EDIT' | null
  stages?: StageDetail[]
}
interface BarrierListProps {
  list: Array<Barrier>
  pipeline: PipelineInfoConfig
  createItem: (push: (data: Barrier) => void) => void
  deleteItem: (index: number, remove: (a: number) => void) => void
  commitItem: (data: Barrier, index: number) => void
  updatePipeline: (pipeline: PipelineInfoConfig) => Promise<void>
}
export const FlowControl: React.FC = (): JSX.Element => {
  const {
    state: { pipeline, originalPipeline },
    updatePipeline
  } = React.useContext(PipelineContext)
  const [barriers, updateBarriers] = React.useState<Barrier[]>(pipeline?.flowControl?.barriers || [])

  const { data } = useMutateAsGet(useGetBarriersSetupInfoList, {
    body: (stringify({ pipeline: originalPipeline }) as unknown) as void,
    requestOptions: {
      headers: {
        'content-type': 'application/yaml'
      }
    },
    debounce: 800
  })
  React.useEffect(() => {
    if (data?.data) {
      const barrierInfoList = data?.data
      const newBarriers = cloneDeep(barriers)
      barrierInfoList.forEach(barrierInfo => {
        if (!barrierInfo.stages?.length) {
          return
        }
        const matchingIndex = newBarriers.findIndex(brr => brr.identifier === barrierInfo.identifier)
        if (matchingIndex > -1) {
          newBarriers[matchingIndex].stages = barrierInfo.stages
        }
      })
      updateBarriers(newBarriers)
    }
  }, [data?.data])
  const debouncedUpdatePipeline = React.useCallback(debounce(updatePipeline, 300), [updatePipeline])
  const addBarrier = (push: (data: Barrier) => void) => {
    const newBarrier: Barrier = {
      name: '',
      identifier: '',
      id: uuid('', nameSpace()),
      mode: 'ADD'
    }
    const updatedState: Barrier[] = [...barriers, newBarrier]
    push(newBarrier)
    updateBarriers(updatedState)
  }

  const commitBarrier = (barrierData: Barrier, index: number) => {
    if (!barrierData.name.length || !barrierData.identifier.length) {
      return
    }
    const updatedBarriers: Barrier[] = produce(barriers, draft => {
      draft[index] = {
        ...barrierData,
        mode: null
      }
    })
    updateBarriers(updatedBarriers)

    debouncedUpdatePipeline({
      ...pipeline,
      flowControl: {
        barriers: barriers.map(barrier => ({
          name: barrier.name,
          identifier: barrier.identifier
        }))
      }
    })
  }

  const deleteBarrier = (index: number, remove: (index: number) => void) => {
    const updatedBarriers: Barrier[] = produce(barriers, draft => {
      draft.splice(index, 1)
    })
    updateBarriers(updatedBarriers)
    remove(index)
    debouncedUpdatePipeline({
      ...pipeline,
      flowControl: {
        barriers: barriers.map(barrier => ({
          name: barrier.name,
          identifier: barrier.identifier
        }))
      }
    })
  }

  const { getString } = useStrings()
  return (
    <div className={css.container}>
      <div className={css.header}>
        <Icon name="settings" size={14} className={css.headerIcon} />

        <div className={css.gridColumn}>
          <String stringID="barriers.flowControl" className={css.title} />
          <span>
            {getString('total')} : {barriers.length}
          </span>
        </div>
      </div>
      <div>
        <Accordion activeId="syncBarriers">
          <Accordion.Panel
            id="syncBarriers"
            summary={getString('barriers.syncBarriers')}
            details={
              <BarrierList
                list={barriers}
                pipeline={pipeline}
                createItem={addBarrier}
                deleteItem={deleteBarrier}
                commitItem={commitBarrier}
                updatePipeline={debouncedUpdatePipeline}
              />
            }
          />
        </Accordion>
      </div>
    </div>
  )
}

const BarrierList: React.FC<BarrierListProps> = ({
  list,
  createItem,
  deleteItem,
  commitItem,
  updatePipeline,
  pipeline
}): JSX.Element => {
  return (
    <Formik
      initialValues={{ barriers: list }}
      onSubmit={value => {
        console.log(value) //eslint-disable-line
      }}
      validate={({ barriers }: { barriers: Barrier[] }) => {
        const errors: any = { barriers: [] }
        const identifierErrors = getErrors(barriers, 'Duplicate Identifier')

        if (identifierErrors.length) {
          errors.barriers = identifierErrors
        } else {
          updatePipeline({
            ...pipeline,
            flowControl: {
              barriers: barriers.map(barrier => ({
                name: barrier.name,
                identifier: barrier.identifier
              }))
            }
          })
        }
        return errors
      }}
      validationSchema={Yup.object().shape({
        barriers: Yup.array().of(
          Yup.object().shape({
            name: Yup.string().required('Enter name of barrier'),
            identifier: Yup.string().required('Duplicate  identifier')
          })
        )
      })}
    >
      {formik => (
        <FieldArray
          name="barriers"
          render={({ push, remove }) => {
            return (
              <div>
                <div className={css.barrierList}>
                  {list.map((barrier: Barrier, index) =>
                    !barrier.mode ? (
                      <div className={css.rowItem} key={barrier.id}>
                        <div>
                          <Text lineClamp={1} className={css.rowHeader}>
                            {barrier.name}
                          </Text>
                          <Text lineClamp={1}>{barrier.identifier}</Text>
                        </div>
                        <div>
                          {barrier.stages?.map((stage: StageDetail) => (
                            <Tag className={cx(css.tag, css.spaceRight)} key={stage.name}>
                              {stage.name}
                            </Tag>
                          ))}
                        </div>
                        <div>
                          <Icon
                            name="bin-main"
                            size={20}
                            className={css.deleteIcon}
                            onClick={() => deleteItem(index, remove)}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className={css.rowItem} key={barrier.id}>
                        <div className={css.newBarrier}>
                          {barrier.name} <br />
                          <NameId
                            nameLabel="Barrier Name"
                            identifierProps={{
                              inputName: `barriers[${index}].name`,
                              idName: `barriers[${index}].identifier`,
                              inputGroupProps: {
                                inputGroup: {
                                  onBlur: () =>
                                    !formik.errors?.barriers?.[index] &&
                                    commitItem(formik.values.barriers[index], index)
                                }
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Icon
                            name="bin-main"
                            size={20}
                            className={css.deleteIcon}
                            onClick={() => deleteItem(index, remove)}
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
                <span className={css.addLink} onClick={() => createItem(push)}>
                  <String stringID="barriers.addBarrier" />
                </span>
              </div>
            )
          }}
        />
      )}
    </Formik>
  )
}
