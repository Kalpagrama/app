// сферы + суть + автор + голосовалка
<template lang="pug">
div(:style=`{minHeight: '215px'}`).row.full-width
  div(v-if="node" :style=`{minHeight: '215px', position: 'relative'}`).row.full-width
    div(:style=`{}`).row.absolute-left
      slot(name="left")
    div(:style=`{}`).row.absolute-right
      slot(name="right")
    // description expand btn
    q-btn(v-if="node.description" round flat dense icon="expand_more" color="grey-5" @click="$emit('description')" :style=`{zIndex: '100'}`).absolute-top-right
    // сферы + суть
    .row.full-width
      .row.full-width.col
        // spheres
        .row.full-width
          .col
            essence-spheres(v-if="node.spheres.length > 0" :node="node" :itemState="itemState")
            div(v-else :style=`{height: '25px'}`).full-width
        // author
        .row.full-width.justify-left.q-pl-xs
          q-btn(:to="'/user/'+node.author.oid" size="sm" round flat color="grey-7" no-caps padding="none" :style=`{zIndex: '100'}`).q-mr-none
            q-avatar(:size="'25px'" :style=`{position:'relative', overflow: 'hidden'}`).q-mr-xs
              //img(:src="node.author.thumbUrl" :to="'/user/'+node.author.oid")
              img(:src="node.author.thumbUrl" :to="'/user/'+node.author.oid")
              div(:style=`{background: 'rgba(0,0,0,0.4)', zIndex: '50'}`).fit.absolute
            span() {{node.author.name}}
        // суть
        .row.full-width.q-pb-sm
          .row.col.justify-center.items-center
            span(:style=`{fontSize: fontSize+'px', textAlign: 'center', position: 'relative'}` @click="$emit('essences')").text-white.cursor-pointer {{node.name}}
              q-badge(v-if="$slots.badge" align="top" dark rounded color="green")
                slot(name="badge")
              //q-icon(v-else name="fas fa-plus" size="10px" color="green" :style=`{right: '-14px', top: '5px'}`).absolute-top-right
    essence-actions(
      :essence="node"
      :itemState="itemState"
      :nodeBackgroundColor="'rgb(30,30,30)'"
      :nodeActionsColor="'rgb(200,200,200)'"
      :isActive="true"
      :isVisible="true").q-px-xl
    // comments
    .row.full-width.content-end.q-pt-md
      div(@click="$emit('comments')").cursor-pointer.row.full-width.items-center
        // div(:style=`{height: '1px', background: 'rgb(40,40,40)'}`).full-width
        span.text-grey-5.q-px-sm {{$t('Comments')}}
        span.text-grey-8 {{node.countStat.countComments}}
        .col
        q-btn(round flat dense :icon="pageId ? 'expand_less' : 'expand_more'" color="grey-5" :style=`{zIndex: '100'}`  @click="$emit('comments')")
        div(v-if="node.commentStat.topComment").row.full-width.items-center
          q-avatar(:size="'25px'" :style=`{position:'relative', overflow: 'hidden'}`).q-mx-xs.q-mb-xs
            img(:src="node.commentStat.topComment.author.thumbUrl" :to="'/user/'+node.commentStat.topComment.author.oid")
            div(:style=`{background: 'rgba(0,0,0,0.4)', zIndex: '50'}`).fit.absolute
          .col.content-center.q-px-xs
            span.text-grey.text-weight-thin.text-italic.q-pr-md {{node.commentStat.topComment.text.substring(0, 77)}}{{node.commentStat.topComment.text.length>77?'...':''}}
          //q-btn(v-for="(c,id) in node.commentStat.randomComments" :key="id"
          //  :to="'/user/'+c.author.oid" size="sm" round flat color="grey" no-caps padding="none"
          //  :style=`{ whiteSpace: 'nowrap' }`).q-pl-xs
          //  q-avatar(:size="'20px'" :style=`{position:'relative', overflow: 'hidden'}`)
          //    img(:src="c.author.thumbUrl" :to="'/user/'+c.author.oid")
          //    div(:style=`{background: 'rgba(0,0,0,0.4)', zIndex: '50'}`).fit.absolute
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
    this.node = await this.$rxdb.get(RxCollectionEnum.OBJ, this.oid)
  },
  beforeDestroy () {
    // this.$log('beforeDestroy')
  }
}
</script>
