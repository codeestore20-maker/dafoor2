@echo off
if exist .git\index.lock del .git\index.lock
git add .
git commit -m "New clean start for dafoor2: Auth & UI/UX"
git push -u origin master
