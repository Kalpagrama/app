<template lang="pug">
list-feed(
  :query="query"
  :itemStyles=`{
    paddingBottom: '70px',
  }`
  :style=`{
  }`)
  template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
    node-feed(
      :node="item.populatedObject"
      :showAuthorAlways="true"
      :isActive="isActive"
      :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageJoints',
  props: ['user'],
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: this.user.oid,
          oidAuthor: {$eq: this.user.oid},
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    },
  }
}
</script>
