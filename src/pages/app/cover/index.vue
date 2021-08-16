<template lang="pug">
kalpa-layout()
  template(v-slot:body)
    .row.full-width.justify-center.q-pa-sm
      item-card(
        v-if="contentKalpa"
        :item="contentKalpa"
)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import itemCard from 'src/components/kalpa_item/item_card/index.vue'

export default {
  name: 'pageApp_content',
  props: ['oid'],
  components: {
    itemCard,
  },
  data () {
    return {
      contentKalpa: null,
    }
  },
  watch: {
    oid: {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('oid TO', to)
        if (to) {
          this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
  computed: {
  },
  created () {
    this.$log('created')
  },
  mounted () {
    this.$log('mounted', this.oid)
  },
  async beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
