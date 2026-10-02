import numpy as np
import librosa

def load_audio(path, sr=16000, duration=10.0):
    y, _ = librosa.load(path, sr=sr, mono=True)
    target = int(sr * duration)
    if len(y) < target:
        y = np.pad(y, (0, target-len(y)))
    return y[:target].astype(np.float32)

def rms(y):
    return float(np.sqrt(np.mean(np.square(y)) + 1e-12))
