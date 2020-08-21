<template lang="pug">
div(:style=`{position: 'relative'}`).column.fit
  //- header
  div(:style=`{}`).row.full-width.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-center.content-center.justify-between
      .row.full-width.items-center.q-px-md.q-pb-sm.q-pt-md
        span(:style=`{fontSize: '19px'}`).text-white.text-bold {{$t('wsSettings_title', 'Настройки')}}
  //- body
  .col.full-width.scroll
    .row.full-width.justify-center
      div(:style=`{maxWidth: '800px',}`).row.full-width.justify-center.q-px-sm.q-pt-sm
        div(
          :style=`{borderRadius: $store.state.ui.borderRadius+'px'}`
          ).row.full-width.items-start.content-start.b-50
          //- something
          div(:style=`{height: '300px'}`).row.full-width.q-px-md
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
              span.text-bold {{$t('delete_my_workspace', 'Удалить мою мастерскую')}}
</template>

<script>
import { WorkspaceApi } from 'src/api/workspace'

export default {
  name: 'wsSettings',
  data () {
    return {
      nodePreparation: false,
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
