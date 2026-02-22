import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import { AppState, AppStateStatus } from 'react-native';

class AudioService {
    private sound: Audio.Sound | null = null;
    private isMuted: boolean = false;
    private isLoaded: boolean = false;

    constructor() {
        this.setupAudioMode();
    }

    private async setupAudioMode() {
        try {
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                staysActiveInBackground: false,
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
        this.isMuted = initialMuteState;

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
            console.warn('[AudioService] Failed to load sound (likely timeout due to file size):', error);
            this.isLoaded = false;
            this.sound = null;
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
        this.isMuted = shouldBeMuted;

        if (!this.sound) return;

        try {
            if (this.isMuted) {
                await this.sound.setStatusAsync({ shouldPlay: false, volume: 0.0 });
            } else {
                await this.sound.setStatusAsync({ shouldPlay: true, volume: 1.0 });
            }
        } catch (error) {
            console.error('[AudioService] Failed to toggle mute:', error);
        }
    }

    async pause() {
        if (this.sound) {
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
        if (this.isMuted || !this.sound) return;

        try {
            const status = await this.sound.getStatusAsync();
            if (status.isLoaded && !status.isPlaying) {
                await this.sound.playAsync();
            }
        } catch (error) {
            console.error('[AudioService] Failed to resume:', error);
        }
    }

    async handleAppStateChange(nextAppState: AppStateStatus) {
        if (nextAppState === 'active') {
            this.resume();
        } else if (nextAppState.match(/inactive|background/)) {
            this.pause();
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
