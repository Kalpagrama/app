<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.items-start.content-start.justify-center.b-30
      div(:style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width.items-center.content-center.q-py-sm
        q-btn(
          flat color="white" icon="keyboard_arrow_left" @click="$routerKalpa.back()"
          :style=`{width: '40px', height: '56px'}`).q-mr-xs
        .col
          div(
            v-if="page"
            :style=`{
              position: 'relative', zIndex: 100,
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.full-width
            q-input(
              v-model="page.name"
              filled dark color="grey-6"
              :input-style=`{
                fontSize: '20px',
                fontWeight: 'bold',
                background: 'none'
              }`
              :style=`{
                background: 'none'
            }`).full-width
  q-page-container
    q-page.row.full-width.justify-center.q-py-md
      div(
        v-if="page"
        :style=`{
          maxWidth: $store.state.ui.pageWidth+'px', borderRadius: '10px',
          //- background: 'rgb(35,35,35)',
        }`).row.full-width.items-start.content-start.q-py-md
        //- items
        div(
          v-for="(id, idi) in page.items" :key="id"
          ).row.full-width.items-start.content-start.q-mb-xs
          q-btn(
            @click="itemDragClick(id, idi)"
            round flat dense icon="drag_indicator" color="grey-9" size="md"
            :style=`{width: '40px', height: '40px',}`).q-mr-xs
          .col
            page-item(:id="id")
        //- item add
        div(:style=`{paddingLeft: '44px',}`).row.full-width
          q-btn(
            @click="itemAdd()"
            flat dense color="green" icon="add").full-width
        //- item debug
        //- .row.full-width.q-px-xs.q-py-md
          small.text-grey-6 {{ page }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import pageItem from './page_item.vue'

export default {
  name: 'pageEditor',
  components: {
    pageItem,
  },
  data () {
    return {
      page: null,
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      async handler (to, from) {
        this.$log('$route.params.id TO', to)
        let page = await this.$rxdb.get(RxCollectionEnum.WS_NODE, to)
        // let [page] = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_NODE, id: to}})
        if (page) {
          this.page = page
        }
      }
    }
  },
  methods: {
    async itemDragClick (id, idi) {
      this.$log('itemDragClick', id, idi)
      await this.$rxdb.remove(id)
      this.$delete(this.page.items, idi)
    },
    async itemAdd () {
      this.$log('itemAdd')
      let itemInput = {
        name: '',
        items: [],
        spheres: [],
        category: 'FUN',
        layout: 'PIP',
        thumbUrl: '',
        stage: 'page-item',
      }
      let {id} = await this.$rxdb.set(RxCollectionEnum.WS_NODE, itemInput)
      this.page.items.push(id)
    },
  },
  beforeDestroy() {
  },
}
</script>
