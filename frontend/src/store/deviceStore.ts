import { create } from "zustand";

interface MediaDeviceInfo {
  deviceId: string; // 장치의 고유 식별자
  groupId: string; // 동일한 물리적 장치에 속한 입력/출력 장치를 그룹화하는 식별자
  kind: string; // 장치 유형(videoinput, audioinput 등)
  label: string; // 사용자가 읽을 수 있는 장치 이름
}

interface CameraDeviceStore {
  videoDevices: MediaDeviceInfo[];
  selectedVideo: string;
  setVideoDevices: (videos: MediaDeviceInfo[]) => void;
  setSelectedVideo: (deviceId: string) => void;
}
interface AudioDeviceStore {
  audioDevices: MediaDeviceInfo[];
  selectedAudio: string;
  setAudioDevices: (audios: MediaDeviceInfo[]) => void;
  setSelectedAudio: (deviceId: string) => void;
}
interface SpeakerDeviceStore {
  speakerDevices: MediaDeviceInfo[];
  selectedSpeaker: string;
  setSpeakerDevices: (speakers: MediaDeviceInfo[]) => void;
  setSelectedSpeaker: (deviceId: string) => void;
}

export const useCameraDeviceStore = create<CameraDeviceStore>((set) => ({
  videoDevices: [],
  selectedVideo: "",
  setVideoDevices: (videos) => set({ videoDevices: videos }),
  setSelectedVideo: (deviceId) => set({ selectedVideo: deviceId }),
}));

export const useAudioDeviceStore = create<AudioDeviceStore>((set) => ({
  audioDevices: [],
  selectedAudio: "",
  setAudioDevices: (audios) => set({ audioDevices: audios }),
  setSelectedAudio: (deviceId) => set({ selectedAudio: deviceId }),
}));

export const useSpeakerDeviceStore = create<SpeakerDeviceStore>((set) => ({
  speakerDevices: [],
  selectedSpeaker: "",
  setSpeakerDevices: (speakers) => set({ speakerDevices: speakers }),
  setSelectedSpeaker: (deviceId) => set({ selectedSpeaker: deviceId }),
}));
