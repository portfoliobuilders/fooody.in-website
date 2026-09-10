#!/bin/bash
cd "$(dirname "$0")"
echo
echo "Fooody.in website"
echo "Opening http://localhost:8080"
echo "Keep this window open while you view the site."
echo
(sleep 1; open "http://localhost:8080/" 2>/dev/null || xdg-open "http://localhost:8080/" 2>/dev/null) &
python3 -m http.server 8080
