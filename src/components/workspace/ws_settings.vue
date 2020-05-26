<template lang="pug">
.column.fit
  //- header
  div(
    v-if="false"
    :style=`{height: '60px'}`).row.full-width.items-center
    .col.full-height
      .row.fit.items-center.justify-start.q-px-md
        span.text-bold.text-green Settings
  //- body
  .col.full-width.scroll
    .row.full-width.justify-center
      div(:style=`{borderRadius: '0 0 10px 10px'}`).row.full-width.items-start.content-start.q-px-sm.q-py-md.b-70
        //- .row.full-width.q-pa-md
        //-   span(:style=`{fontSize: '30px'}`).text-white.text-bold Settings
        //- export import
        //- .row.full-width.q-px-md
        //-   span(:style=`{fontSize: '20px'}`).text-white Portability
        //- .row.full-width.q-px-md.q-py-sm
        //-   q-btn(outline color='green' no-caps @click="wsExport()").q-mr-sm Import
        //-   q-btn(outline color='green' no-caps @click="wsExport()") Export
        //- something
        div(:style=`{height: '300px'}`).row.full-width.q-px-md
          //- span(:style=`{fontSize: '20px'}`).text-white Something
        //- danger
        .row.full-width.q-px-md.q-py-sm
          span(:style=`{fontSize: '20px'}`).text-red Danger zone
        .row.full-width.q-px-md
          //- span.text-white Clear workpace
          q-btn(
            outline color="red" no-caps @click="wsClear()"
            )
            span.text-bold Delete my workspace
          .row.full-width.q-py-sm.q-mb-md
            //- small.text-white Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
</template>

<script>
export default {
  name: 'wsSettingList',
  data () {
    return {
    }
  },
  methods: {
    async wsClear () {
      if (!confirm('Do really want to clear your workspace?')) return
      this.$log('wsClear start')
      await this.$rxdb.clearModule('WS')
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
