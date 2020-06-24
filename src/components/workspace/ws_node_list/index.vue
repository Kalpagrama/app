<style lang="sass">
.q-dialog
  border-radius: 0px !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative'
  }`
  ).column.fit
  //- node add
  q-btn(
    @click="nodeAdd()"
    push round color="green" icon="add"
    :size="$q.screen.gt.xs ? 'xl' : 'lg'"
    :style=`{
      position: 'absolute', zIndex: 1000, right: '10px',
      bottom: $q.screen.gt.xs ? 10+'px' : 60+10+'px',
      borderRadius: '50%'
    }`)
  //- node editor
  q-dialog(
    v-model="nodeEditorOpened" position="bottom"
    @before-show="$store.commit('ui/stateSet', ['wsShowMenu', false])"
    @before-hide="$store.commit('ui/stateSet', ['wsShowMenu', true])")
    ws-node-editor(
      ctx="workspace"
      :value="node"
      @published="nodePublished"
      @close="nodeEditorOpened = false"
      :style=`{
        maxWidth: $store.state.ui.maxWidthPage+'px',
        minHeight: $q.screen.height+'px',
        maxHeight: $q.screen.height+'px',
        height: $q.screen.height+'px',
      }`)
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.gt.xs ? '10px' : '0 0 10px 10px',
    }`
    ).row.full-width.items-start.content-start.b-50.q-pb-sm.q-px-sm
    //- header
    div(:style=`{}`).row.full-width.items-center.content-center.q-py-md
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold Nodes
    //- search
    div().row.full-width
      q-input(
        v-model="searchString"
        filled dark dense color="white"
        placeholder="Search..."
        ).full-width
        template(v-slot:append)
          q-btn(
            v-if="searchString.length > 0"
            flat dense color="grey-2" icon="clear" @click="searchString = ''")
          q-btn(
            flat dense color="grey-2" icon="label")
    //- actions
    div(:style=`{}`).row.full-width.items-end.content-end
      .col
        kalpa-buttons(:value="types" :id="type" @id="type = $event" wrapperBg="b-70").justify-start
      //- q-btn(flat no-caps color="white").b-70 Filters
      //- q-btn(push no-caps color="green" @click="nodeAdd()").q-ml-sm.gt-xs New
  //- body
  .col.full-width.scroll
    .row.full-width.justify-center
      div(:style=`{maxWidth: '600px'}`).row.full-width.items-start.content-start.q-py-md.q-px-sm
        kalpa-loader(:mangoQuery="mangoQuery")
          template(v-slot=`{items}`)
            div(v-if="items.length > 0").row.full-width.items-start.content-start
              node-item(
                v-for="(n,ni) in items" :key="ni"
                :node="n" :nodeIndex="ni"
                @edit="nodeEdit(n,ni)"
                @delete="nodeDelete(n,ni)").q-mb-md
            //- nothing found
            div(
              v-else
              :style=`{height: '200px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
              ).row.full-width.items-center.content-center.justify-center.b-50
              span.text-white Nothing found :(
</template>

<script>
import nodeItem from './node_item'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNodeLsit',
  components: {nodeItem},
  data () {
    return {
      type: 'draft',
      types: [
        // {id: 'all', name: 'All'},
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
    mangoQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_NODE}}
      // name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      // type
      if (this.type !== 'all') {
        res.selector.stage = this.type
      }
      // sort
      res.sort = [{updatedAt: 'desc'}]
      return res
    }
  },
  watch: {
    nodeEditorOpened: {
      handler (to, from) {
        this.$log('nodeEditorOpened CHANGED', to)
      }
    }
  },
  methods: {
    nodeEdit (node, ni) {
      this.$log('nodeEdit', node, ni)
      // node.stage = (node.stage === 'draft' ? 'published' : 'draft')
      // return
      // // eslint-disable-next-line no-unreachable
      this.node = node
      this.nodeEditorOpened = true
      // this.$router.push(`/workspace/node/${node.id}`)
    },
    nodeChoose (node) {
      this.$log('nodeChoose', node)
      this.nodeEdit(node)
    },
    async nodeDelete (node) {
      this.$log('nodeDelete', node)
      if (!confirm('Delete node ?!')) return
      await this.$rxdb.remove(node.id)
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
      let item = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeAddStart item', item)
      this.searchString = ''
      this.nodeChoose(item)
    },
    nodePublished () {
      this.$log('nodePublished')
      this.$router.push(`/user/${this.$store.getters.currentUser().oid}`).catch(e => e)
    }
  }
}
</script>
