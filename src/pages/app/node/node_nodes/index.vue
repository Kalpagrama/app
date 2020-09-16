<template lang="pug">
kalpa-loader(:mangoQuery="queryBySphere" @items="nodesLoaded")
  template(v-slot=`{items,next}`)
    list-middle(:items="items" :itemStyles=`{marginBottom: '0px',}`)
      q-infinite-scroll(@load="next" :offset="250")
      template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
        joint-item(
          :joint="item" :node="node"
          :isActive="isActive" :isVisible="isVisible")
</template>

<script>
import { NodeApi } from 'src/api/node'
import { RxCollectionEnum } from 'src/system/rxdb'

import jointItem from './joint_item.vue'

export default {
  name: 'pageApp__node__nodeNodes',
  components: {jointItem},
  props: ['node'],
  data () {
    return {
    }
  },
  computed: {
    queryBySphere () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_JOINTS,
          oidSphere: this.node.sphereFromName.oid,
          // isEmojiJoint: true
        },
      }
    },
    queryByChains () {
      return {}
    },
    queryByNode () {
      return {}
    }
  },
  methods: {
    nodesLoaded (nodes) {
      this.$log('nodesLoaded', nodes)
      if (nodes.length > 0) this.$emit('nodesLoaded')
    }
  }
}
</script>
