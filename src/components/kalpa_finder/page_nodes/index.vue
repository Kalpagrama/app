<template lang="pug">
q-page(
  :style=`{
    paddingTop: '8px',
  }`).row.full-width.justify-center.q-px-sm
  //- kalpa-loader(
    :immediate="true"
    :query="query" :limit="12" v-slot=`{items,next,nexting}`)
    div(
      :style=`{
        maxWidth: $store.state.ui.pageWidth+'px',
      }`
      ).row.full-width.items-start.content-start
      q-infinite-scroll(@load="next" :offset="$q.screen.height")
      div(
        v-for="(i, ii) in items" :key="ii"
        :style=`{
          position: 'relative',
          background: 'rgb(35,35,35)',
          borderRadius: '10px',
        }`
        ).row.full-width.items-center.content-center.cursor-pointer.q-mb-sm
        //- template(v-slot:tint=`{item}`)
        slot(name="tint" :item="i.populatedObject")
        img(
          :src="i.populatedObject.items[0].thumbUrl"
          :style=`{
            width: '50px',
            height: '50px',
            borderRadius: '10px',
            objectFit: 'cover',
          }`)
        .col
          .row.fit.items-center.content-center.q-pa-sm
            span.text-white {{ i.populatedObject.name }}
      div(:style=`{height: '50px'}`).row.full-width.justify-center
        q-spinner-dots(v-show="nexting" color="green" size="50px")
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
