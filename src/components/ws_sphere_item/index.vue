<style lang="sass" scoped>
.sphere-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50)
</style>

<template lang="pug">
div().row
  slot(name="prepend")
  div(
    v-if="sphere"
    @click="$emit('clicked', sphere)"
    :style=`{
      borderRadius: '10px', overflow: 'hidden',
      height: '40px',
    }`
    ).row.items-center.content-center.q-pa-sm.b-40.sphere-item
    q-icon(name="blur_on" color="white" size="20px").q-mr-xs
    span.text-white {{ sphere.name }}
  slot(name="append")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsSphereItem',
  props: {
    id: {
      type: String,
      required: true,
    }
  },
  data () {
    return {
      sphere: null,
    }
  },
  watch: {
    id: {
      immediate: true,
      async handler (to, from) {
        this.$log('id TO', to)
        let {items: [sphere]} = await this.$rxdb.find({
          selector: {
            rxCollectionEnum: RxCollectionEnum.WS_SPHERE,
            id: to
          }
        })
        if (sphere) {
          this.sphere = sphere
        }
      }
    }
  }
}
</script>
