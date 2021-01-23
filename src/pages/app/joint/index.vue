<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-page-container
    q-page(
      :style=`{
        paddingTop: '8px',
        paddingBottom: '400px'
      }`).row.full-width.justify-center
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
        node-feed(v-if="joint" :node="joint" :isActive="true")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_joint',
  components: {
  },
  data () {
    return {
      joint: null
    }
  },
  computed: {
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to) {
          // this.$log('$route.params.oid TO', to)
          this.joint = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
        }
      }
    },
  },
}
</script>
