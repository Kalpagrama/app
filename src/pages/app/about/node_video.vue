<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      position: 'relative',
      height: contentHeight ? 'auto' : contentHeight+'px',
      maxWidth: 700+'px',
      //- marginBottom: '500px',
    }`
    v-observe-visibility=`{
      throttle: 150,
      callback: contentIsVisibleCallback,
      }`
    ).row.full-width.items-start.content-start
    q-resize-observer(@resize="contentHeightCallback")
    //img(
    //  v-if="true || !contentIsVisible"
    //  src="https://contents-yandexdev.kalpa.store/27/az/231512242036717573_1920_content.jpg?rev=5"
    //  :style=`{
    //    borderRadius: '10px',
    //    overflow: 'hidden',
    //  }`
    //  ).full-width
    content-player(
      v-if="contentIsVisible"
      :contentKalpa=`{
        oid: contentOid,
        name: 'Кальпаграма',
        url: 'https://static-api-dev-kalpa-app.kalpa.store/local_object_storage/contents/8q/d0/231850638999339026_360p_content.mp4?rev=9',
        type: 'VIDEO',
        // contentSource: 'YOUTUBE',
        contentProvider: 'YOUTUBE',
      }`
      :isActive="false"
      :isVisible="true"
      :isMini="false"
      :options=`{
        mode: 'feed',
        footerOverlay: true,
        showBar: false,
        showHeader: false,
      }`
      :styles=`{
        height: '100%',
        objectFit: 'contain',
        borderRadius: '10px',
      }`
      :style=`{
        position: 'absolute', zIndex: 100, top: '0px', borderRadius: '10px',
      }`).fit
</template>

<script>
import contentPlayer from 'src/components/content_player/index.vue'

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
    contentIsVisibleCallback (isVisible, entry) {
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
