<template lang="pug">
div(
  :style=`{
    height: height+'px',
  }`
  ).column.full-width.bg
  .col.full-width.scroll
    div(
      v-if="itemsRes"
      ).row.full-width.items-start.content-start
      div(
        v-for="(i,ii) in itemsRes.items" :key="ii"
        ).row.full-width.br.q-mb-md
        small.text-white {{ i }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageNodes',
  props: ['player', 'contentKalpa', 'height'],
  data () {
    return {
      itemsRes: null,
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'JOINT'] },
          oidSphere: this.contentKalpa.oid,
          sortStrategy: 'AGE',
          groupByContentLocation: true
        },
        populateObjects: true,
      }
      return res
    }
  },
  async mounted () {
    this.$log('mounted')
    this.itemsRes = await this.$rxdb.find(this.query, true)
  }
}
</script>
