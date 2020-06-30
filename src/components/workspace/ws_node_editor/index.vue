<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: $q.screen.gt.xs ? '10px' : 'none',
    overflow: 'hidden',
  }`
  ).column.full-width.b-40
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.xs ? '0 0 10px 10px' : '10px',
      overflow: 'hidden'
    }`
    ).row.full-width.items-start.content-start.b-50.q-px-sm.q-mb-sm
    slot(name="header")
    //- navigation
    div(v-if="$slot ? !$slot.header : true").row.full-width.items-center.content-center.justify-between.q-py-md
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('close')").q-mr-sm
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Редактор ядра
      //- .col
      q-btn(
        @click="pageId === 'info' ? pageId = 'items' : pageId = 'info'"
        round icon="settings"
        :color="pageId === 'info' ? 'green' : 'white'"
        :flat="pageId !== 'info'")
    //- essence
    edit-essence(v-if="pageId !== 'info'" :node="node" :options="options")
    //- pages
    .row.full-width.justify-center
      div(:style=`{maxWidth: '600px'}`).row.full-width.q-pt-sm
        q-tabs(
          :value="pageId" @input="pageChanged($event)"
          dense no-caps color="white"
          align="justify"
          active-color="green"
          :style=`{}`
          ).full-width
          q-tab(
            v-for="(p,pi) in pages" :key="p.id"
            :name="p.id" :label="p.name"
            dense no-caps color="white"
            :style=`{color: 'rgb(180,180,180)'}`)
  //- body
  .col.full-width
    .row.fit.justify-center
      component(
        @close="$emit('close')"
        :is="`edit-${pageId}`"
        :stateNodeEditor="stateNodeEditor"
        :node="node"
        :options="options"
        :style=`{
          maxWidth: '600px',
        }`)
  //- footer
  div(:style=`{}`).row.full-width.justify-center
    div(:style=`{maxWidth: '600px'}`).row.full-width.q-py-sm
      q-btn(
        @click="pagePrev()"
        round flat color="white"
        icon="keyboard_arrow_left"
        :style=`{opacity: pageId === 'items' ? 0 : 1}`)
      .col
      q-btn(
        v-if="pageId !== 'preview'"
        @click="pageNext()"
        push color="green" no-caps
        ).q-px-md Next
      q-btn(
        v-if="pageId === 'preview'"
        @click="stateNodeEditor.nodePublish()"
        push color="green" no-caps
        :loading="stateNodeEditor.nodePublishing"
        ).q-px-md
        span.text-white.text-bold Publish
</template>

<script>
import { NodeApi } from 'src/api/node'

import editEssence from './edit_essence'
import editInfo from './edit_info'
import editItems from './edit_items'
import editSpheres from './edit_spheres'
import editPreview from './edit_preview'

export default {
  name: 'wsNodeEditor',
  components: {editInfo, editEssence, editItems, editSpheres, editPreview},
  // props: ['value', 'options'],
  props: {
    value: {type: Object},
    options: {
      type: Object,
      default () {
        return {
          essenceEditable: true,
          itemAdd: false,
        }
      }
    }
  },
  data () {
    return {
      pageId: 'items',
      pages: [
        {id: 'items', name: '1. Образы'},
        {id: 'spheres', name: '2. Сферы'},
        {id: 'preview', name: '3. Предосмотр'}
      ]
    }
  },
  computed: {
    node () {
      return this.value
    },
    stateNodeEditor () {
      return {
        pageId: this.pageId,
        pages: this.pages,
        nodePublish: this.nodePublish,
        set: (key, val) => {
          this[key] = val
        }
      }
    }
  },
  methods: {
    pagePrev () {
      this.$log('pagePrev')
      if (this.pageId === 'spheres') this.pageChanged('items')
      else if (this.pageId === 'preview') this.pageChanged('spheres')
    },
    pageNext () {
      this.$log('pageNext')
      if (this.pageId === 'items') this.pageChanged('spheres')
      else if (this.pageId === 'spheres') this.pageChanged('preview')
    },
    pageChanged (id) {
      this.$log('pageChanged', id)
      // check node.items for preview page
      if (id === 'preview') {
        if (this.node.items.length === 0) return
      }
      this.pageId = id
    },
    nodeCheck () {
      this.$log('nodeCheck')
      if (!this.node.category) throw new Error('No node.category !')
      if (this.node.layout !== 'PIP') throw new Error('Only PIP layout for now !')
      if (this.node.items.length > 3) throw new Error('3 compositions maximum !')
      if (this.node.spheres.length > 5) throw new Error('5 spheres maximum !')
      this.node.items.map((i, ii) => {
        if (i.layers.length === 0) throw new Error(`No layers in item: ${ii} !`)
        let layersDuration = i.layers.reduce((acc, layer) => {
          acc += (layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t)
          return acc
        }, 0)
        this.$log('layersDuration', layersDuration)
        if (layersDuration > 60) throw new Error('Too looong composition, 1 min maximum !')
        if (layersDuration === 0) throw new Error('Layers durtion === 0 !')
      })
      // throw new Error('Fuck you, very much !')
    },
    async nodePublish () {
      try {
        this.$log('nodePublish start')
        this.stateNodeEditor.set('nodePublishing', true)
        this.nodeCheck()
        // publish
        this.$q.loading.show({spinnerColor: 'green', message: 'Creating node...'})
        let createdNode = await NodeApi.nodeCreate(this.node)
        this.$log('nodePublish res', createdNode)
        // publish
        this.$q.loading.show({spinnerColor: 'green', message: 'Publishing node...'})
        await this.$wait(1000)
        this.node.stage = 'published'
        this.node.oid = createdNode.oid // нужно при снятии с публикации
        // done
        this.$q.loading.show({spinnerColor: 'green', message: 'Done !'})
        await this.$wait(2000)
        this.$q.loading.hide()
        this.stateNodeEditor.set('nodePublishing', false)
        this.$q.notify({
          type: 'positive',
          message: 'Node published!'
        })
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
        this.stateNodeEditor.set('nodePublishing', false)
      }
    },
    async nodeDelete () {
      this.$log('nodeDelete')
      if (!confirm('Delete node ?!')) return
      this.stateNodeEditor.set('nodeDeleting', true)
      await this.$wait(1000)
      await this.$rxdb.remove(this.node.id)
      this.stateNodeEditor.set('nodeDeleting', true)
      await this.$wait(200)
      this.$emit('close')
    }
  }
}
</script>
