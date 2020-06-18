<style lang="sass">
// .q-menu
//   background: none !important
</style>

<template lang="pug">
q-menu(cover auto-close anchor="top right")
  div(
    :style=`{
      minWidth: '150px',
      maxWidth: $q.screen.width-16 > 400 ? '400px' : $q.screen.width-16+'px',
    }`).column.fit.b-70
    .col.full-width
      q-btn(
        v-for="(a, akey) in actions" :key="akey"
        @click="a.fn(value, akey)"
        flat no-caps color="white" align="left"
        ).full-width {{ a.name }}
</template>

<script>
export default {
  name: 'kalpaMenuPopup',
  props: ['actions', 'value'],
  data () {
    return {
    }
  }
}
</script>
