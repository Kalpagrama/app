<template lang="pug">
component(
  v-if="contentKalpa"
  :is="explorerComponent[contentKalpa.type]"
  :contentKalpa="contentKalpa"
  :query="query")
  template(v-slot:header)
    slot(name="header")
  template(v-if="$scopedSlots.nodeAction" v-slot:nodeAction=`{node}`)
    slot(name="nodeAction" :node="node")
  template(v-if="$scopedSlots.nodeActionMine" v-slot:nodeActionMine=`{node}`)
    slot(name="nodeActionMine" :node="node")
  template(v-if="$scopedSlots.nodeActionAll" v-slot:nodeActionAll=`{node}`)
    slot(name="nodeActionAll" :node="node")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import explorerVideo from './explorer_video/index.vue'
import explorerImage from './explorer_image/index.vue'
// import explorerBook from './explorer_book/index.vue'
// import explorerWeb from './explorer_web/index.vue'

export default {
  name: 'contentExplorer',
  components: {explorerVideo, explorerImage},
  props: ['oid', 'query'],
  provide () {
    if (this.query && this.query.pick && this.query.id) {
      return {
        pick: (item) => {
          this.$log('pick !!!', this.query.pick, this.query.id)
          // save to vuex item.value
          this.$store.commit('ui/stateSet', ['editorItem', JSON.parse(JSON.stringify(item))])
          // go to the node...
          this.$router.replace(`/workspace/${this.query.pick}/${this.query.id}`)
        }
      }
    }
    else {
      return {
        pick: null
      }
    }
  },
  data () {
    return {
      contentKalpa: null,
      explorerComponent: {
        VIDEO: 'explorer-video',
        IMAGE: 'explorer-image',
        BOOK: 'explorer-book',
        WEB: 'explorer-web',
      }
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
