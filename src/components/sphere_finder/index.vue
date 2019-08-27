<template lang="pug">
div(:style=`{position: 'relative', minHeight: '70px'}`).row.full-width.items-center.q-px-sm.bg-white
  .row.full-width
    //- options
    q-menu(v-if="!spheresLoading" v-model="sphereOptions.length > 0" no-focus anchor="top middle" self="bottom middle" fit).q-pa-sm
      div(v-for="(s, si) in sphereOptions" :key="si" @click="sphereClick(s, si)"
        :style=`{height: '40px'}`).row.full-width.items-center.q-px-md.hr.cursor-pointer
        span {{ `#${s.name}` }}
  //- input
  q-input(v-model="sphere"
    filled :debounce="350"
    @keydown.enter.native="onEnter"
    @keydown.backspace="onBackspace"
    :placeholder="$t('Поиск')"
    ).full-width
    //- template(v-if="spheres.length > 0" v-slot:prepend)
    //-   small(:style=`{fontSize: '14px', color: 'grey'}`) {{getSpheres}}
</template>

<script>
import gql from 'graphql-tag'
export default {
  name: 'sphereFinder',
  props: ['spheresReady'],
  data () {
    return {
      sphere: '',
      spheres: [],
      spheresLoading: false,
      sphereOptions: []
    }
  },
  computed: {
    getSpheres () {
      let res = ``
      this.spheres.map(s => (res += `#${s.name}, `))
      return res
    }
  },
  watch: {
    sphere: {
      immediate: false,
      async handler (to, from) {
        this.$log('sphere CHANGED', to)
        if (to.length < 2) return
        this.sphereOptions = []
        this.sphereOptions = await this.spheresLoad(to)
      }
    },
    spheresReady: {
      handler (to, from) {
        if (to.length > 0) this.spheres = to
      }
    },
    spheres: {
      handler (to, from) {
        this.$emit('spheres', to)
      }
    }
  },
  methods: {
    onEnter () {
      this.$log('onEnter')
      if (this.sphere.length < 3) return
      // this.spheres.push({name: this.sphere})
      this.$set(this.spheres, this.spheres.length, {name: this.sphere})
      this.$set(this, 'sphere', '')
      // this.sphere = ``
    },
    onBackspace () {
      this.$log('onBackspace')
      if (this.sphere.length === 0) {
        this.spheres.pop()
      }
    },
    async spheresLoad (sphere) {
      this.$log('spheresLoad start')
      this.spheresLoading = true
      let {data: {feed: {items}}} = await this.$apollo.query({
        query: gql`
          query feed ($search: String!) {
            feed(type: AUTOCOMPLETE, pagination: {pageSize: 50}, filter: {text: $search, types: [WORD, SENTENCE]} ){
              count
              totalCount
              nextPageToken
              items {
                oid
                type
                name       
              }
            }
          }
        `,
        variables: {
          search: sphere
        }
      })
      this.spheresLoading = false
      this.$log('spheresLoad done')
      return items
    },
    sphereClick (s) {
      this.$log('sphereClick', s)
      // TODO: check for duplicate in spheres!
      this.sphere = ``
      this.sphereOptions = []
      this.spheres.push({name: s.name, oid: s.oid})
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
