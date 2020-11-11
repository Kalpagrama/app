<template lang="pug">
q-page(
  :style=`{
    paddingTop: '0px',
  }`
  ).row.full-width.justify-center.items-start.content-start
  .row.full-width.justify-center
    div(
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
        height: '60px',
      }`
      ).row.full-width.items-center.content-center.q-pa-sm
      q-btn(
        @click="$emit('close')"
        flat color="white" no-caps icon="keyboard_arrow_left")
        span.text-white.q-ml-sm назад к категориям
  .row.full-width.justify-center
    kalpa-finder(
      @contentKalpa="$event => $router.push('/content/'+$event.oid)"
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
        height: $q.screen.height-60+'px',
      }`)
      template(v-slot:tint=`{item}`)
        div(
          @click="itemLaunch(item)"
          :style=`{position: 'absolute', zIndex: 1000,}`).row.fit
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'trends_viewSearch',
  data () {
    return {
    }
  },
  computed: {
  },
  methods: {
    itemLaunch (item) {
      this.$log('itemLaunch', item)
      if (item.wsItemType) {
        confirm('Open in workspace?')
      }
      else {
        let itemLaunchMap = {
          NODE: '/node/',
          JOINT: '/joint/',
          USER: '/user/',
          SPHERE: '/sphere/',
          WORD: '/sphere/',
          SENTENCE: '/sphere/',
          VIDEO: '/content/',
          IMAGE: '/content/'
        }
        let p = itemLaunchMap[item.type]
        this.$log('p', p)
        if (p) {
          this.$router.push(p + item.oid)
        }
      }
    },
  }
}
</script>
