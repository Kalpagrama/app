<template lang="pug">
.row.full-width.justify-center.q-pa-md
  //- item finder
  q-dialog(v-model="itemFinderOpened" position="bottom" maximized)
    div(
      @click.self="itemFinderOpened = false"
      :style=`{height: $q.screen.height+'px',}`).row.full-width.justify-center.b-30
      div(:style=`{maxWidth: $store.state.ui.pageMaxWidth+'px'}`).row.full-width.items-start.content-start
        .row.full-width.items-center.content-center.q-pa-sm
          q-btn(round flat color="white" icon="keyboard_arrow_left" @click="itemFinderOpened = false")
          span(:style=`{fontSize: '1rem'}`).text-white.text-bold Find item
        view-find(@item="itemFound" @close="itemFinderOpened = false")
  //- TODO: item editor...
  //- body
  div(
    :style=`{
      maxWidth: '500px',
    }`
    ).row.full-width
    //- itemFinder
    div(
      v-if="!item"
      ).row.full-width
      q-btn(
        @click="itemFinderOpened = true"
        flat icon="add" color="green" size="lg"
        :style=`{
          height: '120px'
        }`
        ).full-width.b-40
    //- itemPlayer
    item-player(v-if="item" :item="item")
      div(
        :style=`{
          position: 'absolute', zIndex: 1000, right: 0, width: '44px',
          borderRadius: '10px', overflow: 'hidden',
          background: 'rgba(35,35,35,0.5)',
        }`
        ).row.full-height.items-start.content-start
        q-btn(round flat icon="delete_outline" color="red" @click="item = null").full-width
        q-btn(round flat icon="edit" color="white").full-width
    //- div(
      v-if="item"
      :style=`{}`
      ).row.full-width.br
      small.text-white {{ item }}
    //- itemEditor...?
    //- name or reason
    .row.full-width.q-py-sm
      q-btn(
        v-if="type"
        @click="type = null"
        flat color="white" no-caps icon-right="clear"
        align="between"
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
          filled dark dense color="green"
          type="textarea" autogrow
          placeholder="How are they connected?"
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
    //- footer: link action
    .row.full-width
      q-btn(
        @click="link"
        color="green" no-caps icon="link"
        :loading="loading"
        :style=`{
          height: '50px',
        }`
        ).full-width Связать
</template>

<script>
import { RxCollectionEnum } from 'src/system/rxdb'
import { NodeApi } from 'src/api/node'

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
        {id: 'CAUSE', name: 'Причина', pair: 'EFFECT', origin: 'CAUSE_EFFECT'},
        {id: 'EFFECT', name: 'Следствие', pair: 'CAUSE', origin: 'CAUSE_EFFECT'},
        {id: 'PROBLEM', name: 'Проблема', pair: 'SOLUTION', origin: 'PROBLEM_SOLUTION'},
        {id: 'SOLUTION', name: 'Решение', pair: 'PROBLEM', origin: 'PROBLEM_SOLUTION'},
        {id: 'TRUE', name: 'Опровержение', pair: 'FALSE', origin: 'FALSE_TRUE'},
        {id: 'FALSE', name: 'Фэйк', pair: 'TRUE', origin: 'FALSE_TRUE'},
        {id: 'FROM', name: 'До', pair: 'TO', origin: 'FROM_TO'},
        {id: 'TO', name: 'После', pair: 'FROM', origin: 'FROM_TO'},
      ]
    }
  },
  methods: {
    async itemFound (item) {
      this.$log('itemFound', item)
      this.item = item
      this.itemFinderOpened = false
    },
    async link () {
      try {
        this.$log('link start')
        this.loading = true
        await this.$wait(500)
        if (!this.item.oid) throw new Error('No item.oid!')
        let jointInput = {
          jointType: 'ASSOCIATIVE',
          leftItem: {oid: this.oid},
          rightItem: {oid: this.item.oid}
        }
        let joint = await NodeApi.jointCreate(jointInput)
        this.$log('link done')
        this.loading = false
      }
      catch (e) {
        this.$log('link error', e)
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
