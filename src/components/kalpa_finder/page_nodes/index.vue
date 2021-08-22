<template lang="pug">
kalpa-layout(
  :height="height"
  )
  template(v-slot:body)
    .row.full-width.items-start.content-start.justify-center.q-pt-sm.q-px-sm
      list-feed(
        :query="query"
        :nextSize="50"
        :itemMiddlePersist="false"
        :screenSize="100"
        :itemStyles=`{
          paddingBottom: '2px',
        }`
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`)
        template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
          //- list-item(:bookmark="item")
          div(
            @click="$emit('item', item)"
            :style=`{
              position: 'relative',
              borderRadius: '10px',
              background: 'rgb(35,35,35)',
            }`
            ).row.full-width
            //- slot(name="tint" :item="item")
            .row.full-width
              img(
                draggable="false"
                :src="item.thumbUrl"
                :style=`{
                  height: '50px',
                  minWidth: '90px',
                  maxWidth: '90px',
                  borderRadius: '10px',
                  objectFit: 'contain',
                }`).b-40.q-mt-sm.q-ml-sm.q-mb-sm
              .col.full-height
                .row.fit.items-between.content-between.q-pa-sm
                  .row.full-width
                    span.text-white {{ item.name }}
                  .row.full-width.justify-end
                    small.text-grey-8.q-mr-sm {{ $date(item.createdAt, 'DD.MM.YYYY') }}
                  //- q-btn(round flat dense color="grey-6" icon="more_vert")
            //- .row.full-width.q-pa-sm
              span.text-white {{ item.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'kalpaFinder_pageNodes',
  components: {
  },
  props: ['height'],
  data () {
    return {
    }
  },
  computed: {
    user () {
      return this.$store.getters.currentUser
    },
    query () {
      let res = {
        // selector: {
        //   rxCollectionEnum: RxCollectionEnum.WS_ANY,
        // },
        // sort: [{updatedAt: 'desc'}]
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
          objectTypeEnum: { $in: ['NODE'] },
          oidSphere: this.user.oid,
          oidAuthor: {$eq: this.user.oid},
          sortStrategy: 'AGE',
        },
        populateObjects: false,
      }
      // add selector filter
      // if (this.view) {
      //   res.selector = {...res.selector, ...this.view.selector}
      // }
      // else {
      //   // res.selector = {...res.selector, ...this.types}
      // }
      // add name filter
      // if (this.searchString.length > 0) {
      //   let nameRegExp = new RegExp(this.searchString, 'i')
      //   res.selector.name = {$regex: nameRegExp}
      // }
      return res
    },
  }
}
</script>
