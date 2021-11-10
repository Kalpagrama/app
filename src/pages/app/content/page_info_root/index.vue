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
    .row.full-width.justify-center.q-px-md
      div(
        :style=`{
        }`).row.full-width.items-start.content-start
        //- header
        .row.full-width
          div(:class="$q.screen.xs ? 'q-pt-xs' : 'q-pt-md'").row.full-width
            .col-9
              img(
                draggable="false"
                :src="contentKalpa.thumbUrl"
                :style=`{
                  maxHeight: '160px',
                  maxWidth: '100%',
                  objectFit: 'cover',
                  borderRadius: '10px',
                }`
                )
            .row.col-3.justify-end
              .column
                kalpa-menu-actions(icon="more_vert" dense color="grey-2" :title="contentKalpa.name" :actions="actions")
                kalpa-save(:item="contentKalpa" dense :isActive="true" inactiveColor="white" color="grey-2")
                kalpa-share(type="content" color="grey-2" :item="contentKalpa")
                //q-btn(outline icon="share" @click="copyLink()" color="white").br
          .row.full-width.q-py-x
            span(:style=`{fontSize: '16px',}`).text-white.text-bold {{ contentKalpa.name }}
          //- stats
          .row.full-width.q-pb-sm
            small.text-grey-3 {{$t('Views')}}: {{ contentKalpa.countStat.countViews }}
          //- origin
          div(
            v-if="!contentKalpa.contentProvider.in('KALPA', 'USER_DEVICE')"
          ).row.full-width.items-center.content-center
            q-btn(
              @click="goOriginal"
              align="left"
              outline color="grey-3" no-caps
              :style=`{fontSize: '16px'}`)
              //- span.text-bold.text-grey-3 {{ 'Go to original' }}
              span.text-bold.text-grey-3 {{ $t('Источник') }}
              //- handle youtube
              q-icon(
                v-if="contentKalpa.contentProvider === 'YOUTUBE'"
                name="fab fa-youtube" color="red" size="30px").q-mx-sm
              span(
                v-if="contentKalpa.contentProvider === 'YOUTUBE'"
              ).text-bold.text-grey-3 YouTube
          //- actions
          //.row.full-width.items-center.content-center
          //  kalpa-share(type="content" color="grey-2" :item="contentKalpa")
          //  kalpa-save(:item="contentKalpa" :isActive="true" inactiveColor="white" color="grey-2").q-mx-xs
          //  //- buy
          //  //kalpa-pay(
          //  //  v-if="contentKalpa"
          //  //  :oid="contentKalpa.oid"
          //  //  :type="contentKalpa.type"
          //  //  :name="contentKalpa.name"
          //  //  :thumbUrl="contentKalpa.thumbUrl"
          //  //  :isActive="true"
          //  //  inactiveColor="grey-3"
          //  //  :fields=`{contentType: contentKalpa.type}`
          //  //  @content="$event => $emit('content', $event)")
          //  //- tutorial
          //  q-btn(
          //    @click=""
          //    round flat color="white")
          //    q-icon(name="help_outline" size="22px")
          //  kalpa-menu-actions(icon="more_vert" color="grey-2" :title="contentKalpa.name" :actions="actions")
          // description
          .row.full-width.q-py-md
            span(:style=`{fontSize: '14px',}`).text-white {{ contentKalpa.description }}
          .row.full-width.q-py-xs
            essence-spheres(
              v-if="showSpheres && itemState.spheres.length > 0"
              :sphereOwner="contentKalpa"
              :itemState="data"
              :style=`{
                order: 3,
              }`)
          .row.full-width.q-pb-xs
            span.text-grey-3.q-mr-xs • {{ $date(contentKalpa.createdAt, 'DD.MM.YYYY') }}
        //- related content
        div(
          :style=`{
            //- marginBottom: '300px',
          }`
          ).row.full-width.q-pt-lg
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
import {assert} from 'src/system/common/utils'
import {makeRoutePath} from 'public/scripts/common_func.js';

export default {
  name: 'pageInfoRoot',
  props: {
    contentKalpa: {type: Object, required: true},
    itemState: { type: Object},
    isActive: {type: Boolean},
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
    url () { return ContentApi.urlSelect(this.contentKalpa) },
    actions () {
      let res = {
        copyUrl: {
          name: 'Скопировать ссылку',
          cb: async () => {
            this.$log('copyUrl')
            await this.copyLink(true)
          }
        },
      }
      if (this.$store.getters.isGuest) {
        return res
      }
      res.tutorial = {
        name: 'Справка',
        cb: () => {},
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
    copyLink () {
      this.$log('copyLink')
      this.shareLink = makeRoutePath(this.player.content, true)
      this.clipboardWrite(this.shareLink, this.$t('Link copied to clipboard!', 'Ссылка скопирована !'))
    },
    clipboardWrite (val, message) {
      this.$log('clipboardWrite', val)
      navigator.permissions.query({name: 'clipboard-write'}).then(async (result) => {
        if (result.state === 'granted' || result.state === 'prompt') {
          await navigator.clipboard.writeText(val)
          if (message) this.$q.notify({type: 'positive', position: 'top', message: message})
        }
      })
    },
    goOriginal () {
      this.$log('goOriginal')
      if (this.contentKalpa.contentProvider === 'YOUTUBE') {
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
      if (this.$store.getters.isGuest) {
        let authGuard = {
          message: 'Чтобы перейти на похожий контент, войдите в аккаунт'
        }
        this.$store.commit('ui/stateSet', ['authGuard', authGuard])
      }
      else {
        this.relatedContentLoading = contentIndex
        let contentKalpa = await ContentApi.contentCreateFromUrl(content.urlOriginal, true)
        this.relatedContentLoading = null
        // await this.$wait(300)
        if (contentKalpa) {
          this.$router.push('/content/' + contentKalpa.oid)
        }
      }
    }
  }
}
</script>
