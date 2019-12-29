<template lang="pug">
.row.full-width.q-px-sm.q-my-lg
  div(
    :style=`{minHeight: '60px', borderRadius: '10px', oveflow: 'hidden'}`).row.full-width.bg-grey-3
    //- spheres dialog
    q-dialog(ref="spheresDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
      div(@click.self="$refs.spheresDialog.hide()").row.fit.items-end.content-end.justify-center
        div(
          :style=`{
            position: 'relative',
            maxHeight: $q.screen.height-60+'px', borderRadius: '10px 10px 0 0',
            overflow: 'hidden', maxWidth: $store.state.ui.pageMaxWidth+'px'}`).column.fit.bg-grey-3
          //- actions
          div(:style=`{position: 'absolute', zIndex: 100,bottom: '8px'}`).row.full-width.items-center.content-center.justify-center
            q-btn(
              push color="green" no-caps @click="ready()"
              :style=`{height: '60px', borderRadius: '10px', maxWidth: '300px'}`).full-width
              span.text-bold {{ $t('Ready') }}
          //- header
          div(:style=`{height: '70px'}`).row.full-width.items-center.q-px-sm
            .col
              div(:style=`{position: 'relative', zIndex: 10, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
                q-input(
                  v-model="sphere" filled color="green"
                  :placeholder="$t('Find sphere')"
                  @keyup.enter="sphereCreate()").full-width
            q-btn(round flat icon="clear" color="grey" @click="$refs.spheresDialog.hide()").q-ml-sm
          //- .col.full-width
          .col.full-width.scroll
            .row.full-width.items-start.content-start.q-px-sm
              div(v-if="sphere.length > 0").row.full-width.q-px-sm
                q-btn(
                  outline no-caps color="green" @click="sphereCreate()"
                  :style=`{height: '60px', borderRadius: '10px'}`).full-width Create "{{ sphere }}"
              .row.full-width.q-pt-lg.q-pb-sm.q-px-sm
                span.text-bold {{$t('Spheres recomendations')}}
              div(
                v-for="(s, si) in spheres" :key="si" @click="sphereCreate({name: s.name, oid: s.oid})"
                :style=`{minHeight: '40px', borderRadius: '10px'}`
                :class=`{
                  'bg-green': node.spheres.find(i => (i.name === s.name)),
                  'bg-grey-4': !node.spheres.find(i => (i.name === s.name)),
                  'text-white': node.spheres.find(i => (i.name === s.name))}`
                ).row.items-center.q-px-md.q-mr-sm.q-mb-sm.cursor-pointer
                span {{ s.name }}
              .row.full-width.q-pt-lg.q-pb-sm.q-px-sm
                span.text-bold {{$t('Spheres from Workspace')}}
              div(
                v-for="(s, si) in spheresWS" :key="si" @click="sphereCreate({name: s.name, oid: s.oid})"
                :style=`{minHeight: '40px', borderRadius: '10px'}`
                :class=`{
                  'bg-green': node.spheres.find(i => (i.name === s.name)),
                  'bg-grey-4': !node.spheres.find(i => (i.name === s.name)),
                  'text-white': node.spheres.find(i => (i.name === s.name))}`
                ).row.items-center.q-px-md.q-mr-sm.q-mb-sm.cursor-pointer
                span {{ s.name }}
    //- categories dialog
    q-dialog(ref="categoriesDialog" :maximized="true" transition-show="slide-up" transition-hide="slide-down")
      div(@click.self="$refs.categoriesDialog.hide()").row.fit.items-center.content-center.justify-center
        div(:style=`{
          maxHeight: $q.screen.height-60+'px', maxWidth: 400+'px',
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
                  ).q-pa-sm {{ c.name }}
    //- spheres
    div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
      div().row.full-height.items-center.q-px-md
        span Категория:
      div(
        @click="$refs.categoriesDialog.show()"
        :style=`{position: 'relative'}` v-ripple=`{color: 'white'}`
        ).col.full-height.cursor-pointer
        .row.fit.items-center
          span(
            :style=`{fontSize: '17px', borderRadius: '10px', overflow: 'hidden'}`
            ).text-bold.bg-green.text-white.q-pa-sm {{ categoryName(node.categories[0]) }}
    div(:style=`{minHeight: '60px'}`).row.full-width
      div(:style=`{height: '60px'}`).row.full-width.items-center.content-center
        .col.full-height
          .row.fit.items-center.content-center.q-px-md
            span Сферы:
        div(:style=`{height: '60px', width: '66px'}`).row.items-center.content-center.justify-center
          q-btn(round flat icon="add" color="green" @click="sphereCreateStart()")
      .row.full-width.items-start.content-start.justify-start.q-px-md
        div(
          v-for="(s,si) in node.spheres" :key="si" @click="sphereDelete(s, si)"
          :style=`{borderRadius: '10px'}`).q-pa-sm.q-mr-sm.q-mb-sm.cursor-pointer.bg-green
          span(:style=`{whiteSpace: 'nowrap', userSelect: 'none'}`).text-white {{ s.name }}
    //- category
    //- div(:style=`{minHeight: '60px', padding: '10px'}`).row.full-width
    //-   div(:style=`{height: '60px'}`).row.full-width.items-center
    //-     span.text-bold {{ $t('Categories') }}
    //-     .col
    //-       .row.fit.justify-end.q-pl-xl
    //-         div(
    //-             v-if="categoryCreating"
    //-             :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).full-width
    //-             q-input(v-model="category" ref="categoryInput" autofocus filled @blur="categoryCreate()" @keyup.enter="categoryCreate()").full-width
    //-         q-btn(v-else="!categoryCreating" round flat icon="add" color="green" @click="categoryCreateStart()")
    //-   .row.full-width.items-start.content-start
    //-     div(
    //-       v-for="(c, ci) in categoriesMap" :key="ci" @click="categoryDelete(c.type)"
    //-       :style=`{borderRadius: '4px'}`
    //-       ).bg-grey-2.q-px-sm.q-mr-sm.q-mb-sm.cursor-pointer
    //-       small(:style=`{whiteSpace: 'nowrap', userSelect: 'none'}`) {{ c.name }}
</template>

<script>
export default {
  name: 'ncSpheres',
  props: ['ctx', 'node'],
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
          return name.includes(this.sphere)
        })
    }
  },
  methods: {
    categoryName (type) {
      let c = this.$store.state.node.categories.find((c) => c.type === type)
      return c.name.charAt(0).toUpperCase() + c.name.substring(1)
    },
    categoryCreateStart () {
      this.$log('categoryCreateStart')
      this.$refs.categoriesDialog.show()
    },
    categorySet (category) {
      this.$log('categoryCreate', category)
      this.node.categories = [category.type]
      this.$refs.categoriesDialog.hide()
    },
    categoryDelete (type) {
      this.$log('categoryDelete', type)
      this.node.categories = this.node.categories.filter(c => (c !== type))
    },
    sphereCreateStart () {
      this.$log('sphereCreateStart')
      this.$refs.spheresDialog.show()
      this.spheresSpheres = []
      this.node.fragments.map(async (f) => {
        if (f === null) return
        // TODO: if we have another f.content.oid
        let spheres = await this.spheresLoad(f.content.oid)
        this.$log('spheres', spheres)
        this.spheresSpheres = [...spheres, ...this.spheresSpheres]
      })
    },
    ready () {
      this.$log('ready')
      this.$refs.spheresDialog.hide()
    },
    sphereCreate (sphere) {
      this.$log('sphereCreate', sphere, this.sphere)
      let s = sphere || {name: this.sphere}
      if (!sphere && this.sphere.length === 0) return
      if (this.node.spheres.find(i => (i.name === s.name))) {
        this.sphereDelete(s)
      } else {
        this.node.spheres.push(s)
      }
      this.sphereCreating = false
      this.sphere = ''
      // this.$refs.spheresDialog.hide()
    },
    sphereDelete (s, si) {
      this.$log('sphereDelete', s, si)
      // this.$delete(this.node.spheres, si)
      this.node.spheres = this.node.spheres.filter(i => (i.name !== s.name))
    },
    async spheresLoad (oid) {
      this.$log('spheresLoad start', oid)
      let { data: { sphereSpheres: { items: spheres } } } = await this.$apollo.query({
        query: gql`
          query sphereSpheresNodeEditorSpheres ($oid: OID!){
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
