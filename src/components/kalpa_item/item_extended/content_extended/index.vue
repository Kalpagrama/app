<style lang="sass">
.blur
  backdrop-filter: blur(20px)
  -webkit-backdrop-filter: blur(20px)
  background-color: #0000030a
</style>

<template lang="pug">
div(:style=`{maxWidth: !isFullscreen ? $store.state.ui.pageWidth+'px' : $q.screen.width + 'px'}`).row.full-width.items-start.content-start.justify-center.relative-position
  q-resize-observer(@resize="pageWidth = $event.width")
  q-spinner-dots(v-if="!content" color="green" size="60px").fixed-center
  div(v-else).row.full-width
    // header
    div(v-if="!isFullscreen").row.full-width.justify-center.b-30
      q-resize-observer(@resize="headerHeight = $event.height")
      div(
        :style=`{ borderRadius: '10px'}`).row.full-width.items-center.content-center.q-pa-sm.b-30
        q-btn(@click="$routerKalpa.back()" flat round color="white" icon="west" no-caps)
        .col
        h1.text-white.text-bold {{$t('Контент')}}
        .col
        //- tutorial
        q-btn(
          @click=""
          round flat color="white" icon="fas fa-info" :style=`{opacity:'0'}`)
    // контент
    div(:class="$screenProps.isMobile || isFullscreen ? '' : 'br-15'" :style=`{overflow: $screenProps.isMobile ? 'visible' : 'hidden'}`).row.full-width.relative-position
      q-resize-observer(@resize="bottomHeight = $q.screen.height - $event.height - headerHeight")
      div(:style=`{overflow: 'hidden'}`).row.full-width.relative-position
        content-view(:content="content" :options=`{maxHeight: $q.screen.height - headerHeight}` @player="player=$event").row.full-width
        transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
          div(v-if="showDialog" :class=`{ 'q-pt-sm' : $screenProps.isMobile, 'q-px-sm' : $screenProps.isMobile, 'q-pa-md' : !$screenProps.isMobile, }` :style=`{borderRadius: '20px 20px 0 0',  zIndex: 100, overflow: 'hidden'}`).row.full-width.absolute-bottom.content-center.items-center.b-40
            .row.full-width.relative-position
              .row.q-mr-sm
                img(
                  :src="content.thumbUrl"
                  :style=`{height: $screenProps.isMobile ? '70px' : '100px', objectFit: 'cover'}`
                ).br-20
              div(:class="$screenProps.isMobile ? '' : 'col'").row.content-center.items-center
                .row.content-end.items-end.full-width
                  small.text-white.q-pr-sm {{$t('Название: ')}}
                  span.text-white.ellipsis {{ content.name }}
                //.row.content-end.items-end.full-width
                //  small.text-white.q-pr-sm {{$t('Автор: ')}}
                //  span.text-white.ellipsis {{ author.name }}
                .row.content-center.items-center.full-width
                  small.text-white.text-lowercase.q-pt-xs {{$t(content.__typename)}} {{ $time(content.duration) }} {{$t('мин')}}
              .row.items-center.content-center.justify-end.full-width
                span.text-white.q-pr-xs {{$t('Стоимость: ')}} {{ content.payInfo.price }}
                q-icon(name="fas fa-ruble-sign" color="white" size="11px" )
                kalpa-pay(:item="content" buttonName="Оплатить"  @success="")
            .row.absolute-top-right
              q-btn(icon="close" color="grey-7" flat round @click="showDialog = false" )
        // платный контент
      div(v-if="content.payInfo.price").row.full-width.q-pa-xs.b-0
        .row.col
          small(v-if="!paid" :style=`{lineHeight: 1.2}`).text-grey.q-pt-xs.q-px-xs {{$t('Ознакомительный фрагмент')}}
        .row.q-mr-sm
          q-btn(v-if="!paid"
            no-caps outline dense
            size="sm"
            color="green"
            :label="$t('Полный доступ')"
            @click="showDialog = !showDialog"
          ).full-width.q-px-sm
            //q-dialog(v-model="showDialog" transition-show="jump-up" transition-hide="jump-up")
            //  .row.full-width.relative-position.no-shadow
            //    div(:style=`{overflow: 'hidden'}`).row.full-width.br-20
            //      img(
            //        :src="content.thumbUrl"
            //        :style=`{width:'100%', objectFit: 'cover'}`
            //      )
            //      div(:style=`{pointerEvents: 'none', background: 'linear-gradient(0deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 65%)'}`).row.fit.absolute.br-20
            //      .row.fit.absolute.z-max.q-pa-md
            //        .row.full-width.content-end.items-end
            //          .row.full-width.content-end.items-end
            //            small.text-white.q-pr-sm {{$t('Название: ')}}
            //            span.text-white {{ content.name }}
            //          //span.text-white.full-width.text-subtitle1 {{$t('Название: ')}} {{ content.name }}
            //          //span.text-white.full-width {{$t('Автор: ')}} {{ author.name }}
            //          .row.full-width.content-end.items-end
            //            small.text-white.q-pr-sm {{$t('Автор: ')}}
            //            span.text-white {{ author.name }}
            //          small.text-white.full-width.text-lowercase.q-pt-xs {{$t(content.__typename)}} {{ $time(player.duration) }} {{$t('мин')}}
            //          //q-input(v-model="promoCode", autofocus, borderless dark :placeholder="$t('Введите промокод')" @keyup.enter="sendPromoCode(promoCode)").col.full-width
            //          //q-btn(v-close-popup round flat :color="promoCode ? 'green' : null", icon="done", :disable="!promoCode" @click="sendPromoCode(promoCode)")
            //
            //          .row.items-center.content-center.justify-end.full-width
            //            span.text-white.q-pr-xs {{$t('Стоимость: ')}} {{ content.payInfo.price }}
            //            q-icon(name="fas fa-ruble-sign" color="white" )
            //            kalpa-pay(:item="content" buttonName="Оплатить"  @success="")
    bottom-info(v-if="!isFullscreen && !isEditor" :content="content" :player="player" :author="author" :pageWidth="pageWidth" :bottomHeight="bottomHeight")
</template>

<script>

import { RxCollectionEnum } from 'src/system/rxdb'
import contentView from './content_view'
import bottomInfo from './bottom_info'
import navMobile from 'src/components/kalpa_menu_mobile/nav_mobile.vue'

export default {
  name: 'contentExtended',
  props: ['oid'],
  components: {
    pageWidth: 0,
    contentView,
    navMobile,
    bottomInfo
  },
  data () {
    return {
      content: null,
      author: null,
      player: null,
      headerHeight: 0,
      bottomHeight: 0, // сколько места под образом
      showDialog: false
    }
  },
  computed: {
    isEditor() {
      return this.player && this.player.nodeMode === 'edit'
    },
    isFullscreen() {
      return this.player && this.player.isFullscreen
    },
    paid () { // оплачено
      if (!this.content.payInfo.price || this.content.author.oid === this.$store.getters.currentUser.oid) return true // если контент бесплатный либо я - автор
      return this.content.payInfo.paid
    },
    contentMaxHeight () {
      if (this.isFullscreen) return this.$q.screen.height
      else return this.$q.screen.height / 2
    }
  },
  watch: {
    oid: {
      immediate: true,
      async handler(to) {
        this.content = await this.$rxdb.get(RxCollectionEnum.OBJ, this.oid)
        this.author = await this.$rxdb.get(RxCollectionEnum.OBJ, this.content.author.oid)
      }
    },
    'content.payInfo.paid': {
      immediate: true,
      async handler (to, from) {
        if (!to && this.content && this.content.payInfo.price && this.content.author.oid !== this.$store.getters.currentUser.oid) {
          // this.$logT('content is paid! goto short version...')
          // await this.$router.replace('/cover/' + this.content.oid)
        }
      }
    },
    '$screenProps.isHorizontal': { // перевернули телефон на бок
      handler (to) {
        if (this.player) this.player.setState('isFullscreen', to)
      }
    },
    isFullscreen: {
      immediate: true,
      async handler (to, from) {
        try { // генерит ошибку, если действие вызвано на пользователем
          this.$store.commit('ui/stateSet', ['desktopNavigationShow', !to])
          // eslint-disable-next-line no-constant-condition
          // if (to && this.$q.platform.is.mobile) await this.$q.fullscreen.request()
          if (to) await this.$q.fullscreen.request()
          else if (from && this.$q.fullscreen.isActive) await this.$q.fullscreen.exit()
        } catch (err) {
        }
      }
    },
    async player(to){
      if (to) {
        if (this.$route.query.draftId){
          let draft = await this.$rxdb.get(RxCollectionEnum.WS_ANY, this.$route.query.draftId)
          this.player.setState('node', draft)
          this.player.setState('nodeMode', 'edit')
        }
      }
    }
  },
  methods: {},
  async mounted () {
    this.$logT('mounted', this.oid)
    this.$logT('mounted2', this.content)
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
