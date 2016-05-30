@echo off
setlocal

start http://localhost:8000

cd _site
python -m http.server
 
