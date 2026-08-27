#!/bin/bash
# Serve this directory over HTTP. ES modules and AudioWorklet do not load from
# file://, so never open index.html directly.
#
# Scans upward from the default port for the first free one — a leftover process
# on the default otherwise kills the launch with "Address already in use".
set -euo pipefail
cd "$(dirname "$0")"

want="${1:-8000}"
port=$(python3 - "$want" <<'PY'
import socket, sys
want = int(sys.argv[1])
for p in range(want, want + 100):
    with socket.socket() as s:
        if s.connect_ex(("127.0.0.1", p)) != 0:
            print(p)
            break
else:
    raise SystemExit(f"no free port in {want}..{want+99}")
PY
)

[ "$port" != "$want" ] && echo "port $want busy, using $port"
echo "http://127.0.0.1:$port/"
exec python3 -m http.server "$port" --bind 127.0.0.1
