<template lang="pug">
.row.full-width.br
  div(
    v-if="!node"
    :style=`{
      minHeight: '200px',
      background: 'rgb(40,40,40)',
      borderRadius: '10px',
    }`
    ).row.full-width.items-center.content-center.justify-center
    q-spinner(size="50px" color="green")
  div(v-if="node")
    .row.full-width.no-wrap
      .row.br
        //q-btn(label="left").fit.text-white
        node-feed(
          :node="node"
          :showHeader="false"
          :showSpheres="false"
          :isActive="isActive"
          :isVisible="isActive"
          :showActions="false"
          )
      .row.br
        q-btn(label="rrr").text-white
        q-btn(label="rrr").text-white
        q-btn(label="rrr").text-white
        q-btn(label="rrr").text-white
    .row
      q-btn(label="asdfs").col-grow.text-white
      q-btn(label="asdf").col-1.text-white
      q-btn(label="asdf").col-1.text-white
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'typeNode',
  props: ['item', 'isActive'],
  data () {
    return {
      node: null,
    }
  },
  watch: {
    item: {
      immediate: true,
      async handler (to, from) {
        this.$log('item TO', to)
        this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, to.oid)
      }
    }
  }
}
</script>
