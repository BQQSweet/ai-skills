import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import uviewPlus from "uview-plus";
import App from "./App.vue";
import CmIcon from "./components/CmIcon/CmIcon.vue";
import CmInput from "./components/CmInput/CmInput.vue";
import CmTabBar from "./components/CmTabBar/CmTabBar.vue";

import "@/styles/index.scss";
export function createApp() {
  const app = createSSRApp(App);

  // 注册全局组件
  app.component("CmIcon", CmIcon);
  app.component("CmInput", CmInput);
  app.component("CmTabBar", CmTabBar);

  // 状态管理
  const pinia = createPinia();
  app.use(pinia);
  app.use(uviewPlus, () => {
    return {
      options: {
        config: {
          unit: "rpx",
        },
      },
    };
  });

  return {
    app,
  };
}
