// сферы + суть + автор + голосовалка
<template lang="pug">
.row.full-width
  div(v-if="node").row.full-width
    // description expand btn
    q-btn(v-if="node.description" round flat dense icon="expand_more" color="grey-5" @click="$emit('description-show')" :style=`{zIndex: '100'}`).absolute-top-right
    // сферы + суть
    .row.full-width
      .row.full-width.col
        // суть
        .row.full-width.q-py-xs
          .row.col.justify-center.items-center
            span(:style=`{fontSize: fontSize+'px', textAlign: 'center', position: 'relative'}` @click="$emit('essences-show')").text-white.cursor-pointer {{node.name}}
              q-badge(v-if="$slots.badge" align="top" dark rounded color="green")
                slot(name="badge")
              //q-icon(v-else name="fas fa-plus" size="10px" color="green" :style=`{right: '-14px', top: '5px'}`).absolute-top-right
        // spheres
        div(:style=`{minHeight: '32px'}`).row.full-width.content-start
          essence-spheres(:node="node" :itemState="itemState")
    // голосовалка
    .row.full-width.q-px-xs
      slot(name="actions-left")
      .col
        essence-actions(
          :essence="node"
          :itemState="itemState"
          :nodeBackgroundColor="'rgb(30,30,30)'"
          :nodeActionsColor="'rgb(200,200,200)'"
          :isActive="true"
          :isVisible="true").q-pb-lg
      slot(name="actions-right")
    // author + просмотры
    .row.full-width.justify-between.q-px-sm
      q-btn(:to="'/user/'+node.author.oid" size="sm" round flat no-caps padding="none" :style=`{zIndex: '100'}`).q-pr-sm
        q-avatar(:size="'25px'" :style=`{position:'relative', overflow: 'hidden'}`).q-mr-xs
          //img(:src="node.author.thumbUrl" :to="'/user/'+node.author.oid")
          img(:src="node.author.thumbUrl" :to="'/user/'+node.author.oid")
          div(:style=`{background: 'rgba(0,0,0,0.4)', zIndex: '50'}`).fit.absolute
        .column.items-start
          span.text-grey-5 {{node.author.name}}
          small(:style=`{marginTop: '-7px'}`).text-grey-7.text-italic 4тыс подписчиков
      //q-btn(round flat padding="none" no-caps=false size="sm" color="green-8" :label="$t('подписаться')").col
      small(size="sm").row.items-center.text-grey-7.text-italic {{node.countStat.countViews}} {{$getNoun(node.countStat.countViews,$t('просмотр'),$t('просмотра'),$t('просмотров'))}}
    //widget-images(
    //  :node="node"
    //  :imagesNodes="imagesNodes"
    //  :imagesNodesIndx="imagesNodesIndx"
    //  @set-node="$emit('set-node', $event)" @images-show="$emit('images-show', $event)").full-width.q-pt-md
  div(v-else).row.full-width.q-px-sm
    .row.full-width.items-center
      q-skeleton(v-for="(i, ix) in 4" type="text" dark animation="none" :style=`{height: '20px'}`).col.q-mx-xs
    q-skeleton(type="QAvatar" dark size="30px" animation="none")
    .row.full-width.q-px-xl
      q-skeleton(type="QBtn" dark animation="fade").full-width
    q-skeleton(v-for="(i, ix) in 4" type="text" dark animation="none" :style=`{height: '60px'}`).col.q-mx-lg
</template>

<script>
import essenceSpheres from 'src/components/essence/essence_spheres'
import essenceActions from 'src/components/essence/essence_actions.vue'
import widgetImages from '../widget_images/index.vue'
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageEssences',
  components: {
    essenceSpheres,
    essenceActions,
    widgetImages,
  },
  props: ['oid', 'imagesNodes', 'imagesNodesIndx'],
  data () {
    return {
      node: null,
    }
  },
  watch: {
    oid: {
      immediate: true,
      async handler(to, from){
        this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, to)
      }
    }
  },
  computed: {
    fontSize () {
      let l = this.node.name.length
      if (l < 20) return 20
      else if (l < 30) return 16
      else if (l < 40) return 14
      else return 12
    }
  },
  async created () {
    this.$log('created')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
