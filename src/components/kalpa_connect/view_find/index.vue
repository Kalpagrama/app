<template lang="pug">
.row.full-width.justify-center.items-start.content-start.q-pt-md
  //- tabs
  div(:style=`{position: 'relative',}`).row.full-width.q-px-md
    q-tabs(
      v-model="fromId"
      active-color="green" no-caps
      :style=`{
        fontWeight: 'bold'
      }`
      ).full-width.text-grey-6.text-bold
      q-tab(
        v-for="v in froms" :key="v.id" :name="v.id"
        :style=`{
          fontWeight: 'bold'
        }`)
        span(:style=`{fontSize: '1rem'}`).text-bold {{v.name}}
  //- from component
  component(
    :is="`from-${fromId}`"
    @item="itemFound")
    //- NEED TO EXPOSE TINT SLOT WITH ITEM PROP WITH UNIQUE ID !
    template(v-slot:tint=`{item, itemKey}`)
      div(
        v-if="item && itemKey"
        :style=`{
          position: 'absolute', zIndex: 300,
          borderRadius: '10px', overflow: 'hidden',
        }`
        @mouseenter="itemOver = itemKey"
        @mouseleave="itemOver = null"
        ).row.fit
        div(
          v-if="itemOver === itemKey"
          @click="itemClick(fromId, item)"
          ).row.fit.items-center.content-center.justify-center.cursor-pointer
          q-icon(name="add" size="50px" color="green")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'kalpaConnect_viewFind',
  components: {
    fromContent: () => import('./from_content.vue'),
    fromNodes: () => import('./from_nodes.vue'),
    fromGifs: () => import('./from_gifs.vue'),
  },
  data () {
    return {
      fromId: 'content',
      itemOver: '',
    }
  },
  computed: {
    froms () {
      return [
        { id: 'content', name: this.$t('Content', 'Контент') },
        { id: 'nodes', name: this.$t('Nodes', 'Ядра') },
        { id: 'gifs', name: this.$t('GIFs', 'Гифки') },
      ]
    }
  },
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
      this.$emit('item', item)
    },
    async itemClick (fromId, item) {
      this.$log('itemClick', fromId, item)
      let itemInput = null
      // if (fromId === 'gifs') {
      //   let url = item.media[0].mediumgif.url
      //   itemInput = {
      //     id: Date.now().toString(),
      //     thumbUrl: item.media[0].mediumgif.url,
      //     outputType: 'IMAGE',
      //     layers: [
      //       {id: Date.now().toString(), contentOid: null, figuresAbsolute: [{t: null, points: []}]},
      //     ],
      //     operation: { items: null, operations: null, type: 'CONCAT'},
      //   }
      //   // do not create content in kalpa before the CONNECT...?
      //   // let content = await ContentApi.contentCreateFromUrl(url)
      //   // this.$log('content', content)
      //   // if ii === 0 make a switch of items?
      //   // this.$set(this, 'rightItem', itemInput)
      // }
      if (fromId === 'nodes') {
        // get node from ws_bookmark
        if (item.wsItemType === 'WS_BOOKMARK') {
          itemInput = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
        }
        // if we got node with oid
        else {
          if (item.oid && item.type === 'NODE') {
            itemInput = item
          }
        }
      }
      else if (fromId === 'content') {
        itemInput = item
      }
      else if (fromId === 'gifs') {
        itemInput = {
          name: '',
          thumbUrl: item.media[0].mediumgif.url,
          type: 'CONTENT',
          oid: null,
        }
      }
      this.$log('itemInput', itemInput)
      this.$emit('item', itemInput)
    },
  }
}
</script>
