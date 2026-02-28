"""
voice.py — ElevenLabs voice cloning & TTS pipeline for Unitinder.

Full pipeline:  Video → Extract Audio → Clone Voice → Generate Speech

Functions:
  extract_audio_from_video(video_path)          → audio_path (.mp3)
  clone_teacher_voice(audio_path, teacher_name) → voice_id
  generate_speech(voice_id, text)               → audio bytes (mp3)
  full_pipeline(video_path, teacher_name)        → voice_id (does extraction + cloning)
  list_cloned_voices()                          → list of voices
"""

import os
from pathlib import Path
from dotenv import load_dotenv
from elevenlabs import ElevenLabs

load_dotenv()

_client = None

BASE_DIR = Path(__file__).resolve().parent
AUDIO_DIR = BASE_DIR / "audio"
AUDIO_DIR.mkdir(exist_ok=True)


def _get_client() -> ElevenLabs:
    global _client
    if _client is None:
        api_key = os.getenv("ELEVENLABS_API_KEY")
        if not api_key:
            raise RuntimeError("ELEVENLABS_API_KEY not set in .env")
        _client = ElevenLabs(api_key=api_key)
    return _client


# ── Step 1: Extract audio from video ─────────────────────────────────

def extract_audio_from_video(video_path: str, output_path: str | None = None) -> str:
    """
    Extract audio from a video file using moviepy.

    Args:
        video_path: Path to the video file (.mp4, .mov, .webm, etc.)
        output_path: Optional output path for the audio. Default: same name as video + .mp3

    Returns:
        Path to the extracted audio file (.mp3)
    """
    from moviepy import VideoFileClip

    video_path = Path(video_path)
    if output_path is None:
        output_path = str(AUDIO_DIR / f"{video_path.stem}_extracted.mp3")
    else:
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    print(f"  📹 Extracting audio from: {video_path.name}")
    video = VideoFileClip(str(video_path))
    video.audio.write_audiofile(str(output_path), logger=None)
    video.close()

    size_kb = os.path.getsize(output_path) / 1024
    print(f"  ✅ Audio extracted: {output_path} ({size_kb:.0f} KB)")
    return str(output_path)


# ── Step 2: Clone a voice ────────────────────────────────────────────

def clone_teacher_voice(audio_path: str, teacher_name: str, description: str = "") -> str:
    """
    Clone a teacher's voice from an audio file using ElevenLabs Instant Voice Cloning.

    Args:
        audio_path: Path to an audio file (.mp3, .wav, .m4a) — at least 30s recommended.
        teacher_name: Name for the cloned voice (e.g. "Marcus Mac Delgado").
        description: Optional description of the voice.

    Returns:
        voice_id: The ElevenLabs voice ID to use for TTS.
    """
    client = _get_client()

    print(f"  🎙️  Cloning voice for: {teacher_name}")
    with open(audio_path, "rb") as f:
        voice = client.voices.ivc.create(
            name=teacher_name,
            description=description or f"Cloned voice of {teacher_name} for Unitinder",
            files=[f],
        )

    print(f"  ✅ Voice cloned! voice_id = {voice.voice_id}")
    return voice.voice_id


# ── Step 3: Generate speech ──────────────────────────────────────────

def generate_speech(voice_id: str, text: str, model_id: str = "eleven_multilingual_v2") -> bytes:
    """
    Generate speech audio using a cloned voice.

    Args:
        voice_id: ElevenLabs voice ID (from clone_teacher_voice).
        text: The text to speak (e.g. study plan content).
        model_id: ElevenLabs model to use.

    Returns:
        Audio bytes (MP3 format).
    """
    client = _get_client()

    audio_generator = client.text_to_speech.convert(
        voice_id=voice_id,
        text=text,
        model_id=model_id,
    )

    # The generator yields chunks — collect them all
    audio_bytes = b""
    for chunk in audio_generator:
        audio_bytes += chunk

    return audio_bytes


# ── Full pipeline: Video → Voice ID ─────────────────────────────────

def full_pipeline(video_path: str, teacher_name: str, teacher_id: str = "") -> dict:
    """
    Complete pipeline: extract audio from video → clone voice → return voice_id.

    Args:
        video_path: Path to the uploaded video file.
        teacher_name: Name of the teacher.
        teacher_id: Optional teacher ID for file naming.

    Returns:
        dict with voice_id, audio_path, and status info.
    """
    print(f"\n🚀 Starting voice pipeline for: {teacher_name}")
    print("=" * 50)

    # Step 1: Extract audio
    audio_filename = f"{teacher_id or 'teacher'}_extracted.mp3"
    audio_path = str(AUDIO_DIR / audio_filename)
    audio_path = extract_audio_from_video(video_path, audio_path)

    # Step 2: Clone voice
    voice_id = clone_teacher_voice(audio_path, teacher_name)

    print("=" * 50)
    print(f"✅ Pipeline complete! voice_id = {voice_id}\n")
    return {
        "voice_id": voice_id,
        "audio_path": audio_path,
        "teacher_name": teacher_name,
    }


# ── Utility functions ────────────────────────────────────────────────

def list_cloned_voices() -> list[dict]:
    """List all voices available in the ElevenLabs account."""
    client = _get_client()
    response = client.voices.get_all()
    return [
        {
            "voice_id": v.voice_id,
            "name": v.name,
            "category": v.category,
        }
        for v in response.voices
    ]


def save_audio(audio_bytes: bytes, output_path: str) -> str:
    """Save audio bytes to a file."""
    Path(output_path).parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "wb") as f:
        f.write(audio_bytes)
    return output_path


# ── Quick test when run directly ──────────────────────────────────────
if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1:
        # Test full pipeline: python voice.py path/to/video.mp4 "Teacher Name"
        video = sys.argv[1]
        name = sys.argv[2] if len(sys.argv) > 2 else "Test Teacher"
        result = full_pipeline(video, name)
        print(f"\nResult: {result}")

        # Quick TTS test with the cloned voice
        print("\n🔊 Testing TTS with cloned voice...")
        audio = generate_speech(result["voice_id"], "Hello! This is a test of the cloned voice. Welcome to Unitinder!")
        out = save_audio(audio, str(AUDIO_DIR / "test_cloned_output.mp3"))
        print(f"✅ Test audio saved: {out}")
        print(f"   Play with: open {out}")
    else:
        print("Listing available voices...")
        voices = list_cloned_voices()
        print(f"Found {len(voices)} voices:")
        for v in voices:
            print(f"  - {v['name']} ({v['voice_id']}) [{v['category']}]")
