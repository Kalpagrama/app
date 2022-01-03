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
      component(:is="'preview-tabs-' + content.__typename"
        :content="content"
        :contentCopy="contentCopy"
        :previewUrl="previewUrl"
        :contentUrl="contentUrl"
        :rangeModel="rangeModel"
        @previewDelete="previewDelete"
        @thumbChanged="thumbChanged"
        @previewChanged="previewChanged"
        @rangeModelChanged="rangeModel = $event"
      )
    //- form
    div(:style=`{
        paddingLeft: $screenProps.isMobile ? '0px' : '10px',
        paddingRight: $screenProps.isMobile ? '0px' : '10px'
  }`).row.full-width
      // progress
      q-linear-progress(v-if="progress" size='5px' :value="progress / 100" color="green-10").row.full-width.q-px-sm
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
      .row.full-width.q-pl-lg
        small.text-grey-6 {{$t('Сферы')}}
      .row.full-width
        //div(:style=`{minHeight: '70px'}`).row.full-width.q-px-sm.q-pt-md.br-10.b-50
        edit-spheres(:sphereOwner="contentCopy" :maxSphereCnt="20" :placeholderText="$t('Добавьте ключевые слова')" :backgroundColor="'rgba(45,45,45,1)'").q-px-sm
      .row.full-width.q-pl-lg.q-mt-sm
        small.text-grey-6 {{$t('Ссылка на оригинал')}}
      div(:style=`{minHeight: '45px'}`).row.full-width.q-px-sm
        .row.full-width
          q-input(
            v-model="contentCopy.urlOriginal"
            reverse-fill-mask
            color="green"
            borderless dark dense
            :style=`{borderRadius: '10px', height: '40px'}`
            :placeholder="$t('Введите ссылку на оригинал')"
            :input-style=`{
            // background: 'rgb(45,45,45)',
            // borderRadius: '10px',
            maxWidth: '250px',
            minWidth: '250px',
            minHeight: '30px',
            textAlign: 'center',
            }`).row.b-45.q-mr-sm.q-mb-sm.q-px-md
            //template(v-slot="append")
            //  .row.content-center.items-center.q-pl-xs
            //    q-icon(name="link" color="grey-5" size="sm" )
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
        div(:style=`{minHeight: '45px'}`).row.full-width
          .row.full-width
            q-input(v-if="contentCopy.payInfo.price > 0"
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
    q-btn(outline no-caps color="green" :loading="loading" :label="$t('Save')" @click="save")
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
import { RxCollectionEnum } from 'src/system/rxdb'
import { objectTypeName, objectUrl } from 'src/system/common/object_info.js';
import differenceWith from 'lodash/differenceWith'
import editSpheres from 'src/pages/app/content/node_editor/edit_spheres.vue'
import paidUsers from 'src/components/kalpa_lists/paid_users.vue'
import previewTabsVideo from 'src/components/kalpa_item/item_card/editor/previewTabsVideo.vue';
import previewTabsBook from 'src/components/kalpa_item/item_card/editor/previewTabsBook.vue';
import previewTabsImage from 'src/components/kalpa_item/item_card/editor/previewTabsImage.vue';
import cloneDeep from 'lodash/cloneDeep'
import { assert } from 'src/system/common/utils.js';
import { ObjectApi } from 'src/api/object.js';
import { ObjectTypeEnum } from '../../../../system/common/enums';
import { ContentApi } from 'src/api/content'

export default {
  name: 'contentCardEditor',
  props: {
    contentOid: { type: String, required: true },
    showBottomMenu: { type: Boolean, default: true }
  },
  components: {
    paidUsers,
    editSpheres,
    previewTabsVideo,
    previewTabsBook,
    previewTabsImage
  },
  data () {
    return {
      isPaid: false,
      sourceLink: false,
      collectionsModel: { wsSphereId: null, wsSpheres: [], selectedSphereIds: [] },
      contentDeleting: false,
      content: null,
      contentCopy: null,
      loading: false,
      paidUsersListShow: false,
      // pageId: 'cover',
      // pages: [
      //   { id: 'cover', name: this.$t('Обложка') },
      //   { id: 'preview', name: this.$t('Превью') }],
      rangeModel: null,
      maxPreviewDur: 20 * 60,
      progress: 0
    }
  },
  computed: {
    needSave () {
      return this.content && (this.rangeModel || this.nameChanged || this.descriptionChanged || this.priceChanged || this.thumbUrlChanged || this.previewUrlChanged || this.spheresChanged || this.urlOriginalChanged)
    },
    nameChanged () {
      return this.contentCopy.name !== this.content.name
    },
    descriptionChanged () {
      return this.contentCopy.description !== this.content.description
    },
    priceChanged () {
      return this.contentCopy.payInfo.price !== this.content.payInfo.price
    },
    thumbUrlChanged () {
      return this.contentCopy.thumbUrl !== this.content.thumbUrl
    },
    spheresChanged () {
      return this.contentCopy.spheres !== this.content.spheres
    },
    urlOriginalChanged () {
      return this.contentCopy.urlOriginal !== this.content.urlOriginal
    },
    previewUrlChanged () {
      return this.previewUrlOrig !== this.previewUrl
    },
    link () {
      return objectUrl(this.content)
    },
    type () {
      return objectTypeName(this.content)
    },
    contentUrl () {
      let res = ContentApi.urlSelect(this.contentCopy)
      return res
    },
    previewUrl () {
      let res = this.contentCopy.previewUrlWithFormats && this.contentCopy.previewUrlWithFormats.length ? this.contentCopy.previewUrlWithFormats[0].url : null
      return res
    },
    previewUrlOrig () {
      let res = this.content.previewUrlWithFormats && this.content.previewUrlWithFormats.length ? this.content.previewUrlWithFormats[0].url : null
      return res
    }
  },
  watch: {
    isPaid (to) {
      if (to) this.contentCopy.payInfo.price = 100
      else this.contentCopy.payInfo.price = 0
    },
    content: {
      deep: true,
      async handler (to) {
        // this.$logT('content changed!', cloneDeep(to))
        this.contentCopy = cloneDeep(this.content)
        // if (this.bookmark) this.bookmark.name = this.content.name
        // if (this.bookmark) this.bookmark.thumbUrl = this.content.thumbUrl
        await this.$nextTick()
      }
    },
  },
  methods: {
    getCollectionName (sphereId) {
      let sphere = this.collectionsModel.wsSpheres.find(el => el.id === sphereId)
      return sphere ? sphere.name : null
    },
    async contentDelete () {
      this.$log('contentDelete start')
      this.contentDeleting = true
      // await this.$wait(1000)
      // TODO удалять контент на сервере. сервер должен удалить контент(разобраться с ядрами), удалить WS_CONTENT, увеличить квоты
      throw new Error('not impl!!!!!!!!!!!!!!!!')
      // eslint-disable-next-line no-unreachable
      this.contentDeleting = false
      this.$emit('close')
    },
    async save () {
      try {
        if (this.rangeModel && this.rangeModel.max - this.rangeModel.min > this.maxPreviewDur) {
          this.$notify('error', this.$t('превышена длина превью'))
          return
        }
        this.loading = true
        let name, description, spheres, urlOriginal, price, fileThumb, filePreview

        if (this.nameChanged) name = this.contentCopy.name
        if (this.descriptionChanged) description = this.contentCopy.description
        if (this.spheresChanged) spheres = this.contentCopy.spheres
        if (this.urlOriginalChanged) urlOriginal = this.contentCopy.urlOriginal
        if (this.priceChanged) price = this.contentCopy.payInfo.price
        if (this.thumbUrlChanged) fileThumb = this.fileThumb
        if (this.previewUrlChanged) filePreview = this.filePreview
        if (this.priceChanged) { // для того чтобы работал фильтр "платный контент"
          let findResult = await this.$rxdb.find({selector: {rxCollectionEnum: RxCollectionEnum.WS_CONTENT, oid: this.content.oid}})
          assert(findResult.items.length === 1)
          let wsContent = findResult.items[0]
          if (!wsContent.payInfo) wsContent.payInfo = {}
          wsContent.payInfo.price = price
          this.$logT('WS_CONTENT change', wsContent)
        }
        if (name !== undefined) await ObjectApi.update(this.content.oid, 'name', name)
        if (description !== undefined) await ObjectApi.update(this.content.oid, 'description', description)
        if (spheres !== undefined) await ObjectApi.update(this.content.oid, 'spheres', spheres)
        if (urlOriginal !== undefined) await ObjectApi.update(this.content.oid, 'urlOriginal', urlOriginal)
        if (price !== undefined) await ObjectApi.update(this.content.oid, 'payInfo.price', price)
        if (fileThumb !== undefined) await ObjectApi.update(this.content.oid, 'thumb', fileThumb)
        if (filePreview !== undefined) await ObjectApi.update(this.content.oid, 'preview', filePreview)
        else if (this.rangeModel) {
          await ObjectApi.update(this.content.oid, 'preview', {
            figuresAbsolute: [{
              t: this.rangeModel.min,
              points: []
            }, { t: this.rangeModel.max, points: [] }]
          })
        }
        this.$emit('close')
      } finally {
        this.loading = false
      }
    },
    async thumbChanged (file) {
      this.$logT('thumbChanged', file)
      this.contentCopy.thumbUrl = URL.createObjectURL(file)
      this.fileThumb = file
    },
    async previewChanged (file) {
      this.$log('previewChanged', file)
      assert(file)
      this.$set_deprecated(this.contentCopy, 'previewUrlWithFormats', [{
        format: 'default',
        url: URL.createObjectURL(file)
      }])
      this.filePreview = file
    },
    async previewDelete () {
      this.$set_deprecated(this.contentCopy, 'previewUrlWithFormats', [])
    },
    onProgressEvent(event) {
      this.$log('onProgressEvent', 'event', event)
      if (this.content && event.oid === this.content.oid) this.progress = event.progress
    }
  },
  async mounted () {
    this.$log('mounted', this.contentOid)
    this.content = await this.$rxdb.get(RxCollectionEnum.OBJ, this.contentOid)
    this.$nextTick(() => {
      this.isPaid = this.content.payInfo.price > 0
      this.initialized = true
    })
    this.$eventBus.$on('event-progress', this.onProgressEvent)
  },
  beforeUnmount () {
    this.$log('beforeDestroy')
    this.$eventBus.$off('event-progress', this.onProgressEvent)
  }
}
</script>
