<style lang="sass">
.node-item
  &:hover
    background: rgb(100,100,100) !important
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- actions
  //- node ADD
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    q-btn(
      v-if="nodesSelected.length === 0"
      round push color="green" icon="add" size="lg" @click="nodeAddStart()"
      :style=`{
        position: 'absolute', zIndex: 1000,
        bottom: $q.screen.width > 600 ? 8+'px' : 60+8+'px',
        right: '8px',
        borderRadius: '50%'
      }`)
  //- node editor
  q-dialog(v-model="nodeEditorOpened" persistent position="bottom")
    node-editor(
      ctx="workspace"
      :node="node"
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
    ).col.full-width.scroll.br
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
          v-if="false"
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
          q-btn(flat color="white" no-caps @click="nodesSelectedDrop()").b-90.q-mr-sm Drop selection
          q-btn(flat color="white" no-caps @click="nodesSelectedMerge()").b-90.q-mr-sm Merge
      q-btn(
        flat color="white" icon="edit" @click="nodesEdit()"
        :style=`{width: '36px'}`).b-90.q-mr-sm
    //- nodes list
    kalpa-loader(type="WS_NODE" :variables="variables" @itemsLength="itemsLengthChanged")
      template(v-slot="{items}")
        .row.full-width.items-start.q-py-sm
          div(
            v-for="(n, ni) in items" :key="n.oid"
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
              q-checkbox(v-model="nodesSelected" :val="n.id" dark dense color="grey-6" )
            .col
              div(
                @click="nodeClick(n)"
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
                q-menu(auto-close anchor="top left" self="top right")
                  .row.full-width.b-100
                    q-btn(flat dense color="white" no-caps align="left" @click="nodeClick(n)").q-px-sm.full-width Edit
                    q-btn(flat dense color="white" no-caps align="left" @click="nodeDelete(n.id)").q-px-sm.full-width Delete
    //- nodeSearchStringCreate
    div(
      v-if="nodeSearchStringCreateShow && nodeSearchString.length > 0"
      ).row.full-width.items-center.content-center.q-px-sm
      small.text-white.q-mr-sm Create node
      q-btn(no-caps color="green" @click="nodeSearchStringCreate") {{nodeSearchString}}
    //- paddingBottom
    div(:style=`{height: '1000px'}`).row.full-width
</template>

<script>
import assert from 'assert'

export default {
  name: 'wsNodeList',
  data () {
    return {
      node: null,
      nodeEditorOpened: false,
      nodeSearchString: '',
      nodeSearchStringCreateShow: false,
      nodesSelected: [],
      nodesEditing: false,
      nodesEditingWidth: 0,
      tabId: 'all',
      tabs: [
        {id: 'all', name: 'All'},
        {id: 'selected', name: 'Selected'},
        {id: 'draft', name: 'Drafts'},
        {id: 'published', name: 'Published'}
      ]
    }
  },
  computed: {
    oid () {
      return this.$route.params.oid
    },
    variables () {
      let res = {selector: {}}
      if (this.nodeSearchString.length > 0) {
        let nameRegExp = new RegExp(this.nodeSearchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      if (this.tabId !== 'all') {
        res.selector.stage = this.tabId
      }
      return res
    }
  },
  watch: {
    // tabId: {},
    nodeSearchString: {
      immediate: true,
      handler (to, from) {
        this.$log('nodeSearchString CHANGED', to)
        if (to.length === 0) {
          this.nodeSearchStringCreateShow = false
        }
      }
    },
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
    itemsLengthChanged (to) {
      this.$log('itemsLengthChanged', to)
      if (to === 0) {
        this.nodeSearchStringCreateShow = true
      }
      else {
        this.nodeSearchStringCreateShow = false
      }
    },
    nodeSearchStringCreate () {
      this.$log('nodeSearchStringCreate')
      this.nodeAddStart()
    },
    nodesSelectedDelete () {
      this.$log('nodeSeletedDelete')
      if (!confirm('Delete selected nodes?')) return
      // this.nodesSelected.map(oid => {
      //   this.$rxdb.deleteItem(oid)
      // })
      this.nodesSelectedDrop = []
    },
    nodesSelectedDrop () {
      this.$log('nodesSelectedDrop')
      this.nodesSelected = []
    },
    nodesSelectedMerge () {
      this.$log('nodesSelectedMerge')
    },
    nodeDelete (id) {
      this.$log('nodeDelete', id)
      if (!confirm('Delete node?!')) return
      // do something
      let x = '2'
    },
    async nodeClick (item) {
      this.$log('nodeClick', item)
      this.node = item
      await this.$wait(300)
      this.nodeEditorOpened = true
    },
    async nodeAddStart (_nodeInput) {
      this.$log('nodeAddStart start', this.node)
      let nodeInput = _nodeInput || {
        name: this.nodeSearchString,
        wsItemType: 'WS_NODE',
        items: [],
        spheres: [],
        category: 'FUN',
        layout: 'PIP',
        stage: 'draft'
      }
      let item = await this.$rxdb.upsertItem(nodeInput)
      this.$log('nodeAddStart item', item)
      this.nodeSearchString = ''
      this.nodeClick(item)
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
