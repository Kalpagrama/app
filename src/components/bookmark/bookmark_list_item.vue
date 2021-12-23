<style lang="sass" scoped>
.bookmark-item
  &:hover
    background: rgb(45,45,45) !important
</style>

<template lang="pug">
div(
  :style=`{
    position: 'relative',
    minHeight: '50px',
    background: 'rgb(35,35,35)',
    borderRadius: '10px',
    maxWidth: Math.min($store.state.ui.pageWidth, $q.screen.width)+'px'
  }`
  ).row.full-width.items-start.content-start.bookmark-item
  //- left
  .col
    component(
      :is="mode === 'select' ? 'div' : 'router-link'"
      :to="link"
      :style=`{
        minHeight: '50px',
      }`
      @click="mode === 'select' ? $emit('item', item) : null"
      ).row.full-width.items-start.content-start.cursor-pointer
      //- preview, but not for sphere...
      img(
        v-if="!item.type.in('WORD', 'SENTENCE', 'CHAR') && !thumbUrlErrored"
        @error="thumbUrlErrorHandle"
        draggable="false"
        :src="item.thumbUrl"
        :style=`{
          height: '50px',
          minWidth: '90px',
          maxWidth: '90px',
          borderRadius: '10px',
          objectFit: 'contain',
        }`).b-40.q-mt-sm.q-ml-sm.q-mb-sm
      //- special case is sphere...
      div(
        v-else
        :style=`{
          height: '50px',
          minWidth: '90px',
          maxWidth: '90px',
        }`
        ).row.items-center.content-center.justify-center.q-mt-sm.q-ml-sm.q-mb-sm
        q-icon(name="blur_on" color="white" size="50px")
      //- right side
      .col
        div(:style=`{minHeight: '50px',}`).row.full-width.items-start.content-start.q-pt-sm.q-px-sm
          //- item name
          div(:style=`{minHeight:'32px', overflow: 'hidden'}`).row.full-width
            span(:style=`{lineHeight: 1.1,}`).text-white {{ item.name }}
          .row.full-width.q-py-xs
            small.text-grey-8 {{ type }}
            .col
            small.text-grey-8 {{ $date(item.createdAt) }}
  //- right
  q-btn(
    v-if="mode !== 'select' && showMenuBtn"
    round flat color="grey-8" icon="more_vert"
    @click="$emit('item', item)"
    ).q-mt-xs.q-mr-xs
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import {objectTypeName, objectUrl} from '../../system/common/object_info';

export default {
  name: 'bookmarkListItem',
  props: {
    item: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
    },
    showMenuBtn: {type: Boolean, default: true}
  },
  data () {
    return {
      // origIndx: null,
      thumbUrlErrored: false
    }
  },
  computed: {
    link() {
      return objectUrl(this.item)
    },
    type() {
      return objectTypeName(this.item)
    },
    actions () {
      return {
        launch: {
          name: 'Перейти',
          cb: () => {
            this.$log('launch')
            this.$router.push(this.link)
          }
        },
        delete: {
          name: 'Удалить',
          cb: async () => {
            this.$log('delete')
            await this.item.remove(true)
          }
        }
      }
    }
  },
  methods: {
    async thumbUrlErrorHandle (e) {
      this.$log('thumbUrlErrorHandle', e)
      // get itemFresh to refresh thumbs and names and any dynamic info...
      let itemFresh = await this.$rxdb.get(RxCollectionEnum.OBJ, this.item.oid)
      this.item.thumbUrl = itemFresh.thumbUrl
      this.item.name = itemFresh.name
    }
  },
  mounted () {
    // this.$log('mounted!!!',)
  }
}
</script>
