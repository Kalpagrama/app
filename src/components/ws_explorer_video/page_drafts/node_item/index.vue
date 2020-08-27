<style lang="sass" scoped>
.item
  &:hover
    background: rgb(70,70,70)
</style>

<template lang="pug">
.row.full-width.items-start.content-start.q-mb-sm
  transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
    layer-points(:layer="item.layers[0]" :player="player")
  //- unselected: edit node.name?
  .row.full-width
    div(
      @click="isSelected || isEditing ? null : $emit('select')"
      :style=`{
        position: 'relative', zIndex: 100,
        cursor: 'pointer',
        borderRadius: '10px', overflow: 'hidden',
      }`).row.full-width.items-center.content-center.item.b-60
      div(
        v-if="!isSelected && !isEditing"
        :style=`{height: '40px'}`
        ).row.full-width.items-center.content-center.q-px-sm
        div(:style=`{overflow: 'hidden'}`).col.q-mr-sm
          span(:style=`{fontSize: '14px', whiteSpace: 'nowrap'}`).text-white {{ node.name }}
        small(:style=`{fontSize: '10px', marginTop: '3px'}`).text-grey-6 {{ $time(node.items[0].layers[0].figuresAbsolute[0].t) }}
      q-input(
        v-if="isSelected || isEditing"
        v-model="node.name"
        filled dark dense color="white" type="textarea" autogrow
        label="В чем суть?"
        :input-style=`{}`
        @focus="$store.commit('ui/stateSet', ['isTyping', true])"
        @blur="$store.commit('ui/stateSet', ['isTyping', false])"
        ).full-width
        template(v-slot:append)
          small(:style=`{fontSize: '10px'}`).text-grey-6 {{ $time(node.items[0].layers[0].figuresAbsolute[0].t) }}
  //- node spheres
  div(
    v-if="isEditing"
    ).row.full-width.q-pa-sm
    span.text-white #spheres, #spheres, #spheres...
  //- selected composition bar
  //- isSelected footer green
  div(
    v-if="isSelected"
    :style=`{
      position: 'relative',
      height: '60px', borderRadius: '0 0 10px 10px', overflow: 'hidden',
      marginTop: '-10px', paddingTop: '10px',
    }`
    ).row.full-width.items-center.content-center.justify-between.q-px-sm.bg-green
    q-btn(round flat dense no-caps color="red" icon="delete_outline" @click="$emit('delete')")
    q-btn(round flat dense color="white" icon="keyboard_arrow_up" @click="$emit('unselect')"
      :style=`{position: 'absolute', left: '50%', marginRight: '-50%', transform: 'translate(-50%, 0)',}`)
    q-btn(flat dense color="white" no-caps @click="$emit('edit')").q-px-sm
      span.text-white.text-bold.q-mt-xs Edit
  //- isEditing
  //- div(v-if="isEditing").row.full-width.items-start.content-start
    div(
      ).row.full-width.q-pa-sm.bg
    div().row.full-width.q-pa-sm
      q-btn(flat round color="red" no-caps icon="delete_outline" @click="$emit('delete')")
      .col
      q-btn(flat color="green" no-caps @click="$emit('edited')") Done
  //- selected items: items, layers
  //- div(v-if="false && isSelected" :style=`{marginTop: '-10px', paddinTop: '10px',}`).row.full-width
    //- item editor: one or many layers...
    div(
      v-for="(l,li) in item.layers" :key="li"
      :style=`{position: 'relative', borderRadius: '0 0 10px 10px',overflow: 'hidden'}`
      ).row.full-width.items-start.content-start
      layer-editor(
        :layer="l" :layerIndex="li" :player="player"
        @layerAdd="layerAdd(l,li)")
</template>

<script>
import layerEditor from './layer_editor/index.vue'
import layerPoints from './layer_points.vue'

export default {
  name: 'pageDrafts__nodeItem',
  components: {layerEditor, layerPoints},
  props: ['contentWorkspace', 'contentKalpa', 'player', 'node', 'isSelected', 'isEditing'],
  data () {
    return {
      itemIndex: 0,
    }
  },
  computed: {
    items () {
      return this.node.items.filter(i => i.contentOid === this.contentKalpa.oid)
    },
    item () {
      return this.node.items[this.itemIndex]
    },
  },
  watch: {
  },
  methods: {
    onClick () {
      this.$log('onClick')
      if (this.isSelected) {
        // do nothing?
      }
      else {
        this.$emit('select')
      }
    },
    layerAdd (layer, layerIndex) {
      this.$log('layerAdd', layer, layerIndex)
      // emit event that i want another layer at currentTime?
      // and make morph animation for understanding the context...
      let start = this.player.currentTime
      let end = start + 10 > this.player.duration ? this.player.duration : start + 10
      let layerInput = {contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}], spheres: []}
      this.$set(this.item.layers, this.item.layers.length, layerInput)
    },
    goToEditor () {
      this.$log('goToEditor')
      this.$router.push(`/workspace/node/${this.node.id}?from=wsContentExplorer`).catch(e => e)
    }
  },
}
</script>
