<style lang="stylus">
html {
  background: black;
}
</style>
<template lang="pug">
div(id="q-app").bg-black
  router-view
  //- div(v-if="!$store.state.core.online" :style=`{position: 'absolute', zIndex: 100000, top: '0px', height: '15px'}`).row.full-width.justify-end.items-center.q-px-md.bg-red-4
  //-   small(style=`{font-size: 8px}`).text-bold.text-primary {{'offline'}}
  //- h1 hello
</template>
