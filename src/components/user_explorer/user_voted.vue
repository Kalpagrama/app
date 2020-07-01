<template lang="pug">
kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
  template(v-slot=`{items}`)
    list-middle(:items="items" :options="{paddingTop: 0}")
      //- item first for padding
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
      //- item last for padding
      template(v-slot:itemLast)
        div(:style=`{height: '400px'}`).row.full-width
</template>

<script>
  import { RxCollectionEnum } from 'src/system/rxdb'
export default {
  name: 'userExplorer-userVoted',
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
