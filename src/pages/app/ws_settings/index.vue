<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.b-30
        div(
          v-if="true"
          :style=`{height: '50px'}`).row.full-width.items-center.content-center.justify-between.q-px-md
          span(:style=`{fontSize: '19px'}`).text-white.text-bold {{$t('wsSettings_title', 'Настройки')}}
  q-page-container
    q-page(style="padding-top: 0px")
      .row.full-width.justify-center
        div(:style=`{maxWidth: '800px', paddingBottom: '1000px',}`).row.full-width.items-start.content-start.q-px-sm
          div(
            :style=`{borderRadius: '10px', overflow: 'hidden'}`
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
import { systemReset } from 'src/system/services'

export default {
  name: 'pageApp__wsSettings',
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
