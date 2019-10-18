<template lang="pug">
div(
  v-show="height > 0"
  @click.self="backClick"
  :style=`{position: 'fixed', bottom: '0px', zIndex: 1000, height: height+60+'px',
    background: height === $q.screen.height-60 ? 'rgba(0, 0, 0, 0.5)' : 'none'}`
  ).row.full-width.items-end.content-end
  div(
    :style=`{
      zIndex: 1000, bottom: '0px', height: height+'px',
      borderRadius: '10px 10px 0 0', overflow: 'hidden'}`).column.full-width
    .row.full-width
      slot(name="header")
    .col.full-width.scroll
      slot(name="body")
</template>

<script>
export default {
  name: 'kTongue',
  data () {
    return {
      height: 0
    }
  },
  methods: {
    backClick () {
      this.$log('backClick')
      this.hide()
    },
    show () {
      this.$log('show')
      this.$tween.to(this, 0.35, {height: this.$q.screen.height - 60})
    },
    hide () {
      this.$log('hide')
      this.$tween.to(this, 0.35, {height: 0})
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
