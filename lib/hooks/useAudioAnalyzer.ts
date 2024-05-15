import { useEffect, useState } from "react";

const useAudioAnalyzer = (stream: MediaStream | null) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new window.AudioContext();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

    analyser.smoothingTimeConstant = 0.8;
    analyser.fftSize = 1024;

    microphone.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);

    scriptProcessor.onaudioprocess = () => {
      const array = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(array);
      const values = array.reduce((a, b) => a + b, 0);
      const average = values / array.length;

      if (average > 20) {
        setIsSpeaking(true);
      } else {
        setIsSpeaking(false);
      }
    };

    return () => {
      scriptProcessor.disconnect();
      analyser.disconnect();
      microphone.disconnect();
    };
  }, [stream]);

  return isSpeaking;
};

export default useAudioAnalyzer;
