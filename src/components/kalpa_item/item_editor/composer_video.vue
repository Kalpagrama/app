<template lang="pug">
div(:style=`{height: height+'px'}`).row.full-width
  div(:style=`{position: 'relative',}`).row.fit.items-start.content-start.justify-center
    content-player(
      v-if="contentKalpa"
      @player="playerReady"
      :contentKalpa="contentKalpa"
      :options=`{
        showPult: $q.screen.gt.sm ? true : !pageId,
        showTint: $q.screen.gt.sm ? true : !pageId,
        showPlayBtn: !pageId,
      }`
      ).fit.bg-black
      template(v-slot:footer)
        .row.full-width.q-pa-sm
      template(v-slot:pult)
        div(
          v-if="player"
          ).row.full-width.justify-center
          div(
            :style=`{
              maxWidth: 600+'px',
              //- background: 'rgba(30,30,30,0.9)',
              borderRadius: '30px',
            }`
            ).row.full-width.items-center.content-center
            //- top
            .row.full-width.q-pa-md
              span(:style=`{fontSize: '22px'}`).text-white.text-bold.q-ml-sm {{$t('Pick fragment')}}
            //- center
            div(
              :style=`{
                lineHeight: 1,
              }`
              ).row.full-width.items-start.content-start.q-px-md.q-mb-sm
              div(v-if="$store.getters.currentUser.profile.lang === 'RUS'").col.q-px-sm
                span.text-white Нажмите
                q-btn(
                  round flat dense icon="add_circle_outline" color="green")
                span.text-white внизу, чтобы выделить фрагмент из видео, это важно потому что это важно.
              div(v-if="$store.getters.currentUser.profile.lang === 'ENG'").col.q-pr-lg
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
                @click="compositionUpdate"
                no-caps color="green"
                :disable="!player.figures"
                :style=`{
                  borderRadius: '40px',
                }`
                ).q-px-sm {{$t('Ready')}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import contentPlayer from 'src/components/content_player'

export default {
  name: 'composerVideo',
  components: {
    contentPlayer
  },
  props: ['oid', 'figures', 'height', 'fromComposition', 'action'],
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
        __typename: 'Composition',
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
