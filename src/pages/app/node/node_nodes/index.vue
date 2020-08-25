<template lang="pug">
kalpa-loader(:mangoQuery="queryBySphere")
  template(v-slot=`{items,itemsMore}`)
    list-masonry(:items="items" :itemsHidden="[node.oid]").q-pt-md
      template(v-slot:item=`{item}`)
        node-lite(:node="item")
</template>

<script>
import { NodeApi } from 'src/api/node'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp__node__nodeNodes',
  props: ['node'],
  data () {
    return {
    }
  },
  computed: {
    queryBySphere () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.node.sphereFromName.oid
        }
      }
    },
    queryByChains () {
      return {}
    },
    queryByNode () {
      return {}
    }
  }
}
</script>
