<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header(reveal)
    .row.full-width.justify-center.b-30
      div(:style=`{position: 'relative', maxWidth: '800px'}`).row.full-width.q-pt-sm
        .row.full-width.items-center.content-center
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="$emit('out', ['back'])")
          .col
            div(:style=`{borderRadius: '10px',}`
              ).row.full-width.items-center.content-center.justify-between.b-40.q-pa-xs
              .col
                div().row.full-width
                  q-icon(name="filter_tilt_shift" color="white" size="30px").q-mx-sm
                  div(:style=`{overflowX: 'auto'}`).col
                    span(:style=`{fontSize: '18px', whiteSpace: 'nowrap'}`).text-white.text-bold Редактор ядра
              q-btn(round flat color="red-5" icon="delete_outline" @click="nodeDelete()")
  q-page-container
    q-page(:style=`{paddingTop: '20px', paddingBottom: '200px'}`)
      .row.full-width.justify-center
        div(:style=`{maxWidth: maxWidth+'px',}`).row.full-width
          //- edit-layout(:node="node")
          div(:style=`{borderRadius: '10px', overflow: 'hidden',}`).row.full-width.b-50.q-mb-sm
            edit-items(:node="node")
            edit-essence(:node="node")
          //- wrapper: category, spheres, publish
          .row.full-width.items-start.content-start.q-px-sm
            .row.full-width.q-px-sm.q-mt-md
              span.text-bold.text-grey-7 Категория и сферы ядра
            .row.full-width
              edit-spheres(:node="node")
                edit-category(:node="node").q-mr-sm
            .row.full-width.q-py-xl
              q-btn(
                @click="publish()"
                no-caps color="green" size="xl"
                :loading="publishing"
                :class=`{
                  'full-width': $q.screen.width < 600
                }`
                ).q-px-xl
                span.text-white.text-bold Опубликовать
</template>

<script>
import { NodeApi } from 'src/api/node'

import editLayout from './edit_layout'
import editCategory from './edit_category'
import editSpheres from './edit_spheres'
import editEssence from './edit_essence'
import editItems from './edit_items/index.vue'

export default {
  name: 'wsNodeEditor',
  components: {editLayout, editCategory, editSpheres, editEssence, editItems},
  props: {
    node: {type: Object},
    title: {type: String},
  },
  data () {
    return {
      maxWidth: 716,
      publishing: false,
    }
  },
  methods: {
    // node
    // TODO Эти проверки могут находится в UI коде - только если это валидация (но это вроде не валидация, поэтому надо перенести в NodeApi)
    check () {
      this.$log('check')
      if (!this.node.category) throw new Error('No node.category !')
      if (this.node.name.length === 0) throw new Error('No node.essence !')
      if (this.node.layout !== 'PIP') throw new Error('Only PIP layout for now !')
      if (this.node.items.length > 5) throw new Error('5 items maximum !')
      if (this.node.spheres.length > 5) throw new Error('5 spheres maximum !')
      // check items
      this.node.items.map((i, ii) => {
        if (i.layers.length === 0) throw new Error(`No layers in item: ${ii} !`)
        if (i.outputType === 'VIDEO') {
          // check layers duration
          let layersDuration = i.layers.reduce((acc, layer) => {
            acc += (layer.figuresAbsolute[1].t - layer.figuresAbsolute[0].t)
            return acc
          }, 0)
          this.$log('check layersDuration:', layersDuration)
          if (layersDuration > 60) throw new Error('Too looong composition, 1 min maximum !')
          if (layersDuration === 0) throw new Error('Layers durtion === 0 !')
        }
      })
    },
    async publish () {
      try {
        this.$log('publish start')
        this.publishing = true
        await this.$wait(300)
        this.check()
        // publish
        let createdNode = await NodeApi.nodeCreate(this.node)
        this.$log('publish createdNode', createdNode)
        // update this node: stage, oid, thumbUrls from all the items
        // await this.node.updateExtended('stage', 'published', false)
        // await this.node.updateExtended('oid', createdNode.oid, false)
        // createdNode.items.map((i, ii) => {
        //   this.node.items[ii].thumbUrl = i.thumbUrl
        // })
        await this.$rxdb.remove(this.node.id)
        this.publishing = false
        this.$q.notify({
          type: 'positive',
          position: 'top',
          message: this.$t('wsNodeEditor_nodeSendToPublication', 'Ядро создается...')
        })
        // need to replace router cos we deleted it...
        this.$router.replace(`/node/${createdNode.oid}?creating=true`).catch(e => e)
      }
      catch (e) {
        this.$log('publish error', e)
        this.publishing = false
        let errorMessage = e.message || e.toString()
        this.$q.notify({
          type: 'negative',
          position: 'top',
          message: errorMessage,
        })
      }
    },
    async nodeDelete () {
      this.$log('nodeDelete')
      if (!confirm(this.$t('wsNodeEditor_conifrmNodeDelete', 'Удалить ядро?'))) return
      await this.$rxdb.remove(this.node.id)
    },
    nodeIsEmpty () {
      this.$log('nodeIsEmpty')
      if (this.node.name.length === 0 &&
        this.node.spheres.length === 0 &&
        this.node.items.length === 0) {
        return true
      }
      else {
        return false
      }
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
    // this.$store.commit('ui/stateSet', ['showMobileNavigation', true])
    // if (this.nodeIsEmpty()) {
    //   await this.$rxdb.remove(this.node.id)
    // }
  }
}
</script>
