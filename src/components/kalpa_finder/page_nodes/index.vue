<template lang="pug">
list-feed(
  :query="query"
  :positionSaving="false"
  :itemStyles=`{
    paddingBottom: '8px',
  }`)
  template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
    div(
      :style=`{
        position: 'relative',
        background: 'rgb(35,35,35)',
        borderRadius: '10px',
      }`
      ).row.full-width.items-center.content-center.cursor-pointer
      slot(name="tint" :item="item.populatedObject")
      img(
        :src="item.populatedObject.items[0].thumbUrl"
        :style=`{
          width: '50px',
          height: '50px',
          borderRadius: '10px',
          objectFit: 'cover',
        }`)
      .col
        .row.fit.items-center.content-center.q-pa-sm
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
