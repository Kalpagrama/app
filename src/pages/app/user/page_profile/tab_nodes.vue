<template lang="pug">
kalpa-loader(
  :query="query" :limit="12" v-slot=`{items, next, nexting}`)
  list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
    q-infinite-scroll(@load="next" :offset="$q.screen.height")
    template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
      node-feed(:node="item" :isActive="isActive" :isVisible="isVisible" :width="width")
    template(v-slot:append)
      div(:style=`{height: '50px'}`).row.full-width.justify-center
        q-spinner-dots(v-show="nexting" color="green" size="50px")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'user_pageProfile_tabNodes',
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
          objectTypeEnum: { $in: ['NODE', 'JOINT'] },
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
