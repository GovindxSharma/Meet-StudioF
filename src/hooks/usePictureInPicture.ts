import { useState, useEffect } from 'react';

export function usePictureInPicture(videoElementRef: React.RefObject<HTMLVideoElement | null>) {
  const [isPipActive, setIsPipActive] = useState(false);
  const [isPipSupported, setIsPipSupported] = useState(false);

  useEffect(() => {
    // Check browser support for PiP
    if (document.pictureInPictureEnabled) {
      setIsPipSupported(true);
    }
  }, []);

  const togglePip = async () => {
    if (!videoElementRef.current) return;

    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPipActive(false);
      } else {
        await videoElementRef.current.requestPictureInPicture();
        setIsPipActive(true);
      }
    } catch (error) {
      console.error('Failed to enter Picture-in-Picture mode:', error);
    }
  };

  useEffect(() => {
    const video = videoElementRef.current;
    if (!video) return;

    const handleLeavePip = () => setIsPipActive(false);
    video.addEventListener('leavepictureinpicture', handleLeavePip);

    return () => {
      video.removeEventListener('leavepictureinpicture', handleLeavePip);
    };
  }, [videoElementRef]);

  return { isPipSupported, isPipActive, togglePip };
}