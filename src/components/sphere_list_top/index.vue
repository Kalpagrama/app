<style lang="sass">
.sphere-item
  &:hover
    background: rgb(70,70,70)
</style>

<template lang="pug">
.column.fit
  .col.full-width.scroll
    .row.full-width.items-start.content-start
      div(
        v-for="(c,ci) in nodeCategories" :key="c.sphere.oid" @click="$emit('oid', c.sphere.oid)"
        :class=`{
          'b-100': oid === c.sphere.oid
        }`
        :style=`{height: '40px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
        ).row.full-width.items-center.q-px-md.cursor-pointer.sphere-item
        span(:style=`{userSelect: 'none'}`).text-white {{'🔆 '+ c.alias}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'sphereListTop',
  data () {
    return {
      nodeCategories: []
    }
  },
  props: ['oid'],
  // computed: {
  //   categories () {
  //     return this.nodeCategories.reduce((acc, val) => {
  //       if (val.type !== 'ALL') {
  //         acc.push({
  //           oid: val.sphere.oid,
  //           name: val.sphere.name // val.alias ???
  //         })
  //       }
  //       return acc
  //     }, [])
  //   }
  // },
  async beforeCreate () {
    this.$log('beforeCreate')
    this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.OTHER, 'nodeCategories')
  }
}
</script>
