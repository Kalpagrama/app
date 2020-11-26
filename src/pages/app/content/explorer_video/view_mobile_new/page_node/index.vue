<template lang="pug">
q-page(
  :style=`{
    paddingTop: '0px',
    paddingBottom: '0px',
  }`
  ).row.full-width.items-start.content-start.justify-center
  //- contentfinder
  q-dialog(
    v-model="rightItemFinderShow"
    position="bottom" maximized)
    kalpa-finder(
      @contentKalpa="contentKalpaFound"
      :pagesFilter="['workspace', 'kalpa', 'gif', 'web']"
      :workspaceTypes="['IMAGE', 'VIDEO']"
      :kalpaTypes="['IMAGE', 'VIDEO']"
      :pages=`{
        workspace: {views: ['all', 'nodes', 'drafts', 'image', 'video']},
        kalpagrama: {views: ['all', 'users', 'nodes']},
        gif: {views: ['all']},
        web: {views: ['all', 'image', 'video',]}
      }`
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
        height: $q.screen.height+'px',
      }`).b-30
      template(v-slot:header)
        div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="rightItemFinderShow = false")
          .col
            span(:style=`{fontSize: '18px'}`).text-white.text-bold Выбрать связь
      template(v-slot:tint=`{item}`)
        div(
          @click="rightItemFound(item)"
          :style=`{position: 'absolute', zIndex: 1000,}`).row.fit
  //- editor wrapper
  div(
    :style=`{
      marginTop: '-20px',
      borderRadius: '0 0 10px 10px',
      background: 'rgb(35,35,35)',
    }`
    ).row.full-width
    //- composition.editor
    div(
      v-show="leftItemEditorShow"
      :style=`{
        paddingTop: '20px',
        borderRadius: '10px',
        zIndex: 10,
      }`
      ).row.full-width.bg-black
      composition-editor(
        :player="player" :composition="item"
        :contentKalpa="contentKalpa")
    div(
      :style=`{
        paddingTop: leftItemEditorShow ? '0px' : '20px',
      }`
      ).row.full-width.items-start.content-start.justify-center
      //- name top
      div(
        v-if="node.items[1]"
        :style=`{
          position: 'relative',
          marginTop: '-20px',
          paddingTop: '28px',
          paddingBottom: '8px',
          paddingLeft: '42px',
          paddingRight: '42px',
          borderRadius: '0 0 10px 10px'
        }`
        ).row.full-width.justify-center.q-px-sm.b-30
        span.text-grey-6 В чем суть?
        q-btn(
          @click="leftItemEditorShow = !leftItemEditorShow"
          round flat color="white" dense
          :icon="leftItemEditorShow ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
          :style=`{position: 'absolute', zIndex: 110, right: '4px', bottom: '0px',}`)
      //- name
      .row.full-width
        edit-name(
          :node="node"
          :placeholder="'В чем суть?'")
      //- add
      .row.full-width.q-mb-sm
        item-editor(
          v-if="node.items[1]"
          @item="rightItemUpdated"
          :item="node.items[1]")
        //- join toggle
        div(:style=`{paddingLeft: '42px', paddingRight: '42px',}`).row.full-width.items-start.content-start
          q-btn(
            @click="rightItemToggle()"
            flat no-caps
            :color="node.items[1] ? 'red' : 'green'"
            :style=`{
            }`).fit {{ node.items[1] ? 'Убрать связь' : 'Добавить связь' }}
      //- spheres & category
      div(:style=`{paddingLeft: '42px', paddingRight: '42px', paddingBottom: '16px',}`).row.full-width
        ws-sphere-editor(:item="node")
        .row.full-width
          edit-category(:node="node")
  //- footer: close, publish
  .row.full-width.justify-center
    div(:style=`{maxWidth: '620px',paddingLeft: '42px', paddingRight: '42px',}`).row.full-width.q-py-sm
      q-btn(
        @click="cancel()"
        flat color="grey-4" no-caps
        :style=`{background: 'rgb(35,35,35)',}`).q-mr-sm Закрыть
      q-btn(
        v-if="!pick"
        @click="publish()"
        color="green" no-caps
        :loading="publishing").col Опубликовать
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'

import compositionEditor from 'components/composition/composition_editor/index.vue'
import itemEditor from './item_editor.vue'

export default {
  name: 'pageNode',
  props: ['contentKalpa', 'node', 'player'],
  components: {
    itemEditor,
    compositionEditor,
    kalpaFinder: () => import('components/kalpa_finder/index.vue'),
    wsSphereEditor: () => import('components/ws_sphere_editor/index.vue'),
    editName: () => import('components/node_editor/view_publish/edit_name.vue'),
    editCategory: () => import('components/node_editor/view_publish/edit_category.vue')
  },
  data () {
    return {
      // contentFinderShow: false,
      leftItemEditorShow: true,
      rightItemFinderShow: false,
      // rightItem: null,
      // joining: false,
      publishing: false,
    }
  },
  computed: {
    item () {
      return this.node.items[0]
    },
  },
  methods: {
    rightItemUpdated (item) {
      this.$log('rightItemUpdated', item)
      this.$set(this.node.items, 1, item)
    },
    rightItemToggle () {
      this.$log('rightItemToggle')
      if (this.node.items[1]) {
        // close joining shit
        this.node.items = [this.node.items[0]]
      }
      else {
        // open content finder...
        this.player.pause()
        this.rightItemFinderShow = true
      }
    },
    contentKalpaFound (contentKalpa) {
      this.$log('contentKalpaFound', contentKalpa)
      this.rightItemFound(contentKalpa)
    },
    async rightItemFound (item) {
      this.$log('itemFound', item)
      this.rightItemFinderShow = false
      // from ws
      if (item.wsItemType) {
        // WS_BOOKMARK
        if (item.wsItemType === 'WS_BOOKMARK') {
          if (item.type === 'VIDEO') {
            // alert('ws_bookmark.VIDEO')
            item = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
            this.$set(this.node.items, 1, JSON.parse(JSON.stringify(item)))
            // this.node.items[1] = item
          }
          else if (item.type === 'IMAGE') {
            item = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
            this.node.items[1] = item
          }
          else if (item.type === 'NODE') {
            item = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
            this.node.items[1] = item
          }
        }
        // WS_NODE
        if (item.wsItemType === 'WS_NODE') {
          this.node.items[1] = item
        }
        // WS_JOINT?
        // WS_SPHERE?
      }
      // from kalpa, published
      else {
        if (item.type === 'VIDEO') {
          alert('VIDEO')
          this.node.items[1] = item
        }
        else if (item.type === 'IMAGE') {
          this.node.items[1] = item
        }
        else if (item.type === 'NODE') {
          // ?
        }
        else if (item.type === 'USER') {
          // ?
        }
        else if (['SPHERE', 'WORD', 'SENTENCE'].includes(item.type)) {
          // ?
        }
        else if (item.type === 'GIF') {
          alert('content.GIF')
          this.node.items[1] = item
        }
      }
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        await this.$wait(500)
        if (this.node.items.length > 0) {
          let nodeInput = JSON.parse(JSON.stringify(this.node))
          this.$log('nodeInput', nodeInput)
          let createdNode = await ObjectCreateApi.nodeCreate(nodeInput)
          this.$log('publish createdNode', createdNode)
          // this.$router.push(`/node/${createdNode.oid}`).catch(e => e)
        }
        // rightItem ? joint : node...
        // publish content... content&content
        // publish node... node&content
        // publish user... node
        // here we have node&[content,user,sphere,node]
        this.$log('publish done')
        this.publishing = false
      }
      catch (e) {
        this.$log('publish error', e)
        this.publishing = false
      }
    },
    cancel () {
      this.$log('cancel')
      this.$emit('close')
    }
  }
}
</script>
