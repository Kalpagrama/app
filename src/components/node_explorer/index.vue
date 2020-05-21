<template lang="pug">
q-layout(view="hHh lpR fFf" ref="nodeExplorerLayout" @scroll="onScroll")
  //- dialogs
  q-dialog(v-model="nodeEditorOpened" persistent position="bottom")
    node-editor(
      ctx="workspace"
      :node="nodeEditorItem"
      @cancel="nodeEditorOpened = false"
      :style=`{
        maxWidth: $store.state.ui.maxWidthPage+'px',
        minHeight: $q.screen.height+'px',
        maxHeight: $q.screen.height+'px',
        height: $q.screen.height+'px',
      }`)
  kalpa-menu-right
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        maxHeight: '70vh'
      }`
      ).column.full-width.bg-grey-9
      menu-right
      //- div(:style=`{height: '70px'}`).row.full-width.items-center.q-px-md
      //-   span.text-white.text-bold Related spheres
      //- .col.full-width.scroll
      //-   .row.full-width.q-pa-sm
          //- sphere-spheres(v-if="true" :oid="sphereOid")
  //- kalpa-menu-footer(:options=`{showMenuPage: true}`)
  //-   template(v-slot:menuRight)
  //-     menu-right
  q-btn(
    v-if="true"
    push color="green" no-caps @click="nodeAdd()"
    :style=`{
      position: 'fixed', zIndex: 2000, bottom: '8px', left: '50%', transform: 'translate(-50%, 0)',
      height: '50px'
    }`
    ).q-px-md Add your node
  q-page-container
    q-page.q-px-xs
      //- header
      .row.full-width.justify-center
        div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px', height: '60px'}`).row.full-width.items-center.content-center.q-px-xs
          q-btn(round flat color="grey-2" icon="keyboard_arrow_left" @click="$router.back()")
      //- node
      .row.full-width.justify-center
        div(:style=`{position: 'relative', maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.q-pt-sm
          node(
            v-if="node"
            ctx="list"
            :node="node" :needFull="true"
            :essence="true" :opened="true"
            @meta="onNodeMeta"
            :visible="true" :active="true" :mini="false")
        //- essence fixed
        div(
          v-if="false && scrollTop >= nodeHeight"
          @click="nodeEssenceStickyClick()"
          :style=`{
            position: 'fixed',
            top: '0px',
            height: '60px',
            zIndex: 1000
          }`).row.full-width.justify-center.cursor-pointer.br
          div(
            :style=`{
              maxWidth: $store.state.ui.maxWidthPage+'px',
              borderRadius: '0 0 10px 10px'
            }`
            ).row.full-width.items-center.content-center.q-px-sm.b-100
            q-btn(round flat color="white" icon="keyboard_arrow_left")
            span(v-if="node").text-white.text-bold {{node.name}}
      //- body
      div(v-if="true").row.full-width.justify-center
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
                    :mini="true"
                    :opened="false"
                    :essence="false")
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
      scrollTop: 0,
      nodeEditorOpened: false,
      nodeEditorItem: null
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
  watch: {
    '$router.params.page': {
      immediate: true,
      handler (to, from) {
        this.$log('$route.params.page CHANGED', to)
        if (to) {
        }
        else {
          this.$router.replace({params: {page: 'nodes'}}).catch(e => e)
        }
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
    nodeAdd () {
      this.$log('nodeAdd')
      let nodeInput = {
        name: this.node.name,
        wsItemType: 'WS_NODE',
        items: [],
        spheres: [],
        category: 'FUN',
        layout: 'PIP'
      }
      this.nodeEditorItem = nodeInput
      this.nodeEditorOpened = true
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
