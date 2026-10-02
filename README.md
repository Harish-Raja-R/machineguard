# MachineGuard
## Noise-Robust Industrial Acoustic Anomaly Detection using Kernel, Ensemble and Deep Learning

A CPU-first research implementation for the MIMII-based DCASE 2020 Challenge Task 2 Development Dataset — Fan.

### Models
1. One-Class SVM — kernel machine
2. Isolation Forest — ensemble baseline
3. CNN Autoencoder — normal-only reconstruction
4. CNN baseline
5. CNN + Attention
6. Validation-weighted heterogeneous score fusion

### Dataset
Official source: https://zenodo.org/records/3678171
Artifact: `dev_data_fan.zip`
Expected local archive: `D:\MachineGuardData\mimii\dev_data_fan.zip`
Expected MD5: `649bdfc06263ae7a838963f43b6641e6`

The dataset is deliberately NOT bundled in this source ZIP because it is a large benchmark archive. Put it at the path above, then run the acquisition/extraction script.

### Environment
Python 3.11+, CPU-safe defaults, seed 42, 16 kHz, 10 s clips, 64-bin Log-Mel, batch size 4.

### Quick start
```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python scripts/prepare_dataset.py
python scripts/run_all.py
pytest -q
uvicorn backend.main:app --reload
```

For the frontend:
```powershell
cd frontend
npm install
npm run dev
```

### Scientific safeguards
- Normal-only training for anomaly models.
- Thresholds selected using validation data only.
- Test labels are never used for optimization.
- No fabricated metrics.
- No dataset binaries are tracked by Git.
- Poor results are retained and analyzed rather than hidden.
