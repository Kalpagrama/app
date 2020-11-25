<template lang="pug">
.row.full-width
  div(
    :style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start.b-30
    //- NODE
    div(
      v-if="item.type === 'NODE'"
      ).row.full-width
      img(
        :src="item.thumbUrl"
        :style=`{
          borderRadius: '10px',
        }`
        ).full-width
    //- content
    //- GIF
    div(
      v-if="item.type === 'GIF'"
      ).row.full-width.items-start.content-start
      img(
        :src="item.url"
        :style=`{
          borderRadius: '10px',
        }`
        ).full-width
    //- CONTENT
    div(
      v-if="contentKalpa && (item.type === 'VIDEO' || item.outputType === 'VIDEO')"
      :style=`{borderRadius: '10px',}`
      ).row.full-width.items-start.content-start.bg-black
      content-player(
        :contentKalpa="contentKalpa"
        @player="player = $event"
        @error="playerError = $event"
        :style=`{
          borderRadius: '10px',
        }`).fit
        template(
          v-if="!item.outputType"
          v-slot:bar-current-time=`{panning}`)
          transition(enter-active-class="animated fadeIn" leave-active-class="none")
            q-btn(
              v-if="player && !panning"
              @click="nodeCreateStart()"
              round color="green" icon="add" dense
              :style=`{
                position: 'absolute', zIndex: 1000, top: '-44px', borderRadius: '50%',
                left: 'calc('+(player.currentTime/player.duration)*100+'% - 17px)',
              }`)
      composition-editor(
        v-if="item.outputType === 'VIDEO' && editing"
        :player="player" :composition="item"
        :contentKalpa="contentKalpa")
    //- USER
    //- SPHERE,WORD,SENTENCE
    //- footer
    //- NAME for everyone
    div(
      :style=`{
        position: 'relative',
        zIndex: 100,
      }`
      ).row.full-width.justify-center.q-pa-sm.b-30
      span.text-grey-6 В чем суть?
      q-btn(
        @click="editing = !editing"
        round flat color="white" dense
        :icon="editing ? 'keyboard_arrow_up' : 'keyboard_arrow_down'"
        :style=`{position: 'absolute', zIndex: 110, right: '4px', bottom: '0px',}`)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import contentPlayer from 'components/content_player/index.vue'
import compositionEditor from 'components/composition/composition_editor/index.vue'

export default {
  name: 'pageNode_itemEditor',
  props: ['item'],
  components: {
    contentPlayer,
    compositionEditor
  },
  data () {
    return {
      editing: false,
      player: null,
      playerError: null,
      contentKalpa: null,
    }
  },
  watch: {
    item: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('item TO', to)
        if (to) {
          if (to.outputType === 'VIDEO') {
            this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, to.layers[0].contentOid)
          }
          if (to.oid && to.type === 'VIDEO') {
            this.contentKalpa = to
          }
        }
      }
    }
  },
  methods: {
    nodeCreateStart () {
      this.$log('nodeCreateStart')
      let start = this.player.currentTime
      let end = start + 30 > this.player.duration ? this.player.duration : start + 30
      let composition = {
        id: Date.now().toString(),
        thumbUrl: this.item.thumbUrl,
        outputType: 'VIDEO',
        layers: [
          {id: Date.now().toString(), contentOid: this.item.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}]},
        ],
        operation: { items: null, operations: null, type: 'CONCAT'},
      }
      // this.$set(this, 'item', composition)
      this.$emit('item', composition)
      this.editing = true
    },
    editingToggle () {
      if (this.editing) {
        this.editing = false
      }
      else {
        if (!this.item.wsItemType && this.item.oid && this.item.type === 'VIDEO') {
          this.nodeCreateStart()
          // create item composition ??? where ???
          // for video only ?
          // show PLUS?
        }
        // this.editing = true
      }
    }
  },
  mounted () {
    this.$log('mounted')
  }
}
</script>
