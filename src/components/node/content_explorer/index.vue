<template lang="pug">
//- div(:style=`{height: $q.screen.height+'px'}`).row.full-width
q-layout(view="hHh lpR fFf" container :style=`{height: $q.screen.height+'px', minHeight: $q.screen.height+'px'}`).bg-grey-10
  //- header
  div(:style=`{position: 'fixed', zIndex: 1000, top: '0px', height: '60px'}`).row.full-width
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
      q-btn(round flat color="grey-3" icon="keyboard_arrow_left" @click="$router.back()"
        :style=`{background: 'rgba(0,0,0,0.3)'}`)
    .col.full-height
      .row.fit.items-center.content-center.justify-center
        //- span.text-bold.text-white {{ content.name }}
    //- div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
    //-   q-btn(round flat color="grey-3" icon="more_vert")
  q-page-container
    q-page
      div(:style=`{position: 'relative', height: $q.screen.height-extraHeight+(60*(extraHeight/$q.screen.height))+'px'}`).row.full-width
        composition(
          v-if="content"
          ctx="workspace"
          :value="{layers: [{content, figuresAbsolute: [], figuresRelative: [], spheres: []}]}"
          :visible="true" :active="true" :mini="false")
  q-footer(reveal)
    .row.full-width.justify-center
      div(
        :style=`{height: '60px', maxWidth: $store.state.maxWidthPage+'px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`
        ).row.full-width.items-center.bg-grey8
  //- extra fixed
  div(:style=`{position: 'fixed', zIndex: 200, height: extraHeight+'px', bottom: '0px', borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).column.full-width.bg-grey-10
    //- bar
    div(:style=`{position: 'absolute', top: '4px', left: '50%', transform: 'translate(-50%, 0)', width: '60px', height: '4px', borderRadius: '2px'}`).bg-grey-7
    //- pan
    div(
      v-touch-swipe.mouse.prevent.vertical="extraSwipe"
      v-touch-pan.mouse.prevent.vertical="extraPan"
      :style=`{
        position: 'absolute', zIndex: 200, top: '0px',
        height: extraHeight < $q.screen.height-200 ? '100%' : '60px'
      }`).row.full-width
      div(:style=`{height: '60px'}`).row.full-width.items-center
        kalpa-buttons(:value="tabs" :id="tab" @id="extraHeaderClick(), tab = $event")
    div(:style=`{paddingTop: '60px'}`).col.full-width
      component(:is="`extra-${tab}`" :mode="mode" :content="content")
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
      extraHeight: 100,
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
  },
  methods: {
    extraScrolled (e) {
      // this.$log('extraScrolled', e)
    },
    extraHeaderClick () {
      this.$log('extraHeaderClick')
      this.extraSwipe({direction: 'up'})
    },
    extraPan (e) {
      // this.$log('extraPan', e)
      if (this.extraSwiping) return
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
      // this.$log('extraSwipe', e)
      if (this.extraPanning) return
      this.extraSwiping = true
      this.$tween.to(this, 0.3, {extraHeight: e.direction === 'up' ? this.$q.screen.height - 200 : 100})
      this.$wait(300).then(() => {
        this.extraSwiping = false
      })
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
