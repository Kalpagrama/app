<template lang="pug">
q-page(:style=`{paddingTop: '50px', paddingBottom: '200px', minHeight: '100vh'}`).row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start
    .row.full-width.justify-center.q-py-xl
      span.text-white Nothing found :(
    //- kalpa-loader(
      v-if="sphereOid" :query="query" :limit="15" v-slot=`{items, next}`
      @reset="$refs.qis.reset(), $refs.qis.resume(), $refs.qis.poll()")
      list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
        q-infinite-scroll(ref="qis" @load="next" :offset="$q.screen.height")
        template(v-slot:item=`{item,itemIndex,isActive,isVisible,width}`)
          node-feed(:node="item" :isActive="isActive" :isVisible="isVisible" :width="width")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_user_userFeeds',
  props: {
  },
  data () {
    return {
    }
  },
  computed: {
    sphereOid () {
      return this.$route.params.oid
    },
    query () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.sphereOid,
          oidAuthor: {$eq: this.sphereOid},
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  },
  methods: {
  }
}
</script>
