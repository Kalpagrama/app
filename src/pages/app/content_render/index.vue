<template lang="pug">
div(
  v-if="content"
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-start.content-start.justify-center
  img(
    :src="content.thumbUrl"
    :style=`{
      borderRadius: '10px',
    }`
    ).full-width
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageAppContentRender',
  data () {
    return {
      content: null,
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          // this.$log('$route.params.oid TO', to)
          this.content = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    }
  },
  created () {
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', false])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', false])
  },
  beforeDestroy () {
    this.$store.commit('ui/stateSet', ['mobileNavigationShow', true])
    this.$store.commit('ui/stateSet', ['desktopNavigationShow', true])
  }
}
</script>
