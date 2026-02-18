@echo off
echo.
echo [안 본부장의 긴급 처방: 에뮬레이터 시간 맞추기]
echo.
echo 박 사장님, 기계 녀석들이 해외 출장을 갔는지 시간이 안 맞네요!
echo 안 본부장이 강제로 한국 시간(Seoul)으로 돌려놓겠습니다.
echo.

:: 1. 타임존 강제 설정 (Asia/Seoul)
adb shell setprop persist.sys.timezone Asia/Seoul
echo [1/3] 타임존을 서울로 바꿨습니다.

:: 2. 자동 시간 설정 끄기 (수동 설정 허용)
adb shell settings put global auto_time 0
adb shell settings put global auto_time_zone 0
echo [2/3] 주관 없는 자동 시간 설정을 껐습니다.

:: 3. 현재 호스트 PC 시간과 동기화
:: Windows shell에서는 PowerShell을 빌려 현재 시간을 구합니다.
for /f "tokens=*" %%a in ('powershell -Command "Get-Date -UFormat '%%m%%d%%H%%M%%Y.%%S'"') do set STAMP=%%a
adb shell date -u %STAMP%
echo [3/3] 사장님 컴퓨터 시간과 똑같이 맞췄습니다!

echo.
echo 충성! 모든 조치가 완료되었습니다. 
echo 이제 에뮬레이터를 껐다 켜도 한국 시간을 잘 기억할 겁니다.
echo.
pause
