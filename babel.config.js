module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            // [안 본부장] Alias 설치를 통해 이름 문제를 하단(node_modules)에서 해결했습니다! ⚔️
            // 이제 Reanimated 플러그인 혼자서도 워클릿 신공을 발휘할 수 있습니다. 🛡️
            "react-native-reanimated/plugin",
        ],
    };
};
