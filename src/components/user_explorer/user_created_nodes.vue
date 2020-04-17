<template lang="pug">
.row.fit.items-start.content-start
  kalpa-loader(v-if="variables" ref="nodeLoader" :variables="variables" type="sphereNodes")
    template(v-slot=`{items}`)
      list-middle(:items="items" :style=`{paddingTop: '8px'}`)
        template(v-slot:item=`{item, index, indexMiddle}`)
          node(
            ctx="list" layout="PIP"
            :node="item" :index="index" :essence="true"
            :needFull="index >= indexMiddle-1 && index <= indexMiddle+1"
            :visible="true" :active="index === indexMiddle" :mini="false")
      //- node-list(:nodes="items" @nodeClick="nodeClick")
      //-   template(v-slot:header)
      //-     slot(name="header")
      //-     //- progress create node
      //-     .row.full-width.justify-center
      //-       div(:style=`{maxWidth: $store.state.ui.maxWidthPage+'px'}`).row.full-width.q-mt-xl.q-mb-lg
      //-         div(
      //-           v-if="progress"
      //-           :style=`{height: '400px', borderRadius: '10px', overflow: 'hidden'}`
      //-           ).row.full-width.items-center.content-center.justify-center.bg-grey-8
      //-           .row.full-width.justify-center
      //-             q-spinner(color="white" size="50px" :thickness="3")
      //-           .row.full-width.justify-center
      //-             span.text-bold.text-white.q-mt-md {{ $t('Your node is creating...') }}
  //- div(v-if="nodes" style=`border-radius: 10px`).row.full-width.justify-center.bg-white.q-pa-lg
  //-   span {{$t('Пользователь не создавал ядра', 'User didnt create nodes')}}
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
  watch: {
    '$store.state.events.progressCreateNode': {
      handler (to, from) {
        this.$log('progressCreateNode CHANGED', to)
        if (to && to.progress === 100 && to.action === 'CREATE_NODE' && to.oid) {
          // this.$router.push({params: {oid: to.oid}}).catch(e => e)
          this.$store.commit('events/stateSet', ['progressCreateNode', null])
        }
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
