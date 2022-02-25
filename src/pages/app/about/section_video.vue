<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      position: 'relative',
      height: contentHeight ? 'auto' : contentHeight+'px',
      maxWidth: 500+'px',
      //- marginBottom: '500px',
    }`
    v-intersection=`{
      handler: $throttle(contentIsVisibleCallback, 150)
      }`
    ).row.full-width.items-start.content-start.q-mt-xl.q-mb-md
    q-resize-observer(@resize="contentHeightCallback")
    img(
      v-if="true || !contentIsVisible"
      src="https://thumbs-yandexdev.kalpa.store/m0/60/155408298210803763_600_thumb.jpg?rev=3"
      :style=`{
        borderRadius: '10px',
        overflow: 'hidden',
      }`
      ).full-width
    content-player(
      v-if="contentIsVisible"
      :contentKalpa=`{
        oid: contentOid,
        name: 'Кальпаграма',
        // url: 'https://www.youtube.com/embed/6n6mYnKo1fw',
        url: 'https://08a9ca80-f18e-4a00-8984-5edfca89184b.akamaized.net/pv/lb/235447603884507141_360p_content.mp4?rev=15',
        type: 'VIDEO',
        // contentSource: 'YOUTUBE',
        contentProvider: 'YOUTUBE',
      }`
      :options=`{
        mode: 'feed',
        footerOverlay: true,
        autoplay: false,
        showBar: false,
        showHeader: false,
      }`
      :styles=`{
        height: '100%',
        objectFit: 'contain',
      }`
      :style=`{
        position: 'absolute', zIndex: 100, top: '0px',
      }`).fit
</template>

<script>
import contentPlayer from 'src/components/content_player/index.vue'
import { assert } from 'src/system/common/utils'

export default {
  name: 'sectionVideo',
  components: {
    contentPlayer,
  },
  data () {
    return {
      contentHeight: null,
      contentIsVisible: false,
    }
  },
  computed: {
    contentOid () {
      const hostname = window.location.hostname
      return hostname === 'localhost' ? '155408298210803763' : '154412738355970078'
    }
  },
  methods: {
    contentIsVisibleCallback (entry) {
      let isVisible = !!entry.isIntersecting
      this.$log('contentIsVisibleCallback', isVisible)
      this.contentIsVisible = isVisible
    },
    contentHeightCallback (e) {
      this.$log('contentHeightCallback', e.height)
      if (!this.contentHeight && e.height > 0) this.contentHeight = e.height
    }
  }
}
</script>
