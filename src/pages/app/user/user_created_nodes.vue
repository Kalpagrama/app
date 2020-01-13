<template lang="pug">
.row.full-width.items-start.content-start.q-px-sm
  node-loader(v-if="variables" ref="nodeLoader" :variables="variables" type="sphereNodes")
    template(v-slot:default=`{nodes}`)
      // small(v-for="n in nodes" :key="n.oid").full-width.br {{ n.name }}
      node-list(:nodes="nodes" @nodeClick="nodeClick")
  div(v-if="nodes" style=`border-radius: 10px`).row.full-width.justify-center.bg-white.q-pa-lg
    span {{$t('Пользователь не создавал ядра', 'User didnt create nodes')}}
</template>

<script>
export default {
  name: 'userCreatedNodes',
  props: {
    filter: {
      type: Object,
      // default () {
      //   return {types: ['NODE'], fastFilters: ['VOTED_BY_USER']}
      // }
    }
  },
  data () {
    return {
    }
  },
  computed: {
    sphereOid () {
      // return this.$store.getters.currUser.oid
      return this.$route.params.oid
    },
    variables () {
      // this.$logD(`this.filter= ${JSON.stringify(this.filter)}`)
      // this.$log('varssss', this.filter)
      return {
        oid: this.sphereOid,
        pagination: { pageSize: 100 },
        sortStrategy: 'AGE',
        filter: this.filter
        // filter: { types: ['NODE'], fastFilters: ['CREATED_BY_USER']} // JSON.parse(JSON.stringify(this.filter))
      }
    }
  },
  methods: {
    nodeClick (val) {
      this.$log('nodeClick', val)
      this.$router.push('/node/' + val[0].oid)
    }
  },
  mounted () {
    this.$logD('mounted')
  },
  beforeDestroy () {
    this.$logD('beforeDestroy')
  }
}
</script>
