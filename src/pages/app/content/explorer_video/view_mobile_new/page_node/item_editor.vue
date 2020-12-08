<template lang="pug">
.row.full-width.items-start.content-start
  //- SPHERE
  //- USER
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
  div(
    v-if="item.type === 'IMAGE' || item.outputType === 'IMAGE'"
    :style=`{
      position: 'relative',
      ...styles,
    }`
    ).row.full-width.items-start.content-start
    img(
      :src="item.url"
      :style=`{
        borderRadius: '10px',
        objectFit: 'cover',
      }`
      ).fit
  //- CONTENT(VIDEO,IMAGE,AUDIO,BOOK) => COMPOSITION
  div(
    v-if="contentKalpa && (item.type === 'VIDEO' || item.outputType === 'VIDEO')"
    :style=`{
      position: 'relative',
      ...styles,
    }`
    ).row.full-width.items-start.content-start.br
    content-player(
      :contentKalpa="contentKalpa"
      @player="player = $event"
      @error="playerError = $event"
      :style=`{
        //- borderRadius: '10px',
        zIndex: 200,
      }`).fit.bg-black
    q-btn(
      v-if="!item.outputType"
      @click="nodeCreateStart()"
      round flat dense
      color="green"
      icon="crop"
      :style=`{
        position: 'absolute', zIndex: 2000, right: '8px', bottom: '1px'
      }`)
    q-btn(
      v-if="item.outputType"
      @click="editing = !editing"
      round flat dense
      :color="editing ? 'green' : 'white'"
      :icon="editing ? 'check' : 'edit'"
      :style=`{
        position: 'absolute', zIndex: 2000, right: '8px', bottom: '1px'
      }`)
    div(
      v-if="item.outputType === 'VIDEO'"
      :style=`{
        position: 'absolute', zIndex: 200, bottom: '0px',
      }`).row.full-width
      div(:style=`{position: 'absolute', zIndex: 200, top: '-8px',}`).row.full-width
        composition-editor(
          v-if="editing"
          :player="player" :composition="item"
          :contentKalpa="contentKalpa"
          :style=`{
            zIndex: 2000,
            borderRadius: '0 0 10px 10px',
          }`).br
        .row.full-width
          slot(name="footer")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import contentPlayer from 'components/content_player/index.vue'
import compositionEditor from 'components/composition/composition_editor/index.vue'

export default {
  name: 'pageNode_itemEditor',
  props: ['item', 'styles', 'isActive'],
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
      figures: [],
    }
  },
  watch: {
    isActive: {
      handler (to, from) {
        this.$log('isActive', to)
        if (to) {}
        else {
          if (this.player) this.player.pause()
          this.editing = false
        }
      }
    },
    item: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('item TO', to)
        if (to) {
          if (to.outputType === 'VIDEO') {
            this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, to.layers[0].contentOid)
            this.figures = [to.layers[0].figuresAbsolute]
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
