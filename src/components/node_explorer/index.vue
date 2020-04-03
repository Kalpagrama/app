<style lang="sass">
// html
//   position: fixed
body
  // position: fixed
  overscroll-behavior: none
  background: black
// html, body
//   -webkit-overflow-scrolling: touch !important
//   overflow: auto !important
//   height: 100% !important
</style>

<template lang="pug">
//- position: 'fixed', top: $store.state.ui.offsetTop+'px', height: $store.state.ui.height+'px'
q-layout(view="hHh lpR fFf" container
  :style=`{position: 'fixed', top: 0+'px', height: $q.screen.height+'px'}` @scroll="onScrollLayout").bg-black
  q-page-container
    q-page
      div(
        v-touch-pan.mouse.stop.mightPrevent="onPanBody"
        :style=`{position: 'relative', height: $q.screen.height-extraHeight+'px'}`).row.full-width
        //- back
        q-btn(
          flat round icon="keyboard_arrow_left" color="white" @click="$router.back()"
          :style=`{position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.3)'}`)
        //- tint
        div(
          v-if="extraMode === 'mini'"
          @click="extraHeight = 'natural'"
          :style=`{position: 'absolute', zIndex: 2000}`).row.fit
        .column.fit
          .col.full-width.q-pa-xs
            div(
              v-if="$q.screen.height - extraHeight < nodeHeightPreview"
              ).row.fit
              img(
                :src="node.meta.compositions[0].thumbUrl"
                :style=`{objectFit: 'contain', pointerEvents: 'none', borderRadius: '10px', overflow: 'hidden'}`).fit
            div(
              v-if="$q.screen.height - extraHeight > nodeHeightPreview"
              ref="nodeWrapperAll").row.full-width.items-start.content-start
              div(ref="nodeWrapperActions").row.full-width
                div(ref="nodeWrapperAuthor").row.full-width
                  div(ref="nodeWrapperName").row.full-width
                    div(ref="nodeWrapperPreview").row.full-width.items-start.content-start
                      img(
                        ref="nodePreview"
                        :src="node.meta.compositions[0].thumbUrl"
                        @load="imgLoaded"
                        :style=`{
                          objectFit: 'contain', pointerEvents: 'none', borderRadius: '10px', overflow: 'hidden',
                          height: extraHeight < nodeHeightPreview ? '100%' : 'auto',
                        }`).full-width
                    //- name
                    .row.full-width.q-pa-sm
                      span.text-white.text-bold {{ node.name }}
                  //- author
                  div(:style=`{height: '60px'}`).row.full-width
                    div(:style=`{height: '60px', width: '60px'}`).row.items-center.content-center.justify-center
                      div(:style=`{height: '40px', width: '40px', borderRadius: '50%'}`).row.bg-grey-4
                        img(:src="node.author.thumbUrl").fit
                    .col.full-height
                      .row.fit.items-start.content-start.q-pt-sm
                        .row.full-width.items-end
                          span.text-white.text-bold {{node.author.name}}
                          small.text-white.full-width {{'@'+node.author.name}}
                //- actions
                div(:style=`{height: '50px'}`).row.full-width.items-center.justify-between.q-px-sm
                  q-btn(flat round color="green" icon="favorite_border")
                  q-btn(flat round color="grey-6" icon="cached")
                  q-btn(flat round color="grey-6" icon="cloud_queue")
                  q-btn(flat round color="grey-6" icon="share")
              //- spheres
              div().row.full-width.q-pa-md
                small(v-for="(s,si) in name.split(' ')" :key="si" :style=`{borderRadius: '10px'}`).text-white.q-py-xs.q-px-sm.q-mr-xs.q-mb-xs.bg-grey-9 {{'#'+s}}
      //- fixed
      //- v-touch-pan.mouse.vertical.prevent="onPanBody"
      div(
        :style=`{
          position: 'fixed', zIndex: 1000, bottom: '0px', right: '0px',
          borderRadius: '10px 10px 0 0', overflow: 'hidden',
          height: extraHeight+'px'}`
        ).row.full-width.bg-grey-10
        component(
          :is="`extra-${tab}`" :node="node" :nodeFull="nodeFull"
          :height="extraHeight" :heightKey="heightKey"
          :tabs="tabs" :tab="tab" @tab="tab = $event, tabChanged($event)")
</template>

<script>
import extraStats from './extra_stats'
import extraExplore from './extra_explore'
import extraConnections from './extra_connections'
import extraPeople from './extra_people'

export default {
  name: 'nodeExplorer',
  components: {extraStats, extraExplore, extraConnections, extraPeople},
  props: ['node'],
  data () {
    return {
      name: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s\'',
      nodeFull: null,
      nodeHeightAll: 0,
      nodeHeightActions: 0,
      nodeHeightAuthor: 0,
      nodeHeightName: 0,
      nodeHeightPreview: 0,
      extraHeight: 0,
      heightKey: 'maxi',
      tab: 'explore',
      tabs: [
        {id: 'stats', name: 'Stats'},
        {id: 'explore', name: 'Explore'},
        {id: 'connections', name: 'Connections'},
        // {id: 'spheres', name: 'Spheres'},
        {id: 'people', name: 'People'}
      ]
    }
  },
  computed: {
    heights () {
      return {
        mini: 120,
        preview: this.nodeHeightPreview + 8,
        name: this.nodeHeightName + 8,
        auhtor: this.nodeHeightAuthor + 8,
        actions: this.nodeHeightActions + 8,
        node: this.nodeHeightAll + 8,
        maxi: this.$q.screen.height - 60
      }
    }
  },
  watch: {
    tab: {
      handler (to, from) {
        this.tabChanged(to)
      }
    },
    heightKey: {
      immediate: true,
      handler (to, from) {
        this.heightKeyChanged(to)
      }
    }
  },
  methods: {
    tabChanged (to) {
      this.$log('tabChanged', to)
      switch (to) {
        case 'explore': {
          this.heightKeyChanged('name')
          break
        }
        default: {
          this.heightKeyChanged('actions')
        }
      }
    },
    heightKeyChanged (to) {
      this.$log('heightChanged', to)
      this.$tween.to(this, 0.2, {extraHeight: this.$q.screen.height - this.heights[to]})
    },
    onPanFixedHorizontal (e) {
      this.$log('onPanFixedHorizontal', e)
    },
    onPanBody (e) {
      // this.$log('onPanBody', e)
      let to = this.extraHeight - e.delta.y
      // if (to < this.heights.mini || to > this.heights.maxi) return
      if (to < 60 || to > this.heights.maxi) return
      this.extraHeight = to
      if (e.isFinal) {
        let heights = Object.values(this.heights)
        let goal = this.$q.screen.height - to
        const output = heights.reduce((prev, curr) => Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev)
        // this.$log('output', output)
        this.$tween.to(this, 0.2, {extraHeight: this.$q.screen.height - output})
      }
    },
    onScrollLayout (e) {
      this.$log('onScrollLayout', e)
    },
    imgLoaded (e) {
      this.$log('imgLoaded', e)
      this.nodeHeightPreview = this.$refs.nodeWrapperPreview.clientHeight
      this.nodeHeightName = this.$refs.nodeWrapperName.clientHeight
      this.nodeHeightAuthor = this.$refs.nodeWrapperAuthor.clientHeight
      this.nodeHeightActions = this.$refs.nodeWrapperActions.clientHeight
      this.nodeHeightAll = this.$refs.nodeWrapperAll.clientHeight
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
