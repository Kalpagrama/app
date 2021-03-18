<template lang="pug">
kalpa-layout().b-30
  template(v-slot:body)
    .row.full-width.items-start.content-start
      .row.full-width.justify-center
        div(:style=`{maxWidth: 500+'px'}`).row.full-width
          //- header
          .row.full-width.items-center.content-center.q-pa-sm
            q-btn(
              round flat color="white" icon="west"
              @click="$emit('close')").q-mr-sm
            span(:style=`{fontSize: '18px'}`).text-white.text-bold Выделение фрагмента
//- div(
  @click.self="$emit('close')"
  :style=`{
    height: $q.screen.height+'px',
  }`
  ).column.full-width.b-30
  .col.full-width
    div(
      :style=`{
        position: 'relative',
      }`
      ).row.fit.items-start.content-start.justify-center
      //- video
      content-player(
        v-if="contentKalpa"
        @player="playerReady"
        :contentKalpa="contentKalpa"
        :style=`{
          height: '100%',
          //- maxWidth: 600+'px',
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
        template(v-slot:tint-bar=`{tintFocused}`)
          div(
            v-if="player && player.figure"
            ).row.full-width.justify-center.q-pb-xs
            div(
              :style=`{
                maxWidth: 600+'px',
              }`
              ).row.full-width
              .col
              q-btn(
                @click="videoReady"
                no-caps color="green"
                ) Готово
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import contentPlayer from 'components/content_player/index.vue'

export default {
  name: 'contentFragmenter',
  components: {
    contentPlayer
  },
  props: ['oid', 'figures'],
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
      if (this.figures) this.player.setState('figure', this.figures)
    },
    videoReady () {
      this.$log('videoReady')
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
            figuresAbsolute: this.player.figure
          },
        ],
        operation: { items: null, operations: null, type: 'CONCAT'},
        __typename: 'Composition',
      }
      this.$emit('composition', compositionInput)
    },
    imageReady () {},
    bookReady () {},
  }
}
</script>
