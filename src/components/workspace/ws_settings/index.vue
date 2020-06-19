<template lang="pug">
div(
  :style=`{
    position: 'relative'
  }`
  ).column.fit
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.xs ? '0 0 10px 10px' : '10px'
    }`
    ).row.full-width.items-center.content-center.b-50.q-px-sm
    .row.full-width.items-center.content-center.q-py-md
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold Settings
  //- body
  .col.full-width.scroll
    .row.full-width.justify-center.q-px-sm.q-py-md
      div(:style=`{borderRadius: $store.state.ui.borderRadius+'px'}`).row.full-width.items-start.content-start.b-50
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
            color="red" no-caps @click="wsClear()")
            span.text-bold Delete my workspace
          .row.full-width.q-py-sm.q-mb-md
            //- small.text-white Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s
</template>

<script>
import { WorkspaceApi } from 'src/api/workspace'

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
      let wsClear = await WorkspaceApi.wsClear()
      this.$log('wsClear done', wsClear)
      // window.location.reload()
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
