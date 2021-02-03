<template lang="pug">
div(
  :style=`{
    height: height+'px',
  }`
  ).column.full-width
  .col.full-width.scroll
    div(:style=`{marginBottom: '300px',}`).row.full-width.justify-center.q-px-md
      div(
        v-if="itemsRes"
        :style=`{
          //- maxWidth: $store.state.ui.pageWidth+'px',
          maxWidth: 600+'px',
        }`
        ).row.full-width.items-start.content-start.q-pt-sm
        //- group before
        .row.full-width.q-pa-xs
          q-btn(
            @click="prev()"
            outline dense color="white" no-caps).q-mr-sm Prev
          q-btn(
            @click="drop()"
            outline dense color="red" no-caps).q-mr-sm Drop
        //- group
        div(
          v-for="(group,groupIndex) in itemsRes.items" :key="groupIndex"
          :style=`{
            background: 'rgb(35,35,35, 0.5)',
            borderRadius: '20px',
          }`
          ).row.full-width.q-pb-sm.q-mb-sm
          //- group header
          .row.full-width.q-py-sm.q-px-md
            div(
              v-if="contentKalpa.type === 'VIDEO'"
              ).row.full-width
              div(
                v-if="group.figuresAbsolute.length"
                ).row.full-width.q-pa-sm
                .row.full-height.items-center.content-center
                  span.text-white.text-bold {{group.figuresAbsolute.length ? $time(group.figuresAbsolute[0].t) + '–' : 'весь контент' }}
                  span.text-white.text-bold {{ group.figuresAbsolute.length > 1 ? $time(group.figuresAbsolute[1].t) : '' }}
                .col
                span.text-white.text-bold {{ group.totalCount }}
            div(
              v-else
              ).row.full-width
              span.text-white Группа: {{groupIndex+1}}
          .row.full-width
            //- prev
            .row.full-width.q-px-sm
              q-btn(
                v-if="group.hasPrev"
                @click="group.prev()"
                flat no-caps dense color="grey-6"
                ).full-width Up
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
        //- group after
        div().row.full-width.q-pa-xs
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
      itemsRes: null,
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
      if (this.itemsRes && this.itemsRes.hasPrev) {
        await this.itemsRes.prev()
      }
    },
    async next () {
      this.$log('next!')
      if (this.itemsRes && this.itemsRes.hasNext) {
        await this.itemsRes.next()
      }
    },
    async drop () {
      this.$log('drop')
      // this.itemsRes.setProperty('currentId', null)
      await this.itemsRes.gotoStart()
    },
    async setCurrentItem (item) {
      this.$log('setCurrentItem', item.oid)
      this.itemsRes.setProperty('currentId', item.oid)
      await this.itemsRes.gotoCurrent()
    },
    async setSelectedItem (item) {
      this.$log('setSelected', item.oid)
      this.itemSelectedOid = item.oid
    },
  },
  async mounted () {
    this.$log('mounted')
    this.itemsRes = await this.$rxdb.find(this.query, true)
    // this.$log('itemsRes', this.itemsRes)
    let nodeOid = this.$store.state.ui.nodeOnContent
    this.$log('nodeOid', nodeOid)
    if (nodeOid) {
      await this.setCurrentItem({oid: nodeOid})
      await this.setSelectedItem({oid: nodeOid})
      this.$store.commit('ui/stateSet', ['nodeOnContent', null])
    }
  }
}
</script>
