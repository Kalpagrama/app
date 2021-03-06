<template lang="pug">
.row.full-width.items-start.content-start.justify-center
  content-player(
    v-if="contentKalpa"
    @player="playerReady"
    :contentKalpa="contentKalpa"
    :style=`{ maxWidth: '600px'}`
    :options=`{
        showHeader: false,
        showBar: true,
        showFooter: true,
        mode: 'editor',
      }`
  ).bg-black
    template(v-slot:tint-bar=`{tintFocused}`)
      div(
        v-if="player"
      ).row.full-width.justify-center.q-pb-xs.q-px-md
        div(
          :style=`{
              maxWidth: 600+'px',
              background: 'rgba(30,30,30,0.9)',
              borderRadius: '30px',
            }`
        ).row.full-width.items-center.content-center
          //- top
          .row.full-width.q-pa-md
            span(:style=`{fontSize: '22px'}`).text-white.text-bold.q-ml-sm {{$t('Pick fragment')}}
          //- center
          .row.full-width.items-start.content-start.q-px-md
            .col.q-pr-lg
              p.text-white.q-ml-sm {{$t('Why pick fragment on looong video is important! You need to concentrate and to communicate better')}}
          //- bottom
          .row.full-width.q-pb-sm.q-px-md
            q-btn(
              v-if="true"
              @click="$emit('close')"
              flat no-caps color="red"
              :style=`{
                  borderRadius: '40px',
                }`
            ).q-mr-sm {{$t('Close')}}
            .col
            q-btn(
              @click="fragmentUpdate"
              no-caps color="green"
              :disable="!player.figure"
              :style=`{
                  borderRadius: '40px',
                }`
            ).q-px-sm {{$t('Ready')}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import contentPlayer from 'src/components/content_player'
import { ObjectTypeEnum } from 'src/system/common/enums'

export default {
  name: 'composerBook',
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
    fragmentUpdate () {
      this.$logD('fragmentUpdate')
      let compositionInput = {
        id: Date.now().toString(),
        thumbUrl: this.contentKalpa.thumbUrl,
        thumbHeight: this.contentKalpa.thumbHeight,
        thumbWidth: this.contentKalpa.thumbWidth,
        outputType: 'BOOK',
        layers: [
          {
            id: Date.now().toString(),
            contentOid: this.contentKalpa.oid,
            contentName: this.contentKalpa.name,
            figuresAbsolute: [this.player.figure]
          },
        ],
        operation: { items: null, operations: null, type: 'CONCAT'},
        type: ObjectTypeEnum.COMPOSITION,
      }
      this.$emit('composition', compositionInput)
    }
  }
}
</script>
