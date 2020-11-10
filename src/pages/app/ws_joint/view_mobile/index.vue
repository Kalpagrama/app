<template lang="pug">
q-layout(view="hHh Lpr lff")
  q-header().b-30
    .row.full-width.items-start.content-start.justify-center.q-pt-xs
      //- header
      //- .row.full-width.items-center.content-center.q-pa-sm
        q-btn(flat round color="grey-8" icon="keyboard_arrow_left" no-caps @click="$router.back()")
        .col
          .row.full-width.justify-center
            q-btn(no-caps color="green").q-px-md
              span.text-white Связать
            //- span(:style=`{fontSize: '18px'}`).text-white.text-bold Joint creator
            //- edit-name(v-if="joint" :node="joint")
        //- q-btn(round flat color="grey-8" icon="delete_outline" @click="$router.back()")
        q-btn(round flat color="grey-8" icon="more_vert")
      //- items
      div(
        :style=`{
          position: 'relative',
          minHeight: $q.screen.height/2+'px',
          //- height: $q.screen.height/2+'px',
        }`
        ).row.full-width.items-end.content-end.q-gutter-xs.q-pr-xs
        //- q-resize-observer(@resize="$event => itemMaxHeight = Math.max(itemMaxHeight, $event.height)")
        q-btn(
          @click="itemOpened = null"
          round flat color="green" icon="link" size="lg"
          :style=`{
            position: 'absolute', zIndex: 2000, bottom: '0px',
            left: 'calc(50% - 35px)'
          }`)
        div(
          v-for="(i,ii) in 2" :key="ii"
          :style=`{
            position: 'relative', zIndex: 10,
            maxWidth: itemOpened === null ? '50%' : itemOpened === ii ? '100%' : '60px',
            transform: ii === 0 ? 'perspective(1000px) rotateY(10deg)' : 'perspective(1000px) rotateY(-10deg)'
          }`
          ).col.full-height
          edit-item(
            v-if="joint.items[ii]"
            :item="joint.items[ii]" :isOpened="itemOpened === ii"
            @open="itemOpened = ii")
            //- div(
              v-if="itemFinding === null"
              :style=`{
                height: '40px',
              }`
              ).row.full-width
              div(v-if="itemOpened === ii").row.full-width
                q-btn(round flat dense icon="delete_outline" @click="itemDelete(ii)")
          q-btn(
            v-else
            @click="itemFinding === ii ? itemFinding = null : itemFinding = ii"
            flat color="green"
            :icon="itemFinding === ii ? 'clear' : 'add'"
            :style=`{
              //- height: '60px',
              background: 'rgb(35,35,35)',
              //- marginBottom: itemFinding === ii ? '0px' : '0px',
            }`).fit
      //- debug
      //- .row.full-width.bg-green
        small.text-white itemMaxHeight: {{itemMaxHeight}}
      div(v-if="itemFinding === null").row.full-width.q-mt-md
        edit-name(v-if="joint" :node="joint" placeholder="В чем связь?")
        div(:style=`{paddingLeft: '68px', paddingRight: '68px',}`).row.full-width.q-pt-xl
          q-btn(
            color="green" no-caps
            icon="link"
            :style=`{
              height: '50px',
            }`).full-width
            span.text-white.text-bold.q-ml-sm Связать
  q-page-container
    q-page(
      :style=`{
        paddingTop: '4px',
      }`
      ).row.full-width.items-start.content-start.q-px-xs
      q-page-sticky(
        expand
        position="bottom"
        :style=`{
          zIndex: 1000
        }`).b-30
        div(
          :style=`{}`).row.full-width.justify-center
          .row.full-width.q-py-sm
            q-btn(round flat dense color="grey-8" icon="keyboard_arrow_left" @click="$router.back()" no-caps).q-mx-md Назад
            .col
      kalpa-finder(
        v-if="itemFinding !== null"
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
      itemOpened: null,
      itemFinding: null,
      itemMaxHeight: 0
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
