<template lang="pug">
div(
  :style=`{
    width: '300px', height: '300px',
    borderRadius: '10px', overflow: 'hidden',
  }`).column.items-start.content-start.b-50
  //- header
  div(v-if="useSearch").row.full-width
    div(
      :style=`{
        position: 'relative', zIndex: 100,
        borderRadius: '10px', overflow: 'hidden'
      }`).row.full-width
      q-input(
        v-model="searchStringLocal"
        placeholder="Find sphere"
        :autofocus="true"
        filled dark dense color="grey-7"
        :input-style=`{paddingLeft: '15px',}`
        @keyup.enter="sphereCreate()").full-width.b-50
  //- body
  .col.full-width.scroll
    kalpa-loader(:query="spheresQuery" :limit="1000")
      template(v-slot=`{items}`)
        .row.full-width.items-start.content-start.q-pa-sm
          div(
            v-for="(s,si) in items" :key="s.id"
            v-if="!hiddenIds.includes(s.id)"
            @click="$emit('sphere', s)"
            ).row.full-width.items-center.content-center.justify-start.q-mb-xs
            q-btn(
              :class=`{
                'b-100': selectedIds.includes(s.id),
              }`
              flat icon="blur_on" align="left" no-caps
              ).full-width
              span.q-ml-sm {{s.name}}
  //- footer
  .row.full-width.q-pa-sm
    q-btn(
      v-if="searchStringLocal.length > 0"
      @click="sphereCreate()"
      flat color="green" icon="add" no-caps align="left").full-width Create sphere
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'wsSphereFinder',
  props: {
    searchString: {type: String},
    useSearch: {type: Boolean, default () { return true }},
    selectedIds: {type: Array, default () { return [] }},
    hiddenIds: {type: Array, default () { return [] }},
  },
  data () {
    return {
      searchStringLocal: ''
    }
  },
  watch: {
    searchString: {
      immediate: true,
      handler (to, from) {
        if (to) {
          this.searchStringLocal = to
        }
      }
    },
    searchStringLocal: {
      handler (to, from) {
        if (to) {
          this.$emit('searchString', to)
        }
      }
    }
  },
  computed: {
    spheresQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_SPHERE}}
      if (this.searchStringLocal.length > 0) {
        let nameRegExp = new RegExp(this.searchStringLocal, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      // selector: props, import selector from props...
      return res
    }
  },
  methods: {
    async sphereCreate () {
      return new Promise(async (resolve, reject) => {
        this.$log('sphereCreate')
        if (this.searchStringLocal.length > 0) {
          let sphereInput = {
            wsItemType: 'WS_SPHERE',
            name: this.searchStringLocal,
            spheres: [],
          }
          let sphere = await this.$rxdb.set(RxCollectionEnum.WS_SPHERE, sphereInput)
          this.$emit('sphere', sphere)
          resolve(sphere)
        }
        else {
          resolve(null)
        }
      })
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
