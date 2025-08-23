import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  MessageSquare,
  Brain,
  Maximize,
  Minimize
} from 'lucide-react';

interface VideoCallProps {
  consultationId: number;
  patientId: number;
  doctorId: number;
  userType: 'patient' | 'doctor' | 'admin';
  onCallEnd?: () => void;
}

const VideoCall: React.FC<VideoCallProps> = ({
  consultationId,
  // patientId,
  // doctorId,
  userType,
  onCallEnd
}) => {
  // State management
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [chatMessages, setChatMessages] = useState<{
    id: number;
    sender: string;
    text: string;
    timestamp: string;
  }[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [aiInsights, setAiInsights] = useState<{
    type: string;
    content: string;
    timestamp: string;
  }[]>([]);
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatInputRef = useRef<HTMLInputElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize call on component mount
  useEffect(() => {
    initializeCall();
    startCallTimer();
    
    return () => {
      endCall();
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [endCall]);

  // Auto-hide controls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (showControls) {
        setShowControls(false);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [showControls]);

  const initializeCall = async () => {
    try {
      // Initialize video call (would integrate with WebRTC, Agora, Twilio, etc.)
      setConnectionStatus('connected');
      
      // Mock participants data is not stored in state

      // Get user media (camera/microphone)
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

    } catch (error) {
      console.error('Error initializing call:', error);
      setConnectionStatus('error');
    }
  };

  const startCallTimer = () => {
    callTimerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // In real implementation, would control video stream
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    // In real implementation, would control audio stream
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    // In real implementation, would start screen sharing
  };

  const toggleRecording = async () => {
    try {
      if (!isRecording) {
        // Start recording
        await fetch(`/api/telemedicine/video/record-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consultationId,
            action: 'start',
            recordingSettings: { quality: 'hd', includeTranscript: true }
          })
        });
        setIsRecording(true);
      } else {
        // Stop recording
        await fetch(`/api/telemedicine/video/record-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            consultationId,
            action: 'stop'
          })
        });
        setIsRecording(false);
      }
    } catch (error) {
      console.error('Error toggling recording:', error);
    }
  };

  const endCall = useCallback(async () => {
    try {
      // End the video call session
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
      
      // Clean up streams
      if (localVideoRef.current?.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }

      onCallEnd?.();
    } catch (error) {
      console.error('Error ending call:', error);
    }
  }, [onCallEnd]);

  const sendChatMessage = () => {
    if (chatInputRef.current?.value) {
      const message = {
        id: Date.now(),
        sender: userType,
        text: chatInputRef.current.value,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, message]);
      chatInputRef.current.value = '';
    }
  };

  const getAIInsights = async () => {
    try {
      const response = await fetch(`/api/telemedicine/consultations/${consultationId}/ai-support`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSymptoms: ['fever', 'headache'], // Would be dynamic
          vitalSigns: { heartRate: 75, temperature: 37.2 },
          patientInteraction: 'active',
          environmentalData: {}
        })
      });
      
      const data = await response.json();
      setAiInsights(data.aiSupport ? [data.aiSupport] : []);
    } catch (error) {
      console.error('Error getting AI insights:', error);
    }
  };

  return (
    <div className={`relative h-screen bg-gray-900 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Video Streams */}
      <div className="relative h-full flex">
        {/* Remote Video (Main) */}
        <div className="flex-1 relative">
          <video
            ref={remoteVideoRef}
            className="w-full h-full object-cover bg-gray-800"
            autoPlay
            playsInline
          />
          
          {/* Connection Status */}
          <div className="absolute top-4 left-4">
            <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
              connectionStatus === 'connected' 
                ? 'bg-green-500 text-white' 
                : connectionStatus === 'connecting'
                ? 'bg-yellow-500 text-white'
                : 'bg-red-500 text-white'
            }`}>
              <div className="w-2 h-2 rounded-full bg-current mr-2 animate-pulse"></div>
              {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </div>
          </div>

          {/* Call Duration */}
          <div className="absolute top-4 right-4">
            <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm font-mono">
              {formatDuration(callDuration)}
            </div>
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center">
                <div className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse"></div>
                Recording
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute bottom-20 right-4 w-64 h-48 bg-gray-800 rounded-lg overflow-hidden border-2 border-white shadow-lg">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
          {!isVideoOn && (
            <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
              <VideoOff size={32} className="text-white" />
            </div>
          )}
        </div>

        {/* Side Panel (Chat/AI) */}
        {(showChat || showAI) && (
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            exit={{ x: 400 }}
            className="w-96 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 flex flex-col"
          >
            {/* Panel Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {showChat ? 'Chat' : 'AI Insights'}
                </h3>
                <button
                  onClick={() => {
                    setShowChat(false);
                    setShowAI(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Chat Content */}
            {showChat && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === userType ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg ${
                          message.sender === userType
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <p className="text-xs opacity-75 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <input
                      ref={chatInputRef}
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                    />
                    <button
                      onClick={sendChatMessage}
                      className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* AI Insights Content */}
            {showAI && (
              <div className="flex-1 overflow-y-auto p-4">
                <button
                  onClick={getAIInsights}
                  className="w-full mb-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <Brain size={18} className="mr-2" />
                  Generate AI Insights
                </button>
                
                {aiInsights.length > 0 ? (
                  <div className="space-y-4">
                    {aiInsights.map((insight, index) => (
                      <div key={index} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                          AI Analysis
                        </h4>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <p>Processing consultation data...</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Brain size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-500">No AI insights generated yet</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: showControls ? 1 : 0 }}
        className="absolute bottom-0 left-0 right-0 p-4"
        onMouseEnter={() => setShowControls(true)}
      >
        <div className="flex items-center justify-center space-x-4 bg-black bg-opacity-70 rounded-full px-8 py-4 mx-auto w-fit">
          {/* Video Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              isVideoOn 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isVideoOn ? <Video size={24} /> : <VideoOff size={24} />}
          </motion.button>

          {/* Audio Toggle */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleAudio}
            className={`p-3 rounded-full ${
              isAudioOn 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isAudioOn ? <Mic size={24} /> : <MicOff size={24} />}
          </motion.button>

          {/* Screen Share */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleScreenShare}
            className={`p-3 rounded-full ${
              isScreenSharing 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <Monitor size={24} />
          </motion.button>

          {/* Recording */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleRecording}
            className={`p-3 rounded-full ${
              isRecording 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <div className={`w-6 h-6 ${isRecording ? 'bg-white rounded-sm' : 'border-2 border-white rounded-full'}`} />
          </motion.button>

          {/* Chat */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setShowChat(!showChat);
              setShowAI(false);
            }}
            className={`p-3 rounded-full ${
              showChat 
                ? 'bg-primary-600 text-white hover:bg-primary-700' 
                : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <MessageSquare size={24} />
          </motion.button>

          {/* AI Insights */}
          {userType === 'doctor' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                setShowAI(!showAI);
                setShowChat(false);
              }}
              className={`p-3 rounded-full ${
                showAI 
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              <Brain size={24} />
            </motion.button>
          )}

          {/* End Call */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={endCall}
            className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700"
          >
            <PhoneOff size={24} />
          </motion.button>

          {/* Fullscreen */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-3 rounded-full bg-gray-700 text-white hover:bg-gray-600"
          >
            {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
          </motion.button>
        </div>
      </motion.div>

      {/* Click to show controls */}
      {!showControls && (
        <div
          className="absolute inset-0 cursor-pointer"
          onClick={() => setShowControls(true)}
        />
      )}
    </div>
  );
};

export default VideoCall;
