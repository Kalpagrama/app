<template lang="pug">
div(
  :style=`{
    height: height+'px',
  }`
  ).column.full-width
  //- group before
  //- .row.full-width.justify-center
    div(
      :style=`{
        maxWidth: 600+'px',
      }`
      ).row.full-width.q-pa-xs
      q-btn(
        @click="prev()"
        outline dense color="white" no-caps).q-mr-sm Prev
      q-btn(
        @click="drop()"
        outline dense color="red" no-caps).q-mr-sm Drop
      q-btn(
        @click="next()"
        outline dense color="white" no-caps).q-mr-sm Next
  .col.full-width.scroll
    .row.full-width.items-start.content-start.justify-center
      list-feed(
        ref="list-feed"
        :query="query"
        :positionSaving="false"
        :style=`{
          maxWidth: 600+'px',
          marginBottom: '300px',
        }`
        @ready="listFeedReady")
        //- template(v-slot:prepend)
        template(v-slot:item=`{item: group,itemIndex,isActive,isVisible}`)
          //- group
          div(
            :style=`{
              background: 'rgb(35,35,35, 0.8)',
              borderRadius: '20px',
            }`
            ).row.full-width.items-start.content-start.q-pb-sm.q-mb-sm
            //- group header
            .row.full-width.q-py-sm.q-px-md
              div().row.full-width
                span.text-white.text-bold {{group.name}}
            .row.full-width
              //- prev
              .row.full-width.q-px-sm
                q-btn(
                  v-if="group.hasPrev"
                  @click="group.prev()"
                  flat no-caps dense color="grey-6"
                  ).full-width Наверх
              //- items
              group-item(
                v-for="(item,itemIndex) in group.items" :key="item.oid"
                :item="item.populatedObject"
                :player="player"
                :contentKalpa="contentKalpa"
                :isSelected="itemSelectedOid === item.oid"
                @set-current="setCurrentItem(item)"
                @set-selected="setSelectedItem(item)").q-mb-xs
              //- next
              .row.full-width.q-px-sm
                q-btn(
                  v-if="group.hasNext"
                  @click="group.next()"
                  flat no-caps dense color="grey-6"
                  align="left"
                  :style=`{
                    paddingLeft: '12px'
                  }`
                  ).full-width Еще {{ group.totalCount-group.items.length }}
        template(v-slot:append)
          //- group after
          //- div().row.full-width.q-pa-xs
            q-btn(
              @click="prev()"
              outline dense color="white" no-caps).q-mr-sm Prev
            q-btn(
              @click="drop()"
              outline dense color="red" no-caps).q-mr-sm Drop
            q-btn(
              @click="next()"
              outline dense color="white" no-caps).q-mr-sm Next
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import groupItem from './group_item.vue'

export default {
  name: 'pageNodes',
  props: ['player', 'contentKalpa', 'height'],
  components: {
    groupItem,
  },
  data () {
    return {
      // itemsRes: null,
      itemSelectedOid: null,
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE', 'JOINT'] },
          // objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.contentKalpa.oid,
          sortStrategy: 'AGE',
          groupByContentLocation: true
        },
        populateObjects: true,
      }
      return res
    }
  },
  methods: {
    async prev () {
      this.$log('prev')
      let itemsRes = this.$refs['list-feed'].itemsRes
      if (itemsRes && itemsRes.hasPrev) {
        await itemsRes.prev()
      }
    },
    async next () {
      this.$log('next!')
      let itemsRes = this.$refs['list-feed'].itemsRes
      if (itemsRes && itemsRes.hasNext) {
        await itemsRes.next()
      }
    },
    async drop () {
      this.$log('drop')
      // this.itemsRes.setProperty('currentId', null)
      let itemsRes = this.$refs['list-feed'].itemsRes
      await itemsRes.gotoStart()
    },
    async setCurrentItem (item) {
      this.$log('setCurrentItem', item.oid)
      let listFeedRef = this.$refs['list-feed']
      if (listFeedRef) {
        let itemsRes = listFeedRef.itemsRes
        if (itemsRes) {
          itemsRes.setProperty('currentId', item.oid)
          await itemsRes.gotoCurrent()
        }
      }
    },
    async setSelectedItem (item) {
      this.$log('setSelected', item.oid)
      this.itemSelectedOid = item.oid
      await this.player.showItem(item)
    },
    async listFeedReady () {
      this.$log('listFeedReady')
      let nodeOid = this.$store.state.ui.nodeOnContent
      if (nodeOid) {
        await this.setCurrentItem({oid: nodeOid})
        await this.setSelectedItem({oid: nodeOid})
        this.$store.commit('ui/stateSet', ['nodeOnContent', null])
      }
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
