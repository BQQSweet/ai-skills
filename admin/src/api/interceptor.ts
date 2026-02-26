import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import { Message, Modal } from "@arco-design/web-vue";
import { useUserStore } from "@/store";
import { getToken } from "@/utils/auth";

export interface HttpResponse<T = unknown> {
  status: number;
  msg: string;
  code: number;
  data: T;
}

if (import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL;
}

axios.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      if (!config.headers) {
        config.headers = {};
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

axios.interceptors.response.use(
  (response: AxiosResponse<HttpResponse>) => {
    const res = response.data;
    // ChefMate 后端成功状态码为 0
    if (res.code !== 0) {
      Message.error({
        content: res.msg || "请求失败",
        duration: 5 * 1000,
      });
      // Token 无效或过期
      if ([1002, 1003].includes(res.code)) {
        Modal.error({
          title: "登录已过期",
          content: "您的登录凭证已失效，请重新登录",
          okText: "重新登录",
          async onOk() {
            const userStore = useUserStore();
            userStore.logoutCallBack();
            window.location.reload();
          },
        });
      }
      return Promise.reject(new Error(res.msg || "Error"));
    }
    return res;
  },
  (error) => {
    const msg = error.response?.data?.msg || error.message || "网络请求失败";
    Message.error({
      content: msg,
      duration: 5 * 1000,
    });
    return Promise.reject(error);
  },
);
