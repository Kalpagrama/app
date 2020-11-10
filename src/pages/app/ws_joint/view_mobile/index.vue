<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header().b-30
    .row.full-width.items-start.content-start.justify-center
      //- header
      .row.full-width.items-center.content-center.q-pa-sm
        q-btn(flat round color="grey-8" icon="keyboard_arrow_left" no-caps @click="$router.back()")
        .col
          .row.full-width.justify-center
            q-btn(no-caps color="green").q-px-md
              span.text-white Связать
            //- span(:style=`{fontSize: '18px'}`).text-white.text-bold Joint creator
            //- edit-name(v-if="joint" :node="joint")
        //- q-btn(round flat color="grey-8" icon="delete_outline" @click="$router.back()")
        q-btn(round flat color="grey-8" icon="more_vert")
      .row.full-width
        edit-name(v-if="joint" :node="joint").br
      //- items
      .row.full-width.items-start.content-start.q-pt-xs.q-gutter-xs.q-pr-xs.br
        div(
          v-for="(i,ii) in 2" :key="ii"
          :style=`{
            maxWidth: itemOpened === ii ? '100%' : '60px',
          }`
          ).col
          edit-item(
            v-if="joint.items[ii]"
            :item="joint.items[ii]" :isOpened="itemOpened === ii"
            @open="itemOpened = ii")
            div(
              v-if="itemFinding === null"
              :style=`{
                height: '40px',
              }`
              ).row.full-width
              div(v-if="itemOpened === ii").row.full-width
                q-btn(round flat dense icon="delete_outline" @click="itemDelete(ii)")
          div(v-else).column.fit
            q-btn(
              @click="itemFinding === ii ? itemFinding = null : itemFinding = ii"
              flat color="green"
              :icon="itemFinding === ii ? 'clear' : 'add'"
              :style=`{
                background: 'rgb(35,35,35)',
              }`).col.full-width
            div(
              v-if="itemFinding === null"
              :style=`{
                height: '40px',
              }`
              ).row.full-width
  q-page-container
    q-page(
      v-if="itemFinding !== null"
      :style=`{
        paddingTop: '8px',
        //- background: 'rgb(35,35,35)',
      }`
      ).row.full-width.items-start.content-start.q-px-xs
      kalpa-finder(
        @item="itemFound"
        :style=`{
          background: 'rgb(35,35,35)',
          borderRadius: '10px',
        }`)
</template>

<script>
export default {
  name: 'wsJoint_viewMobile',
  props: ['joint'],
  components: {
    editName: () => import('components/node_editor/view_publish/edit_name.vue'),
    editItem: () => import('../edit_item/index.vue'),
  },
  data () {
    return {
      itemOpened: 0,
      itemFinding: null,
    }
  },
  methods: {
    itemFound (item) {
      this.$log('itemFound', item)
      this.joint.items[this.itemFinding] = item
      this.itemOpened = this.itemFinding
      this.itemFinding = null
    },
    itemDelete (itemIndex) {
      this.$log('itemDelete', itemIndex)
      this.$set(this.joint.items, itemIndex, null)
      this.itemOpened = itemIndex === 0 ? 1 : 0
    }
  }
}
</script>
