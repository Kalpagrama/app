<template lang="pug">
list-feed(
  :query="query"
  :itemStyles=`{
    //- paddingBottom: '70px',
  }`
  :style=`{
    //- maxWidth: $store.state.ui.pageWidth+'px',
  }`)
  template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
    joint-item(
      :joint="item.populatedObject"
      :oid="oid"
      @open="$emit('joint', j)")
  template(v-slot:empty)
    div(
      :style=`{
        marginTop: '100px',
      }`
      ).row.full-width.justify-center
      span.text-grey-6 Связей пока нет
      .row.full-width.justify-center.q-py-md
        q-btn(
          @click="$emit('create')"
          color="green" outline no-caps size="lg")
          span Добавить связь
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import jointItem from './joint_item.vue'

export default {
  name: 'jointsGallery',
  props: ['oid'],
  components: {
    jointItem,
  },
  data () {
    return {
    }
  },
  computed: {
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['JOINT'] },
          oidSphere: this.oid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  },
  methods: {
  }
}
</script>
