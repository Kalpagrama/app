<style lang="sass" scoped>
.item
  cursor: pointer
  &:hover
    background: rgb(60,60,60)
</style>

<template lang="pug">
.row.full-width.items-start.content-start.q-py-xs
  //- default and isSelected wrapper
  div(
    v-if="!isEditing"
    :style=`{position: 'relative', borderRadius: '10px',}`
    ).row.full-width
    //- composition bar
    transition(appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut")
      composition-bar(
        v-if="isSelected"
        :composition="item" :player="player"
        :style=`{
          position: 'absolute', zIndex: 2000,
          top: '0px', left: '0px', right: '0px',
          maxHeight: '50px',
        }`)
    //- node.name preview, cut it?
    div(
      @click="$emit('select')"
      :style=`{
        position: 'relative', zIndex: 1000,
        height: '50px',
        borderRadius: '10px',
      }`
      ).row.full-width.items-center.content-center.item.q-px-md.b-50
      span.text-white {{ node.name }}
    //- isSelected actions: close, edit, createNode
    div(:style=`{marginTop: '-10px', overflow: 'hidden',}`).row.full-width
      transition(appear enter-active-class="animated slideInDown")
        div(
          v-if="isSelected"
          :style=`{
            marginTop: '-10px', paddingTop: '22px',
            borderRadius: '0 0 10px 10px',
          }`
          ).row.full-width.items-center.content-center.q-pa-xs.bg-green
          .col
          q-btn(flat dense color="white" no-caps @click="$emit('unselect')" :style=`{zIndex: 2000}`) Close
          q-btn(flat dense color="white" no-caps @click="$emit('edit')" :style=`{zIndex: 2000}`).q-px-sm.q-mr-md Edit
          q-btn(outline dense color="white" no-caps @click="nodeCreate()" :style=`{zIndex: 2000}`).q-px-md Create node
  //- isEditing wrapper
  div(
    v-if="isEditing"
    :style=`{position: 'relative'}`
    ).row.full-width.items-start.content-start
    //- editor wrapper
    div(
      :style=`{
        borderRadius: '0 0 10px 10px',
        }`
      ).row.full-width.items-start.content-start.q-pb-md.b-50
      //- composition.editor
      div().row.full-width
        composition-editor(
          :player="player" :composition="item"
          :contentKalpa="contentKalpa")
      //- node.name/node.sphers editors wrapper
      div(:style=`{paddingLeft: '40px', paddingRight: '40px',}`).row.full-width
        //- node.name editor
        div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden', zIndex: 100,}`).row.full-width
          q-input(
            v-model="node.name"
            filled dark dense color="grey-6"
            type="textarea" autogrow
            @focus="$store.commit('ui/stateSet', ['isTyping', true])"
            @blur="$store.commit('ui/stateSet', ['isTyping', false])").full-width
        //- node.spheres editor
        div().row.full-width.items-center.q-pa-sm
          //- span.text-white #sphere, #sphere, #sphere
          q-btn(round flat dense color="grey-6" icon="add")
    //- footer: actions close, createNode
    div().row.full-width.q-pa-md
      q-btn(flat color="white" no-caps @click="$emit('edited')").b-40 Close
      .col
      q-btn(color="green" no-caps @click="nodeCreate()") Create node
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
    },
    nodeCreate () {
      this.$log('nodeCreate')
      this.$router.push(`/workspace/node/${this.node.id}`)
    }
  },
  mounted () {
    // this.$log('mounted')
    // this.player.events.on('bar-click', this.barClickHandle)
  },
  beforeDestroy () {
    // this.player.events.off('bar-click', this.barClickHandle)
  }
}
</script>
