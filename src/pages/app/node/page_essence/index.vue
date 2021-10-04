// сферы + суть + автор + голосовалка
<template lang="pug">
div(v-if="node").row.full-width
  .row.full-width
    // spheres
    .row.full-width
      .col
        essence-spheres(v-if="node.spheres.length > 0" :node="node" :itemState="itemState")
      // description expand btn
      q-btn(v-if="node.description" round flat dense icon="expand_more" color="white" @click="$emit('description')")
    // суть
    .row.full-width
      .row.col.justify-center
        span(:style=`{fontSize: fontSize+'px', textAlign: 'center', position: 'relative'}` @click="$emit('essences')").text-white.cursor-pointer {{node.name}}
          //q-badge(v-if="sameCompositionNodesItemsRes && sameCompositionNodesItemsRes.items.length > 1"
          //  align="top" dark rounded color="green") {{sameCompositionNodesItemsRes.items.length}}
          //q-icon(v-else name="fas fa-plus" size="10px" color="green" :style=`{right: '-14px', top: '5px'}`).absolute-top-right
  essence-actions(
    :essence="node"
    :itemState="itemState"
    :nodeBackgroundColor="'rgb(30,30,30)'"
    :nodeActionsColor="'rgb(200,200,200)'"
    :isActive="true"
    :isVisible="true")
  // author
  q-btn(:to="'/user/'+node.author.oid" size="sm" round flat color="grey" no-caps padding="none").q-pl-sm
    q-avatar(:size="'20px'")
      img(:src="node.author.thumbUrl" :to="'/user/'+node.author.oid")
    span() {{node.author.name}}
</template>

<script>
import essenceSpheres from 'src/components/essence/essence_spheres'
import essenceActions from 'src/components/essence/essence_actions.vue'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageEssences',
  components: {
    essenceSpheres,
    essenceActions
  },
  props: ['oid'],
  data () {
    return {
      node: null,
    }
  },
  watch: {
  },
  async created () {
    this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, this.oid)
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
