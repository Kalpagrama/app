<template lang="pug">
  div(
    :style=`{
      position: 'relative',
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
    }`
    )
    img(
      v-if="!playerReady"
      :src="item.thumbUrl"
      :style=`{
        borderRadius: '10px',
      }`
      ).row.full-width
    //- footer
    .row.full-width.items-center.content-center.no-wrap.q-pa-sm
      q-icon(name="select_all" color="white" size="36px").q-mr-sm
      span(:style=`{lineHeight: 1.2}`).text-white {{ item.name }}
</template>

<script>
import { ContentApi } from 'src/api/content'
import contentPlayer from 'src/components/content_player/index.vue'

export default {
  name: 'typeBook',
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
  },
  mounted() {
    this.$log('item!!!!!=', JSON.parse(JSON.stringify(this.item)))
  }
}
</script>
