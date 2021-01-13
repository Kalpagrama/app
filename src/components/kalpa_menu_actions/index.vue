<template lang="pug">
q-btn(round flat :icon="icon" :color="color")
  q-popup-proxy(
    maximized position="bottom" dark
    cover anchor="top right" self="top right").b-40
    div(
      :style=`{
      }`
      ).row.full-width.items-start.content-start.b-40
      .row.full-width.items-center.content-center.q-pa-sm
        div(:style=`{overflow: 'hidden',}`).col
          span(:style=`{whiteSpace: 'nowrap'}`).text-white.text-bold.q-ml-sm {{ title }}
        q-btn(round flat dense color="white" icon="clear" v-close-popup)
      //- kalpa-share(type="node" :item="node").full-width
        template(v-slot:btn=`{start}`)
          q-btn(
            @click="start"
            flat color="white" no-caps
            :style=`{
              height: '50px',
            }`
            ).full-width
            span.text-bold Поделиться
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
    }
  }
}
</script>
