<style lang="sass" scoped>
.sphere-item
  cursor: pointer
  &:hover
    background: rgb(50,50,50) !important
</style>

<template lang="pug">
.row.full-width.justify-center.items-start.content-start
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start
    .row.full-width.q-px-sm
      div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
        q-input(
          v-model="searchString"
          filled dark dense color="grey-6"
          placeholder="Поиск"
          ).full-width
    .row.full-width.items-start.content-start.q-pt-sm
      kalpa-loader(
        :immediate="true"
        :query="mangoQuery" :limit="1000")
        template(v-slot=`{items}`)
          masonry(
            :cols="$q.screen.width < 800 ? 2 : 4"
            :gutter="{default: 10}").full-width.q-pr-sm
            div(
              :style=`{
                position: 'relative',
                height: 0, paddingBottom: '100%',
              }`
              ).row.full-width
              q-btn(
                round flat color="green" icon="add" size="lg"
                :style=`{
                  position: 'absolute', zIndex: 100,
                  borderRadius: '10px', overflow: 'hidden',
                }`
                ).row.fit.items-center.content-center.justify-center.b-40
            div(
              v-for="(i,ii) in items" :key="i.id"
              :style=`{
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
              ws-content-item(
                v-if="i.wsItemType === 'WS_CONTENT'" :content="i"
                @clicked="itemSelected = i.id")
                template(v-slot:footer)
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
              //- bookmark
              div(
                v-if="i.wsItemType === 'WS_BOOKMARK'"
                :style=`{borderRadius: '10px'}`
                ).row.full-width.b-40
                ws-content-item(
                  v-if="i.type === 'CONTENT'" :content="i"
                  @clicked="itemSelected = i.id")
                  template(v-slot:footer)
                    div(
                      v-if="itemSelected === i.id"
                      :style=`{marginTop: '-10px', paddingTop: '14px', borderRadius: '0 0 10px 10px'}`
                      ).row.full-width.bg-green.q-px-xs.q-pb-xs
                      q-btn(round flat dense color="green-8" icon="delete_outline" @click="itemDelete(i,ii)")
                      .col
                      q-btn(round flat dense color="white" icon="launch" @click="itemLaunch(i,ii)")
                ws-node-item(
                  v-else-if="i.type === 'NODE'" :node="{name: i.name, oid: i.oid, items: [{thumbUrl: i.thumbUrl}]}"
                  @clicked="itemSelected = i.id")
                  template(v-slot:footer)
                    div(
                      v-if="itemSelected === i.id"
                      :style=`{marginTop: '-10px', paddingTop: '14px', borderRadius: '0 0 10px 10px'}`
                      ).row.full-width.bg-green.q-px-xs.q-pb-xs
                      q-btn(round flat dense color="green-8" icon="delete_outline" @click="itemDelete(i,ii)")
                      .col
                      q-btn(round flat dense color="white" icon="launch" @click="itemLaunch(i,ii)")
                div(
                  v-else
                  ).row.full-width
                  span.text-white {{i.name}}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_wsSphere_items',
  components: {},
  props: ['sphere'],
  data () {
    return {
      searchString: '',
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
        else if (item.wsItemType === 'WS_BOOKMARK') {
          if (item.type === 'NODE') this.$router.push(`/node/${item.oid}`)
          else if (item.type === 'CONTENT') this.$router.push(`/content/${item.oid}`)
          else if (item.type === 'USER') this.$router.push(`/user/${item.oid}`)
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
          else if (item.type === 'CONTENT') return 'select_all'
          // else if (item)
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
