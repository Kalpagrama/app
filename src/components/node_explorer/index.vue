<template lang="pug">
q-layout
  //- q-header(reveal)
  //-   div(:style=`{height: '60px'}`).row.full-width.items-center.q-px-md
  //-     q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.go(-1)")
  //-     span Node explorer
  //-     .col
  //-     q-btn(round flat color="white" icon="more_vert")
  q-page-container
    .row.full-width.items-center.content-start.q-pa-sm
      node(v-if="node" :node="node" :needFull="true" :index="0" @nodeFull="nodeFullLoaded" :active="true"
        :style=`{borderRadius: '10px', maxWidth: '500px'}`).bg-white.q-mt-m
    q-btn(
      v-if="!footerShow" color="green" no-caps @click="footerToggle()"
      :style=`{position: 'fixed', zIndex: 1100, bottom: '10px', height: '60px', borderRadius: '10px', left: '10px', width: 'calc(100% - 20px)'}`)
      span Explore nodes
    div(
      v-show="footerShow"
      v-touch-swipe.down="footerHide"
      :style=`{
        position: 'fixed', bottom: '0px', zIndex: 1000,
        borderRadius: '10px 10px 0 0', overflow: 'hidden',
        maxHeight: footerHeight+'px', height: footerHeight+'px'}`).column.full-width.bg-white
      //- header
      div(
        v-touch-swipe.mouse="footerSwipe"
        v-touch-pan.mouse.prevent="footerPan"
        :style=`{height: '60px'}`).row.full-width.items-center.q-pl-md.q-pr-sm
        span Explore nodes
        .col
        q-btn(round flat color="grey-6" icon="drag_indicator")
      //- body
      .col.bg-grey-3
        nodes(v-if="node" :node="node")
</template>

<script>
import nodes from './nodes'

export default {
  name: 'nodeExplorer',
  components: {nodes},
  data () {
    return {
      node: null,
      needFull: false,
      nodeFull: null,
      active: false,
      footerHeight: 60,
      footerShow: false
    }
  },
  computed: {
    isDesktop () {
      return this.$q.screen.width > 850
    }
  },
  watch: {
    '$route': {
      immediate: true,
      async handler (to, from) {
        if (to.params.oid) {
          this.$log('$route CHANGED', to.params.oid)
          this.tab = 'node'
          // this.node = null
          this.active = false
          this.node = await this.nodeLoad(to.params.oid)
          // ??
          this.needFull = false
          await this.$wait(100)
          this.needFull = true
        }
      }
    }
  },
  methods: {
    footerToggle () {
      this.$log('footerToggle')
      this.footerShow = !this.footerShow
      this.$tween.to(this, 0.4, {footerHeight: this.$q.screen.height - 60})
    },
    footerHide () {
      this.$log('footerHide')
      this.$tween.to(this, 0.4, {footerHeight: 60})
    },
    footerSwipe (e) {
      // this.$log('footerSwipe', e)
      if (e.direction === 'up') {
        this.$tween.to(this, 0.4, {footerHeight: this.$q.screen.height - 60})
      } else if (e.direction === 'down') {
        this.$tween.to(this, 0.4, {footerHeight: 60})
      }
    },
    footerPan (e) {
      // this.$log('footerPan', e)
      let to = this.footerHeight - e.delta.y
      if (to < this.$q.screen.height - 60 && to > 60) {
        this.footerHeight -= e.delta.y
      }
      if (e.isFinal) {
        this.$log('footerPan isFinal')
        if (this.footerHeight > this.$q.screen.height / 2) this.$tween.to(this, 0.4, {footerHeight: this.$q.screen.height - 60})
        else this.$tween.to(this, 0.4, {footerHeight: 60})
      }
    },
    async nodeFullLoaded (n) {
      this.$log('nodeFullLoaded', n)
      this.nodeFull = n
      this.active = true
    },
    async nodeLoad (oid) {
      this.$log('nodeLoad start')
      let { data: { objectList: [node] } } = await this.$apollo.query({
        query: gql`
          query getExtendedNodesPropsExplorer($oid: OID!) {
            objectList(oids: [$oid]) {
              oid
              type
              name
              createdAt
              thumbUrl(preferWidth: 600)
              meta {
                ...on MetaNode {
                  layout
                  fragments { uid width height color thumbUrl(preferWidth: 600) }
                }
              }
            }
          }
        `,
        variables: {
          oid: oid
        },
        fetchPolicy: 'cache-first'
      })
      this.$log('nodeLoad done', node.name)
      return node
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

<style lang="stylus">
</style>
