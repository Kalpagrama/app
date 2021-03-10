<template lang="pug">
div().row.full-width.q-px-sm
  //- div(
    :style=`{
      position: 'sticky', top: '0px', zIndex: 1000,
    }`
    ).row.full-width.bg-red
    span.text-white Header
  list-feed(
    :query="query"
    :itemMiddlePersist="true"
    :itemStyles=`{
      paddingBottom: '16px',
    }`).br
    template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
      div(
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
    //- div(
      :class=`{
        'b-70': isActive,
      }`
      :style=`{
        position: 'relative',
        background: 'rgb(45,45,45)',
        //- height: '80px',
        borderRadius: '10px',
      }`
      ).row.full-width.items-start.content-start.cursor-pointer
      slot(name="tint" :item="item.populatedObject")
      div(
        :style=`{
          position: 'relative',
          height: '80px',
          borderRadius: '10px',
        }`
        ).row.full-width.items-start.content-start.b-50
        img(
          :src="item.populatedObject.items[0].thumbUrl"
          :style=`{
            height: '80px',
            maxWidth: '160px',
            borderRadius: '10px',
            objectFit: 'cover',
          }`)
        .col.full-height
          .row.fit.items-between.content-between.q-pa-sm
            //- q-icon(name="select_all" color="white").q-mr-sm
            //- small.text-grey-4 {{ item.populatedObject.items[0].layers[0].contentName }}
            .row.full-width.justify-end
              small.text-grey-4 {{ $date(item.populatedObject.createdAt, 'DD.MM.YYYY') }}
      .row.full-width.q-pa-md
        span.text-white {{ item.populatedObject.name }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageNodes',
  props: ['searchString'],
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
      if (this.searchString.length > 0) {
        let nameRegExp = new RegExp(this.searchString, 'i')
        res.selector.name = {$regex: nameRegExp}
      }
      return res
    },
  }
}
</script>
