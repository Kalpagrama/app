<style lang="sass" scoped>
.item
  cursor: pointer
  &:hover
    background: rgb(60,60,60)
</style>

<template lang="pug">
.row.full-width.items-start.content-start
  div(
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
    }`
    ).row.full-width.items-start.content-start.b-50
    //- unselected default header item
    div(
      v-if="!isSelected && !isEditing"
      @click="$emit('select')"
      :style=`{
        height: '50px',
        borderRadius: '10px', overflow: 'hidden',
      }`
      ).row.full-width.items-center.content-center.item.q-px-md
      span.text-white {{ node.name }}
    //- isSelected wrapper
    div(
      v-if="isSelected || isEditing"
      :style=`{
        borderRadius: '10px',
        paddingLeft: isEditing ? '40px' : '0px',
        paddingRight: isEditing ? '40px' : '0px',
      }`
      ).row.full-width
      //- isSelected & isEditing node.name editor...
      //- .row.full-width.q-px-md.q-py-xs
        span.text-white.text-bold В чем суть?
      div().row.full-width.q-py-sm
        composition-bar(:composition="item" :player="player")
      div(
        :style=`{
          position: 'relative', zIndex: 100,
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.full-width.b-50
        q-input(
          v-model="node.name"
          filled dark color="grey-6" type="textarea" autogrow
          placeholder="В чем суть?"
          @focus="$store.commit('ui/stateSet', ['isTyping', true])"
          @blur="$store.commit('ui/stateSet', ['isTyping', false])"
          :style=`{
          }`
          ).full-width
      div(
        v-if="isEditing"
        :style=`{}`
        ).row.full-width.q-pa-md
        span.text-white #sphere, #sphere, #sphere, #sphere
      //- isSelected footer
      div(
        v-if="isSelected && !isEditing"
        :style=`{
          marginTop: '-10px', paddingTop: '18px',
          borderRadius: '0 0 10px 10px', overflow: 'hidden',
        }`
        ).row.full-width.q-px-sm.q-pb-sm.bg-green
        q-btn(flat color="red" no-caps @click="$emit('delete')") Delete
        .col
        q-btn(flat color="white" no-caps @click="$emit('edit')") Edit
      //- isEditing composition editor
      div(
        v-if="isEditing"
        :style=`{order: -1}`
        ).row.full-width
        composition-editor(
          :player="player" :composition="item"
          :contentKalpa="contentKalpa")
  //- isEditing footer
  div(
    v-if="isEditing"
    :style=`{
    }`
    ).row.full-width.items-center.content-center.q-pa-sm
    q-btn(flat color="grey-4" no-caps @click="$emit('edited')") Close
    .col
    q-btn(color="green" no-caps) Create node
</template>

<script>
import compositionEditor from 'components/composition/composition_editor/index.vue'
import compositionBar from 'components/composition/composition_bar/index.vue'

export default {
  name: 'viewDrafts_draftItem',
  components: {compositionEditor, compositionBar},
  props: ['player', 'contentKalpa', 'contentWorkspace', 'node', 'isSelected', 'isEditing'],
  data () {
    return {
    }
  },
  computed: {
    items () {
      return this.node.items
    },
    item () {
      return this.items[0]
    }
  },
  methods: {
    barClickHandle (e) {
      this.$log('barClickHandle', e)
    }
  },
  mounted () {
    // this.$log('mounted')
    this.player.events.on('bar-click', this.barClickHandle)
  },
  beforeDestroy () {
    this.player.events.off('bar-click', this.barClickHandle)
  }
}
</script>
