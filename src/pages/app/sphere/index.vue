<template lang="pug">
.row.full-width
  span sphereExplorer
</template>

<script>
export default {
  name: 'pageApp__Sphere',
  components: {},
  data () {
    return {
      loading: false,
      search: '',
      sphere: null,
      sphereHolding: false,
      spheresSelected: [],
      spheres: [],
      sphereSpheresShow: true,
      query: gql`
        query sphereNodes($oid: OID!) {
          sphereNodes (sphereOid: $oid, pagination: {pageSize: 5}) {
            totalCount
            items {
              oid
              type
              thumbUrl (preferWidth: 600)
              createdAt
              name
            }
            nextPageToken
          }
        }
      `
    }
  },
  computed: {
    variables () {
      return {
        oid: this.$route.query.sphere
      }
    },
    getRows () {
      if (this.spheres.length <= 4) {
        return 1
      } else if (this.spheres.length <= 8) {
        return 2
      } else {
        return 3
      }
    }
  },
  watch: {
    '$route': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        this.$log('$route CHANGED', to)
      }
    }
  },
  methods: {
    handleResult (e) {
      this.$log('handleResult', e)
      let {data: {sphereNodes: {items}}} = e
      items.map((i) => {
        this.$log('i.oid', i.oid)
      })
      // this.$log('items', items)
    },
    getNode (n) {
      // this.$log('getNode', n)
      return {visible: true, ...n}
    },
    sphereHold (s, si) {
      this.$log('sphereHold', s, si)
      this.$q.notify({message: `Holding ${s.name}`})
      if (this.sphereHolding) {
        // purge selected spheres
        // set again sphere holdin
        // this.sphereHolding = true
      } else {
        // this.sphereHolding = true
      }
    },
    sphereClick (s, si) {
      this.$log('sphereClick', s, si)
      if (this.sphereHolding) {
      } else {
        this.$router.push({query: { sphere: s.oid }})
        localStorage.setItem('zspherelast', s.oid)
      }
    },
    async sphereLoad (oid) {
      this.$log('sphereLoad start', oid)
      this.loading = true
      await this.$wait(500)
      let { data: { objectList: sphereFull } } = await this.$apollo.query({
        query: gql`
          query sphereLoad ($oid: OID!) {
            objectList (oids: [$oid]) {
              oid
              type
              name
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      this.loading = false
      // this.$log('sphereLoad done', sphereFull[0])
      this.$set(this, 'sphere', sphereFull[0])
    },
    spheresShow(ri, si) {
      // ri
      let l = this.spheres.length
      let rl = Math.ceil(this.spheres.length / this.getRows)
      if (ri === 0) {
        return si < (ri + 1) * rl
      } else {
        return si < (ri + 1) * rl && si >= (ri) * rl
      }
    },
    async spheresLoad (oid) {
      this.$log('spheresLoad start', oid)
      let { data: { sphereSpheres: { items } } } = await this.$apollo.query({
        query: gql`
          query sphereSpheres ($oid: OID!){
            sphereSpheres (sphereOid: $oid, pagination: {pageSize: 500}) {
              items {
                oid
                name
              }
            }
          }
        `,
        variables: {
          oid: oid
        }
      })
      // this.$log('spheresLoad done', items)
      this.$set(this, 'spheres', items)
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
