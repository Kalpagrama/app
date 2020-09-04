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
              :style=`{
                minWidth: '200px',
              }`
              ).q-mb-sm
              //- node
              ws-node-item(
                v-if="i.wsItemType === 'WS_NODE'" :node="i"
                @clicked="itemSelected = i.id")
                template(v-slot:footer)
                  div(
                    v-if="itemSelected === i.id"
                    :style=`{marginTop: '-10px', paddingTop: '14px', borderRadius: '0 0 10px 10px'}`
                    ).row.full-width.bg-green.q-px-xs.q-pb-xs
                    q-btn(round flat dense color="green-8" icon="delete_outline" @click="itemDelete(i,ii)")
                    .col
                    q-btn(round flat dense color="white" icon="launch" @click="itemLaunch(i,ii)")
              //- content
              div(
                v-if="i.wsItemType === 'WS_CONTENT'" :content="i"
                :style=`{
                  borderRadius: '10px', overflow: 'hidden',
                }`
                ).row.items-center.content-center.b-40
                div(
                  @click="itemSelected = i.id"
                  :style=`{
                    position: 'relative', zIndex: 100,
                    cursor: 'pointer',
                    borderRadius: '10px', overflow: 'hidden',
                  }`
                  ).row.full-width.items-center.content-center.sphere-item.b-40
                  img(
                    :src="i.thumbOid"
                    :style=`{
                      width: '40px', height: '40px',
                      borderRadius: '10px', overflow: 'hidden',
                      objectFit: 'cover'
                    }`).q-ma-md
                  .col.full-height
                    .row.fit.items-center.content-center.q-pr-sm
                      small(:style=`{userSelect: 'none'}`).text-white {{ i.name.slice(0, 100) }}
                div(
                  v-if="itemSelected === i.id"
                  :style=`{marginTop: '-10px', paddingTop: '14px', borderRadius: '0 0 10px 10px'}`
                  ).row.full-width.bg-green.q-px-xs.q-pb-xs
                  q-btn(round flat dense color="green-8" icon="delete_outline" @click="itemDelete(i,ii)")
                  .col
                  q-btn(round flat dense color="white" icon="launch" @click="itemLaunch(i,ii)")
              //- sphere
              ws-sphere-item(
                v-if="i.wsItemType === 'WS_SPHERE'" :id="i.id"
                :style=`{borderRadius: '10px',}`).b-40
            //- masonry(
              :cols="$q.screen.width < 800 ? Math.round($q.screen.width/200) : 4"
              :gutter="{default: 10}")
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
import wsNodeItem from 'components/ws_node_item/index.vue'

export default {
  name: 'pageApp_wsSphere_items',
  components: {wsNodeItem},
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
      if (item.wsItemType) {
        if (item.wsItemType === 'WS_NODE') {
          this.$router.push(`/workspace/node/${item.id}`)
        }
        else if (item.wsItemType === 'WS_CONTENT') {
          this.$router.push(`/workspace/content/${item.id}`)
        }
        else if (item.wsItemType === 'WS_SPHERE') {
          this.$router.push(`/workspace/sphere/${item.id}`)
        }
        else {
          this.$q.notify({type: 'negative', position: 'top', message: 'Not supported :('})
        }
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
        else if (item.wsItemType === 'WS_BOOKMARK') {
          if (item.type === 'NODE') return 'filter_tilt_shift'
          else return ''
        }
      }
      else {
        return ''
      }
    }
  }
}
</script>
