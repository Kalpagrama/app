<template lang="pug">
q-page.row.full-width.items-start.content-start.justify-center
  kalpa-loader(:query="querySpheres" :limit="1000" v-slot=`{items,next}`)
    .row.full-width.items-start.content-start.q-pa-sm
      div(v-for="(s,si) in items" :key="i").row.q-mb-xs.q-mr-xs
        ws-sphere-item(
          @clicked="sphereClick(s)"
          :id="s.id"
          :style=`{
            borderRadius: '10px', overflow: 'hidden'
          }`
          ).b-40
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'nodeLinker_withSphere',
  data () {
    return {
      searchStringSphere: '',
    }
  },
  computed: {
    querySpheres () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_SPHERE
        }
      }
      if (this.searchStringSphere.length > 0) {
        let nameRegExp = new RegExp(this.searchStringSphere, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
  },
  methods: {
    sphereClick (sphere) {
      this.$log('sphereClick', sphere)
      this.$emit('item', sphere)
    }
  }
}
</script>
