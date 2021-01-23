<template lang="pug">
div(
  :style=`{
    background: 'rgb(35,35,35)',
    borderRadius: '10px',
  }`
  ).row.full-width
  router-link(
    v-if="bookmarkMeta"
    :to="bookmarkMeta.link"
    :style=`{
      minHeight: '60px',
    }`
    ).col
    .row.full-width.items-center.content-center
      div(
        v-if="bookmark.type !== 'SPHERE'"
        ).row.full-height.items-center.content-center
        img(
          v-if="!thumbUrlErrored"
          draggable="false"
          :src="bookmark.thumbUrl"
          :style=`{
            height: '50px',
            borderRadius: '10px',
          }`
          @error="thumbUrlErrorHandle").b-50
        div(
          v-if="thumbUrlErrored"
          :style=`{
            height: '50px',
            width: '50px',
          }`
          ).row
      q-icon(
        v-if="bookmark.type === 'SPHERE'"
        name="blur_on" color="white" size="30px"
        ).q-pa-sm
      .col
      small.text-grey-8 {{ $date(bookmark.createdAt) }}
    //- details
    div(
      :style=`{
        minHeight: '60px',
      }`
      ).row.full-width.items-center.content-center.q-pa-sm
      span.text-white {{ bookmarkMeta.name }}
      div(
        v-if="bookmarkMeta.type"
        ).row.full-width
        span.text-grey-8 {{ bookmarkMeta.type }}
  //- right: actions
  .row.full-height.items-start.content-start.q-pt-sm.q-pr-sm
    kalpa-menu-actions(:actions="actions" icon="more_vert" color="grey-8" :dense="true")
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'pageBookmarks_itemContent',
  props: ['bookmark'],
  data () {
    return {
      thumbUrlErrored: false
    }
  },
  computed: {
    bookmarkMeta () {
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
      else if (this.bookmark.type === 'SPHERE') {
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
            this.$router.push(this.itemLink)
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
