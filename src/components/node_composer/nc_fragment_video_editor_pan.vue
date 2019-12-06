<template lang="pug">
div(:style=`{height: '100px'}`).row.full-width.items-center.content-center
  div(:style=`{height: '50px'}`).row.full-width.q-px-md
    div(:style=`{height: '50px', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-center.justify-center.bg-grey-10
      div(:style=`{height: '50px'}`).row.items-center.justify-center
        q-btn(round flat color="grey-6" icon="keyboard_arrow_left" @click="tickLeft")
      .col.full-height
        .row.fit.items-center.justify-center
          span.text-grey-5 {{ $t('Pan to select point') }}
      div(:style=`{height: '50px'}`).row.items-center.justify-center
        q-btn(round flat color="grey-6" icon="keyboard_arrow_right" @click="tickRight")
  //- div(
  //-     v-if="content.contentSource === 'KALPA'"
  //-     :style=`{height: '100px'}`).row.full-width.items-center.scroll
  //-     .row.no-wrap
  //-       div(:style=`{height: '50px', width: width/2+'px', minWidth: width/2+'px'}`).row
  //-       div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.no-wrap
  //-         img(
  //-           v-for="(f,fi) in frames" :key="fi"
  //-           :src="f"
  //-           :style=`{height: '50px'}`)
  //-       div(:style=`{height: '50px', width: width/2+'px', minWidth: width/2+'px'}`).row
</template>

<script>
export default {
  name: 'ncFragmentVideoEditorPan',
  props: ['width', 'player', 'content'],
  data () {
    return {
    }
  },
  methods: {
    tickLeft () {
      this.$log('tickLeft')
      let now = this.player.currentTime
      let to = now - 1
      this.player.currentTime = to
    },
    tickRight () {
      this.$log('tickRight')
      let now = this.player.currentTime
      let to = now + 1
      this.player.currentTime = to
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
