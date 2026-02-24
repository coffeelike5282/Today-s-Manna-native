const { execSync } = require('child_process');

try {
    // RUN keytool to get SHA1
    const output = execSync('keytool -list -v -keystore "android/app/debug.keystore" -alias androiddebugkey -storepass android -keypass android', { encoding: 'utf8' });

    // Extract SHA1: XX:XX:XX...
    const sha1Match = output.match(/SHA1:\s+((?:[0-9A-F]{2}:){19}[0-9A-F]{2})/);
    if (sha1Match) {
        const hexStr = sha1Match[1].replace(/:/g, '');
        // Convert to Base64
        const base64Hash = Buffer.from(hexStr, 'hex').toString('base64');
        console.log("=== KAKAO KEY HASH ===");
        console.log(base64Hash);
        console.log("======================");
    } else {
        console.log("SHA1 not found in keytool output.");
    }
} catch (error) {
    console.error("Error executing keytool:", error.message);
}
