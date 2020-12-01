<template lang="pug">
.row.full-width
  div(
    :style=`{borderRadius: '10px'}`).row.full-width.items-start.content-start.b-30
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
      :style=`{
        position: 'relative',
        borderRadius: '10px',
      }`
      ).row.full-width.items-start.content-start.bg-black.q-pb-sm
      //- composition-editor(
        v-if="item.outputType === 'VIDEO' && editing"
        :player="player" :composition="item"
        :contentKalpa="contentKalpa")
      content-player(
        :contentKalpa="contentKalpa"
        @player="player = $event"
        @error="playerError = $event"
        :style=`{
          borderRadius: '10px',
        }`).fit
        template(v-slot:bar)
          div(
            v-if="player && figures.length > 0"
            :style=`{
              position: 'absolute', zIndex: 2050, pointerEvents: 'none',
              //- borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.fit
            template(v-for="(f,fi) in figures")
              div(
                v-if="f.length === 1"
                :key="fi"
                :style=`{
                  position: 'absolute', zIndex: 2050, top: '0px',
                  left: f[0].t/player.duration*100+'%',
                  width: '2px',
                  background: 'rgba(255,255,255, 0.5)',
                }`
                ).row.full-height
              div(
                v-if="f.length === 2"
                :key="fi"
                :style=`{
                  position: 'absolute', zIndex: 2050, top: '-2px',
                  left: f[0].t/player.duration*100+'%',
                  width: (f[1].t-f[0].t)/player.duration*100+'%',
                  height: 'calc(100% + 4px)',
                  border: '2px solid rgb(76,175,80)',
                  borderRadius: '4px',
                  background: 'rgba(255,255,255,0.2)',
                  pointerEvents: 'none',
                }`
                ).row
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
      q-btn(
        v-if="item.outputType === 'VIDEO'"
        @click="editing = !editing"
        round flat dense
        :color="editing ? 'green' : 'white'"
        :icon="editing ? 'check' : 'edit'"
        :style=`{
          position: 'absolute', zIndex: 2000, right: '4px', bottom: '0px',
          //- borderRadius: '50%',
        }`)
    composition-editor(
      v-if="item.outputType === 'VIDEO' && editing"
      :player="player" :composition="item"
      :contentKalpa="contentKalpa")
    //- USER
    //- SPHERE,WORD,SENTENCE
    //- footer
    //- NAME for everyone
    //- div(
      :style=`{
        position: 'relative',
        zIndex: 100,
      }`
      ).row.full-width.justify-center.q-pa-sm.b-40
      span(:style=`{opacity: 0}`).text-grey-6 В чем суть?
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
      figures: [],
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
