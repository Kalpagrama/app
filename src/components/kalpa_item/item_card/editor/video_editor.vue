<template lang="pug">
  div(
    :style=`{
    position: 'relative',
    borderRadius: '20px',
    // paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)'
  }`
  ).row.full-width.b-40
    //- body
    div(v-if="contentCopy"
      :style=`{
      zIndex: 10,
      //- background: 'rgba(0,0,0,0.5)',
      // borderRadius: '20px 20px 0 0',
      // paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
    }`
    ).row.full-width.q-px-xs.q-pt-sm
      // name
      .row.full-width
        .col
        .row.justify-center.content-center.items-center.q-pl-lg
          span.text-white.text-subtitle2.q-pl-lg {{$t('Сведения о контенте')}}
        .col
        q-btn(round flat color="white" icon="clear" v-close-popup)
      //- img
    div(
      :style=`{
        maxHeight: ($q.screen.height-150)+'px'
    }`).row.full-width.q-px-sm.q-pt-xs.q-pb-xs.scroll
      //- tabs sticky
      div(
        :style=`{
                  position: 'sticky', top: '0px', zIndex: 1000,
                }`).row.full-width.q-px-md.b-40
        q-tabs(
          v-model="pageId"
          no-caps dense
          active-color="green"
        ).full-width.text-grey-8
          q-tab(
            v-for="(p,pi) in pages" :key="p.id"
            :name="p.id" :label="p.name")
      //- tab panels
      q-tab-panels(
        v-model="pageId"
        :swipeable="$q.platform.is.mobile"
        :animated="$q.platform.is.mobile"
        :style=`{}`).full-width.b-40
        q-tab-panel(
          v-for="(p,pi) in pages" :key="p.id" :name="p.id"
          :style=`{
                    background: 'none',
                    minHeight: '20vh',
                  }`
        ).row.full-width.items-start.content-start.justify-center.q-pa-sm
      .row
        img(
          :src="contentCopy.thumbUrl"
          :style=`{
          maxHeight: '150px',
          objectFit: 'contain',
          borderRadius: '10px',
        }`).row.full-width.b-50.justify-center
      .row
        .column.q-px-sm.q-gutter-md.reverse
          input(ref="inputThumb" type="file" @input="thumbChanged" :style=`{display: 'none',}`)
          input(ref="inputPreview" type="file" @input="previewChanged" :style=`{display: 'none',}`)
          q-btn(outline dense no-caps color="grey" :label="$t('Обложка')" @click="$refs.inputThumb.click()").q-px-sm
          q-btn(outline dense no-caps color="grey" :label="$t('Трейлер')" @click="previewLoaderShow=true" ).q-px-sm
            q-dialog(v-model="previewLoaderShow")
              div(:style=`{
                        maxWidth: $store.state.ui.pageWidth+'px',
                        position: 'relative',
                        borderRadius: '20px',
                        width: '400px'
                        }`
              ).row.b-40
                .row.full-width.justify-center.text-white.text-subtitle2.q-pt-md.q-pb-sm
                  span {{$t('Трейлер')}}
                div( :style=`{
                        maxWidth: $store.state.ui.pageWidth+'px',
                        position: 'relative',
                        borderRadius: '20px',
                        maxHeight: '350px',
                        width: '400px'
                        }`
                        ).row.full-width.q-pa-sm.justify-center.content-center.items-center
                  video(v-if="contentCopy.previewUrl"
                    ref="video"
                    controls
                    :src="contentCopy.previewUrl"
                    :style=`{
                      maxHeight: "300px"
                  }`
                  ).full-width.br-10
                  q-btn(v-if="!contentCopy.previewUrl"
                    @click="$refs.inputPreview.click()"
                    outline no-caps color="green"
                    :label="$t('Загрузить')"
                    :style=`{height: "300px", width: "300px"}`
                    icon="add")
                  q-btn(v-if="contentCopy.previewUrl"
                    @click="$refs.inputPreview.click()"
                    flat no-caps color="green"
                    :label="$t('Изменить')")
                  q-btn(v-if="contentCopy.previewUrl"
                    @click="previewDelete"
                    flat no-caps color="grey"
                    :label="$t('Удалить')")
                .row.full-width
                  .col
                  .row.q-pa-sm
                    q-btn(
                      :loading="loading"
                      :disable="loading"
                      v-close-popup
                      outline no-caps color="green") {{$t('Готово')}}

      //- form
      .row.full-width
        .row.full-width.q-pl-lg
          small.text-grey-6 {{$t('Название')}}
        q-input(
          v-model="contentCopy.name"
          color="green"
          borderless dark dense
          type="textarea" autogrow
          counter maxlength="108"
          :style=`{minHeight: '60px'}`
          :placeholder="$t('enter content name', 'Введите название контента')"
          :input-style=`{
          background: 'rgb(45,45,45)',
          borderRadius: '10px',
          padding: '10px',
          marginBottom: '-5px',
          minHeight: '40px',
          fontSize: fontSize+'px',
          textAlign: 'left',
          }`).row.full-width.q-px-sm
        .row.full-width.q-pl-lg
          small.text-grey-6 {{$t('Описание')}}
        q-input(
          v-model="contentCopy.description"
          borderless dark
          ref="nameInput"
          type="textarea" autogrow
          counter maxlength="5000"
          :placeholder="$t('Введите описание')"
          :autofocus="false"
          :input-style=`{
          background: 'rgb(45,45,45)',
          padding: '10px',
          marginBottom: '-5px',
          borderRadius: '10px',
          fontSize: fontSize+'px',
          lineHeight: 1.3,
          minHeight: '100px',
        }`
        ).full-width.q-px-sm
        .row.full-width.justify-start.q-pl-sm
          .row.full-width.justify-start.content-start.items-start.q-mb-sm
            q-toggle(
              v-model="isPaid"
              dark dense
              :label="$t('Платный контент')"
              :style=`{color: 'white'}`
              color="green").q-pl-sm.q-pb-xs
          div(:style=`{minHeight: '60px'}`).row.full-width
            .row
              q-input(v-if="contentCopy.payInfo.price > 0"
                v-model="contentCopy.payInfo.price"
                mask="#"
                reverse-fill-mask
                fill-mask="0"
                color="green"
                :debounce="1000"
                borderless dark dense outlined
                :style=`{borderRadius: '10px'}`
                :placeholder="$t('enter the cost', 'Введите стоимость')"
                :input-style=`{
                // background: 'rgb(45,45,45)',
                borderRadius: '10px',
                padding: '10px',
                paddingLeft: '10px',
                maxWidth: '150px',
                minHeight: '30px',
                fontSize: fontSize+'px',
                textAlign: 'center',
                }`).row.b-50.q-mb-md
                template(v-slot="append")
                  .row.content-center.items-center
                    q-icon(name="fas fa-ruble-sign" color="grey-5")
    //- buttons
    .row.full-width.justify-end.content-start.items-start.q-py-sm.q-pr-sm
      //.row.q-mb-sm
      //  q-btn(
      //    no-caps :ripple="false" color="grey"
      //    flat  icon="delete"
      //    :loading="contentDeleting"
      //    :style=`{
      //    height: '40px',
      //  }`
      //    @click="contentDelete"
      //  )
      //    q-tooltip(dense dark) {{$t('Delete content')}}
      //.col
      q-btn(outline no-caps color="red" :label="$t('Cancel')" v-close-popup).q-mr-sm
      q-btn(outline no-caps color="green" :disable="!needSave" :loading="loading" :label="$t('Save')" @click="save")
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
  data() {
    return {
      isPaid: false,
      collectionsModel: {collectionId: null, collections: [], selectedCollectionIds: []},
      contentDeleting: false,
      content: null,
      contentCopy: null,
      loading: false,
      previewLoaderShow: false,
      pageId: 'cover',
      pages: [
        {id: 'cover', name: this.$t('Сover', 'Обложка')},
        {id: 'preview', name: this.$t('Preview', 'Превью')}]
    }
  },
  computed: {
    needSave() {
      return this.nameChanged || this.descriptionChanged || this.priceChanged || this.thumbUrlChanged || this.previewUrlChanged
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
      return this.contentCopy.previewUrl !== this.content.previewUrl
    },
    link() {
      return objectUrl(this.content)
    },
    type() {
      return objectTypeName(this.content)
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
      handler(to) {
        this.contentCopy = cloneDeep(this.content)
        this.bookmark.name = this.content.name
        this.bookmark.thumbUrl = this.content.thumbUrl
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
        if (this.nameChanged) await ObjectApi.update(this.content.oid, 'name', this.contentCopy.name)
        if (this.descriptionChanged) await ObjectApi.update(this.content.oid, 'description', this.contentCopy.description)
        if (this.priceChanged) await ObjectApi.update(this.content.oid, 'payInfo.price', this.contentCopy.payInfo.price)
        if (this.thumbUrlChanged) {
          assert(this.fileThumb)
          await ObjectApi.update(this.content.oid, 'thumb', this.fileThumb)
        }
        if (this.previewUrlChanged) {
          assert(this.filePreview)
          await ObjectApi.update(this.content.oid, 'preview', this.filePreview)
        }
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
      this.$set(this.contentCopy, 'previewUrl', URL.createObjectURL(e.target.files[0]))
      this.filePreview = e.target.files[0]
      // destroy value ?
      this.$refs.inputPreview.value = null
    },
    async previewDelete () {
      this.contentCopy.previewUrl = null
    }
  },
  async mounted() {
    this.$log('mounted')
    this.content = await this.$rxdb.get(RxCollectionEnum.OBJ, this.contentOid)
    this.isPaid = this.content.payInfo.price > 0
    let { items: [bookmark] } = await this.$rxdb.find({
      selector: {
        rxCollectionEnum: RxCollectionEnum.WS_BOOKMARK,
        oid: this.contentOid,
      }
    })
    assert(bookmark)
    this.bookmark = bookmark
    this.collectionsModel.selectedCollectionIds = cloneDeep(this.bookmark.collections) || []
    this.$nextTick(() => { this.initialized = true })
  }
}
</script>
