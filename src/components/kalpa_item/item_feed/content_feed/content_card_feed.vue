<template lang="pug">
div(
  :style=`{
  position: 'relative',
  overflow: 'hidden',
  borderRadius: '00px',
  // minHeight: height + 'px',
  // maxHeight: height + 'px',
  // minWidth: height + 'px',
  // background: 'linear-gradient(0deg, rgba(40,40,40,1) 0%, rgba(40,40,40,0) 100%)',
  }`).row.full-width.items-start.content-start.q-mb-xs
  //report
  q-dialog(
    v-if="item"
    v-model="isReportDialogShown"
    :maximized="false")
      kalpa-report(:essence="item" @close="isReportDialogShown = false")
  //hide
  q-dialog(
    v-if="item"
    v-model="isHideDialogShown"
    :maximized="false")
    kalpa-hide(:essence="item" @close="isHideDialogShown = false")
  //image
  //img(
  //  :src="item.thumbUrl"
  //  :style=`{
  //  // height: height + 'px',
  //  minWidth: '100%',
  //  // opacity: 0.2,
  //  objectFit: 'cover',
  //  borderRadius: '0px'}`)
  //content-player(
  //  :contentKalpa="item"
  //  @player="playerReady"
  //).row.full-width
  div(
    :style=`{
    position: 'relative', overflow: 'hidden', borderRadius: $screenProps.isMobile ? '00px' : '10px',
  }`
  ).row.full-width.items-stat.content-start
    img(
      draggable="false"
      :src="item.thumbUrl"
      :style=`{
        borderRadius: '00px', objectFit: 'contain', maxHeight: '80vh'
      }`).full-width
    content-player(
      v-if="isActive && isVisible"
      @player="playerReady"
      :contentKalpa="item"
      :style=`{
        position: 'absolute', zIndex: 100, top: '0px', maxHeight: '80vh'
      }`
      :options=`{
        loop: true,
        //- nodeOid: node.oid,
        footerOverlay: true,
        showBar: false,
        showHeader: true,
        showFooter: true,
        showContext: false,
        feedOverlay: true,
        mode: 'feed',
      }`
      :styles=`{
        height: '100%',
        objectFit: 'contain',
      }`).fit
  //div(:style=`{pointerEvents: 'none', background: 'linear-gradient(0deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 50%)', zIndex: 10}`).fit.absolute-center
  //div(:style=`{zIndex: 10}`).row.full-width.absolute-bottom.full-height
  //  //- NAME: dynamic link/ dynamic fontSize
  //  router-link(
  //    :to="`/${item.type}/${item.oid}`"
  //    :style=`{
  //    minHeight: height + 'px',
  //    textAlign: 'center',
  //    fontWeight: fontWeight,
  //  }`
  //  ).row.full-width.items-center.content-end.justify-center
  //    span.text-grey-5.q-px-sm.q-pb-xs.ellipsis {{ item.name }}
  div.row.full-width
    //q-btn(
    //  :to="'/user/'+item.author.oid"
    //  round flat color="white" no-caps
    //).row
    img(
      draggable="false"
      :src="item.author.thumbUrl"
      @click="$router.push('/user/'+item.author.oid)"
      :style=`{
      width: '35px', minWidth: '35px', maxWidth: '35px',
      height: '35px', minHeight: '35px', maxHeight: '35px',
      borderRadius: '50%',
    }`).q-ma-sm.cursor-pointer
    .col.q-pt-xs
      .collumn
        .row
          span(@click="$router.push('/content/'+item.oid)").text-grey-5.q-pb-xs.full-width.q-pr-xs.cursor-pointer {{ item.name }}
        .col
          //small.text-grey-5.q-pb-xs.ellipsis {{ item.author.name }}
          //small.text-grey-5.q-pb-xs.ellipsis {{$t(' 🞄 ')}} {{ item.countStat.countViews }} {{$t('просмотров')}}
          //small.text-grey-8.q-mr-sm {{ $date(item.createdAt, 'DD.MM.YYYY') }}
          small(size="sm", @click="$router.push('/user/'+item.author.oid)").row.items-center.text-grey-7.cursor-pointer {{ item.author.name }} {{$t(' 🞄 ')}} {{item.countStat.countViews}} {{$getNoun(item.countStat.countViews,$t('просмотр'),$t('просмотра'),$t('просмотров'))}} {{$t(' 🞄 ')}} {{ $date(item.createdAt, 'DD.MM.YYYY') }}
          //small.text-grey-5.q-pb-xs.ellipsis {{$t(' 🞄 ')}} {{ item.countStat.countViews }} {{$t('просмотров')}}
    .row
      kalpa-menu-actions(
        v-if="data.showDropdown && item"
        icon="more_vert"
        color="grey-8"
        :actions="actions")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import contentPlayer from 'src/components/content_player'
import { assert } from 'src/system/common/utils'
import { reactive } from 'vue'
import {mixin} from 'src/components/kalpa_item/mixins/actions'
import kalpaReport from 'src/components/kalpa_report/index.vue'
import kalpaHide from 'src/components/kalpa_hide/index.vue'

// этот элемент показывается в virtual scroll и не может иметь состояния!!! data - запрещено! И во вложенных - тоже!!!
export default {
  name: 'contentCardFeed',
  mixins: [mixin],
  props: ['item', 'itemState', 'isActive', 'isVisible', 'height'],
  components: {
    contentPlayer,
    kalpaReport,
    kalpaHide
  },
  computed: {
    data () {
      // eslint-disable-next-line vue/no-side-effects-in-computed-properties
      assert(this.itemState)
      let key = this.$options.name
      if (!this.itemState[key]) {
        this.$set_deprecated(this.itemState, key, reactive({
          itemActive: 0,
          showDropdown: true
        }))
      }
      return this.itemState[key]
    },
    fontSize () {
      let l = this.item.name.length
      let w = 100
      if (l < 20 && w > 300) return 22
      else if (l < 30 && w > 300) return 20
      else if (l < 40 && w > 300) return 16
      else if (l <= 20 && w < 300) return 12
      else if (l > 20 && w < 300) return 12
      else return 14
    },
    fontWeight () {
      return 800
    }
  },
  methods: {
    playerReady (player) {
      this.$log('playerReady', player)
      this.player = player
      this.player.events.on('figure-delete', () => {
        this.$log('player figure-delete')
        this.player.setState('figures', null)
      })
      if (this.figures) this.player.setState('figures', this.figures)
      this.$nextTick(() => {
        this.player.play()
      })
    },
  }
}
</script>
