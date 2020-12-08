<template lang="pug">
q-btn(
  flat color="white" icon="select_all" size="lg"
  :to="contentLink"
  :style=`{
    position: 'absolute', zIndex: 3000, transform: 'translate3d(0,0,0)',
    top: '0px', left: '0px',
    width: '60px',
    height: '60px',
    background: 'rgba(0,0,0,0.1)',
  }`)
</template>

<script>
export default {
  name: 'compositionPlayer_contentExplorer',
  props: ['oid', 'composition'],
  data () {
    return {
    }
  },
  computed: {
    contentLink () {
      return `/content/${this.composition.layers[0].contentOid}?node=${this.oid}`
    }
  }
}
</script>
