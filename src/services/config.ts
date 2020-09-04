import qs from 'qs'

export const getConfig = (str: string): string => {
  return window.location.pathname.replace('ng/', '') + str
}
export interface GetUsingFetchProps<
  _TData = any,
  _TError = any,
  TQueryParams = {
    [key: string]: any
  },
  TPathParams = {
    [key: string]: any
  }
> {
  queryParams?: TQueryParams
  pathParams?: TPathParams
  requestOptions?: RequestInit
}

export const getUsingFetch = <
  TData = any,
  _TError = any,
  TQueryParams = {
    [key: string]: any
  },
  TPathParams = {
    [key: string]: any
  }
>(
  base: string,
  path: string,
  props: { queryParams?: TQueryParams; pathParams?: TPathParams; requestOptions?: RequestInit },
  signal?: RequestInit['signal']
): Promise<TData> => {
  let url = base + path
  if (props.queryParams && Object.keys(props.queryParams).length) {
    url += `?${qs.stringify(props.queryParams)}`
  }
  return fetch(url, {
    headers: {
      'content-type': 'application/json'
    },
    signal,
    ...(props.requestOptions || {})
  }).then(res => {
    if (res.headers.get('content-type')?.toLowerCase() === 'application/json'.toLowerCase()) {
      return res.json()
    }
    return res.text()
  })
}

export interface MutateUsingFetchProps<
  _TData = any,
  _TError = any,
  TQueryParams = {
    [key: string]: any
  },
  TRequestBody = any,
  TPathParams = {
    [key: string]: any
  }
> {
  body: TRequestBody
  queryParams?: TQueryParams
  pathParams?: TPathParams
  requestOptions?: RequestInit
}

export const mutateUsingFetch = <
  TData = any,
  _TError = any,
  TQueryParams = {
    [key: string]: any
  },
  TRequestBody = any,
  TPathParams = {
    [key: string]: any
  }
>(
  method: string,
  base: string,
  path: string,
  props: {
    body: TRequestBody
    queryParams?: TQueryParams
    pathParams?: TPathParams
    requestOptions?: RequestInit
  },
  signal?: RequestInit['signal']
): Promise<TData> => {
  let url = base + path
  if (method === 'DELETE' && typeof props.body === 'string') {
    url += `/${props.body}`
  }
  if (props.queryParams && Object.keys(props.queryParams).length) {
    url += `?${qs.stringify(props.queryParams)}`
  }

  let body: BodyInit | null = null

  if (props.body instanceof FormData) {
    body = props.body
  } else if (typeof props.body === 'object') {
    try {
      body = JSON.stringify(props.body)
    } catch {
      body = props.body as any
    }
  } else {
    body = props.body as any
  }

  return fetch(url, {
    method,
    body,
    headers: {
      'content-type': 'application/json'
    },
    signal,
    ...(props.requestOptions || {})
  }).then(res => {
    if (res.headers.get('content-type')?.toLowerCase() === 'application/json'.toLowerCase()) {
      return res.json()
    }
    return res.text()
  })
}
