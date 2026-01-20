// Sound effects for the Planning Poker application
// Free sound effects - using web audio API for simple sounds

const audioContext = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

// Simple beep sound generator
function createBeep(frequency: number, duration: number, type: OscillatorType = 'sine'): void {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

// Card flip sound - quick swoosh
export function playCardFlip(): void {
    if (!audioContext) return;

    // Create white noise for swoosh effect
    const bufferSize = audioContext.sampleRate * 0.1;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }

    const source = audioContext.createBufferSource();
    const filter = audioContext.createBiquadFilter();
    const gainNode = audioContext.createGain();

    source.buffer = buffer;
    filter.type = 'highpass';
    filter.frequency.value = 1000;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioContext.destination);

    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    source.start();
}

// Vote cast sound - soft click
export function playVoteSound(): void {
    createBeep(800, 0.08, 'sine');
    setTimeout(() => createBeep(1000, 0.05, 'sine'), 30);
}

// Card reveal sound - dramatic reveal
export function playRevealSound(): void {
    createBeep(400, 0.15, 'triangle');
    setTimeout(() => createBeep(600, 0.15, 'triangle'), 100);
    setTimeout(() => createBeep(800, 0.2, 'triangle'), 200);
}

// Applause/celebration sound for consensus
export function playConsensusSound(): void {
    // Series of happy ascending tones
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
        setTimeout(() => createBeep(freq, 0.2, 'sine'), i * 100);
    });

    // Add some sparkle
    setTimeout(() => {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => createBeep(1500 + Math.random() * 500, 0.05, 'sine'), i * 50);
        }
    }, 400);
}

// BRB toggle sound
export function playBrbSound(): void {
    createBeep(440, 0.1, 'sine');
    setTimeout(() => createBeep(330, 0.15, 'sine'), 100);
}

// Resume from BRB sound
export function playBackSound(): void {
    createBeep(330, 0.1, 'sine');
    setTimeout(() => createBeep(440, 0.15, 'sine'), 100);
}

// Hook for using sounds
import { useCallback } from 'react';

export function useSounds() {
    const vote = useCallback(() => playVoteSound(), []);
    const flip = useCallback(() => playCardFlip(), []);
    const reveal = useCallback(() => playRevealSound(), []);
    const consensus = useCallback(() => playConsensusSound(), []);
    const brb = useCallback(() => playBrbSound(), []);
    const back = useCallback(() => playBackSound(), []);

    return { vote, flip, reveal, consensus, brb, back };
}
