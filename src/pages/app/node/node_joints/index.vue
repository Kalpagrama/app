<template lang="pug">
kalpa-loader(
  :immediate="true"
  :query="queryBySphere" :limit="3" v-slot=`{items, next}`
  @reset="$refs.qis.reset(), $refs.qis.resume(), $refs.qis.poll()")
  masonry(
    :cols="2"
    :gutter="{default: 10}").full-width.q-pr-sm
    //- list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
    //- q-infinite-scroll(ref="qis" @load="next" :offset="500")
      //- template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
    joint-item(
      v-for="(item,ii) in items" :key="item.oid"
      :joint="item" :node="node"
      :isActive="false" :isVisible="false").q-mb-md
</template>

<script>
import { NodeApi } from 'src/api/node'
import { RxCollectionEnum } from 'src/system/rxdb'

import jointItem from './joint_item.vue'

export default {
  name: 'pageApp-node-nodeJoints',
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
          oidSphere: this.node.oid,
          jointItemType: {$in: ['NODE', 'WORD']}
        },
        populateObjects: true,
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
