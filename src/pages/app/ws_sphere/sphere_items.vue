<style lang="sass" scoped>
.sphere-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
q-page(
  :style=`{paddingTop: '20px', paddingBottom: '400px'}`
  ).row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
      kalpa-loader(:mangoQuery="mangoQuery" :sliceSize="1000")
        template(v-slot=`{items}`)
          masonry(
            :cols="$q.screen.width < 800 ? Math.round($q.screen.width/200) : 4"
            :gutter="{default: 10}")
            div(
              v-for="(i,ii) in items" :key="i.id"
              @click="itemSelected = i.oid"
              :style=`{
                position: 'relative',
                borderRadius: '10px', overflow: 'hidden',
              }`
              ).row.full-width.items-start.content-start.b-40.q-mb-sm
              //- default header
              div(
                :style=`{position: 'relative', zIndex: 100, borderRadius: '10px', overflow: 'hidden',}`
                ).row.full-width.items-start.content-start.b-40.sphere-item
                q-icon(
                  :name="itemIcon(i)" color="grey-4" size="24px"
                  :style=`{position: 'absolute', zIndex: 200, top: '8px', left: '8px'}`).q-mr-sm
                img(
                  :src="i.thumbOid" draggable="false"
                  :style=`{borderRadius: '10px', overflow: 'hidden'}`
                  ).full-width
                .row.full-width.q-pa-sm
                  small.text-white {{ i.name }}
              //- selected
              div(
                v-if="itemSelected === i.oid"
                :style=`{
                  position: 'relative', zIndex: 90,
                  marginTop: '-10px', paddingTop: '10px',
                }`
                ).row.full-width.items-center.content-center.bg-green
                q-btn(round flat dense color="green-8" icon="delete_outline" @click="itemDelete(i,ii)")
                .col
                q-btn(round flat dense color="white" icon="launch" @click="itemLaunch(i,ii)")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsSphere_items',
  props: ['sphere'],
  data () {
    return {
      itemSelected: null,
    }
  },
  computed: {
    mangoQuery () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.WS_ANY,
          spheres: {$elemMatch: {$eq: this.sphere.id}}
        }
      }
      // if (this.searchString.length > 0) {
      //   let nameRegExp = new RegExp(this.searchString, 'i')
      //   res.selector.name = {$regex: nameRegExp}
      // }
      return res
    },
  },
  methods: {
    sphereItems (items) {
    },
    itemLaunch (item) {
      this.$log('itemLaunch', item)
      if (item.type === 'NODE') {
        this.$router.push(`/node/${item.oid}`).catch(e => e)
      }
      else {
        this.$q.notify({type: 'negative', position: 'top', message: 'Not supported :('})
      }
    },
    itemDelete (item, itemIndex) {
      this.$log('itemDelete', item, itemIndex)
      // go find all the items and kill this sphere...?
      // if (!confirm('Delete item?')) return
      // this.$delete(this.sphere.items, itemIndex)
    },
    itemIcon (item) {
      if (item.wsItemType) {
        if (item.wsItemType === 'WS_CONTENT') return 'select_all'
        else if (item.wsItemType === 'WS_NODE') return 'filter_tilt_shift'
      }
      else {
        return ''
      }
    }
  }
}
</script>
