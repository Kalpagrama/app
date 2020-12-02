<template lang="pug">
kalpa-loader(
  :query="query" :limit="12" v-slot=`{items, next, nexting}`)
  list-middle(
    :items="items"
    :itemStyles=`{marginBottom: '50px',}`
    :style=`{
      paddingTop: '16px',
    }`)
    q-infinite-scroll(@load="next" :offset="$q.screen.height")
    template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
      node-feed(:node="item" :isActive="isActive" :isVisible="isVisible" :width="width")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'userExplorer_userVotes',
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
          oidAuthor: {$ne: this.user.oid},
          oidSphere: this.user.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  }
}
</script>
