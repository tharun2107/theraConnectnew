import React, { useEffect, useRef, useState } from 'react'
import { bookingAPI } from '../lib/api'

type Props = {
  bookingId: string
}

declare global {
  interface Window {
    ZoomMtgEmbedded?: any
  }
}

const ZoomMeeting: React.FC<Props> = ({ bookingId }) => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function ensureZoomModule(): Promise<any> {
      // Prefer local npm module over CDN to avoid network/CSP failures
      try {
        console.log('[ZoomMeeting] importing @zoom/meetingsdk/embedded')
        const mod = await import('@zoom/meetingsdk/embedded')
        // Rely on global CSS from index.html; no CSS import here to avoid bundler resolution issues across versions
        return mod?.default || mod
      } catch (e1) {
        console.warn('[ZoomMeeting] fallback to @zoomus/websdk/embedded', e1)
        const mod = await import('@zoomus/websdk/embedded')
        // Rely on global CSS from index.html
        return mod?.default || mod
      }
    }

    async function join() {
      try {
        setJoining(true)
        console.log('[ZoomMeeting] fetching signature for booking', bookingId)
        const { data } = await bookingAPI.getSignature(bookingId)
        console.log('[ZoomMeeting] signature response', data)

        const ZoomMtgEmbedded = await ensureZoomModule()
        const client = ZoomMtgEmbedded.createClient()
        console.log('[ZoomMeeting] initializing client')
       // await client.init({ zoomAppRoot: containerRef.current!, language: 'en-US' })
       await client.init({
        zoomAppRoot: containerRef.current,
        language: 'en-US',
        customize: {
          video: {
            isResizable: false,
            viewSizes: {
              default: {
                width: 900,    // Set your desired width in px
                height: 600    // Set your desired height in px
              }
            }
          }
        }
      })
      
        console.log('[ZoomMeeting] joining meeting', data.meetingNumber)
        await client.join({
          signature: data.signature,
          sdkKey: data.sdkKey,
          meetingNumber: data.meetingNumber,
          password: data.password,
          userName: 'Therabee User',
        })
        console.log('[ZoomMeeting] join success')
      } catch (e: any) {
        console.error('[ZoomMeeting] join error', e)
        if (!cancelled) setError(e?.response?.data?.message || e.message || 'Failed to join meeting')
      } finally {
        setJoining(false)
      }
    }

    join()
    return () => {
      cancelled = true
    }
  }, [bookingId])

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>
  }
  return (
    <div>
      {joining && <div className="p-2">Connecting to meeting...</div>}
      <div ref={containerRef} style={{ width: '100%', height: '80vh' }} />
    </div>
  )
}

export default ZoomMeeting


