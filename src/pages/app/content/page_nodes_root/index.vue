<template lang="pug">
.column.fit
  .row.full-width
    slot(name="header")
  .col.full-width.scroll
    .row.full-width.items-strat.content-start.justify-center
      list-feed(
        ref="list-feed"
        :query="query"
        :itemMiddlePersist="false"
        :style=`{
          maxWidth: 650+'px',
          marginBottom: '100px',
        }`
        @ready="listFeedReady")
        //- template(v-slot:prepend)
        template(v-slot:item=`{item:group,itemIndex,isActive,isVisible}`)
          div(
            :style=`{
              borderRadius: '10px',
            }`
            ).row.full-width.items-start.content-start
            //- group header
            .row.full-width.q-py-sm.q-px-md
              div().row.full-width.q-px-sm
                small.text-grey-6 {{ group.name }}
            .row.full-width
              //- prev
              .row.full-width.q-px-sm
                q-btn(
                  v-if="group.hasPrev"
                  @click="group.prev()"
                  flat no-caps dense color="grey-6"
                  ).full-width Наверх
              //- items
              div(
                v-for="(item,itemIndex) in group.items" :key="item.oid"
                ).row.full-width
                slot(
                  name="item"
                  :item="item.populatedObject"
                  :player="player"
                  :contentKalpa="contentKalpa"
                  :isSelected="itemSelectedOid === item.oid")
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
        //- template(v-slot:append)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageNodes',
  props: ['contentKalpa', 'player'],
  data () {
    return {
    }
  },
  computed: {
    query () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          // objectTypeEnum: { $in: ['NODE', 'JOINT'] },
          objectTypeEnum: { $in: ['NODE'] },
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
    listFeedReady () {
      this.$log('listFeedReady')
    }
  }
}
</script>
