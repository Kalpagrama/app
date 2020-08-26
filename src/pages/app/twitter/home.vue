<template lang="pug">
div(
  :style=`{
    maxWidth: '800px',
    borderRight: '1px solid rgb(40,40,40)',
    borderLeft: '1px solid rgb(40,40,40)',
  }`
  ).row.full-width.items-start.content-start
  kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
    template(v-slot=`{items,itemsMore}`)
      list-middle(:items="items" :more="itemsMore" :itemStyles=`{marginBottom: '0px',}`)
        template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
          node-item(:node="item" :isActive="isActive" :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeItem from './node_item.vue'

export default {
  name: 'pageApp__twitter__home',
  components: {nodeItem},
  data () {
    return {
      nodeCategories: [],
      category: null,
    }
  },
  computed: {
    sphereOid () {
      return this.category?.sphere.oid
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.sphereOid
        }
      }
    }
  },
  watch: {
    '$route.params.oid': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
        if (this.nodeCategories.length === 0) this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.GQL_QUERY, 'nodeCategories')
        this.category = this.nodeCategories.find(c => c.type === 'FUN')
      }
    }
  }
}
</script>
