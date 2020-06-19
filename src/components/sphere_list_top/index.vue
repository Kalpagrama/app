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
        v-for="(c,ci) in categories" :key="c.oid" @click="$emit('oid', c.oid)"
        :class=`{
          'b-100': oid === c.oid
        }`
        :style=`{height: '40px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
        ).row.full-width.items-center.q-px-md.cursor-pointer.sphere-item
        span(:style=`{userSelect: 'none', textTransform: 'capitalize'}`).text-white {{'# '+c.name}}
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
  computed: {
    categories () {
      return this.nodeCategories.reduce((acc, val) => {
        if (val.type !== 'ALL') {
          acc.push({
            oid: val.sphere.oid,
            name: val.sphere.name
          })
        }
        return acc
      }, [])
    }
  },
  async beforeCreate () {
    this.$log('beforeCreate')
    this.nodeCategories = await this.$rxdb.get(RxCollectionEnum.OTHER, 'nodeCategories')
  }
}
</script>
