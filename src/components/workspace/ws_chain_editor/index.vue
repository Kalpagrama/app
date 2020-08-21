<template lang="pug">
q-layout(view="hHh Lpr lff" :style=`{height: $q.screen.height+'px'}`).b-30
  //- item finder
  q-dialog(v-model="itemFinderOpened" position="bottom")
    item-finder(
      @item="itemFound"
      @close="itemFinderOpened = false"
      )
  q-header(reveal)
    .row.full-width.items-center.content-center.q-pt-md.q-pb-sm.q-px-md.b-30
      .col
        span(:style=`{fontSize: '19px',}`).text-white.text-bold Chain editor
      q-btn(round flat dense color="white" icon="more_vert")
  q-footer(:style=`{}`)
    div(:style=`{position: 'relative', height: '50px',}`).row.full-width.items-center.content-center.b-30
      q-btn(round flat dense color="white" icon="keyboard_arrow_left" @click="$emit('close')").q-ml-sm
      .col.full-height
        q-tabs(v-model="tab" dense no-caps active-color="white").fit.text-white
          q-tab(name="editor" label="Editor")
          q-tab(name="preview" label="Preview")
  q-page
    q-page-container
      q-tab-panels(
        v-model="tab" swipeable animated
        :style=`{padding: 0, margin: 0, background: 'none'}`).fit
        q-tab-panel(name="editor" :style=`{padding: 0, margin: 0, background: 'none'}`).fit
          //- header: title
          .row.full-width.q-pa-sm
            div(:style=`{zIndex: 100, transform: 'translate3d(0,0,0)', borderRadius: '10px', overflow: 'hidden'}`).row.full-width
              q-input(
                v-model="value.name"
                filled dense dark color="white" type="textarea" autogrow
                placeholder="Заголовок"
                :input-style=`{
                  minHeight: '80px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                }`
                ).full-width.text-bold
          //- items
          .row.full-width.items-start.content-start.q-px-sm
            //- items
            div(
              v-for="(i,ii) in value.items" :key="ii"
              :style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.q-mb-md.b-40
              div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start.b-50
                img(:src="i.thumbUrl || i.thumbOid" :style=`{borderRadius: '10px', overflow: 'hidden',}`).full-width
                div(@click="itemNameClick(i,ii)").row.full-width.q-pa-sm
                  span.text-white {{ i.name }}
              //- edit
              //- div(:style=`{height: '120px',}`).row.full-width.b-40
                .col
                div(:style=`{width: '50px',}`).row.full-height
                  .row.full-width.justify-center
                    q-btn(round flat dense color="white" icon="keyboard_arrow_up")
                  .row.full-width.justify-center
                    q-btn(round flat dense color="white" icon="more_vert")
                  .row.full-width.justify-center
                    q-btn(round flat dense color="white" icon="keyboard_arrow_down")
              //- preview
              div(:style=`{opacity: 0.8}`).row.full-width.items-center.content-center.q-pa-sm
                q-btn(
                  round dense color="grey-8" icon="vote"
                  :style=`{borderRadius: '50%'}`)
                span.text-white.q-ml-sm Ivan Moto
                .col
                q-btn(
                  round dense color="green-5" icon="vote"
                  :style=`{borderRadius: '50%'}`)
            //- item add
            div(:style=`{marginBottom: '200px',}`).row.full-width
              q-btn(
                @click="itemAdd()"
                flat color="green" icon="add" size="lg"
                :style=`{height: '150px',}`
                ).full-width.b-50
        q-tab-panel(name="preview" :style=`{padding: 0, margin: 0, background: 'none'}`).fit
          div(:style=`{minHeight: $q.screen.height+'px',}`).row.fit.items-start.content-start.q-pa-sm
            div(
              v-if="value.items.length > 0"
              :style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width.items-start.content-start.b-50
              div(:style=`{position: 'relative', borderRadius: '10px', overflow: 'hidden'}`).row.full-width
                img(:src="value.items[0].thumbUrl || value.items[0].thumbOid" :style=`{borderRadius: '10px', overflow: 'hidden',}`).full-width
                span(:style=`{position: 'absolute',zIndex: 100, bottom: '0px', borderRadius: '10px', overflow: 'hidden',
                  background: 'rgba(0,0,0,0.5)'}`).text-grey-2.q-pa-sm {{ itemName }}
              div(@click="nodeOpened = true").row.full-width.q-pa-sm
                span(:style=`{fontSize: '18px'}`).text-white.text-bold {{ value.name }}
</template>

<script>
import itemFinder from './item_finder.vue'

export default {
  name: 'wsChainEditor',
  components: {itemFinder},
  props: ['value'],
  data () {
    return {
      tab: 'editor',
      itemFinderOpened: false,
      nodeOpened: false,
    }
  },
  computed: {
    itemName () {
      return this.value.items[0].name.slice(0, 50)
    }
  },
  methods: {
    itemAdd () {
      this.$log('itemAdd')
      this.itemFinderOpened = true
    },
    itemFound (item) {
      this.$log('itemFound', item)
      // this.value.items.push({})
      this.$set(this.value.items, this.value.items.length, item)
    },
    itemNameClick (item, itemIndex) {
      this.$log('itemNameClick', item, itemIndex)
      let ipsum = `Lorem ${itemIndex} Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`
      this.$set(this.value.items[itemIndex], 'name', ipsum)
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
