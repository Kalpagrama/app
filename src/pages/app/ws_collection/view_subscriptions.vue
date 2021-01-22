<template lang="pug">
q-page(
  :style=`{
    paddingTop: 98+paddingTop+'px',
  }`
  ).row.full-width.justify-center.items-start.content-start.q-px-sm
  div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.q-pa-sm
    div(v-for="(bookmark,ii) in bookmarks" :key="ii").row.full-width
      small.text-white {{bookmark}}
      //- get subscription or not...
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { UserApi } from 'src/api/user'

export default {
  name: 'wsCollection_viewSubscriptions',
  props: {
    collection: {type: Object},
    paddingTop: {
      type: Number,
      default: 0
    },
  },
  data () {
    return {
      bookmarks: []
    }
  },
  async mounted () {
    this.$log('mounted')
    let {items} = await this.$rxdb.find({
      selector: {
        rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
        id: {$in: this.collection.bookmarks}
      },
      sort: [{updatedAt: 'desc'}]
    })
    this.bookmarks = items
  }
}
</script>
