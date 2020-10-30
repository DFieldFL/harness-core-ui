import type { IconName } from '@wings-software/uikit'
import { StepType } from '../../PipelineStepInterface'
import i18n from './RedisService.i18n'
import { CommonService, CommonServiceData } from '../CommonService/CommonService'

export class RedisService extends CommonService {
  protected type = StepType.Redis
  protected stepName = i18n.redis
  protected stepIcon: IconName = 'service-redis'

  protected defaultValues: CommonServiceData = {
    identifier: '',
    type: 'service',
    spec: {
      image: 'redis:latest'
    }
  }
}
