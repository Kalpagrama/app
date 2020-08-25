<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.b-30
        div(
          v-if="mode === 'standalone'"
          :style=`{height: '50px'}`).row.full-width.items-center.content-center.justify-between.q-px-md
          span(:style=`{fontSize: '19px'}`).text-white.text-bold {{$t('wsNodeList_title', 'Ядра')}}
        .row.full-width.q-px-sm.q-pt-sm
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
                flat dense color="white" icon="filter_list")
  q-page-container
    q-page(style="padding-top: 60px")
      .row.full-width.justify-center
        div(:style=`{maxWidth: '800px', paddingBottom: '1000px',}`).row.full-width.items-start.content-start
          q-tab-panels(
            v-model="type" swipeable infinite animated
            :style=`{margin: 0, padding: 0, background: 'none'}`).full-width
            q-tab-panel(
              v-for="t in typesFiltered" :key="t.id" :name="t.id"
              :style=`{margin: 0, padding: 0, background: 'none', minHeight: '100vh'}`)
              kalpa-loader(:mangoQuery="mangoQuery" :sliceSize="1000")
                template(v-slot=`{items, itemsMore}`)
                  .row.full-width.items-start.content-start.justify-center.q-px-sm
                    node-item(
                      v-for="(i,ii) in items" :key="i"
                      :node="i" :nodeIndex="ii"
                      @pick="nodePicked(i)")
      q-page-sticky(expand position="top")
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: '800px'}`).row.full-width.q-px-md
            q-tabs(v-model="type" dense no-caps active-color="white" align="left" switch-indicator).full-width.text-grey-8
              q-tab(v-for="t in typesFiltered" :key="t.id" :name="t.id" :label="t.name")
      q-page-sticky(position="bottom" :offset="[0, 60]")
        q-btn(
          v-if="mode === 'standalone'"
          @click="nodeAddBtn()"
          push round color="green" icon="add"
          :style=`{borderRadius: '50%'}`)
</template>

<script>
import assert from 'assert'
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'

import nodeItem from './node_item'

export default {
  name: 'wsNodeLsit',
  components: {nodeItem},
  props: {
    mode: {
      type: String,
      default () {
        return 'standalone' // standalone, picker, readonly, etc...
      }
    },
    options: {
      type: Object,
      default () {
        return {
          types: [],
          typesAll: true
        }
      }
    },
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
    typesFiltered () {
      let arr = [
        {id: 'saved', name: this.$t('nodes_saved', 'Сохраненные')},
        {id: 'draft', name: this.$t('nodes_drafts', 'Черновики')},
        {id: 'published', name: this.$t('nodes_published', 'Опубликованные')},
      ]
      // if (this.options.typesAll) return this.arr
      // else return arr.filter(i => this.options.types.includes(i.id))
      return arr
    },
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
  },
  methods: {
    nodePicked (node) {
      this.$log('nodePicked', node)
      this.$router.push(`/workspace/node/${node.id}`)
    },
    async nodePreview (n) {
      this.$log('nodePreview', n)
      if (this.mode === 'standalone') {
        if (n.stage === 'draft') {
          this.$q.notify({type: 'negative', message: 'Publish draft to explore!'})
          return
        }
        if (!n.oid) {
          this.$q.notify({type: 'negative', message: 'No node OID !'})
          return
        }
        this.$router.push('/node/' + n.oid).catch(e => e)
      }
      else if (this.mode === 'picker') {
        this.$emit('node', JSON.parse(JSON.stringify(n)))
      }
      else {
        this.$q.notify({type: 'negative', message: 'No Action!'})
      }
    },
    nodeEdit (n) {
      this.$log('nodeEdit', n)
      if (this.mode === 'standalone') {
        this.nodeEditorItem = n
        this.nodeEditorOpened = true
      }
      else if (this.mode === 'picker') {
        this.$emit('node', JSON.parse(JSON.stringify(n)))
      }
      else {
        this.$q.notify({type: 'negative', message: 'No action!'})
      }
    },
    async nodeFork (n) {
      this.$log('nodeFork', n)
      this.nodePreviewOpened = false
      await this.nodeEdit(await this.nodeAdd(JSON.parse(JSON.stringify(n))))
    },
    async nodeDelete (n) {
      // await n.updateExtended('stage', 'published', false)// без debounce
      // return
      // eslint-disable-next-line no-unreachable
      this.$log('nodeDelete', n)
      if (!confirm(this.$t('delete_node?', 'Удалить ядро?'))) return
      await this.$rxdb.remove(n.id)
    },
    async nodeAddBtn () {
      this.$log('nodeAddBtn')
      this.nodeEdit(await this.nodeAdd())
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
    async nodePublished (oid) {
      this.$log('nodePublished')
      this.$router.push(`/node/${oid}`).catch(e => e)
    },
  }
}
</script>
