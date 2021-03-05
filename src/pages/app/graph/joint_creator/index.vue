<template lang="pug">
div(
  :style=`{
    //- position: 'relative',
  }`
  ).row.full-width.items-start.content-start.justify-center.b-30
  div(
    :style=`{
      position: 'relative',
      maxWidth: maxWidth+'px',
      minHeight: 624+'px',
    }`
    ).row.full-width.items-start.content-start.b-30
    div(
      :style=`{
        position: 'absolute', zIndex: 100, top: '0px', left: '0px',
        pointerEvents: 'none',
        borderLeft: '1px dashed rgb(40,40,40)',
        borderBottom: '1px dashed rgb(40,40,40)',
        borderRight: '1px dashed rgb(40,40,40)',
        borderRadius: '0px 0px 10px 10px',
      }`
      ).row.fit
    vertex-editor(:joint="joint")
    //- item finder
    div(v-if="!joint.items[1]").row.full-width
      item-finder(
        :joint="joint"
        @item="itemFound")
    //- item found: viewer
    div(
      v-if="joint.items[1]"
      ).row.full-width
      joint-item(
        :item="joint.items[1]"
        :itemActive="true"
        :itemIndependent="true")
      .row.full-width.justify-center.q-py-md.q-px-xl
        .row.full-width.justify-center
          q-btn(
            @click="jointPublish"
            color="green" no-caps
            :loading="jointPublishing"
            :style=`{
              height: '60px',
              maxWidth: '300px',
            }`).full-width
            span.text-bold Добавить связь
        .row.full-width.justify-center.q-pt-sm
          q-btn(
            @click="itemDelete"
            outline color="red-6" no-caps
            :style=`{
              height: '40px',
              maxWidth: '300px',
            }`).full-width
            span.text-bold Изменть элемент
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ObjectCreateApi } from 'src/api/object_create'
import { ContentApi } from 'src/api/content'

import vertexEditor from './vertex_editor.vue'
import itemFinder from './item_finder.vue'
import jointItem from '../joints_row/joint_item.vue'

export default {
  name: 'jointCreator',
  props: ['item', 'maxWidth'],
  components: {
    vertexEditor,
    itemFinder,
    jointItem,
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
    }
  },
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
      // this.joint.items[1] = item
      this.$set(this.joint.items, 1, item)
    },
    itemDelete () {
      this.$log('itemDelete')
      this.$delete(this.joint.items, 1)
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
          let contentKalpa = await ContentApi.contentCreateFromUrl(jointInput.items[1].url)
          jointInput.items[1].oid = contentKalpa.oid
        }
        // create...
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
  },
  mounted () {
    this.$log('mounted')
    // this.joint.items[0] = this.item
  }
}
</script>
