<template lang="pug">
div(
  :style=`{borderRadius: '10px', oveflow: 'hidden'}`).row.full-width.bg-white
  //- dialogs
  //- spheres
  q-dialog(ref="spheresDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    .column.fit.bg-white
      div(:style=`{height: '70px'}`).row.full-width.items-center.q-px-sm
        .col
          div(:style=`{position: 'relative', zIndex: 10, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
            q-input(
              v-model="sphere" filled color="green"
              :placeholder="$t('Find sphere')"
              @blur="sphereCreate()" @keyup.enter="sphereCreate()").full-width
        q-btn(round flat icon="clear" color="grey" @click="$refs.spheresDialog.hide()").q-ml-sm
      .col.full-width.scroll
        .row.full-width.items-start.content-start
          div(v-if="sphere.length > 0").row.full-width.q-px-sm
            q-btn(
              outline no-caps color="green" @click="sphereCreate()"
              :style=`{height: '60px', borderRadius: '10px'}`).full-width Create "{{ sphere }}"
          div(
            v-for="(s, si) in spheres" :key="si" @click="sphereCreate({name: s.name, oid: s.oid})"
            :style=`{minHeight: '40px'}`).row.full-width.items-center.q-px-md
            span {{ s.name }}
  //- categories
  q-dialog(ref="categoriesDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
    .column.fit.bg-white
      div(:style=`{height: '70px'}`).row.full-width.items-center.q-px-sm
        .col
          div(:style=`{position: 'relative', zIndex: 10, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
            q-input(
              v-model="category" filled color="green"
              :placeholder="$t('Find category')"
              @blur="categoryCreate()" @keyup.enter="categoryCreate()").full-width
        q-btn(round flat icon="clear" color="grey" @click="$refs.categoriesDialog.hide()").q-ml-sm
      .col.full-width.scroll
        .row.full-width.items-start.content-start
          div(v-if="category.length > 0").row.full-width.q-px-sm
            q-btn(
              outline no-caps color="green" @click="categoryCreate()"
              :style=`{height: '60px', borderRadius: '10px'}`).full-width Create "{{ category }}"
          div(
            v-for="(c, ci) in categories" :key="ci" @click="categoryCreate({name: c.name, type: c.type})"
            :style=`{minHeight: '40px'}`).row.full-width.items-center.q-px-md
            span {{ c.name }}
  //- spheres
  div(:style=`{minHeight: '60px', padding: '10px'}`).row.full-width
    div(:style=`{height: '60px'}`).row.full-width.items-center
      span.text-bold {{ $t('Spheres') }}
      .col
        .row.fit.justify-end.q-pl-xl
          div(
            v-if="sphereCreating"
            :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).full-width
            q-input(v-model="sphere" ref="sphereInput" autofocus filled @blur="sphereCreate()" @keyup.enter="sphereCreate()").full-width
          q-btn(v-else="!sphereCreating" round flat icon="add" color="green" @click="sphereCreateStart()")
    .row.full-width.items-start.content-start.justify-start
      div(
        v-for="(s,si) in node.spheres" :key="si" @click="sphereDelete(s, si)"
        :style=`{borderRadius: '4px'}`).bg-grey-2.q-px-sm.q-mr-sm.q-mb-sm.cursor-pointer
        small(:style=`{whiteSpace: 'nowrap', userSelect: 'none'}`) {{ s.name }}
  //- categories
  div(:style=`{minHeight: '60px', padding: '10px'}`).row.full-width
    div(:style=`{height: '60px'}`).row.full-width.items-center
      span.text-bold {{ $t('Categories') }}
      .col
        .row.fit.justify-end.q-pl-xl
          div(
              v-if="categoryCreating"
              :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).full-width
              q-input(v-model="category" ref="categoryInput" autofocus filled @blur="categoryCreate()" @keyup.enter="categoryCreate()").full-width
          q-btn(v-else="!categoryCreating" round flat icon="add" color="green" @click="categoryCreateStart()")
          //- span {{this.$store.state.node.categories}}
    .row.full-width.items-start.content-start
      div(
        v-for="(c, ci) in node.categories" :key="ci" @click="sphereDelete(c, ci)"
        :style=`{borderRadius: '4px'}`).bg-grey-2.q-px-sm.q-mr-sm.q-mb-sm
        small(:style=`{whiteSpace: 'nowrap', userSelect: 'none'}`) {{ c.name }}
      div(
        v-for="(c, ci) in categoriesMap" :key="ci" @click="sphereDelete(c.type)"
        :style=`{borderRadius: '4px'}`).bg-grey-2.q-px-sm.q-mr-sm.q-mb-sm
        small(:style=`{whiteSpace: 'nowrap', userSelect: 'none'}`) {{ c.name }}
</template>

<script>
export default {
  name: 'ncSpheres',
  props: ['node'],
  data () {
    return {
      sphere: '',
      sphereCreating: false,
      spheresSpheres: [],
      category: '',
      categoryCreating: false
    }
  },
  computed: {
    spheres () {
      return [...this.spheresWS, ...this.spheresSpheres].filter(({name}) => {
        return name.includes(this.sphere)
      })
    },
    categories () {
      return this.$store.state.node.categories
    },
    spheresWS () {
      return this.$store.state.workspace.workspace.nodes.reduce((acc, val) => {
        val.spheres.map(s => {
          acc.push(s)
        })
        return acc
      }, [])
    }
  },
  methods: {
    sphereCreateStart () {
      this.$log('sphereCreateStart')
      this.$refs.spheresDialog.show()
      this.spheresSpheres = []
      this.node.fragments.map(async (f) => {
        // TODO: if we have another f.content.oid
        let spheres = await this.spheresLoad(f.content.oid)
        this.$log('spheres', spheres)
        this.spheresSpheres = [...spheres, ...this.spheresSpheres]
      })
    },
    categoryCreateStart () {
      this.$log('categoryCreateStart')
      this.$refs.categoriesDialog.show()
    },
    categoryCreate (category) {
      this.$log('categoryCreate', category, this.category)
      this.node.categories.push(category)
      this.categoryCreating = false
      this.category = ''
      this.$refs.categoriesDialog.hide()
    },
    categoryDelete (c, ci) {
      this.$log('categoryDelete', c, ci)
      this.$delete(this.category, ci)
    },
    sphereCreate (sphere) {
      this.$log('sphereCreate', sphere, this.sphere)
      if (!sphere && this.sphere.length === 0) return
      this.node.spheres.push(sphere ? sphere : {name: this.sphere})
      this.sphereCreating = false
      this.sphere = ''
      this.$refs.spheresDialog.hide()
    },
    sphereDelete (s, si) {
      this.$log('sphereDelete', s, si)
      this.$delete(this.node.spheres, si)
    },
    async spheresLoad (oid) {
      this.$log('spheresLoad start', oid)
      let { data: { sphereSpheres: { items: spheres } } } = await this.$apollo.query({
        query: gql`
          query sphereSpheresNcSpheres ($oid: OID!){
            sphereSpheres (sphereOid: $oid, pagination: {pageSize: 500}, sortStrategy: HOT) {
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
      this.$log('spheresLoad done', spheres)
      return spheres
    },
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
