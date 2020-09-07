<template lang="pug">
q-page(
  :style=`{paddingTop: '8px'}`
  ).row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: '600px',}`).row.full-width.items-start.content-start.q-px-sm
    span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ contentWorkspace.name }}
    .row.full-width.q-py-md
      .row.full-width
        q-btn(
          v-if="contentKalpa.contentSource !== 'KALPA'"
          @click="gotToOriginal"
          icon="fab fa-youtube"
          color="green" outline no-caps dense).full-width.q-px-sm
          span.q-mx-sm View original
    //- spheres
    .row.full-width.q-py-sm
      .row.full-width.q-py-md
        span.text-white.text-bold Сферы
      ws-sphere-editor(:item="contentWorkspace")
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'wsContentExplorer_video_viewDetails',
  components: {},
  props: ['contentKalpa', 'contentWorkspace'],
  data () {
    return {
      sphere: '',
      sphereAdding: false,
      sphereEditing: false,
    }
  },
  methods: {
    gotToOriginal () {
      this.$log('gotToOriginal')
      if (this.contentKalpa.contentSource === 'YOUTUBE') {
        let arr = this.contentKalpa.url.split('/')
        let isEmbed = arr[arr.length - 2] === 'embed'
        if (isEmbed) openURL(`https://www.youtube.com/watch?v=${arr[arr.length - 1]}`)
        else openURL(this.contentKalpa.url)
      }
    },
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['wsContentLayers', null])
  }
}
</script>
