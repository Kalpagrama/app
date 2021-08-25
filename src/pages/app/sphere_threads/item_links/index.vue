<template lang="pug">
div(
  v-if="itemsRes"
  :style=`{
    //- paddingBottom: '300px',
    borderTop: itemsRes.totalCount > 0 ? '2px solid rgb(50,50,50)' : 'none',
  }`
  ).row.full-width.items-start.content-start
  div(
    v-for="(l,li) in itemsRes.items"
    :style=`{
      //- borderTop: '1px solid rgb(40,40,40)',
    }`
    ).row.full-width
    type-joint(
      v-if="l.populatedObject.type === 'JOINT'"
      :oidPinned="oid"
      :joint="l.populatedObject"
      :isLast="li === itemsRes.items.length-1")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import typeJoint from './type_joint.vue'

export default {
  name: 'itemLinks',
  components: {
    typeJoint
  },
  props: ['oid'],
  data () {
    return {
      itemsRes: null,
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
    },
  },
  watch: {
    oid: {
      immediate: true,
      async handler (to, from) {
        this.$log('oid TO', to)
        this.itemsRes = await this.$rxdb.find(this.query)
        this.$emit('loaded')
        if (this.itemsRes.totalCount === 0) this.$emit('empty')
      }
    }
  },
}
</script>
