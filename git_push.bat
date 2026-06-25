@echo off
cd /d "c:\Users\cgven\My projects\app-ui\app-ui"
echo --- DIFF NAME-ONLY --- > git_push_log.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" diff --name-only >> git_push_log.txt 2>&1
echo --- ADD --- >> git_push_log.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" add src/components/app-sidebar/nav-user.tsx >> git_push_log.txt 2>&1
echo --- COMMIT --- >> git_push_log.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" commit -m "feat: remove notifications item from user dropdown" >> git_push_log.txt 2>&1
echo --- PUSH --- >> git_push_log.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" push origin feat/tickets-355-356-357 >> git_push_log.txt 2>&1
echo --- STATUS --- >> git_push_log.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" status >> git_push_log.txt 2>&1
echo --- BRANCH --- >> git_push_log.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" branch --show-current >> git_push_log.txt 2>&1
echo --- REV-PARSE --- >> git_push_log.txt 2>&1
"C:\Program Files\Git\cmd\git.exe" rev-parse HEAD >> git_push_log.txt 2>&1
echo --- DONE --- >> git_push_log.txt 2>&1
