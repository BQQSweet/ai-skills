export const profileStats = [
  {
    value: "--",
    label: "下厨次数",
    helper: "暂无数据",
  },
  {
    value: "--",
    label: "收藏菜谱",
    helper: "暂无数据",
  },
  {
    value: "--",
    label: "勋章",
    helper: "即将开放",
  },
] as const;

export const profileKitchenCards = [
  {
    key: "badges",
    title: "我的勋章墙",
    helper: "即将开放",
    icon: "workspace_premium",
    iconClass: "bg-orange-100 dark:bg-orange-900/30 text-primary",
  },
  {
    key: "diary",
    title: "食光日记",
    helper: "暂无数据",
    icon: "auto_stories",
    iconClass: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600",
  },
  {
    key: "family",
    title: "家庭成员",
    helper: "",
    icon: "group",
    iconClass: "bg-blue-100 dark:bg-blue-900/30 text-blue-600",
  },
  {
    key: "devices",
    title: "厨房设备",
    helper: "即将开放",
    icon: "kitchen",
    iconClass: "bg-green-100 dark:bg-green-900/30 text-green-600",
  },
] as const;

export const profileServiceItems = [
  {
    key: "dietary",
    title: "饮食偏好",
    icon: "tune",
  },
  {
    key: "language",
    title: "语音语言设置",
    icon: "graphic_eq",
  },
  {
    key: "help",
    title: "帮助与反馈",
    icon: "help_center",
  },
  {
    key: "about",
    title: "关于 ChefMate",
    icon: "info",
  },
] as const;
