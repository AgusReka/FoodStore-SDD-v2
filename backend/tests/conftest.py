"""Shared test configuration."""
import sys
from pathlib import Path

# Add project root to sys.path so 'backend' package can be imported
project_root = Path(__file__).resolve().parents[2]
if str(project_root) not in sys.path:
    sys.path.insert(0, str(project_root))
