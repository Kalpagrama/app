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
        template(v-slot:left)
          q-btn(
            @click="$emit('close')"
            flat no-caps color="red"
            :style=`{borderRadius: '16px'}`) {{$t('Close')}}
        template(v-slot:right)
          q-btn(
            @click="compositionUpdate"
            flat no-caps color="green"
            :style=`{ borderRadius: '16px'}`) {{$t('Ready')}}
        template(v-slot:tint-bar=`{tintFocused}`)
          div(v-if="player && !player.figure").row.full-width.justify-center.items-center.content-center
            div(:style=`{background: 'rgba(0,0,0,0.3)', borderRadius: '10px'}`).row
              span.text-white {{$t('Выберите фрагмент')}}
              q-icon(name="crop" color="grey" size="xs").q-px-xs
              span.text-white {{$t(', либо нажмите готово')}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import contentPlayer from 'src/components/content_player'
import { ObjectTypeEnum } from 'src/system/common/enums'

export default {
  name: 'composerImage',
  props: ['oid', 'figures', 'height', 'action'],
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
    },
    compositionUpdate () {
      this.$log('compositionUpdate')
      let compositionInput = {
        id: Date.now().toString(),
        thumbUrl: this.contentKalpa.thumbUrl,
        thumbHeight: this.contentKalpa.thumbHeight,
        thumbWidth: this.contentKalpa.thumbWidth,
        outputType: 'IMAGE',
        layers: [
          {
            id: Date.now().toString(),
            contentOid: this.contentKalpa.oid,
            contentName: this.contentKalpa.name,
            figuresAbsolute: this.player.figure || []
          },
        ],
        operation: { items: null, operations: null, type: 'CONCAT'},
        type: ObjectTypeEnum.COMPOSITION,
      }
      this.$log('compositionUpdate', compositionInput)
      this.$emit('composition', compositionInput)
    }
  }
}
</script>
