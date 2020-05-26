<style lang="sass" scoped>
</style>

<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit.q-pt-sm
  //- node editor
  q-dialog(v-model="nodeEditorOpened" persistent position="bottom")
    ws-item-saver(v-if="node" :value="node")
      template(v-slot=`{item}`)
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
  //- header
  div(:style=`{borderRadius: '10px'}`).row.full-width.items-start.content-start.b-50
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center.q-px-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()")
      span(:style=`{fontSize: '20px'}`).text-white.text-bold Nodes
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
    div(:style=`{}`).row.full-width.items-center.content-center.q-px-sm
      .col
        kalpa-buttons(:value="types" :id="type" @id="type = $event" wrapperBg="b-70").justify-start
      q-btn(flat no-caps color="white").b-70 Filters
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
      return res
    }
  },
  methods: {
    nodeEdit (n, ni) {
      this.$log('nodeEdit', n, ni)
      this.node = n
      this.nodeEditorOpened = true
    }
  }
}
</script>
