import React, { useState, useRef, useEffect } from 'react';

interface VideoShowcaseProps {
  variant?: 'landing' | 'portal';
  title?: string;
  subtitle?: string;
  defaultSrc?: string;
  poster?: string;
  className?: string;
}

export const VideoShowcase: React.FC<VideoShowcaseProps> = ({
  variant = 'landing',
  title = 'Akim Asafo SHS • Digital Showcase & Campus Tour',
  subtitle = 'Discover academic excellence, disciplined leadership, and modern digital learning at ASASHS.',
  defaultSrc = '/asashs-launch.mp4',
  poster = '/hero_school_building.jpg',
  className = '',
}) => {
  const [videoSrc, setVideoSrc] = useState<string>(defaultSrc);
  const [hasCustomVideo, setHasCustomVideo] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const controlsTimeoutRef = useRef<any>(null);

  const showcaseSlides = [
    {
      image: '/hero_school_building.jpg',
      caption: 'Akim Asafo SHS Permanent Campus • Est. 1991',
      tag: 'Campus Architecture'
    },
    {
      image: '/students_campus.jpg',
      caption: 'Holistic Education & Scholar Collaboration',
      tag: 'Student Life'
    },
    {
      image: '/administration.jpg',
      caption: 'Committed Governance & Academic Leadership',
      tag: 'Administration'
    },
    {
      image: '/nsmq_2025.jpg',
      caption: 'National Science & Maths Quiz Competitors',
      tag: 'Academic Rigour'
    }
  ];

  // Ken Burns slideshow rotation when video is not playing
  useEffect(() => {
    if (isPlaying && !videoError) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % showcaseSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, videoError, showcaseSlides.length]);

  // Handle local file selection from device
  const handleDeviceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const blobUrl = URL.createObjectURL(file);
      setVideoSrc(blobUrl);
      setHasCustomVideo(true);
      setVideoError(false);
      setIsLoaded(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
        }
      }, 200);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setVideoError(false);
        })
        .catch(() => {
          // If default video does not exist yet
          setVideoError(true);
        });
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoaded(true);
      setVideoError(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const seekTime = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  // Variant: Portal (Compact, integrated into student dashboard)
  if (variant === 'portal') {
    return (
      <div className={`bg-white rounded-md border border-gray-200 overflow-hidden shadow-sm ${className}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-gray-50 to-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-sm bg-school-green-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 leading-tight">School Tour & Showcase</h3>
              <p className="text-[11px] text-gray-500">Official campus walkthrough & digital launch video</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDeviceFileSelect}
              accept="video/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-sm text-[11px] font-semibold transition-colors border border-gray-300 flex items-center space-x-1.5"
              title="Load saved video directly from your device"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span>{hasCustomVideo ? 'Change Device Video' : 'Load from Device'}</span>
            </button>
          </div>
        </div>

        {/* Video Player Frame */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative bg-gray-950 aspect-video w-full overflow-hidden group select-none"
        >
          {/* Real Video Element */}
          <video
            ref={videoRef}
            src={videoSrc}
            poster={poster}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={() => setVideoError(true)}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              videoError ? 'opacity-0 pointer-events-none' : 'opacity-100 cursor-pointer'
            }`}
          />

          {/* Interactive Slide Preview (When video is not yet loaded or on error) */}
          {(!isLoaded || videoError) && (
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-4 bg-gray-950">
              {showcaseSlides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    idx === activeSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                  style={{ transitionProperty: 'opacity, transform' }}
                >
                  <img
                    src={slide.image}
                    alt={slide.caption}
                    className="w-full h-full object-cover filter brightness-[0.7]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-transparent to-black/40" />
                </div>
              ))}

              {/* Tag & Watermark */}
              <div className="relative z-20 flex justify-between items-start">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-sm bg-black/60 backdrop-blur-md border border-white/20 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
                  <span>{showcaseSlides[activeSlide]?.tag}</span>
                </div>
                <div className="px-2 py-0.5 rounded-sm bg-school-green-900/80 backdrop-blur-md border border-school-green-500/30 text-[10px] text-white font-mono">
                  ASASHS
                </div>
              </div>

              {/* Center Play / Load Prompt */}
              <div className="relative z-20 text-center my-auto px-4">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.play().then(() => {
                        setIsPlaying(true);
                        setVideoError(false);
                      }).catch(() => {
                        fileInputRef.current?.click();
                      });
                    }
                  }}
                  className="w-14 h-14 mx-auto rounded-full bg-yellow-400 hover:bg-yellow-300 text-yellow-950 flex items-center justify-center shadow-lg hover:scale-105 transition-all mb-3 group"
                >
                  <svg className="w-6 h-6 fill-current ml-0.5" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <p className="text-white text-xs font-semibold drop-shadow-md">
                  {showcaseSlides[activeSlide]?.caption}
                </p>
                <p className="text-gray-300 text-[11px] mt-1">
                  Click to play video or load your saved file from this device
                </p>
              </div>

              {/* Slide Indicators */}
              <div className="relative z-20 flex justify-center space-x-1.5">
                {showcaseSlides.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlide(idx)}
                    className={`h-1 rounded-full transition-all ${
                      idx === activeSlide ? 'w-6 bg-yellow-400' : 'w-2 bg-white/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Standard Controls Overlay */}
          {(!videoError && isLoaded) && (
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-3 transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Progress Scrubber */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer accent-yellow-400 mb-2.5"
              />

              {/* Bottom Control Bar */}
              <div className="flex items-center justify-between text-white text-xs">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={togglePlay}
                    className="p-1 hover:text-yellow-400 transition-colors"
                  >
                    {isPlaying ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-1 hover:text-yellow-400 transition-colors"
                  >
                    {isMuted ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>

                  <span className="font-mono text-[11px] tabular-nums text-gray-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={toggleFullscreen}
                    className="p-1 hover:text-yellow-400 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Variant: Landing Page (Full Hero Showcase with Ambient Background)
  return (
    <section className={`py-16 px-4 sm:px-6 bg-gray-950 text-white relative overflow-hidden border-y border-white/10 ${className}`}>
      {/* Subtle Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-school-green-700/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-2 py-1 px-3 rounded-sm bg-white/5 border border-white/15 text-[11px] font-bold uppercase tracking-wider text-yellow-400 mb-3 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            <span>Virtual Tour & Showcase</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            {title}
          </h2>
          <p className="text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Cinematic Video Container */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          className="relative bg-black rounded-lg border border-white/20 shadow-2xl overflow-hidden aspect-video group max-w-5xl mx-auto"
        >
          {/* Real Video Element */}
          <video
            ref={videoRef}
            src={videoSrc}
            poster={poster}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={() => setVideoError(true)}
            onEnded={() => setIsPlaying(false)}
            onClick={togglePlay}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              videoError ? 'opacity-0 pointer-events-none' : 'opacity-100 cursor-pointer'
            }`}
          />

          {/* Interactive Cinematic Slide Preview (When video is idle, not yet loaded, or on error) */}
          {(!isLoaded || videoError) && (
            <div className="absolute inset-0 z-10 flex flex-col justify-between p-6 sm:p-10 bg-gray-950">
              {showcaseSlides.map((slide, idx) => (
                <div
                  key={idx}
                  className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                    idx === activeSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                  }`}
                  style={{ transitionProperty: 'opacity, transform' }}
                >
                  <img
                    src={slide.image}
                    alt={slide.caption}
                    className="w-full h-full object-cover filter brightness-[0.65]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                </div>
              ))}

              {/* Top Banner inside Player */}
              <div className="relative z-20 flex justify-between items-center">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-sm bg-black/70 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-yellow-400">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span>{showcaseSlides[activeSlide]?.tag}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleDeviceFileSelect}
                    accept="video/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-sm text-xs font-semibold backdrop-blur-md transition-all border border-white/25 flex items-center space-x-1.5 cursor-pointer"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span>{hasCustomVideo ? 'Change Device Video' : 'Load from Device'}</span>
                  </button>
                </div>
              </div>

              {/* Center Play Button & Caption */}
              <div className="relative z-20 text-center my-auto max-w-xl mx-auto px-4">
                <button
                  onClick={() => {
                    if (videoRef.current) {
                      videoRef.current.play().then(() => {
                        setIsPlaying(true);
                        setVideoError(false);
                      }).catch(() => {
                        fileInputRef.current?.click();
                      });
                    }
                  }}
                  className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full bg-yellow-400 hover:bg-yellow-300 text-yellow-950 flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all mb-5 group cursor-pointer border-4 border-yellow-200/50"
                  aria-label="Play showcase video"
                >
                  <svg className="w-9 h-9 fill-current ml-1" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </button>
                <h3 className="text-lg sm:text-2xl font-extrabold text-white drop-shadow-md mb-2">
                  {showcaseSlides[activeSlide]?.caption}
                </h3>
                <p className="text-gray-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                  Experience campus life, state-of-the-art facilities, and student accomplishments.
                </p>
              </div>

              {/* Bottom Carousel Navigation */}
              <div className="relative z-20 flex items-center justify-between pt-4 border-t border-white/10 text-xs text-gray-400">
                <span className="font-mono text-[11px] uppercase tracking-wider">
                  Slide {activeSlide + 1} of {showcaseSlides.length}
                </span>
                <div className="flex space-x-2">
                  {showcaseSlides.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === activeSlide ? 'w-8 bg-yellow-400' : 'w-2 bg-white/30 hover:bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Standard Controls Overlay */}
          {(!videoError && isLoaded) && (
            <div
              className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-6 transition-opacity duration-300 ${
                showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              {/* Progress Scrubber */}
              <input
                type="range"
                min="0"
                max={duration || 100}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-yellow-400 mb-3"
              />

              {/* Bottom Control Bar */}
              <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={togglePlay}
                    className="p-1 hover:text-yellow-400 transition-colors cursor-pointer"
                  >
                    {isPlaying ? (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    ) : (
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="p-1 hover:text-yellow-400 transition-colors cursor-pointer"
                  >
                    {isMuted ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    )}
                  </button>

                  <span className="font-mono text-xs tabular-nums text-gray-300">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-gray-300 hover:text-white underline cursor-pointer hidden sm:inline-block"
                  >
                    Load from Device
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="p-1 hover:text-yellow-400 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
