<template lang="pug">
.row.full-width.items-start.content-start
  .row.full-width.justify-center.q-px-sm
    div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.justify-start
      div(:style=`{maxWidth: '700px',}`).row.full-width
        .col
          div(
            :style=`{
              background: 'rgb(35,35,35)',
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.fit
            q-input(
              v-model="name"
              borderless dense dark color="green"
              placeholder="Поиск"
              :input-style=`{
                paddingLeft: '10px',
              }`
              ).full-width
              template(v-slot:append)
                q-icon(v-if="name.length > 0" name="clear" color="grey-4" @click="name = ''").q-mr-sm
        //- q-btn(
          @click="itemFinderOpened = true"
          round flat color="grey-4" icon="add")
        q-btn(
          round flat color="grey-4" icon="tune")
  //- search
  //- .row.full-width.q-px-sm
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
  data () {
    return {
      name: '',
    }
  },
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
