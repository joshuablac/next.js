import { NextResponse } from 'next/server'
import {
  getRenderCount,
  getRequestErrors,
  reset,
  setFailing,
} from '../../control-state'

export async function GET() {
  return NextResponse.json({
    renders: getRenderCount(),
    requestErrors: getRequestErrors(),
  })
}

export async function POST(request: Request) {
  const body = await request.json()
  if (body.reset) {
    reset()
  }
  if (typeof body.fail === 'boolean') {
    setFailing(body.fail)
  }
  return NextResponse.json({
    renders: getRenderCount(),
    requestErrors: getRequestErrors(),
  })
}
