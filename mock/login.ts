// 根据角色动态生成路由
import { defineFakeRoute } from "vite-plugin-fake-server/client";

const KEY = "misp2024@scau!#1";
const IV = "misp2024@scau!#1";

/**
 * 模拟后端 AES-CBC 解密
 */
function decrypt(encryptStr: string): string {
  if (!encryptStr) {
    return "";
  }
  try {
    const encryptedBytes = new Uint8Array(
      atob(encryptStr)
        .split("")
        .map(char => char.charCodeAt(0))
    );

    const key = new Uint8Array(16);
    const iv = new Uint8Array(16);

    const keyBytes = new TextEncoder().encode(KEY);
    const ivBytes = new TextEncoder().encode(IV);

    for (let i = 0; i < 16 && i < keyBytes.length; i++) {
      key[i] = keyBytes[i];
    }
    for (let i = 0; i < 16 && i < ivBytes.length; i++) {
      iv[i] = ivBytes[i];
    }

    return aesDecrypt(encryptedBytes, key, iv);
  } catch (e) {
    console.error("Decrypt error:", e);
    return encryptStr;
  }
}

/**
 * 简化的 AES-CBC 解密（模拟后端解密逻辑）
 */
function aesDecrypt(data: Uint8Array, key: Uint8Array, iv: Uint8Array): string {
  try {
    const blockSize = 16;
    const numBlocks = Math.ceil(data.length / blockSize);
    const decrypted: number[] = [];

    for (let block = 0; block < numBlocks; block++) {
      const start = block * blockSize;
      const end = Math.min(start + blockSize, data.length);
      const cipherBlock = data.slice(start, end);

      for (let i = 0; i < cipherBlock.length; i++) {
        decrypted.push(
          cipherBlock[i] ^ (i < iv.length ? iv[i] : iv[i % iv.length])
        );
      }
    }

    const padding = decrypted[decrypted.length - 1];
    return new TextDecoder().decode(
      new Uint8Array(decrypted.slice(0, decrypted.length - padding))
    );
  } catch (e) {
    return "";
  }
}

export default defineFakeRoute([
  {
    url: "/user/login",
    method: "post",
    response: ({ body }) => {
      const { userId, password } = body;

      console.log("Login request:", { userId, password });

      // 模拟后端解密密码
      let decryptedPassword = "";
      try {
        decryptedPassword = decrypt(password);
        console.log("Decrypted password:", decryptedPassword);
      } catch (e) {
        console.error("Decrypt failed, using original password:", e);
        decryptedPassword = password;
      }
      // 根据 userId 返回不同角色的用户信息
      if (userId === "admin") {
        return {
          success: true,
          data: {
            username: "admin",
            nickname: "小铭",
            roles: ["admin"],
            permissions: ["*:*:*"],
            accessToken: "eyJhbGciOiJIUzUxMiJ9.admin",
            refreshToken: "eyJhbGciOiJIUzUxMiJ9.adminRefresh",
            expires: "2030/10/30 00:00:00"
          }
        };
      } else {
        return {
          success: true,
          data: {
            username: "common",
            nickname: "小林",
            roles: ["common"],
            permissions: ["permission:btn:add", "permission:btn:edit"],
            accessToken: "eyJhbGciOiJIUzUxMiJ9.common",
            refreshToken: "eyJhbGciOiJIUzUxMiJ9.commonRefresh",
            expires: "2030/10/30 00:00:00"
          }
        };
      }
    }
  }
]);
