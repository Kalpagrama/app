<template lang="pug">
.row.fit.bg-black.items-start.content-start.justify-center
  div(:style=`{maxWidth: Math.min($store.state.ui.pageWidth, $q.screen.width)+'px'}`).row.full-width
    content-player(v-if="contentKalpa" @player="playerReady" :contentKalpa="contentKalpa").row.full-width.br-15
      //template(v-slot:pult)
      //  div(v-if="player").row.full-width.justify-center
      //    div( :style=`{ maxWidth: 600+'px', borderRadius: '30px',}`).row.full-width.items-center.content-center
      //      div(v-if="!player.figures" :style=`{ lineHeight: 1,}`).row.full-width.items-start.content-start.q-px-md.q-py-sm
      //        .col.q-px-sm
      //          span.text-white {{$t('Click')}}
      //          q-icon(name="add_circle_outline" color="green" size="sm")
      //          span.text-white {{$t('at the bottom to select a fragment from the video.')}}
      //      //- bottom
      //      .row.full-width.q-py-sm.q-px-md
      //        q-btn(
      //          v-if="true"
      //          @click="$emit('close')"
      //          flat no-caps color="red"
      //          :style=`{
      //            borderRadius: '40px',
      //          }`
      //          ).q-mr-sm {{$t('Close')}}
      //        .col
    .row.fit.justify-center.content-start
      q-resize-observer(@resize="editorHeight = $event.height")
      div(v-if="player && player.duration > 0 && player.node && player.nodeMode === 'edit'").row.full-width
        fragment-editor(:player="player" :contentKalpa="contentKalpa").row.br-10.b-35.op-70
        q-btn( flat no-caps color="green" :disable="!player.figures" :label="$t('Ready')" @click="compositionUpdate" ).full-width
      div(v-else).row.full-width.justify-center
        div( :style=`{ maxWidth: 600+'px', borderRadius: '30px',}`).row.full-width.items-center.content-center
          div(:style=`{ lineHeight: 1,}`).row.full-width.items-start.content-start.q-px-md.q-py-sm
            .col.q-px-sm
              span.text-white {{$t('Click')}}
              q-icon(name="add_circle_outline" color="green" size="sm")
              span.text-white {{$t('at the bottom to select a fragment from the video.')}}
          //- bottom
          .row.full-width.q-py-sm.q-px-md
            q-btn(
              v-if="true"
              @click="$emit('close')"
              flat no-caps color="red"
              :style=`{
                  borderRadius: '40px',
                }`
            ).q-mr-sm {{$t('Close')}}
            .col
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import contentPlayer from 'src/components/content_player'
import { ObjectTypeEnum } from 'src/system/common/enums'
import fragmentEditor from 'src/components/content_player/player_video/player_pult/fragment_editor'

export default {
  name: 'composerVideo',
  components: { contentPlayer, fragmentEditor },
  props: ['oid', 'figures', 'height', 'fromComposition', 'action'],
  data () {
    return {
      contentKalpa: null,
      player: null,
      editorHeight: null,
    }
  },
  watch: {
    oid: {
      immediate: true,
      async handler (to, from) {
        this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
      }
    }
  },
  methods: {
    playerReady (player) {
      this.$log('playerReady', player)
      this.player = player
      this.player.events.on('figure-delete', () => {
        this.$log('player figure-delete')
        this.player.setState('figures', null)
      })
      if (this.figures) this.player.setState('figures', this.figures)
      this.$nextTick(() => {
        this.player.play()
      })
    },
    compositionUpdate () {
      this.$log('compositionUpdate')
      let compositionInput = {
        id: Date.now().toString(),
        thumbUrl: this.contentKalpa.thumbUrl,
        thumbHeight: this.contentKalpa.thumbHeight,
        thumbWidth: this.contentKalpa.thumbWidth,
        outputType: 'VIDEO',
        layers: [
          {
            id: Date.now().toString(),
            contentOid: this.contentKalpa.oid,
            contentName: this.contentKalpa.name,
            figuresAbsolute: this.player.figures
          },
        ],
        operation: { items: null, operations: null, type: 'CONCAT'},
        type: ObjectTypeEnum.COMPOSITION,
      }
      this.$log('compositionUpdate', compositionInput)
      this.$emit('composition', compositionInput)
    }
  },
  mounted () {
    this.$log('mounted')
    // let user = this.$store.getters.currentUser.profile.lang
    // this.$log('user', user)
  }
}
</script>
