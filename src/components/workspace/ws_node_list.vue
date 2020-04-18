<style lang="sass">
.node-item
  &:hover
    background: #777 !important
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- dialogs
  //- node editor
  q-dialog(
    v-model="nodeEditorOpened" :maximized="true" position="bottom")
    div(
      @click.self="nodeEditorOpened = false"
      :style=`{position: 'relative', height: $q.screen.height+'px'}`).row.full-width.justify-center.q-py-sm
      ws-item-saver(:value="node")
        template(v-slot=`{item}`)
          node-editor(
            ctx="workspace" mode="edit"
            :node="item.rawData" :wsItemFinderOnBoot="true" :paddingTop="8"
            @cancel="nodeEditorOpened = false"
            :style=`{
              maxWidth: $store.state.ui.maxWidthPage+'px'
            }`)
  //- actions
  //- add
  q-btn(
    round push size="lg" color="green" icon="add" @click="nodeAddStart()"
    :style=`{position: 'absolute', zIndex:1000, right: '16px', bottom: '16px', borderRadius: '50% !important'}`)
  //- header
  .row.full-width
    .row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.items-center.content-center.q-pa-sm
        q-input(
          v-model="searchInput" filled color="green"
          placeholder="Find or add node"
          :input-style=`{}`
          :style=`{zIndex: 100, borderRadius: '10px', overflow: 'hidden', transform: 'translate3d(0,0,0)'}`
          ).full-width.bg-grey-1
  //- body
  .col.full-width.scroll
    .row.full-width.justify-center
      div(:style=`{position: 'relative', maxWidth: $store.state.ui.maxWidthPage+'px', paddingTop: '0px', paddingBottom: '80px'}`
        ).row.full-width.items-start.content-start.q-px-sm
        //- nodes
        kalpa-loader(type="NODE_LIST" :variables=`{}`)
          template(v-slot="{items}")
            .row.full-width.items-start
              div(
                v-for="(n, ni) in items" :key="n.oid" @click="nodeClick(n.oid)"
                :style=`{
                  height: '40px',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }`
                ).row.full-width.items-center.content-center.bg-grey-8.q-mb-sm.cursor-pointer.q-px-md.node-item
                span(:style=`{userSelect: 'none'}`).text-white {{ n.name }}
</template>

<script>
export default {
  name: 'wsNodeList',
  data () {
    return {
      node: null,
      nodeEditorOpened: false,
      searchInput: ''
    }
  },
  computed: {
    oid () {
      return this.$route.params.oid
    }
  },
  methods: {
    async nodeClick (oid) {
      this.$log('nodeClick', oid)
      this.node = await this.$store.dispatch('objects/get', {oid: oid})
      this.$log('nodeClick node', this.node)
      this.nodeEditorOpened = true
      // this.$emit('item', {type: 'node', item: nodeFull})
    },
    async nodeAddStart () {
      this.$log('nodeAddStart')
      let nodeInput = {
        name: 'New node',
        wsItemType: 'NODE',
        rawData: {
          name: 'New node' + Date.now(),
          items: [],
          spheres: [],
          category: 'FUN',
          layout: 'PIP'
        }
      }
      this.$log('nodeAddStart nodeInput', nodeInput)
      this.node = await this.$store.dispatch('workspace/wsItemCreate', nodeInput)
      this.$log('nodeAddStart node', this.node)
      // this.nodeEditorOpened = true
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
