<template lang="pug">
kalpa-layout(
  :height="height"
  ).bg-black
  template(v-slot:body)
    div(:style=`{position: 'relative',}`).row.fit.items-start.content-start.justify-center
      content-player(
        v-if="contentKalpa"
        @player="playerReady"
        :contentKalpa="contentKalpa"
        :style=`{
          height: '100%',
          maxWidth: '600px',
        }`
        :options=`{
          showHeader: false,
          showBar: true,
          showFooter: true,
          mode: 'editor',
        }`
        :styles=`{
          height: '100%',
          objectFit: 'contain',
        }`
        ).full-width.bg-black
        //- template(v-slot:tint-bar=`{tintFocused}`)
          div(
            v-if="player && player.figure"
            ).row.full-width.justify-center.q-pb-xs
            div(
              :style=`{
                maxWidth: 600+'px',
              }`
              ).row.full-width.items-center.content-center.q-px-md
              span.text-white.text-bold Выдели фрагмент
              .col
              q-btn(
                @click="fragmentUpdate"
                no-caps color="green"
                ) Готово
              //- .col
              //- q-btn(
                round flat color="red" icon="clear")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import contentPlayer from 'components/content_player/index.vue'
// import figureEditor from 'components/figure_editor.vue'

export default {
  name: 'bookFragmenter',
  props: ['oid', 'figures', 'height'],
  components: {
    contentPlayer
  },
  data () {
    return {
      contentKalpa: null,
      player: null,
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
      // this.player.events.on('figure-delete', () => {
      //   this.$log('player figure-delete')
      //   this.player.setState('figure', null)
      // })
      // if (this.figures) this.player.setState('figure', this.figures)
      // this.$nextTick(() => {
      //   this.player.play()
      // })
    },
    fragmentUpdate () {
      this.$log('fragmentUpdate')
      // let compositionInput = {
      //   id: Date.now().toString(),
      //   thumbUrl: this.contentKalpa.thumbUrl,
      //   thumbHeight: this.contentKalpa.thumbHeight,
      //   thumbWidth: this.contentKalpa.thumbWidth,
      //   outputType: 'BOOK',
      //   layers: [
      //     {
      //       id: Date.now().toString(),
      //       contentOid: this.contentKalpa.oid,
      //       figuresAbsolute: this.player.figure
      //     },
      //   ],
      //   operation: { items: null, operations: null, type: 'CONCAT'},
      //   __typename: 'Composition',
      // }
      // this.$emit('composition', compositionInput)
    }
  }
}
</script>
