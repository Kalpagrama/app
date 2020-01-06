<template lang="pug">
.row.full-width.q-px-sm
  //- .row.full-width.q-px-md.q-py-sm
  //-   span(:style=`{fontSize: '17px'}`).text-bold Категория и сферы
  div(:style=`{minHeight: '60px', borderRadius: '10px', oveflow: 'hidden'}`).row.full-width.bg-grey-2
    //- categories dialog
    q-dialog(ref="categoriesDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
      div(@click.self="$refs.categoriesDialog.hide()").row.fit.items-center.content-center.justify-center
        div(:style=`{
          maxHeight: $q.screen.height-60+'px', maxWidth: 350+'px',
          borderRadius: '10px', overflow: 'hidden'}`).column.full-width.bg-grey-3
          .col.full-width.scroll
            .row.full-width.items-start.content-start
              div(
                v-for="(c, ci) in categories" :key="ci" @click="categorySet({name: c.name, type: c.type})"
                :style=`{minHeight: '60px'}`
                ).row.full-width.items-center.justify-center.q-px-md.cursor-pointer.hr
                span(
                  :style=`{borderRadius: '4px', fontSize: '16px'}`
                  :class=`{'bg-green': node.categories.includes(c.type), 'text-white': node.categories.includes(c.type)}`
                  ).q-pa-sm {{ categoryName(c.type) }}
    //- category & sphere input
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
      div(
        :style=`{position: 'relative'}`
        ).col.full-height.cursor-pointer
        .row.fit.items-center.q-px-sm
          span(
            @click="$refs.categoriesDialog.show()"
            :style=`{fontSize: '17px', borderRadius: '10px', overflow: 'hidden'}`
            ).text-bold.bg-green.text-white.q-pa-sm {{ categoryName(node.categories[0]) }}
          .col.q-pl-sm
            input(
              v-model="sphere"
              @keyup.enter="sphereCreate" @blur="sphereCreate"
              :placeholder="$t('Type to add spheres')"
              :style=`{height: '40px', borderRadius: '10px'}`
              ).full-width.kinput.bg-grey-4
    //- spheres
    div(:style=`{minHeight: '0px'}`).row.full-width
      .row.full-width.items-start.content-start.justify-start.q-px-sm
        div(
          v-for="(s,si) in node.spheres" :key="si" @click="sphereDelete(s, si)"
          :style=`{borderRadius: '10px'}`).q-pa-sm.q-mr-sm.q-mb-sm.cursor-pointer.bg-green
          span(:style=`{whiteSpace: 'nowrap', userSelect: 'none'}`).text-white {{ s.name }}
      //- recomend spheres from WS or CONTENT
  div(:style=`{minHeight: '60px'}`).row.full-width.items-start.content-start.q-px-sm
    .col-12
      div(:style=`{maxHeight: '500px'}`).column.full-width
        //- div(:style=`{height: '30px'}`).row.full-width.items-center
        //-   span WS spheres
        .col.full-width.scroll
          .row.full-width.items-start.content-start.q-pt-sm
            small(
              v-for="(s, si) in spheresWS" :key="si" @click="sphereAdd(s)"
              :style=`{borderRadius: '10px', overflow: 'hidden'}`
              ).q-mr-sm.q-mb-sm.q-px-sm.q-py-xs.bg-grey-3.cursor-pointer {{ s.name }}
    //- TODO: add recomen spheres
</template>

<script>
export default {
  name: 'nodeEditorSpeheres',
  props: ['ctx', 'node'],
  data () {
    return {
      sphere: '',
      spheresSpheres: [],
    }
  },
  computed: {
    spheres () {
      return [...this.spheresSpheres].filter(({name}) => {
        return name.includes(this.sphere)
      })
    },
    categories () {
      return this.$store.state.node.categories
    },
    categoriesMap () {
      return this.node.categories.map(m => {
        return this.$store.state.node.categories.find(c => (c.type === m))
      })
    },
    spheresWS () {
      let m = {}
      return this.$store.state.workspace.workspace.nodes
        .reduce((acc, val) => {
          val.spheres.map(s => {
            if (!m[s.name]) acc.push(s)
            m[s.name] = s.name
          })
          return acc
        }, [])
        .filter(({name}) => {
          return this.node.spheres.find((s) => s.name !== name)
        })
        .filter(({name}) => {
          return name.includes(this.sphere)
        })
    }
  },
  watch: {
    'node.fragments': {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('node.fragments CHANGED', to.length)
        if (to && from && to.length !== from.length) {
          this.$log('LOAD SPHERES RECOMENDATIONS!')
        }
      }
    }
  },
  methods: {
    // category
    categoryName (type) {
      let c = this.$store.state.node.categories.find((c) => c.type === type)
      return c.name.charAt(0).toUpperCase() + c.name.substring(1)
    },
    categorySet (category) {
      this.$log('categoryCreate', category)
      this.node.categories = [category.type]
      this.$refs.categoriesDialog.hide()
    },
    // sphere
    sphereCreate () {
      this.$log('sphereCreate')
      if (this.sphere.length === 0) return
      let sphere = {name: this.sphere}
      if (this.node.spheres.find(s => (s.name === this.sphere))) {
      } else {
        this.node.spheres.push(sphere)
      }
      this.sphere = ''
    },
    sphereAdd (s) {
      this.$log('sphereAdd', s)
      // check duplicates
      if (this.node.spheres.find(sphere => (sphere.name === s.name))) return
      this.node.spheres.push({name: s.name})
    },
    sphereDelete (s, si) {
      this.$log('sphereDelete', s, si)
      this.node.spheres = this.node.spheres.filter(i => (i.name !== s.name))
    },
    async spheresLoad (oid) {
      this.$log('spheresLoad start', oid)
      let pagination = {pageSize: 100}
      let filter = null
      let sortStrategy = 'HOT'
      let spheres = await this.$store.dispatch('lists/sphereSpheres', { oid, pagination, filter, sortStrategy })
      // let { data: { sphereSpheres: { items: spheres } } } = await this.$apollo.query({
      //   query: gql`
      //     query sphereSpheresNodeEditorSpheres ($oid: OID!){
      //       sphereSpheres (sphereOid: $oid, pagination: {pageSize: 500}, sortStrategy: HOT) {
      //         items {
      //           oid
      //           name
      //         }
      //       }
      //     }
      //   `,
      //   variables: {
      //     oid: oid
      //   }
      // })
      this.$log('spheresLoad done', spheres)
      return spheres
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
