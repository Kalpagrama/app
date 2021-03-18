<template lang="pug">
kalpa-layout(
  :height="height"
  )
  template(v-slot:body)
    .row.full-width.items-start.content-start.justify-center.q-pt-sm.q-px-sm
      list-feed(
        :query="query"
        :itemsPerPage="24"
        :itemMiddlePersist="false"
        :itemsMax="100"
        :itemStyles=`{
          paddingBottom: '8px',
        }`
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px',
        }`)
        template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
          div(
            :style=`{
              position: 'relative',
              borderRadius: '10px',
              background: 'rgb(35,35,35)',
            }`
            ).row.full-width
            slot(name="tint" :item="item.populatedObject")
            .row.full-width
              img(
                draggable="false"
                :src="item.populatedObject.thumbUrl"
                :style=`{
                  height: '50px',
                  borderRadius: '10px',
                }`)
              .col
                .row.full-width.items-center.content-center.justify-end.q-pa-sm
                  small.text-grey-6.q-mr-sm {{ $date(item.populatedObject.createdAt, 'DD.MM.YYYY') }}
                  q-btn(round flat dense color="grey-6" icon="more_vert")
            .row.full-width.q-pa-sm
              span.text-white {{ item.populatedObject.name }}
          //- div(
            :style=`{
              position: 'relative',
              height: '120px',
              borderRadius: '10px',
            }`
            ).row.full-width
            slot(name="tint" :item="item.populatedObject")
            img(
              :src="item.populatedObject.items[0].thumbUrl"
              :style=`{
                objectFit: 'cover',
                borderRadius: '10px',
              }`
              ).fit
            div(
              :style=`{
                position: 'absolute', zIndex: 10,
                //- background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)',
                background: 'linear-gradient(0deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.3) 100%)',
                borderRadius: '10px',
              }`
              ).row.fit.items-end.content-end.q-pa-md
              transition(enter-active-class="animated fadeIn " leave-active-class="animated fadeOut")
                div(
                  v-if="isActive"
                  :style=`{
                    position: 'absolute', zIndex: 11, top: '0px', left: '0px',
                  }`
                  ).row.full-width.q-pa-md
                  q-icon(name="select_all" color="white").q-mr-sm
                  small.text-grey-4 {{ item.populatedObject.items[0].layers[0].contentName }}
              span.text-white {{ item.populatedObject.name }}
              //- $date(item.populatedObject.createdAt, 'DD.MM.YYYY')
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'kalpaFinder_pageNodes',
  props: ['height'],
  data () {
    return {
    }
  },
  computed: {
    user () {
      return this.$store.getters.currentUser()
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
        populateObjects: true,
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
