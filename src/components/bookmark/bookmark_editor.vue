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
    ).row.full-width.q-px-md.q-pt-xs
      // preview + name + type
      div(v-if="showHeader").row.full-width
        .row.full-width.q-pt-sm
          img(
            :src="bookmark.thumbUrl"
            :style=`{
            height: '60px',
            maxWidth: '120px',
            objectFit: 'cover',
            borderRadius: '10px',
          }`).b-50.justify-center
          .col
            .row.full-width.justify-end
              q-btn(round flat color="white" icon="clear" v-close-popup)
              //q-btn(
              //  round flat color="white"
              //  :style=`{
              //    height: '70px',
              //    width: '70px',
              //  }`
              //  @click="bookmarkLaunch()"
              //  )
              //  q-icon(name="launch" size="78px")
        //- name and type
        .row.full-width.q-py-xs.q-px-sm
          span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ bookmark.name }}
          .row.full-width
            small.text-grey-8 {{type}} {{$date(bookmark.createdAt)}}
      //- collections
      div(v-if="!showHeader").row.full-width
        .row.full-width.items-center.justify-center.text-white.text-h6 {{$t('Bookmark menu')}}
        .col
          div(:style=`{
          position: 'relative',
          left: '11px'
            }`
          ).row.full-width.justify-end
            q-btn(round flat color="white" icon="clear" v-close-popup)
      .row.full-width.items-center.content-center.text-white.q-py-xs.wrap
        collectionList(
          v-model="collectionsModel"
          :highlightSelected="true"
          :showDeleteButton="false"
          :showAllCollection="false").q-ma-xs
      div(:style=`{
        content: '',
        width: '100%',
        height: '1px',
        background: 'rgb(73,66,61)',}`).q-my-xs
      //- delete
      .col-3.q-py-xs.no-wrap.justify-center.q-mt-xs.content-center.items-center
        q-btn(
          outline no-caps color="red"
          icon="delete"
          :loading="bookmarkDeleting"
          :style=`{
          height: '50px', position: 'absolute',
        }`
          @click="bookmarkDelete()"
        )
          q-tooltip(dense dark) {{$t('Delete bookmark')}}
      //- isSubscribed
      .row.q-py-xs.no-wrap.q-mt-xs.full-width.justify-center
        q-toggle(
          v-model="bookmark.isSubscribed"
          dark
          :label="$t('Receive updates')"
          :style=`{color: 'white'}`
          color="green")
</template>

<script>
import {RxCollectionEnum} from 'src/system/rxdb'
import {objectTypeName, objectUrl} from '../../system/common/object_info';
import differenceWith from 'lodash/differenceWith'
import cloneDeep from 'lodash/cloneDeep'
import {assert} from '../../system/common/utils';

export default {
  name: 'bookmarkEditor',
  props: {
    bookmark: {type: Object, required: true},
    showHeader: {type: Boolean, default: true},
  },
  data() {
    return {
      collectionsModel: {collectionId: null, collections: [], selectedCollectionIds: []},
      bookmarkDeleting: false,
    }
  },
  computed: {
    link() {
      return objectUrl(this.bookmark)
    },
    type() {
      return objectTypeName(this.bookmark)
    }
  },
  watch: {
    'collectionsModel.selectedCollectionIds'(to){
      this.synchronizeSelectedCollectionIds(to)
    }
  },
  methods: {
    getCollectionName(collectionId) {
      let collection = this.collectionsModel.collections.find(el => el.id === collectionId)
      return collection ? collection.name : null
    },
    async synchronizeSelectedCollectionIds(selectedCollectionIds) {
      assert(selectedCollectionIds)
      if (!this.bookmark.collections) this.bookmark.collections = []
      let addedCollections = differenceWith(selectedCollectionIds, this.bookmark.collections)
      let removedCollections = differenceWith(this.bookmark.collections, selectedCollectionIds)
      this.bookmark.collections.splice(0, this.bookmark.collections.length, ...selectedCollectionIds)
      for (let collectionId of removedCollections){
        let collection = this.collectionsModel.collections.find(el => el.id === collectionId)
        if (collection) {
          let indxB = collection.bookmarks.findIndex(bid => bid === this.bookmark.id)
          if (indxB >= 0) collection.bookmarks.splice(indxB, 1)
        }
      }
      for (let collectionId of addedCollections) {
        // не используем this.collectionsModel.collections, тк при добавлении новой коллекции addCollectionToBookmark вызывается раньше, чем изменяется this.collectionsModel.collections
        let collection = await this.$rxdb.get(RxCollectionEnum.WS_COLLECTION, collectionId)
        if (collection) {
          if (!collection.bookmarks) collection.bookmarks = []
          if (!collection.bookmarks.find(bid => bid === this.bookmark.id)) {
            collection.bookmarks.push(this.bookmark.id)
            collection.thumbUrl = this.bookmark.thumbUrl
          }
        }
      }
    },
    bookmarkLaunch() {
      this.$log('bookmarkLaunch')
      this.$router.push(this.link)
    },
    async bookmarkDelete() {
      this.$log('bookmarkDelete start')
      this.bookmarkDeleting = true
      // await this.$wait(1000)
      await this.bookmark.remove(true)
      this.bookmarkDeleting = false
      this.$log('bookmarkDelete done')
      this.$emit('deleted')
      this.$emit('close')
    },
  },
  async mounted() {
    this.$log('mounted')
    this.collectionsModel.selectedCollectionIds = cloneDeep(this.bookmark.collections) || []
  }
}
</script>
