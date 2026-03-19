import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import uviewPlus from "uview-plus";
import App from "./App.vue";
import CmBottomSheet from "./components/CmBottomSheet/CmBottomSheet.vue";
import CmIcon from "./components/CmIcon/CmIcon.vue";
import CmInput from "./components/CmInput/CmInput.vue";
import CmPageShell from "./components/CmPageShell/CmPageShell.vue";
import CmTag from "./components/CmTag/CmTag.vue";
import CmTabBar from "./components/CmTabBar/CmTabBar.vue";

import "@/styles/index.scss";
export function createApp() {
  const app = createSSRApp(App);

  // 注册全局组件
  app.component("CmBottomSheet", CmBottomSheet);
  app.component("CmIcon", CmIcon);
  app.component("CmInput", CmInput);
  app.component("CmPageShell", CmPageShell);
  app.component("CmTag", CmTag);
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
