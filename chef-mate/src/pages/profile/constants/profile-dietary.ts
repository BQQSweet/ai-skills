export const allergyOptions = ["花生", "海鲜", "坚果", "乳制品", "大豆"] as const;

export const habitOptions = [
  {
    id: "vegetarian",
    title: "素食主义",
    desc: "不包含肉类及家禽制品",
    icon: "eco",
    iconBg: "bg-orange-100",
    iconColor: "text-primary",
  },
  {
    id: "low_carb",
    title: "低碳水",
    desc: "严格控制淀粉和糖分的摄入",
    icon: "fitness_center",
    iconBg: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    id: "light",
    title: "少盐少油",
    desc: "追求食材本味，清淡健康",
    icon: "water_drop",
    iconBg: "bg-green-50",
    iconColor: "text-green-500",
  },
] as const;
