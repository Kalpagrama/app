<template lang="pug">
.column.fit
  //- header
  div(:style=`{height: '60px'}`).row.full-width.items-center
    .col.full-height
      .row.fit.items-center.justify-start.q-px-md
        span.text-bold.text-green Settings
  //- body
  .col.full-width.scroll
    .row.full-width.justify-center
      div(:style=`{maxWidth: '500px'}`).row.full-width.items-start.content-start.q-px-sm
        .row.full-width.q-py-sm
          q-btn(outline color="red" no-caps @click="wsClear()"
            style=`height: 60px; borderRadius: 10px; overflow: hidden`).full-width.q-mb-md
            span.text-red Clear my workspace
          q-btn(outline color='green' no-caps @click="wsExport()"
            :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`).full-width.q-md-md
            span.text-green Export my workspace
        div(:style=`{height: '400px'}`).row.full-width
</template>

<script>
export default {
  name: 'wsSettings',
  data () {
    return {
    }
  },
  methods: {
    async wsClear () {
      if (!confirm('Do really want to clear your workspace?')) return
      this.$log('wsClear start')
      let wsClear = await this.$store.dispatch('workspace/wsClear')
      this.$log('wsClear done', wsClear)
      window.location.reload()
    },
    wsExport () {
      this.$log('wsExport')
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
