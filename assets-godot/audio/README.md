# Godot용 생성 오디오

레포 루트에서 `node tools/audio/render.js`를 실행하면 `bgm/*.wav`와 `sfx/*.wav`를 만든다. 44.1kHz·16bit·스테레오 PCM이며, 반복곡의 WAV에는 `smpl` 루프 정보가 들어간다. 엔딩과 효과음은 반복하지 않는다.

WAV와 `manifest.json`·`validation.json`은 이 폴더의 새 `.gitignore`에서 제외한다. Git에는 원본 악보·음색·렌더 코드만 남긴다. 기존 파일과 웹 게임 연결은 이번 단계에서 수정하지 않았다.

악보 표기, 전체 곡·효과음 목록, 검사 기준과 다음 단계 연결안은 [음악 원본 README](../../design/data/music/README.md)를 따른다. 부분 렌더 후 보고서는 선택한 파일만 담으므로, 전체 목록이 필요하면 인자 없이 렌더하거나 `node tools/audio/render.js --verify`를 실행한다.
