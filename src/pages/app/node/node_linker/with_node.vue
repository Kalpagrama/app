<template lang="pug">
q-page.row.full-width.items-start.content-start.justify-center
  kalpa-loader(:mangoQuery="queryNodes" :sliceSize="1000" v-slot=`{items,next}`)
    masonry(
      :cols="$q.screen.width < 800 ? 2 : 4"
      :gutter="{default: 10}").full-width.q-pt-sm.q-pr-sm
      ws-node-item(
        v-for="(i,ii) in items" :key="i.id" :node="i"
        @clicked="nodeClicked(i)").q-mb-sm
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeLinker_withNode',
  props: ['searchString'],
  data () {
    return {
    }
  },
  computed: {
    queryNodes () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_NODE,
          stage: {$in: ['saved', 'published']}
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
    nodeClicked (node) {
      this.$log('nodeClicked', node)
      this.$emit('item', node)
    }
  }
}
</script>
