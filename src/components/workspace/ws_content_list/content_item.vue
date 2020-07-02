<template lang="pug">
component(
  v-if="content && contentKalpa"
  :is="component[content.contentType]"
  :content="content"
  :contentKalpa="contentKalpa"
  @pick="$emit('pick')"
  @delete="$emit('delete')"
  @rename="$emit('rename')")
//- div(
//-   @mousenter="mouseIsOver = true"
//-   @mouseleave="mouseIsOver = false"
//-   :style=`{
//-     position: 'relative',
//-     height: '100px',
//-     borderRadius: $store.state.ui.borderRadius+'px',
//-     overflow: 'hidden',
//-   }`
//-   ).row.full-width.items-center.content-center.q-mb-sm.b-60.content-item
//-   //- thumb
//-   div(
//-     @click="$emit('pick')"
//-     :style=`{
//-       position: 'relative',
//-       width: '180px', height: '100px',
//-       borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
//-     ).row.items-center.content-center.justify-center.b-80
//-     img(
//-       v-if="!thumbErrored"
//-       @error="thumbErrorHandle"
//-       :src="content.thumbOid"
//-       draggable="false"
//-       :style=`{objectFit: 'cover', userSelect: 'none'}`).fit
//-     q-icon(
//-       v-if="thumbErrored"
//-       name="photo" size="150px" :style=`{color: 'rgb(90,90,90)'}`).full-width
//-     //- video stats duration
//-     small(
//-       v-if="contentKalpa"
//-       :style=`{
//-         position: 'absolute', zIndex: 200,
//-         transform: 'translate3d(0,0,0)',
//-         right: '4px', bottom: '4px',
//-         borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden',
//-         background: 'rgba(0,0,0,0.5)',
//-         pointerEvents: 'none',
//-         userSelect: 'none',
//-       }`
//-       ).q-px-sm.q-py-xs.text-white {{ $time(contentKalpa.duration) }}
//-   //- center name
//-   div(
//-     @click="$emit('pick')"
//-     :style=`{position: 'relative'}`).col.full-height
//-     .row.fit.items-start.content-start.q-pa-sm
//-       span(:style=`{userSelect: 'none', lineHeight: 1.2}`).text-white.text-bold {{ contentName }}
//-   //- stats
//-   q-btn(
//-     v-if="content.layers.length > 0"
//-     flat dense color="grey-5"
//-     icon-right="layers"
//-     :style=`{
//-       position: 'absolute', right: '3px', bottom: '4px', zIndex: 1000,
//-     }`)
//-     small {{ content.layers.length }}
//-   //- right
//-   div(
//-     v-if="ctx === 'workspace'"
//-     :style=`{}`).row.full-height.items-start.content-start.q-pa-xs
//-     q-btn(round flat dense color="grey-6" icon="more_vert")
//-       kalpa-menu-popup(:actions="actions")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
// TODO: different content types and items...
import itemVideo from './item_video'
import itemImage from './item_image'

export default {
  name: 'contentItem',
  components: {itemVideo, itemImage},
  props: ['ctx', 'content'],
  data () {
    return {
      contentKalpa: null,
      mouseIsOver: false,
      thumbErrored: false,
      component: {
        VIDEO: 'item-video',
        IMAGE: 'item-image',
        BOOK: 'item-book',
        WEB: 'item-web',
      }
    }
  },
  computed: {
    contentName () {
      if (this.$q.screen.xs) return this.content.name.slice(0, 70)
      else return this.content.name.slice(0, 200)
    },
    actions () {
      return {
        edit: {
          name: 'Edit',
          fn: () => {
            this.$emit('edit')
          }
        },
        explore: {
          name: 'Explore',
          fn: () => {
            this.$emit('explore')
          }
        },
        delete: {
          name: 'Delete',
          fn: async () => {
            this.$emit('delete')
          }
        }
      }
    }
  },
  methods: {
    thumbErrorHandle () {
      // this.$log('thumbErrorHandle')
      this.thumbErrored = true
    },
  },
  async mounted () {
    // this.$log('mounted')
    this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.content.contentOid)
  }
}
</script>
