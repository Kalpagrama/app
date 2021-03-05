<template lang="pug">
div(
  v-if="user"
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-start.content-start.justify-center
  img(
    :src="user.thumbUrl"
    :style=`{
      borderRadius: '10px',
    }`
    ).full-width
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageAppUserRender',
  data () {
    return {
      user: null,
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          // this.$log('$route.params.oid TO', to)
          this.user = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
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
