<template lang="pug">
div(
  :style=`{
    position: 'relative',
  }`
  ).row.full-width
  //- itemFinder
  q-dialog(
    v-model="itemFinderShow"
    position="bottom" maximized)
    kalpa-finder(
      @contentKalpa="itemFound"
      :pages=`{
        nodes: {views: ['all']},
        workspace: {views: ['image', 'video', 'node', 'sphere', 'user']},
        kalpagrama: {views: ['all', 'users', 'nodes']},
        gif: {views: ['all']},
        web: {views: ['all', 'image', 'video',]}
      }`
      :style=`{
        //- maxWidth: $store.state.ui.pageWidth+'px',
        height: $q.screen.height+'px',
      }`).b-30
      template(v-slot:header)
        .row.full-width.justify-center
          div(
            :style=`{
              maxWidth: $store.state.ui.pageWidth+'px',
              height: '60px',
            }`
            ).row.full-width.items-center.content-center
            q-btn(round flat color="white" icon="keyboard_arrow_left" @click="itemFinderShow = false")
            .col
              span(:style=`{fontSize: '18px'}`).text-white.text-bold Выбрать связь
      template(v-slot:tint=`{item}`)
        div(
          @click="itemFound(item)"
          :style=`{position: 'absolute', zIndex: 1000,}`).row.fit.cursor-pointer
  //- joint name/vertices
  div(
    :style=`{
      position: 'absolute', zIndex: 5001, top: '-30px',
    }`
    ).row.full-width.justify-center.q-px-md
    div(
      :style=`{
        height: '60px',
        borderRadius: '10px',
        maxWidth: '500px',
      }`
      ).row.full-width.items-center.content-center.justify-center.b-30
      .row.full-width.justify-center
        span.text-white Причина
      .row.full-width.justify-center
        span.text-white Следствие
  //- footer
  div(
    v-if="!itemEditing"
    :style=`{
      position: 'absolute', zIndex: 1001, bottom: -65+'px',
      height: 65+'px',
    }`
    ).row.full-width.bg-black
    div(
      :style=`{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }`
      ).row.full-width.justify-center
      div(
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`).row.full-width
        .row.full-width.items-center.content-center.q-pa-sm
          q-btn(round flat color="white" icon="west" @click="cancel()")
          .col
            //- q-btn(
              @click="publish()"
              color="green" no-caps
              :loading="publishing"
              ).full-width
              span.text-white.text-bold Publish
          q-btn(
            v-if="joint.items[1]"
            @click="itemDelete(1)"
            round flat color="red" icon="clear")
          .col
          q-btn(
            @click="publish()"
            round flat color="green" icon="check"
            :loading="publishing")
  //- add placeholder
  div(
    v-if="!joint.items[1]"
    :style=`{
      paddingTop: '30px',
    }`
    ).row.fit.q-pa-md
    q-btn(
      @click="itemFinderShow = true"
      flat color="green" icon="add" size="lg"
      :style=`{
        marginTop: '8px',
        maxHeight: 'calc(100% - 16px)',
      }`
      ).fit.b-40
  //- item editor
  div(
    v-if="joint.items[1]"
    :style=`{
      //- position: 'absolute', zIndex: 100, top: '-34px',
    }`
    ).column.fit
    .col.full-width
      item-editor(
        @player="$emit('player', $event)"
        @add="itemFinderShow = true"
        @item="$event => itemChanged($event,1)"
        @editing="$event => itemEditingHandle($event,1)"
        :isActive="true"
        :item="joint.items[1]"
        :styles=`{
          height: '100%',
          objectFit: 'cover',
        }`
        :style=`{}`).fit
    div(
      v-if="joint.items[1].__typename === 'Composition' || joint.items[1].__typename === 'Video'"
      :style=`{
        height: '46px',
      }`
      ).row.full-width.justify-center
      //- q-btn(
        @click="itemDelete(1)"
        flat dense no-caps).text-red Delete item
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'

import kalpaFinder from 'components/kalpa_finder/index.vue'
import itemEditor from 'components/node_editor/item_editor.vue'

export default {
  name: 'jointCreator',
  props: ['item'],
  components: {
    kalpaFinder,
    itemEditor
  },
  created () {},
  data () {
    return {
      itemFinderShow: false,
      publishing: false,
      joint: {
        name: '',
        layout: 'HORIZONTAL',
        items: [],
        vertices: [],
        spheres: [],
        category: 'FUN',
      },
      itemEditing: null,
      editorsPaddingTop: 0
    }
  },
  methods: {
    itemEditingHandle (isEditing, ii) {
      this.$log('itemEditingHandle', isEditing, ii)
      if (isEditing) {
        this.itemEditing = ii
        if (this.joint.items.length === 1) {
          this.editorsPaddingTop = 120
        }
      }
      else {
        this.itemEditing = null
        this.editorsPaddingTop = 8
      }
    },
    itemDelete (itemii) {
      this.$log('itemDelete', itemii)
      // TODO: confirm this shit
      this.$delete(this.joint.items, itemii)
    },
    itemChanged (item, ii) {
      this.$log('itemChanged', item, ii)
      this.$set(this.joint.items, ii, item)
    },
    async itemFound (item) {
      this.$log('itemFound', item)
      this.itemFinderShow = false
      // from ws
      if (item.wsItemType) {
        // WS_BOOKMARK
        if (item.wsItemType === 'WS_BOOKMARK') {
          item = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
          // this.$set(this.node.items, 1, item)
        }
        // WS_NODE
        if (item.wsItemType === 'WS_NODE') {
          // this.node.items[1] = item
        }
      }
      // from kalpa, published
      else {
        if (item.type === 'GIF') {
          // item = ???
          // TODO: schedule getContentByUrl()
          // this.node.items[1] = item
          // this.$set(this.node.items, 1, item)
        }
        else {
          // this.node.items[1] = item
          // this.$set(this.node.items, 1, item)
        }
      }
      this.$set(this.joint.items, 1, item)
    },
    cancel () {
      this.$emit('cancel')
      // TODO: ask for save
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        await this.$wait(500)
        // let jointInput =
        this.$log('publish done')
        this.publishing = false
        let createdNode = null
        this.$emit('published', createdNode)
        this.cancel()
      }
      catch (e) {
        this.$log('publish error', e)
        this.publishing = false
      }
    },
  }
}
</script>
