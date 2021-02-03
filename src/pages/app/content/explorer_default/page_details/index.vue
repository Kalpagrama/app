<style lang="sass" scoped>
.content-wrapper
  &:hover
    background: rgb(40,40,40) !important
</style>

<template lang="pug">
div(
  :style=`{
    height: height+'px',
  }`
  ).column.full-width
  .col.full-width.scroll
    .row.full-width.justify-center
      div(
        :style=`{
          //- maxWidth: $store.state.ui.pageWidth+'px',
          maxWidth: 600+'px',
        }`).row.full-width.items-start.content-start
        //- header
        .row.full-width.q-pt-md.q-px-md
          .row.full-width.items-center.content-center
            .col.q-pa-sm
              span.text-white.text-bold {{ contentKalpa.name }}
            kalpa-menu-actions(icon="more_vert" :title="contentKalpa.name" :actions="actions")
          .row.full-width.items-end.content-end.q-pt-xs.q-px-sm
            span.text-grey-7.q-mr-xs Просмотры: {{ contentKalpa.countStat.countViews }}
          .row.full-width.q-px-sm.q-pt-sm
            span.text-grey-7.q-mr-xs Добавлен: {{ $date(contentKalpa.createdAt, 'DD.MM.YYYY') }}
        //- actions
        .row.full-width.items-center.content-center.q-px-sm
          div(
            v-if="contentKalpa.contentSource !== 'KALPA'"
            ).row.full-height.items-center.content-center.q-pl-md
              span.text-grey-7 Источник:
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
          span.text-grey-7 Рекомендации:
        div(
          :style=`{
            marginBottom: '300px',
          }`
          ).row.full-width.q-px-md
          div(
            @click="relatedContentClick(c,ci)"
            v-for="(c,ci) in contentKalpa.relatedContent" :key="ci"
            :style=`{
              position: 'relative',
              minHeight: '50px',
              borderRadius: '10px',
              background: 'rgb(20,20,20)',
            }`
            ).row.full-width.items-start.content-start.q-mb-sm.cursor-pointer.content-wrapper
            //- loading
            transition(enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
              div(
                v-if="relatedContentLoading === ci"
                :style=`{
                  position: 'absolute', zIndex: 100,
                  background: 'rgba(0,0,0,0.5)',
                  borderRadius: '10px',
                }`
                ).row.fit.items-center.content-center.justify-center
                q-spinner(size="40px" color="green")
            //- default
            div(
              :style=`{
                //- width: '50px',
                height: '50px',
              }`
              ).row
              img(
                draggable="false"
                :src="c.thumbUrl"
                :style=`{
                  //- height: '50px',
                  borderRadius: '10px',
                  //- objectFit: 'cover',
                }`).full-height
            .col.q-pa-sm
              .row.fit.items-center.content-center
                span.text-white {{ c.name }}
</template>

<script>
import { openURL } from 'quasar'
import { ContentApi } from 'src/api/content'

export default {
  name: 'pageDetails',
  props: ['contentKalpa', 'player', 'height'],
  data () {
    return {
      relatedContentLoading: null,
    }
  },
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
    async relatedContentClick (content, contentIndex) {
      this.$log('relatedContentClick', content)
      this.relatedContentLoading = contentIndex
      let contentKalpa = await ContentApi.contentCreateFromUrl(content.urlOriginal)
      this.relatedContentLoading = null
      await this.$wait(300)
      if (contentKalpa) {
        this.$router.push('/content/' + contentKalpa.oid)
      }
    }
  }
}
</script>
