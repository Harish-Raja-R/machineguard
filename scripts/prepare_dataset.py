from pathlib import Path
import zipfile, hashlib, json, urllib.request
from pathlib import Path

ARCHIVE=Path("data/dev_data_fan.zip")
OUT=Path("data/raw")
EXPECTED="649bdfc06263ae7a838963f43b6641e6"

def md5(path):
    h=hashlib.md5()
    with open(path,"rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""): h.update(b)
    return h.hexdigest()

if not ARCHIVE.exists():
    print(f"Dataset archive not found at {ARCHIVE}. Downloading...")
    ARCHIVE.parent.mkdir(parents=True, exist_ok=True)
    urllib.request.urlretrieve("https://zenodo.org/records/3678171/files/dev_data_fan.zip", ARCHIVE)

actual=md5(ARCHIVE)
if actual!=EXPECTED:
    raise RuntimeError(f"MD5 mismatch: {actual} != {EXPECTED}")
OUT.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(ARCHIVE) as z:
    z.extractall(OUT)
print("Dataset verified and extracted:", OUT)
