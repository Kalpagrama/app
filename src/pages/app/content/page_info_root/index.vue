<style lang="sass" scoped>
.content-wrapper
  &:hover
    background: rgb(40,40,40) !important
</style>

<template lang="pug">
div(
  :style=`{
    ...styles,
  }`
  ).column.fit
  .col.full-width.scroll
    .row.full-width.justify-center
      div(
        :style=`{
        }`).row.full-width.items-start.content-start
        //- header
        .row.full-width
          .row.full-width.q-px-lg.q-py-md
            span(:style=`{fontSize: '22px',}`).text-white.text-bold {{ contentKalpa.name }}
          //- stats
          .row.full-width.q-px-lg.q-pb-sm
            span.text-grey-3.q-mr-xs Просмотры: {{ contentKalpa.countStat.countViews }}
            span.text-grey-3.q-mr-xs • {{ $date(contentKalpa.createdAt, 'DD.MM.YYYY') }}
          //- origin
          div(
            v-if="contentKalpa.contentProvider !== 'KALPA'"
            ).row.full-width.items-center.content-center.q-pl-md
              q-btn(
                @click="goOriginal"
                align="left"
                outline color="grey-3" no-caps
                :style=`{
                  fontSize: '16px'
                }`)
                span.text-bold.text-grey-3 {{ 'Go to original:' }}
                //- handle youtube
                q-icon(
                  v-if="contentKalpa.contentProvider === 'YOUTUBE'"
                  name="fab fa-youtube" color="red" size="30px").q-mx-sm
                span(
                  v-if="contentKalpa.contentProvider === 'YOUTUBE'"
                  ).text-bold.text-grey-3 YouTube
          //- actions
          .row.full-width.items-center.content-center.q-px-md
            kalpa-share(type="content" color="grey-2" :item="contentKalpa")
            kalpa-bookmark(
              v-if="contentKalpa"
              :oid="contentKalpa.oid"
              :type="contentKalpa.type"
              :name="contentKalpa.name"
              :thumbUrl="contentKalpa.thumbUrl"
              :isActive="true"
              inactiveColor="grey-3"
              :fields=`{contentType: contentKalpa.type}`
              @bookmark="$event => $emit('bookmark', $event)")
            //- tutorial
            q-btn(
              @click="$store.commit('ui/stateSet', ['kalpaWelcome', {id: 'content_first', useIntro: false, useProfileEditor: false}])"
              round flat color="white" icon="fas fa-info")
            kalpa-menu-actions(icon="more_vert" color="grey-2" :title="contentKalpa.name" :actions="actions")
        //- related content
        div(
          :style=`{
            marginBottom: '300px',
          }`
          ).row.full-width.q-px-md.q-pt-xl.q-mt-xl
          div(
            @click="relatedContentClick(c,ci)"
            v-for="(c,ci) in contentKalpa.relatedContent" :key="ci"
            :style=`{
              position: 'relative',
              minHeight: '50px',
              borderRadius: '10px',
              background: 'rgba(30,30,30,0.5)',
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
import * as assert from 'assert'

export default {
  name: 'pageDetails',
  props: {
    contentKalpa: {type: Object, required: true},
    player: {type: Object, required: true},
    styles: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      relatedContentLoading: null,
    }
  },
  computed: {
    url () {
      assert(this.contentKalpa.urlWithFormats, '!this.contentKalpa.urlWithFormats')
      return ContentApi.urlSelect(this.contentKalpa.urlWithFormats)
    },
    actions () {
      let res = {
        copyUrl: {
          name: 'Скопировать ссылку',
          cb: () => {
            this.$log('copyUrl')
          }
        },
      }
      if (this.$store.getters.currentUser().profile.role === 'GUEST') {
        return res
      }
      res.hide = {
        name: 'Скрыть',
        cb: () => {},
      }
      res.report = {
        name: 'Пожаловаться',
        cb: () => {
          this.$log('contentReport...')
        }
      }
      return res
    },
  },
  methods: {
    goOriginal () {
      this.$log('goOriginal')
      if (this.contentKalpa.contentSource === 'YOUTUBE') {
        let arr = this.contentKalpa.urlOriginal.split('/')
        let isEmbed = arr[arr.length - 2] === 'embed'
        if (isEmbed) openURL(`https://www.youtube.com/watch?v=${arr[arr.length - 1]}`)
        else openURL(this.contentKalpa.urlOriginal)
      }
      else {
        return ''
      }
    },
    async relatedContentClick (content, contentIndex) {
      this.$log('relatedContentClick', content)
      if (this.$store.getters.currentUser().profile.role === 'GUEST') {
        let authGuard = {
          message: 'Чтобы перейти на похожий контент, войдите в аккаунт.'
        }
        this.$store.commit('ui/stateSet', ['authGuard', authGuard])
      }
      else {
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
}
</script>
