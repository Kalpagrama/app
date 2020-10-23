<template lang="pug">
.row.full-width.justify-center.items-start.content-start.q-pt-md
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
    //- q-btn(
      @click="$emit('viewId', 'publish')"
      color="green" no-caps icon-right="keyboard_arrow_right"
      :style=`{
        position: 'absolute', zIndex: 2000, right: '8px', top: '0px',
      }`).q-px-md Далее
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
export default {
  name: 'nodeEditor_viewAdd',
  components: {
    fromGifs: () => import('./from-gifs.vue'),
    fromContent: () => import('./from-content.vue'),
    fromNodes: () => import('./from-nodes.vue')
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
      let itemInput
      if (fromId === 'gifs') {
        let url = item.media[0].mediumgif.url
        itemInput = {
          id: Date.now().toString(),
          thumbUrl: item.media[0].mediumgif.url,
          outputType: 'IMAGE',
          layers: [
            {id: Date.now().toString(), contentOid: null, figuresAbsolute: [{t: null, points: []}]},
          ],
          operation: { items: null, operations: null, type: 'CONCAT'},
        }
        // do not create content in kalpa before the CONNECT...?
        // let content = await ContentApi.contentCreateFromUrl(url)
        // this.$log('content', content)
        // if ii === 0 make a switch of items?
        // this.$set(this, 'rightItem', itemInput)
      }
      this.$log('itemInput', itemInput)
      this.$emit('item', itemInput)
      // set itemInput in leftItem/rightItem...
      // go on top to see what uve done...
    },
  }
}
</script>
