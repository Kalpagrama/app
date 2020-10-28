<style lang="sass" scoped>
.sphere-item
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
.column.full-width.b-30
  .row.full-width
    slot(name="header")
    .row.full-width.q-pa-md
      span.text-grey-8 Выберите сферу
  .col.full-width.scroll
    kalpa-loader(
      :immediate="true"
      :query="spheresQuery" :limit="1000" v-slot=`{items}`)
      .row.full-width.items-start.content-start.q-px-sm
        //- v-if="!selected.includes(sphere.id)"
        div(
          v-for="(sphere,ii) in items" :key="sphere.id"
          :class=`{
            'b-60': selected.includes(sphere.id),
            'b-40': !selected.includes(sphere.id),
          }`
          :style=`{
            position: 'relative',
            height: '40px',
            borderRadius: '10px',
            //- background: 'rgb(35,35,35)',
          }`
          ).row.full-width.q-mb-xs
          .col.full-height
            q-btn(
              @click="sphereClick(sphere)"
              flat color="white" dense no-caps align="left"
              ).fit.q-pl-md
              span.text-white {{ sphere.name }}
          q-btn(round flat dense color="grey-8" icon="more_horiz")
  .row.full-width
    slot(name="footer")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'sphereAutocomplete',
  props: {
    searchString: {
      type: String,
      default: ''
    },
    selected: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
    }
  },
  computed: {
    spheresQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_SPHERE}}
      // add name filter...
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    }
  },
  methods: {
    sphereClick (sphere) {
      this.$log('sphereClick', sphere)
      this.$emit('sphere', sphere)
    }
  }
}
</script>
