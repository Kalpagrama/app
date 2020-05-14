<style lang="sass">
.node-item
  &:hover
    background: rgb(100,100,100) !important
</style>

<template lang="pug">
//- div(:style=`{position: 'relative'}`).row.full-width
//- q-layout(container :style=`{height: $q.screen.height+'px'}`)
.column.fit
  //- dialogs
  //- node editor
  q-dialog(
    v-model="nodeEditorOpened" persistent :maximized="true" position="bottom")
    div(
      :style=`{position: 'relative', height: $q.screen.height+'px'}`).row.full-width.justify-center
      ws-item-saver(:value="node")
        template(v-slot=`{item}`)
          node-editor(
            ctx="workspace" mode="edit"
            :node="item" :wsItemFinderOnBoot="true" :paddingTop="8"
            @cancel="nodeEditorOpened = false"
            :style=`{
              maxWidth: $store.state.ui.maxWidthPage+'px'
            }`)
  //- actions
  //- add
  //- q-btn(
  //-   round push size="lg" color="green" icon="add" @click="nodeAddStart()"
  //-   :style=`{position: 'absolute', zIndex:1000, right: '16px', bottom: '16px', borderRadius: '50% !important'}`)
  //- header
  .row.full-width.justify-center
    div(
      :style=`{maxWidth: $store.state.ui.maxWidthPage+'px', borderRadius: '10px', overflow: 'hidden'}`
      ).row.full-width.items-start.content-start.q-px-sm.b-100.br
      .row.full-width
        .col.q-pr-sm
          q-input(
            v-model="nodeSearchString" filled color="green"
            placeholder="Find or add node"
            :style=`{zIndex: 100, borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`
            ).full-width.bg-grey-1
        div(:style=`{}`).row.full-height
          q-btn(
            push color="green" icon="add" @click="nodeAddStart()"
            :style=`{height: '56px', width: '56px'}`)
      .row.full-width.items-center.content-center
        .col
          kalpa-buttons(:value="tabs" :id="tabId" @id="tabId = $event").justify-start
        q-btn(
          flat color="grey-2" no-caps
          :style=`{height: '36px'}`).q-mr-sm.b-90 Spheres
        q-btn(
          flat color="grey-2" icon="edit"
          :style=`{height: '36px'}`
          ).b-90
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-pt-md
      kalpa-loader(type="NODE_LIST")
        template(v-slot="{items}")
          .row.full-width.items-start
            div(
              v-for="(n, ni) in nodesFilter(items)" :key="n.oid"
              :style=`{
                height: '40px'
              }`
              ).row.full-width.q-mb-xs
              //- div(:style=`{height: '40px', width: '40px'}`).row.items-center.content-center.justify-center
              //-   q-checkbox(v-model="nodesSelected" :val="n.oid" dark dense color="grey-6" )
              .col
                div(
                  @click="nodeClick(n.oid)"
                  :style=`{
                    borderRadius: '10px', overflow: 'hidden'
                  }`
                  ).row.fit.items-center.content-center.q-px-md.cursor-pointer.node-item.b-70
                  span(:style=`{userSelect: 'none'}`).text-white {{ n.name }}
              //- div(:style=`{height: '40px', width: '40px'}`).row.items-center.content-center.justify-center
              //-   q-btn(round flat dense color="grey-6" icon="more_vert")
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
