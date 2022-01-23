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
    div(:class="$screenProps.isMobile ? '' : 'br-15'" :style=`{overflow: $screenProps.isMobile ? 'visible' : 'hidden'}`).row.full-width.relative-position
      q-resize-observer(@resize="bottomHeight = $q.screen.height - $event.height - headerHeight")
      content-view(:content="content" :options=`{maxHeight: $q.screen.height - headerHeight}` @player="player=$event").row.full-width
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
            @click="showDialog = true"
          ).full-width.q-px-sm
            q-dialog(v-model="showDialog" transition-show="flip-up" transition-hide="flip-down" :content-style=`{borderRadius: '10px', background: 'rgba(40,40,40,0.7)'}`)
              div(:style=`{ borderRadius: '10px', color: 'white', border: '2px solid rgb(76,175,79)', paddingLeft: '10px', background: 'rgba(40,40,40)'}`).row.full-width
                q-input(v-model="promoCode", autofocus, borderless dark :placeholder="$t('Введите промокод')" @keyup.enter="sendPromoCode(promoCode)").col.full-width
                q-btn(v-close-popup round flat :color="promoCode ? 'green' : null", icon="done", :disable="!promoCode" @click="sendPromoCode(promoCode)")
                kalpa-pay(:item="content" @success="")
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
