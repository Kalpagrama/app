import Vue from 'vue';

export const store = Vue.observable({
    isAuth: false,
    user: {
        oid: null
    },
});

export const stateMutations = {
    setUser (val) {
        store.isAuth = val;
    },
    getUser () {
        return store.isAuth;
    },
};
