<template lang="pug">
div(
  :style=`{paddingLeft: '40px',}`
  ).row.fit.items-start.content-start.q-mb-lg
  //- small.text-white {{ chain }}
  //- .row.full-width.br
  //-   small.text-white {{ chainFull }}
  div(
    v-if="nodeFull"
    :style=`{borderRadius: '10px', overflow: 'hidden',}`
    ).row.full-width.items-start.content-start.b-50
    img(
      :src="nodeFull.items[0].thumbUrl"
      :style=`{borderRadius: '10px', overflow: 'hidden',}`).full-width
    .row.full-width.q-pa-sm
      span.text-white.text-bold {{ nodeFull.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'chainItem',
  props: ['nodeOid', 'chain'],
  data () {
    return {
      chainFull: null,
      nodeFull: null,
    }
  },
  computed: {
    node () {
      if (this.nodeOid && this.chainFull) {
        if (this.chainFull.links[0].leftItem.oid === this.nodeOid) return this.chainFull.links[0].rightItem
        else return this.chainFull.links[0].leftItem
      }
      else {
        return null
      }
    }
  },
  watch: {
    node: {
      async handler (to, from) {
        this.$log('node TO', to)
        if (to) {
          this.nodeFull = await this.$rxdb.get(RxCollectionEnum.OBJ, to.oid)
        }
      }
    }
  },
  async mounted () {
    this.$log('mounted')
    this.chainFull = await this.$rxdb.get(RxCollectionEnum.OBJ, this.chain.oid)
  }
}
</script>
