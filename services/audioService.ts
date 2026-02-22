import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { AppState, AppStateStatus } from 'react-native';

class AudioService {
    private sound: Audio.Sound | null = null;
    private isMuted: boolean = false;
    private isLoaded: boolean = false;
    private isLoading: boolean = false; // 중복 로딩 방지용 락(Lock) 락! 락! 🫡
    private currentSource: any = null; // 오디오 엔진 사망 시 부활용 소스 🫡

    constructor() {
        this.setupAudioMode();
    }

    private async setupAudioMode() {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: true, // OS 강제 중단 방지, 앱이 직접 제어
                interruptionModeIOS: InterruptionModeIOS.DuckOthers,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: true,
                interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
                playThroughEarpieceAndroid: false,
            });
        } catch (error) {
            console.error('[AudioService] Failed to set audio mode:', error);
        }
    }

    async loadSound(source: any, initialMuteState: boolean = false) {
        if (this.isLoading) {
            console.log('[AudioService] Already loading, skipping duplicate request.');
            return;
        }

        this.isLoading = true;
        this.isMuted = initialMuteState;
        this.currentSource = source;

        try {
            if (this.sound) {
                await this.unloadSound();
            }

            const { sound, status } = await Audio.Sound.createAsync(
                source,
                {
                    isLooping: true,
                    volume: this.isMuted ? 0.0 : 1.0,
                    shouldPlay: !this.isMuted,
                }
            );

            this.sound = sound;
            this.isLoaded = true;

            if (!status.isLoaded) {
                console.warn('[AudioService] Sound created but not loaded');
            }

            this.sound.setOnPlaybackStatusUpdate(this.onPlaybackStatusUpdate.bind(this));
            console.log('[AudioService] Sound loaded successfully.');

        } catch (error) {
            console.warn('[AudioService] Failed to load sound:', error);
            this.isLoaded = false;
            this.sound = null;
        } finally {
            this.isLoading = false; // 작업 끝나면 락 해제! 🫡
        }
    }

    private onPlaybackStatusUpdate(status: any) {
        if (!status.isLoaded) {
            if (status.error) {
                console.error(`[AudioService] Playback Error: ${status.error}`);
            }
        } else {
            if (status.didJustFinish && !status.isLooping) {
                console.log('[AudioService] Sound finished, restarting...');
                this.sound?.replayAsync();
            }
        }
    }

    async unloadSound() {
        if (this.sound) {
            try {
                await this.sound.unloadAsync();
            } catch (error) {
                console.warn('[AudioService] Error unloading sound:', error);
            }
            this.sound = null;
            this.isLoaded = false;
        }
    }

    async toggleMute(shouldBeMuted: boolean) {
        // 이미 그 상태면 브릿지 건드리지 말고 통과! 🫡
        if (this.isMuted === shouldBeMuted && this.isLoaded) {
            return;
        }

        this.isMuted = shouldBeMuted;

        if (!this.sound || !this.isLoaded || this.isLoading) return;

        try {
            await this.sound.setStatusAsync({
                shouldPlay: !this.isMuted,
                volume: this.isMuted ? 0.0 : 1.0
            });
        } catch (error) {
            console.error('[AudioService] Failed to toggle mute:', error);
            this.recoverAudio();
        }
    }

    async pause() {
        if (this.sound && this.isLoaded && !this.isLoading) {
            try {
                const status = await this.sound.getStatusAsync();
                if (status.isLoaded && status.isPlaying) {
                    await this.sound.pauseAsync();
                }
            } catch (error) {
                console.error('[AudioService] Failed to pause:', error);
            }
        }
    }

    async resume() {
        if (this.isMuted || this.isLoading) return;

        if (!this.sound || !this.isLoaded) {
            console.log('[AudioService] Engine is dead! Resurrecting on resume()... 🚑');
            return this.recoverAudio();
        }

        try {
            const status = await this.sound.getStatusAsync();
            if (status.isLoaded) {
                if (!status.isPlaying) {
                    await this.sound.playAsync();
                }
            } else {
                console.log('[AudioService] Engine turned unloaded! Resurrecting... 🚑');
                this.recoverAudio();
            }
        } catch (error) {
            console.error('[AudioService] Failed to resume, attempting recovery:', error);
            this.recoverAudio();
        }
    }

    async recoverAudio() {
        if (this.currentSource && !this.isLoading) {
            console.log('[AudioService] Recovering dead audio engine... 🚑');
            await this.loadSound(this.currentSource, this.isMuted);
        }
    }

    async handleAppStateChange(nextAppState: AppStateStatus) {
        if (nextAppState === 'active') {
            await this.resume();
        } else if (nextAppState === 'background') {
            // 모달(Modal) 창이 뜰 때 발생하는 'inactive' 상태를 무시합니다! 🫡
            await this.pause();
        }
    }

    async resetAudio() {
        try {
            await this.unloadSound();
            await new Promise(resolve => setTimeout(resolve, 500));
            // Ensure this runs safely
        } catch (e) {
            console.error(e);
        }
    }
}

export const audioService = new AudioService();
