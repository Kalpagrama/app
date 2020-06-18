<template lang="pug">
.row.full-width.q-pt-md
  kalpa-loader(v-if="sphereOid" :mangoQuery="mangoQuery")
    template(v-slot=`{items}`)
      list-middle(:items="items" :options="{paddingTop: 0}")
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
          oidSphere: this.sphereOid
        }
      }
      // return {
      //   oid: this.sphereOid,
      //   pagination: { pageSize: 100 },
      //   sortStrategy: 'AGE',
      //   filter: {types: ['NODE'], fastFilters: ['VOTED_BY_USER']}
      // }
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
