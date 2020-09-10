<template lang="pug">
q-layout(view="hHh Lpr lff").b-30
  q-header(reveal)
    .row.full-width.justify-center
      div(:style=`{maxWidth: '800px', height: '50px'}`).row.full-width.items-center.content-center
        q-btn(round flat color="white" icon="keyboard_arrow_left" @click="close()").q-mr-sm
        span(:style=`{fontSize: '18px'}`).text-white.text-bold Item editor
  q-page-container
    q-page(:style=`{paddingTop: '0px'}`)
      .row.full-width.justify-center.items-start.content-start
        div(:style=`{maxWidth: '800px'}`).row.full-width.items-start.content-start
          div(:style=`{position: 'relative'}`).row.full-width
            img(
              v-if="contentKalpa"
              :src="contentKalpa.thumbUrl"
              draggable="false"
              :style=`{
                borderRadius: '10px', overflow: 'hidden',
              }`
              ).full-width
            ws-content-player(
              v-if="contentKalpa"
              :contentKalpa="contentKalpa"
              @player="player = $event"
              :options=`{
                showBar: true,
                showActions: true,
              }`
              :style=`{
                position: 'absolute', zIndex: 100,
              }`).fit
          div(
            :style=`{
              position: 'relative',
              marginTop: '-10px',
              borderRadius: '0 0 10px 10px',
            }`
            ).row.full-width.b-50
            composition-editor(
              v-if="player && itemCopy"
              :contentKalpa="contentKalpa"
              :composition="itemCopy"
              :player="player"
              )
          //- footer
          .row.full-width.items-center.content-center.q-py-sm
            q-btn(round flat no-caps color="grey-6" @click="close()").q-px-sm.b-50 Close
            .col
              small.text-white itemCopyChanged: {{itemCopyChanged}}
            q-btn(
              @click="save()"
              no-caps
              :disable="!itemCopyChanged"
              :color="itemCopyChanged ? 'green' : 'grey-9'"
              ).q-px-md Save
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'

import compositionEditor from 'components/composition/composition_editor/index.vue'
import wsContentPlayer from 'components/content_player/index.vue'

export default {
  name: 'editItems_itemEditor',
  components: {wsContentPlayer, compositionEditor},
  props: ['item'],
  data () {
    return {
      contentKalpa: null,
      player: null,
      itemCopy: null,
      itemCopyChanged: false,
    }
  },
  computed: {
    // itemCopyChanged () {
    //   return this.itemCopy === this.item
    // }
  },
  watch: {
    item: {
      deep: true,
      immediate: true,
      handler (to, from) {
        this.$log('item TO', to)
        // this.itemCopy = JSON.parse(JSON.stringify(to))
        this.$set(this, 'itemCopy', JSON.parse(JSON.stringify(to)))
      }
    },
    itemCopy: {
      deep: true,
      immediate: false,
      handler (to, from) {
        this.$log('itemCopyChanged', to)
        this.itemCopyChanged = true
      }
    }
  },
  methods: {
    close () {
      this.$log('close')
      if (this.itemCopyChanged) {
        if (confirm('Save changes ?')) {
          this.save()
        }
        else {
          this.$emit('close')
        }
      }
      else {
        this.$emit('close')
      }
    },
    save () {
      this.$log('save')
      // this.$set(this, 'item', JSON.parse(JSON.stringify(this.itemCopy)))
      this.$set(this.item, 'layers', JSON.parse(JSON.stringify(this.itemCopy.layers)))
      this.$emit('close')
    }
  },
  async mounted () {
    this.$log('mounted')
    this.contentKalpa = await this.$rxdb.get(RxCollectionEnum.OBJ, this.item.layers[0].contentOid)
  }
}
</script>
