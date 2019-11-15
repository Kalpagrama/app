<template lang="pug">
  k-split(:headerMaxHeight="$q.screen.height/2" :headerClass="['q-pa-sm']" :bodyClass="['bg-grey-1']").bg-white
    template(v-slot:header)
      node(v-if="node" :node="node" :needFull="true" :active="true" :width="width"
        :noName="false" :noSpheres="false" noHeader noTimestamp :noActions="false")
    template(v-slot:body)
      nodes(v-if="node" :node="node")
      div(v-else).row.fit.items-center.justify-center
        q-spinner(:thickness="2" color="green" size="50px")
</template>

<script>
  import nodes from './nodes'

  export default {
    name: 'nodeExplorer',
    components: { nodes },
    props: ['width', 'height'],
    data () {
      return {
        node: null,
        needFull: false,
        nodeFull: null,
        active: false,
        footerHeight: 60,
        footerShow: false
      }
    },
    computed: {
      isDesktop () {
        return this.$q.screen.width > 850
      }
    },
    watch: {
      '$route': {
        immediate: true,
        async handler (to, from) {
          if (to.params.oid) {
            this.$log('$route CHANGED', to.params.oid)
            this.tab = 'node'
            this.node = null
            await this.$wait(300)
            this.active = false
            this.node = await this.nodeLoad(to.params.oid)
            // ??
            this.needFull = false
            await this.$wait(100)
            this.needFull = true
          }
        }
      }
    },
    methods: {
      async nodeFullLoaded (n) {
        this.$log('nodeFullLoaded', n)
        this.nodeFull = n
        this.active = true
      },
      async nodeLoad (oid) {
        this.$log('nodeLoad start')
        let node = await this.$store.dispatch('objects/get', { oid, fragmentName: 'nodeFragment', priority: 0 })
        return node
        // let { data: { objectList: [node] } } = await this.$apollo.query({
        //   query: gql`
        //     query getExtendedNodesPropsExplorer($oid: OID!) {
        //       objectList(oids: [$oid]) {
        //         oid
        //         type
        //         name
        //         createdAt
        //         thumbUrl(preferWidth: 600)
        //         meta {
        //           ...on MetaNode {
        //             layout
        //             fragments { uid width height color thumbUrl(preferWidth: 600) }
        //           }
        //         }
        //       }
        //     }
        //   `,
        //   variables: {
        //     oid: oid
        //   },
        //   fetchPolicy: 'cache-first'
        // })
        // this.$log('nodeLoad done', node.name)
        // return node
      }
    },
    mounted () {
      this.$log('mounted')
    },
    beforeDestroy () {
      this.$log('beforeDestroy')
    }
  }
</script>

<style lang="stylus">
</style>
