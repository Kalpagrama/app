<template lang="pug">
div(
  :style=`{
    height: $q.screen.height+'px',
  }`
  ).row.full-width.items-start.content-start.justify-center.b-30
  //- item finder
  q-dialog(
    v-model="itemFinderShow"
    position="bottom"
    :maximized="true")
    kalpa-finder(
      :height="$q.screen.height"
      @item="onItemFound"
      @close="itemFinderShow = false"
      ).b-30
  //- item editor
  q-dialog(
    v-model="itemEditorShow"
    position="bottom"
    :maximized="true"
    :no-esc-dismiss="true")
    item-editor(
      v-if="itemFound"
      :item="itemFound"
      @composition="$log('composition=', $event), ($event ? $set_deprecated(joint.items, 1, $event) : $delete(joint.items, 1)), itemEditorShow = false"
      @close="itemEditorShow = false")
  //- body
  .row.full-width.justify-center.q-px-sm
    div(
      :style=`{
        position: 'relative',
        maxWidth: maxWidth+'px',
        background: 'rgb(33,33,33)',
        borderRadius: '0 0 10px 10px',
      }`
      ).row.full-width.items-start.content-start
      vertex-editor(:joint="joint")
      //- item ADD btn, opend itemFinder
      div(
        v-if="!joint.items[1]").row.full-width.q-px-sm.q-pb-sm
        q-btn(
          @click="itemFinderShow = true"
          flat color="white" no-caps icon="add" size="lg" stack
          :style=`{
            minHeight: '300px',
          }`
          ).full-width.b-40
          // span(:style=`{fontSize: '18px'}`) {{$t('Pick element for join')}}
      //- item PREVIEW
      div(
        v-if="joint.items[1]"
        :style=`{
          position: 'relative',
        }`
        ).row.full-width.q-px-sm.q-pb-sm
        item-preview(
          :item="joint.items[1]"
          :isActive="!isFocused"
          :show-actions="false")
        //- Actions
        .row.full-width.justify-center.q-pt-md.q-pb-sm
          //- Remove
          q-btn(
            flat color="red" icon="delete_outline"
            :style=`{
              width: '50px',
              height: '50px',
            }`
            @click="itemRemove()")
          //- Publish
          .col.q-px-sm
            q-btn(
              @click="jointPublish"
              color="green" no-caps
              :loading="jointPublishing"
              :style=`{
                height: '50px',
              }`).full-width
              span.text-bold {{$t('Publish')}}
          //- Edit
          q-btn(
            flat color="white" icon="edit"
            :disable="editDisabled"
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

import vertexEditor from 'src/components/kalpa_item/item_editor/composer_joint/vertex_editor.vue'
import itemPreview from 'src/components/kalpa_item/item_preview/index.vue'

export default {
  name: 'jointCreator',
  props: ['item', 'maxWidth'],
  components: {
    vertexEditor,
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
        // category: 'FUN',
      },
      jointPublishing: false,
      itemFinderShow: false,
      itemEditorShow: false,
      itemFound: null,
    }
  },
  computed: {
    isFocused () {
      return this.itemFinderShow || this.itemEditorShow
    },
    editDisabled () {
      if (this.joint.items[1]) {
        return this.joint.items[1].type === 'NODE'
      }
      else {
        return true
      }
    }
  },
  watch: {
    isFocused: {
      handler (to, from) {
        this.$log('isFocused WATСHER', to, from)
        if (to) {
          this.$emit('focused')
        }
        else {
          this.$emit('blurred')
        }
      }
    },
    'join.items': {
      handler(to, from) {
        this.$log('join.items', to)
      }
    }
  },
  methods: {
    async onItemFound (item) {
      this.$log('onItemFound', item)
      this.itemFinderShow = false
      // if content type is video or book
      if (['VIDEO', 'BOOK'].includes(item.type)) {
        this.itemFound = item
        this.itemEditorShow = true
      } else {
        this.$set_deprecated(this.joint.items, 1, item)
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
        // await this.$wait(1000)
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
          // throw new Error('sdfsdfsdf')
          // eslint-disable-next-line no-unreachable
          jointInput.items[1].oid = contentKalpa.oid
        }
        // create...
        this.$log('jointInput', jointInput)
        let jointCreated = await ObjectCreateApi.jointCreate(jointInput)
        this.$log('jointPublish jointCreated', jointCreated)
        this.$ym('JOINT_CREATED')
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
  },
  mounted () {
    this.$log('mounted')
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
  }
}
</script>
