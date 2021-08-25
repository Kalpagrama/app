<template lang="pug">
q-btn(round flat :icon="icon" :color="color" :dense="dense")
  //- maximized position="bottom" dark
  q-popup-proxy(
    :contentStyle=`{
      borderRadius: '10px 10px 10px 10px',
    }`
    cover anchor="top right" self="top right" dark
    max-width="200px"
    position="bottom")
    div(
      :style=`{
        borderRadius: '10px 10px 0 0',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }`
      ).row.full-width.items-start.content-start.b-40
      //- header
      div(
        ).row.full-width.items-center.content-center
        span( v-if="headerText" :style=`{fontSize: '24px'}`).text-white.text-bold {{ headerText }}
        .col
        q-btn(round flat color="white" icon="clear" v-close-popup)
      //- body
      .row.full-width.items-start.content-start.q-mb-xl
        q-btn(
          @click="a.cb()"
          v-for="(a,akey) in actions" :key="akey"
          v-close-popup
          flat no-caps
          :color="a.color || 'white'"
          :style=`{
            height: '50px',
          }`
          ).full-width
          span {{ a.name }}
</template>

<script>
export default {
  name: 'kalpaMenuActions',
  props: {
    headerText: {
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
