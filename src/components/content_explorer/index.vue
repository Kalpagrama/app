<template lang="pug">
q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px'}`).bg-grey-10
  //- header
  div(
    :style=`{position: 'fixed', zIndex: 1000, top: '0px', height: '60px', left: '0px', width: 'calc(100% - '+extraRight+'px)'}`).row
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
      q-btn(round flat color="grey-3" icon="keyboard_arrow_left" @click="$router.back()"
        :style=`{background: 'rgba(0,0,0,0.3)'}`)
    .col.full-height
      .row.fit.items-center.content-center.justify-center
  //- q-footer(reveal)
  //-   .row.full-width.justify-center
  //-     div(
  //-       :style=`{height: '60px', maxWidth: $store.state.maxWidthPage+'px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`
  //-       ).row.full-width.items-center.bg-grey8
  q-page-container
    q-page
      //- height: $q.screen.height-extraHeight+(60*(extraHeight/$q.screen.height))+'px'
      div(:style=`{position: 'relative', height: $q.screen.height+'px'}`).row.full-width
        composition(
          v-if="content"
          ctx="workspace"
          :value="{layers: [{contentOid: content.oid, figuresAbsolute: [], figuresRelative: [], spheres: []}]}"
          :visible="true" :active="true" :mini="false"
          :styles=`{
            paddingBottom: extraHeight+'px',
            paddingRight: extraRight+'px'
          }`)
          template(v-slot:editor=`{player, meta}`)
            //- extra fixed
            div(
              :style=`{
                position: 'fixed', zIndex: 200, overflow: 'hidden', transform: 'translate3d(0,0,0)',
                ...extraStyles
              }`
              ).row
              div(:style=`{position: 'relative'}`).column.fit.bg-grey-10
                //- bar
                div(
                  v-if="!$q.screen.gt.sm"
                  :style=`{
                    position: 'absolute', zIndex: 1000, top: '4px', left: '50%',
                    transform: 'translate(-50%, 0)', width: '60px', height: '4px', borderRadius: '2px', transform: 'translate3d(0,0,0)'
                  }`
                  ).bg-grey-7
                //- pan
                div(
                  v-if="!$q.screen.gt.sm"
                  v-touch-swipe.mouse.prevent.vertical="extraSwipe"
                  v-touch-pan.mouse.prevent.vertical="extraPan"
                  :style=`{
                    position: 'absolute', zIndex: 1000, top: '0px',
                    height: extraHeight < $q.screen.height-200 ? '100%' : '0px',
                    background: 'rgba(33,33,33, 0.8)', transform: 'translate3d(0,0,0)'
                  }`).row.full-width.items-start.content-start
                //- header
                .row.full-width.items-center.justify-center
                  div(:style=`{height: '60px', maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.items-center.content-center
                    .col
                      kalpa-buttons(:value="tabs" :id="tab" @id="extraHeaderClick(), tab = $event")
                    q-btn(
                      v-if="!$q.screen.gt.sm"
                      round flat color="grey-3" @click="extraSwipe({direction: extraHeight > 100 ? 'down' : 'up'})"
                      :icon="extraHeight > 100 ? 'keyboard_arrow_down' : 'keyboard_arrow_up'").q-mr-sm
                //- body
                div().col.full-width
                  component(:is="`extra-${tab}`" :mode="mode" :content="content" :player="player" :meta="meta")
</template>

<script>
import extraInfo from './extra_info'
import extraNodes from './extra_nodes'
import extraWs from './extra_ws'

export default {
  name: 'contentExplorer',
  components: {extraInfo, extraNodes, extraWs},
  props: ['mode', 'content'],
  data () {
    return {
      extraHeight: 0,
      extraRight: 0,
      extraSwiping: false,
      extraPanning: false,
      tab: 'info',
      tabs: [
        {id: 'info', name: 'Info'},
        {id: 'nodes', name: 'Nodes'},
        {id: 'ws', name: 'Workspace'}
      ]
    }
  },
  computed: {
    extraStyles () {
      if (this.$q.screen.gt.sm) {
        return {
          width: '500px',
          height: '100%',
          right: '0px',
          top: '0px'
        }
      }
      else {
        return {
          width: '100%',
          height: this.extraHeight + 'px',
          bottom: '0px',
          borderRadius: '10px 10px 0 0'
        }
      }
    }
  },
  watch: {
    '$q.screen.gt.sm': {
      immediate: true,
      handler (to, from) {
        if (to) {
          this.extraHeight = 0
          this.extraRight = 500
        }
        else {
          this.extraHeight = 100
          this.extraRight = 0
        }
      }
    }
  },
  methods: {
    extraScrolled (e) {
      // this.$log('extraScrolled', e)
    },
    extraHeaderClick () {
      this.$log('extraHeaderClick')
      if (this.$q.screen.gt.sm) return
      this.extraSwipe({direction: 'up'})
    },
    extraPan (e) {
      // this.$log('extraPan', e)
      if (this.extraSwiping || this.$q.screen.gt.sm) return
      let to = this.extraHeight - e.delta.y
      if (to >= this.$q.screen.height - 200) to = this.$q.screen.height - 200
      if (to < 100) to = 100
      this.extraHeight = to
      if (e.isFirst) {
        this.extraPanning = true
      }
      if (e.isFinal) {
        this.extraPanning = false
        if (this.extraHeight !== this.$q.screen.height) {
          this.extraSwipe({direction: this.extraHeight > (this.$q.screen.height - 200) / 2 ? 'up' : 'down'})
        }
      }
    },
    extraSwipe (e) {
      this.$log('extraSwipe', e)
      if (this.extraPanning || this.$q.screen.gt.sm) return
      e.distance = e.distance || {y: 16}
      if (e.distance.y < 15) return
      // this.$q.notify('distance.y:' + e.distance.y)
      this.extraSwiping = true
      this.$tween.to(this, 0.3, {extraHeight: e.direction === 'up' ? this.$q.screen.height - 200 : 100})
      this.$wait(300).then(() => {
        this.extraSwiping = false
      })
    }
  },
  mounted () {
    this.$log('mounted')
    document.body.style.backgroundColor = '#222'
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
