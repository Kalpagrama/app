<template lang="pug">
div(
  :style=`{
    position: 'relative',
    borderRadius: '20px 20px 0 0',
  }`
  ).row.full-width.b-40
  //- body
  div(
    :style=`{
      zIndex: 10,
      //- background: 'rgba(0,0,0,0.5)',
      borderRadius: '20px 20px 0 0',
      paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
    }`
    ).row.full-width.q-px-md.q-pt-md
    .row.full-width
      img(
        :src="bookmark.thumbUrl"
        :style=`{
          height: '60px',
          maxWidth: '180px',
          objectFit: 'contain',
          borderRadius: '10px',
        }`).b-50
      .col
        div(:style=`{marginTop: '-10px'}`).row.full-width.justify-end
          q-btn(
            round flat color="white"
            :style=`{
              height: '70px',
              width: '70px',
            }`
            @click="bookmarkLaunch()"
            )
            q-icon(name="launch" size="78px")
    //- name and type
    .row.full-width.q-py-xs.q-px-sm
      span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ bookmark.name }}
      .row.full-width
        small.text-grey-8 {{bookmark.type}} {{$date(bookmark.createdAt)}}
    //- collections
    .row.full-width.text-grey-8.q-py-xs.q-px-sm
      .col.scroll
        .row.full-width.items-center.content-center.q-py-xs.no-wrap
          add-collection-btn(
            v-model="collectionsModel"
            :highlightSelected="false"
            :showDeleteButton="false"
            :showAllCollection="false"
            @collection-select="addCollectionToBookmark")
          q-btn(v-for="(c,ci) in bookmark.collections" :key="c" :label="getCollectionName(c)" @click="deleteCollectionFromButton(c)")
    //- isSubscribed
    .row.full-width.items-center.content-center.q-py-xs
      q-toggle(
        v-model="bookmark.isSubscribed"
        dark
        :label="$t('Receive updates')"
        :style=`{color: 'white'}`
        color="green").full-width
    //- delete
    .row.full-width.q-mt-xl
      q-btn(
        outline no-caps color="red"
        :loading="bookmarkDeleting"
        :style=`{
          height: '50px',
        }`
        @click="bookmarkDelete()"
        ).full-width
        span {{ $t('Delete bookmark') }}
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

export default {
  name: 'bookmarkEditor',
  props: {
    bookmark: {type: Object, required: true},
  },
  data () {
    return {
      collectionsModel: {collectionId: null, collections: []},
      bookmarkDeleting: false,
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
  },
  methods: {
    getCollectionName(collectionId) {
      let collection = this.collectionsModel.collections.find(el => el.id === collectionId)
      return collection ? collection.name : null
    },
    async addCollectionToBookmark(collectionId) {
      if (!this.bookmark.collections) this.bookmark.collections = []
      if (!this.bookmark.collections.find(cid => cid === collectionId)){
        this.bookmark.collections.push(collectionId)
      }
      // не используем this.collectionsModel.collections, тк при добавлении новой коллекции addCollectionToBookmark вызывается раньше, чем изменяется this.collectionsModel.collections
      let collection = await this.$rxdb.get(RxCollectionEnum.WS_COLLECTION, collectionId)
      if (collection) {
        if (!collection.bookmarks) collection.bookmarks = []
        if (!collection.bookmarks.find(bid => bid === this.bookmark.id)){
          collection.bookmarks.push(this.bookmark.id)
          collection.thumbUrl = this.bookmark.thumbUrl
        }
      }
    },
    deleteCollectionFromButton(collectionId){
      let indxC = this.bookmark.collections.findIndex(cid => cid === collectionId)
      if (indxC >= 0) this.bookmark.collections.splice(indxC, 1)
      let collection = this.collectionsModel.collections.find(el => el.id === collectionId)
      if (collection) {
        let indxB = collection.bookmarks.findIndex(bid => bid === this.bookmark.id)
        if (indxB >= 0) collection.bookmarks.splice(indxB, 1)
      }
    },
    bookmarkLaunch () {
      this.$log('bookmarkLaunch')
      this.$router.push(this.bookmarkMeta.link)
    },
    async bookmarkDelete () {
      this.$log('bookmarkDelete start')
      this.bookmarkDeleting = true
      await this.$wait(1000)
      await this.bookmark.remove(true)
      this.bookmarkDeleting = false
      this.$log('bookmarkDelete done')
      this.$emit('deleted')
    },
  },
  async mounted () {
    this.$log('mounted')
  }
}
</script>
