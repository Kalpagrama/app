<template lang="pug">
div(
  :class=`{
    'q-pt-sm': $q.screen.gt.xs,
  }`
  :style=`{
    position: 'relative'
  }`
  ).column.fit
  //- node ADD
  q-btn(
    @click="nodeAddBtn()"
    push round color="green" icon="add"
    :size="$q.screen.gt.xs ? 'xl' : 'lg'"
    :style=`{
      position: 'absolute', zIndex: 1000, right: '10px',
      bottom: $q.screen.width > 1260 ? 10+'px' : 60+10+'px',
      borderRadius: '50%'
    }`)
  //- node EDITOR
  q-dialog(v-model="nodeEditorOpened" position="bottom")
    ws-node-editor(
      ctx="workspace"
      :value="nodeEditorItem"
      @published="nodePublished"
      @close="nodeEditorOpened = false"
      :style=`{
        maxWidth: $store.state.ui.maxWidthPage+'px',
        minHeight: $q.screen.height+'px',
        maxHeight: $q.screen.height+'px',
        height: $q.screen.height+'px',
      }`)
  //- node PREVIEW
  q-dialog(v-model="nodePreviewOpened" position="bottom")
    div(
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
        maxWidth: '800px',
        borderRadius: '10px',overflow: 'hidden',
      }`).column.b-50
      //- body
      .col.full-width
        node(:node="nodePreviewItem" :nodeFullReady="nodePreviewItem" :active="true" :visible="true" :mini="false")
      //- footer
      .row.full-width.items-center.content-center.q-pa-sm
        q-btn(
          round flat color="white" icon="keyboard_arrow_left" @click="nodePreviewOpened = false")
        .col.q-pl-sm
          q-btn(
            @click="nodeFork(nodeEditorItem)"
            push color="green" no-caps icon="photo_filter"
            :style=`{height: '42px',}`).full-width {{$t('node_fork', 'Взять и изменить')}}
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.gt.xs ? '10px' : '0 0 10px 10px',
    }`
    ).row.full-width.items-start.content-start.b-50
    //- navigation
    div(:style=`{height: '100px',}`).row.full-width.items-center.content-center.q-px-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold {{$t('ws_nodes', 'Ядра')}}
    //- search
    div().row.full-width.q-px-sm
      q-input(
        v-model="searchString"
        filled dark dense color="white"
        :placeholder="$t('search_placeholder', 'Поиск')"
        ).full-width
        template(v-slot:append)
          q-btn(
            v-if="searchString.length > 0"
            flat dense color="white" icon="clear" @click="searchString = ''")
          q-btn(
            flat dense color="white" icon="filter_list")
    //- actions
    div(:style=`{}`).row.full-width.items-end.content-end.q-px-sm.q-pb-sm.scroll
      .row.no-wrap
        kalpa-buttons(:value="types" :id="type" @id="type = $event" screenSet="gt.xs" wrapperBg="b-70").justify-start.q-mr-sm
  //- body
  .col.full-width.scroll
    kalpa-loader(:mangoQuery="mangoQuery")
      template(v-slot=`{items}`)
        .row.fit.items-start.content-start
          node-item(
            v-for="(i,ii) in items" :key="i"
            :node="i" :nodeIndex="ii"
            @preview="nodePreview(i)"
            @delete="nodeDelete(i)"
            @edit="nodeEdit(i)"
            @unSave="nodeUnSave(i)"
            @unPublish="nodeUnPublish(i)"
            @fork="nodeFork(i)")
</template>

<script>
import assert from 'assert'
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'

import nodeItem from './node_item'

export default {
  name: 'wsNodeLsit',
  components: {nodeItem},
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
        {id: 'saved', name: this.$t('nodes_saved', 'Сохраненные')},
        {id: 'draft', name: this.$t('nodes_drafts', 'Черновики')},
        {id: 'published', name: this.$t('nodes_published', 'Опубликованные')},
      ]
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
    async nodePreview (n) {
      this.$log('nodePreview', n)
      if (n.stage === 'draft') return
      this.nodeEditorItem = n
      this.nodePreviewItem = await this.$rxdb.get(RxCollectionEnum.OBJ, n.oid)
      this.nodePreviewOpened = true
    },
    nodeEdit (n) {
      this.$log('nodeEdit', n)
      this.nodeEditorItem = n
      this.nodeEditorOpened = true
    },
    async nodeFork (n) {
      this.$log('nodeFork', n)
      this.nodePreviewOpened = false
      await this.nodeEdit(await this.nodeAdd(JSON.parse(JSON.stringify(n))))
    },
    async nodeDelete (n) {
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
      this.$log('nodeUnPublish', node)
      if (!confirm(this.$t('Unpublish node?', 'Снять с публикации?'))) return
      await NodeApi.nodeDelete(node.oid)
      node.stage = 'draft'
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
