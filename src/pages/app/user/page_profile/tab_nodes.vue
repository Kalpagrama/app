<template lang="pug">
//- div(
  :style=`{
    position: 'relative',
    width: '500px',
    height: '500px',
  }`
  ).column
  .col.full-width.scroll
    list-feed(
      :query="query")
      template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
        node-feed(
          :node="item.populatedObject"
          :isActive="isActive"
          :isVisible="isVisible")
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
  name: 'user_pageProfile_tabNodes',
  components: {
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
