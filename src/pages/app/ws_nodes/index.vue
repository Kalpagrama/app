<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{maxWidth: '800px'}`).row.full-width
        slot(name="header")
        .row.full-width.q-px-sm
          .col
            div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
              q-input(
                v-model="searchString"
                filled dark dense color="white"
                :placeholder="$t('wsNodeList_searchPlaceholder', 'Найти ядро')"
                ).full-width
                template(v-slot:append)
                  q-btn(
                    v-if="searchString.length > 0"
                    flat dense color="white" icon="clear" @click="searchString = ''")
                  q-btn(
                    flat dense color="white" icon="tune")
          q-btn(round flat color="green" icon="add" @click="$router.push('/workspace/node/new')")
        .row.full-width.q-px-md
            q-tabs(
              :value="$route.name" @input="$router.push({name: $event})"
              dense no-caps active-color="white" align="left" switch-indicator
              ).full-width.text-grey-8
              q-tab(v-for="t in types" :key="t.id" :name="t.id" :label="t.name")
      q-page-sticky(position="bottom" :offset="[0, 60]")
  q-page-container
    router-view(:searchString="searchString")
    //- q-page(style="padding-top: 8px")
      .row.full-width.justify-center
        div(:style=`{maxWidth: '800px', paddingBottom: '200px',}`).row.full-width.items-start.content-start
          q-tab-panels(
            v-model="type" infinite animated
            :style=`{margin: 0, padding: 0, background: 'none'}`).full-width
            //- q-tab-panel(name="fragments" :style=`{margin: 0, padding: 0, background: 'none', minHeight: '100vh'}`)
              nodes-fragments(:searchString="searchString")
            //- q-tab-panel(name="saved" :style=`{margin: 0, padding: 0, background: 'none', minHeight: '100vh'}`)
              kalpa-loader(:mangoQuery="querySavedNodes" :sliceSize="1000")
                template(v-slot=`{items, itemsMore}`)
                  .row.full-width.items-start.content-start.justify-center.q-px-sm
                    node-bookmark(
                      v-for="(i,ii) in items" :key="i.id"
                      :node="i" :nodeIndex="ii"
                      @remove="nodeRemove(i)")
            q-tab-panel(name="draft" :style=`{margin: 0, padding: 0, background: 'none', minHeight: '100vh'}`)
              kalpa-loader(:mangoQuery="queryDraftNodes" :sliceSize="1000")
                template(v-slot=`{items, itemsMore}`)
                  .row.full-width.items-start.content-start.justify-center.q-px-sm
                    node-item(
                      v-for="(i,ii) in items" :key="i.id"
                      :node="i" :nodeIndex="ii"
                      @edit="nodeEdit(i)"
                      @remove="nodeRemove(i)").q-mb-sm
            q-tab-panel(name="published" :style=`{margin: 0, padding: 0, background: 'none', minHeight: '100vh'}`)
              nodes-published(:searchString="searchString")
              //- kalpa-loader(:mangoQuery="queryPublishedNodes" :sliceSize="1000")
                template(v-slot=`{items, itemsMore}`)
                  .row.full-width.items-start.content-start.justify-center.q-px-sm
                    node-item(
                      v-for="(i,ii) in items" :key="i.id"
                      :node="i" :nodeIndex="ii"
                      @edit="nodeEdit(i)"
                      @remove="nodeRemove(i)").q-mb-sm
        //- q-btn(
          @click="nodeAddBtn()"
          push round color="green" icon="add"
          :style=`{borderRadius: '50%'}`)
</template>

<script>
import assert from 'assert'
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'

import nodeItem from './node_item.vue'
import nodeBookmark from './node_bookmark.vue'
import nodesFragments from './nodes_fragments.vue'
import nodesPublished from './nodes_pubished.vue'

export default {
  name: 'pageApp__wsNodes',
  components: {nodeItem, nodeBookmark, nodesFragments, nodesPublished},
  props: {
    mode: {
      type: String,
      default () {
        return 'standalone'
      }
    },
    options: {
      type: Object,
      default () {
        return {
          // types: [],
          // typesAll: true
        }
      }
    },
  },
  meta () {
    return {
      title: 'Nodes'
    }
  },
  data () {
    return {
      type: 'draft',
      searchString: '',
      nodeEditorItem: null,
      nodeEditorOpened: false,
      nodePreviewItem: null,
      nodePreviewOpened: false,
    }
  },
  computed: {
    types () {
      return [
        {id: 'workspace.nodes.drafts', name: this.$t('nodes_drafts', 'Черновики')},
        {id: 'workspace.nodes.published', name: this.$t('nodes_published', 'Опубликованные')},
      ]
    },
    querySavedNodes () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK}}
      // name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      res.sort = [{updatedAt: 'desc'}]
      return res
    },
    queryDraftNodes () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_NODE, stage: 'draft'}}
      // name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      res.sort = [{updatedAt: 'desc'}]
      return res
    },
    queryPublishedNodes () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_NODE, stage: 'published'}}
      // name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      res.sort = [{updatedAt: 'desc'}]
      return res
    },
  },
  watch: {
  },
  methods: {
    nodeEdit (node) {
      this.$log('nodeEdit', node)
      this.$router.push(`/workspace/node/${node.id}`).catch(e => e)
    },
    async nodeRemove (node) {
      this.$log('nodeRemove', node)
      if (!confirm(this.$t('delete_node?', 'Удалить ядро?'))) return
      await this.$rxdb.remove(node.id)
    },
    async nodeAddBtn () {
      this.$log('nodeAddBtn')
      // open editor? open something..
      // this.nodeEdit(await this.nodeAdd())
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
      delete nodeInput.id
      delete nodeInput.oid
      delete nodeInput.rev
      // set defaults
      nodeInput.stage = 'draft'
      nodeInput.wsItemType = 'WS_NODE'
      let item = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      this.$log('nodeAddStart item', item)
      return item
    },
    async nodeUnPublish (node) {
      this.$log('nodeUnPublish start')
      if (!confirm(this.$t('Unpublish node?', 'Снять с публикации?'))) return
      await node.updateExtended('stage', 'draft', false)// без debounce
      await node.updateExtended('oid', node.oid, false)// без debounce
      await NodeApi.nodeDelete(node.oid)
      this.$log('nodeUnPublish complete')
    },
    async nodeUnSave (node) {
      this.$log('nodeUnSave', node)
      await this.nodeDelete(node)
    },
  }
}
</script>
