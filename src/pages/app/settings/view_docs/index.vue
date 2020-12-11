<template>
<q-page class="row full-width justify-center">
  <div class="row full-width items-start content-start text-white q-pa-sm" :style="{maxWidth: $store.state.ui.pageWidth+'px'}">
    <VueShowdown
      flavor="github"
      :markdown="termsRu"
      :options="{ emoji: true }"
      style="width: 100%"/>
  </div>
</q-page>
</template>

<script>
// const termsRu = () => import('assets/terms_ru.md')
import termsRu from 'assets/terms_ru.md'

export default {
  name: 'pageApp_settings_viewDocs',
  data () {
    return {
      termsRu: termsRu
    }
  },
  computed: {
  }
}
</script>
