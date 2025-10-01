import jwt from 'jsonwebtoken'
import axios from 'axios'

type CreateMeetingParams = {
  topic: string
  startTimeIso: string
  durationMinutes: number
}

const ZOOM_ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID as string
const ZOOM_API_KEY = process.env.ZOOM_API_KEY as string
const ZOOM_API_SECRET = process.env.ZOOM_API_SECRET as string
const ZOOM_SDK_KEY = process.env.ZOOM_SDK_KEY as string
const ZOOM_SDK_SECRET = process.env.ZOOM_SDK_SECRET as string

function assertEnv() {
  if (!ZOOM_ACCOUNT_ID || !ZOOM_API_KEY || !ZOOM_API_SECRET || !ZOOM_SDK_KEY || !ZOOM_SDK_SECRET) {
    throw new Error('Missing Zoom credentials in environment')
  }
}

export async function createRealMeeting(params: CreateMeetingParams) {
  assertEnv()
  // Server-to-Server OAuth access token
  const tokenResp = await axios.post(
    'https://zoom.us/oauth/token',
    new URLSearchParams({ grant_type: 'account_credentials', account_id: ZOOM_ACCOUNT_ID }).toString(),
    {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${ZOOM_API_KEY}:${ZOOM_API_SECRET}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    }
  )

  const accessToken = tokenResp.data.access_token as string

  // Create a meeting for the account owner (me)
  const meetingResp = await axios.post(
    'https://api.zoom.us/v2/users/me/meetings',
    {
      topic: params.topic,
      type: 2, // scheduled
      start_time: params.startTimeIso,
      duration: params.durationMinutes,
      settings: {
        host_video: true,
        participant_video: true,
        waiting_room: true,
        join_before_host: false,
        approval_type: 2,
      },
    },
    { headers: { Authorization: `Bearer ${accessToken}` } }
  )

  const { id, password, join_url, start_url } = meetingResp.data
  return { meetingId: String(id), password, joinUrl: join_url, startUrl: start_url }
}

export function generateMeetingSdkSignature(meetingNumber: string, role: 0 | 1) {
  assertEnv()
  const iat = Math.floor(Date.now() / 1000) - 30
  const exp = iat + 60 * 2
  const payload = {
    appKey: ZOOM_SDK_KEY,
    sdkKey: ZOOM_SDK_KEY,
    mn: meetingNumber,
    role,
    iat,
    exp,
    tokenExp: exp,
  }

  const signature = jwt.sign(payload as any, ZOOM_SDK_SECRET, { algorithm: 'HS256' })
  return signature
}

export const getSdkKey = () => {
  assertEnv()
  return ZOOM_SDK_KEY
}

