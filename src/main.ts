import Vue from 'nativescript-vue'
import App from './components/App.vue'
import VueDevtools from 'nativescript-vue-devtools'
import router from './router';
import { TNSFontIcon, fonticon } from 'nativescript-fonticon';

TNSFontIcon.debug = true;
TNSFontIcon.paths = {
  'fa': './fonts/font-awesome.css',
  //'ion': './ionicons.css'
};
TNSFontIcon.loadCss();
Vue.filter('fonticon', fonticon);

if (TNS_ENV !== 'production') {
  Vue.use(VueDevtools)
}
import store from './store'

// Prints Vue logs when --env.production is *NOT* set while building
Vue.config.silent = (TNS_ENV === 'production')
Vue.registerElement(
  'MapboxView',
  () => require('@nativescript-community/ui-mapbox').MapboxView
);

Vue.registerElement(
  'fab',
  () => require('@nstudio/nativescript-floatingactionbutton').Fab
);

Vue.prototype.$gotToModal = function (to,props) {
  if (!router[to]) return;
  return this.$showModal(router[to], { fullscreen: true, props: props });
};

Vue.prototype.$closeModal = function (context,data) {
  context.$modal.close(data);
};

Vue.prototype.access_token_map = function(){
  return "pk.eyJ1Ijoib3NjYXJsZDA5MCIsImEiOiJja2l4OGFhcTgweHNtMnhydzhuNGZuazlrIn0.hkw7WVA78y3mILSY-ibYKQ";
}

new Vue({
  store,
  render: h => h('frame', [h(App)])
}).$start()
