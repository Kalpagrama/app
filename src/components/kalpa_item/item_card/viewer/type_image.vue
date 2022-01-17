<template lang="pug">
.row.full-width.items-start.content-start
  div(
    :style=`{
      position: 'relative',
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
    }`
    ).row.full-width.items-start.content-start
    img(
      v-if="!playerReady"
      :src="item.thumbUrl"
      :style=`{
        borderRadius: '10px',
      }`
      ).full-width
    content-player(
      v-if="item.type === 'VIDEO'"
      @player="playerReady"
      :contentKalpa="item"
      :style=`{
      position: 'absolute', zIndex: 100, top: '0px',
    }`
    ).fit
    //- footer
    .row.full-width.items-center.content-center.no-wrap.q-pa-sm
      q-icon(name="select_all" color="white" size="36px").q-mr-sm
      span(:style=`{lineHeight: 1.2}`).text-white {{ item.name }}
</template>

<script>
import { ContentApi } from 'src/api/content'
import contentPlayer from 'src/components/content_player'

export default {
  name: 'typeImage',
  props: ['item', 'isActive'],
  components: {
    contentPlayer
  },
  data () {
    return {
      playerReady: false
    }
  },
  computed: {
    url () { return ContentApi.urlSelect(this.item) },
  }
}
</script>
