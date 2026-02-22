@echo off
chcp 65001 > nul
echo [*] 안 본부장 좀비 척살 프로토콜 가동!
echo [*] 백그라운드에 숨어있는 모든 node.exe 프로세스를 처단합니다...
taskkill /IM node.exe /F
echo [*] 척살 완료! 8081 포트가 정화되었습니다. 충성!
