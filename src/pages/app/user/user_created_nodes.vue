<template lang="pug">
.row.full-width.items-start.content-start.q-px-xs
  //- progress create node
  //- div(
  //-   v-if="progress"
  //-   :style=`{height: '400px', borderRadius: '10px', overflow: 'hidden'}`
  //-   ).row.full-width.items-center.content-center.justify-center.bg-primary
  //-   .row.full-width.justify-center
  //-     q-spinner(color="white" size="50px" :thickness="3")
  //-   .row.full-width.justify-center
  //-     span.text-white {{ $t('Your node is creating...') }}
  //- nodes
  kalpa-loader(v-if="variables" ref="nodeLoader" :variables="variables" type="sphereNodes")
    template(v-slot:items=`{items}`)
      node-list(:nodes="items" @nodeClick="nodeClick")
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
    progress () {
      return this.$store.state.events.progressCreateNode
    },
    sphereOid () {
      // return this.$store.getters.currentUser.oid
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
