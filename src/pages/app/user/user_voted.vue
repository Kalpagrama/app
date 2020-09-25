<template lang="pug">
q-page(:style=`{paddingTop: '8px', paddingBottom: '200px'}`).row.full-width.justify-center
  div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
    kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
      template(v-slot=`{items,next}`)
        list-middle(:items="items" :itemStyles=`{marginBottom: '50px',}`)
          q-infinite-scroll(@load="next" :offset="250")
          template(v-slot:item=`{item,itemIndex,isActive,isVisible}`)
            node-lite(:node="item.metaStatic" :isActive="isActive" :isVisible="isVisible")
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
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidAuthor: {$ne: this.sphereOid},
          oidSphere: this.sphereOid,
          sortStrategy: 'AGE',
        }
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
