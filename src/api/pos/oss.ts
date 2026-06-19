import { http } from "@/utils/http";
import type { ApiResult } from "@/utils/request/types";
import { baseUrlApi } from "@/utils/request";

// OSS 上传文件
export const ossUpload = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return http.request<ApiResult>("post", baseUrlApi("/oss/upload"), {
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
};

// OSS 下载文件
export const ossDownload = (fileName: string) => {
  return http.request<Blob>("get", baseUrlApi("/oss/download"), {
    params: { fileName },
    responseType: "blob"
  });
};

// OSS 删除文件
export const ossDelete = (fileName: string) => {
  return http.request<ApiResult>("delete", baseUrlApi("/oss/delete"), {
    params: { fileName }
  });
};
