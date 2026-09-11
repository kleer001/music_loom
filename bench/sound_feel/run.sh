#!/usr/bin/env bash
# Serve the instrument over HTTP and print the URL. A real server is required:
# fetch() and AudioWorklet do not load from a file:// path. Scans upward from the
# default port (8000, or $1) for the first free one.
set -euo pipefail
cd "$(dirname "$0")"

PORT="$(python3 - "${1:-8000}" <<'PY'
import socket, sys
p = int(sys.argv[1])
while p < 65535:
    s = socket.socket()
    if s.connect_ex(("127.0.0.1", p)) != 0:
        print(p); break
    s.close(); p += 1
PY
)"

echo "sound_feel -> http://127.0.0.1:${PORT}/"
exec python3 -m http.server "$PORT"
