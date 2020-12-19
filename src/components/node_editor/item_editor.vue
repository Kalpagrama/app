<template lang="pug">
.row.full-width.items-start.content-start
  //- ADD
  div(
    v-if="item.type === 'ADD'"
    ).row.fit
    q-btn(
      @click="$emit('add')"
      flat color="green" icon="add" size="xl").fit.b-50
  //- SPHERE
  div(
    v-if="['SPHERE', 'WORD', 'SENTENCE'].includes(item.type)"
    ).row.fit.items-center.content-center.justify-center
    q-icon(
      name="blur_on"
      size="60px"
      color="white")
    .row.full-width.justify-center
      span.text-white {{ item.name }}
  //- USER
  div(
    v-if="item.type === 'USER'"
    ).row.fit.items-center.contnet-center.justify-center
    img(
      :src="item.thumbUrl"
      :style=`{
        height: '60px',
        width: '60px',
        borderRadius: '50%',
      }`)
    .row.full-width.justify-center
      span.text-white {{ item.name }}
  //- NODE
  //- div(
    v-if="item.type === 'NODE'"
    ).row.fit
    img(
      :src="item.thumbUrl"
      :style=`{
        borderRadius: '10px',
        objectFit: 'cover',
      }`
      ).fit
  //- NODE
  div(
    v-if="item && item.type === 'NODE' && item.type !== 'ADD'"
    :style=`{position: 'relative'}`).row.fit
    composition-player(
      :composition="item.items[0]"
      :isActive="isActive"
      :isVisible="true"
      :styles=`{
        height: '100%',
        objectFit: 'cover',
      }`
      :options=`{
        loop: true,
      }`)
    //- name
    div(
      :style=`{
        position: 'absolute', zIndex: 1000, bottom: '-0.5px',
        transform: 'translate3d(0,0,0)',
        background: 'linear-gradient(0deg, rgba(15,15,15,0.9) 0%, rgba(0,0,0,0) 100%)',
        borderRadius: '10px',
        textAlign: 'center',
        minHeight: '40px',
      }`
      ).row.full-width.items-center.content-center.justify-center
      span(:style=`{userSelect: 'none'}`).text-white.cursor-pointer {{ item.name }}
  //- GIF
  //- div(
    v-if="item.type === 'GIF'"
    ).row.full-width.items-start.content-start
    img(
      :src="item.url"
      :style=`{
        borderRadius: '10px',
      }`
      ).full-width
  //- BOOK
  //- IMAGE
  //- div(
    v-if="item.type === 'IMAGE' || item.outputType === 'IMAGE'"
    :style=`{
      position: 'relative',
      ...styles,
    }`
    ).row.full-width.items-start.content-start
    content-player(
      :contentKalpa="contentKalpa"
      :styles="styles"
      @player="playerLoaded"
      @error="playerError = $event"
      :style=`{
        borderRadius: '10px',
        zIndex: 210,
      }`).fit.bg-black
    //- img(
      :src="item.url"
      :style=`{
        borderRadius: '10px',
        objectFit: 'cover',
      }`
      ).fit
  //- CONTENT(VIDEO,IMAGE,AUDIO,BOOK) => COMPOSITION
  div(
    v-if="contentKalpa && item.type !== 'ADD'"
    :style=`{position: 'relative', ...styles}`
    ).row.full-width.items-start.content-start
    //- small.text-white {{ item.oid }}
    //- :figures="item.layers ? item.layers[0].figuresAbsolute : false"
    content-player(
      :contentKalpa="contentKalpa"
      @player="playerLoaded"
      @error="playerError = $event"
      :styles="styles"
      :figures="(item.__typename === 'Composition' && !editing) ? item.layers[0].figuresAbsolute : false"
      :style=`{
        borderRadius: '10px',
      }`).bg-black
    //- ADD btn, create composition from content
    q-btn(
      v-if="item.__typename !== 'Composition'"
      @click="nodeCreateStart()"
      round flat dense
      color="green"
      icon="add"
      :style=`{
        position: 'absolute', zIndex: 10000, right: '8px', bottom: 6+'px'
      }`)
    //- toggle composition editing => show/hide composition editor
    q-btn(
      v-if="item.__typename === 'Composition'"
      @click="editing = !editing"
      round flat dense
      :color="editing ? 'green' : 'white'"
      :icon="editing ? 'check' : 'edit'"
      :style=`{
        position: 'absolute', zIndex: 10000, right: '8px', bottom: 6+'px'
      }`)
    //- compositionEditor for VIDEO
    div(
      v-if="item.__typename === 'Composition' && item.outputType === 'VIDEO' && player"
      :style=`{
        position: 'absolute', zIndex: 400, bottom: '0px',
      }`).row.full-width
      div(:style=`{position: 'absolute', zIndex: 10, top: '-8px'}`).row.full-width
        transition(enter-active-class="animated slideInDown" leave-active-class="animated slideOutUp")
          composition-editor(
            v-if="editing"
            :player="player" :composition="item"
            :contentKalpa="contentKalpa"
            :style=`{
              zIndex: 2000,
              borderRadius: '0 0 10px 10px',
            }`).bg-black
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import contentPlayer from 'components/content_player/index.vue'
import compositionPlayer from 'components/composition/composition_player/index.vue'
import compositionEditor from 'components/composition/composition_editor/index.vue'

export default {
  name: 'nodeEditor_itemEditor',
  props: ['item', 'styles', 'isActive'],
  components: {
    contentPlayer,
    compositionPlayer,
    compositionEditor,
  },
  data () {
    return {
      contentKalpa: null,
      editing: false,
      player: null,
      playerError: null,
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
        // this.$log('item TO', to)
        if (to) {
          // content
          if (['Video', 'Image', 'Book'].includes(to.__typename)) {
            if (!this.contentKalpa) this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, to.oid)
          }
          else if (to.__typename === 'Composition') {
            if (!this.contentKalpa) this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, to.layers[0].contentOid)
          }
        }
      }
    },
    editing: {
      immediate: true,
      handler (to, from) {
        this.$emit('editing', to)
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
        thumbHeight: this.item.thumbHeight,
        thumbWidth: this.item.thumbWidth,
        outputType: 'VIDEO',
        layers: [
          {id: Date.now().toString(), contentOid: this.item.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}]},
        ],
        operation: { items: null, operations: null, type: 'CONCAT'},
        __typename: 'Composition',
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
    },
    playerLoaded (player) {
      this.$log('playerLoaded', player)
      this.player = player
      this.$emit('player', player)
    }
  },
  mounted () {
    this.$log('mounted')
    // alert('itemEditor MOUNTED')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // alert('itemEditor beforeDestroy')
  }
}
</script>
