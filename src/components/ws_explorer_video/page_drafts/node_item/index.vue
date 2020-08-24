<style lang="sass" scoped>
.item
  &:hover
    background: rgb(60,60,60)
</style>

<template lang="pug">
.row.full-width.items-start.content-start.q-mb-sm
  //- unselected: edit node.name?
  .row.full-width
    div(
      @click="onClick"
      :style=`{
        position: 'relative', zIndex: 100,
        cursor: 'pointer',
        borderRadius: '10px', overflow: 'hidden',
      }`).row.full-width.items-center.content-center.item.b-50
      div(
        v-if="!isSelected"
        :style=`{height: '40px'}`
        ).row.full-width.items-center.content-center.q-px-sm
        small(:style=`{fontSize: '14px',marginLeft: '2px'}`).text-white.q-mr-sm {{ $time(node.items[0].layers[0].figuresAbsolute[0].t) }}
        span(:style=`{fontSize: '14px'}`).text-white {{ node.name }}
      q-input(
        v-if="isSelected"
        v-model="node.name"
        filled dark dense color="white"
        :input-style=`{}`
        @focus="$store.commit('ui/stateSet', ['isTyping', true])"
        @blur="$store.commit('ui/stateSet', ['isTyping', false])"
        ).full-width
        template(v-slot:prepend)
          small(:style=`{fontSize: '14px'}`).text-white {{ $time(node.items[0].layers[0].figuresAbsolute[0].t) }}
  //- selected items: items, layers
  div(v-if="isSelected" :style=`{marginTop: '-10px', paddinTop: '10px',}`).row.full-width
    //- item editor: one or many layers...
    div(
      v-for="(l,li) in item.layers" :key="li"
      :style=`{position: 'relative', borderRadius: '0 0 10px 10px',overflow: 'hidden'}`
      ).row.full-width.items-start.content-start
      layer-editor(
        :layer="l" :layerIndex="li" :player="player"
        @layerAdd="layerAdd(l,li)")
  //- selected footer green
  div(
    v-if="isSelected"
    :style=`{
      height: '60px', borderRadius: '0 0 10px 10px', overflow: 'hidden',
      marginTop: '-10px', paddingTop: '10px',
    }`
    ).row.full-width.items-center.content-center.justify-between.q-px-sm.bg-green
    q-btn(round flat dense no-caps color="red" icon="delete_outline" @click="$emit('remove')")
    q-btn(round flat dense color="white" icon="keyboard_arrow_up" @click="$emit('unselect')"
      :style=`{position: 'absolute', left: '50%', marginRight: '-50%', transform: 'translate(-50%, 0)',}`)
    q-btn(flat dense color="white" no-caps icon-right="launch" @click="goToEditor()")
      span.text-white.text-bold.q-mt-xs Editor
</template>

<script>
import layerEditor from './layer_editor/index.vue'

export default {
  name: 'pageDrafts__nodeItem',
  components: {layerEditor},
  props: ['contentWorkspace', 'contentKalpa', 'player', 'node', 'isSelected'],
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
