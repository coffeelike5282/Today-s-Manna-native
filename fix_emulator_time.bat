@echo off
SET ADB="C:\Users\coffeelike\AppData\Local\Android\Sdk\platform-tools\adb.exe"

echo [안본] 에뮬레이터 시간대 고정 작전 개시! 🫡
echo.

echo [1/3] 에뮬레이터 연결 대기 중...
%ADB% -s emulator-5554 wait-for-device

echo [2/3] 한국 표준시(KST, Asia/Seoul) 설정 중...
%ADB% -s emulator-5554 shell settings put global auto_time 0
%ADB% -s emulator-5554 shell setprop persist.sys.timezone Asia/Seoul
%ADB% -s emulator-5554 shell service call alarm 3 s16 Asia/Seoul
%ADB% -s emulator-5554 shell settings put global auto_time 1

echo [3/3] 설정 완료! 현재 에뮬레이터 시간 확인:
%ADB% -s emulator-5554 shell date
echo.

echo 박 사장님, 시간대 고정 완료했습니다! 시원하시죠? 충성! 🫡
pause
