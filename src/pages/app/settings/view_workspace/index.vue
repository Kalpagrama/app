<template lang="pug">
q-page
  .row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px',}`).row.full-width.items-start.content-start
      //- h1.text-white Workspace
      //- something
      div(:style=`{height: '200px'}`).row.full-width.q-px-md
      //- other
      .row.full-width.q-py-sm
        q-toggle(
          v-model="nodePreparation"
          label="Разлагать сохраненные ядра на косточки?"
          color="white").full-width.text-white
      .row.full-width.q-py-sm
        q-toggle(
          v-model="nodePreparation"
          label="Включить поиск по сферам"
          color="white").full-width.text-white
      //- danger zone
      .row.full-width.q-pa-sm
        q-btn(
          color="red" no-caps @click="wsClear()")
          span.text-bold {{$t('Delete my workspace')}}
</template>

<script>
import { WorkspaceApi } from 'src/api/workspace'

export default {
  name: 'pageApp_settings_viewWorkspace',
  methods: {
    async wsClear () {
      if (!confirm(this.$t('confirm_ws_delete', 'Удалить мастерскую? Потеряешь все ядра...'))) return
      this.$log('wsClear start')
      let wsClear = await WorkspaceApi.wsClear()
      this.$log('wsClear done', wsClear)
    },
    wsExport () {
      this.$log('wsExport')
    }
  }
}
</script>
