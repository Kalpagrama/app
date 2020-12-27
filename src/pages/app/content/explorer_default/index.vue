<style lang="sass">
.q-footer
  background: none !important
</style>

<template lang="pug">
div(
  view="hHh Lpr lff"
  :style=`{
    minHeight: $q.screen.height+'px'
  }`).row.full-width.bg-black
  div(
    v-if="showMenu"
    reveal
    :style=`{
      position: 'fixed', zIndex: 10000, bottom: '0px',
    }`).row.full-width
    .row.full-width.justify-center
      div(
        :style=`{
          height: headerHeight+'px',
          maxWidth: $store.state.ui.pageWidth+'px',
          //- maxWidth: '500px',
          borderRadius: '10px 10px 0 0',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }`
        ).row.full-width.items-end.content-end.b-40
        nav-mobile(
          @toggle="showMenu = false"
          @pageId="pageIdChanged"
          :pageId="pageId")
  .row.full-width.justify-center
    div(
      :style=`{
        position: 'relative',
        maxWidth: player ? player.isFullscreen ? '100%' : $store.state.ui.pageWidth+'px' : $store.state.ui.pageWidth+'px',
        height: $q.screen.height-(showMenu ? 65 : 0)+'px',
        //- paddingBottom: 0+0+'px',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }`
      ).row.full-width.justify-center
      div(
        :style=`{
          position: 'relative',
        }`
        ).row.fit
        content-player(
          @player="player = $event"
          :contentKalpa="contentKalpa"
          :style=`{
            height: '100%',
          }`
          ).full-width.bg-black
        //- q-btn(
          v-if="!pageId"
          @click="essenceCreateStart()"
          round flat dense color="green" icon="add_circle_outline"
          :style=`{
            position: 'absolute', zIndex: 3000,
            right: '12px', bottom: '8px'
          }`)
        q-btn(
          v-if="!showMenu"
          @click="showMenu = true"
          round flat dense color="white" icon="keyboard_arrow_up"
          :style=`{
            position: 'absolute', zIndex: 3000,
            right: '12px', bottom: '10px'
          }`)
//- q-layout(
  view="hHh Lpr lff").bg-black
  q-footer(
    reveal
    :style=`{
      paddingBottom: 'env(safe-area-inset-bottom)',
    }`)
    .row.full-width.justify-center
      div(
        :style=`{
          height: headerHeight+'px',
          maxWidth: $store.state.ui.pageWidth+'px',
          borderRadius: '10px 10px 0 0',
        }`
        ).row.full-width.items-end.content-end.b-40
        nav-mobile(
          @pageId="pageIdChanged"
          :pageId="pageId")
  q-page-container
    q-page
      .row.full-width.justify-center
        div(
          :style=`{
            position: 'relative',
            maxWidth: player ? player.isFullscreen ? '100%' : $store.state.ui.pageWidth+'px' : $store.state.ui.pageWidth+'px',
            height: $q.screen.height-headerHeight+'px',
            paddingBottom: 0+0+'px',
          }`
          ).row.full-width.justify-center
          div(
            :style=`{
              position: 'relative',
            }`
            ).row.fit
            content-player(
              @player="player = $event"
              :contentKalpa="contentKalpa"
              :style=`{
                height: '100%',
              }`
              ).full-width.bg-black
            q-btn(
              @click="essenceCreateStart()"
              round flat dense color="green" icon="add_circle_outline"
              :style=`{
                position: 'absolute', zIndex: 3000,
                right: '12px', bottom: '2px'
              }`)
</template>

<script>
import navMobile from './nav_mobile.vue'
import contentPlayer from 'components/content_player/index.vue'

export default {
  name: 'explorerDefault',
  props: ['contentKalpa', 'query'],
  components: {
    navMobile,
    contentPlayer,
  },
  data () {
    return {
      player: null,
      pageId: null,
      headerHeight: 65,
      showMenu: false,
    }
  },
  computed: {
    heightSquare () {
      if (this.$q.screen.width > this.$store.state.ui.pageWidth) {
        return this.$store.state.ui.pageWidth
      }
      else {
        return this.$q.screen.width
      }
    },
    heightPage () {
      return this.$q.screen.height * 0.6
    }
  },
  watch: {
    // pageId: {
    //   handler (to, from) {
    //     if (to) {
    //       this.headerHeight = this.$q.screen.height * 0.66
    //     }
    //   }
    // }
  },
  methods: {
    essenceCreateStart () {
      this.$log('essenceCreateStart')
      // go to square/essence height
      this.$tween.to(this, 0.3, {
        headerHeight: this.$q.screen.height - this.heightSquare
      })
      // create composition...
    },
    pageIdChanged (pageId) {
      if (this.pageId === pageId) {
        this.pageId = null
        this.$tween.to(this, 0.3, {
          // headerHeight: this.$q.screen.height - this.heightSquare
          headerHeight: 65
        })
      }
      else {
        this.pageId = pageId
        this.$tween.to(this, 0.3, {
          // headerHeight: this.$q.screen.height - this.heightSquare
          headerHeight: this.heightPage
        })
      }
    },
  },
  mounted () {
    this.$log('mounted')
    document.body.style.background = 'black !important'
    // window.onorientationchange = function(event) {
    //   // console.log('the orientation of the device is now ' + event.target.screen.orientation.angle)
    //   alert('OOO: ' + event.target.screen.orientation.angle)
    // }
    window.addEventListener('orientationchange', async (event) => {
      // console.log("the orientation of the device is now " + event.target.screen.orientation.angle)
      alert('OOO: ' + event.target.screen.orientation.angle)
      await this.$wait(2000)
      this.$q.notify({type: 'negative', position: 'top', message: event.target.screen.orientation.angle})
    })
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
