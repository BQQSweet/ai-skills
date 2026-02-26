declare module "uview-plus" {
  import type { Plugin } from "vue";
  const uviewPlus: Plugin;
  export default uviewPlus;
}

declare interface Uni {
  $u: any;
}
