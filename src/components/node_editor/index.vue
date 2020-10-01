<template lang="pug">
.row.full-width.items-start.content-start
  //- header
  .row.full-width.justify-center
    div(
      :style=`{
        height: '70px',
        maxWidth: $store.state.ui.pageMaxWidth+'px',
      }`).row.full-width.items-center.content-center
      q-btn(round flat dense color="grey-8" icon="keyboard_arrow_left" @click="$router.back()").q-mr-xs
      span(
        v-if="node.items.length > 0"
        :style=`{fontSize: '0.9rem'}`).text-white.text-bold Редактор ядра
      .col
      q-btn(
        v-if="node.items.length > 0"
        flat no-caps color="white" icon-right="keyboard_arrow_down")
        span(:style=`{fontSize: '0.8rem'}`).text-white.text-bold {{ layoutName }}
        q-menu(dark)
          div(:style=`{width: '110px'}`).row
            q-btn(
              @click="node.layout = l.id"
              v-for="l in layouts" :key="l.id"
              v-if="l.id !== node.layout"
              flat color="white" no-caps align="left"
              ).full-width
              span(:style=`{fontSize: '0.8rem'}`).text-white.text-bold {{ l.name }}
      q-btn(round flat dense color="grey-8" icon="more_vert")
  //- items slider
  div(v-if="node.items.length > 0").row.full-width.items-start.content-start
    //- slider
    list-slider(
      v-if="node.layout === 'SLIDER'" :items="node.items")
      template(v-slot:item=`{item,isActive,meta}`)
        edit-item(
          :item="item" :isActive="isActive"
          @next="itemNext(item)"
          @prev="itemPrev(item)"
          @duplicate="itemDuplicate(item)"
          @remove="itemRemove(item)")
    //- horizontal
    div(
      v-if="node.layout === 'HORIZONTAL'"
      ).row.full-width.items-start.content-start.justify-center
      div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
        list-horizontal(
          :items="node.items"
          :style=`{height: '500px'}`)
          template(v-slot:item="{item, isActive}")
            div(
              :style=`{
                height: '500px',
                borderRadius: '10px', overflow: 'hidden',
              }`
              ).row.full-width.items-start.content-start.b-40
              edit-item(
                :item="item" :isActive="isActive"
                @next="itemNext(item)"
                @prev="itemPrev(item)"
                @duplicate="itemDuplicate(item)"
                @remove="itemRemove(item)")
    //- vertical
    div(
      v-if="node.layout === 'VERTICAL'"
      ).row.full-width.items-start.content-start.justify-center
      div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
        div(
          v-for="(item,ii) in node.items" :key="item.id"
          :style=`{
            borderRadius: '10px', overflow: 'hidden',
          }`
          ).row.full-width.b-40.shadow-10.q-mb-md
          edit-item(
            :item="item" :isActive="true"
            @next="itemNext(item)"
            @prev="itemPrev(item)"
            @duplicate="itemDuplicate(item)"
            @remove="itemRemove(item)")
  edit-name(:value="node.name" @input="node.name = $event")
  //- views
  .row.full-width.justify-center.q-py-md
    div(
      :style=`{
        maxWidth: 800+'px',
        marginTop: node.items.length === 0 ? '100px' : '0px',
      }`).row.full-width.items-start.content-start
      //- div(
        :style=`{
          position: 'relative',
          borderRadius: '10px', overflow: 'hidden',
          background: 'rgb(35,35,35)'
        }`).row.full-width.justify-center
        //- div(
          @click="viewId = v.id"
          v-for="v in views" :key="v.id"
          :style=`{
            position: 'relative',
            //- width: '50px',
            height: '50px',
            background: v.id === viewId ? 'rgb(35,35,35)' : 'none',
            borderRadius: '10px 10px 0 0',
          }`
          v-ripple=`{color: 'green'}`
          ).col
          .row.fit.items-center.content-center.justify-center.cursor-pointer
            span(
              :class=`{
                'text-green': viewId === v.id,
                'text-grey-8': viewId !== v.id,
              }`) {{ v.name }}
            q-icon(:name="v.icon" :color="v.id === viewId ? 'green' : 'grey-6'" size="30px")
        //- .row.full-width.justify-end.q-pa-sm
        //- q-btn(
          color="green" no-caps @click="viewId = 'publish'"
          :style=`{
            position: 'absolute', zIndex: 2000, right: '8px', top: '8px',
          }`).br Publish
      component(
        :is="`view-${viewId}`"
        :node="node"
        :style=`{
          position: 'relative',
          borderRadius: '10px', overflow: 'hidden',
          background: 'rgb(35,35,35)',
          minHeight: '500px',
        }`
        @viewId="viewId = $event"
        @item="itemFound")
          //- q-btn(
            color="green" no-caps @click="viewId = 'publish'"
            :style=`{
              position: 'absolute', zIndex: 2000, right: '8px', top: '8px',
            }`).bg Publish
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
  props: {
    node: {type: Object}
  },
  data () {
    return {
      // node: {
      //   category: 'FUN',
      //   layout: 'SLIDER',
      //   name: '',
      //   description: '',
      //   items: [],
      //   spheres: [],
      // },
      viewId: 'add',
    }
  },
  computed: {
    views () {
      return [
        {id: 'add', name: 'Образы', icon: 'add'},
        {id: 'publish', name: 'Publish', icon: 'check'}
      ]
    },
    layoutName () {
      let layout = this.layouts.find(l => l.id === this.node.layout)
      if (layout) return layout.name
      else return ''
    },
    layouts () {
      return [
        {id: 'SLIDER', name: this.$t('Slider', 'Слайдер')},
        {id: 'HORIZONTAL', name: this.$t('Compare', 'Сравнение')},
        {id: 'VERTICAL', name: this.$t('Vertical', 'Портянка')}
      ]
    }
  },
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
      item.meta = {cover: true, timeout: 3000}
      this.node.items.push(item)
    },
    itemNext (item) {
      this.$log('itemNext', item)
      let itemIndex = this.node.items.findIndex(i => i.id === item.id)
      this.$log('itemNext itemIndex', itemIndex)
      if (itemIndex >= 0) {
        if (this.node.items[itemIndex + 1]) {
          let t = JSON.parse(JSON.stringify(this.node.items[itemIndex]))
          this.$set(this.node.items, itemIndex, this.node.items[itemIndex + 1])
          this.$set(this.node.items, itemIndex + 1, t)
        }
        else {
          alert('Nowhere to go!')
        }
      }
    },
    itemPrev (item) {
      this.$log('itemPrev', item)
      let itemIndex = this.node.items.findIndex(i => i.id === item.id)
      this.$log('itemPrev itemIndex', itemIndex)
      if (itemIndex >= 0) {
        if (this.node.items[itemIndex - 1]) {
          let t = JSON.parse(JSON.stringify(this.node.items[itemIndex]))
          this.$set(this.node.items, itemIndex, this.node.items[itemIndex - 1])
          this.$set(this.node.items, itemIndex - 1, t)
        }
        else {
          alert('Nowhere to go!')
        }
      }
    },
    itemDuplicate (item) {
      this.$log('itemDuplicate', item)
      let itemInput = JSON.parse(JSON.stringify(item))
      itemInput.id = Date.now().toString()
      this.node.items.push(itemInput)
    },
    itemRemove (item) {
      this.$log('itemRemove', item)
      let itemIndex = this.node.items.findIndex(i => i.id === item.id)
      if (itemIndex >= 0) {
        this.$delete(this.node.items, itemIndex)
      }
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
