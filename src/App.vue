<template lang="pug">
  div#q-app
    router-view
</template>

<script>
    import AuthProvider from './store/api/AuthProvider';
    export default {
      name: 'App',
      updated() {
        const provider = new AuthProvider(this);
        provider.checkAutorized()
            .then((response) => console.log(response, 'Флаг isAuth'))
            .catch((err) => console.log(err))
        }
    };
</script>

<style>
</style>
