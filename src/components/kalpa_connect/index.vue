<template lang="pug">
.column.fit
  //- header
  .row.full-width.justify-center.q-px-sm
    div(
      :style=`{
        maxWidth: '600px',
      }`
      ).row.full-width.items-center.content-center.justify-center.q-pb-md
      div(
        :style=`{
          height: '60px',
        }`
        ).row.full-width.items-center.content-center
        span(:style=`{fontSize: '18px',}`).text-white.text-bold.q-ml-sm Связать ядро
        .col
        q-btn(round flat color="white" icon="clear" @click="$emit('close')")
      slot
  //- body
  .col.full-width.scroll
    div(
      v-if="!itemFinderOpened && !item"
      ).row.full-width.items-start.content-start.justify-center
      q-btn(
        @click="itemFinderOpened = true"
        flat color="green" icon="add" size="lg"
        :style=`{
          height: '200px',
          maxWidth: '600px',
        }`
        ).full-width.b-40
    view-find(
      v-if="itemFinderOpened"
      @item="itemFound" @close="itemFinderOpened = false")
    div(
      v-if="!itemFinderOpened"
      ).row.full-width.justify-center.q-pa-sm
      //- item
      .row.full-width.justify-center
        //- .row.full-width.q-pa-sm
          span(:style=`{fontSize: '18px',}`).text-white.text-bold с ядром
        item-player(
          v-if="item"
          :item="item"
          :style=`{
            maxWidth: '600px',
          }`)
          div(
            :style=`{
              position: 'absolute', zIndex: 1000, right: 0, width: '44px',
              borderRadius: '10px', overflow: 'hidden',
              background: 'rgba(35,35,35,0.5)',
            }`
            ).row.full-height.items-start.content-start
            q-btn(round flat icon="delete_outline" color="red" @click="item = null").full-width
            q-btn(round flat icon="edit" color="white").full-width
      //- name
      .row.full-width.justify-center.q-py-sm
        div(:style=`{maxWidth: '600px',}`).row.full-width
          q-btn(
            v-if="type"
            @click="type = null"
            flat color="white" no-caps icon-right="clear"
            align="between"
            :style=`{
              height: '60px'
            }`
            ).full-width.b-40
            span.text-white.text-bold {{ type.name }}
          div(
            v-else
            ref="nameInput"
            :style=`{
              position: 'relative', zIndex: 200,
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).row.full-width
            q-input(
              v-if="!type"
              v-model="name"
              filled dark color="green"
              type="textarea" autogrow
              placeholder="How are they connected?"
              :input-style=`{
                //- minHeight: '60px'
              }`
              ).full-width
              template(v-slot:append)
                q-btn(
                  @click="typesShow = !typesShow"
                  round flat color="white" icon="keyboard_arrow_down"
                  :style=`{position: 'relative'}`)
                  q-popup-proxy(
                    v-model="typesShow" :target="$refs.nameInput" fit dark no-parent-event
                    position="bottom")
                    div(
                      :style=`{
                        maxWidth: '100px', minWidth: '100%',
                        borderRadius: '10px 10px 0 0', overflow: 'hidden',
                        background: 'rgb(35,35,35)',
                      }`).row.items-start.content-start
                      div().row.full-width.items-center.content-center.justify-center.q-pa-md
                        span(:style=`{fontSize: '18px',}`).text-white.text-bold Pick a predefined reason
                      q-btn(
                        v-for="t in types" :key="t.id"
                        @click="type = t"
                        flat color="grey-6" no-caps
                        :style=`{height: '46px'}`
                        ).full-width
                        span.text-white {{ t.name }}
      //- footer: connect action
      .row.full-width.justify-center
        div(:style=`{maxWidth: '600px',}`).row.full-width.q-py-sm
          q-btn(
            @click="connect"
            color="green" no-caps icon="link"
            :loading="loading"
            :style=`{
              height: '50px',
            }`
            ).full-width
            span.text-white.text-bold.q-ml-sm Связать
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { ContentApi } from 'src/api/content'
import { ObjectCreateApi } from 'src/api/object_create'

export default {
  name: 'kalpaConnect',
  props: ['oid'],
  components: {
    viewFind: () => import('./view_find/index.vue'),
    itemPlayer: () => import('./item_player/index.vue'),
    // itemEditor: () => import('./item_editor/index.vue')
  },
  data () {
    return {
      name: '',
      item: null,
      itemFinderOpened: false,
      type: null,
      typesShow: false,
      loading: false,
    }
  },
  computed: {
    types () {
      return [
        // {id: 'ESSENCE', name: 'По сути', pair: 'ESSENCE', origin: 'ESSENCE'},
        // {id: 'ASSOCIATIVE', name: 'Ассоциация', pair: 'ASSOCIATIVE', origin: 'ASSOCIATIVE'},
        {id: 'CAUSE', name: 'Причина', pair: 'EFFECT', origin: 'CAUSE_EFFECT', swap: true},
        {id: 'EFFECT', name: 'Следствие', pair: 'CAUSE', origin: 'CAUSE_EFFECT', swap: false},
        {id: 'PROBLEM', name: 'Проблема', pair: 'SOLUTION', origin: 'PROBLEM_SOLUTION', swap: true},
        {id: 'SOLUTION', name: 'Решение', pair: 'PROBLEM', origin: 'PROBLEM_SOLUTION', swap: false},
        {id: 'TRUE', name: 'Опровержение', pair: 'FALSE', origin: 'FALSE_TRUE', swap: true},
        {id: 'FALSE', name: 'Фэйк', pair: 'TRUE', origin: 'FALSE_TRUE', swap: false},
        {id: 'FROM', name: 'До', pair: 'TO', origin: 'FROM_TO', swap: true},
        {id: 'TO', name: 'После', pair: 'FROM', origin: 'FROM_TO', swap: false},
      ]
    }
  },
  methods: {
    async itemFound (item) {
      this.$log('itemFound', item)
      this.item = item
      this.itemFinderOpened = false
    },
    async connect () {
      try {
        this.$log('connect start')
        this.loading = true
        await this.$wait(500)
        if (this.item && this.item.oid === null) {
          this.item = await await ContentApi.contentCreateFromUrl(this.item.thumbUrl)
        }
        if (!this.item.oid) throw new Error('No item.oid!')
        let jointInput = {
          swap: false,
          jointType: 'ASSOCIATIVE',
          leftItem: {oid: this.oid},
          rightItem: {oid: this.item.oid},
        }
        if (this.name.length > 0) {
          jointInput.name = this.name
          jointInput.jointType = 'ESSENCE'
        }
        if (this.type) {
          jointInput.jointType = this.type.origin
          // make a swap
          if (this.type.swap) {
            let t = jointInput.leftItem
            jointInput.leftItem = jointInput.rightItem
            jointInput.rightItem = t
            jointInput.swap = true
          }
        }
        this.$log('jointInput', jointInput)
        let joint = await ObjectCreateApi.jointCreate(jointInput)
        this.$log('connect done')
        this.loading = false
        this.$emit('close')
      }
      catch (e) {
        this.$log('connect error', e)
        this.loading = false
      }
    }
  },
  mounted () {
    this.$log('mounted')
  },
  beforeDestroy () {
    this.$log('beforeDestroy')
  }
}
</script>
