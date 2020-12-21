import { Vue } from "vue-property-decorator";

declare module "vue-property-decorator" {
  interface Vue {
    $gotToModal(args,props);
    $closeModal(arg1,arg2);
    $access_token_map()
  }
}