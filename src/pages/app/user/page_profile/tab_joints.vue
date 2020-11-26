<template lang="pug">
kalpa-loader(
  :query="query" :limit="12" v-slot=`{items,next,nexting}`)
  list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
    q-infinite-scroll(ref="qis" @load="next" :offset="$q.screen.height")
    template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
      node-feed(:node="item" :isActive="isActive" :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_user_pageProfile_tabJoints',
  props: ['user'],
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidAuthor: this.user.oid,
          oidSphere: this.user.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    },
  }
}
</script>
