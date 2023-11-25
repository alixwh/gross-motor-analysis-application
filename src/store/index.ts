import { createStore } from 'vuex';

export default createStore({
  state: {
    myGlobalVariable: 'Hello from Vuex!'
  },
  mutations: {
    updateGlobalVariable(state, newValue) {
      state.myGlobalVariable = newValue;
    }
  },
  actions: {
    updateGlobalVariable(context, newValue) {
      context.commit('updateGlobalVariable', newValue);
    }
  },
  getters: {
    getGlobalVariable: state => state.myGlobalVariable
  }
});
