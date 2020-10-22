<template lang="pug">
.row.full-width.items-start.content-start
  //- search
  .row.full-width.q-px-sm
    div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width.b-40
      q-input(
        v-model="name"
        borderless dark dense color="green"
        placeholder="Поиск"
        :input-style=`{
          paddingLeft: '10px',
        }`
        ).full-width
  //- types
  //- .row.full-width.q-pa-sm.bg-red
  //- items
  .row.full-width.items-start.content-start
    //- @items="subscriptionsLoaded"
    kalpa-loader(
      :immediate="true"
      :query="querySubscriptions" :limit="1000" v-slot=`{items,next}`)
      .row.full-width.items-start.content-start.q-pt-sm.q-px-sm
        div(
          v-for="(sub,ii) in items" :key="sub.oid"
          :style=`{
            position: 'relative',
            borderRadius: '10px',
          }`
          ).row.q-pa-sm.b-40.q-mr-sm.q-mb-sm.cursor-pointer
          slot(name="tint" :item="sub" :itemKey="sub.oid")
          span.text-white {{ sub.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'fromSubs',
  computed: {
    querySubscriptions () {
      let res = {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SUBSCRIPTIONS,
          oidSphere: this.$store.getters.currentUser().oid,
        },
        populateObjects: false,
      }
      return res
    },
  }
}
</script>
