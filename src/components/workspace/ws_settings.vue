<template lang="pug">
.column.fit.bg-grey-3
  div(:style=`{height: '60px'}`).row.full-width.items-center
    .col.full-height
      .row.fit.items-center.justify-start.q-px-md
        span.text-bold {{ $t('Workspace settings') }}
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="clear" color="grey" @click="$emit('close')")
  .col.full-width.scroll
    .row.full-width.items-start.content-start.q-px-sm
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
      if (!confirm('Do really want to clear your workspace?')) return
      this.$log('wsClear start')
      let {data: {wsClear}} = await this.$apollo.mutate({
        mutation: gql`
          mutation sw_network_only_wsClear {
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
