<template lang="pug">
q-btn(
  @click="start()"
  round flat color="grey-2" icon="select_all"
  :style=`{
    position: 'absolute', zIndex: 1000, transform: 'translate3d(0,0,0)',
    top: '8px', left: '8px',
    background: 'rgba(0,0,0,0.15)',
  }`)
</template>

<script>
export default {
  name: 'compositionPlayer_video_contentExplorer',
  props: ['composition'],
  data () {
    return {
    }
  },
  methods: {
    async start () {
      this.$log('start')
      // this.loading = true
      let contentOid = this.composition.layers[0].contentOid
      let start = this.composition.layers[0].figuresAbsolute[0].t
      this.$log('contentOid/start', contentOid, start)
      this.$router.push(`/content/${contentOid}?viewid=nodes&startat=${start}`)
    },
  }
}
</script>
