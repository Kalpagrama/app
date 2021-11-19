<template lang="pug">
div(
  :style=`{
  position: 'fixed',
  borderRadius: '10px',
  paddingTop: $q.screen.xs ? '0px' : '10px',
  paddingBottom: $q.screen.xs ? '0px' : '0px'
  // paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)'
}`
).relative-position.row.full-width.b-40
  // header
  div(:style=`{}`
      ).row.full-width.justify-center.content-end.items-end.q-pb-xs
    .text-white.text-subtitle2 {{$t('Сведения о контенте')}}
    //q-btn(round flat color="white" icon="clear" v-close-popup)
  div(v-if="!contentCopy" :style=`{minHeight: '400px'}`).row.fit.items-center.justify-center.content-center
    q-spinner(size="50px" color="green")
  // body
  div(v-if="contentCopy"
    :style=`{
      maxHeight: !$q.screen.xs ? ($q.screen.height*70/100)+'px' : $q.screen.height+'px',
      overflow: "auto"
  }`).row.full-width
    //- tabs
    .row.full-width
      q-tabs(
        v-model="pageId"
       :breakpoint="500" switch-indicator
        no-caps dense size="xs"
        active-color="green"
      ).full-width.text-grey-8
        q-tab(
          v-for="(p,pi) in pages" :key="p.id"
          :name="p.id" :label="p.name")
      //- tab panels
      q-tab-panels(
        v-model="pageId"
        :swipeable="$q.platform.is.mobile || true"
        :animated="$q.platform.is.mobile || true"
        :style=`{}`).full-width.b-40
        q-tab-panel(
          v-for="(p,pi) in pages" :key="p.id" :name="p.id").row.items-start.content-start.justify-start.q-pa-none
          div(v-if="pageId === 'cover'").row.full-width.items-start.content-start.justify-center
            div(:style=`{height: $q.screen.width > 320 ? "240px" : "200px",}`).relative-position.row.items-center.content-center.justify-center.no-scroll
              div(:style=`{height: $q.screen.width > 320 ? "200px" : "160px", width: $q.screen.width}`).relative-position.row.items-center.content-center.justify-center
                div(:style=`{height: $q.screen.width > 320 ? "200px" : "160px", width: "350px",}`).relative-position.row.items-center.content-center.justify-center
                  img(
                    :src="contentCopy.thumbUrl"
                    draggable="false"
                    :style=`{
                    maxHeight: '100%',
                    maxWidth: '100%',
                    objectFit: 'contain',
                    borderRadius: '20px',
                  }`)
                div(flat dense no-caps color="white" :style=`{position: "absolute"}` @click="$refs.inputThumb.click()").fit.br-20
              .row.full-width.items-start.content-start.justify-center
                q-btn(
                  @click="$refs.inputThumb.click()"
                  flat no-caps color="grey"
                  :ripple="false"
                  :label="$t('Изменить')"
                  :style=`{}`)
          div(v-if="pageId === 'preview'").row.full-width.items-start.content-start.justify-center
            div(:style=`{height: $q.screen.width > 320 ? "240px" : "200px",}`).relative-position.row.full-width.items-start.content-start.justify-center.no-scroll
              div(:style=`{height: $q.screen.width > 320 ? "200px" : "160px", width: $q.screen.width > 320 ? "350px" : "300px"}`).relative-position.row.items-start.content-start.justify-center
                video(v-if="previewUrl"
                  ref="video"
                  autoplay
                  controls
                  :playsinline="true"
                  :src="previewUrl"
                  :style=`{maxHeight: $q.screen.width > 320 ? "200px" : "160px",}`
                ).full-width.br-20
                q-btn(v-if="!previewUrl"
                  @click="$refs.inputPreview.click()"
                  flat no-caps color="green" stack
                  :label="$t('Загрузить')"
                  icon="add"
                  :style=`{
                      border: '2px solid rgb(60,60,60)'
                  }`).fit.br-20
              .row.full-width.items-start.content-start.justify-center
                q-btn(v-if="previewUrl"
                  @click="previewDelete"
                  flat no-caps color="red"
                  :ripple="false"
                  :label="$t('Удалить')"
                  :style=`{}`)
    input(ref="inputThumb" type="file" @update:model-value="thumbChanged" :style=`{display: 'none',}`)
    input(ref="inputPreview" type="file" @update:model-value="previewChanged" :style=`{display: 'none',}`)
    //- form
    div(:style=`{
          paddingLeft: $q.screen.xs ? '0px' : '10px',
          paddingRight: $q.screen.xs ? '0px' : '10px'
    }`).row.full-width
      .row.full-width.q-pl-lg
        small.text-grey-6 {{$t('Название')}}
      q-input(
        v-model="contentCopy.name"
        ref="nameInput"
        color="green"
        borderless dark dense
        type="text" autogrow
        counter maxlength="108"
        :style=`{minHeight: '60px'}`
        :placeholder="$t('Введите название контента')"
        :input-style=`{
        background: 'rgb(45,45,45)',
        borderRadius: '10px',
        padding: '10px',
        marginBottom: '-5px',
        minHeight: '40px',
        textAlign: 'left',
        }`).row.full-width.q-px-sm
      .row.full-width.q-pl-lg
        small.text-grey-6 {{$t('Описание')}}
      q-input(
        v-model="contentCopy.description"
        borderless dark
        ref="descriptionInput"
        type="textarea" autogrow
        counter maxlength="5000"
        :placeholder="$t('Введите описание')"
        :autofocus="false"
        :input-style=`{
        background: 'rgb(45,45,45)',
        padding: '10px',
        marginBottom: '-5px',
        borderRadius: '10px',
        lineHeight: 1.3,
        minHeight: '100px',
      }`
      ).full-width.q-px-sm
      .row.full-width.justify-start.q-pl-sm
        .row.full-width.justify-start.content-center.items-center.q-mb-sm
          q-toggle(
            v-model="isPaid"
            dark
            :label="$t('Платный контент')"
            :style=`{color: 'white'}`
            color="green")
          .col
          q-btn(v-if="contentCopy.payInfo.price > 0"
            flat color="white" no-caps dense
            @click="paidUsersListShow = true"
            :ripple="false"
            :style=`{borderRadius: '10px', marginTop: '3px'}`)
            span(:style=`{fontSize: $q.screen.width > 320 ? '14px' : '11px'}`).text-body1 {{$t('Список оплативших')}}
            q-dialog(
                v-model="paidUsersListShow"
                :maximized="true")
              paid-users(:content="content" @close="paidUsersListShow=false")
          .col
        div(v-if="false" :style=`{minHeight: '45px'}`).row.full-width
          .row.full-width
            q-input(v-if="false && contentCopy.payInfo.price > 0"
              v-model="contentCopy.payInfo.price"
              mask="#"
              reverse-fill-mask
              fill-mask="0"
              color="green"
              :debounce="1000"
              dark outlined dense
              :style=`{borderRadius: '10px', height: '40px'}`
              :placeholder="$t('Введите стоимость')"
              :input-style=`{
              // background: 'rgb(45,45,45)',
              // borderRadius: '10px',
              maxWidth: '150px',
              minHeight: '30px',
              textAlign: 'center',
              }`).row.b-50.q-mr-sm
              template(v-slot="append")
                .row.content-center.items-center
                  q-icon(name="fas fa-ruble-sign" color="grey-5")
  // buttons
  .row.full-width.justify-end.content-center.items-center.q-pt-sm.q-pb-xs.q-px-sm.q-mb-xs
    .row
      q-btn(v-if="$store.getters.currentUser.profile.role.in('MODERATOR', 'ADMIN')"
        no-caps :ripple="false" color="grey" round
        flat icon="delete"
        :loading="contentDeleting"
        @click="contentDelete")
        q-tooltip(dense dark) {{$t('Удалить контент')}}
    .col
    q-btn(outline no-caps color="red" :label="$t('Cancel')" v-close-popup).q-mr-sm
    q-btn(outline no-caps color="green" :disable="!needSave" :loading="loading" :label="$t('Save')" @click="save")
    slot(v-if="showBottomMenu" name="bottomMenu")
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
          :loading="contentDeleting"
          :style=`{
            height: '50px', position: 'absolute', marginTop: '12px'
          }`
          @click="contentDelete"
        )
          q-tooltip(dense dark) {{$t('Delete content')}}
</template>

<script>
import {RxCollectionEnum} from 'src/system/rxdb'
import {objectTypeName, objectUrl} from 'src/system/common/object_info.js';
import differenceWith from 'lodash/differenceWith'
import paidUsers from 'src/components/kalpa_lists/paid_users.vue'
import cloneDeep from 'lodash/cloneDeep'
import {assert} from 'src/system/common/utils.js';
import {ObjectApi} from 'src/api/object.js';
import {ObjectTypeEnum} from '../../../../system/common/enums';

export default {
  name: 'videoEditor',
  props: {
    contentOid: {type: String, required: true},
    showBottomMenu: {type: Boolean, default: true},
  },
  components: {
    paidUsers
  },
  data() {
    return {
      isPaid: false,
      collectionsModel: {collectionId: null, collections: [], selectedCollectionIds: []},
      contentDeleting: false,
      content: null,
      contentCopy: null,
      loading: false,
      paidUsersListShow: false,
      pageId: 'cover',
      pages: [
        {id: 'cover', name: this.$t('Обложка')},
        {id: 'preview', name: this.$t('Превью')}]
    }
  },
  computed: {
    needSave() {
      return this.content && (this.nameChanged || this.descriptionChanged || this.priceChanged || this.thumbUrlChanged || this.previewUrlChanged)
    },
    nameChanged() {
      return this.contentCopy.name !== this.content.name
    },
    descriptionChanged() {
      return this.contentCopy.description !== this.content.description
    },
    priceChanged() {
      return this.contentCopy.payInfo.price !== this.content.payInfo.price
    },
    thumbUrlChanged() {
      return this.contentCopy.thumbUrl !== this.content.thumbUrl
    },
    previewUrlChanged() {
      return this.previewUrlOrig !== this.previewUrl
    },
    link() {
      return objectUrl(this.content)
    },
    type() {
      return objectTypeName(this.content)
    },
    previewUrl() {
      let res = this.contentCopy.previewUrlWithFormats.length ? this.contentCopy.previewUrlWithFormats[0].url : null
      return res
    },
    previewUrlOrig() {
      let res = this.content.previewUrlWithFormats.length ? this.content.previewUrlWithFormats[0].url : null
      return res
    }
  },
  watch: {
    'collectionsModel.selectedCollectionIds'(to){
      this.synchronizeSelectedCollectionIds(to)
    },
    isPaid(to) {
      if (to) this.contentCopy.payInfo.price = 100
      else this.contentCopy.payInfo.price = 0
    },
    content: {
      deep: true,
      async handler(to) {
        this.$log('content changed!', cloneDeep(this.content))
        this.contentCopy = cloneDeep(this.content)
        this.bookmark.name = this.content.name
        this.bookmark.thumbUrl = this.content.thumbUrl
        await this.$nextTick()
      }
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
    async contentDelete() {
      this.$log('contentDelete start')
      this.contentDeleting = true
      // await this.$wait(1000)
      // TODO удалять контент на сервере
      throw new Error('not impl!!!!!!!!!!!!!!!!')
      // eslint-disable-next-line no-unreachable
      await this.bookmark.remove(true)
      this.contentDeleting = false
      this.$log('bookmarkDelete done')
      this.$emit('deleted')
      this.$emit('close')
    },
    async save(){
      try {
        this.loading = true
        let name, description, price, fileThumb, filePreview

        if (this.nameChanged) name = this.contentCopy.name
        if (this.descriptionChanged) description = this.contentCopy.description
        if (this.priceChanged) price = this.contentCopy.payInfo.price
        if (this.thumbUrlChanged) fileThumb = this.fileThumb
        if (this.previewUrlChanged) filePreview = this.filePreview

        if (name !== undefined) await ObjectApi.update(this.content.oid, 'name', name)
        if (description !== undefined) await ObjectApi.update(this.content.oid, 'description', description)
        if (price !== undefined) await ObjectApi.update(this.content.oid, 'payInfo.price', price)
        if (fileThumb !== undefined) await ObjectApi.update(this.content.oid, 'thumb', fileThumb)
        if (filePreview !== undefined) await ObjectApi.update(this.content.oid, 'preview', filePreview)
        this.$emit('close')
      } finally {
        this.loading = false
      }
    },
    async thumbChanged (e) {
      this.$log('thumbChanged', e)
      this.contentCopy.thumbUrl = URL.createObjectURL(e.target.files[0])
      this.fileThumb = e.target.files[0]
      // destroy value ?
      this.$refs.inputThumb.value = null
    },
    async previewChanged (e) {
      this.$log('previewChanged', e)
      assert(e.target.files[0])
      this.$set_deprecated(this.contentCopy, 'previewUrlWithFormats', [{format: 'default', url: URL.createObjectURL(e.target.files[0])}])
      this.filePreview = e.target.files[0]
      // destroy value ?
      this.$refs.inputPreview.value = null
    },
    async previewDelete () {
      this.$set_deprecated(this.contentCopy, 'previewUrlWithFormats', [])
    }
  },
  async mounted() {
    this.$log('mounted', this.contentOid)
    let { items: [bookmark] } = await this.$rxdb.find({
      selector: {
        rxCollectionEnum: RxCollectionEnum.WS_CONTENT,
        oid: this.contentOid,
      }
    })
    this.$log('mounted1', bookmark)
    assert(bookmark)
    this.bookmark = bookmark
    this.collectionsModel.selectedCollectionIds = cloneDeep(this.bookmark.collections) || []
    this.content = await this.$rxdb.get(RxCollectionEnum.OBJ, this.contentOid)
    this.$log('mounted2', this.content)
    this.$nextTick(() => {
      this.$logD('this.isPaid = this.content.payInfo.price > 0')
      this.isPaid = this.content.payInfo.price > 0
      this.initialized = true
    })
  }
}
</script>
