<template lang="pug">
div(
  v-if="sphere"
  :style=`{
    position: 'relative',
  }`
  ).row.full-width.items-start.content-start.justify-center.q-py-xl
  q-icon(name="blur_on" size="200px" color="white")
  .row.full-width.justify-center.q-py-lg
    span(:style=`{
      fontSize: '30px',
    }`).text-white.text-bold {{ sphere.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageAppSphereRender',
  data () {
    return {
      sphere: null,
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          // this.$log('$route.params.oid TO', to)
          this.sphere = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
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
