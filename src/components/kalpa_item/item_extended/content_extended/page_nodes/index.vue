<template lang="pug">
.column.fit
  //- header
  slot(name="header")
  //- body
  div(:style=`{position: 'relative',}`).col.full-width.scroll
    .row.full-width.items-strat.content-start.justify-center
      //slot(name="header")
      list-feed(
        ref="list-feed"
        :query="query"
        :itemActivePersist="false"
        :style=`{
          // maxWidth: 600+'px',
        }`
        @ready="listFeedReady")
        //- template(v-slot:prepend)
        template(v-slot:nodata)
          nodata-guard(
            icon="adjust"
            :title="$t('Здесь пока ничего нет')"
            :message="$t('Создайте смысловое ядро и оно появится здесь')"
            backgroundColor="rgba(35,35,35,0)"
            iconColor="grey"
          )
        template(v-slot:item=`{item:group,itemIndex,isActive,isVisible,isPreload, scrolling}`)
          div(
            :style=`{
              borderRadius: '10px',
            }`
            ).row.full-width.items-start.content-start
            //- group header
            .row.full-width.q-pt-sm.q-px-md
              div().row.full-width
                small.text-green.text-bold.text-italic {{ group.name.split('-')[0] }}
            .row.full-width
              //- prev
              .row.full-width.q-px-sm
                q-btn(
                  v-if="group.hasPrev"
                  @click="group.prev()"
                  flat no-caps dense color="grey-6"
                  ).full-width {{$t('Prev')}}
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
                  ).full-width {{$t('Next more')}} {{ group.totalCount-group.items.length }} ...
        //- template(v-slot:append)
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import nodataGuard from 'src/components/kalpa_guard/nodata_guard'

export default {
  name: 'pageNodes',
  props: ['contentKalpa', 'player'],
  components: {
    nodataGuard,
  },
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
