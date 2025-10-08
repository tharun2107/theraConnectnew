import React, { useState } from 'react'
import { Button } from './ui/button'
import { 
  Mic, 
  MicOff, 
  Video, 
  VideoOff, 
  Phone, 
  PhoneOff, 
  Settings, 
  Users, 
  MessageSquare,
  Share2,
  Monitor,
  Grid3X3,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  MoreHorizontal,
  MonitorSpeaker
} from 'lucide-react'

interface VideoControlsProps {
  isMuted: boolean
  isVideoOff: boolean
  isFullscreen: boolean
  participants: number
  onToggleMute: () => void
  onToggleVideo: () => void
  onToggleFullscreen: () => void
  onEndCall: () => void
  onShareScreen?: () => void
  onToggleChat?: () => void
  onToggleParticipants?: () => void
  onShowSettings?: () => void
  isHost?: boolean
}

const VideoControls: React.FC<VideoControlsProps> = ({
  isMuted,
  isVideoOff,
  isFullscreen,
  participants,
  onToggleMute,
  onToggleVideo,
  onToggleFullscreen,
  onEndCall,
  onShareScreen,
  onToggleChat,
  onToggleParticipants,
  onShowSettings,
  isHost = false
}) => {
  const [showMoreOptions, setShowMoreOptions] = useState(false)

  const primaryControls = [
    {
      icon: isMuted ? MicOff : Mic,
      label: isMuted ? 'Unmute' : 'Mute',
      onClick: onToggleMute,
      variant: isMuted ? 'destructive' : 'secondary',
      className: 'h-12 w-12 rounded-full'
    },
    {
      icon: isVideoOff ? VideoOff : Video,
      label: isVideoOff ? 'Turn on video' : 'Turn off video',
      onClick: onToggleVideo,
      variant: isVideoOff ? 'destructive' : 'secondary',
      className: 'h-12 w-12 rounded-full'
    }
  ]

  const secondaryControls = [
    {
      icon: MessageSquare,
      label: 'Chat',
      onClick: onToggleChat,
      variant: 'secondary' as const,
      className: 'h-10 w-10 rounded-full'
    },
    {
      icon: Users,
      label: 'Participants',
      onClick: onToggleParticipants,
      variant: 'secondary' as const,
      className: 'h-10 w-10 rounded-full'
    },
    {
      icon: Grid3X3,
      label: 'Gallery View',
      onClick: () => {},
      variant: 'secondary' as const,
      className: 'h-10 w-10 rounded-full'
    }
  ]

  const hostControls = isHost ? [
    {
      icon: Share2,
      label: 'Share Screen',
      onClick: onShareScreen,
      variant: 'secondary' as const,
      className: 'h-10 w-10 rounded-full'
    },
    {
      icon: MonitorSpeaker,
      label: 'Share Audio',
      onClick: () => {},
      variant: 'secondary' as const,
      className: 'h-10 w-10 rounded-full'
    }
  ] : []

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-4">
      <div className="flex items-center justify-center space-x-4">
        {/* Primary Controls */}
        {primaryControls.map((control, index) => (
          <Button
            key={index}
            variant={control.variant as any}
            size="icon"
            onClick={control.onClick}
            className={control.className}
            title={control.label}
          >
            <control.icon className="h-6 w-6" />
          </Button>
        ))}

        {/* Secondary Controls */}
        {secondaryControls.map((control, index) => (
          <Button
            key={index}
            variant={control.variant}
            size="icon"
            onClick={control.onClick}
            className={control.className}
            title={control.label}
          >
            <control.icon className="h-5 w-5" />
          </Button>
        ))}

        {/* Host Controls */}
        {hostControls.map((control, index) => (
          <Button
            key={index}
            variant={control.variant}
            size="icon"
            onClick={control.onClick}
            className={control.className}
            title={control.label}
          >
            <control.icon className="h-5 w-5" />
          </Button>
        ))}

        {/* More Options */}
        <div className="relative">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="h-10 w-10 rounded-full"
            title="More options"
          >
            <MoreHorizontal className="h-5 w-5" />
          </Button>
          
          {showMoreOptions && (
            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onShowSettings?.()
                  setShowMoreOptions(false)
                }}
                className="w-full justify-start"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  onToggleFullscreen()
                  setShowMoreOptions(false)
                }}
                className="w-full justify-start"
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4 mr-2" /> : <Maximize2 className="h-4 w-4 mr-2" />}
                {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              </Button>
            </div>
          )}
        </div>

        {/* End Call */}
        <Button
          variant="destructive"
          size="icon"
          onClick={onEndCall}
          className="h-12 w-12 rounded-full"
          title="End call"
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
      </div>

      {/* Participant Count */}
      <div className="absolute top-2 left-4 flex items-center space-x-2 text-sm text-gray-400">
        <Users className="h-4 w-4" />
        <span>{participants} participants</span>
      </div>
    </div>
  )
}

export default VideoControls
