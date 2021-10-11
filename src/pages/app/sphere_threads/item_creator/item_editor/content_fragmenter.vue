<template lang="pug">
div(
  @click.self="$emit('close')"
  :style=`{
    height: $q.screen.height+'px',
  }`
  ).column.full-width.b-30
  //- header
  .row.full-width.items-center.content-center.q-pa-sm
    span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-ml-sm {{$t('Pick fragment')}}
    .col
    q-btn(
      round flat color="white" icon="clear"
      @click="$emit('close')")
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
import contentPlayer from 'src/components/content_player/index.vue'
import { ObjectTypeEnum } from 'src/system/common/enums'

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
        type: ObjectTypeEnum.COMPOSITION,
      }
      this.$emit('composition', compositionInput)
    },
    imageReady () {},
    bookReady () {},
  }
}
</script>
