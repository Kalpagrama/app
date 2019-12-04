<template lang="pug">
.row.full-width.items-start.content-start.q-pa-sm
  div(:style=`{height: '200px', borderRadius: '10px', overflow: 'hidden'}`
    ).row.full-width.items-center.content-center.justify-center.bg-grey-2
    span Some settings
  .row.full-width.q-py-sm
    q-btn(outline color="red" no-caps @click="wsClear()"
      style=`height: 60px; borderRadius: 10px; overflow: hidden`).full-width
      span.text-red {{$t('Clear my workspace')}}
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
      this.$log('wsClear start')
      let {data: {wsClear}} = await this.$apollo.mutate({
        mutation: gql`
          mutation wsClear {
            wsClear
          }
        `
      })
      this.$log('wsClear done', wsClear)
      window.location.reload(true)
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
