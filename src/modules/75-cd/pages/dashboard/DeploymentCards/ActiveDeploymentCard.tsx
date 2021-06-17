import React from 'react'
import { Icon, Color } from '@wings-software/uicore'
import ActiveBuildCard from '@pipeline/components/Dashboards/BuildCards/ActiveBuildCard'
import { mapActiveCardStatus } from '@pipeline/components/Dashboards/shared'
import styles from '../CDDashboardPage.module.scss'

export interface ActiveDeploymentCardProps {
  name: string
  status?: string
  serviceInfoList: any
}

export default function ActiveDeploymentCard({ name, status, serviceInfoList }: any) {
  return (
    <ActiveBuildCard
      title={name}
      icon={<Icon name="cd" size={25} color={Color.PRIMARY_5} className={styles.cdCustomIcon} />}
      message={serviceInfoList?.map((s: any, i: any) => (
        <span key={i} className={styles.serviceTag}>
          <Icon size={10} name={'services' as any} />
          {`${s.serviceName}${s.servicetag ? ' (' + s.serviceTag + ')' : ''}`}
        </span>
      ))}
      status={mapActiveCardStatus(status)}
    />
  )
}
