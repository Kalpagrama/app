<template lang="pug">
list-feed(
  :query="query")
  template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
    node-feed(
      :node="item.populatedObject"
      :isActive="isActive"
      :isVisible="isVisible")
//- kalpa-loader(
  :query="query" :limit="12" v-slot=`{items, next, nexting}`)
  list-middle(
    :items="items"
    :itemStyles=`{marginBottom: '50px',}`
    :style=`{
      paddingTop: '16px',
    }`)
    q-infinite-scroll(@load="next" :offset="$q.screen.height")
    template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
      node-feed(:node="item.populatedObject" :isActive="isActive" :isVisible="isVisible" :width="width")
    template(v-slot:append)
      div(:style=`{height: '50px'}`).row.full-width.justify-center
        q-spinner-dots(v-show="nexting" color="green" size="50px")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodeFeed from 'components/node_feed/index.vue'

export default {
  name: 'user_pageProfile_tabNodes',
  components: {
    nodeFeed,
  },
  props: ['user'],
  data () {
    return {
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          // objectTypeEnum: { $in: ['NODE', 'JOINT'] },
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.user.oid,
          oidAuthor: {$eq: this.user.oid},
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  }
}
</script>
