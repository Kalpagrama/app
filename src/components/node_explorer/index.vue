<template lang="pug">
q-layout(view="hHh lpR fFf" ref="nodeExplorerLayout" @scroll="onScroll")
  kalpa-menu-right
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        maxHeight: '70vh'
      }`
      ).column.fit.bg-grey-9
      menu-right
      //- div(:style=`{height: '70px'}`).row.full-width.items-center.q-px-md
      //-   span.text-white.text-bold Related spheres
      //- .col.full-width.scroll
      //-   .row.full-width.q-pa-sm
          //- sphere-spheres(v-if="true" :oid="sphereOid")
  kalpa-menu-footer
  //- q-header(reveal)
  //-   .row.full-width.justify-center
  //-     div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px', height: '60px'}`
  //-       ).row.full-width.items-center.content-center
  //-       //- span.text-white Node explorer
  q-btn(
    v-if="scrollTop >= nodeHeight"
    push color="green" no-caps
    :style=`{
      position: 'fixed', zIndex: 2000, bottom: '8px', left: '50%', transform: 'translate(-50%, 0)',
      height: '50px'
    }`
    ).q-px-md Add your node
  q-page-container
    q-page.q-px-xs
      .row.full-width.justify-center
        //- header
        div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px', height: '60px'}`).row.full-width.items-center.content-center.q-px-xs
          q-btn(round flat color="grey-2" icon="keyboard_arrow_left" @click="$router.back()")
        div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.q-pt-sm
          node(
            v-if="node"
            ctx="explorer"
            :node="node" :needFull="true"
            :essence="true" :opened="true"
            @meta="onNodeMeta"
            :visible="nodeVisible" :active="nodeActive" :mini="nodeMini")
        //- essence fixed
        div(
          v-if="scrollTop >= nodeHeight"
          @click="nodeEssenceStickyClick()"
          :style=`{
            position: 'fixed',
            top: '0px',
            height: '60px',
            zIndex: 1000
          }`).row.full-width.justify-center.q-px-xs.cursor-pointer
          div(
            :style=`{
              maxWidth: $store.state.ui.maxWidthPage+'px',
              marginTop: '-10px',
              borderRadius: '0 0 10px 10px'
            }`
            ).row.full-width.items-center.content-center.q-px-md.bg-grey-9
            span(v-if="node").text-white.text-bold {{node.name}}
        //- essence relative
        //- div(
        //-   ref="nodeEssence"
        //-   :style=`{
        //-     position: 'relative',
        //-     height: '60px'
        //-   }`).row.full-width.justify-center
        //-   div(
        //-     :style=`{
        //-       maxWidth: $store.state.ui.maxWidthPage+'px',
        //-       marginTop: '-10px',
        //-       borderRadius: '0 0 10px 10px'
        //-     }`
        //-     ).row.full-width.items-center.content-center.q-px-md.bg-grey-9
        //-     span.text-white.text-bold {{node.name}}
        div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width
          kalpa-loader(v-if="sphereOid && node" type="sphereNodes" :variables="variables")
            template(v-slot=`{items}`)
              list-masonry(
                ref="listMasonry" :items="items"
                :style=`{maxWidth: $store.state.ui.maxWidthPage+'px', paddingTop: '60px'}`)
                template(v-slot:item=`{item, index, isOpened, isHovered}`)
                  div(
                    v-if="!isOpened"
                    @click="$router.push('/node/'+item.oid).catch(e => e), nodeActive = true"
                    :style=`{position: 'absolute', zIndex: 300, borderRadius: '10px', overflow: 'hidden', opacity: 0}`).row.fit.cursor-pointer
                  node(
                    :node="item"
                    :index="index"
                    :needFull="isOpened ? true : isHovered"
                    :visible="isOpened ? true : isHovered"
                    :active="isOpened ? true : isHovered" layout="pip"
                    :mini="!isOpened"
                    :opened="isOpened"
                    :essence="isOpened")
          //- div(:style=`{height: '1000px'}`).row.full-width.bg-red
</template>

<script>
import menuRight from './menu_right'

export default {
  name: 'nodeExplorer',
  components: {menuRight},
  props: ['node'],
  data () {
    return {
      nodeVisible: true,
      nodeActive: true,
      nodeMini: false,
      nodeHeight: 0,
      nodeEssenceOffsetTop: 0,
      nodeEssenceStickyShow: false,
      scrollTop: 0
    }
  },
  computed: {
    sphereOid () {
      if (!this.node) return null
      else return this.node.sphereFromName.oid
    },
    variables () {
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 10 },
        sortStrategy: 'HOT',
        filter: { types: 'NODE' }
      }
    }
  },
  methods: {
    nodeEssenceStickyClick () {
      this.$log('nodeEssenceStickyClick', document)
      // this.$tween.to(window, 0.5, {scrollTop: 0})
      // this.$refs.nodeExplorerLayout.scroll.position = 0
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      })
    },
    onNodeMeta ([key, val]) {
      this.$log('onNodeMeta', key, val)
      switch (key) {
        case 'height': {
          this.nodeHeight = val
          // this.nodeEssenceOffsetTop = this.$refs.nodeEssence.offsetTop
          break
        }
      }
    },
    onScroll (e) {
      // this.$log('onScroll', e)
      if (e.position === 0) return
      this.scrollTop = e.position
      // set node essence sticky
      if (e.position >= this.nodeEssenceOffsetTop) {
        this.nodeEssenceStickyShow = true
      }
      else {
        this.nodeEssenceStickyShow = false
      }
      // set node Active
      if (e.position >= (this.nodeHeight / 2)) {
        this.nodeActive = false
      }
      else {
        this.nodeActive = true
      }
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
