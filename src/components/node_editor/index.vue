<template lang="pug">
.row.full-width
  //- header
  .row.full-width.justify-center
    div(
      :style=`{
        height: '70px',
        maxWidth: $store.state.ui.pageMaxWidth+'px',
      }`).row.full-width.items-center.content-center
      q-btn(round flat color="grey-8" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Создание ядра
      .col
      q-btn(
        flat no-caps color="white" icon-right="keyboard_arrow_down")
        span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ layouts.find(l => l.id === node.layout).name }}
        q-menu(dark)
          div(:style=`{width: '120px'}`).row
            q-btn(
              @click="node.layout = l.id"
              v-for="l in layouts" :key="l.id"
              v-if="l.id !== node.layout"
              flat color="white" no-caps align="left"
              ).full-width
              span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ l.name }}
      q-btn(round flat color="grey-8" icon="more_vert")
  //- items slider
  list-slider(
    v-if="node.layout === 'SLIDER'" :items="node.items")
    template(v-slot:item=`{item,isActive,meta}`)
      edit-item(:item="item")
  //- horizontal
  div(
    v-if="node.layout === 'HORIZONTAL'"
    ).row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
      list-horizontal(
        :items="node.items"
        :style=`{height: '500px'}`)
        template(v-slot:item="{item}")
          div(
            :style=`{
              height: '500px',
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.full-width.items-start.content-start.b-40
            edit-item(:item="item")
  //- vertical
  div(
    v-if="node.layout === 'VERTICAL'"
    ).row.full-width.items-start.content-start.justify-center
    div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
      div(
        v-for="(item,ii) in node.items" :key="item.id"
        :style=`{
          minHeight: '200px',
          maxHeight: '500px',
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.full-width.b-40.shadow-10.q-mb-sm
        edit-item(:item="item")
  edit-name(:value="node.name" @input="node.name = $event")
  //- views
  .row.full-width.justify-center.q-pt-md
    div(
      :style=`{
        maxWidth: 800+'px',
      }`).row.full-width.items-start.content-start
      .row.full-width.justify-center
        div(
          @click="viewId = v.id"
          v-for="v in views" :key="v.id"
          :style=`{
            position: 'relative',
            width: '50px', height: '50px',
            background: v.id === viewId ? 'rgb(35,35,35)' : 'none',
            borderRadius: '10px 10px 0 0',
          }`
          v-ripple=`{color: 'green'}`
          ).row.items-center.content-center.justify-center.cursor-pointer
          q-icon(:name="v.icon" :color="v.id === viewId ? 'green' : 'grey-6'" size="30px")
      component(
        :is="`view-${viewId}`"
        :style=`{
          borderRadius: '10px', overflow: 'hidden',
          background: 'rgb(35,35,35)',
          minHeight: '500px',
        }`
        @item="itemFound")
</template>

<script>
export default {
  name: 'nodeEditor',
  components: {
    editName: () => import('./edit-name.vue'),
    editDescription: () => import('./edit-description.vue'),
    editItem: () => import('./edit-item/index.vue'),
    viewAdd: () => import('./view-add/index.vue'),
    viewSpheres: () => import('./view-spheres.vue'),
    viewPublish: () => import('./view-publish.vue')
  },
  data () {
    return {
      node: {
        layout: 'SLIDER',
        name: '',
        description: '',
        items: []
      },
      viewId: 'add',
    }
  },
  computed: {
    views () {
      return [
        {id: 'add', name: 'Добавить', icon: 'add'},
        // {id: 'spheres', name: 'Spheres'},
        {id: 'publish', name: 'Публикация', icon: 'check'}
      ]
    },
    layouts () {
      return [
        {id: 'SLIDER', name: 'Slider'},
        {id: 'HORIZONTAL', name: 'Compare'},
        {id: 'VERTICAL', name: 'Vertical'}
      ]
    }
  },
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
      this.node.items.push(item)
    }
  },
  mounted () {
    this.$log('mounted')
    this.$store.commit('ui/stateSet', ['showDesktopNavigation', false])
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    this.$store.commit('ui/stateSet', ['showDesktopNavigation', true])
  }
}
</script>
