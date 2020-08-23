<template lang="pug">
q-layout(view="hHh Lpr lff" container :style=`{height: $q.screen.height+'px'}`)
  //- item find
  //- q-dialog(v-model="itemFinderOpened" position="bottom")
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
  //- q-dialog(
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
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(
        :style=`{maxWidth: maxWidth+'px', height: '50px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.q-px-md.b-30
        .col
          span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold {{ title }}
        q-btn(round flat color="red-5" icon="delete_outline" @click="nodeDelete()")
  q-page-container
    q-page(:style=`{paddingBottom: '200px'}`)
      .row.full-width.justify-center
        div(:style=`{maxWidth: maxWidth+'px',}`).row.full-width
          //- edit-layout(:node="node")
          div(:style=`{borderRadius: '10px', overflow: 'hidden',}`).row.full-width.b-70.q-mb-sm
            //- component(
              :is="component[node.layout]"
              :node="node"
              @itemFind="itemFind"
              @itemEdit="itemEdit"
              @itemDelete="itemDelete")
              template(v-slot:next=`{next}`)
                q-btn(ref="nextBtn" round flat color="red" icon="add" @click="next()" :style=`{display: 'none'}`)
            edit-essence(:node="node")
          edit-category(:node="node")
          edit-spheres(:node="node")
      q-page-sticky(expand position="bottom" :style=`{zIndex: 1000}`)
        .row.full-width.justify-center.b-30
          div(:style=`{maxWidth: maxWidth+'px', height: '50px',}`).row.full-width.items-center.content-center.q-px-sm
            .col
            q-btn(
              @click="publish()"
              color="green" no-caps
              :loading="publishing"
              )
              span.text-white.text-bold {{ $t('ws_node_editor_publish', 'Опубликовать') }}
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
    node: {type: Object},
    title: {type: String},
  },
  data () {
    return {
      maxWidth: 600,
      publishing: false,
      item: null,
      itemFinderOpened: false,
      itemEditorOpened: false,
      component: {
        PIP: 'edit-items-pip',
        HORIZONTAL: 'edit-items-compare',
      }
    }
  },
  methods: {
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
      if (!confirm(this.$t('wsNodeEditor_deleteItemConfirm', 'Удалить элемент?'))) return
      this.$delete(this.node.items, index)
    },
    // node
    // TODO Эти проверки могут находится в UI коде - только если это валидация (но это вроде не валидация, поэтому надо перенести в NodeApi)
    check () {
      this.$log('check')
      if (!this.node.category) throw new Error('No node.category !')
      if (this.node.name.length === 0) throw new Error('No node.essence !')
      if (this.node.layout !== 'PIP') throw new Error('Only PIP layout for now !')
      if (this.node.items.length > 5) throw new Error('5 items maximum !')
      if (this.node.spheres.length > 5) throw new Error('5 spheres maximum !')
      // TODO: optimize for IMAGE content
      // check layers length
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
        this.$log('publish start')
        this.publishing = true
        this.check()
        this.checkExtend()
        // publish
        let createdNode = await NodeApi.nodeCreate(this.node)
        await this.node.updateExtended('stage', 'published', false)
        await this.node.updateExtended('oid', createdNode.oid, false)
        this.$log('publisg res', createdNode)
        this.publishing = false
        this.$q.notify({
          type: 'positive',
          position: 'top',
          message: this.$t('wsNodeEditor_nodeSendToPublication', 'Ядро отправлено на публикацию!')
        })
      }
      catch (e) {
        this.$log('publish error', e)
        this.publishing = false
        let errorMessage = e.message || e.toString()
        this.$q.notify({
          type: 'negative',
          position: 'top',
          message: errorMessage,
        })
      }
    },
    async nodeDelete () {
      this.$log('nodeDelete')
      if (!confirm(this.$t('wsNodeEditor_conifrmNodeDelete', 'Удалить ядро?'))) return
      await this.$rxdb.remove(this.node.id)
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
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
    // if (this.nodeIsEmpty()) {
    //   await this.$rxdb.remove(this.node.id)
    // }
  }
}
</script>
