import React from 'react'
import { Button } from './ui/button'
import { PhoneOff } from 'lucide-react'

interface VideoControlsProps {
  onEndCall: () => void
  participants: number
}

/**
 * Simplified Video Controls - Only the End Call button
 * All other controls (mic, video, chat, etc.) are handled by Zoom SDK's built-in controls
 */
const VideoControls: React.FC<VideoControlsProps> = ({
  onEndCall,
  participants
}) => {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 p-4 z-10">
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Participant Count */}
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <span>{participants} participants</span>
        </div>

        {/* End Call Button - This triggers the feedback form */}
        <Button
          variant="destructive"
          size="lg"
          onClick={onEndCall}
          className="h-14 w-14 rounded-full bg-red-600 hover:bg-red-700"
          title="End call and provide feedback"
        >
          <PhoneOff className="h-7 w-7" />
        </Button>
      </div>
    </div>
  )
}

export default VideoControls