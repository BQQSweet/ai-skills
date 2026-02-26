import { DEFAULT_LAYOUT } from "../base";
import { AppRouteRecordRaw } from "../types";

const RECIPE: AppRouteRecordRaw = {
  path: "/recipe",
  name: "recipe",
  component: DEFAULT_LAYOUT,
  meta: {
    locale: "menu.recipe",
    requiresAuth: true,
    icon: "icon-book",
    order: 1,
  },
  children: [
    {
      path: "list",
      name: "RecipeList",
      component: () => import("@/views/recipe/list/index.vue"),
      meta: {
        locale: "menu.recipe.list",
        requiresAuth: true,
        roles: ["admin"],
      },
    },
    {
      path: "create",
      name: "RecipeCreate",
      component: () => import("@/views/recipe/form/index.vue"),
      meta: {
        locale: "menu.recipe.create",
        requiresAuth: true,
        roles: ["admin"],
      },
    },
    {
      path: "edit/:id",
      name: "RecipeEdit",
      component: () => import("@/views/recipe/form/index.vue"),
      meta: {
        locale: "menu.recipe.edit",
        requiresAuth: true,
        roles: ["admin"],
        hideInMenu: true,
      },
    },
  ],
};

export default RECIPE;
