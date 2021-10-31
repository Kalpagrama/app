<template lang="pug">
  div(
    :style=`{
    position: 'relative',
    borderRadius: '20px 20px 0 0',
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)'
  }`
  ).row.full-width.b-40
    //- body
    div(
      :style=`{
      zIndex: 10,
      //- background: 'rgba(0,0,0,0.5)',
      // borderRadius: '20px 20px 0 0',
      // paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
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
            .row.full-width.justify-center.content-center.items-center.q-pt-xs
              q-btn(v-if="false" outline no-caps color="green" :label="$t('Редактировать')" @click="showEditMenu=true")
            .row.full-width.justify-end.content-start.items-start
              .row
                q-input(v-if="bookmark.payInfo"
                  v-model="bookmark.payInfo.price"
                  prefix="₽"
                  mask="#"
                  reverse-fill-mask
                  fill-mask="0"
                  color="green"
                  borderless dark dense outlined
                  :debounce="1000"
                  :placeholder="$t('enter the cost', 'Введите стоимость')"
                  :input-style=`{
                    // background: 'rgb(45,45,45)',
                    borderRadius: '10px',
                    padding: '10px',
                    maxWidth: '150px',
                    minHeight: '30px',
                    fontSize: fontSize+'px',
                    textAlign: 'center',
                    }`).row.full-width
          .row.justify-end.content-start.items-start
            .row.full-width
              q-btn(round flat color="white" icon="clear" v-close-popup :style=`{marginRight: '-5px'}`)
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
      div(v-if="false && !showHeader").row.full-width
        .row.full-width.items-center.justify-center.text-white.text-h6 {{$t('Bookmark menu')}}
        .col
          div(:style=`{
          position: 'relative',
          left: '11px'
            }`
          ).row.full-width.justify-end
            q-btn(round flat color="white" icon="clear" v-close-popup)
      div(v-if="!showEditMenu").row.full-width.items-center.content-center.text-white.q-py-xs.wrap
        collectionList(
          v-model="collectionsModel"
          :highlightSelected="true"
          :showDeleteButton="false"
          :showAllCollection="false").q-ma-xs
      div(v-if="showEditMenu" transition-show="slide-up" transition-hide="slide-down").row
        q-input(
          v-model="name"
          color="green"
          borderless dark dense
          :style=`{minHeight: '60px'}`
          :placeholder="$t('enter content name', 'Введите название контента')"
          :input-style=`{
          background: 'rgb(45,45,45)',
          borderRadius: '10px',
          padding: '10px',
          minHeight: '60px',
          fontSize: fontSize+'px',
          textAlign: 'left',
          }`).row.full-width.q-my-md.q-px-md
        q-input(
          v-model="name"
          borderless dark
          ref="nameInput"
          type="textarea" autogrow
          :placeholder="$t('Введите описание')"
          :autofocus="false"
          :input-style=`{
          background: 'rgb(45,45,45)',
          padding: '10px',
          borderRadius: '10px',
          fontSize: fontSize+'px',
          lineHeight: 1.3,
          minHeight: '100px',
        }`
        ).full-width.q-px-md
        .row.full-width.justify-start.q-pl-md
          .row.justify-start.content-start.items-start
            q-toggle(
              v-model="paidСontent"
              dark
              :label="$t('Платный контент')"
              :style=`{color: 'white'}`
              color="green")
          .row.full-width.justify-start.content-start.items-start
            div(:style=`{minHeight: '60px'}`).row
              q-input(v-if="paidСontent"
                v-model="number"
                prefix="₽"
                mask="#"
                reverse-fill-mask
                fill-mask="0"
                color="green"
                borderless dark dense outlined
                :style=`{borderRadius: '10px'}`
                :placeholder="$t('enter the cost', 'Введите стоимость')"
                :input-style=`{
                // background: 'rgb(45,45,45)',
                borderRadius: '10px',
                padding: '10px',
                paddingLeft: '10px',
                // maxWidth: '150px',
                minHeight: '30px',
                fontSize: fontSize+'px',
                textAlign: 'left',
                }`).row.full-width.b-50.q-mb-md
        .row.full-width.justify-end.content-start.items-start.q-mb-md
          q-btn(outline color="red" :label="$t('Cancel')" @click="showEditMenu=false").q-mr-sm
          q-btn(outline color="green" :label="$t('Save')")
      slot(name="bottomMenu")
        div(v-if="showBottomMenu").row.full-width
          div(:style=`{
            content: '',
            width: '100%',
            height: '1px',
            background: 'rgb(73,66,61)',}`).q-my-xs
          //- delete
          q-btn(
            no-caps :ripple="false" color="grey"
            flat  icon="delete"
            :loading="bookmarkDeleting"
            :style=`{
            height: '50px', position: 'absolute', marginTop: '12px'
          }`
            @click="bookmarkDelete()"
          )
            q-tooltip(dense dark) {{$t('Delete bookmark')}}
          //- isSubscribed
          .row.q-py-xs.no-wrap.q-mt-xs.full-width.justify-center
            q-toggle(
              v-model="bookmark.isSubscribed"
              dark
              checked-icon="check"
              unchecked-icon="clear"
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
import {ObjectApi} from '../../api/object';

export default {
  name: 'bookmarkEditor',
  props: {
    bookmark: {type: Object, required: true},
    showHeader: {type: Boolean, default: true},
    showBottomMenu: {type: Boolean, default: true},
    showEditMenu: {type: Boolean, default: false},
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
