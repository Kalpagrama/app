<template lang="pug">
ws-content-explorer(
  v-if="contentKalpa && contentWorkspace"
  :contentWorkspace="contentWorkspace"
  :contentKalpa="contentKalpa"
  @out="outHandle")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import wsContentExplorer from 'components/ws_content_explorer/index.vue'

export default {
  name: 'pageApp_wsContent',
  components: {wsContentExplorer},
  meta () {
    return {
      title: this.contentWorkspace ? this.contentWorkspace.name : ''
    }
  },
  data () {
    return {
      contentWorkspace: null,
      contentKalpa: null,
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        if (to) {
          let item = await this.$rxdb.get(RxCollectionEnum.WS_CONTENT, to)
          // let [item] = await this.$rxdb.find({
          //   selector: {
          //     rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
          //     id: to
          //   }
          // })
          this.contentWorkspace = item
          this.$log('contentWorkspace', this.contentWorkspace)
          this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, item.contentOid)
          this.$log('contentKalpa', this.contentKalpa)
        }
      }
    }
  },
  methods: {
    outHandle ([type, val]) {
      this.$log('outHandle', type, val)
      if (type === 'back') {
        this.$router.back()
      }
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
  }
}
</script>
