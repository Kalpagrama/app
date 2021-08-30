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
      @click="mode === 'select' ? $emit('item', bookmark) : null"
      ).row.full-width.items-start.content-start.cursor-pointer
      //- preview, but not for sphere...
      img(
        v-if="bookmark.type !== 'SPHERE' && !thumbUrlErrored"
        @error="thumbUrlErrorHandle"
        draggable="false"
        :src="bookmark.thumbUrl"
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
          width: '50px',
        }`
        ).row.items-center.content-center.justify-center
        q-icon(name="blur_on" color="white" size="30px")
      //- right side
      .col
        div(:style=`{minHeight: '50px',}`).row.full-width.items-start.content-start.q-pt-sm.q-px-sm
          //- bookmark name
          div(:style=`{minHeight:'32px',}`).row.full-width
            span(:style=`{lineHeight: 1.1,}`).text-white {{ bookmark.name }}
          .row.full-width.q-py-xs
            small.text-grey-8 {{ type }}
            .col
            small.text-grey-8 {{ $date(bookmark.createdAt) }}
  //- right
  q-btn(
    v-if="mode !== 'select' && showMenuBtn"
    round flat color="grey-8" icon="more_vert"
    @click="$emit('item', bookmark)"
    ).q-mt-xs.q-mr-xs
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import {objectTypeName, objectUrl} from '../../system/common/object_info';

export default {
  name: 'bookmarkListItem',
  props: {
    bookmark: {
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
      thumbUrlErrored: false
    }
  },
  computed: {
    link() {
      return objectUrl(this.bookmark)
    },
    type() {
      return objectTypeName(this.bookmark)
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
            await this.bookmark.remove(true)
          }
        }
      }
    }
  },
  methods: {
    async thumbUrlErrorHandle (e) {
      this.$log('thumbUrlErrorHandle', e)
      // get bookmarkFresh to refresh thumbs and names and any dynamic info...
      let bookmarkFresh = await this.$rxdb.get(RxCollectionEnum.OBJ, this.bookmark.oid)
      this.bookmark.thumbUrl = bookmarkFresh.thumbUrl
      this.bookmark.name = bookmarkFresh.name
    }
  }
}
</script>
