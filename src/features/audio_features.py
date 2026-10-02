import numpy as np
import librosa

def mfcc_stats(y, sr=16000, n_mfcc=20):
    m = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=n_mfcc)
    return np.concatenate([m.mean(1), m.std(1)]).astype(np.float32)

def spectral_features(y, sr=16000):
    return np.array([
        librosa.feature.spectral_centroid(y=y, sr=sr).mean(),
        librosa.feature.spectral_bandwidth(y=y, sr=sr).mean(),
        librosa.feature.zero_crossing_rate(y).mean()
    ], dtype=np.float32)
