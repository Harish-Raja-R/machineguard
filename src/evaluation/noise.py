import numpy as np

def add_gaussian_noise(y, snr_db, seed=42):
    rng=np.random.default_rng(seed)
    signal_power=np.mean(y*y)+1e-12
    noise_power=signal_power/(10**(snr_db/10))
    noise=rng.normal(0,np.sqrt(noise_power),size=len(y)).astype(np.float32)
    return (y+noise).astype(np.float32)
