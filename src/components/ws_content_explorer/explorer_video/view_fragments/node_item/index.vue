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
          q-btn(flat dense color="white" no-caps @click="$emit('unselect')" :style=`{zIndex: 2000}`).q-mr-md Close
          q-btn(flat dense color="white" no-caps icon="edit" @click="$emit('edit')" :style=`{zIndex: 2000}`).q-px-md
          q-btn(round outline dense color="white" no-caps icon="filter_tilt_shift" @click="nodeCreate()" :style=`{zIndex: 2000}`)
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
            autogrow type="textarea"
            placeholder="В чем суть?"
            ).full-width
        ws-sphere-editor(:item="node").q-py-sm
    //- footer: actions close, createNode
    div().row.full-width.q-pa-md
      q-btn(flat color="white" no-caps @click="$emit('edited')").b-40 Close
      .col
      q-btn(color="green" no-caps @click="nodeCreate()") Create node
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

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
    // TODO: find items of this content ???
    items () {
      return this.node.items
    },
    item () {
      return this.items[0]
    }
  },
  methods: {
    // barClickHandle (e) {
    //   this.$log('barClickHandle', e)
    // },
    async nodeCreate () {
      this.$log('nodeCreate')
      // make draft copy, create new draft, go to it
      // let nodeInput = JSON.parse(JSON.stringify(this.node))
      // nodeInput.stage = 'draft'
      // delete nodeInput.id
      // let node = await this.$rxdb.set(RxCollectionEnum.WS_NODE, nodeInput)
      // this.node.stage = 'draft'
      await this.node.updateExtended('stage', 'draft', false)
      // await this.node.updateExtended('oid', createdNode.oid, false)
      // this.$log('nodeCreate node', node)
      this.$router.push(`/workspace/node/${this.node.id}`).catch(e => e)
      // mutate fragment to draft
      // this.node.stage = 'draft'
      // this.$router.push(`/workspace/node/${this.node.id}`)
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
