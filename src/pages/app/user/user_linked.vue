<template lang="pug">
q-page(:style=`{paddingTop: '8px', paddingBottom: '200px'}`).row.full-width.justify-center
  div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start
    //- h1.text-white linked
    kalpa-loader(
      v-if="sphereOid" :query="query" :limit="3" v-slot=`{items, next}`
      @reset="$refs.qis.reset(), $refs.qis.resume(), $refs.qis.poll()")
      //- masonry(
        :cols="$q.screen.width < 800 ? 2 : 4"
        :gutter="{default: 10}").full-width
        div(v-for="link in items" :key="link.oid").row.full-width.br.bg
          small.text-white {{link}}
      list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
        q-infinite-scroll(ref="qis" @load="next" :offset="500")
        template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
          link-feed(:link="item" :isActive="isActive" :isVisible="isVisible")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'userExplorer_userLinked',
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
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_JOINTS,
          // oidAuthor: {$ne: this.sphereOid},
          oidSphere: this.sphereOid,
          sortStrategy: 'AGE',
        },
        populateObjects: true,
      }
    },
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
