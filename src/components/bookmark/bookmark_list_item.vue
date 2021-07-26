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
      :to="bookmarkMeta.link"
      :style=`{
        minHeight: '50px',
      }`
      @click="mode === 'select' ? $emit('bookmark', bookmark) : null"
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
            small.text-grey-8 {{ bookmarkMeta.type }}
            .col
            small.text-grey-8 {{ $date(bookmark.createdAt) }}
  //- right
  q-btn(
    v-if="mode !== 'select' && showMenuBtn"
    round flat color="grey-8" icon="more_vert"
    @click="$emit('bookmark', bookmark)"
    ).q-mt-xs.q-mr-xs
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

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
    bookmarkMeta () {
      // alert(JSON.stringify(this.bookmark))
      if (['VIDEO', 'IMAGE', 'BOOK'].includes(this.bookmark.type)) {
        let typesNames = {
          VIDEO: 'Видео',
          IMAGE: 'Изображение',
          BOOK: 'Книга'
        }
        return {
          link: '/content/' + this.bookmark.oid,
          name: this.bookmark.name,
          type: typesNames[this.bookmark.type]
        }
      }
      else if (this.bookmark.type === 'NODE') {
        return {
          link: '/node/' + this.bookmark.oid,
          name: this.bookmark.name,
          type: null
        }
      }
      else if (this.bookmark.type.in('SPHERE', 'SENTENCE', 'WORD')) {
        return {
          link: '/sphere/' + this.bookmark.oid,
          name: this.bookmark.name,
          type: null
        }
      }
      else if (this.bookmark.type === 'JOINT') {
        return {
          link: '/joint/' + this.bookmark.oid,
          name: this.bookmark.name || 'Связь',
          type: null
        }
      }
      else if (this.bookmark.type === 'USER') {
        return {
          link: '/user/' + this.bookmark.oid,
          name: this.bookmark.name,
          type: null
        }
      }
      else {
        return {
          link: '/workspace/bookmarks',
          name: null,
          type: null,
        }
      }
    },
    actions () {
      return {
        launch: {
          name: 'Перейти',
          cb: () => {
            this.$log('launch')
            this.$router.push(this.bookmarkMeta.link)
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
