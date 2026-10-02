# Orchestration entry point.
# Full training/evaluation scripts should be run after dataset preparation.
# This intentionally fails loudly rather than fabricating metrics.
from pathlib import Path
print("MachineGuard experiment runner")
print("Dataset root:", Path("data/raw").resolve())
print("Run individual experiment modules as they are implemented/validated.")
print("No result values are generated unless an experiment actually runs.")
