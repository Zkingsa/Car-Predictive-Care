/**
 * Web Speech API Voice synthesis and recognition utilities for Mercedes-Benz MBUX
 */

export class VoiceAssistantManager {
  private static recognitionInstance: any = null;
  private static synth: SpeechSynthesis | null = typeof window !== "undefined" ? window.speechSynthesis : null;

  public static isSpeechRecognitionSupported(): boolean {
    if (typeof window === "undefined") return false;
    return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  public static createSpeechRecognizer(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (err: any) => void,
    onEnd: () => void
  ) {
    if (!this.isSpeechRecognitionSupported()) return null;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      onResult(finalTranscript || interimTranscript, !!finalTranscript);
    };

    recognition.onerror = (event: any) => {
      onError(event.error);
    };

    recognition.onend = () => {
      onEnd();
    };

    return recognition;
  }

  public static speakText(text: string, onStart?: () => void, onEnd?: () => void) {
    if (!this.synth) return;

    // Cancel any active speech
    this.synth.cancel();

    // Strip markdown formatting for cleaner voice reading
    const cleanText = text
      .replace(/[*#_`]/g, "")
      .replace(/\[.*?\]/g, "")
      .replace(/\n+/g, ". ");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick refined voice if available
    const voices = this.synth.getVoices();
    const premiumVoice = voices.find(
      (v) =>
        v.lang.startsWith("en") &&
        (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("Samantha") || v.name.includes("Serena"))
    ) || voices.find((v) => v.lang.startsWith("en"));

    if (premiumVoice) {
      utterance.voice = premiumVoice;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) utterance.onend = onEnd;
    utterance.onerror = () => {
      if (onEnd) onEnd();
    };

    this.synth.speak(utterance);
  }

  public static stopSpeaking() {
    if (this.synth) {
      this.synth.cancel();
    }
  }
}
