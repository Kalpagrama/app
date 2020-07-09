<template lang="pug">
div(
  :style=`{
    position: 'relative', zIndex: 99999,
    borderRadius: $q.screen.gt.xs ? '10px' : 'none',
    overflow: 'hidden',
  }`
  ).column.full-width.b-50
  //- item find
  q-dialog(v-model="itemFinderOpened" position="bottom")
    item-finder(
      @content="contentFound"
      @composition="compositionFound"
      @close="itemFinderOpened = false"
      :style=`{
        height: $q.screen.height-0+'px',
        minHeight: $q.screen.height-0+'px',
        maxWidth: $store.state.ui.maxWidthPage+'px',
      }`)
  //- item edit
  q-dialog(
    v-model="itemEditorOpened" position="bottom"
    @hide="itemEdited")
    ws-composition-editor(
      v-if="item"
      :value="item"
      @close="itemEditorOpened = false"
      @delete="itemDelete(node.items.findIndex(i => i.id === item.id))"
      :options=`{
        ctx: 'nodeEditor',
        mode: 'editor',
        mini: false,
        active: true,
      }`
      :style=`{
        height: $q.screen.height+'px',
        minHeight: $q.screen.height+'px',
        maxWidth: $store.state.ui.maxWidthPage+'px'
      }`)
  .col.full-width.scroll
    //- header
    div(
      v-if="!$slots.header"
      :style=`{
        borderRadius: $q.screen.xs ? '0 0 10px 10px' : '10px',
        overflow: 'hidden'
      }`
      ).row.full-width.items-start.content-start.b-50.q-px-md.q-mb-sm
      //- navigation
      div(v-if="true").row.full-width.items-center.content-center.justify-between.q-py-md
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')")
        span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('wsNodeEditor_title', 'Редактор ядра')}}
        q-btn(round flat color="red-5" icon="delete_outline" @click="nodeDelete()")
    slot(name="header")
    .row.full-width.justify-center
      div(
        :style=`{maxWidth: '600px'}`).row.full-width.items-start.content-start.q-px-sm
        //- node wrapper
        //- TODO: add after compare done...
        //- edit-layout(:node="node")
        div(:style=`{borderRadius: '10px', overflow: 'hidden',}`).row.full-width.b-70.q-mb-sm
          component(
            :is="component[node.layout]"
            :node="node"
            @itemFind="itemFind"
            @itemEdit="itemEdit"
            @itemDelete="itemDelete")
            template(v-slot:next=`{next}`)
              q-btn(ref="nextBtn" round flat color="red" icon="add" @click="next()" :style=`{display: 'none'}`)
          edit-essence(:node="node")
        edit-category(:node="node")
        edit-spheres(:node="node" :sphereFirstEditable="options.ctx === 'workspace'")
  //- publish
  .row.full-width.justify-center
    div(:style=`{maxWidth: '600px'}`).row.full-width.q-pa-sm
      q-btn(
        @click="publish"
        push color="green" no-caps
        :loading="publishing"
        :style=`{height: '50px',}`
        ).full-width
        span.text-white.text-bold {{$t('ws_node_editor_publish', 'Опубликовать')}}
</template>

<script>
import { NodeApi } from 'src/api/node'

import editLayout from './edit_layout'
import editCategory from './edit_category'
import editSpheres from './edit_spheres'
import editEssence from './edit_essence'
import editItemsPip from './edit_items_pip'
import editItemsCompare from './edit_items_compare'
import itemFinder from './item_finder'

export default {
  name: 'wsNodeEditor',
  components: {editLayout, editCategory, editSpheres, editEssence, editItemsPip, editItemsCompare, itemFinder},
  props: {
    sid: {type: String, default () { return 'wsNodeEditor' }},
    value: {type: Object},
    options: {
      type: Object,
      default () {
        return {
          ctx: 'workspace',
        }
      }
    }
  },
  data () {
    return {
      publishing: false,
      deleting: false,
      item: null,
      itemFinderOpened: false,
      itemEditorOpened: false,
      component: {
        PIP: 'edit-items-pip',
        HORIZONTAL: 'edit-items-compare',
      }
    }
  },
  provide () {
    return {
      sidNodeEditor: this.sid
    }
  },
  computed: {
    node () {
      return this.value
    },
  },
  methods: {
    // get item
    itemFind () {
      this.$log('itemFind')
      this.itemFinderOpened = true
    },
    compositionFound (composition) {
      this.$log('compositionFound', composition)
      let itemIndex = this.node.items.length
      this.$set(this.node.items, itemIndex, composition)
      if (this.node.items.length > 1) this.$refs.nextBtn.click()
      // set node name from the composition.name
      if (this.node.name.length === 0) {
        this.node.name = composition.name
      }
    },
    async contentFound (content) {
      this.$log('contentFound', content)
      this.compositionFound(content)
      await this.$wait(1000)
      this.itemEdit(this.node.items[this.node.items.length - 1])
    },
    // edit item
    itemEdit (item) {
      this.$log('itemEdit', item)
      this.item = item
      this.itemEditorOpened = true
    },
    itemEdited () {
      this.$log('itemEdited', this.item)
      if (this.node.name.length === 0) {
        if (this.item.name.length > 0) {
          this.node.name = this.item.name
        }
      }
    },
    itemDelete (index) {
      this.$log('itemDelete', index)
      if (!confirm(this.$t('delete_item', 'Удалить элемент?'))) return
      this.$delete(this.node.items, index)
    },
    // node
    // TODO Эти проверки могут находится в UI коде - только если это валидация (но это вроде не валидация, поэтому надо перенести в NodeApi)
    check () {
      this.$log('check')
      if (!this.node.category) throw new Error('No node.category !')
      // if (this.node.name.length === 0) throw new Error('No node.essence !')
      if (this.node.layout !== 'PIP') throw new Error('Only PIP layout for now !')
      if (this.node.items.length > 5) throw new Error('5 items maximum !')
      if (this.node.spheres.length > 5) throw new Error('5 spheres maximum !')
      // PPV закомментил из-за картинок
      // this.node.items.map((i, ii) => {
      //   if (i.layers.length === 0) throw new Error(`No layers in item: ${ii} !`)
      //   let layersDuration = i.layers.reduce((acc, layer) => {
      //     acc += (layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t)
      //     return acc
      //   }, 0)
      //   this.$log('layersDuration', layersDuration)
      //   if (layersDuration > 60) throw new Error('Too looong composition, 1 min maximum !')
      //   if (layersDuration === 0) throw new Error('Layers durtion === 0 !')
      // })
    },
    checkExtend () {
      this.$log('checkExtend')
      if (this.node.name.length === 0) {
        if (this.node.spheres[0]) {
          this.node.name = this.node.spheres[0].name
        }
        else {
          throw new Error('Essence or one sphere!')
        }
      }
    },
    async publish () {
      try {
        this.$log('nodePublish start')
        // this.storeNodeEditor.set('publishing', true)
        this.publishing = true
        this.check()
        this.checkExtend()
        // publish
        this.$q.loading.show({spinnerColor: 'green', message: 'Creating node...'})
        let createdNode = await NodeApi.nodeCreate(this.node)
        this.$log('nodePublish res', createdNode)
        // publish
        // this.$q.loading.show({spinnerColor: 'green', message: this.$t('node_publishing', 'Публикуем ядро...')})
        // await this.$wait(1000)
        await this.node.updateExtended('stage', 'published', false)// без debounce
        await this.node.updateExtended('oid', createdNode.oid, false)// без debounce // oid нужно при снятии с публикации
        // done
        // this.$q.loading.show({spinnerColor: 'green', message: this.$t('done', 'Готово!')})
        await this.$wait(1000)
        this.$q.loading.hide()
        // this.storeNodeEditor.set('publishing', false)
        this.publishing = false
        // this.$q.notify({
        //   type: 'positive',
        //   message: this.$t('node_published', 'Ядро опубликовано!')
        // })
        this.$emit('published', createdNode.oid)
        this.$emit('close')
      }
      catch (e) {
        this.$log('nodePublish error', e)
        this.$q.loading.hide()
        let errorMessage = e.message || e.toString()
        this.$q.notify({
          type: 'negative',
          message: errorMessage,
        })
        // this.storeNodeEditor.set('publishing', false)
        this.publishing = false
      }
    },
    async nodeDelete () {
      this.$log('nodeDelete')
      if (!confirm('Delete node ?!')) return
      this.storeNodeEditor.set('deleting', true)
      await this.$wait(1000)
      await this.$rxdb.remove(this.node.id)
      this.storeNodeEditor.set('deleting', true)
      await this.$wait(200)
      this.$emit('close')
    },
    nodeIsEmpty () {
      this.$log('nodeIsEmpty')
      if (this.node.name.length === 0 &&
        this.node.spheres.length === 0 &&
        this.node.items.length === 0) {
        return true
      }
      else {
        return false
      }
    }
  },
  created () {
    this.$log('created', this.sid)
    window.stores[this.sid] = this
  },
  async beforeDestroy () {
    this.$log('beforeDestroy')
    if (this.nodeIsEmpty()) {
      await this.$rxdb.remove(this.node.id)
    }
    if (!module.hot) delete window.stores[this.sid]
  }
}
</script>
