<template lang="pug">
div(:style=`{height: height+'px'}`).row.full-width
  sphere-explorer(v-if="sphere" :sphere="sphere")
</template>

<script>
import sphereExplorer from 'components/sphere_explorer'

export default {
  name: 'pageApp__Sphere',
  props: ['height', 'width'],
  components: {sphereExplorer},
  data () {
    return {
      sphere: null
    }
  },
  watch: {
    '$route': {
      deep: true,
      immediate: true,
      async handler (to, from) {
        if (to.params.oid) {
          this.$log('$route CHANGED', to)
          this.sphere = await this.sphereLoad(to.params.oid)
        }
      }
    }
  },
  methods: {
    async sphereLoad (oid) {
      this.$log('sphereLoad start', oid)
      let { data: { objectList: [sphere] } } = await this.$apollo.query({
        query: gql`
          query sphereLoad ($oid: OID!) {
            objectList (oids: [$oid]) { oid type name }
          }
        `,
        variables: {
          oid: oid
        }
      })
      this.$log('sphereLoad done', sphere)
      return sphere
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
