<template lang="pug">
  kalpa-layout()
    template(v-slot:body)
      //- nav header
      .row.full-width.items-start.content-start.justify-center
        // nav header
        div(v-if="false" :style=`{ height: '60px', borderRadius: '10px'}`).row.full-width.items-center.content-center.q-pa-sm.b-40
          q-btn(round flat color="white" icon="west" @click="$routerKalpa.back()")
          .col.full-height
            .row.fit.items-center.content-center.justify-center
              span(:style=`{fontSize: '18px'}`).text-white.text-bold {{$t('essences')}}
          q-btn(round flat color="white" icon="more_vert")
        //q-spinner-dots(v-if="!state.node" color="green" size="60px").fixed-center
        div(v-if="state.node" :style=`{maxWidth: $store.state.ui.pageWidth+'px'}`).row.full-width
          q-dialog(
            v-model="itemEditorShow"
            :maximized="false"
            position="standard")
            essence-editor(
              :item="newNodeSameImage"
              :publish="true"
              @close="setNode($event || node), itemEditorShow=false")
          // образ
          div(:style=`{width: $store.state.ui.pageWidth + 'px', position: 'relative'}`).row-full-width
            q-resize-observer(@resize="bottomHeight = $q.screen.height - $event.height")
            page-image(:node="state.node" :isActive="state.imageActive" :maxHeight="imageMaxHeight" @node="setNode($event)")
          // fullpage (description / coments / other essences)
          transition(appear enter-active-class="animated slideInUp" leave-active-class="animated slideOutDown")
            div(
              v-if="pageId"
              :style=`{
                position: 'relative',
                borderRadius: '20px 20px 0 0',
                height: bottomHeight + 'px',
              }`).row.full-width.b-30
              component(:is="'page-' + pageId"
                :node="state.node"
                :height="bottomHeight"
                :essencesNodes="essencesNodes"
                :essenceNodesIndx="essenceNodesIndx"
                :newNode="newNodeSameImage"
                @close="pageId=null"
                @set-node="setNode($event)"
                @itemEditorShow="state.imageActive=!$event")
          // author + essence + spheres
          div(v-if="!pageId").row.full-width.q-mt-sm
            q-resize-observer(@resize="imageMaxHeight = $q.screen.height - $event.height")
            .row.full-width.justify-center
              div(v-if="essencesNodes.length > 1" @click="pageId='essences'").row.cursor-pointer
                small.text-green-10.text-bold.q-px-xs.q-mt-xs  {{essencesNodes.length}}
                small.text-grey-7.text-weight-thin.q-mt-xs.q-pr-xs  {{$getNoun(essencesNodes.length, $t('смысл'), $t('смысла'), $t('смыслов'))}} {{$t('на этот образ')}}
                //small(v-if="state.node.items[0].layers[0].contentName").text-grey-7.text-weight-bolder.text-italic.q-pl-xs.q-mt-xs {{state.node.items[0].layers[0].contentName.substring(0, 22)}}{{state.node.items[0].layers[0].contentName.length > 22 ? '...': ''}}
              small(v-else @click="itemEditorShow=true").cursor-pointer.text-green-10.text-weight-thin.q-mt-xs  {{$t('Добавить смысл на этот образ')}}
            // список других сутей
            q-tab-panels(
              v-model="state.node.oid"
              :swipeable="true || $q.platform.is.mobile"
              :animated="true || $q.platform.is.mobile"
              dark
              :style=`{borderRadius: '10px', border: '1px solid rgb(40,40,40)', overflow: 'hidden'}`).full-width
              q-tab-panel(v-for="(n,ix) in essencesNodes"
                :key="n.oid" :name="n.oid").full-width.q-pa-none
                page-essence(:oid="n.oid" @description="pageId='description'" @essences="pageId='essences'" @comments="pageId='comments'")
                  template(v-slot:left)
                    q-btn(:disable="!essenceLeft.length" dense flat icon="chevron_left" :color="essenceLeft.length ? 'grey-5':'grey-9'" :style=`{zIndex: '100', borderRadius: '0px 50% 50% 0px'}`
                      @click="setNode(essencesNodes[ix-1])")
                  template(v-slot:right)
                    q-btn(:disable="!essenceRight.length" dense flat icon="chevron_right" :color="essenceRight.length ? 'grey-5':'grey-9'" :style=`{zIndex: '100', borderRadius: '50% 0px 0px 50%'}`
                      @click="setNode(essencesNodes[ix+1])")
                  //template(v-slot:badge)
                  //  span(v-if="essencesNodes.length > 1") {{essencesNodes.length}}
          // похожие
          //div(:style=`{height: '1px', background: 'rgb(40,40,40)'}`).full-width
          div(v-if="!pageId").row.full-width.q-pt-lg
            .row.full-width.justify-end
              small.text-grey-8.q-pb-xs.q-px-xs {{$t('похожие ядра')}}
            //small.text-grey.text-center.text-italic.q-px-xs "{{state.node.name.substring(0, 22)}}{{state.node.name.length>22 ? '...': ''}}"
            page-similar(v-if="!pageId" :node="state.node")
</template>

<script>

import { RxCollectionEnum } from 'src/system/rxdb'
import pageSimilar from './page_similar/index.vue'
import pageComments from './page_comments/index.vue'
import pageDescription from './page_description/index.vue'
import pageEssences from './page_essences/index.vue'
import pageEssence from './page_essence/index.vue'
import pageImage from './page_image/index.vue'

import { assert } from 'src/system/common/utils'
import cloneDeep from 'lodash/cloneDeep'

export default {
  name: 'pageApp_node2',
  components: {
    pageSimilar,
    pageComments,
    pageDescription,
    pageEssences,
    pageEssence,
    pageImage,
  },
  data () {
    return {
      state: {
        node: null,
        imagesNodesRes: null, // ядра с той же сутью(список образов)
        essencesNodesRes: null, // ядра с тем же образом(список сутей)
        imageActive: true // главный образ играется
      },
      itemEditorShow: false,
      pageId: null, // description|comments|essences
      bottomHeight: 0, // сколько места под образом
      imageMaxHeight: 0, // максимальная высота образа
    }
  },
  computed: {
    newNodeSameImage () {
      // this.$log('resetNewNode ')
      assert(this.state.node)
      let node = cloneDeep(this.state.node)
      node.name = ''
      node.description = ''
      // node.spheres = []
      return node
    },
    essencesNodes () {
      // this.$log('essencesNodes calc', this?.node?.oid, cloneDeep(this?.essencesNodesRes?.items))
      let res = []
      if (this.state.essencesNodesRes && this.state.node) {
        let itemsCopy = [...this.state.essencesNodesRes.items]
        let indx = itemsCopy.findIndex(item => item.oid === this.state.node.oid)
        if (indx >= 0) itemsCopy.splice(indx, 1, this.state.node) // this.state.node уже заполнено (чтобы не дергался плер (он уже начал его проигрывать, а потом загрузились imagesNodesRes))
        else itemsCopy.unshift(this.state.node) // почему-то в essencesNodesRes не оказалось нашего ядра...
        res = itemsCopy
      } else if (this.state.node) res = [this.state.node]
      return res
    },
    imagesNodes () {
      // this.$log('essencesNodes calc', this?.node?.oid, cloneDeep(this?.imagesNodesRes?.items))
      let res = []
      if (this.state.imagesNodesRes && this.state.node) {
        let itemsCopy = [...this.state.imagesNodesRes.items]
        let indx = itemsCopy.findIndex(item => item.oid === this.state.node.oid)
        if (indx >= 0) itemsCopy.splice(indx, 1, this.state.node) // ядро уже заполнено (чтобы не дергался плер (он уже начал его проигрывать, а потом загрузились imagesNodesRes))
        else itemsCopy.unshift(this.state.node) // почему-то в essencesNodesRes не оказалось нашего ядра...
        res = itemsCopy
      } else if (this.state.node) res = [this.state.node]
      return res
    },
    essenceRight () {
      if (this.state.essenceNodesIndx >= 0) return this.essencesNodes.slice(this.essenceNodesIndx + 1, this.essencesNodes.length)
      return []
    },
    essenceLeft () {
      if (this.state.essenceNodesIndx >= 0) return this.essencesNodes.slice(0, this.essenceNodesIndx)
      return []
    },
    essenceNodesIndx(){
      return this.essencesNodes.findIndex(item => item.oid === this.state?.node?.oid)
    },
    imagesNodesIndx(){
      return this.imagesNodes.findIndex(item => item.oid === this.state?.node?.oid)
    },
    compositionOid() {
      return this.state?.node?.items[0].oid || null
    },
    essenceOid(){
      return this.state?.node?.sphereFromName.oid
    }
  },
  watch: {
    '$route.params.oid': {
      immediate: true,
      async handler (to, from) {
        if (to && (!this.state.node || this.state.node.oid !== to)) {
          // this.$log('$route.params.oid TO', to)
          await this.setNode({oid: to})
        }
      }
    },
    compositionOid: { // изменилась композиция
      async handler (to, from) {
        // this.$log('compositionOid to=', to)
        this.state.essencesNodesRes = null
        if (to) {
          let itemsRes = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
              objectTypeEnum: { $in: ['NODE'] },
              oidSphere: to,
              sortStrategy: 'ESSENTIALLY' // 'ACTIVITY', // AGE
            },
            populateObjects: false
          })
          // за время выполнения запроса compositionOid могло поменяться (не делаем лишних присваиваний иначе currentIndx === -1 и суть промаргивает)
          if (this.compositionOid === to) this.state.essencesNodesRes = itemsRes
        }
      }
    },
    essenceOid: { // изменилась суть
      async handler (to, from) {
        // this.$log('essenceOid to=', to)
        this.state.imagesNodesRes = null
        if (to) {
          let itemsRes = await this.$rxdb.find({
            selector: {
              rxCollectionEnum: RxCollectionEnum.LST_SPHERE_ITEMS,
              objectTypeEnum: { $in: ['NODE'] },
              oidSphere: to,
              sortStrategy: 'ESSENTIALLY' // 'ACTIVITY', // AGE
            },
            populateObjects: false
          })
          // за время выполнения запроса essenceOid могло поменяться (не делаем лишних присваиваний иначе currentIndx === -1 и суть промаргивает)
          if (this.essenceOid === to) this.state.imagesNodesRes = itemsRes
        }
      }
    },
    'state.node.oid': {
      async handler(to, from) {
        this.pageId = null
        this.state.imageActive = true
        if (to && this.$route.params.oid !== to) await this.$router.replace({ params: { oid: to } })
      }
    }
  },
  methods: {
    async setNode(item){
      if (item && item.oid !== this.state?.node?.oid) {
        this.state.node = null
        this.state.node = await this.$rxdb.get(RxCollectionEnum.OBJ, item.oid)
      }
    }
  },
  async mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
