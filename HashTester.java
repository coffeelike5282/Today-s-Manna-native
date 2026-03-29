import java.util.Base64;

public class HashTester {
    public static void main(String[] args) {
        String sha1Hex = "5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25";
        String[] parts = sha1Hex.split(":");
        byte[] bytes = new byte[parts.length];
        for (int i = 0; i < parts.length; i++) {
            bytes[i] = (byte) Integer.parseInt(parts[i], 16);
        }
        String base64 = Base64.getEncoder().encodeToString(bytes);
        System.out.println("박 사장님! 검증된 진짜 지장은 이겁니다 ===> " + base64);
    }
}
