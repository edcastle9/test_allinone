// Browser Web Speech API for reading counselor's messages with warm pacing
export class SpeechController {
  private synth: SpeechSynthesis | null = null;
  private isSpeaking = false;
  private onStateChange?: (speaking: boolean) => void;

  constructor() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public setCallback(cb: (speaking: boolean) => void) {
    this.onStateChange = cb;
  }

  public speak(text: string) {
    if (!this.synth) return;
    this.stop();

    // Clean markdown symbols for cleaner speech
    const cleanText = text
      .replace(/[#*`_~>[\]()]/g, " ")
      .replace(/\n+/g, ". ")
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "ko-KR";
    utterance.rate = 0.92; // slightly slower, peaceful calming pace
    utterance.pitch = 0.98;

    // Prefer Korean voices if available
    const voices = this.synth.getVoices();
    const koreanVoice = voices.find((v) => v.lang.includes("ko") || v.lang.includes("KR"));
    if (koreanVoice) {
      utterance.voice = koreanVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.onStateChange?.(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.onStateChange?.(false);
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.onStateChange?.(false);
    };

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.onStateChange?.(false);
    }
  }

  public getSpeaking() {
    return this.isSpeaking;
  }
}

export const speechController = new SpeechController();
