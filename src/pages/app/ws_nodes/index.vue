<template lang="pug">
q-layout(
  view="hHh Lpr lff").b-30
  q-page-container
    page()
      template(v-slot:tint=`{item, itemKey}`)
        slot(name="tint" :item="item" :itemKey="itemKey")
</template>

<script>
import assert from 'assert'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNodes',
  props: {
  },
  components: {
    page: () => import('./page.vue'),
  },
  data () {
    return {
    }
  },
  watch: {
  },
  computed: {
  },
  methods: {
  }
}
</script>
