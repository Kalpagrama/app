<template lang="pug">
div(
  :class=`{
    'q-pt-sm': $q.screen.gt.xs,
  }`
  :style=`{
    position: 'relative'
  }`
  ).column.fit
  //- header
  div(
    :style=`{
      borderRadius: $q.screen.gt.xs ? '10px' : '0 0 10px 10px',
    }`
    ).row.full-width.items-start.content-start.b-50
    //- navigation
    div(:style=`{height: '100px',}`).row.full-width.items-center.content-center.q-px-sm
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '20px'}`).text-white.text-bold {{$t('ws_page_settings', 'Настройки')}}
  //- body
  .col.full-width.scroll
    .row.full-width.justify-center.q-py-sm
      div(
        :style=`{borderRadius: $store.state.ui.borderRadius+'px'}`
        ).row.full-width.items-start.content-start.b-50.q-pa-md
        //- something
        div(:style=`{height: '300px'}`).row.full-width.q-px-md
        //- danger zone
        .row.full-width.q-py-md
          span(:style=`{fontSize: '20px'}`).text-red {{$t('danger_zone', 'Опасная зона')}}
        .row.full-width
          q-btn(
            color="red" no-caps @click="wsClear()")
            span.text-bold {{$t('delete_my_workspace', 'Удалить мою мастерскую')}}
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
      if (!confirm(this.$t('confirm_ws_delete', 'Удалить мастерскую? Потеряешь все ядра...'))) return
      this.$log('wsClear start')
      let wsClear = await WorkspaceApi.wsClear()
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
