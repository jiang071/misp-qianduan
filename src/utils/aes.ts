const KEY = "misp2024@scau!#1";
const IV = "misp2024@scau!#1";

/**
 * AES-CBC 加密
 * @param content 待加密内容
 * @returns 加密后的 Base64 字符串
 */
export async function encrypt(content: string): Promise<string> {
  if (!content) {
    return "";
  }
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(KEY),
      { name: "AES-CBC" },
      false,
      ["encrypt"]
    );
    const iv = new TextEncoder().encode(IV);
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-CBC", iv: iv },
      key,
      new TextEncoder().encode(content)
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  } catch (e) {
    throw new Error("加密失败: " + (e as Error).message);
  }
}

/**
 * AES-CBC 解密
 * @param encryptStr 加密后的 Base64 字符串
 * @returns 解密后的内容
 */
export async function decrypt(encryptStr: string): Promise<string> {
  if (!encryptStr) {
    return "";
  }
  try {
    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(KEY),
      { name: "AES-CBC" },
      false,
      ["decrypt"]
    );
    const iv = new TextEncoder().encode(IV);
    const encryptedBytes = new Uint8Array(
      atob(encryptStr)
        .split("")
        .map(char => char.charCodeAt(0))
    );
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-CBC", iv: iv },
      key,
      encryptedBytes
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    throw new Error("解密失败: " + (e as Error).message);
  }
}

/**
 * 同步版本的 AES-CBC 加密（使用 Promise.resolve）
 * @param content 待加密内容
 * @returns 加密后的 Base64 字符串
 */
export function encryptSync(content: string): Promise<string> {
  return encrypt(content);
}
