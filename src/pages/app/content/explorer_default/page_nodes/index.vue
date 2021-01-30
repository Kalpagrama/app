<template lang="pug">
div(
  :style=`{
    height: height+'px',
  }`
  ).column.full-width
  .col.full-width.scroll
    div(:style=`{}`).row.full-width.justify-center.q-px-md
      div(
        v-if="itemsRes"
        :style=`{
          //- maxWidth: $store.state.ui.pageWidth+'px',
          maxWidth: 600+'px',
        }`
        ).row.full-width.items-start.content-start.q-pt-sm
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
            span.text-white Group: {{ group.totalCount }}
          .row.full-width
            //- prev
            .row.full-width.q-px-sm
              q-btn(
                v-if="group.hasPrev"
                @click="group.prev()"
                flat no-caps dense color="grey-6"
                ).full-width Up
            //- items
            //- div(
              v-for="(item,itemIndex) in group.items"
              ).row.full-width.q-px-md.q-py-xs
              span.text-white {{ item.oid }}
            group-item(
              v-for="(item,itemIndex) in group.items" :key="item.oid"
              :item="item.populatedObject"
              :player="player"
              :contentKalpa="contentKalpa"
              ).q-mb-xs
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
                ).full-width Еще
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
  async mounted () {
    this.$log('mounted')
    this.itemsRes = await this.$rxdb.find(this.query, true)
  }
}
</script>
