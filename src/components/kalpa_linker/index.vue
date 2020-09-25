<template lang="pug">
.row.full-width.justify-center
  div(
    :style=`{
      maxWidth: '800px',
      height: $q.screen.height+'px'
    }`).column.full-width.b-30.q-pb-sm
    .row.full-width.justify-between.q-pt-sm
      div(
        :style=`{
          transform: 'rotate(2deg)',
        }`
        ).row.items-center.content-center
        q-btn(round flat color="grey-6" icon="keyboard_arrow_left")
        span(
          :style=`{
            fontSize: '20px',
          }`).text-bold.text-white Make a joint
      div(
        :style=`{
          transform: 'rotate(-2deg)',
        }`
        ).row.items-center.content-center
        q-btn(round flat color="grey-6" icon="more_vert")
    .row.full-width.q-py-md
      div(:style=`{height: '340px',}`).row.full-width
        //- left item
        div(
          :style=`{
            transform: 'perspective(1000px) rotateY(20deg)',
            borderRadius: '10px', overflow: 'hidden',
          }`).col.full-height
          div(
            :style=`{
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).column.fit
            div(:style=`{height: '40px'}`).row.full-width.items-center.content-center
              q-btn(
                v-if="leftItem"
                flat dense color="grey-6" no-caps)
                q-icon(name="keyboard_arrow_down" color="green")
                span.text-white.text-bold {{ itemTypes.find(i => i.id === leftItem.jointType).name }}
                q-menu(dark)
                  div(:style=`{width: '100px'}`).row
                    q-btn(
                      @click="leftItem.jointType = t.id"
                      v-for="(t,ti) in itemTypes" :key="t.id"
                      v-if="t.id !== leftItem.jointType"
                      flat dense no-caps color='grey-2').full-width {{ t.name }}
            div(
              :style=`{
                borderRadius: '10px', overflow: 'hidden',
              }`
              ).col.full-width.b-40.shadow-4
              div(v-if="leftItem").column.fit
                div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).col.full-width
                  img(
                    @click="leftItemCover = !leftItemCover"
                    :src="leftItem.url" draggable="false"
                    :style=`{
                      objectFit: leftItemCover ? 'cover' : 'contain',
                    }`
                    ).fit
                div(v-if="leftItem.name").row.full-width.justify-center.q-pa-sm
                  small.text-white {{ leftItem.name }}
        //- divider with link icon
        .row.full-height.items-center.content-center.justify-center
          q-icon(name="link" color="green" size="24px")
        //- right item
        div(
          :style=`{
            transform: 'perspective(1000px) rotateY(-20deg)',
            borderRadius: '10px', overflow: 'hidden',
          }`).col.full-height
          div(
            :style=`{
              borderRadius: '10px', overflow: 'hidden',
            }`
            ).column.fit
            div(:style=`{height: '40px'}`).row.full-width.items-center.content-center.justify-end
              q-btn(
                v-if="rightItem"
                flat dense color="grey-6" no-caps)
                span.text-white.text-bold {{ itemTypes.find(i => i.id === rightItem.jointType).name }}
                q-icon(name="keyboard_arrow_down" color="green")
                q-menu(dark)
                  div(:style=`{width: '100px'}`).row
                    q-btn(
                      @click="rightItem.jointType = t.id"
                      v-for="(t,ti) in itemTypes" :key="t.id"
                      v-if="t.id !== rightItem.jointType"
                      flat dense no-caps color='grey-2').full-width {{ t.name }}
            div(
              :style=`{
                borderRadius: '10px', overflow: 'hidden',
              }`
              ).col.full-width.b-40.shadow-4
              div(v-if="rightItem").column.fit
                div(:style=`{borderRadius: '10px', overflow: 'hidden'}`).col.full-width
                  img(
                    @click="rightItemCover = !rightItemCover"
                    :src="rightItem.url" draggable="false"
                    :style=`{
                      objectFit: rightItemCover ? 'cover' : 'contain',
                    }`
                    ).fit
                div(v-if="rightItem.name").row.full-width.justify-center.q-pa-sm
                  small.text-white {{ rightItem.name }}
    edit-name(@name="name = $event" :name="name").q-mb-md
    .row.full-width
      q-tabs(
        v-model="viewId"
        dense active-color="white" no-caps
        ).full-width.text-grey-6
        q-tab(v-for="v in views" :key="v.id" :name="v.id" :label="v.name")
    div(
      :style=`{
        borderRadius: '10px', overflow: 'hidden',
        background: 'rgb(35,35,35)',
      }`
      ).col.full-width
      //- .row.full-width.items-start.content-start
      from-nodes(v-if="viewId === 'nodes'")
      div(v-if="viewId === 'gif'").column.fit
        .row.full-width.q-pa-sm
          div(:style=`{position: 'relative', zIndex: 200, borderRadius: '10px', overflow: 'hidden'}`).row.full-width
            q-input(
              v-model="tenorSearch"
              filled dark dense color='grey-7'
              placeholder="Search GIF"
              :debounce="600"
              ).full-width
        .col.full-width.scroll
          .row.full-width.items-start.content-start
            masonry(
              :cols="6"
              :gutter="{default: 8}").full-width
              div(
                v-for="(g,gi) in gifs" :key="g.id"
                :style=`{
                  position: 'relative',
                  borderRadius: '10px', overflow: 'hidden',
                }`
                ).row.full-width.q-mb-sm
                //- left/right panels
                div(
                  :style=`{
                    position: 'absolute', zIndex: 100,
                  }`
                  ).row.fit
                  div(
                    @click="gifClick(g, true)"
                    @mouseenter="gifOver = [g.id, true]"
                    @mouseleave="gifOver = null"
                    v-ripple=`{color: 'white'}`
                    :style=`{
                      position: 'relative'
                    }`
                    ).col.full-height.cursor-pointer
                    div(
                      v-if="gifOver && gifOver[0] === g.id && gifOver[1] === true"
                      :style=`{
                        background: 'rgba(0,0,0,0.3)'
                      }`
                      ).row.fit.items-center.conten-center.justify-center
                      q-icon(name="keyboard_arrow_left" size="50px" color="green")
                  div(
                    @click="gifClick(g, false)"
                    @mouseenter="gifOver = [g.id, false]"
                    @mouseleave="gifOver = null"
                    v-ripple=`{color: 'white'}`
                    :style=`{
                      position: 'relative',
                    }`
                    ).col.full-height.cursor-pointer
                    div(
                      v-if="gifOver && gifOver[0] === g.id && gifOver[1] === false"
                      :style=`{
                        background: 'rgba(0,0,0,0.3)'
                      }`
                      ).row.fit.items-center.conten-center.justify-center
                      q-icon(name="keyboard_arrow_right" size="50px" color="green")
                //- img
                img(
                  :src="g.media[0]['tinygif']['url']"
                  draggable="false"
                  :style=`{
                    pointerEvents: 'none',
                  }`
                  ).full-width
</template>

<script>
export default {
  name: 'kalpaLinker',
  components: {
    editName: () => import('./edit_name.vue'),
    fromNodes: () => import('./from_nodes.vue')
  },
  data () {
    return {
      name: '',
      viewId: 'gif',
      views: [
        {id: 'nodes', name: 'Nodes'},
        {id: 'video', name: 'Videos'},
        {id: 'image', name: 'Images'},
        {id: 'books', name: 'Books'},
        {id: 'audio', name: 'Music'},
        {id: 'speher', name: 'Spheres'},
        {id: 'bookmarks', name: 'Bookmarks'},
        {id: 'gif', name: 'GIFs'},
      ],
      tenorSearch: '',
      tenorUrl: 'https://api.tenor.com/v1',
      tenorKey: 'EVS1EYKI5ZRC',
      gifs: [],
      gifOver: null,
      leftItem: null,
      leftItemCover: true,
      rightItem: null,
      rightItemCover: true,
    }
  },
  computed: {
    tenorUrlSearch () {
      return `${this.tenorUrl}/search?key=${this.tenorKey}&q=${this.tenorSearch}&limit=50`
    },
    tenorUrlTrending () {
      return `${this.tenorUrl}/trending?key=${this.tenorKey}&limit=50`
    },
    itemTypes () {
      return [
        {id: 'CAUSE', name: 'Причина', pair: 'EFFECT'},
        {id: 'EFFECT', name: 'Следствие', pair: 'CAUSE'},
        {id: 'PROBLEM', name: 'Проблема', pair: 'SOLUTION'},
        {id: 'SOLUTION', name: 'Решение', pair: 'PROBLEM'},
        {id: 'TRUE', name: 'Правда', pair: 'FALSE'},
        {id: 'FALSE', name: 'Ложь', pair: 'TRUE'},
        {id: 'FROM', name: 'Первое', pair: 'TO'},
        {id: 'TO', name: 'Второе', pair: 'FROM'},
      ]
    },
  },
  watch: {
    leftItem: {
      deep: true,
      handler (to, from) {
        this.$log('leftItem TO', to)
        if (to) {
          if (this.rightItem) {
            let t = this.itemTypes.find(i => i.id === to.jointType).pair
            this.$log('leftItem EFFECT rightItem with:', t)
            this.rightItem.jointType = t
          }
        }
      }
    },
    rightItem: {
      deep: true,
      handler (to, from) {
        this.$log('rightItem TO', to)
        if (to) {
          if (this.leftItem) {
            let t = this.itemTypes.find(i => i.id === to.jointType).pair
            this.$log('rightItem EFFECT leftItem with: ', t)
            this.leftItem.jointType = t
          }
        }
      }
    },
    tenorSearch: {
      async handler (to, from) {
        console.log('tenorSearch TO', to)
        let {data} = await this.$axios.get(this.tenorUrlSearch)
        this.gifs = data.results
        console.log('data', data)
      }
    }
  },
  methods: {
    gifClick (gif, isLeft) {
      console.log('gifClick', gif)
      let itemInput = {
        type: 'EMOJI',
        url: gif.media[0].tinygif.url,
        name: gif.title,
        jointType: 'SOLUTION',
      }
      if (isLeft === true) {
        if (this.rightItem) itemInput.jointType = this.itemTypes.find(i => i.id === this.rightItem.jointType).pair
        this.leftItem = itemInput
      }
      if (isLeft === false) {
        if (this.leftItem) itemInput.jointType = this.itemTypes.find(i => i.id === this.leftItem.jointType).pair
        this.rightItem = itemInput
      }
    }
  },
  async mounted () {
    console.log('mounted')
    // load initial trending gifs
    let {data} = await this.$axios.get(this.tenorUrlTrending)
    this.gifs = data.results
  }
}
</script>
