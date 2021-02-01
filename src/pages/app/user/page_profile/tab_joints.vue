<template lang="pug">
list-feed(
  :query="query")
  template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
    node-feed(
      :node="item.populatedObject"
      :isActive="isActive"
      :isVisible="isVisible")
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
