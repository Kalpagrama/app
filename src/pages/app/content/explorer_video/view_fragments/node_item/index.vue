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
    //- node.name
    div(
      @click="$emit('select')"
      :style=`{
        position: 'relative', zIndex: 1000,
        height: '50px',
        borderRadius: '10px',
      }`
      ).row.full-width.items-center.content-center.item.b-50
      div(:style=`{overflow: 'hidden'}`).col.q-px-md
        span(:style=`{whiteSpace: 'nowrap'}`).text-white {{ node.name }}
      q-icon(
        v-if="['saved', 'published', 'draft'].includes(node.stage)"
        name="filter_tilt_shift" color="grey-6" size="20px").q-mx-md
      q-icon(
        v-else
        name="center_focus_strong" color="grey-6" size="20px").q-mx-md
    //- isSelected actions: close, edit, createNode
    div(:style=`{marginTop: '-10px', overflow: 'hidden',}`).row.full-width
      transition(appear enter-active-class="animated slideInDown")
        div(
          v-if="isSelected"
          :style=`{
            marginTop: '-10px', paddingTop: '22px',
            borderRadius: '0 0 10px 10px', overflow: 'hidden',
          }`
          ).row.full-width.items-start.content-start.q-pa-xs.bg-green
          div(
            v-if="node.stage === 'fragment'"
            ).row.fit.items-center.content-center
            .col
            q-btn(
              @click="$emit('edit')"
              flat dense color="white" no-caps icon="edit"
              :style=`{zIndex: 2000, marginRight: '6px'}`)
            //- q-btn(round dense color="white" no-caps icon="filter_tilt_shift" @click="nodeCreate()" :style=`{zIndex: 2000}`)
            q-btn(
              @click="$emit('unselect')"
              flat dense color="white" icon="keyboard_arrow_up"
              :style=`{zIndex: 2000, marginRight: '6px'}`)
          //- saved, published, draft
          div(
            v-if="['saved', 'published', 'draft'].includes(node.stage)"
            ).row.fit.items-center.content-center
            .col
            span.text-white {{node.stage}}
            q-btn(
              round flat dense color="white" icon="content_copy"
              :style=`{zIndex: 2000, marginRight: '6px'}`)
            q-btn(
              @click="$emit('unselect')"
              flat dense color="white" icon="keyboard_arrow_up"
              :style=`{zIndex: 2000, marginRight: '6px'}`)
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
      div(:style=`{paddingLeft: '40px', paddingRight: '40px',}`).row.full-width.q-pt-sm
        //- node.name editor
        div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden', zIndex: 100,}`).row.full-width
          q-input(
            v-model="node.name"
            filled dark dense color="grey-6"
            autogrow type="textarea"
            placeholder="В чем суть?"
            :input-style=`{
              minHeight: '60px',
            }`).full-width
        ws-sphere-editor(:item="node").q-py-sm
    //- footer: actions close, createNode
    div().row.full-width.q-pa-md
      q-btn(flat color="white" no-caps @click="$emit('edited')").b-40 Close
      .col
      q-btn(color="green" no-caps @click="nodeCreate()") Publish
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import compositionEditor from 'components/composition/composition_editor/index.vue'
import compositionBar from 'components/composition/composition_bar/index.vue'

export default {
  name: 'viewDrafts_draftItem',
  components: {compositionEditor, compositionBar},
  props: ['player', 'contentKalpa', 'node', 'isSelected', 'isEditing'],
  data () {
    return {
    }
  },
  computed: {
    item () {
      return this.node.items[0]
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
      // await this.node.updateExtended('stage', 'draft', false)
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
