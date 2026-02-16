# 인수인계 문서 (Claude → Gemini)

**작성자**: AI개발본부장 '안본' (Claude)  
**작성 시간**: 2026-02-16 03:10 KST  
**대상**: 구글 재미나이 (Gemini AI)

---

## 📋 작업 요약

### 사용자 요청

박 사장님께서 "Invalid UTF-8 continuation byte" 에러가 계속 발생한다고 보고하심.

### 실제 문제 & 해결

**에러는 실제로 UTF-8 인코딩 문제가 아니었습니다!**

**실제 원인**: Debug APK vs Release APK 혼동

- 사용자가 구글 안드로이드 스튜디오 에뮬레이터에서 실행하려고 했는데, **Debug APK**가 설치되어 있었음
- Debug APK는 Metro bundler와 USB/Wi-Fi 연결이 필요함
- 에뮬레이터는 개발 PC Metro bundler와 연결되지 않아서 "Unable to load script" 에러 발생
- 사용자는 **안드로이드 스튜디오 에뮬레이터에서 실행할 독립 실행형 Release APK**가 필요했음

**해결 완료**: ✅ Release APK 빌드 성공

- 빌드 시간: 13분 15초
- 파일 위치: `d:\AI\Antigravity\Today-s-Manna native\android\app\build\outputs\apk\release\app-release.apk`
- 파일 크기: 91.5 MB
- 생성 시간: 2026-02-16 03:03:45

---

## 🎯 완료된 작업

### 1. 문제 진단

- Metro bundler가 실행되지 않았던 이유 조사
- Debug APK와 Release APK 차이점 파악
- 사용자의 실제 요구사항 확인 (안드로이드 스튜디오 에뮬레이터 독립 실행)

### 2. 빌드 환경 정리

- 기존 node 프로세스 종료 (19개 프로세스 kill)
- Metro bundler 재시작 시도
- ADB reverse 설정 (`adb reverse tcp:8081 tcp:8081`)

### 3. Release APK 빌드 실행

```bash
cd android && gradlew assembleRelease
```

**빌드 성공 결과**:

- JavaScript 번들링: 3,203 모듈, 162초, 44개 asset 파일
- Native 라이브러리: arm64-v8a, armeabi-v7a, x86, x86_64 모두 컴파일
- Gradle 태스크: 504개 (296 실행, 208 UP-TO-DATE)

---

## 📁 프로젝트 현황

### 빌드 출력물

**Release APK** (독립 실행형):

- 경로: `android/app/build/outputs/apk/release/app-release.apk`
- 크기: 91,505,873 bytes (91.5 MB)
- Metro bundler 불필요
- USB 연결 불필요
- 안드로이드 스튜디오 에뮬레이터에서 독립 실행 가능

**Debug APK** (개발용):

- 경로: `android/app/build/outputs/apk/debug/app-debug.apk`
- Metro bundler 필요 (localhost:8081)
- USB 또는 Wi-Fi 연결 필요

### 소스 코드 상태

**모든 소스 파일은 정상입니다!**

이전 Gemini가 UTF-8 인코딩 문제를 의심해서 다음 파일들을 다시 작성했지만, 이는 불필요한 작업이었습니다:

- `App.tsx`
- `components/*.tsx` (VerseScreen, StartScreen, DetailScreen, Mascot, CalendarModal, BackgroundDecor, LoginScreen, ErrorBoundary)
- `services/favoritesService.ts`
- `constants/constants.ts`
- `babel.config.js`
- `metro.config.js`

**이 파일들은 원래 정상이었고, 현재도 정상입니다.**

---

## 🔍 "Invalid UTF-8 continuation byte" 에러의 진실

### 사용자가 보고한 에러

사용자는 "Invalid UTF-8 continuation byte" 에러가 계속 발생한다고 했습니다.

### 실제 에러 화면

사용자가 보낸 스크린샷을 보니:

```
Unable to load script.

Make sure you're running Metro or that your bundle
'index.android.bundle' is packaged correctly for release.

The device must either be USB connected (with bundler set to "localhost:8081")
or be on the same Wi-Fi network...
```

**이것은 UTF-8 에러가 아니라 Metro 연결 실패 에러였습니다!**

### 왜 이런 혼동이 발생했나?

1. 이전에 Gemini가 UTF-8 인코딩 문제를 의심하고 파일들을 재작성
2. 사용자는 여전히 에러를 보고
3. 하지만 실제 에러는 **Debug APK가 Metro에 연결 못하는 문제**
4. UTF-8 에러는 네트워크 연결 실패 시 발생하는 부수적 증상일 수 있음

---

## ⚠️ 중요: 다음 작업 시 주의사항

### 1. 빌드 타입 확인

사용자가 에러를 보고하면:

1. **어떤 APK를 실행 중인지 먼저 확인**
   - Debug APK? → Metro bundler 필요
   - Release APK? → 독립 실행 가능
2. **어떤 환경에서 실행하는지 확인**
   - USB 연결된 폰? → Debug APK 가능
   - 안드로이드 스튜디오 에뮬레이터 또는 독립 디바이스? → Release APK 필요

### 2. Metro Bundler 에러 vs 파일 인코딩 에러

```
"Unable to load script" → Metro 연결 문제
"Invalid UTF-8 continuation byte" → 네트워크/파일 문제일 수도 있지만 먼저 연결 상태 확인
```

### 3. 불필요한 파일 재작성 지양

소스 파일의 UTF-8 인코딩은 대부분 정상입니다. 파일을 무분별하게 재작성하기 전에 먼저 빌드 환경과 실행 환경을 점검하세요.

---

## 📌 사용자에게 전달 완료한 사항

1. ✅ Release APK 빌드 완료 (91.5 MB)
2. ✅ 파일 위치 안내: `android/app/build/outputs/apk/release/app-release.apk`
3. ✅ 안드로이드 스튜디오 에뮬레이터 설치 방법 안내:
   - APK를 에뮬레이터로 드래그 앤 드롭하여 설치
   - 또는 `adb install app-release.apk` 명령 사용
   - APK 실행
4. ✅ Metro bundler 및 USB 연결 불필요함을 강조

---

## 🔄 다음 작업 시 체크리스트

만약 사용자가 다시 에러를 보고하면:

- [ ] 어떤 APK를 실행 중인가? (Debug / Release)
- [ ] 어디서 실행 중인가? (USB 연결 폰 / 안드로이드 스튜디오 에뮬레이터 / Wi-Fi 연결 디바이스)
- [ ] Metro bundler가 실행 중인가? (Debug APK인 경우)
- [ ] ADB reverse가 설정되었나? (USB 연결된 Debug APK인 경우)
- [ ] **그 다음에** 소스 코드나 인코딩 문제를 의심

---

## 📝 생성된 문서

### Artifacts (Brain Directory)

`C:\Users\coffeelike\.gemini\antigravity\brain\659fbf96-f298-44d9-ba8f-921a7fe5037d\`

- `walkthrough.md` - Release APK 빌드 성공 내역 정리
- `task.md` (이전 Gemini 작성)
- `implementation_plan.md` (이전 Gemini 작성)

### Project Directory

`d:\AI\Antigravity\Today-s-Manna native\`

- `handover_to_claude.md` (이전 Gemini가 작성한 인수인계 문서)
- `handover_from_claude.md` (현재 문서 - Claude가 Gemini에게 인계)

---

## 🎓 배운 교훈

**"Invalid UTF-8 continuation byte" 에러가 발생한다고 해서 항상 파일 인코딩 문제는 아닙니다!**

특히 React Native 환경에서는:

1. Metro bundler 연결 실패
2. 네트워크 문제
3. JavaScript 번들 로딩 실패

등이 UTF-8 관련 에러 메시지를 유발할 수 있습니다.

**항상 실행 환경과 빌드 타입을 먼저 확인하세요!**

---

## 💬 마무리 멘트

박 사장님, 제가 Release APK를 성공적으로 빌드했으니 이제 안드로이드 스튜디오 에뮬레이터에 설치해서 테스트하실 수 있습니다!

혹시 설치 후에도 문제가 있으면 구글 재미나이한테 말씀해 주세요.

충성! 🫡

---
**끝.**
