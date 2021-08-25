<template lang="pug">
list-feed(
  :query="query"
  :itemStyles=`{
    paddingBottom: '50px',
  }`)
  template(v-slot:prepend)
    slot(name="prepend")
  template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
    item-feed(
      :item="item.populatedObject"
      :showAuthorAlways="true"
      :isActive="isActive"
      :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageBlocks',
  props: ['user'],
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['BLOCK'] },
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
