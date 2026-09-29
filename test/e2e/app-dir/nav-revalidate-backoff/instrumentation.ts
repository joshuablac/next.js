import type { Instrumentation } from 'next'
import { recordRequestError } from './control-state'

export const onRequestError: Instrumentation.onRequestError = async (
  _error,
  request,
  context
) => {
  recordRequestError({
    path: request.path,
    revalidateReason: context.revalidateReason,
  })
}
