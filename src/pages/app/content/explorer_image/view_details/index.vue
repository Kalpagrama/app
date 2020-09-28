<template lang="pug">
q-page(
  :style=`{paddingTop: '8px'}`
  ).row.full-width.items-start.content-start.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px',}`).row.full-width.items-start.content-start.q-px-sm
    //- small.text-white {{ contentBookmark }}
    span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ contentBookmark.name }}
    .row.full-width.q-py-md
      .row.full-width
        //- q-btn(
          v-if="contentKalpa.contentSource !== 'KALPA'"
          @click="gotToOriginal"
          color="green" no-caps dense).q-px-sm Перейти на оригинал
      //- .row.full-width.q-px-sm
        small(:style=`{}`).text-white {{ contentKalpa.contentSource }}
    //- spheres
    .row.full-width.q-py-sm
      .row.full-width.q-py-md
        span.text-white.text-bold {{$t('Spheres', 'Сферы')}}
      ws-sphere-editor(v-if="contentBookmark" :item="contentBookmark")
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'wsContentExplorer_video_viewDetails',
  props: ['contentKalpa', 'contentBookmark'],
  data () {
    return {
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
    }
  },
  mounted () {
    this.$log('mounted')
    // this.$store.commit('ui/stateSet', ['wsContentLayers', null])
  }
}
</script>
