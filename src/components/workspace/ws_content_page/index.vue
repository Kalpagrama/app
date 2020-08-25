<template lang="pug">
ws-content-explorer(
  v-if="content"
  mode="picker"
  :value="content"
  :style=`{height: $q.screen.height+'px', minHeight: $q.screen.height+'px',}`
  @close="$router.back()")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsContentPage',
  data () {
    return {
      content: null,
    }
  },
  async mounted () {
    this.$log('mounted', this.$route.params.id)
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
    let {items: [item]} = await this.$rxdb.find({
      selector: {
        rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
        id: this.$route.params.id
      }
    })
    this.$log('item', item)
    this.content = item
  },
  beforeDestroy () {
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
  }
}
</script>
