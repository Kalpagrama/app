<template lang="pug">
q-page(:style=`{paddingTop: '8px', paddingBottom: '200px', minHeight: '100vh'}`).row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start
    kalpa-loader(
      v-if="sphereOid" :query="query" :limit="3" v-slot=`{items, next}`
      @reset="$refs.qis.reset(), $refs.qis.resume(), $refs.qis.poll()")
      list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
        q-infinite-scroll(ref="qis" @load="next" :offset="500")
        template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
          node-feed(:node="item" :isActive="isActive" :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageApp_user_userCreated',
  props: {
  },
  data () {
    return {
      indexMiddle: 0
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
    indexMiddleHandler (isVisible, entry) {
      let index = parseInt(entry.target.accessKey)
      if (isVisible) {
        this.indexMiddle = index
      }
      else {
        if (index === this.indexMiddle) {
          this.indexMiddle = -1
        }
      }
    }
  }
}
</script>
