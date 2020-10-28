<template lang="pug">
q-layout(
  view="hHh Lpr lff" container
  :style=`{
    height: $q.screen.height+'px',
    borderRadius: '10px',
  }`).b-30
  q-header(reveal).b-30
    div(
      :style=`{height: '68px',}`
      ).row.full-width.items-center.content-center.q-px-sm.b-30
      span(:style=`{fontSize: '18px'}`).text-white.text-bold.q-ml-sm Добавить элементы
      .col
      q-btn(round flat color="white" icon="clear" @click="$emit('close')")
  q-page-container
    feed(id="all")
      template(v-slot:tint=`{item}`)
        div(
          :style=`{
            position: 'absolute', zIndex: 200,
          }`
          ).row.fit
          div(
            v-if="item && items.includes(item.id)"
            @click="$emit('itemDelete', item)"
            :style=`{
              background: 'rgba(0,0,0,0.3)',
              borderRadius: '10px',
            }`
            ).row.fit.items-center.content-center.justify-end.q-pa-md.cursor-pointer
            q-checkbox(
              v-if="item"
              color="green"
              :value="true"
              )
          div(
            v-else
            @click="$emit('itemAdd', item)"
            :style=`{
              borderRadius: '10px',
            }`
            ).row.fit.cursor-pointer
</template>

<script>
import feed from 'pages/app/ws_feed/feed.vue'

export default {
  name: 'wsFeed_itemFinder',
  props: ['items'],
  components: {feed},
  data () {
    return {
    }
  },
  methods: {
    async itemClick (item) {
      this.$log('itemClick', item)
      // // store item raw or not ?
      // let itemInput
      // if (this.viewId === 'from-subs') {
      //   // this.$emit('item', item)
      //   itemInput = {
      //     id: item.id,
      //     oid: item.oid,
      //     name: item.name,
      //     thumbUrl: item.thumbUrl,
      //     type: item.type,
      //     wsItemType: item.wsItemType,
      //   }
      // }
      // else if (this.viewId === 'ws-contents') {
      //   itemInput = {
      //     id: item.id,
      //     oid: item.oid,
      //     name: item.name,
      //     thumbUrl: item.thumbUrl,
      //     type: item.contentType,
      //     wsItemType: item.wsItemType,
      //   }
      // }
      // else if (this.viewId === 'ws-nodes') {
      //   itemInput = {
      //     id: item.id,
      //     oid: item.oid,
      //     name: item.name,
      //     thumbUrl: item.items[0] ? item.items[0].thumbUrl : '',
      //     type: item.type,
      //     wsItemType: item.wsItemType,
      //   }
      // }
      // else if (this.viewId === 'ws-joints') {
      // }
      // this.$emit('item', itemInput)
    }
  }
}
</script>
