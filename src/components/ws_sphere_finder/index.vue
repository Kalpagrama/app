<template lang="pug">
div(
    :style=`{
      width: '300px', height: '300px',
      borderRadius: '10px', overflow: 'hidden',
    }`).column.items-start.content-start.b-50
    //- header
    //- .row.full-width
      div(
        :style=`{
          position: 'relative', zIndex: 100,
          borderRadius: '10px', overflow: 'hidden'
        }`).row.full-width
        q-input(
          v-model="searchString"
          placeholder="Find sphere"
          filled dark dense color="grey-7"
          :input-style=`{paddingLeft: '15px',}`).full-width.b-50
    //- body
    .col.full-width.scroll
      kalpa-loader(:mangoQuery="spheresQuery" :sliseSize="1000")
        template(v-slot=`{items}`)
          .row.full-width.items-start.content-start.q-pt-sm
            div(
              v-for="(s,si) in items" :key="s.id"
              @click="$emit('sphere', s)"
              ).row.full-width.items-center.content-center
              q-btn(
                flat icon="blur_on" align="start" no-caps
                ).full-width.q-pl-sm
                span.q-ml-sm {{s.name}}
    //- footer
    .row.full-width.q-pa-sm
      q-btn(
        v-if="searchString.length > 0"
        @click="sphereCreate()"
        flat color="green" icon="add" no-caps align="left").full-width Create sphere
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsSphereFinder',
  props: ['searchString'],
  data () {
    return {
      // searchString: ''
    }
  },
  computed: {
    spheresQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_SPHERE}}
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      // selector: props, import selector from props...
      return res
    }
  },
  methods: {
    async sphereCreate () {
      this.$log('sphereCreate')
      if (this.searchString.length > 0) {
        let sphereInput = {
          wsItemType: 'WS_SPHERE',
          name: this.searchString,
          items: [
            // {
            //   oid: this.node.oid,
            //   thumbOid: this.node.meta.items[0].thumbUrl,
            //   type: 'NODE',
            //   name: this.node.name
            // }
          ]
        }
        let sphere = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
        this.$emit('sphere', sphere)
        // this.searchString = ''
        // this.$refs.sphereSelectorMenu.hide()
      }
    },
  }
}
</script>
