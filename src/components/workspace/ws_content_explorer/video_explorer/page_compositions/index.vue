<template lang="pug">
.row.fit
  .col.full-height
    .column.fit
      .col.full-width.scroll
        kalpa-loader(:mangoQuery="mangoQuery")
          template(v-slot=`{items}`)
            .row.full-width.items-start.content-start.q-py-sm
              composition-item(
                v-for="(i,ii) in items" :key="i.id"
                @edit="compositionEdit(i)"
                @delete="compositionDelete(i)"
                :composition="i" :compositionIndex="ii").q-mb-sm
              //- div(
              //-   v-for="(i,ii) in items" :key="i.id"
              //-   @click="composition = i"
              //-   :style=`{height: '50px', borderRadius: $store.state.ui.borderRadius+'px', overflow: 'hidden'}`
              //-   ).row.full-width.items-center.content-center.q-mb-sm.q-px-md.b-60
              //-   span.text-white {{i.name}}
  div(v-if="composition").col.full-height
    .row.fit.q-pa-sm
      ws-composition-editor(
        v-if="composition"
        :value="composition"
        :sidPlayer="sidPlayer"
        @close="composition = null").full-height.b-60
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import compositionItem from './composition_item'

export default {
  name: 'pageCompositions',
  components: {compositionItem},
  props: ['content'],
  inject: ['sidPlayer'],
  data () {
    return {
      composition: null,
    }
  },
  computed: {
    mangoQuery () {
      let res = {selector: {rxCollectionEnum: RxCollectionEnum.WS_CONTENT}}
      // // name
      // if (this.searchString.length > 0) {
      //   let nameRegExp = new RegExp(this.searchString, 'i')
      //   res.selector.name = {$regex: nameRegExp}
      // }
      res.selector.contentType = 'COMPOSITION'
      res.selector.contentOid = this.content.oid
      // sort
      res.sort = [{updatedAt: 'desc'}]
      return res
    }
  },
  methods: {
    compositionEdit (c) {
      this.$log('compositionEdit', c)
      this.composition = null
      this.$nextTick(() => {
        this.composition = c
      })
    },
    async compositionDelete (c) {
      this.$log('compositionDelete', c)
    },
  }
}
</script>
