<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`).row.full-width.items-start.content-start
    //- header
    .row.full-width.q-pa-sm
      .row.full-width.items-center.content-center
        .col.q-pa-sm
          span.text-white.text-bold {{ contentKalpa.name }}
        kalpa-menu-actions(icon="more_vert" :title="contentKalpa.name" :actions="actions")
      .row.full-width.q-pt-md.q-px-sm
        q-icon(name="visibility" color="grey-8").q-mr-xs
        small.text-grey-8.q-mr-xs 10923
        .col
        small.text-grey-8.q-mr-xs {{ $date(contentKalpa.createdAt, 'DD.MM.YYYY') }}
    //- actions
    .row.full-width.q-pl-xs.q-pr-sm
      q-btn(
        v-if="contentKalpa.contentSource !== 'KALPA'"
        @click="gotToOriginal"
        align="left"
        flat color="grey-9" no-caps
        :style=`{
          //- background: 'rgb(38,38,38)'
        }`).full-height
        q-icon(name="fab fa-youtube" color="red" size="30px")
        span(:style=`{fontSize: '16px'}`).text-grey-4.text-bold.q-ml-sm YouTube
      .col
      kalpa-share(type="content" :item="contentKalpa")
      //- kalpa-menu-actions(icon="more_vert" :actions="actions")
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
    //- similar content
    .row.full-width.q-pa-sm
      div(
        @click="relatedContentClick(c)"
        v-for="(c,ci) in contentKalpa.relatedVideos" :key="ci"
        :style=`{
          height: '70px',
          borderRadius: '10px',
          background: 'rgb(45,45,45)',
        }`
        ).row.full-width.items-center.content-center.q-mb-sm
        div(
          :style=`{
            width: '70px', height: '70px',
          }`
          ).row
          img(
            draggable="false"
            :src="c.thumbnails[0].url"
            :style=`{
              borderRadius: '10px',
              objectFit: 'cover',
            }`).fit
        .col.q-pa-sm
          .row.fit.items-center.content-center
            span.text-white {{ c.title }}
</template>

<script>
import { openURL } from 'quasar'

export default {
  name: 'pageDetails',
  props: ['contentKalpa', 'player'],
  computed: {
    actions () {
      return {
        copyUrl: {
          name: 'Скопировать ссылку',
          cb: () => {
            this.$log('copyUrl')
          }
        },
        hide: {
          name: 'Скрыть',
          cb: () => {},
        },
        // report: {
        //   name: 'Пожаловаться',
        //   cb: () => {
        //     this.$log('contentReport...')
        //   }
        // }
      }
    },
  },
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
    relatedContentClick (content) {
      this.$log('relatedContentClick', content)
    }
  }
}
</script>
