@echo off
cd /d "c:\Users\cgven\My projects\app-ui\app-ui"
echo --- FETCH --- > git_sync_log.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" fetch origin >> git_sync_log.txt 2>&1
echo --- CHECKOUT --- >> git_sync_log.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" checkout feat/tickets-355-356-357 >> git_sync_log.txt 2>&1
echo --- PULL --- >> git_sync_log.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" pull origin feat/tickets-355-356-357 >> git_sync_log.txt 2>&1
echo --- VERIFY --- >> git_sync_log.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" branch --show-current >> git_sync_log.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" rev-parse HEAD >> git_sync_log.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" status >> git_sync_log.txt 2>&1
