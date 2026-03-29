import java.io.FileInputStream;
import java.security.MessageDigest;
import java.util.Base64;

public class BinaryHashTester {
    public static void main(String[] args) throws Exception {
        FileInputStream fis = new FileInputStream("cert.bin");
        byte[] certBytes = fis.readAllBytes();
        fis.close();

        MessageDigest md = MessageDigest.getInstance("SHA1");
        byte[] sha1Bytes = md.digest(certBytes);
        
        String base64 = Base64.getEncoder().encodeToString(sha1Bytes);
        System.out.println("박 사장님! 바이너리 분석으로 추출한 100% 진짜 지장입니다 ===> " + base64);
    }
}
