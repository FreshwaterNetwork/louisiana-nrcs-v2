import { createStore } from 'vuex';
// import esriRequest from '@arcgis/core/request';

export default createStore({
  state: {
    data: {
      // data retrieved from web services
      supportingLayers: '', //used to create the supportinglayer tree
      slReady: false,
    },
    config: {},
  },
  mutations: {},

  actions: {},

  modules: {},
});
