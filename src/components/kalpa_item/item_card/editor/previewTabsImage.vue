<template lang="pug">
q-tabs(
  v-model="pageId"
  :breakpoint="500"
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
      div(:style=`{height: !$store.state.ui.isMobileTiny ? "240px" : "200px",}`).relative-position.row.items-center.content-center.justify-center.no-scroll
        div(:style=`{height: !$store.state.ui.isMobileTiny ? "200px" : "160px", width: $q.screen.width}`).relative-position.row.items-center.content-center.justify-center
          div(:style=`{height: !$store.state.ui.isMobileTiny ? "200px" : "160px", width: "350px",}`).relative-position.row.items-center.content-center.justify-center
            img(
              :src="contentCopy.thumbUrl"
              draggable="false"
              :style=`{
                maxHeight: '100%',
                maxWidth: '100%',
                objectFit: 'contain',
                borderRadius: '20px',
              }`)
          div(flat dense no-caps color="white" :style=`{position: "absolute"}` @click="$refs.inputThumb.pickFiles()").fit.br-20
        .row.full-width.items-start.content-start.justify-center
          q-btn(
            @click="$refs.inputThumb.pickFiles()"
            flat no-caps color="grey"
            :ripple="false"
            :disable="!content || content.uploadStage === 'BLANK'"
            :label="$t('Изменить')"
            :style=`{}`)
    //div(v-if="pageId === 'preview'").row.full-width.items-start.content-start.justify-center
    //  div(:style=`{height: !$store.state.ui.isMobileTiny ? "240px" : "200px",}`).relative-position.row.full-width.items-start.content-start.justify-center.no-scroll
    //    div(:style=`{height: !$store.state.ui.isMobileTiny ? "200px" : "160px", width: !$store.state.ui.isMobileTiny ? "350px" : "300px"}`).relative-position.row.items-start.content-start.justify-center
    //      video(v-if="rangeModel || previewUrl"
    //        ref="video"
    //        autoplay
    //        controls
    //        :playsinline="true"
    //        :src="rangeModel ? contentUrl : previewUrl"
    //        :style=`{maxHeight: !$store.state.ui.isMobileTiny ? "200px" : "160px",}`
    //      ).full-width.br-20
    //      q-btn(v-if="!rangeModel && !previewUrl"
    //        @click="$refs.inputPreview.pickFiles()"
    //        flat no-caps color="green" stack
    //      :disable="!content || content.uploadStage === 'BLANK'"
    //        :label="$t('Загрузить')"
    //        icon="add"
    //        :style=`{
    //              border: '2px solid rgb(60,60,60)'
    //          }`).fit.br-20
    //    .row.full-width.items-start.content-start.justify-center
    //      q-btn(v-if="content && !previewUrl && !rangeModel"
    //        flat no-caps color="green-8"
    //        :disable="!content || content.uploadStage === 'BLANK'"
    //        :label="$t('Выделить диапазон')"
    //        @click="rangeModel = {min: 0, max: Math.min(60 * 5, content.duration / 2)}")
    //      div(v-if="rangeModel").row.full-width
    //        q-range(
    //          v-model="rangeModel"
    //          :min="0"
    //          :max="content.duration"
    //          :step="1"
    //          :left-label-value="rangeModel.min + $t('сек')"
    //          :right-label-value="rangeModel.max + $t('сек')"
    //          label-always
    //          :color="rangeModel.max - rangeModel.min < maxPreviewDur ? 'green-8' : 'red-8'").col.q-mx-md
    //        q-btn(flat no-caps color="green-8" :label="$t('Отмена')" @click="rangeModel = null")
    //      q-btn(v-if="previewUrl"
    //        @click="$emit('previewDelete')"
    //        flat no-caps color="red"
    //        :ripple="false"
    //        :label="$t('Удалить')"
    //        :style=`{}`)
q-file(ref="inputThumb" accept="image/*" @update:model-value="$emit('thumbChanged')" :style=`{display: 'none',}`)
//q-file(ref="inputPreview" accept="video/*" @update:model-value="$emit('previewChanged')" :style=`{display: 'none',}`)
</template>

<script>
export default {
  name: 'previewTabsVideo',
  props: ['content', 'contentCopy', 'previewUrl', 'contentUrl', 'rangeModel'],
  data() {
    return {
      pageId: 'cover',
      pages: [
        { id: 'cover', name: this.$t('Обложка') },
        // { id: 'preview', name: this.$t('Превью') }
      ],
      emits: ['previewDelete', 'thumbChanged', 'previewChanged'],
    }
  },
  watch: {
    // 'rangeModel.min': {
    //   async handler (to) {
    //     if (this.$refs.video){
    //       this.$refs.video.currentTime = to
    //       this.$refs.video.pause()
    //     }
    //   }
    // },
    // 'rangeModel.max': {
    //   async handler (to) {
    //     if (this.$refs.video){
    //       this.$refs.video.currentTime = to
    //       this.$refs.video.pause()
    //     }
    //   }
    // },
  }
}
</script>
