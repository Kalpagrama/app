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
          :style=`{position: 'absolute', zIndex: 1000,}`).row.fit.br
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
        v-if="rightItem"
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
          :placeholder="rightItem ? 'В чем связь?' : 'В чем суть?'")
      //- add
      .row.full-width.q-mb-sm
        item-editor(
          v-if="rightItem"
          :item="rightItem")
        //- join toggle
        div(:style=`{paddingLeft: '42px', paddingRight: '42px',}`).row.full-width.items-start.content-start
          q-btn(
            @click="rightItemToggle()"
            flat no-caps
            :color="rightItem ? 'red' : 'green'"
            :style=`{
            }`).fit {{ rightItem ? 'Убрать связь' : 'Добавить связь' }}
      //- spheres & category
      div(:style=`{paddingLeft: '42px', paddingRight: '42px', paddingBottom: '16px',}`).row.full-width
        ws-sphere-editor(:item="node")
        .row.full-width
          edit-category(:node="node")
  //- footer: close, publish
  .row.full-width.justify-center
    div(:style=`{maxWidth: '620px',paddingLeft: '42px', paddingRight: '42px',}`).row.full-width.q-py-sm
      q-btn(
        @click="$emit('close')"
        flat color="grey-4" no-caps
        :style=`{background: 'rgb(35,35,35)',}`).q-mr-sm Закрыть
      q-btn(
        v-if="!pick"
        @click="publish()"
        color="green" no-caps
        :loading="publishing").col Опубликовать
</template>

<script>
import compositionEditor from 'components/composition/composition_editor/index.vue'
import itemEditor from './item_editor.vue'

export default {
  name: 'pageNode',
  props: ['contentKalpa', 'node', 'player'],
  components: {
    itemEditor,
    compositionEditor,
    editName: () => import('components/node_editor/view_publish/edit_name.vue'),
    editCategory: () => import('components/node_editor/view_publish/edit_category.vue')
  },
  data () {
    return {
      // contentFinderShow: false,
      leftItemEditorShow: true,
      rightItemFinderShow: false,
      rightItem: null,
      joining: false,
    }
  },
  computed: {
    item () {
      return this.node.items[0]
    },
  },
  methods: {
    rightItemToggle () {
      this.$log('rightItemToggle')
      if (this.rightItem) {
        // close joining shit
        this.rightItem = null
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
    rightItemFound (item) {
      this.$log('itemFound', item)
      this.rightItemFinderShow = false
      // from ws
      if (item.wsItemType) {
        if (item.wsItemType === 'WS_BOOKMARK') {
          if (item.type === 'VIDEO') {
            alert('ws_bookmark.video')
            // this.rightItem
            // create node...
          }
          else if (item.type === 'IMAGE') {
            alert('ws_bookmark.image')
            // create node...
          }
        }
        if (item.wsItemType === 'WS_NODE') {
          alert('ws_node')
        }
      }
      // from kalpa, published
      else {
        if (item.type === 'VIDEO') {
          this.rightItem = item
        }
        else if (item.type === 'IMAGE') {
        }
        else if (item.type === 'GIF') {
        }
      }
    },
    publish () {
      console.log('publish')
    }
  }
}
</script>
