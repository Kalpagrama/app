<style lang="sass">
.node-item
  &:hover
    background: rgb(100,100,100) !important
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- actions
  //- action: ADD
  q-btn(
    round push color="green" icon="add" size="lg" @click="nodeAddStart()"
    :style=`{
      position: 'absolute', zIndex: 1000,
      bottom: $q.screen.width > 600 ? 8+'px' : 60+8+'px',
      right: '8px',
      borderRadius: '50%'
    }`)
  //- dialogs
  //- node editor
  q-dialog(v-model="nodeEditorOpened" persistent position="bottom")
    ws-item-saver(v-if="node" :value="node")
      template(v-slot=`{item}`)
        node-editor(
          ctx="workspace"
          :node="item"
          @cancel="nodeEditorOpened = false"
          :style=`{
            maxWidth: $store.state.ui.maxWidthPage+'px',
            minHeight: $q.screen.height+'px',
            maxHeight: $q.screen.height+'px',
            height: $q.screen.height+'px',
          }`)
  //- body
  div(
    ref="wsNodeListScrollArea"
    :class=`{
      'q-pt-sm': $q.screen.width > 600
    }`
    ).col.full-width.scroll
    slot(name="header")
    //- header: essence input
    div(:style=`{marginTop: '-20px', paddingTop: '30px'}`
      ).row.full-width.items-start.content-start.justify-center.b-100
      .row.full-width.q-px-sm
        q-input(
          v-model="nodeSearchString" filled color="green"
          label="Find or add node"
          :style=`{zIndex: 100, borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`
          ).full-width.q-mx-sm.b-220
      //- tabs
      div(
        :style=`{
          zIndex: 100,
          borderRadius: '0 0 10px 10px', overflow: 'hidden'
        }`
        ).row.full-width.items-center.content-center.q-px-sm.b-100
        .col
          kalpa-buttons(:value="tabs" :id="tabId" @id="tabId = $event").justify-start
        q-btn(
          flat color="white" no-caps
          :style=`{height: '36px'}`).b-110 Spheres
    //- header: edit
    div(:style=`{
      position: 'sticky', top: '-20px',
      borderRadius: '0 0 10px 10px', marginTop: '-20px', paddingTop: '28px'}`
      ).row.full-width.q-pb-sm.b-80
      div(@click.self="scrollTo(0)").col.full-height
        div(v-if="nodesSelected.length > 0").row.fit.items-center.content-center.q-px-sm
          q-btn(flat color="white").b-90.q-mr-sm {{nodesSelected.length}}
          q-btn(flat color="white" no-caps @click="nodesSelectedDelete()").b-90.q-mr-sm Delete
          q-btn(flat color="white" no-caps @click="nodesSelectedDrop()").b-90 Drop selection
      q-btn(flat color="white" icon="edit" @click="nodesEdit()").b-90.q-mr-sm
    kalpa-loader(type="NODE_LIST")
      template(v-slot="{items}")
        .row.full-width.items-start.q-py-sm
          div(
            v-for="(n, ni) in nodesFilter(items)" :key="n.oid"
            :style=`{
              height: '40px'
            }`
            ).row.full-width.q-mb-xs
            //- left:
            div(
              :style=`{
                height: '40px',
                width: nodesEditingWidth+'px',
                borderRadius: '10px', overflow: 'hidden'
              }`
              ).row.items-center.content-center.justify-center
              //- q-btn(round flat color="white" icon="more_vert")
              q-checkbox(v-model="nodesSelected" :val="n.oid" dark dense color="grey-6" )
            .col
              div(
                @click="nodeClick(n.oid)"
                :style=`{
                  borderRadius: '10px', overflow: 'hidden'
                }`
                ).row.fit.items-center.content-center.q-px-md.cursor-pointer.node-item.b-70
                span(:style=`{userSelect: 'none'}`).text-white {{ n.name }}
            //- right:
            div(
              :style=`{
                height: '40px',
                width: nodesEditingWidth+'px',
                borderRadius: '10px', overflow: 'hidden'
              }`
              ).row.items-center.content-center.justify-center
              q-btn(round flat dense color="grey-6" icon="drag_indicator")
    div(:style=`{height: '1000px'}`).row.full-width
</template>

<script>
export default {
  name: 'wsNodeList',
  data () {
    return {
      node: null,
      nodeEditorOpened: false,
      nodeSearchString: '',
      nodesSelected: [],
      nodesEditing: false,
      nodesEditingWidth: 0,
      tabId: 'all',
      tabs: [
        {id: 'all', name: 'All'},
        {id: 'selected', name: 'Selected'},
        {id: 'drafts', name: 'Drafts'},
        {id: 'published', name: 'Published'}
      ]
    }
  },
  computed: {
    oid () {
      return this.$route.params.oid
    }
  },
  watch: {
    nodesEditing: {
      handler (to, from) {
        this.$log('nodesEditing')
        this.$tween.to(this, 0.5, {nodesEditingWidth: to ? 40 : 0})
      }
    },
    nodeEditorOpened: {
      handler (to, from) {
        this.$log('nodeEditorOpened CHANGED', to)
        if (to) {
          this.$store.commit('workspace/stateSet', ['showFooter', false])
          this.$store.commit('workspace/stateSet', ['showHeader', false])
        } else {
          this.$store.commit('workspace/stateSet', ['showFooter', true])
          this.$store.commit('workspace/stateSet', ['showHeader', true])
        }
      }
    },
    '$route.query.node': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route.query.node CHANGED', to)
        if (to) {
          // create node and delete query params
          await this.nodeAddStart(JSON.parse(to))
          this.$router.replace(this.$route.path)
        }
      }
    }
  },
  methods: {
    nodesEdit () {
      this.$log('nodesEdit')
      this.nodesEditing = !this.nodesEditing
    },
    nodesSelectedDelete () {
      this.$log('nodeSeletedDelete')
      if (!confirm('Delete selected nodes?')) return
      this.nodesSelected.map(oid => {
        this.$store.dispatch('workspace/wsItemDelete', oid)
      })
    },
    nodesSelectedDrop () {
      this.$log('nodesSelectedDrop')
      this.nodesSelected = []
    },
    nodesFilter (arr) {
      // return arr.filter(node => {
      //   // check node string match
      //   let nodeStringMatch = true
      //   if (this.nodeSearchString.length > 0) {
      //     if (!node.name.includes(this.nodeSearchString)) nodeStringMatch = false
      //   }
      //   // check tab.id
      // })
      if (this.nodeSearchString.length > 0) {
        return arr.filter(i => i.name.includes(this.nodeSearchString))
      }
      else {
        return arr
      }
    },
    async nodeClick (oid) {
      this.$log('nodeClick', oid)
      this.node = await this.$store.dispatch('objects/get', {oid: oid})
      this.$log('nodeClick node', this.node)
      // await this.$wait(300)
      this.nodeEditorOpened = true
    },
    async nodeAddStart (_nodeInput) {
      this.$log('nodeAddStart')
      let nodeInput = _nodeInput || {
        name: this.nodeSearchString,
        wsItemType: 'NODE',
        items: [],
        spheres: [],
        category: 'FUN',
        layout: 'PIP'
      }
      this.$log('nodeAddStart nodeInput', nodeInput)
      this.node = await this.$store.dispatch('workspace/wsItemCreate', nodeInput)
      this.nodeSearchString = ''
      this.$log('nodeAddStart node', this.node)
      // await this.$wait(1000)
      // this.$log('nodeAddStart node AFTER', this.node)
      this.nodeEditorOpened = true
    },
    scrollTo (val) {
      this.$log('scrollTo', val)
      let ref = this.$refs.wsNodeListScrollArea
      if (ref) {
        this.$tween.to(ref, 0.5, {scrollTop: val})
      }
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
