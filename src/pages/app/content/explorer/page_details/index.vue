<template lang="pug">
.row.full-width.justify-center
  div(:style=`{maxWidth: '700px'}`).row.full-width.items-start.content-start.q-px-sm
    //- DETAILS:
    .row.full-width
      div(
        :style=`{
          background: 'rgb(35,35,35)',
          borderRadius: '0 0 10px 10px',
        }`
        ).row.full-width
        //- HEADER:
        .row.full-width.q-py-sm.q-px-sm
          q-btn(
            @click="$router.back()"
            round flat color="white" icon="west")
          .col
            span.text-white.text-bold {{ contentKalpa.name }}
            .row.full-width.q-py-xs.q-pr-xl
              q-icon(name="visibility" color="grey-8").q-mr-xs
              small.text-grey-8.q-mr-xs 10923
              .col
              small.text-grey-8.q-mr-xs {{ $date(contentKalpa.createdAt, 'DD.MM.YYYY') }}
        //- FOOTER:
        .row.full-width.q-pa-xs
          kalpa-share(type="content" :item="contentKalpa")
          .col.full-height.q-px-xs
            //- TODO: contentKalpa.sourse
            //- kalpa, youtube, vk, instagram, tiktok, onlyfans
            q-btn(
              v-if="contentKalpa.contentSource !== 'KALPA'"
              @click="gotToOriginal"
              align="left"
              flat color="grey-9" no-caps
              :style=`{
                background: 'rgb(38,38,38)'
              }`).fit
              q-icon(name="fab fa-youtube" color="red" size="30px")
              span(:style=`{fontSize: '16px'}`).text-grey-4.text-bold.q-ml-sm YouTube
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
    .row.full-width.justify-center
      q-btn(flat dense color="white" no-caps @click="$emit('page', 'drafts')").col Черновики
      q-btn(flat dense color="white" no-caps @click="$emit('page', 'contents')").col Похожее
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
      else {
        return ''
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
