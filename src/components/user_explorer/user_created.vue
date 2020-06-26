<template lang="pug">
kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
  template(v-slot=`{items}`)
    list-middle(:items="items")
      template(v-slot:itemFirst)
        div(:style=`{height: '110px'}`).row.full-width
      template(v-slot:item=`{item, index, indexMiddle}`)
        node(
          ctx="list" layout="PIP"
          :node="item" :index="index" :essence="true"
          :needFull="index >= indexMiddle-1 && index <= indexMiddle+1"
          :visible="index >= indexMiddle-1 && index <= indexMiddle+1"
          :active="index === indexMiddle"
          :mini="false")
</template>

<script>
import { LstCollectionEnum as RxCollectionEnum } from 'src/system/rxdb/lists'

export default {
  name: 'userCreated',
  props: {
  },
  data () {
    return {
    }
  },
  computed: {
    progress () {
      // this.$logW('todo !!!!')
      // return this.$store.state.events.progressCreateNode
      return 100
    },
    sphereOid () {
      // return this.$store.getters.currentUser.oid
      return this.$route.params.oid
    },
    mangoQuery () {
      return {
        selector: {
          rxCollectionEnum: RxCollectionEnum.LST_SPHERE_NODES,
          oidSphere: this.sphereOid,
          oidAuthor: {$eq: this.sphereOid},
          sortStrategy: 'AGE',
        }
      }
    }
  },
  watch: {
    // '$store.state.events.progressCreateNode': {
    //   handler (to, from) {
    //     this.$log('progressCreateNode CHANGED', to)
    //     if (to && to.progress === 100 && to.action === 'CREATE_NODE' && to.oid) {
    //       // this.$router.push({params: {oid: to.oid}}).catch(e => e)
    //       this.$store.commit('events/stateSet', ['progressCreateNode', null])
    //     }
    //   }
    // }
  },
  methods: {
    // nodeClick (val) {
    //   this.$log('nodeClick', val)
    //   this.$router.push('/node/' + val[0].oid)
    // }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
