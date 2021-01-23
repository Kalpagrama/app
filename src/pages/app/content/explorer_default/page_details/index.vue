<style lang="sass" scoped>
.content-wrapper
  &:hover
    background: rgb(40,40,40) !important
</style>

<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: $store.state.ui.pageWidth+'px',
    }`).row.full-width.items-start.content-start
    //- header
    .row.full-width.q-pa-md
      .row.full-width.items-center.content-center
        .col.q-pa-sm
          span.text-white.text-bold {{ contentKalpa.name }}
        kalpa-menu-actions(icon="more_vert" :title="contentKalpa.name" :actions="actions")
      .row.full-width.items-end.content-end.q-pt-xs.q-px-sm
        span.text-grey-5.q-mr-xs {{ contentKalpa.countViews }} просмотров
        small.text-grey-7.q-mr-xs - {{ $date(contentKalpa.createdAt, 'DD.MM.YYYY') }}
    //- actions
    .row.full-width.items-center.content-center.q-pa-sm
      div(
        v-if="contentKalpa.contentSource !== 'KALPA'"
        ).row.full-height.items-center.content-center.q-pl-md
          small.text-grey-6 Источник:
          q-btn(
            @click="gotToOriginal"
            align="left"
            flat color="grey-9" no-caps
            :style=`{
            }`)
            q-icon(name="fab fa-youtube" color="red" size="30px")
            span(:style=`{fontSize: '16px'}`).text-grey-4.text-bold.q-ml-sm YouTube
      .col
      kalpa-share(type="content" :item="contentKalpa")
      kalpa-bookmark(
        v-if="contentKalpa"
        :oid="contentKalpa.oid"
        :type="contentKalpa.type"
        :name="contentKalpa.name"
        :thumbUrl="contentKalpa.thumbUrl"
        :isActive="true"
        inactiveColor="grey-9"
        :fields=`{contentType: contentKalpa.type}`
        @bookmark="$event => $emit('bookmark', $event)").q-mr-sm
    //- similar content
    .row.full-width.q-pl-lg.q-py-xs
      span.text-grey-6 Похожее:
    .row.full-width.q-pa-sm
      div(
        @click="relatedContentClick(c)"
        v-for="(c,ci) in contentKalpa.relatedContent" :key="ci"
        :style=`{
          height: '50px',
          borderRadius: '10px',
          background: 'rgb(35,35,35)',
        }`
        ).row.full-width.items-center.content-center.q-mb-sm.cursor-pointer.content-wrapper
        div(
          :style=`{
            width: '50px', height: '50px',
          }`
          ).row
          img(
            draggable="false"
            :src="c.thumbUrl"
            :style=`{
              borderRadius: '10px',
              objectFit: 'cover',
            }`).fit
        .col.q-pa-sm
          .row.fit.items-center.content-center
            span.text-white {{ c.name }}
</template>

<script>
import { openURL } from 'quasar'
import { ContentApi } from 'src/api/content'

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
    async relatedContentClick (content) {
      this.$log('relatedContentClick', content)
      let contentKalpa = await ContentApi.contentCreateFromUrl(content.urlOriginal)
      if (contentKalpa) {
        this.$router.push('/content/' + contentKalpa.oid)
      }
    }
  }
}
</script>
