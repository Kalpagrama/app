<template lang="pug">
q-btn(round flat :icon="icon" :color="color" :dense="dense")
  //- maximized position="bottom" dark
  q-menu(
    cover anchor="top right" self="top right" dark
    max-width="200px")
    div(
      :style=`{
      }`
      ).row.full-width.items-start.content-start
      q-btn(
        @click="a.cb()"
        v-for="(a,akey) in actions" :key="akey"
        v-close-popup
        flat no-caps dense
        :color="a.color || 'white'"
        :style=`{
        }`
        ).full-width
        span {{ a.name }}
</template>

<script>
export default {
  name: 'kalpaMenuActions',
  props: {
    title: {
      type: String,
    },
    actions: {
      type: Object
    },
    icon: {
      type: String,
      default: 'more_horiz'
    },
    color: {
      type: String,
      default: 'grey-9'
    },
    dense: {
      type: Boolean,
      default: false,
    }
  }
}
</script>
