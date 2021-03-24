<template lang="pug">
q-layout(
  view="lHh lpR lFf"
  :container="false"
  :style=`{
    height: $q.screen.height+'px',
  }`
  ).b-30
  //- find item
  q-dialog(
    v-model="itemFinderShow"
    position="bottom"
    :maximized="true")
    kalpa-finder(
      :height="$q.screen.height"
      :pages=`{
        nodes: {views: ['all']},
        workspace: {views: ['node', 'media']},
        search: {views: ['default']},
        gif: {views: ['popular']},
      }`
      @item="itemFound"
      @close="itemFinderShow = false"
      ).b-30
  //- edit item
  q-dialog(
    v-model="itemEditorShow"
    position="bottom"
    :maximized="true")
    item-editor(
      :item="item"
      @close="itemEditorShow = false"
      ).b-30
  q-footer
    div(
      :style=`{
        paddingBottom: 'calc(16px + env(safe-area-inset-bottom))',
      }`
      ).row.full-width.items-center.content-center.q-px-md.q-pt-md
      q-btn(
        round flat color="white" icon="west"
        @click="$emit('close')").q-mr-sm
      .col
        q-btn(
          color="green" no-caps
          :style=`{
            height: '40px',
          }`
          ).full-width
          span.text-bold {{ $t('Publish') }}
  q-page-container
    q-page
      .row.full-width.q-pa-sm
        .row.full-width.q-pa-sm
          q-input(
            v-model="essence"
            borderless dark
            placeholder="Type here..."
            type="textarea" autogrow
            :input-style=`{
              padding: '16px',
              fontSize: '18px',
              fontWeight: 'bold',
              background: 'rgb(35,35,35)',
              borderRadius: '10px',
              minHeight: '100px',
            }`
            ).full-width
        //- item
        div(
          v-if="!item"
          ).row.full-width.q-pa-sm
          q-btn(
            outline no-caps color="white" icon-right="add"
            :style=`{
              height: '50px',
            }`
            @click="itemFinderShow = true"
            ).full-width
            span {{ $t('Add item') }}
          //- description, what to do and why u need to add item...
          div(
            :style=`{
              textAlign: 'center',
            }`
            ).row.full-width.justify-center.q-pa-md
            small.text-grey-5 Consider to Add item, for people to better understand you and cos its fun!
        div(
          v-if="item"
          ).row.full-width.q-pa-sm
          .row.full-width
            item-preview(
              :item="item")
          //- actions
          .row.full-width.q-py-sm
            q-btn(
              @click="itemDelete()"
              round flat color="red" icon="delete_outline").q-mx-sm
            .col
              q-btn(
                @click="itemEdit()"
                outline no-caps color="white"
                ).full-width
                span {{ $t('Edit') }}
</template>

<script>
import itemEditor from './item_editor/index.vue'
import itemPreview from './item_preview/index.vue'

export default {
  name: 'itemCreator',
  components: {
    itemEditor,
    itemPreview,
  },
  data () {
    return {
      essence: '',
      item: null,
      itemFinderShow: false,
      itemEditorShow: false,
    }
  },
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
      this.item = item
      this.itemFinderShow = false
    },
    itemEdit () {
      this.$log('itemEdit')
      this.itemEditorShow = true
    },
    itemDelete () {
      this.$log('itemDelete')
      this.item = null
    }
  }
}
</script>
