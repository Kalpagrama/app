<template lang="pug">
.row.full-width.items-start.content-start.justify-center.b-30
  //- item finder
  q-dialog(
    @hide="$emit('blurred')"
    v-model="itemFinderShow"
    position="bottom"
    :maximized="true")
    kalpa-finder(
      :height="$q.screen.height"
      :pages=`{
        nodes: {views: ['all']},
        workspace: {views: ['node', 'media']},
        search: {views: ['default']},
        gif: {views: ['popular']},
      }`
      @item="itemFound"
      @close="itemFinderShow = false"
      ).b-30
  //- item editor
  q-dialog(
    @hide="$emit('blurred')"
    v-model="itemEditorShow"
    position="bottom"
    :maximized="true")
    item-editor(
      v-if="joint.items[1]"
      :joint="joint"
      :item="joint.items[1]"
      @remove="itemRemove"
      @close="itemEditorShow = false")
  //- body
  div(:style=`{paddingBottom: '300px',}`).row.full-width.justify-center.q-px-sm
    div(
      :style=`{
        position: 'relative',
        maxWidth: maxWidth+'px',
        background: 'rgb(33,33,33)',
        borderRadius: '0 0 10px 10px',
      }`
      ).row.full-width.items-start.content-start
      vertex-editor(:joint="joint")
      //- item finder start btn
      div(
        v-if="!joint.items[1]").row.full-width.q-px-sm.q-pb-sm
        q-btn(
          @click="itemFinderShow = true"
          flat color="white" no-caps icon="add" size="lg" stack
          :style=`{
            minHeight: '300px',
          }`
          ).full-width.b-40
          span(:style=`{fontSize: '18px'}`) {{$t('Pick element to join')}}
      //- item found: viewer
      div(
        v-if="joint.items[1]"
        :style=`{
          position: 'relative',
        }`
        ).row.full-width.q-px-sm.q-pb-sm
        item-preview(:item="joint.items[1]")
        //- item actions
        .row.full-width.justify-center.q-pt-md.q-pb-sm
          //- item remove
          q-btn(
            flat color="red" icon="delete_outline"
            :style=`{
              width: '50px',
              height: '50px',
            }`
            @click="itemRemove()")
          //- item publish
          .col.q-px-sm
            q-btn(
              @click="jointPublish"
              color="green" no-caps
              :loading="jointPublishing"
              :style=`{
                height: '50px',
              }`).full-width
              span.text-bold Опубликовать
          //- item edit
          q-btn(
            flat color="white" icon="edit"
            :style=`{
              width: '50px',
              height: '50px',
            }`
            @click="itemEditorShow = true")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'
import { ContentApi } from 'src/api/content'

import vertexEditor from './vertex_editor.vue'
// import jointItem from '../joints_row/joint_item.vue'
import itemEditor from './item_editor/index.vue'
import itemPreview from './item_preview/index.vue'

export default {
  name: 'jointCreator',
  props: ['item', 'maxWidth'],
  components: {
    vertexEditor,
    // jointItem,
    // contentFragmenter,
    itemEditor,
    itemPreview,
  },
  data () {
    return {
      joint: {
        name: '',
        layout: 'HORIZONTAL',
        items: [],
        vertices: ['ASSOCIATIVE', 'ASSOCIATIVE'],
        spheres: [],
        category: 'FUN',
      },
      jointPublishing: false,
      itemFinderShow: false,
      // contentFragmenterShow: false,
      itemEditorShow: false,
    }
  },
  watch: {
    itemFinderShow: {
      handler (to, from) {
        if (to) {
          this.$emit('focused')
        }
        else {
          this.$emit('blurred')
        }
      }
    }
  },
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
      this.$set(this.joint.items, 1, item)
      this.itemFinderShow = false
      // if content type is video or book
      if (['VIDEO', 'BOOK'].includes(item.type)) {
        this.itemEditorShow = true
      }
    },
    itemRemove () {
      this.$log('itemRemove')
      this.$delete(this.joint.items, 1)
      this.itemEditorShow = false
    },
    async jointPublish () {
      try {
        this.$log('jointPublish start')
        this.jointPublishing = true
        await this.$wait(1000)
        let jointInput = JSON.parse(JSON.stringify(this.joint))
        jointInput.items[0] = this.item
        if (jointInput.items.length === 2) {
          if (jointInput.name.length === 0) {
            if (jointInput.vertices.length === 0) {
              jointInput.vertices = ['ASSOCIATIVE', 'ASSOCIATIVE']
            }
          }
          else {
            jointInput.vertices = ['ESSENCE', 'ESSENCE']
          }
        }
        // handle GIF
        if (jointInput.items[1].type === 'GIF' && !jointInput.items[1].oid) {
          this.$log('jointPublish GIF processing...')
          let contentKalpa = await ContentApi.contentCreateFromUrl(jointInput.items[1].url)
          this.$log('jointPublish contentKalpa', contentKalpa)
          jointInput.items[1].oid = contentKalpa.oid
        }
        // create...
        this.$log('jointInput', jointInput)
        let jointCreated = await ObjectCreateApi.essenceCreate(jointInput)
        this.$log('jointPublish jointCreated', jointCreated)
        // done? emit? close?
        this.$log('jointPublish done')
        this.jointPublishing = false
        this.$emit('created', jointCreated)
      }
      catch (e) {
        this.$log('jointPublish error', e)
        this.jointPublishing = false
      }
    },
  }
}
</script>
