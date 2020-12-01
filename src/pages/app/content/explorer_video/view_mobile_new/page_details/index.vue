<template lang="pug">
q-page(
  :style=`{
    paddingBottom: '100px',
  }`).row.full-width.justify-center
  div(:style=`{maxWidth: '700px'}`).row.full-width
    //- DETAILS:
    .row.full-width.q-pa-sm
      div(
        :style=`{
          background: 'rgb(35,35,35)',
          borderRadius: '10px',
        }`
        ).row.full-width
        //- HEADER:
        .row.full-width.q-pa-md
          span.text-white.text-bold {{ contentKalpa.name }}
          .row.full-width.q-py-xs
            small.text-grey-8.q-mr-xs 10923
            q-icon(name="visibility" color="grey-8").q-mr-xs
            small.text-grey-8.q-mr-xs {{ $date(contentKalpa.createdAt, 'DD.MM.YYYY') }}
        //- FOOTER:
        .row.full-width.q-pa-sm
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
    //- SIMILAR:
    .row.full-width.items-start.content-start.q-px-sm
      div(
        v-for="(c,ci) in 10" :key="ci"
        :style=`{
          height: '120px',
          background: 'rgb(35,35,35)',
          borderRadius: '10px',
        }`
        ).row.full-width.q-mb-sm
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
  },
  computed: {
    actions () {
      return {
        report: {
          name: 'Пожаловаться',
          cb: () => {
            this.$log('contentReport...')
          }
        }
      }
    },
  }
}
</script>
