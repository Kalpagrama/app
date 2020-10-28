<template lang="pug">
q-page(:style=`{paddingTop: '50px', paddingBottom: '200px'}`).row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start
    kalpa-loader(
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
  name: 'userExplorer_userVoted',
  components: {},
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
          oidAuthor: {$ne: this.sphereOid},
          oidSphere: this.sphereOid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    }
  },
  methods: {
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
