<template lang="pug">
q-layout(view="hHh Lpr lff").b-30
  q-header(reveal)
    .row.full-width.justify-center
      div(:style=`{maxWidth: '800px'}`).row.full-width.b-30
        div(:style=`{}`).row.full-width.items-center.content-center.q-pa-sm
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="close()")
          .col
            span(:style=`{fontSize: '18px'}`).text-white.text-bold From content
          //- q-btn(round flat color="white" icon="launch" @click="explore()")
  q-page-container
    q-page(:style=`{paddingTop: '0px'}`).row.full-width.justify-center
      div(:style=`{maxWidth: '800px', height: $q.screen.height-60+'px',}`).column.full-width.items-start.content-start
        div(
          :style=`{
            position: 'relative',
            borderRadius: '10px', overflow: 'hidden',
          }`).col.full-width.bg-black
          img(
            v-if="contentKalpa"
            :src="contentKalpa.thumbUrl"
            @load="thumbUrlLoaded"
            draggable="false"
            :style=`{
              borderRadius: '10px', overflow: 'hidden',
              objectFit: 'contain',
              opacity: 0.7,
            }`
            ).fit
          content-player(
            v-if="contentKalpa"
            :contentKalpa="contentKalpa"
            @player="player = $event"
            :options=`{
              showBar: true,
              showActions: true,
            }`
            :style=`{
              position: 'absolute', top: 0, zIndex: 300,
            }`).fit
            template(v-slot:actions)
              q-btn(
                v-if="true"
                @click="fragmentCreateBtn()"
                round push color="green" dense icon="add"
                :style=`{borderRadius: '50%'}`)
          //- div(
            :style=`{
              position: 'relative',
              marginTop: '-10px',
              borderRadius: '0 0 10px 10px',
            }`
            ).row.full-width.b-50
            composition-editor(
              v-if="player && itemCopy"
              :contentKalpa="contentKalpa"
              :composition="itemCopy"
              :player="player"
              )
        //- div(v-if="['fragments', 'nodes'].includes(viewId)").col.full-width.bg-red
          div(v-if="viewId === 'fragments'").row.full-width.items-start.content-start
        div(
          v-if="viewId === 'fragment'"
          :style=`{height: 'auto'}`).row.full-width
          composition-editor(
            v-if="player && fragment"
            :contentKalpa="contentKalpa"
            :composition="fragment"
            :player="player")
          .row.full-width.justify-center
            div(:style=`{maxWidth: '600px'}`).row.full-width.q-pa-md
              q-btn(
                @click="$emit('close')"
                flat no-caps color="white"
                ) {{ $t('cancel', 'Отмена') }}
              .col
              q-btn(
                @click="$emit('fragment', fragment)"
                color="green" no-caps
                ) {{$t('save', 'Сохранить')}}
          //- item here...
        div(
          v-if="viewId !== 'fragment'"
          :style=`{}`).row.full-width.justify-center
          //- q-btn(
            @click="fragmentCreateBtn()"
            flat color="green" icon="add" no-caps) Add fragment here
          q-tabs(v-model="viewId" active-color="white" dense full-width no-caps).full-width.text-grey-8
            q-tab(name="nodesMine" label="Mine nodes")
            //- q-tab(name="fragment" label="Fragment")
            q-tab(name="nodesKalpa" label="Nodes kalpa")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import compositionEditor from 'components/composition/composition_editor/index.vue'
import contentPlayer from 'components/content_player/index.vue'

export default {
  name: 'itemFinder_fromContentSelect',
  components: {contentPlayer, compositionEditor},
  props: ['contentBookmark'],
  data () {
    return {
      contentKalpa: null,
      player: null,
      fragment: null,
      itemCopy: null,
      itemCopyChanged: false,
      viewId: null,
    }
  },
  computed: {
    // itemCopyChanged () {
    //   return this.itemCopy === this.item
    // }
  },
  watch: {
    // item: {
    //   deep: true,
    //   immediate: true,
    //   handler (to, from) {
    //     this.$log('item TO', to)
    //     // this.itemCopy = JSON.parse(JSON.stringify(to))
    //     this.$set(this, 'itemCopy', JSON.parse(JSON.stringify(to)))
    //   }
    // },
    // itemCopy: {
    //   deep: true,
    //   immediate: false,
    //   handler (to, from) {
    //     this.$log('itemCopyChanged', to)
    //     this.itemCopyChanged = true
    //   }
    // }
  },
  methods: {
    explore () {
      this.$log('expore')
      this.$router.push(`/content/${this.contentBookmark.oid}`)
    },
    fragmentCreateBtn () {
      this.$log('fragmentCreateBtn')
      // if content is VIDEO???
      this.viewId = 'fragment'
      let start = this.player.currentTime
      let end = start + 10 > this.player.duration ? this.player.duration : start + 10
      let fragmentInput = {
        id: Date.now().toString(),
        thumbUrl: this.contentKalpa.thumbUrl,
        outputType: 'VIDEO',
        layers: [
          {id: Date.now().toString(), contentOid: this.contentKalpa.oid, figuresAbsolute: [{t: start, points: []}, {t: end, points: []}]},
        ],
        operation: { items: null, operations: null, type: 'CONCAT'},
      }
      this.fragment = fragmentInput
    },
    thumbUrlLoaded (e) {
      this.$log('thumbUrlLoaded')
    },
    close () {
      this.$log('close')
      // if (this.itemCopyChanged) {
      //   if (confirm('Save changes ?')) {
      //     this.save()
      //   }
      //   else {
      //     this.$emit('close')
      //   }
      // }
      // else {
      //   this.$emit('close')
      // }
      this.$emit('close')
    },
    save () {
      this.$log('save')
      // this.$set(this, 'item', JSON.parse(JSON.stringify(this.itemCopy)))
      this.$set(this.item, 'layers', JSON.parse(JSON.stringify(this.itemCopy.layers)))
      this.$emit('close')
    }
  },
  async mounted () {
    this.$log('mounted')
    this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.contentBookmark.oid)
  }
}
</script>
