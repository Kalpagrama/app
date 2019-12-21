<template lang="pug">
.row.full-width.items-start.content-start
  div(:style=`{height: '60px'}`).row.full-width.items-center
    .col.full-height
      .row.fit.items-center.justify-start.q-px-md
        span.text-bold {{ $t('Workspace settings') }}
    div(:style=`{height: '60px', width: '60px'}`).row.items-center.justify-center
      q-btn(round flat icon="clear" color="grey" @click="$emit('close')")
  .row.full-width.q-px-sm
    //- div(:style=`{height: '200px', borderRadius: '10px', overflow: 'hidden'}`
    //-   ).row.full-width.items-center.content-center.justify-center.bg-grey-2
    //-   span {{$t('Some settings')}}
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
      if (!window.confirm('Do really want to clear your workspace?')) return
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
