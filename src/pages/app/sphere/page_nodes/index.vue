<template lang="pug">
list-feed(
  :query="query"
  :itemStyles=`{
    paddingBottom: '50px',
  }`)
  template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
    item-feed(
      :item="item.populatedObject"
      :isActive="isActive"
      :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp__sphere__pageNodes',
  props: ['sphere'],
  components: {
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.sphere.oid
        },
        populateObjects: true,
      }
    }
  }
}
</script>
