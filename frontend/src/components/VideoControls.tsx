import React, { useState } from 'react'
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
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="bg-gray-900 border-t border-gray-700 p-2 sm:p-4 z-10" style={{ margin: 0, padding: '12px 16px' }}>
      <div className="flex items-center justify-between max-w-4xl mx-auto gap-2">
        {/* Participant Count */}
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-300">
          <span>{participants} participants</span>
        </div>

        {/* End Call Button - This triggers the feedback form */}
        <div className="relative">
          <Button
            variant="destructive"
            size="lg"
            onClick={onEndCall}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="h-12 sm:h-14 px-4 sm:px-6 rounded-full bg-red-600 hover:bg-red-700 flex items-center gap-2 sm:gap-3 transition-all"
            title="End call and provide feedback"
          >
            <PhoneOff className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <span className="text-sm sm:text-base font-semibold whitespace-nowrap">End Call</span>
          </Button>
          
          {/* Tooltip on hover */}
          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-2 bg-gray-800 text-white text-xs sm:text-sm px-3 py-2 rounded-lg shadow-lg whitespace-nowrap z-20 animate-fade-in">
              <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
              Click to end the call and provide feedback
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default VideoControls