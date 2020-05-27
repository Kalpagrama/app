<style lang="sass" scoped>
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.q-pt-sm
  //- node add
  q-btn(
    @click="nodeAdd()"
    push round color="green" icon="add"
    :size="$q.screen.gt.xs ? 'xl' : 'md'"
    :style=`{
      position: 'absolute', zIndex: 1000, right: '10px', bottom: '10px',
      borderRadius: '50%'
    }`)
  //- node editor
  q-dialog(v-model="nodeEditorOpened" position="bottom")
    ws-node-editor(
      ctx="workspace"
      :node="node"
      @close="nodeEditorOpened = false"
      :style=`{
        maxWidth: $store.state.ui.maxWidthPage+'px',
        minHeight: $q.screen.height+'px',
        maxHeight: $q.screen.height+'px',
        height: $q.screen.height+'px',
      }`)
  //- header
  div(:style=`{borderRadius: '10px'}`).row.full-width.items-start.content-start.b-50
    //- header
    div(:style=`{height: '60px', marginBottom: '20px'}`).row.full-width.items-center.content-center.q-px-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
      span(:style=`{fontSize: '20px'}`).text-white.text-bold Nodes
    //- search
    div.row.full-width.q-px-sm
      q-input(
        v-model="searchString"
        filled dense color="grey-6" dark
        placeholder="Search"
        ).full-width.b-70
        template(v-slot:append)
          q-btn(
            v-if="searchString.length > 0"
            flat dense color="grey-2" icon="clear" @click="searchString = ''")
    //- actions
    div(:style=`{}`).row.full-width.items-center.content-center.q-px-sm
      .col
        kalpa-buttons(:value="types" :id="type" @id="type = $event" wrapperBg="b-70").justify-start
      q-btn(flat no-caps color="white").b-70 Filter
      q-btn(push no-caps color="green" @click="nodeAdd()").q-ml-sm.gt-xs New
  //- body
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-py-md
      kalpa-loader(type="WS_NODE" :variables="variables")
        template(v-slot=`{items}`)
          div(v-if="items.length > 0").row.full-width.items-start.content-start
            node-item(
              v-for="(n,ni) in items" :key="ni"
              :node="n" :nodeIndex="ni"
              @edit="nodeEdit(n,ni)")
          //- nothing found
          div(
            v-else
            :style=`{height: '200px', borderRadius: '10px', overflow: 'hidden'}`
            ).row.full-width.items-center.content-center.justify-center.b-50
            span.text-white Nothing found :(
</template>

<script>
import nodeItem from './node_item'

export default {
  name: 'wsNodeLsit',
  components: {nodeItem},
  data () {
    return {
      type: 'all',
      types: [
        {id: 'all', name: 'All'},
        {id: 'saved', name: 'Saved'},
        {id: 'draft', name: 'Drafts'},
        {id: 'published', name: 'Published'},
      ],
      searchString: '',
      node: null,
      nodeEditorOpened: false
    }
  },
  computed: {
    variables () {
      let res = {selector: {}}
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      if (this.type !== 'all') {
        res.selector.stage = this.type
      }
      // TODO: add spheres
      return res
    }
  },
  watch: {},
  methods: {
    nodeEdit (node, ni) {
      this.$log('nodeEdit', node, ni)
      this.node = node
      this.nodeEditorOpened = true
    },
    nodeChoose (node) {
      this.$log('nodeChoose', node)
      this.nodeEdit(node)
    },
    async nodeDelete (node) {
      this.$log('nodeDelete', node)
      if (!confirm('Delete node ?!')) return
      await this.$rxdb.deleteItem(node.id)
    },
    async nodeAdd (nodeInput) {
      this.$log('nodeAdd start')
      if (!nodeInput) {
        nodeInput = {
          name: '',
          wsItemType: 'WS_NODE',
          items: [],
          spheres: [],
          category: 'FUN',
          layout: 'PIP',
          stage: 'draft'
        }
      }
      let item = await this.$rxdb.upsertItem(nodeInput)
      this.$log('nodeAddStart item', item)
      this.searchString = ''
      this.nodeChoose(item)
    }
  }
}
</script>
