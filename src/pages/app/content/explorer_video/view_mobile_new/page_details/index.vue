<template lang="pug">
q-page().q-pa-lg
  div(
    :style=`{
      background: 'rgb(35,35,35)',
      borderRadius: '10px',
    }`
    ).row.full-width
    .row.full-width.q-pa-md
      span.text-white.text-bold {{ contentKalpa.name }}
    .row.full-width.q-px-sm.q-pt-md.q-mb-sm
      kalpa-bookmark(
        v-if="contentKalpa"
        :oid="contentKalpa.oid"
        :type="contentKalpa.type"
        :name="contentKalpa.name"
        :thumbUrl="contentKalpa.thumbUrl"
        :isActive="true"
        inactiveColor="grey-8"
        :fields=`{contentType: contentKalpa.type}`
        @bookmark="$event => $emit('bookmark', $event)")
      .col.full-height.q-px-sm
        q-btn(
          @click="gotToOriginal"
          outline color="grey-5" icon="launch" no-caps).fit.b-50
          span.text-bold.q-ml-sm на оригинал
      kalpa-share(type="content" :item="contentKalpa")
    //- .row.full-width.justify-center.q-py-xs
      q-btn(
        flat color="red-5" no-caps)
        span Пожаловаться
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'pageDetails',
  props: ['contentKalpa'],
  methods: {
    gotToOriginal () {
      this.$log('gotToOriginal')
      // TODO: urlOriginal...
      if (this.contentKalpa.contentSource === 'YOUTUBE') {
        let arr = this.contentKalpa.url.split('/')
        let isEmbed = arr[arr.length - 2] === 'embed'
        if (isEmbed) openURL(`https://www.youtube.com/watch?v=${arr[arr.length - 1]}`)
        else openURL(this.contentKalpa.url)
      }
    },
  }
}
</script>
