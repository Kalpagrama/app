<template lang="pug">
kalpa-loader(:mangoQuery="query" :sliceSize="1000")
  template(v-slot=`{items, itemsMore}`)
    .row.full-width.items-start.content-start.justify-center.q-px-sm
      div(
        v-for="(n,ni) in items" :key="n.id"
        :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
        ).row.full-width.items-center.content-center.b-50.q-mb-sm
        img(
          :src="n.meta.items[0].thumbUrl"
          :style=`{height: '60px', borderRadius: '10px', overflow: 'hidden'}`
          )
        .col.full-height
          .row.fit.items-center.content-center.q-pa-md
            span(:style=`{userSelect: 'none'}`).text-white {{ n.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsNodes_nodesPublished',
  props: ['searchString'],
  data () {
    return {
    }
  },
  computed: {
    sphereOid () {
      return this.$store.getters.currentUser().oid
    },
    mangoQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.sphereOid,
          oidAuthor: {$eq: this.sphereOid},
          sortStrategy: 'AGE',
        }
      }
      // name
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    }
  }
}
</script>
