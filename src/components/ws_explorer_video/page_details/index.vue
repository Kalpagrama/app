<template lang="pug">
.row.full-width.items-start.content-start.q-pa-md
  span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ contentWorkspace.name }}
  .row.full-width.q-py-md
    .row.full-width
      q-btn(
        v-if="contentKalpa.contentSource !== 'KALPA'"
        @click="gotToOriginal"
        color="green" no-caps dense).q-px-sm Перейти на оригинал
    .row.full-width.q-px-sm
      small(:style=`{}`).text-white {{ contentKalpa.contentSource }}
  //- spheres
  .row.full-width.q-py-md
    .row.full-width.q-px-sm
      span.text-white.text-bold Сферы
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'wsContentExplorer_pageDetails',
  props: ['mode', 'contentWorkspace', 'contentKalpa'],
  data () {
    return {
    }
  },
  computed: {},
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
  }
}
</script>
