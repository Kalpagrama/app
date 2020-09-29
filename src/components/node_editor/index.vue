<template lang="pug">
.row.full-width
  //- header
  .row.full-width.justify-center
    div(
      :style=`{
        height: '70px',
        maxWidth: $store.state.ui.pageMaxWidth+'px',
      }`).row.full-width.items-center.content-center
      q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$router.back()").q-mr-sm
      span(:style=`{fontSize: '18px'}`).text-white.text-bold Node creator
  //- items slider
  list-slider(:items="items")
    template(v-slot:item=`{item,isActive,meta}`)
      div(
        :style=`{
          borderRadius: '10px', overflow: 'hidden',
        }`
        ).row.fit.b-40.shadow-10
        small.text-white {{ item }}
        //- img(
          :src="item.url"
          :style=`{objectFit: 'cover'}`
          ).fit
  edit-name(:value="name" @input="name = $event")
  //- views
  .row.full-width.justify-center.q-pb-md
    div(
      :style=`{
        maxWidth: 800+'px',
      }`).row.full-width.items-start.content-start
      .row.full-width.justify-center
        q-tabs(
          v-model="viewId"
          dense active-color="white" no-caps
          ).full-width.text-grey-6
          q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
      component(
        :is="`view-${viewId}`"
        :style=`{
          borderRadius: '10px', overflow: 'hidden',
          background: 'rgb(35,35,35)',
          minHeight: '500px',
        }`)
</template>

<script>
export default {
  name: 'nodeEditor',
  components: {
    editName: () => import('./edit-name.vue'),
    viewAdd: () => import('./view-add/index.vue'),
    viewSpheres: () => import('./view-spheres.vue'),
    viewPublish: () => import('./view-publish.vue')
  },
  data () {
    return {
      items: [
        {id: '1', url: 'https://media.tenor.com/images/7f4ee66371a22e4527bbb6230152e9b2/tenor.gif'},
        {id: '2', url: 'https://media.tenor.com/images/55474e19f57ef13832c0b684df70e1f7/tenor.gif'},
        {id: '3', url: 'https://media.tenor.com/images/20824eed4ad6b4e34527e5c0d5ac3ac3/tenor.gif'},
        {id: '4', url: 'https://media.tenor.com/images/13bbfaf2f4131485e65a55b30b057380/tenor.gif'},
        // {id: '5'},
        // {id: '6'},
        // {id: '7'}
      ],
      name: '',
      viewId: 'add',
    }
  },
  computed: {
    views () {
      return [
        {id: 'add', name: 'Add'},
        {id: 'spheres', name: 'Spheres'},
        {id: 'publish', name: 'Publish'}
      ]
    },
  },
  methods: {
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
