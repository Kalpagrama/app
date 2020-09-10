<template lang="pug">
q-page.row.full-width.items-start.content-start.justify-center
  kalpa-loader(:mangoQuery="querySpheres" :sliceSize="1000" v-slot=`{items,next}`)
    .row.full-width.items-start.content-start.q-pa-sm
      ws-content-item(
        v-for="(i,ii) in items" :key="i.id"
        :content="i"
        @clicked="$emit('item', i)").full-width.q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeLinker_withContent',
  props: ['searchString'],
  data () {
    return {
    }
  },
  computed: {
    querySpheres () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
          type: 'CONTENT'
        }
      }
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
  },
  methods: {
  }
}
</script>
