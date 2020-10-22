<template lang="pug">
div(
  :style=`{
    borderRadius: '10px 10px 0 0',
  }`
  ).row.full-width.items-start.content-start.b-30
  //- header
  div(
    :style=`{height: '60px',}`
    ).row.full-width.items-center.content-center.q-px-sm
    span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-ml-sm Добавить элементы
    .col
    q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  //- tabs
  .row.full-width.q-px-md
    q-tabs(
      v-model="viewId"
      no-caps dense active-color="green" align="left"
      :switch-indicator="false"
      ).full-width.text-grey-8
      q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
  //- views
  .row.full-width
    //- from-subs(v-if="viewId === 'subs'")
    component(
      :is="viewId"
      mode="pick")
      template(v-slot:tint=`{item, itemKey}`)
        div(
          @click="itemClick(item)"
          :style=`{
            position: 'absolute', zIndex: 500,
          }`
          ).row.fit.cursor-pointer
</template>

<script>
import fromSubs from './from_subs.vue'
import wsContents from 'pages/app/ws_contents/index.vue'
import wsNodes from 'pages/app/ws_nodes/index.vue'

// import wsBookmarks from 'pages/app/ws_bookmarks/index.vue'
export default {
  name: 'wsFeed_itemFinder',
  components: {fromSubs, wsContents, wsNodes},
  data () {
    return {
      name: '',
      viewId: 'from-subs',
    }
  },
  computed: {
    views () {
      return [
        {id: 'from-subs', name: 'Все Закладки'},
        {id: 'ws-contents', name: 'Контент'},
        {id: 'ws-nodes', name: 'Ядра'},
        {id: 'ws-joints', name: 'Связи'}
      ]
    }
  },
  methods: {
    async itemClick (item) {
      this.$log('itemClick', this.viewId, item)
      // store item raw or not ?
      let itemInput
      if (this.viewId === 'from-subs') {
        // this.$emit('item', item)
        itemInput = {
          id: item.id,
          oid: item.oid,
          name: item.name,
          thumbUrl: item.thumbUrl,
          type: item.type,
          wsItemType: item.wsItemType,
        }
      }
      else if (this.viewId === 'ws-contents') {
        itemInput = {
          id: item.id,
          oid: item.oid,
          name: item.name,
          thumbUrl: item.thumbUrl,
          type: item.type,
          wsItemType: item.wsItemType,
        }
      }
      else if (this.viewId === 'ws-nodes') {
        itemInput = {
          id: item.id,
          oid: item.oid,
          name: item.name,
          thumbUrl: item.items[0] ? item.items[0].thumbUrl : '',
          type: item.type,
          wsItemType: item.wsItemType,
        }
      }
      else if (this.viewId === 'ws-joints') {
      }
      this.$emit('item', itemInput)
    }
  }
}
</script>
