<style lang="sass">
a
  color: rgb(76,175,79)
  font-weight: bold
</style>

<template>
  <q-page class="row full-width justify-center">
    <div
      class="row full-width items-start content-start text-white q-pa-sm"
      :style="{maxWidth: $store.state.ui.pageWidth+'px'}">
      <q-expansion-item
        v-for="(d,di) in docsFiltered" :key="di"
        expand-separator
        :label="d.name"
        :style="{width: '100%',}" >
        <VueShowdown
          flavor="github"
          :markdown="docs[d.doc]"
          :options="{ emoji: true }"
          :style="{width: '100%',}" />
      </q-expansion-item>
    </div>
  </q-page>
</template>

<script>
import termsRu from 'assets/docs/terms_ru.md'
import dmcaRu from 'assets/docs/dmca_ru.md'
import policyRu from 'assets/docs/policy_ru.md'

export default {
  name: 'pageApp_settings_viewDocs',
  data () {
    return {
      docs: {
        termsRu,
        dmcaRu,
        policyRu,
      }
    }
  },
  computed: {
    docsFiltered () {
      return [
        {name: 'Пользовательское соглашение', doc: 'termsRu'},
        {name: 'DMCA (Регламент рассмотрения заявлений правообладателей)', doc: 'dmcaRu'},
        {name: 'Политика конфиденциальности Kalpagrama', doc: 'policyRu'},
      ].filter(d => {
        // TODO: check lang and ?
        return true
      })
    }
  }
}
</script>
